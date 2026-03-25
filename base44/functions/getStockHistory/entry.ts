import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, days = 30 } = await req.json();

    if (!symbol) {
      return Response.json({ error: 'Symbol required' }, { status: 400 });
    }

    // Calculate date range
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (days * 24 * 60 * 60);

    // Use hourly interval for 30 days or less for more detailed data
    const interval = days <= 30 ? '1h' : '1d';

    // Fetch historical data from Yahoo Finance
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=${interval}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      return Response.json({ error: 'Failed to fetch stock data' }, { status: 404 });
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const prices = result.indicators.quote[0].close || [];
    const currency = result.meta.currency;

    // Get GBP exchange rate if needed
    let exchangeRate = 1;
    if (currency === 'USD') {
      const fxResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GBPUSD=X?interval=1d&range=1d');
      const fxData = await fxResponse.json();
      const usdToGbp = fxData.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (usdToGbp) {
        exchangeRate = usdToGbp;
      }
    }

    // Format historical data
    const historicalData = timestamps.map((timestamp, index) => {
      const price = prices[index];
      if (!price) return null;

      const date = new Date(timestamp * 1000);
      const dateStr = interval === '1h' 
        ? date.toLocaleTimeString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
      
      return {
        date: dateStr,
        price: parseFloat((price * exchangeRate).toFixed(2))
      };
    }).filter(item => item !== null);

    return Response.json({ 
      symbol,
      data: historicalData,
      currency: 'GBP'
    });

  } catch (error) {
    console.error('Error fetching stock history:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});