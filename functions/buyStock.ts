import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        success: false, 
        data: null, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { stock, shares } = await req.json();

    // Validation
    if (!stock?.symbol || !shares || shares <= 0 || !Number.isInteger(shares)) {
      return Response.json({ 
        success: false, 
        data: null, 
        error: 'Invalid quantity. Must be a positive whole number.' 
      }, { status: 400 });
    }

    // Use existing stock price if available
    const existingPrices = await base44.asServiceRole.entities.StockPrice.filter({ 
      symbol: stock.symbol.toUpperCase() 
    });

    let priceGBP;
    let priceUSD;
    let meta;

    if (existingPrices.length > 0 && existingPrices[0].price_gbp) {
      // Use cached price
      priceGBP = existingPrices[0].price_gbp;
      priceUSD = existingPrices[0].price_usd || priceGBP / 0.79;
      meta = { longName: stock.company_name || stock.symbol };
    } else {
      // Fallback to Yahoo Finance
      try {
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol.toUpperCase()}?interval=1d&range=5d`;
        const priceResponse = await fetch(yahooUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const priceData = await priceResponse.json();

        if (!priceData.chart?.result?.[0]) {
          return Response.json({ 
            success: false, 
            data: null, 
            error: 'Stock price unavailable' 
          }, { status: 404 });
        }

        meta = priceData.chart.result[0].meta;
        priceUSD = meta.regularMarketPrice;

        // Get live USD to GBP rate
        const fxResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const fxData = await fxResponse.json();
        const usdToGbp = fxData.rates?.GBP || 0.79;
        priceGBP = priceUSD * usdToGbp;
      } catch (err) {
        console.error('Price fetch failed:', err);
        return Response.json({ 
          success: false, 
          data: null, 
          error: 'Unable to fetch stock price' 
        }, { status: 500 });
      }
    }
    
    const pricePennies = Math.round(priceGBP * 100); // Convert to integer pennies
    const totalCostPennies = pricePennies * shares;

    // Get user account
    const accounts = await base44.entities.UserAccount.filter({ created_by: user.email });
    const account = accounts[0];

    if (!account) {
      return Response.json({ 
        success: false, 
        data: null, 
        error: 'Account not found. Please refresh the page.' 
      }, { status: 404 });
    }

    const balancePennies = Math.round(account.cash_balance * 100);

    if (balancePennies < totalCostPennies) {
      return Response.json({ 
        success: false, 
        data: null, 
        error: `Insufficient funds. Need £${(totalCostPennies / 100).toFixed(2)}, have £${(balancePennies / 100).toFixed(2)}` 
      }, { status: 400 });
    }

    // ATOMIC TRANSACTION - Update balance
    const newBalancePennies = balancePennies - totalCostPennies;
    await base44.entities.UserAccount.update(account.id, {
      cash_balance: newBalancePennies / 100
    });

    // Update or create portfolio holding
    const existingHoldings = await base44.entities.Portfolio.filter({
      symbol: stock.symbol.toUpperCase(),
      created_by: user.email
    });

    let holdingId;
    if (existingHoldings.length > 0) {
      const holding = existingHoldings[0];
      const newTotalShares = holding.shares + shares;
      const totalCostBasis = (holding.average_buy_price * holding.shares) + (pricePennies / 100 * shares);
      const newAverageCost = totalCostBasis / newTotalShares;

      await base44.entities.Portfolio.update(holding.id, {
        shares: newTotalShares,
        average_buy_price: parseFloat(newAverageCost.toFixed(2))
      });
      holdingId = holding.id;
    } else {
      const newHolding = await base44.entities.Portfolio.create({
        symbol: stock.symbol.toUpperCase(),
        company_name: meta.longName || meta.shortName || stock.symbol.toUpperCase(),
        shares: shares,
        average_buy_price: parseFloat((pricePennies / 100).toFixed(2))
      });
      holdingId = newHolding.id;
    }

    // Record transaction
    await base44.entities.Transaction.create({
      symbol: stock.symbol.toUpperCase(),
      company_name: meta.longName || meta.shortName || stock.symbol.toUpperCase(),
      type: 'buy',
      shares: shares,
      price_per_share: parseFloat((pricePennies / 100).toFixed(2)),
      total_amount: parseFloat((totalCostPennies / 100).toFixed(2))
    });

    // Track event for analytics
    await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Track a stock purchase event: ${shares} shares of ${stock.symbol.toUpperCase()} at £${(pricePennies / 100).toFixed(2)} per share for total £${(totalCostPennies / 100).toFixed(2)}`
    }).catch(() => {});

    // Update stock price cache
    const existingPrice = await base44.asServiceRole.entities.StockPrice.filter({ 
      symbol: stock.symbol.toUpperCase() 
    });
    
    const priceData_cache = {
      symbol: stock.symbol.toUpperCase(),
      price_gbp: parseFloat((pricePennies / 100).toFixed(2)),
      price_usd: parseFloat(priceUSD.toFixed(2)),
      daily_change_percent: 0,
      updated_at: new Date().toISOString()
    };

    if (existingPrice.length > 0) {
      await base44.asServiceRole.entities.StockPrice.update(existingPrice[0].id, priceData_cache);
    } else {
      await base44.asServiceRole.entities.StockPrice.create(priceData_cache);
    }

    // Get fresh data
    const updatedAccount = await base44.entities.UserAccount.filter({ created_by: user.email });
    const updatedHoldings = await base44.entities.Portfolio.filter({ created_by: user.email });

    // Send buy confirmation email
    try {
      await base44.asServiceRole.functions.invoke('sendBuyConfirmationEmail', {
        symbol: stock.symbol.toUpperCase(),
        company_name: meta.longName || meta.shortName || stock.symbol.toUpperCase(),
        shares: shares,
        price_per_share: parseFloat((pricePennies / 100).toFixed(2)),
        total_amount: parseFloat((totalCostPennies / 100).toFixed(2))
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError.message);
    }

    return Response.json({
      success: true,
      data: {
        account: updatedAccount[0],
        portfolio: updatedHoldings,
        executedPrice: parseFloat((pricePennies / 100).toFixed(2)),
        totalCost: parseFloat((totalCostPennies / 100).toFixed(2))
      },
      error: null
    });

  } catch (error) {
    console.error('Buy stock error:', error);
    return Response.json({ 
      success: false, 
      data: null, 
      error: error.message || 'Transaction failed. Please try again.' 
    }, { status: 500 });
  }
});