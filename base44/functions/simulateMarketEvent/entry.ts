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
      case 'random':
        for (const stock of stockPrices) {
          const individualChange = 0.92 + Math.random() * 0.16;
          await base44.asServiceRole.entities.StockPrice.update(stock.id, {
            price_gbp: parseFloat((stock.price_gbp * individualChange).toFixed(2)),
            daily_change_percent: parseFloat(((individualChange - 1) * 100).toFixed(2))
          });
        }
        return Response.json({ success: true, message: 'Random market movement applied' });
      case 'volatile':
        const randomStocks = [...stockPrices].sort(() => Math.random() - 0.5).slice(0, 3);
        for (const stock of randomStocks) {
          const change = Math.random() > 0.5 ? 1.15 : 0.85;
          await base44.asServiceRole.entities.StockPrice.update(stock.id, {
            price_gbp: parseFloat((stock.price_gbp * change).toFixed(2)),
            daily_change_percent: parseFloat(((change - 1) * 100).toFixed(2))
          });
        }
        return Response.json({ success: true, message: 'Volatile movement on 3 random stocks' });
      default:
        multiplier = 1;
    }

    // Update all prices (for crash/boost/dip)
    if (multiplier !== 1) {
      for (const stock of stockPrices) {
        await base44.asServiceRole.entities.StockPrice.update(stock.id, {
          price_gbp: parseFloat((stock.price_gbp * multiplier).toFixed(2)),
          daily_change_percent: parseFloat(((multiplier - 1) * 100).toFixed(2))
        });
      }
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