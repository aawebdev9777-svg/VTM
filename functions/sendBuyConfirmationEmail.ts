import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, company_name, shares, price_per_share, total_amount } = await req.json();
    
    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .detail-box { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
    .detail-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 18px; font-weight: bold; color: #333; margin-top: 5px; }
    .highlight { color: #667eea; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📈 Market Alert!</h1>
      <p>A new trade has been executed</p>
      <div style="background: rgba(255,255,255,0.1); padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #fff; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; word-break: break-all;">${user.full_name}</div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">${user.email}</div>
      </div>
    </div>
    <div class="content">
      <p>Hey traders,</p>
      <p><strong>${user.full_name}</strong> just bought <strong>${shares}</strong> shares of <strong>${symbol}</strong>! Here are the details:</p>
      
      <div class="details-grid">
        <div class="detail-box">
          <div class="detail-label">Stock</div>
          <div class="detail-value">${symbol}</div>
          <div style="color: #999; font-size: 12px; margin-top: 4px;">${company_name}</div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Shares</div>
          <div class="detail-value">${shares}</div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Price per Share</div>
          <div class="detail-value">£<span class="highlight">${price_per_share.toFixed(2)}</span></div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Total Cost</div>
          <div class="detail-value">£<span class="highlight">${total_amount.toFixed(2)}</span></div>
        </div>
      </div>

      <p style="margin-top: 30px; color: #666; font-size: 14px;">💡 Are you following the best traders? Copy their trades and boost your portfolio! 🚀</p>
    </div>
    <div class="footer">
      <p>VTM Trading Platform | Keep your eye on the market 📈</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send to all users
    for (const recipient of allUsers) {
      try {
        await base44.integrations.Core.SendEmail({
          to: recipient.email,
          subject: `📈 ${user.full_name} bought ${shares} ${symbol}!`,
          body: htmlBody
        });
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error.message);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});