import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, company_name, shares, price_per_share, total_amount, profit_loss } = await req.json();
    
    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; color: white; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .detail-box { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .detail-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 18px; font-weight: bold; color: #333; margin-top: 5px; }
    .profit-box { background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 15px 0; }
    .profit-label { font-size: 12px; color: #059669; text-transform: uppercase; }
    .profit-value { font-size: 20px; font-weight: bold; color: #059669; margin-top: 5px; }
    .loss-box { background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 15px 0; }
    .loss-label { font-size: 12px; color: #991b1b; text-transform: uppercase; }
    .loss-value { font-size: 20px; font-weight: bold; color: #991b1b; margin-top: 5px; }
    .highlight { color: #f59e0b; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Trade Update!</h1>
      <p>Someone just cashed out a position</p>
      <div style="background: rgba(255,255,255,0.1); padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #fff; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; word-break: break-all;">${user.full_name}</div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">${user.email}</div>
      </div>
    </div>
    <div class="content">
      <p>Hey traders,</p>
      <p><strong>${user.full_name}</strong> just sold <strong>${shares}</strong> shares of <strong>${symbol}</strong>. ${profit_loss >= 0 ? '🎉 They made a profit!' : '📉 They took a loss.'} Here are the details:</p>
      
      <div class="details-grid">
        <div class="detail-box">
          <div class="detail-label">Stock</div>
          <div class="detail-value">${symbol}</div>
          <div style="color: #999; font-size: 12px; margin-top: 4px;">${company_name}</div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Shares Sold</div>
          <div class="detail-value">${shares}</div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Sale Price</div>
          <div class="detail-value">£<span class="highlight">${price_per_share.toFixed(2)}</span></div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Proceeds</div>
          <div class="detail-value">£<span class="highlight">${total_amount.toFixed(2)}</span></div>
        </div>
      </div>

      ${profit_loss >= 0 ? `
      <div class="profit-box">
        <div class="profit-label">💰 Trade Profit</div>
        <div class="profit-value">+£${profit_loss.toFixed(2)}</div>
      </div>
      ` : `
      <div class="loss-box">
        <div class="loss-label">📉 Trade Loss</div>
        <div class="loss-value">-£${Math.abs(profit_loss).toFixed(2)}</div>
      </div>
      `}

      <p style="margin-top: 30px; color: #666; font-size: 14px;">📊 Your cash balance has been updated. Ready for your next trade! 🚀</p>
    </div>
    <div class="footer">
      <p>VTM Trading Platform | Keep your eye on the market 📈</p>
    </div>
  </div>
</body>
</html>
    `;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `✅ Sale Confirmed - ${symbol}`,
      body: htmlBody
    });

    // Also send to admin
    await base44.integrations.Core.SendEmail({
      to: 'aa.web.dev9777@gmail.com',
      subject: `📊 Sale Alert - ${user.full_name} sold ${shares} ${symbol}`,
      body: htmlBody
    });

    // Also send to Outlook address
    await base44.integrations.Core.SendEmail({
      to: 'aa.web.dev@outlook.com',
      subject: `📊 Sale Alert - ${user.full_name} sold ${shares} ${symbol}`,
      body: htmlBody
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});