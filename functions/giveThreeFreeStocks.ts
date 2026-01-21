import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { stockSymbols, userEmail } = await req.json();

        // If userEmail is provided, admin is calling this
        let targetUserEmail;
        if (userEmail) {
            const user = await base44.auth.me();
            if (!user || user.email !== 'aa.web.dev9777@gmail.com') {
                return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
            }
            targetUserEmail = userEmail;
        } else {
            // Regular user calling for themselves
            const user = await base44.auth.me();
            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            targetUserEmail = user.email;
        }

        if (!stockSymbols || stockSymbols.length !== 3) {
            return Response.json({ error: 'Must select exactly 3 stocks' }, { status: 400 });
        }

        // Get stock prices
        const stockPrices = await base44.asServiceRole.entities.StockPrice.list();
        const selectedStocks = [];

        // Get or create user account
        const accounts = await base44.asServiceRole.entities.UserAccount.filter({ created_by: targetUserEmail });
        let account;
        if (accounts.length === 0) {
            account = await base44.asServiceRole.entities.UserAccount.create({
                created_by: targetUserEmail,
                cash_balance: 10000
            });
        } else {
            account = accounts[0];
        }

        // Give 1 share of each stock
        for (const symbol of stockSymbols) {
            const stockPrice = stockPrices.find(sp => sp.symbol === symbol);
            if (!stockPrice) continue;

            // Check if user already has this stock
            const existingPortfolio = await base44.asServiceRole.entities.Portfolio.filter({ 
                created_by: targetUserEmail, 
                symbol: symbol 
            });

            if (existingPortfolio.length > 0) {
                // Update existing
                await base44.asServiceRole.entities.Portfolio.update(existingPortfolio[0].id, {
                    shares: existingPortfolio[0].shares + 1,
                    average_buy_price: ((existingPortfolio[0].shares * existingPortfolio[0].average_buy_price) + stockPrice.price_gbp) / (existingPortfolio[0].shares + 1)
                });
            } else {
                // Create new
                await base44.asServiceRole.entities.Portfolio.create({
                    created_by: targetUserEmail,
                    symbol: symbol,
                    company_name: symbol,
                    shares: 1,
                    average_buy_price: stockPrice.price_gbp
                });
            }

            // Record transaction
            await base44.asServiceRole.entities.Transaction.create({
                created_by: targetUserEmail,
                symbol: symbol,
                company_name: symbol,
                type: 'buy',
                shares: 1,
                price_per_share: 0,
                total_amount: 0
            });

            selectedStocks.push({ symbol, price: stockPrice.price_gbp });
        }

        return Response.json({ 
            success: true, 
            message: `Received 3 free stocks`,
            stocks: selectedStocks 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});