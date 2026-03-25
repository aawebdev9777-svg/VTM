import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all users and their accounts
    const allUsers = await base44.asServiceRole.entities.User.list();
    const allAccounts = await base44.asServiceRole.entities.UserAccount.list();
    const allPortfolios = await base44.asServiceRole.entities.Portfolio.list();
    const stockPrices = await base44.asServiceRole.entities.StockPrice.list();

    // Starter stocks to choose from
    const starterStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META'];
    
    const adminEmail = 'aa.web.dev9777@gmail.com';
    const nonAdminUsers = allUsers.filter(u => u.email !== adminEmail);

    let stocksGiven = 0;

    for (const targetUser of nonAdminUsers) {
      // Check if user already has stocks
      const userPortfolio = allPortfolios.filter(p => p.created_by === targetUser.email);
      if (userPortfolio.length > 0) continue; // Skip users who already have stocks

      // Find user account
      const userAccount = allAccounts.find(acc => acc.created_by === targetUser.email);
      if (!userAccount) continue; // Skip if no account

      // Pick a random starter stock
      const randomStock = starterStocks[Math.floor(Math.random() * starterStocks.length)];
      const stockPrice = stockPrices.find(sp => sp.symbol === randomStock);
      
      if (!stockPrice) continue;

      // Give 1 share
      const shares = 1;
      const totalCost = shares * stockPrice.price_gbp;

      // Create portfolio entry
      await base44.asServiceRole.entities.Portfolio.create({
        symbol: randomStock,
        company_name: stockPrice.symbol,
        shares: shares,
        average_buy_price: stockPrice.price_gbp,
        created_by: targetUser.email
      });

      // Deduct from cash balance
      await base44.asServiceRole.entities.UserAccount.update(userAccount.id, {
        cash_balance: userAccount.cash_balance - totalCost
      });

      // Create transaction record
      await base44.asServiceRole.entities.Transaction.create({
        symbol: randomStock,
        company_name: stockPrice.symbol,
        type: 'buy',
        shares: shares,
        price_per_share: stockPrice.price_gbp,
        total_amount: totalCost,
        created_by: targetUser.email
      });

      stocksGiven++;
    }

    return Response.json({ 
      success: true, 
      message: `Gave starter stock to ${stocksGiven} users` 
    });
  } catch (error) {
    console.error('Error giving starter stock:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});