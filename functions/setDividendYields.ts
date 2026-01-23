import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all stock prices
    const stockPrices = await base44.asServiceRole.entities.StockPrice.list();
    
    // Set dividend yields for each stock (0.02% to 0.15% per hour)
    // This translates to roughly 175-1300 GBP per year on a 10,000 GBP holding
    const updates = [];
    
    for (const stock of stockPrices) {
      // Different yields based on stock characteristics
      let dividendYield;
      
      // Low dividend yields (0.01-0.05% per hour)
      const baseYield = 0.01 + (Math.random() * 0.04); // 0.01-0.05% per hour
      dividendYield = baseYield;
      
      await base44.asServiceRole.entities.StockPrice.update(stock.id, {
        dividend_yield_hourly: parseFloat(dividendYield.toFixed(4))
      });
      
      updates.push({
        symbol: stock.symbol,
        dividend_yield_hourly: parseFloat(dividendYield.toFixed(4))
      });
    }
    
    return Response.json({ 
      success: true, 
      message: 'Dividend yields set for all stocks',
      updates 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});