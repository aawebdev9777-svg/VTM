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

    // Fetch real stock price from Alpha Vantage API (more reliable)
    const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol.toUpperCase()}&apikey=demo`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
      return Response.json({ error: 'Stock not found or API limit reached' }, { status: 404 });
    }

    const quote = data['Global Quote'];
    const currentPrice = parseFloat(quote['05. price']);
    const previousClose = parseFloat(quote['08. previous close']);
    const dailyChange = parseFloat(quote['10. change percent'].replace('%', ''));

    // Fetch live USD to GBP conversion
    const fxResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const fxData = await fxResponse.json();
    const usdToGbp = fxData.rates.GBP || 0.79;
    
    const priceGBP = currentPrice * usdToGbp;

    const stockData = {
      symbol: symbol.toUpperCase(),
      name: quote['01. symbol'],
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