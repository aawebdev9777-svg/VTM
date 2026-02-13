import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Advanced ABPF stock simulation with real-world factors
class ABPFStockEngine {
  constructor() {
    // Market microstructure
    this.basePrice = 125.50;
    this.bid = this.basePrice - 0.05;
    this.ask = this.basePrice + 0.05;
    this.volume = 0;
    this.orderBook = { bids: [], asks: [] };
    
    // Technical indicators
    this.ema9 = this.basePrice;
    this.ema21 = this.basePrice;
    this.rsi = 50;
    this.macd = 0;
    this.bollingerBands = { upper: this.basePrice + 2, middle: this.basePrice, lower: this.basePrice - 2 };
    
    // Market factors
    this.momentum = 0;
    this.volatility = 0.015; // 1.5% base volatility
    this.sentiment = 0; // -1 to 1
    this.newsImpact = 0;
    this.institutionalFlow = 0;
    this.retailFlow = 0;
    
    // Time-based patterns
    this.timeOfDay = new Date().getHours();
    this.dayOfWeek = new Date().getDay();
    
    // Support/Resistance levels
    this.supportLevels = [120, 122.5, 124];
    this.resistanceLevels = [127, 129.5, 132];
  }
  
  calculateTechnicalIndicators(priceHistory) {
    if (priceHistory.length < 21) return;
    
    // EMA calculation
    const alpha9 = 2 / (9 + 1);
    const alpha21 = 2 / (21 + 1);
    this.ema9 = priceHistory[0] * alpha9 + this.ema9 * (1 - alpha9);
    this.ema21 = priceHistory[0] * alpha21 + this.ema21 * (1 - alpha21);
    
    // RSI calculation (simplified)
    const gains = [];
    const losses = [];
    for (let i = 1; i < Math.min(14, priceHistory.length); i++) {
      const change = priceHistory[i] - priceHistory[i - 1];
      if (change > 0) gains.push(change);
      else losses.push(Math.abs(change));
    }
    const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0.01;
    const rs = avgGain / avgLoss;
    this.rsi = 100 - (100 / (1 + rs));
    
    // MACD
    this.macd = this.ema9 - this.ema21;
    
    // Bollinger Bands
    const sma20 = priceHistory.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
    const variance = priceHistory.slice(0, 20).reduce((sum, p) => sum + Math.pow(p - sma20, 2), 0) / 20;
    const stdDev = Math.sqrt(variance);
    this.bollingerBands = {
      upper: sma20 + (stdDev * 2),
      middle: sma20,
      lower: sma20 - (stdDev * 2)
    };
  }
  
  simulateMarketMicrostructure() {
    // Order flow simulation
    const buyPressure = Math.random() * this.retailFlow + this.institutionalFlow;
    const sellPressure = Math.random() * 0.5 - this.newsImpact;
    
    // Spread dynamics
    const spreadTightening = this.volume > 1000 ? 0.02 : 0.05;
    this.bid = this.basePrice - spreadTightening;
    this.ask = this.basePrice + spreadTightening;
    
    // Net order flow
    return buyPressure - sellPressure;
  }
  
  applyMarketRegime() {
    // Time-of-day effects
    let timeMultiplier = 1.0;
    if (this.timeOfDay >= 9 && this.timeOfDay <= 10) {
      timeMultiplier = 1.3; // Market open volatility
    } else if (this.timeOfDay >= 15 && this.timeOfDay <= 16) {
      timeMultiplier = 1.2; // Market close volatility
    } else if (this.timeOfDay >= 12 && this.timeOfDay <= 14) {
      timeMultiplier = 0.7; // Lunch lull
    }
    
    // Day-of-week effects
    let dayMultiplier = 1.0;
    if (this.dayOfWeek === 1) dayMultiplier = 1.1; // Monday momentum
    if (this.dayOfWeek === 5) dayMultiplier = 1.05; // Friday positioning
    
    return timeMultiplier * dayMultiplier;
  }
  
  applySupportResistance(newPrice) {
    // Price bounces at support/resistance
    for (const support of this.supportLevels) {
      if (newPrice < support && newPrice > support - 0.5) {
        return support + (Math.random() * 0.3); // Bounce
      }
    }
    
    for (const resistance of this.resistanceLevels) {
      if (newPrice > resistance && newPrice < resistance + 0.5) {
        return resistance - (Math.random() * 0.3); // Rejection
      }
    }
    
    return newPrice;
  }
  
