import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all user accounts
    const accounts = await base44.asServiceRole.entities.UserAccount.list();
    const stockPrices = await base44.asServiceRole.entities.StockPrice.list();
    
    if (stockPrices.length === 0) {
      return Response.json({ error: 'No stocks available' }, { status: 400 });
    }
    
    const updates = [];
    
    for (const account of accounts) {
      // Pick a random stock
      const randomStock = stockPrices[Math.floor(Math.random() * stockPrices.length)];
      
      // Calculate shares to buy (between 5-15 shares)
      const sharesToBuy = Math.floor(Math.random() * 11) + 5;
      const totalCost = sharesToBuy * randomStock.price_gbp;
      
      // Check if user already has this stock
      const existingHoldings = await base44.asServiceRole.entities.Portfolio.filter({
        created_by: account.created_by,
        symbol: randomStock.symbol
      });
      
      if (existingHoldings.length > 0) {
        // Update existing holding
        const holding = existingHoldings[0];
        const newShares = holding.shares + sharesToBuy;
        const newAvgPrice = ((holding.shares * holding.average_buy_price) + totalCost) / newShares;
        
        await base44.asServiceRole.entities.Portfolio.update(holding.id, {
          shares: newShares,
          average_buy_price: newAvgPrice
        });
      } else {
        // Create new holding
        await base44.asServiceRole.entities.Portfolio.create({
          symbol: randomStock.symbol,
          company_name: randomStock.symbol,
          shares: sharesToBuy,
          average_buy_price: randomStock.price_gbp,
          total_dividends_earned: 0,
          created_by: account.created_by
        });
      }
      
      updates.push({
        user: account.created_by,
        stock: randomStock.symbol,
        shares: sharesToBuy,
        cost: totalCost
      });
    }
    
    return Response.json({ 
      success: true,
      message: `Gave ${updates.length} users random stocks`,
      updates 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});