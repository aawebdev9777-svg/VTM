import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users
    const users = await base44.asServiceRole.entities.User.list();

    for (const user of users) {
      try {
        // Fetch user's account and portfolio
        const accounts = await base44.asServiceRole.entities.UserAccount.filter({ created_by: user.email });
        const account = accounts[0];
        
        if (!account) continue;

        const portfolio = await base44.asServiceRole.entities.Portfolio.filter({ created_by: user.email });
        const stockPrices = await base44.asServiceRole.entities.StockPrice.list();

        // Calculate portfolio value
        let portfolioValue = 0;
        let holdings = '';
        
        portfolio.forEach(holding => {
          const stock = stockPrices.find(s => s.symbol === holding.symbol);
          const currentPrice = stock?.price_gbp || holding.average_buy_price;
          const holdingValue = holding.shares * currentPrice;
          const profit = holdingValue - (holding.shares * holding.average_buy_price);
          const profitPercent = ((profit / (holding.shares * holding.average_buy_price)) * 100).toFixed(2);
          
          portfolioValue += holdingValue;
          holdings += `
${holding.symbol}: ${holding.shares} shares @ £${currentPrice.toFixed(2)}
Value: £${holdingValue.toFixed(2)} | P&L: £${profit.toFixed(2)} (${profit >= 0 ? '+' : ''}${profitPercent}%)
`;
        });

        const totalValue = (account.cash_balance + portfolioValue).toFixed(2);
        const dayChangePercent = ((portfolioValue - (portfolioValue * 0.05)) / (portfolioValue * 0.05) * 100).toFixed(2);

        // Get top recommendations
        const topStocks = stockPrices
          .filter(s => ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'].includes(s.symbol))
          .sort((a, b) => Math.abs(b.daily_change_percent) - Math.abs(a.daily_change_percent))
          .slice(0, 3)
          .map(s => `${s.symbol}: ${s.daily_change_percent > 0 ? '📈' : '📉'} ${s.daily_change_percent}%`)
          .join('\n');

        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 30px; }
    .summary-box { background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat { display: inline-block; margin-right: 30px; margin-bottom: 10px; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: bold; color: #333; }
    .holding { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; display: flex; justify-content: space-between; align-items: center; }
    .holding-left { }
    .holding-symbol { font-weight: bold; font-size: 16px; }
    .holding-shares { font-size: 12px; color: #666; margin-top: 4px; }
    .holding-right { text-align: right; }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .picks { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 15px 0; }
    .pick-card { background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #e0e0e0; }
    .pick-symbol { font-weight: bold; font-size: 14px; }
    .pick-change { font-size: 18px; font-weight: bold; margin: 5px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Your Daily Update</h1>
      <p>${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="content">
      <p>Hey <strong>${user.full_name}</strong>,</p>
      
      <div class="summary-box">
        <div class="stat">
          <div class="stat-label">Total Value</div>
          <div class="stat-value">£${totalValue}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Cash</div>
          <div class="stat-value">£${account.cash_balance.toFixed(2)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Today's Change</div>
          <div class="stat-value ${dayChangePercent >= 0 ? 'positive' : 'negative'}">${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent}%</div>
        </div>
      </div>

      <h3 style="margin-top: 30px; margin-bottom: 15px;">📈 Your Holdings</h3>
      ${portfolio.length > 0 ? portfolio.map(holding => {
        const stock = stockPrices.find(s => s.symbol === holding.symbol);
        const currentPrice = stock?.price_gbp || holding.average_buy_price;
        const holdingValue = holding.shares * currentPrice;
        const profit = holdingValue - (holding.shares * holding.average_buy_price);
        const profitPercent = ((profit / (holding.shares * holding.average_buy_price)) * 100).toFixed(2);
        return `
          <div class="holding">
            <div class="holding-left">
              <div class="holding-symbol">${holding.symbol}</div>
              <div class="holding-shares">${holding.shares} shares @ £${currentPrice.toFixed(2)}</div>
            </div>
            <div class="holding-right">
              <div style="font-weight: bold;">£${holdingValue.toFixed(2)}</div>
              <div class="${profit >= 0 ? 'positive' : 'negative'}">${profit >= 0 ? '+' : ''}£${Math.abs(profit).toFixed(2)} (${profit >= 0 ? '+' : ''}${profitPercent}%)</div>
            </div>
          </div>
        `;
      }).join('') : '<p style="color: #999;">No stocks held yet</p>'}

      <h3 style="margin-top: 30px; margin-bottom: 15px;">🎯 Top Trading Opportunities</h3>
      <div class="picks">
        ${stockPrices
          .filter(s => ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'].includes(s.symbol))
          .sort((a, b) => Math.abs(b.daily_change_percent) - Math.abs(a.daily_change_percent))
          .slice(0, 3)
          .map(s => `
            <div class="pick-card">
              <div class="pick-symbol">${s.symbol}</div>
              <div class="pick-change ${s.daily_change_percent > 0 ? 'positive' : 'negative'}">
                ${s.daily_change_percent > 0 ? '📈' : '📉'} ${s.daily_change_percent}%
              </div>
            </div>
          `).join('')}
      </div>
    </div>
    <div class="footer">
      <p>VTM Trading Platform | Stay sharp, trade smart 📈</p>
    </div>
  </div>
</body>
</html>
        `;

        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `📊 Daily Portfolio Update - ${new Date().toLocaleDateString()}`,
          body: htmlBody
        });
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error.message);
      }
    }

    return Response.json({ success: true, emailsSent: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});