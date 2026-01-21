import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.email !== 'aa.web.dev9777@gmail.com') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const bots = [
            { email: 'julian.bot@vtm.com', name: 'Julian', balance: 14500 },
            { email: 'chris.bot@vtm.com', name: 'Chris', balance: 13800 },
            { email: 'thomas.neve.bot@vtm.com', name: 'Thomas Neve', balance: 13200 }
        ];

        const createdBots = [];

        for (const bot of bots) {
            // Check if bot already exists
            const existingUsers = await base44.asServiceRole.entities.User.filter({ email: bot.email });
            
            if (existingUsers.length === 0) {
                // Invite the bot user
                await base44.users.inviteUser(bot.email, 'user');
                
                // Wait a bit for user creation
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Get or create account for bot
            const botUsers = await base44.asServiceRole.entities.User.filter({ email: bot.email });
            if (botUsers.length > 0) {
                const accounts = await base44.asServiceRole.entities.UserAccount.filter({ created_by: bot.email });
                
                if (accounts.length === 0) {
                    await base44.asServiceRole.entities.UserAccount.create({
                        created_by: bot.email,
                        cash_balance: bot.balance
                    });
                } else {
                    await base44.asServiceRole.entities.UserAccount.update(accounts[0].id, {
                        cash_balance: bot.balance
                    });
                }

                // Update user's full name
                await base44.asServiceRole.entities.User.update(botUsers[0].id, {
                    full_name: bot.name
                });

                createdBots.push({ email: bot.email, name: bot.name, balance: bot.balance });
            }
        }

        return Response.json({ 
            success: true, 
            message: `Created/updated ${createdBots.length} bots`,
            bots: createdBots 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});