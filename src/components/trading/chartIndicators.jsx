// Calculate Simple Moving Average
export const calculateSMA = (data, period) => {
  return data.map((item, index) => {
    if (index < period - 1) return null;
    const sum = data.slice(index - period + 1, index + 1).reduce((acc, d) => acc + d.close, 0);
    return sum / period;
  });
};

// Calculate Exponential Moving Average
export const calculateEMA = (data, period) => {
  const k = 2 / (period + 1);
  const ema = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((acc, d) => acc + d.close, 0);
      ema.push(sum / period);
    } else {
      ema.push(data[i].close * k + ema[i - 1] * (1 - k));
    }
  }
  return ema;
};

// Calculate RSI (Relative Strength Index)
export const calculateRSI = (data, period = 14) => {
  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  const rsi = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(null);
    } else {
      const gains = changes.slice(i - period, i).filter(c => c > 0).reduce((a, c) => a + c, 0);
      const losses = changes.slice(i - period, i).filter(c => c < 0).reduce((a, c) => a + Math.abs(c), 0);
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  return rsi;
};

// Calculate MACD
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const ema12 = calculateEMA(data, fastPeriod);
  const ema26 = calculateEMA(data, slowPeriod);
  
  const macd = ema12.map((val, i) => val && ema26[i] ? val - ema26[i] : null);
  
  const signalLine = [];
  for (let i = 0; i < macd.length; i++) {
    if (i < signalPeriod - 1 || macd[i] === null) {
      signalLine.push(null);
    } else {
      const validMACDs = [];
      for (let j = i - signalPeriod + 1; j <= i; j++) {
        if (macd[j] !== null) validMACDs.push(macd[j]);
      }
      if (validMACDs.length === signalPeriod) {
        signalLine.push(validMACDs.reduce((a, b) => a + b, 0) / signalPeriod);
      } else {
        signalLine.push(null);
      }
    }
  }

  const histogram = macd.map((val, i) => val && signalLine[i] ? val - signalLine[i] : null);

  return { macd, signalLine, histogram };
};

// Convert price data to OHLC if needed
export const enrichChartData = (data) => {
  return data.map(item => ({
    time: Math.floor(new Date(item.date).getTime() / 1000),
    open: item.price,
    high: item.price,
    low: item.price,
    close: item.price,
    value: item.price,
    date: item.date
  }));
};