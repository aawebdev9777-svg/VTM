import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get all unique stocks from portfolios
        const portfolios = await base44.asServiceRole.entities.Portfolio.list();
        
        if (!portfolios || portfolios.length === 0) {
            return Response.json({ 
                message: 'No stocks to update',
                updated: 0
            });
        }
        
        // Get unique symbols
        const uniqueSymbols = [...new Set(portfolios.map(p => p.symbol))];
        
        const updates = [];
        
        // Fetch current prices for all unique stocks
        for (const symbol of uniqueSymbols) {
            try {
                const stockData = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `Get the current live stock price for ${symbol}. Return only the current price in USD as a number and the percentage change today. Use real-time market data.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            price_usd: { type: "number" },
                            daily_change_percent: { type: "number" }
                        }
                    }
                });
                
                const gbpRate = 0.79;
                updates.push({
                    symbol,
                    price_gbp: stockData.price_usd * gbpRate,
                    price_usd: stockData.price_usd,
                    daily_change_percent: stockData.daily_change_percent,
                    updated_at: new Date().toISOString()
                });
            } catch (error) {
                console.error(`Failed to update ${symbol}:`, error.message);
            }
        }
        
        // Store updates in StockPrice entity
        if (updates.length > 0) {
            for (const update of updates) {
                // Check if price exists
                const existing = await base44.asServiceRole.entities.StockPrice.filter({
                    symbol: update.symbol
                });
                
                if (existing.length > 0) {
                    await base44.asServiceRole.entities.StockPrice.update(existing[0].id, update);
                } else {
                    await base44.asServiceRole.entities.StockPrice.create(update);
                }
            }
        }
        
        return Response.json({ 
            message: 'Stock prices updated successfully',
            updated: updates.length,
            stocks: updates
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});