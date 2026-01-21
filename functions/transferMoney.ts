import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, amount } = await req.json();

    if (!recipientEmail || !amount || amount <= 0) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Get sender account
    const senderAccounts = await base44.entities.UserAccount.list();
    if (senderAccounts.length === 0) {
      return Response.json({ error: 'Sender account not found' }, { status: 404 });
    }
    const senderAccount = senderAccounts[0];

    if (senderAccount.cash_balance < amount) {
      return Response.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Get recipient account
    const recipientAccounts = await base44.asServiceRole.entities.UserAccount.filter({ created_by: recipientEmail });
    if (recipientAccounts.length === 0) {
      return Response.json({ error: 'Recipient account not found' }, { status: 404 });
    }
    const recipientAccount = recipientAccounts[0];

    // Perform FULL transfer (100% of amount)
    await base44.asServiceRole.entities.UserAccount.update(senderAccount.id, {
      cash_balance: senderAccount.cash_balance - amount
    });

    await base44.asServiceRole.entities.UserAccount.update(recipientAccount.id, {
      cash_balance: recipientAccount.cash_balance + amount
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});