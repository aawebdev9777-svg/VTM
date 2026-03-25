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
    
    // Get all existing records
    const existing = await base44.asServiceRole.entities.StockPrice.list();
    const existingMap = Object.fromEntries(existing.map(e => [e.symbol, e]));

    // Adjust prices to match predictions - make them gradual and realistic
    const adjustedPrices = fetchedPrices.map(priceData => {
      const current = existingMap[priceData.symbol];
      
      if (!current) {
        return priceData; // New stock, no adjustment needed
      }

      // If in dip (negative change > -0.8%), gradually recover
      if (priceData.daily_change_percent < -0.8) {
        const recoveryRate = 0.15; // 15% of dip recovers each update
        const recoveryAmount = Math.abs(priceData.daily_change_percent) * recoveryRate;
        return {
          ...priceData,
          daily_change_percent: parseFloat((priceData.daily_change_percent + recoveryAmount).toFixed(2))
        };
      }
      
      // If in uptrend (positive change > 0.4%), continue momentum gradually
      if (priceData.daily_change_percent > 0.4) {
        const momentumContinuation = priceData.daily_change_percent * 0.08; // 8% additional
        return {
          ...priceData,
          daily_change_percent: parseFloat((priceData.daily_change_percent + momentumContinuation).toFixed(2))
        };
      }

      return priceData;
    });

    // Update database with adjusted prices
    const existingMap2 = Object.fromEntries(existing.map(e => [e.symbol, e.id]));
    for (const priceData of adjustedPrices) {
      if (existingMap2[priceData.symbol]) {
        await base44.asServiceRole.entities.StockPrice.update(existingMap2[priceData.symbol], priceData);
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