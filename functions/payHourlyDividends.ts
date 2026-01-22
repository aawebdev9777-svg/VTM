import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all portfolios
    const portfolios = await base44.asServiceRole.entities.Portfolio.list();
    const stockPrices = await base44.asServiceRole.entities.StockPrice.list();
    
    // Create a map of stock symbols to their dividend yields
    const dividendMap = {};
    stockPrices.forEach(stock => {
      dividendMap[stock.symbol] = stock.dividend_yield_hourly || 0;
    });
    
    // Process each portfolio holding
    let totalPayouts = 0;
    const updates = [];
    
    for (const holding of portfolios) {
      const dividendYield = dividendMap[holding.symbol] || 0;
      
      if (dividendYield > 0) {
        // Calculate dividend: (shares * current_price * dividend_yield_hourly / 100)
        const currentStock = stockPrices.find(s => s.symbol === holding.symbol);
        const currentPrice = currentStock?.price_gbp || holding.average_buy_price;
        const holdingValue = holding.shares * currentPrice;
        const dividendAmount = holdingValue * (dividendYield / 100);
        
        // Update portfolio with new total dividends
        const newTotalDividends = (holding.total_dividends_earned || 0) + dividendAmount;
        await base44.asServiceRole.entities.Portfolio.update(holding.id, {
          total_dividends_earned: newTotalDividends
        });
        
        // Get user account and add dividend to cash balance
        const userAccounts = await base44.asServiceRole.entities.UserAccount.filter({
          created_by: holding.created_by
        });
        
        if (userAccounts.length > 0) {
          const account = userAccounts[0];
          await base44.asServiceRole.entities.UserAccount.update(account.id, {
            cash_balance: account.cash_balance + dividendAmount
          });
          
          totalPayouts += dividendAmount;
          updates.push({
            user: holding.created_by,
            symbol: holding.symbol,
            dividend: dividendAmount
          });
        }
      }
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