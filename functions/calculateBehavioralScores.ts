import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function calculateEngagementScore(user, transactions, sessions) {
  // Factors: trade frequency, session count, time spent
  const recentTrades = transactions.filter(t => {
    const daysSince = (Date.now() - new Date(t.created_date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }).length;
  
  const tradeScore = Math.min(recentTrades * 5, 50); // Max 50 points
  const sessionScore = Math.min(sessions * 3, 30); // Max 30 points
  const consistencyScore = sessions > 4 ? 20 : sessions * 5; // Max 20 points
  
  return Math.min(tradeScore + sessionScore + consistencyScore, 100);
}

function calculateStreakStrength(rank, transactions) {
  const winStreak = rank?.win_streak || 0;
  const totalTrades = transactions.length;
  
  if (totalTrades === 0) return 0;
  
  const streakRatio = winStreak / Math.max(totalTrades, 1);
  return Math.min(streakRatio * 100 + winStreak * 2, 100);
}

function calculateUpgradeProbability(behavior, user, aiChecks) {
  let score = 0;
  
  // High engagement = higher probability
  if (behavior.engagement_score > 70) score += 0.3;
  
  // Frequent AI panel checks
  if (aiChecks >= 3) score += 0.25;
  
  // Active sessions
  if (behavior.session_count_7d >= 5) score += 0.2;
  
  // Competitive drive
  if (behavior.competitive_drive_index > 60) score += 0.15;
  
  // Streak strength
  if (behavior.streak_strength_index > 50) score += 0.1;
  
  return Math.min(score, 1.0);
}

function calculateChurnRisk(behavior, lastActive, performance) {
  let risk = 0;
  
  // Days since last active
  const daysSince = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 3) risk += 0.3;
  if (daysSince > 7) risk += 0.3;
  
  // Low engagement
  if (behavior.engagement_score < 30) risk += 0.2;
  
  // Losing performance
  if (performance < -10) risk += 0.15;
  
  // Low session frequency
  if (behavior.session_count_7d < 2) risk += 0.2;
  
  return Math.min(risk, 1.0);
}

function determineBehavioralState(scores, performance, transactions) {
  const recentWins = transactions.slice(0, 5).filter(t => {
    return t.type === 'sell' && t.total_amount > 0;
  }).length;
  
  if (scores.engagement_score > 80 && performance > 15) return 'dominating';
  if (scores.upgrade_probability_score > 0.7) return 'high_potential';
  if (scores.churn_risk_score > 0.6) return 'dormant';
  if (performance < -10 || recentWins < 2) return 'struggling';
  return 'stable';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }
    
    // Get all users and their data
    const [vtmUsers, allAccounts, allPortfolios, allTransactions, allRanks, allBehaviors] = await Promise.all([
      base44.asServiceRole.entities.VTMUser.list(),
      base44.asServiceRole.entities.UserAccount.list(),
      base44.asServiceRole.entities.Portfolio.list(),
      base44.asServiceRole.entities.Transaction.list('-created_date', 1000),
      base44.asServiceRole.entities.TraderRank.list(),
      base44.asServiceRole.entities.UserBehavior.list()
    ]);
    
    const updates = [];
    
    for (const vtmUser of vtmUsers) {
      const account = allAccounts.find(a => a.created_by === vtmUser.id);
      const portfolio = allPortfolios.filter(p => p.created_by === vtmUser.id);
      const transactions = allTransactions.filter(t => t.created_by === vtmUser.id);
      const rank = allRanks.find(r => r.user_id === vtmUser.id);
      let behavior = allBehaviors.find(b => b.user_id === vtmUser.id);
      
      if (!account) continue;
      
      // Calculate performance
      const totalValue = account.cash_balance + portfolio.reduce((sum, h) => sum + (h.shares * h.average_buy_price), 0);
      const performance = ((totalValue - 10000) / 10000) * 100;
      
      // Mock session data (would come from analytics)
      const sessions7d = Math.floor(Math.random() * 10);
      const aiChecks = Math.floor(Math.random() * 5);
      
      // Calculate scores
      const engagementScore = calculateEngagementScore(vtmUser, transactions, sessions7d);
      const streakStrength = calculateStreakStrength(rank, transactions);
      const competitiveDrive = Math.min(rank?.elo_rating || 1000, 100);
      
      const scores = {
        engagement_score: engagementScore,
        streak_strength_index: streakStrength,
        competitive_drive_index: competitiveDrive,
        upgrade_probability_score: 0,
        churn_risk_score: 0
      };
      
      scores.upgrade_probability_score = calculateUpgradeProbability(scores, vtmUser, aiChecks);
      scores.churn_risk_score = calculateChurnRisk(scores, vtmUser.updated_date, performance);
      
      const state = determineBehavioralState(scores, performance, transactions);
      
      // Update or create behavior record
      const behaviorData = {
        user_id: vtmUser.id,
        ...scores,
        behavioral_state: state,
        last_active: vtmUser.updated_date,
        ai_panel_checks: aiChecks,
        session_count_7d: sessions7d,
        avg_session_duration: 15 + Math.random() * 20
      };
      
      if (behavior) {
        await base44.asServiceRole.entities.UserBehavior.update(behavior.id, behaviorData);
      } else {
        await base44.asServiceRole.entities.UserBehavior.create(behaviorData);
      }
      
      updates.push({
        username: vtmUser.username,
        state,
        engagement: engagementScore.toFixed(1),
        churn_risk: (scores.churn_risk_score * 100).toFixed(1),
        upgrade_prob: (scores.upgrade_probability_score * 100).toFixed(1)
      });
    }
    
    return Response.json({ 
      success: true,
      message: 'Behavioral scores calculated',
      updates
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});