  generateNewsEvent() {
    // Random news events (5% chance)
    if (Math.random() < 0.05) {
      const events = [
        { impact: 0.8, duration: 10, type: 'positive_earnings' },
        { impact: -0.6, duration: 8, type: 'negative_guidance' },
        { impact: 0.5, duration: 5, type: 'analyst_upgrade' },
        { impact: -0.4, duration: 5, type: 'analyst_downgrade' },
        { impact: 0.3, duration: 3, type: 'sector_rotation' },
      ];
      return events[Math.floor(Math.random() * events.length)];
    }
    return null;
  }
  
  tick(priceHistory) {
    this.calculateTechnicalIndicators(priceHistory);
    
    // Generate news event
    const news = this.generateNewsEvent();
    if (news) {
      this.newsImpact = news.impact;
      this.sentiment += news.impact * 0.5;
    } else {
      this.newsImpact *= 0.95; // Decay
    }
    
    // Market microstructure
    const orderFlow = this.simulateMarketMicrostructure();
    
    // Momentum calculation
    const technicalSignal = (this.macd > 0 ? 0.3 : -0.3) + ((this.rsi - 50) / 100);
    this.momentum = this.momentum * 0.9 + (technicalSignal + orderFlow + this.sentiment) * 0.1;
    
    // Institutional vs retail flow
    this.institutionalFlow = (this.ema21 > this.ema9 ? 0.4 : -0.2) * (1 + this.momentum);
    this.retailFlow = Math.random() * 0.3 - 0.15;
    
    // Market regime
    const regimeMultiplier = this.applyMarketRegime();
    
    // Volatility clustering (GARCH effect)
    this.volatility = this.volatility * 0.95 + Math.abs(this.momentum) * 0.05;
    
    // Random walk with drift
    const drift = this.momentum * 0.001;
    const randomShock = (Math.random() - 0.5) * this.volatility * regimeMultiplier;
    
    // Mean reversion to fundamentals
    const fundamentalPrice = 126.0;
    const meanReversion = (fundamentalPrice - this.basePrice) * 0.0001;
    
    // Calculate new price
    let newPrice = this.basePrice * (1 + drift + randomShock + meanReversion);
    
    // Apply support/resistance
    newPrice = this.applySupportResistance(newPrice);
    
    // Update
    this.basePrice = newPrice;
    this.volume += Math.floor(Math.random() * 500 + 100);
    
    // Clamp to realistic bounds
    this.basePrice = Math.max(115, Math.min(135, this.basePrice));
    
    return {
      price: parseFloat(this.basePrice.toFixed(2)),
      bid: parseFloat(this.bid.toFixed(2)),
      ask: parseFloat(this.ask.toFixed(2)),
      volume: this.volume,
      indicators: {
        ema9: parseFloat(this.ema9.toFixed(2)),
        ema21: parseFloat(this.ema21.toFixed(2)),
        rsi: parseFloat(this.rsi.toFixed(1)),
        macd: parseFloat(this.macd.toFixed(3)),
        bollingerUpper: parseFloat(this.bollingerBands.upper.toFixed(2)),
        bollingerLower: parseFloat(this.bollingerBands.lower.toFixed(2)),
      },
      sentiment: this.sentiment.toFixed(2),
      momentum: this.momentum.toFixed(3),
      volatility: (this.volatility * 100).toFixed(2) + '%',
      newsImpact: this.newsImpact !== 0
    };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get ABPF stock
    const abpfStock = await base44.asServiceRole.entities.StockPrice.filter({ symbol: 'ABPF' });
    if (!abpfStock || abpfStock.length === 0) {
      return Response.json({ error: 'ABPF stock not found' }, { status: 404 });
    }
    
    // Get price history (last 50 updates)
    const priceHistory = [abpfStock[0].price_gbp];
    
    // Create engine
    const engine = new ABPFStockEngine();
    engine.basePrice = abpfStock[0].price_gbp;
    
    // Run simulation tick
    const result = engine.tick(priceHistory);
    
    // Update stock price
    const change = ((result.price - abpfStock[0].price_gbp) / abpfStock[0].price_gbp) * 100;
    
    await base44.asServiceRole.entities.StockPrice.update(abpfStock[0].id, {
      price_gbp: result.price,
      daily_change_percent: parseFloat(change.toFixed(2)),
      updated_at: new Date().toISOString()
    });
    
    return Response.json({ 
      success: true,
      abpf: result,
      previousPrice: abpfStock[0].price_gbp,
      change: parseFloat(change.toFixed(2))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});