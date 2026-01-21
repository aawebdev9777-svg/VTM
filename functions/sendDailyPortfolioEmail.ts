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

        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `📊 Daily Portfolio Update - ${new Date().toLocaleDateString()}`,
          body: `
Hi ${user.full_name},

Here's your daily portfolio snapshot:

💰 Portfolio Summary:
Total Value: £${totalValue}
Cash Balance: £${account.cash_balance.toFixed(2)}
Today's Change: ${dayChangePercent}%

📈 Your Holdings:
${holdings || 'No stocks held yet'}

🎯 Top Trading Picks Today:
${topStocks}

Keep up the good trading!
VTM Trading
          `
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