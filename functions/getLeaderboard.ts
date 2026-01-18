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

    const adminEmail = 'aa.web.dev9777@gmail.com';
    const nonAdminUsers = allUsers.filter(u => u.email !== adminEmail);

    const leaderboard = nonAdminUsers.map(user => {
      const userAccount = allAccounts.find(acc => acc.created_by === user.email);
      const userPortfolio = allPortfolios.filter(p => p.created_by === user.email);
      const portfolioValue = userPortfolio.reduce((sum, p) => sum + (p.shares * p.average_buy_price), 0);
      const totalValue = (userAccount?.cash_balance || 10000) + portfolioValue;
      return {
        email: user.email,
        name: user.full_name || user.email,
        totalValue,
        rank: 0,
      };
    }).sort((a, b) => b.totalValue - a.totalValue).map((user, index) => ({ ...user, rank: index + 1 }));

    return Response.json({ leaderboard });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});