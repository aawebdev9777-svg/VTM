import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stock, shares } = await req.json();
    const totalAmount = shares * stock.price_gbp;

    // Get user's account
    const accounts = await base44.asServiceRole.entities.UserAccount.list();
    const account = accounts.find(acc => acc.created_by === user.email);

    if (!account) {
      return Response.json({ error: 'User account not found' }, { status: 404 });
    }

    if (account.cash_balance < totalAmount) {
      return Response.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Deduct cash balance
    await base44.asServiceRole.entities.UserAccount.update(account.id, {
      cash_balance: account.cash_balance - totalAmount
    });

    // Check if holding exists for this user
    const userPortfolio = await base44.entities.Portfolio.filter({ created_by: user.email });
    const existingHolding = userPortfolio.find(p => p.symbol === stock.symbol);

    let portfolioRecord;
    if (existingHolding) {
      // Update existing holding
      const newTotalShares = existingHolding.shares + shares;
      const newAvgPrice = (
        (existingHolding.shares * existingHolding.average_buy_price) + totalAmount
      ) / newTotalShares;

      portfolioRecord = await base44.entities.Portfolio.update(existingHolding.id, {
        shares: newTotalShares,
        average_buy_price: newAvgPrice
      });
    } else {
      // Create new holding (created_by set automatically)
      portfolioRecord = await base44.entities.Portfolio.create({
        symbol: stock.symbol,
        company_name: stock.company_name,
        shares: shares,
        average_buy_price: stock.price_gbp
      });
    }

    // Record transaction
    const transaction = await base44.entities.Transaction.create({
      symbol: stock.symbol,
      company_name: stock.company_name,
      type: 'buy',
      shares: shares,
      price_per_share: stock.price_gbp,
      total_amount: totalAmount
    });

    // Record history
    await base44.entities.PortfolioHistory.create({
      symbol: stock.symbol,
      company_name: stock.company_name,
      action: 'buy',
      shares: shares,
      price_per_share: stock.price_gbp,
      total_amount: totalAmount,
      cash_balance_after: account.cash_balance - totalAmount,
      portfolio_value_after: 0
    });

    return Response.json({ 
      success: true, 
      transaction,
      portfolio: portfolioRecord
    });
  } catch (error) {
    console.error('Buy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});