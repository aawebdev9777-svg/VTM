import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Advanced dividend calculation with multiple factors
function calculateDividendYield(stock, marketConditions, userHolding) {
  // Base yield (0.00005% - 0.0002% per hour) - extremely low
  let baseYield = 0.00005 + (Math.random() * 0.00015);
  
  // Sector multiplier
  const sectorMultipliers = {
    'tech': 1.2,
    'finance': 1.1,
    'energy': 0.9,
    'healthcare': 1.0,
    'consumer': 1.05,
  };
  
  // Price momentum factor
  const priceChange = stock.daily_change_percent || 0;
  const momentumFactor = 1 + (priceChange / 100) * 0.1; // +10% impact per 1% price change
  
  // Volatility adjustment
  const volatility = Math.abs(priceChange);
  const volatilityPenalty = 1 - (volatility * 0.02); // -2% per 1% volatility
  
  // Market cap adjustment (bigger stocks = lower yield)
  const mcapFactor = stock.price_gbp > 100 ? 0.9 : 1.1;
  
  // Holding duration bonus (if userHolding provided)
  let holdingBonus = 1.0;
  if (userHolding) {
    const daysHeld = (Date.now() - new Date(userHolding.created_date).getTime()) / (1000 * 60 * 60 * 24);
    holdingBonus = 1 + Math.min(daysHeld * 0.001, 0.15); // Up to +15% bonus
  }
  
  // Time decay factor (yields decrease over time to prevent exploitation)
  const hourOfDay = new Date().getHours();
  const timeDecay = hourOfDay < 12 ? 1.05 : 0.95; // Higher in morning
  
  // Calculate final yield
  const finalYield = baseYield 
    * momentumFactor 
    * Math.max(0.5, volatilityPenalty)
    * mcapFactor
    * holdingBonus
    * timeDecay;
  
  // Clamp to reasonable range (extremely low)
  return Math.max(0.00001, Math.min(0.0003, finalYield));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all portfolios and stock prices
    const [allPortfolios, stockPrices] = await Promise.all([
      base44.asServiceRole.entities.Portfolio.list(),
      base44.asServiceRole.entities.StockPrice.list()
    ]);
    
    // Calculate market conditions
    const avgChange = stockPrices.reduce((sum, s) => sum + (s.daily_change_percent || 0), 0) / stockPrices.length;
    const marketConditions = {
      sentiment: avgChange > 0 ? 'bullish' : 'bearish',
      volatility: Math.abs(avgChange),
      avgChange
    };
    
    // Update dividend yields with advanced algorithm
    const updates = [];
    for (const stock of stockPrices) {
      const yield_hourly = calculateDividendYield(stock, marketConditions);
      
      await base44.asServiceRole.entities.StockPrice.update(stock.id, {
        dividend_yield_hourly: parseFloat(yield_hourly.toFixed(6))
      });
      
      updates.push({
        symbol: stock.symbol,
        dividend_yield_hourly: parseFloat(yield_hourly.toFixed(6))
      });
    }
    
    return Response.json({ 
      success: true, 
      message: 'Advanced dividend yields calculated',
      marketConditions,
      updates 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});