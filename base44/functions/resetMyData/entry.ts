import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user's portfolio holdings
    const portfolio = await base44.entities.Portfolio.filter({ created_by: user.email });
    for (const holding of portfolio) {
      await base44.entities.Portfolio.delete(holding.id);
    }

    // Delete all user's transactions
    const transactions = await base44.entities.Transaction.filter({ created_by: user.email });
    for (const tx of transactions) {
      await base44.entities.Transaction.delete(tx.id);
    }

    // Delete all user's portfolio history
    const history = await base44.entities.PortfolioHistory.filter({ created_by: user.email });
    for (const h of history) {
      await base44.entities.PortfolioHistory.delete(h.id);
    }

    // Delete all user's watchlist
    const watchlist = await base44.entities.Watchlist.filter({ created_by: user.email });
    for (const w of watchlist) {
      await base44.entities.Watchlist.delete(w.id);
    }

    // Delete all user's price alerts
    const alerts = await base44.entities.PriceAlert.filter({ created_by: user.email });
    for (const a of alerts) {
      await base44.entities.PriceAlert.delete(a.id);
    }

    // Reset user account to initial balance
    const accounts = await base44.entities.UserAccount.filter({ created_by: user.email });
    if (accounts.length > 0) {
      await base44.entities.UserAccount.update(accounts[0].id, {
        cash_balance: 10000,
        initial_balance: 10000
      });
    } else {
      await base44.entities.UserAccount.create({
        cash_balance: 10000,
        initial_balance: 10000
      });
    }

    return Response.json({
      success: true,
      message: 'All your data has been reset. Starting fresh with £10,000!'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});