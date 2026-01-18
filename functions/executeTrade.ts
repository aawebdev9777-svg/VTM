import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, stock, shares } = await req.json();
    const totalAmount = shares * stock.price_gbp;

    // Get user's account
    const allAccounts = await base44.asServiceRole.entities.UserAccount.list();
    const account = allAccounts.find(acc => acc.created_by === user.email);

    if (!account) {
      return Response.json({ error: 'User account not found' }, { status: 404 });
    }

    if (type === 'buy') {
      if (account.cash_balance < totalAmount) {
        return Response.json({ error: 'Insufficient funds' }, { status: 400 });
      }

      // Update cash balance
      await base44.asServiceRole.entities.UserAccount.update(account.id, {
        cash_balance: account.cash_balance - totalAmount
      });

      // Get user's portfolio
      const allPortfolio = await base44.asServiceRole.entities.Portfolio.list();
      const existingHolding = allPortfolio.find(p => p.symbol === stock.symbol && p.created_by === user.email);

      if (existingHolding) {
        const newTotalShares = existingHolding.shares + shares;
        const newAvgPrice = (
          (existingHolding.shares * existingHolding.average_buy_price) + totalAmount
        ) / newTotalShares;

        await base44.asServiceRole.entities.Portfolio.update(existingHolding.id, {
          shares: newTotalShares,
          average_buy_price: newAvgPrice
        });
      } else {
        await base44.entities.Portfolio.create({
          symbol: stock.symbol,
          company_name: stock.company_name,
          shares: shares,
          average_buy_price: stock.price_gbp
        });
      }
    } else if (type === 'sell') {
      const allPortfolio = await base44.asServiceRole.entities.Portfolio.list();
      const existingHolding = allPortfolio.find(p => p.symbol === stock.symbol && p.created_by === user.email);

      if (!existingHolding || existingHolding.shares < shares) {
        return Response.json({ error: 'Insufficient shares' }, { status: 400 });
      }

      // Update cash balance
      await base44.asServiceRole.entities.UserAccount.update(account.id, {
        cash_balance: account.cash_balance + totalAmount
      });

      if (existingHolding.shares === shares) {
        await base44.asServiceRole.entities.Portfolio.delete(existingHolding.id);
      } else {
        await base44.asServiceRole.entities.Portfolio.update(existingHolding.id, {
          shares: existingHolding.shares - shares
        });
      }
    }

    // Get updated account for history
    const updatedAccount = await base44.asServiceRole.entities.UserAccount.list();
    const updatedUserAccount = updatedAccount.find(acc => acc.id === account.id);

    // Create transaction record using user's auth (not service role)
    const transaction = await base44.entities.Transaction.create({
      symbol: stock.symbol,
      company_name: stock.company_name,
      type: type,
      shares: shares,
      price_per_share: stock.price_gbp,
      total_amount: totalAmount
    });

    // Get updated portfolio to calculate total value
    const updatedPortfolio = await base44.asServiceRole.entities.Portfolio.list();
    const userPortfolio = updatedPortfolio.filter(p => p.created_by === user.email);
    const stockPrices = await base44.asServiceRole.entities.StockPrice.list();
    
    let portfolioValue = 0;
    userPortfolio.forEach(holding => {
      const stockPrice = stockPrices.find(sp => sp.symbol === holding.symbol);
      const price = stockPrice ? stockPrice.price_gbp : holding.average_buy_price;
      portfolioValue += holding.shares * price;
    });

    // Create portfolio history record
    await base44.asServiceRole.entities.PortfolioHistory.create({
      symbol: stock.symbol,
      company_name: stock.company_name,
      action: type,
      shares: shares,
      price_per_share: stock.price_gbp,
      total_amount: totalAmount,
      cash_balance_after: updatedUserAccount?.cash_balance || 0,
      portfolio_value_after: portfolioValue
    });

    return Response.json({ success: true, transaction });
  } catch (error) {
    console.error('Trade error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});