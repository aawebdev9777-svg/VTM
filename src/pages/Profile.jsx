import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Edit2, TrendingUp, Crown, Loader2, Check } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => { if (!u) base44.auth.redirectToLogin(); else setUser(u); }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: vtmUsers = [] } = useQuery({
    queryKey: ['vtmUser', user?.email],
    queryFn: () => base44.entities.VTMUser.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['account', user?.email],
    queryFn: () => base44.entities.UserAccount.filter({ created_by: user.email }),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio', user?.email],
    queryFn: () => base44.entities.Portfolio.filter({ created_by: user.email }),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['allTx', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: async () => {
      try { const r = await base44.functions.invoke('getUpdatedPrices', {}); return r.data.prices || []; }
      catch { return base44.entities.StockPrice.list(); }
    },
    refetchInterval: 10000,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (vtmUsers[0]) {
        await base44.entities.VTMUser.update(vtmUsers[0].id, data);
      } else {
        await base44.entities.VTMUser.create({ ...data, username: user.email.split('@')[0], password_hash: 'n/a' });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vtmUser'] }); setEditing(false); },
  });

  const vtmUser = vtmUsers[0];
  const account = accounts[0];
  const portfolioValue = portfolio.reduce((s, h) => {
    const sp = stockPrices.find(p => p.symbol === h.symbol);
    return s + h.shares * (sp?.price_gbp || h.average_buy_price);
  }, 0);
  const total = (account?.cash_balance || 0) + portfolioValue;
  const pnl = total - (account?.initial_balance || 10000);
  const pnlPct = (pnl / (account?.initial_balance || 10000)) * 100;

  const BADGE_INFO = {
    first_trade: { label: 'First Trade', icon: '🚀' },
    risk_master: { label: 'Risk Master', icon: '⚡' },
    dip_hunter: { label: 'Dip Hunter', icon: '🎯' },
    dividend_king: { label: 'Dividend King', icon: '👑' },
    streak_5: { label: '5 Day Streak', icon: '🔥' },
    streak_10: { label: '10 Day Streak', icon: '🔥' },
    profit_1k: { label: '£1K Profit', icon: '💰' },
    profit_5k: { label: '£5K Profit', icon: '💎' },
    portfolio_titan: { label: 'Portfolio Titan', icon: '🏆' },
    social_star: { label: 'Social Star', icon: '⭐' },
    diamond_hands: { label: 'Diamond Hands', icon: '💎' },
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#141925] border border-white/5 rounded-2xl overflow-hidden mb-6">
        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${vtmUser?.banner_color || '#d97706'}, #0d1220)` }} />
        <div className="px-6 pb-6 -mt-10 relative">
          <div className="flex items-end justify-between mb-4">
            <div className="w-20 h-20 rounded-2xl bg-[#0d1220] border-4 border-[#141925] flex items-center justify-center text-2xl font-black text-amber-400 overflow-hidden">
              {vtmUser?.avatar_url ? <img src={vtmUser.avatar_url} alt="" className="w-full h-full object-cover" /> : (user.full_name || user.email).charAt(0).toUpperCase()}
            </div>
            {!editing ? (
              <button onClick={() => { setEditData({ display_name: vtmUser?.display_name || '', bio: vtmUser?.bio || '', banner_color: vtmUser?.banner_color || '#d97706', favorite_stock: vtmUser?.favorite_stock || '' }); setEditing(true); }}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-all">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="text-sm text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-all">Cancel</button>
                <button onClick={() => updateMutation.mutate(editData)} disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5 text-sm bg-amber-500 text-black font-bold px-3 py-1.5 rounded-lg transition-all">
                  {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Save</>}
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <input value={editData.display_name} onChange={e => setEditData({ ...editData, display_name: e.target.value })} placeholder="Display name"
                className="w-full bg-[#0d1220] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/40" />
              <textarea value={editData.bio} onChange={e => setEditData({ ...editData, bio: e.target.value })} placeholder="Bio..." rows={2}
                className="w-full bg-[#0d1220] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/40 resize-none" />
              <div className="flex gap-3">
                <input value={editData.favorite_stock} onChange={e => setEditData({ ...editData, favorite_stock: e.target.value.toUpperCase() })} placeholder="Fav stock (e.g. AAPL)"
                  className="flex-1 bg-[#0d1220] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/40" />
                <input type="color" value={editData.banner_color} onChange={e => setEditData({ ...editData, banner_color: e.target.value })}
                  className="w-12 h-10 rounded-xl border border-white/5 bg-transparent cursor-pointer" />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-white">{vtmUser?.display_name || user.full_name || user.email.split('@')[0]}</h1>
                {pnlPct > 50 && <Crown className="w-5 h-5 text-amber-500" />}
              </div>
              <p className="text-sm text-slate-400 mb-2">@{vtmUser?.username || user.email.split('@')[0]}</p>
              {vtmUser?.bio && <p className="text-sm text-slate-300">{vtmUser.bio}</p>}
              {vtmUser?.favorite_stock && <p className="text-xs text-amber-400 mt-2">💎 Favourite: {vtmUser.favorite_stock}</p>}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Portfolio', value: `£${total.toLocaleString('en-GB', { maximumFractionDigits: 0 })}` },
          { label: 'Return', value: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%`, color: pnlPct >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Trades', value: transactions.length },
          { label: 'Holdings', value: portfolio.length },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
            className="bg-[#141925] border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-xl font-black ${s.color || 'text-white'}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-[#141925] border border-white/5 rounded-2xl p-4 mb-6">
          <h2 className="text-sm font-bold text-slate-300 mb-3">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {achievements.map(a => {
              const info = BADGE_INFO[a.badge_type];
              return info ? (
                <span key={a.id} className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full">
                  {info.icon} {info.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-[#141925] border border-white/5 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-slate-300 mb-3">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${tx.type === 'buy' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm font-semibold text-white">{tx.symbol}</p>
                    <p className="text-xs text-slate-500">{tx.type.toUpperCase()} · {tx.shares} shares</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${tx.type === 'buy' ? 'text-red-400' : 'text-green-400'}`}>
                  {tx.type === 'buy' ? '-' : '+'}£{tx.total_amount?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}