import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list();
    const allAccounts = await base44.asServiceRole.entities.UserAccount.list();
    const allPortfolios = await base44.asServiceRole.entities.Portfolio.list();
    const allStockPrices = await base44.asServiceRole.entities.StockPrice.list();
    const allCopyTrades = await base44.asServiceRole.entities.CopyTrade.list();

    const adminEmail = 'aa.web.dev9777@gmail.com';
    const nonAdminUsers = allUsers.filter(u => u.email !== adminEmail);

    // Create a map of stock prices for quick lookup
    const priceMap = {};
    allStockPrices.forEach(sp => {
      priceMap[sp.symbol] = sp.price_gbp;
    });

    // First pass: calculate base values (cash + portfolio with current prices)
    const userBaseValues = {};
    nonAdminUsers.forEach(user => {
      const userAccount = allAccounts.find(acc => acc.created_by === user.email);
      const userPortfolio = allPortfolios.filter(p => p.created_by === user.email);
      
      // Calculate portfolio value using CURRENT market prices
      const portfolioValue = userPortfolio.reduce((sum, p) => {
        const currentPrice = priceMap[p.symbol] || p.average_buy_price;
        return sum + (p.shares * currentPrice);
      }, 0);
      
      const cashBalance = userAccount?.cash_balance || 10000;
      const initialBalance = userAccount?.initial_balance || 10000;
      
      userBaseValues[user.email] = {
        cash: cashBalance,
        portfolio: portfolioValue,
        initial: initialBalance,
      };
    });

    // Second pass: calculate copy trade values
    const userCopyTradeValues = {};
    nonAdminUsers.forEach(user => {
      const userCopyTrades = allCopyTrades.filter(ct => ct.follower_email === user.email && ct.is_active);
      
      let copyTradeValue = 0;
      userCopyTrades.forEach(ct => {
        const leaderBase = userBaseValues[ct.leader_email];
        if (leaderBase) {
          const leaderTotalValue = leaderBase.cash + leaderBase.portfolio;
          const leaderReturn = (leaderTotalValue - leaderBase.initial) / leaderBase.initial;
          const currentValue = ct.investment_amount * (1 + leaderReturn);
          copyTradeValue += currentValue;
        } else {
          copyTradeValue += ct.investment_amount;
        }
      });
      
      userCopyTradeValues[user.email] = copyTradeValue;
    });

    // Final pass: build leaderboard with all values
    const leaderboard = nonAdminUsers.map(user => {
      const base = userBaseValues[user.email];
      const copyTradeValue = userCopyTradeValues[user.email] || 0;
      const totalValue = base.cash + base.portfolio + copyTradeValue;
      const percentageReturn = ((totalValue - base.initial) / base.initial) * 100;
      
      return {
        email: user.email,
        name: user.username || user.full_name || user.email.split('@')[0],
        balance: base.cash,
        portfolioValue: base.portfolio,
        copyTradeValue: copyTradeValue,
        totalValue: totalValue,
        percentageReturn: percentageReturn,
        rank: 0,
      };
    }).sort((a, b) => b.totalValue - a.totalValue).map((user, index) => ({ ...user, rank: index + 1 }));

    return Response.json({ leaderboard });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});