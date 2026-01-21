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

    // Fetch and update all prices
    for (const symbol of symbols) {
      const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`;
      const response = await fetch(url);
      const data = await response.json();

      if (data?.quoteSummary?.result?.[0]?.price) {
        const price = data.quoteSummary.result[0].price;
        const usdPrice = price.regularMarketPrice?.raw || 0;
        const gbpPrice = usdPrice * gbpRate;
        const dailyChange = price.regularMarketChangePercent?.raw || 0;

        // Get existing or create new
        const existing = await base44.asServiceRole.entities.StockPrice.filter({ symbol });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.StockPrice.update(existing[0].id, {
            price_gbp: parseFloat(gbpPrice.toFixed(2)),
            price_usd: parseFloat(usdPrice.toFixed(2)),
            daily_change_percent: parseFloat(dailyChange.toFixed(2)),
            updated_at: new Date().toISOString()
          });
        } else {
          await base44.asServiceRole.entities.StockPrice.create({
            symbol,
            price_gbp: parseFloat(gbpPrice.toFixed(2)),
            price_usd: parseFloat(usdPrice.toFixed(2)),
            daily_change_percent: parseFloat(dailyChange.toFixed(2)),
            updated_at: new Date().toISOString()
          });
        }
      }
    }

    // Return fresh prices
    const prices = await base44.asServiceRole.entities.StockPrice.list();
    return Response.json({ prices, success: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});