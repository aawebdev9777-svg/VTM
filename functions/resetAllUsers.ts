import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.email !== 'aa.web.dev9777@gmail.com') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete all accounts
        const accounts = await base44.asServiceRole.entities.UserAccount.list();
        for (const account of accounts) {
            await base44.asServiceRole.entities.UserAccount.delete(account.id);
        }

        // Delete all portfolios
        const portfolios = await base44.asServiceRole.entities.Portfolio.list();
        for (const portfolio of portfolios) {
            await base44.asServiceRole.entities.Portfolio.delete(portfolio.id);
        }

        // Delete all transactions
        const transactions = await base44.asServiceRole.entities.Transaction.list();
        for (const transaction of transactions) {
            await base44.asServiceRole.entities.Transaction.delete(transaction.id);
        }

        // Delete all watchlists
        const watchlists = await base44.asServiceRole.entities.Watchlist.list();
        for (const watchlist of watchlists) {
            await base44.asServiceRole.entities.Watchlist.delete(watchlist.id);
        }

        // Delete all alerts
        const alerts = await base44.asServiceRole.entities.PriceAlert.list();
        for (const alert of alerts) {
            await base44.asServiceRole.entities.PriceAlert.delete(alert.id);
        }

        return Response.json({ 
            success: true, 
            message: 'All user data reset successfully' 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});