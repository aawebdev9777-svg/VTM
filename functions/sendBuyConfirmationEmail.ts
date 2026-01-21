import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, company_name, shares, price_per_share, total_amount } = await req.json();

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `✅ Stock Purchase Confirmation - ${symbol}`,
      body: `
Hi ${user.full_name},

Your stock purchase has been confirmed!

Stock: ${symbol} (${company_name})
Shares: ${shares}
Price per share: £${price_per_share.toFixed(2)}
Total amount: £${total_amount.toFixed(2)}

Your new holdings and portfolio value have been updated. Keep monitoring your positions!

Happy trading!
VTM Trading
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});