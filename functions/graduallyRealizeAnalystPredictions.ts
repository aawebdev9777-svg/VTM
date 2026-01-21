import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all stock prices
    const allPrices = await base44.asServiceRole.entities.StockPrice.list();
    
    if (!allPrices || allPrices.length === 0) {
      return Response.json({ success: true, updated: 0 });
    }
    
    // Get all portfolios to know which stocks are owned
    const allPortfolios = await base44.asServiceRole.entities.Portfolio.list();
    
    // Track which stocks are owned
    const ownedSymbols = new Set(allPortfolios.map(p => p.symbol));
    
    let updated = 0;
    
    // For each stock price, push toward predicted gain if owned
    for (const stock of allPrices) {
      const dailyChange = stock.daily_change_percent || 0;
      let predictedTarget = 0;
      
      // ABPF always trends up (super profitable)
      if (stock.symbol === 'ABPF') {
        predictedTarget = 3.5; // Always gaining 3.5% extra
      } else if (ownedSymbols.has(stock.symbol)) {
        // For other owned stocks, predict based on current change
        if (dailyChange < -2) {
          predictedTarget = Math.abs(dailyChange) * 0.75;
        } else if (dailyChange < -0.8) {
          predictedTarget = Math.abs(dailyChange) * 0.6;
        } else if (dailyChange > 1.2) {
          predictedTarget = dailyChange * 0.65;
        } else if (dailyChange > 0.4) {
          predictedTarget = dailyChange * 0.5;
        }
      }
      
      // If we have a target, gradually move toward it
      if (predictedTarget > 0 && dailyChange < predictedTarget) {
        const step = (predictedTarget - dailyChange) * 0.15;
        const newChange = Math.min(dailyChange + step, predictedTarget);
        
        const newPrice = stock.price_gbp * (1 + (newChange - dailyChange) / 100);
        
        await base44.asServiceRole.entities.StockPrice.update(stock.id, {
          price_gbp: parseFloat(newPrice.toFixed(2)),
          daily_change_percent: parseFloat(newChange.toFixed(2)),
          updated_at: new Date().toISOString()
        });
        
        updated++;
      }
    }
    
    return Response.json({ success: true, updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});