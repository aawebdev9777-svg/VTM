import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM', 
  'V', 'WMT', 'JNJ', 'PG', 'MA', 'HD', 'DIS', 'NFLX', 'ADBE', 
  'CRM', 'INTC', 'AMD', 'QCOM', 'COST', 'PEP', 'NKE', 'MCD'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();

    if (!admin || admin.email !== 'aa.web.dev9777@gmail.com') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userEmail } = await req.json();
    
    if (!userEmail) {
      return Response.json({ error: 'userEmail required' }, { status: 400 });
    }

    // Get user's account
    const accounts = await base44.asServiceRole.entities.UserAccount.filter({ created_by: userEmail });
    if (!accounts || accounts.length === 0) {
      return Response.json({ error: 'User account not found' }, { status: 404 });
    }
    const account = accounts[0];

    // Get random stock
    const randomStock = STOCKS[Math.floor(Math.random() * STOCKS.length)];
    
    // Get stock price
    const stockPrices = await base44.asServiceRole.entities.StockPrice.filter({ symbol: randomStock });
    if (!stockPrices || stockPrices.length === 0) {
      return Response.json({ error: 'Stock price not found' }, { status: 404 });
    }
    const stockPrice = stockPrices[0];

    // Calculate max shares user can afford
    const maxShares = Math.floor(account.cash_balance / stockPrice.price_gbp);
    
    if (maxShares < 1) {
      return Response.json({ 
        error: 'Insufficient funds', 
        cashBalance: account.cash_balance,
        stockPrice: stockPrice.price_gbp 
      }, { status: 400 });
    }

    // Buy random number of shares (1 to maxShares, max 10)
    const sharesToBuy = Math.min(Math.floor(Math.random() * maxShares) + 1, 10);
    const totalCost = sharesToBuy * stockPrice.price_gbp;

    // Check if user already owns this stock
    const existingHoldings = await base44.asServiceRole.entities.Portfolio.filter({ 
      created_by: userEmail,
      symbol: randomStock 
    });

    if (existingHoldings && existingHoldings.length > 0) {
      // Update existing holding
      const holding = existingHoldings[0];
      const totalShares = holding.shares + sharesToBuy;
      const totalInvested = (holding.shares * holding.average_buy_price) + totalCost;
      const newAverage = totalInvested / totalShares;

      await base44.asServiceRole.entities.Portfolio.update(holding.id, {
        shares: totalShares,
        average_buy_price: newAverage
      });
    } else {
      // Create new holding
      await base44.asServiceRole.entities.Portfolio.create({
        symbol: randomStock,
        company_name: randomStock,
        shares: sharesToBuy,
        average_buy_price: stockPrice.price_gbp,
        created_by: userEmail
      });
    }

    // Update cash balance
    await base44.asServiceRole.entities.UserAccount.update(account.id, {
      cash_balance: account.cash_balance - totalCost
    });

    // Create transaction record
    await base44.asServiceRole.entities.Transaction.create({
      symbol: randomStock,
      company_name: randomStock,
      type: 'buy',
      shares: sharesToBuy,
      price_per_share: stockPrice.price_gbp,
      total_amount: totalCost,
      created_by: userEmail
    });

    return Response.json({
      success: true,
      user: userEmail,
      stock: randomStock,
      shares: sharesToBuy,
      pricePerShare: stockPrice.price_gbp,
      totalCost: totalCost,
      remainingBalance: account.cash_balance - totalCost
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});