import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol } = await req.json();

    if (!symbol) {
      return Response.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Special handling for ABPF
    if (symbol === 'ABPF') {
      const basePrice = 125.50;
      const variation = (Math.random() - 0.5) * 5;
      const price = basePrice + variation;
      const dailyChange = ((Math.random() - 0.5) * 4).toFixed(2);

      return Response.json({
        symbol: 'ABPF',
        name: 'AB Portfolio Finance',
        price_usd: price,
        price_gbp: price * 0.79,
        daily_change_percent: parseFloat(dailyChange),
      });
    }

    // For real stocks, use LLM to get live data
    const stockData = await base44.integrations.Core.InvokeLLM({
      prompt: `Get the current stock price and daily percentage change for ${symbol}. Return ONLY a JSON with: {"price_usd": number, "daily_change_percent": number, "name": "Company Name"}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          price_usd: { type: "number" },
          daily_change_percent: { type: "number" },
          name: { type: "string" }
        },
        required: ["price_usd", "daily_change_percent", "name"]
      }
    });

    const GBP_RATE = 0.79;
    
    return Response.json({
      symbol,
      name: stockData.name,
      price_usd: stockData.price_usd,
      price_gbp: stockData.price_usd * GBP_RATE,
      daily_change_percent: stockData.daily_change_percent,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});