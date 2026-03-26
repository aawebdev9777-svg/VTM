import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { copyTradeId } = await req.json();

    const copyTrades = await base44.entities.CopyTrade.filter({ id: copyTradeId });
    const ct = copyTrades.find(c => c.follower_email === user.email || c.created_by === user.email);
    if (!ct) return Response.json({ error: 'Copy trade not found' }, { status: 404 });

    // Calculate current value based on leader's return
    const leaderAccounts = await base44.asServiceRole.entities.UserAccount.filter({ created_by: ct.leader_email });
    const allPortfolios = await base44.asServiceRole.entities.Portfolio.list();
    const stockPrices = await base44.asServiceRole.entities.StockPrice.list();
    
    const leaderPortfolio = allPortfolios.filter(p => p.created_by === ct.leader_email);
    const leaderPortfolioValue = leaderPortfolio.reduce((sum, p) => {
      const sp = stockPrices.find(s => s.symbol === p.symbol);
      return sum + (p.shares * (sp?.price_gbp || p.average_buy_price));
    }, 0);
    
    const leaderAccount = leaderAccounts[0];
    const leaderTotalValue = (leaderAccount?.cash_balance || 0) + leaderPortfolioValue;
    const leaderInitial = leaderAccount?.initial_balance || 10000;
    const leaderReturn = (leaderTotalValue - leaderInitial) / leaderInitial;
    const currentValue = Math.max(ct.investment_amount * (1 + leaderReturn), 0);

    // Return value to follower
    const followerAccounts = await base44.entities.UserAccount.filter({ created_by: user.email });
    const followerAccount = followerAccounts[0];
    
    const penniesBack = Math.round(currentValue * 100);
    await base44.entities.UserAccount.update(followerAccount.id, {
      cash_balance: followerAccount.cash_balance + (penniesBack / 100)
    });

    // Close the copy trade
    await base44.entities.CopyTrade.update(ct.id, { is_active: false });

    // Record transaction
    await base44.entities.Transaction.create({
      symbol: 'COPY_EXIT',
      company_name: `Exited copy trade - ${ct.leader_email.split('@')[0]}`,
      type: 'sell',
      shares: 0,
      price_per_share: 0,
      total_amount: parseFloat((penniesBack / 100).toFixed(2))
    });

    return Response.json({
      success: true,
      returnedAmount: penniesBack / 100,
      originalInvestment: ct.investment_amount,
      profitLoss: (penniesBack / 100) - ct.investment_amount
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});