import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.email !== 'aa.web.dev9777@gmail.com') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const adminEmail = 'aa.web.dev9777@gmail.com';
    const allUsers = await base44.asServiceRole.entities.User.list();
    const nonAdminUsers = allUsers.filter(u => u.email !== adminEmail);

    let deleted = 0;
    let updated = 0;

    for (const u of nonAdminUsers) {
      // Delete all portfolios
      const portfolios = await base44.asServiceRole.entities.Portfolio.list();
      const userPortfolios = portfolios.filter(p => p.created_by === u.email);
      for (const p of userPortfolios) {
        await base44.asServiceRole.entities.Portfolio.delete(p.id);
        deleted++;
      }

      // Delete all transactions
      const transactions = await base44.asServiceRole.entities.Transaction.list();
      const userTransactions = transactions.filter(t => t.created_by === u.email);
      for (const t of userTransactions) {
        await base44.asServiceRole.entities.Transaction.delete(t.id);
        deleted++;
      }

      // Reset user account - cash balance and free stocks
      const accounts = await base44.asServiceRole.entities.UserAccount.list();
      const userAccounts = accounts.filter(a => a.created_by === u.email);
      
      if (userAccounts.length > 0) {
        await base44.asServiceRole.entities.UserAccount.update(userAccounts[0].id, {
          cash_balance: 10000,
          free_stocks_available: 3
        });
        updated++;
      } else {
        // Create account if it doesn't exist
        await base44.asServiceRole.entities.UserAccount.create({
          cash_balance: 10000,
          free_stocks_available: 3
        });
        updated++;
      }
    }

    return Response.json({
      success: true,
      message: `Reset ${nonAdminUsers.length} users`,
      details: {
        usersReset: nonAdminUsers.length,
        portfoliosDeleted: userPortfolios?.length || 0,
        transactionsDeleted: userTransactions?.length || 0
      }
    });

  } catch (error) {
    console.error('Error resetting users:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});