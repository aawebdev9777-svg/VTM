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

    // Fetch real stock price from Yahoo Finance (free, no API key)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`;
    const response = await fetch(yahooUrl);
    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      return Response.json({ error: 'Stock not found' }, { status: 404 });
    }

    const result = data.chart.result[0];
    const quote = result.meta;
    const currentPrice = quote.regularMarketPrice || quote.previousClose;
    const previousClose = quote.chartPreviousClose || quote.previousClose;
    const dailyChange = ((currentPrice - previousClose) / previousClose) * 100;

    // Convert USD to GBP (approximate rate: 1 USD = 0.79 GBP)
    const priceGBP = currentPrice * 0.79;

    const stockData = {
      symbol: symbol.toUpperCase(),
      name: quote.longName || quote.shortName || symbol.toUpperCase(),
      price_gbp: parseFloat(priceGBP.toFixed(2)),
      price_usd: parseFloat(currentPrice.toFixed(2)),
      daily_change_percent: parseFloat(dailyChange.toFixed(2)),
      updated_at: new Date().toISOString()
    };

    // Store/update in StockPrice entity
    const existing = await base44.asServiceRole.entities.StockPrice.filter({ symbol: symbol.toUpperCase() });
    
    if (existing.length > 0) {
      await base44.asServiceRole.entities.StockPrice.update(existing[0].id, stockData);
    } else {
      await base44.asServiceRole.entities.StockPrice.create(stockData);
    }

    return Response.json(stockData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});