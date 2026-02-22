import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current ABPF price
    const abpfPrices = await base44.asServiceRole.entities.StockPrice.filter({ symbol: 'ABPF' });
    const abpfPrice = abpfPrices[0];
    
    if (!abpfPrice) {
      return Response.json({ error: 'ABPF price not found' }, { status: 404 });
    }

    const currentPrice = abpfPrice.price_gbp;
    const timestamp = Date.now();
    
    // ==========================================
    // ELITE MARKET MICROSTRUCTURE ENGINE
    // ==========================================
    
    // 1. VOLATILITY CLUSTERING (GARCH model simulation)
    const hourOfDay = new Date().getHours();
    const baseVolatility = 0.018;
    const volatilityMultiplier = 
      (hourOfDay >= 9 && hourOfDay <= 16) ? 1.8 : // Market hours
      (hourOfDay >= 0 && hourOfDay <= 3) ? 0.4 : // Low activity
      1.0; // Normal
    const dynamicVolatility = baseVolatility * volatilityMultiplier;
    
    // 2. MOMENTUM & MEAN REVERSION (Multi-timeframe)
    const shortTermMomentum = Math.sin(timestamp / 80000) * 0.025;
    const mediumTermMomentum = Math.cos(timestamp / 300000) * 0.015;
    const longTermTrend = Math.sin(timestamp / 800000) * 0.012;
    const meanReversion = (125 - currentPrice) / 125 * 0.008; // Pull to fair value
    
    // 3. ORDER FLOW & LIQUIDITY
    const buyPressure = Math.random() * 1.5;
    const sellPressure = Math.random() * 1.5;
    const netOrderFlow = (buyPressure - sellPressure) * 0.015;
    const liquidityDepth = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const slippage = netOrderFlow / liquidityDepth;
    
    // 4. TECHNICAL INDICATORS
    const ema9 = currentPrice * (1 + (Math.random() * 0.015 - 0.0075));
    const ema21 = currentPrice * (1 + (Math.random() * 0.02 - 0.01));
    const ema50 = currentPrice * (1 + (Math.random() * 0.025 - 0.0125));
    
    const rsiBase = 50 + Math.sin(timestamp / 200000) * 20;
    const rsiNoise = (Math.random() - 0.5) * 10;
    const rsi = Math.max(20, Math.min(80, rsiBase + rsiNoise));
    
    const macdLine = (ema9 - ema21) / currentPrice;
    const macdSignal = macdLine * 0.9;
    const macdHistogram = macdLine - macdSignal;
    
    // 5. BOLLINGER BANDS
    const sma20 = currentPrice * (1 + (Math.random() * 0.018 - 0.009));
    const upperBand = sma20 * 1.02;
    const lowerBand = sma20 * 0.98;
    const bandPosition = (currentPrice - lowerBand) / (upperBand - lowerBand);
    const bandPressure = bandPosition > 0.8 ? -0.012 : bandPosition < 0.2 ? 0.012 : 0;
    
    // 6. VOLUME WEIGHTED PRESSURE
    const volumeProfile = 0.7 + Math.random() * 0.6;
    const vwapDeviation = (Math.random() - 0.5) * 0.01;
    
    // 7. MARKET SENTIMENT WAVES
    const fearGreedIndex = 50 + Math.sin(timestamp / 400000) * 30;
    const sentimentImpact = (fearGreedIndex - 50) / 100 * 0.015;
    
    // 8. NEWS & EVENT SIMULATION
    const newsProb = Math.random();
    let newsImpact = 0;
    if (newsProb < 0.02) { // 2% chance major news
      newsImpact = (Math.random() - 0.5) * 0.15;
    } else if (newsProb < 0.08) { // 6% chance minor news
      newsImpact = (Math.random() - 0.5) * 0.05;
    }
    
    // 9. INSTITUTIONAL FLOW (Large block trades)
    const institutionalFlow = Math.random() < 0.15 ? 
      (Math.random() - 0.5) * 0.025 : 0;
    
    // 10. MARKET MAKER SPREADS
    const spreadTightness = 0.985 + Math.random() * 0.03;
    
    // 11. CORRELATION WITH MARKET
    const marketBeta = 1.15;
    const marketMove = Math.sin(timestamp / 150000) * 0.008;
    const correlatedMove = marketMove * marketBeta;
    
    // 12. MICROSTRUCTURE NOISE
    const microNoise = (Math.random() - 0.5) * dynamicVolatility * 0.3;
    
    // ==========================================
    // COMPOSITE PRICE CALCULATION
    // ==========================================
    let totalPriceChange = 
      shortTermMomentum * 0.18 +
      mediumTermMomentum * 0.12 +
      longTermTrend * 0.08 +
      meanReversion * 0.10 +
      slippage * 0.15 +
      macdHistogram * 100 * 0.12 +
      (rsi < 35 ? 0.015 : rsi > 65 ? -0.015 : 0) * 0.08 +
      bandPressure * 0.07 +
      vwapDeviation * volumeProfile * 0.06 +
      sentimentImpact * 0.08 +
      newsImpact * 0.20 +
      institutionalFlow * 0.12 +
      correlatedMove * 0.10 +
      microNoise * 0.08;
    
    // Apply volatility envelope
    totalPriceChange = Math.max(-0.05, Math.min(0.05, totalPriceChange));
    
    // Calculate new price
    const newPrice = currentPrice * (1 + totalPriceChange) * spreadTightness;
    const finalPrice = Math.max(80, Math.min(180, newPrice)); // Circuit breakers
    
    // Update price
    await base44.asServiceRole.entities.StockPrice.update(abpfPrice.id, {
      price_gbp: parseFloat(finalPrice.toFixed(2)),
      daily_change_percent: parseFloat((totalPriceChange * 100).toFixed(2)),
      updated_at: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      price: finalPrice,
      change: totalPriceChange * 100,
      analytics: {
        volatility: dynamicVolatility,
        rsi: rsi.toFixed(1),
        macd: (macdHistogram * 100).toFixed(3),
        sentiment: fearGreedIndex.toFixed(1),
        orderFlow: netOrderFlow.toFixed(4),
        momentum: (shortTermMomentum * 100).toFixed(2),
        news: newsImpact !== 0
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});