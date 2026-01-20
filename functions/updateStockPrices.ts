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

    for (const symbol of symbols) {
      try {
        // Fetch real price from Yahoo Finance (free, no API key needed)
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
        const response = await fetch(yahooUrl);
        const data = await response.json();

        if (!data.chart?.result?.[0]) continue;

        const result = data.chart.result[0];
        const quote = result.meta;
        const currentPrice = quote.regularMarketPrice || quote.previousClose;
        const previousClose = quote.chartPreviousClose || quote.previousClose;
        const dailyChange = ((currentPrice - previousClose) / previousClose) * 100;

        // Convert USD to GBP (approximate)
        const priceGBP = currentPrice * 0.79;

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