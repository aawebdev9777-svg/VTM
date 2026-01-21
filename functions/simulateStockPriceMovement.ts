import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all stock prices
    const prices = await base44.asServiceRole.entities.StockPrice.list();
    
    if (!prices || prices.length === 0) {
      return Response.json({ success: true, updated: 0 });
    }

    // Update each stock with realistic market movement
    for (const stock of prices) {
      // Random change between -2% and +3% (realistic daily volatility)
      const changePercent = (Math.random() * 5 - 2);
      const newPrice = stock.price_gbp * (1 + changePercent / 100);
      const newChange = stock.daily_change_percent + (Math.random() * 1 - 0.5);

      await base44.asServiceRole.entities.StockPrice.update(stock.id, {
        price_gbp: parseFloat(newPrice.toFixed(2)),
        daily_change_percent: parseFloat(newChange.toFixed(2)),
        updated_at: new Date().toISOString()
      });
    }

    return Response.json({ success: true, updated: prices.length });
  } catch (error) {
    console.error('Price movement simulation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});