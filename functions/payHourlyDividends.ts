import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all portfolios and data
    const portfolios = await base44.asServiceRole.entities.Portfolio.list();
    const stockPrices = await base44.asServiceRole.entities.StockPrice.list();
    const userAccounts = await base44.asServiceRole.entities.UserAccount.list();
    
    // Create maps for efficient lookup
    const dividendMap = {};
    stockPrices.forEach(stock => {
      dividendMap[stock.symbol] = stock.dividend_yield_hourly || 0;
    });
    
    const accountMap = {};
    userAccounts.forEach(acc => {
      accountMap[acc.created_by] = acc;
    });
    
    // Process portfolios and calculate dividends per account
    let totalPayouts = 0;
    const updates = [];
    const accountUpdates = {};
    const portfolioUpdates = [];
    
    for (const holding of portfolios) {
      const dividendYield = dividendMap[holding.symbol] || 0;
      
      if (dividendYield > 0) {
        const currentStock = stockPrices.find(s => s.symbol === holding.symbol);
        const currentPrice = currentStock?.price_gbp || holding.average_buy_price;
        const holdingValue = holding.shares * currentPrice;
        const dividendAmount = holdingValue * (dividendYield / 100);
        
        // Queue portfolio update
        portfolioUpdates.push({
          id: holding.id,
          total_dividends_earned: (holding.total_dividends_earned || 0) + dividendAmount
        });
        
        // Queue account update
        const account = accountMap[holding.created_by];
        if (account) {
          if (!accountUpdates[account.id]) {
            accountUpdates[account.id] = { account, total: 0 };
          }
          accountUpdates[account.id].total += dividendAmount;
          
          totalPayouts += dividendAmount;
          updates.push({
            user: holding.created_by,
            symbol: holding.symbol,
            dividend: dividendAmount
          });
        }
      }
    }
    
    // Batch portfolio updates in groups of 10 with delays
    const portfolioBatchSize = 10;
    for (let i = 0; i < portfolioUpdates.length; i += portfolioBatchSize) {
      const batch = portfolioUpdates.slice(i, i + portfolioBatchSize);
      await Promise.all(
        batch.map(update =>
          base44.asServiceRole.entities.Portfolio.update(update.id, {
            total_dividends_earned: update.total_dividends_earned
          })
        )
      );
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Batch account updates in groups of 10 with delays
    const accountEntries = Object.entries(accountUpdates);
    const accountBatchSize = 10;
    for (let i = 0; i < accountEntries.length; i += accountBatchSize) {
      const batch = accountEntries.slice(i, i + accountBatchSize);
      await Promise.all(
        batch.map(([accountId, { account, total }]) =>
          base44.asServiceRole.entities.UserAccount.update(accountId, {
            cash_balance: account.cash_balance + total
          })
        )
      );
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return Response.json({ 
      success: true, 
      totalPayouts: totalPayouts.toFixed(2),
      payoutsCount: updates.length,
      updates 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});