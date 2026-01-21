import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const symbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
      'AMD', 'INTC', 'JPM', 'V', 'WMT', 'DIS', 'PYPL', 'CSCO', 'ADBE',
      'CRM', 'ORCL', 'IBM'
    ];

    // Get exchange rate
    const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const rateData = await rateRes.json();
    const gbpRate = rateData.rates.GBP;

    // Fetch all prices in parallel for speed
    const pricePromises = symbols.map(async (symbol) => {
      try {
        const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`;
        const response = await fetch(url);
        const data = await response.json();

        if (data?.quoteSummary?.result?.[0]?.price) {
          const price = data.quoteSummary.result[0].price;
          const usdPrice = price.regularMarketPrice?.raw || 0;
          const gbpPrice = usdPrice * gbpRate;
          const dailyChange = price.regularMarketChangePercent?.raw || 0;

          return {
            symbol,
            price_gbp: parseFloat(gbpPrice.toFixed(2)),
            price_usd: parseFloat(usdPrice.toFixed(2)),
            daily_change_percent: parseFloat(dailyChange.toFixed(2)),
            updated_at: new Date().toISOString()
          };
        }
      } catch (err) {
        console.error(`Failed to fetch ${symbol}:`, err.message);
      }
      return null;
    });

    const fetchedPrices = (await Promise.all(pricePromises)).filter(Boolean);
    
    // Get all existing records and batch update/create
    const existing = await base44.asServiceRole.entities.StockPrice.list();
    const existingMap = Object.fromEntries(existing.map(e => [e.symbol, e.id]));

    // First apply small intraday movements to existing prices (±0.5%)
    if (existing.length > 0) {
      for (const stock of existing) {
        const movementPercent = (Math.random() * 1 - 0.5);
        const simulatedPrice = stock.price_gbp * (1 + movementPercent / 100);
        const simulatedChange = stock.daily_change_percent + (Math.random() * 0.2 - 0.1);

        await base44.asServiceRole.entities.StockPrice.update(stock.id, {
          price_gbp: parseFloat(simulatedPrice.toFixed(2)),
          daily_change_percent: parseFloat(simulatedChange.toFixed(2))
        });
      }
    }

    // Then sync to real data from Yahoo
    for (const priceData of fetchedPrices) {
      if (existingMap[priceData.symbol]) {
        await base44.asServiceRole.entities.StockPrice.update(existingMap[priceData.symbol], priceData);
      } else {
        await base44.asServiceRole.entities.StockPrice.create(priceData);
      }
    }

    // Return fresh prices
    const prices = await base44.asServiceRole.entities.StockPrice.list();
    return Response.json({ prices, success: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});