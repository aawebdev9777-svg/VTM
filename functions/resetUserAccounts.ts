import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.email !== 'aa.web.dev9777@gmail.com') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const allAccounts = await base44.asServiceRole.entities.UserAccount.list();
    
    for (const account of allAccounts) {
      await base44.asServiceRole.entities.UserAccount.update(account.id, {
        cash_balance: 10000
      });
    }

    return Response.json({ 
      success: true, 
      message: `Reset ${allAccounts.length} user accounts to £10,000` 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});