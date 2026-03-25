import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.email !== 'aa.web.dev9777@gmail.com') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { eventType } = await req.json();

    // Fetch all stock prices
    const stockPrices = await base44.asServiceRole.entities.StockPrice.list();

    let multiplier = 1;
    switch (eventType) {
      case 'crash':
        multiplier = 0.85; // 15% crash
        break;
      case 'boost':
        multiplier = 1.12; // 12% boost
        break;
      case 'dip':
        multiplier = 0.93; // 7% dip
        break;
      default:
        multiplier = 1;
    }

    // Update all prices
    for (const stock of stockPrices) {
      await base44.asServiceRole.entities.StockPrice.update(stock.id, {
        price_gbp: stock.price_gbp * multiplier,
        daily_change_percent: ((multiplier - 1) * 100)
      });
    }

    return Response.json({ 
      success: true, 
      message: `Market ${eventType} simulated`,
      multiplier 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});