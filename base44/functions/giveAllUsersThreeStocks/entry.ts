import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.email !== 'aa.web.dev9777@gmail.com') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get all users except admin
        const allUsers = await base44.asServiceRole.entities.User.list();
        const adminEmail = 'aa.web.dev9777@gmail.com';
        const regularUsers = allUsers.filter(u => u.email !== adminEmail);

        const results = [];

        for (const targetUser of regularUsers) {
            // Mark that this user should see the stock selection modal
            const existingAccounts = await base44.asServiceRole.entities.UserAccount.filter({ created_by: targetUser.email });
            
            if (existingAccounts.length === 0) {
                await base44.asServiceRole.entities.UserAccount.create({
                    created_by: targetUser.email,
                    cash_balance: 10000,
                    free_stocks_available: 3
                });
            } else {
                await base44.asServiceRole.entities.UserAccount.update(existingAccounts[0].id, {
                    free_stocks_available: 3
                });
            }

            results.push({ email: targetUser.email, granted: true });
        }

        return Response.json({ 
            success: true, 
            message: `Granted 3 free stock selections to ${results.length} users`,
            users: results 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});