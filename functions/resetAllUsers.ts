import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Delete all entities
    const accounts = await base44.asServiceRole.entities.UserAccount.list();
    const portfolios = await base44.asServiceRole.entities.Portfolio.list();
    const transactions = await base44.asServiceRole.entities.Transaction.list();
    const alerts = await base44.asServiceRole.entities.PriceAlert.list();
    const watchlists = await base44.asServiceRole.entities.Watchlist.list();
    const history = await base44.asServiceRole.entities.PortfolioHistory.list();
    const posts = await base44.asServiceRole.entities.SocialPost.list();
    const likes = await base44.asServiceRole.entities.PostLike.list();
    const copyTrades = await base44.asServiceRole.entities.CopyTrade.list();
    const vtmUsers = await base44.asServiceRole.entities.VTMUser.list();

    // Delete in batches
    for (const item of accounts) await base44.asServiceRole.entities.UserAccount.delete(item.id);
    for (const item of portfolios) await base44.asServiceRole.entities.Portfolio.delete(item.id);
    for (const item of transactions) await base44.asServiceRole.entities.Transaction.delete(item.id);
    for (const item of alerts) await base44.asServiceRole.entities.PriceAlert.delete(item.id);
    for (const item of watchlists) await base44.asServiceRole.entities.Watchlist.delete(item.id);
    for (const item of history) await base44.asServiceRole.entities.PortfolioHistory.delete(item.id);
    for (const item of posts) await base44.asServiceRole.entities.SocialPost.delete(item.id);
    for (const item of likes) await base44.asServiceRole.entities.PostLike.delete(item.id);
    for (const item of copyTrades) await base44.asServiceRole.entities.CopyTrade.delete(item.id);
    for (const item of vtmUsers) await base44.asServiceRole.entities.VTMUser.delete(item.id);

    return Response.json({ 
      success: true,
      message: 'All user data deleted successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});