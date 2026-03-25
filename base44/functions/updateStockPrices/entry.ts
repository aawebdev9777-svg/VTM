import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Real stocks to track
    const symbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
      'JPM', 'V', 'WMT', 'DIS', 'PYPL', 'CSCO', 'ADBE', 'CRM', 'ORCL', 'IBM'
    ];

    const updates = [];

    // Fetch live USD to GBP conversion once
    const fxResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const fxData = await fxResponse.json();
    const usdToGbp = fxData.rates?.GBP || 0.79;

    for (const symbol of symbols) {
      try {
        // Fetch from Yahoo Finance (free, no API key)
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
        const response = await fetch(yahooUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const data = await response.json();

        if (!data.chart?.result?.[0]) continue;

        const result = data.chart.result[0];
        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose || meta.previousClose;
        const dailyChange = ((currentPrice - previousClose) / previousClose) * 100;

        const priceGBP = currentPrice * usdToGbp;

        const stockData = {
          symbol,
          price_gbp: parseFloat(priceGBP.toFixed(2)),
          price_usd: parseFloat(currentPrice.toFixed(2)),
          daily_change_percent: parseFloat(dailyChange.toFixed(2)),
          updated_at: new Date().toISOString()
        };

        const existing = await base44.asServiceRole.entities.StockPrice.filter({ symbol });
        
        if (existing.length > 0) {
          await base44.asServiceRole.entities.StockPrice.update(existing[0].id, stockData);
        } else {
          await base44.asServiceRole.entities.StockPrice.create(stockData);
        }

        updates.push(stockData);
      } catch (err) {
        console.error(`Failed to update ${symbol}:`, err.message);
      }
    }

    return Response.json({ 
      success: true, 
      updated: updates.length,
      stocks: updates 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});