import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { leaderEmail, amount } = await req.json();

        if (!leaderEmail || !amount || amount <= 0) {
            return Response.json({ error: 'Invalid amount or leader email' }, { status: 400 });
        }

        // Calculate commission
        const commission = amount * 0.2;
        const investmentAmount = amount * 0.8;

        // Get follower's account
        const followerAccounts = await base44.entities.UserAccount.filter({ created_by: user.email });
        if (!followerAccounts || !followerAccounts[0]) {
            return Response.json({ error: 'User account not found' }, { status: 404 });
        }

        if (followerAccounts[0].cash_balance < amount) {
            return Response.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Get leader's account
        const leaderAccounts = await base44.asServiceRole.entities.UserAccount.filter({ created_by: leaderEmail });
        if (!leaderAccounts || !leaderAccounts[0]) {
            return Response.json({ error: 'Leader account not found' }, { status: 404 });
        }

        // Deduct from follower
        await base44.entities.UserAccount.update(followerAccounts[0].id, {
            cash_balance: followerAccounts[0].cash_balance - amount
        });

        // Add commission to leader
        await base44.asServiceRole.entities.UserAccount.update(leaderAccounts[0].id, {
            cash_balance: leaderAccounts[0].cash_balance + commission
        });

        // Create transaction record
        await base44.entities.Transaction.create({
            symbol: 'COPY',
            company_name: `Copy Trading - ${leaderEmail.split('@')[0]}`,
            type: 'buy',
            shares: 0,
            price_per_share: 0,
            total_amount: investmentAmount
        });

        // Create copy trade record
        const copyTrade = await base44.entities.CopyTrade.create({
            follower_email: user.email,
            leader_email: leaderEmail,
            investment_amount: investmentAmount,
            is_active: true,
        });

        return Response.json({ success: true, copyTrade });
    } catch (error) {
        console.error('Copy trade error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});