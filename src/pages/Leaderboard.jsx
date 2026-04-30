import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Copy, Users, Loader2 } from 'lucide-react';

const TIER_CONFIG = {
  Titan:    { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', icon: '🏆' },
  Diamond:  { color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/20',   icon: '💎' },
  Platinum: { color: 'text-slate-300',  bg: 'bg-slate-300/10',  border: 'border-slate-300/20',  icon: '⚡' },
  Gold:     { color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  icon: '🥇' },
  Silver:   { color: 'text-slate-400',  bg: 'bg-slate-400/10',  border: 'border-slate-400/20',  icon: '🥈' },
  Bronze:   { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', icon: '🥉' },
};

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [copyAmount, setCopyAmount] = useState('');
  const [copyTarget, setCopyTarget] = useState(null);
  const [postContent, setPostContent] = useState('');
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => { if (!u) base44.auth.redirectToLogin(); else setUser(u); }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const r = await base44.functions.invoke('getLeaderboard', {});
      return r.data.leaderboard || [];
    },
    refetchInterval: 15000,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.SocialPost.list('-created_date', 30),
    refetchInterval: 10000,
  });

  const { data: myAccount = [] } = useQuery({
    queryKey: ['account', user?.email],
    queryFn: () => base44.entities.UserAccount.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const { data: activeCopyTrades = [] } = useQuery({
    queryKey: ['copyTrades', user?.email],
    queryFn: () => base44.entities.CopyTrade.filter({ follower_email: user.email, is_active: true }),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const startCopyMutation = useMutation({
    mutationFn: async ({ leaderEmail, amount }) => {
      const r = await base44.functions.invoke('startCopyTrade', { leader_email: leaderEmail, investment_amount: amount });
      if (!r.data.success) throw new Error(r.data.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['copyTrades'] });
      qc.invalidateQueries({ queryKey: ['account'] });
      setCopyTarget(null); setCopyAmount('');
    },
  });

  const postMutation = useMutation({
    mutationFn: () => base44.entities.SocialPost.create({ content: postContent, post_type: 'insight', likes: 0 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['posts'] }); setPostContent(''); },
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => base44.entities.SocialPost.update(post.id, { likes: (post.likes || 0) + 1 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });

  const account = myAccount[0];
  const isAlreadyCopying = (email) => activeCopyTrades.some(ct => ct.leader_email === email);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-amber-500" /> Community
      </motion.h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#141925] border border-white/5 rounded-xl p-1 mb-6 w-fit">
        {['leaderboard', 'social'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'leaderboard' && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((trader, i) => {
                const tier = TIER_CONFIG[trader.tier] || TIER_CONFIG.Bronze;
                const isMe = trader.email === user?.email;
                const alreadyCopying = isAlreadyCopying(trader.email);
                return (
                  <motion.div key={trader.email} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      isMe ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#141925] border-white/5 hover:border-white/10'
                    }`}>
                    <div className="w-8 text-center font-black text-lg">{i < 3 ? medals[i] : <span className="text-slate-500 text-sm">#{i + 1}</span>}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-black text-sm ${isMe ? 'text-amber-400' : 'text-white'}`}>{trader.displayName || trader.email.split('@')[0]}{isMe && ' (You)'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${tier.bg} ${tier.color} ${tier.border}`}>{tier.icon} {trader.tier}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">£{(trader.totalValue || 0).toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-base ${(trader.percentageReturn || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(trader.percentageReturn || 0) >= 0 ? '+' : ''}{(trader.percentageReturn || 0).toFixed(2)}%
                      </p>
                      {!isMe && !alreadyCopying && (
                        <button onClick={() => setCopyTarget(trader)}
                          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-1 ml-auto transition-colors">
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      )}
                      {alreadyCopying && <p className="text-xs text-green-400 mt-1">Copying ✓</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-4">
          {/* Post box */}
          <div className="bg-[#141925] border border-white/5 rounded-2xl p-4">
            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Share a trade insight, achievement, or market thought..."
              rows={3}
              className="w-full bg-[#0d1220] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 outline-none focus:border-amber-500/40 resize-none mb-3"
            />
            <div className="flex justify-end">
              <button onClick={() => postMutation.mutate()} disabled={!postContent.trim() || postMutation.isPending}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-5 py-2 rounded-xl text-sm transition-colors">
                {postMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
              </button>
            </div>
          </div>

          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-[#141925] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
                    {(post.created_by || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{(post.created_by || 'anon').split('@')[0]}</p>
                    <p className="text-xs text-slate-500">{post.post_type}</p>
                  </div>
                </div>
                <button onClick={() => likeMutation.mutate(post)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors">
                  ❤️ <span>{post.likes || 0}</span>
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{post.content}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Copy Trade Modal */}
      {copyTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setCopyTarget(null); }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141925] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-black text-white text-lg mb-1">Copy {copyTarget.displayName || copyTarget.email.split('@')[0]}</h3>
            <p className="text-slate-400 text-sm mb-4">Return: <span className="text-green-400 font-bold">{(copyTarget.percentageReturn || 0).toFixed(2)}%</span></p>
            <p className="text-slate-400 text-xs mb-1">Available: £{(account?.cash_balance || 0).toFixed(2)}</p>
            <input type="number" value={copyAmount} onChange={e => setCopyAmount(e.target.value)}
              placeholder="Amount to allocate (GBP)" min="100"
              className="w-full bg-[#0d1220] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 outline-none focus:border-amber-500/40 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setCopyTarget(null)} className="flex-1 border border-white/10 text-slate-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors">Cancel</button>
              <button
                onClick={() => startCopyMutation.mutate({ leaderEmail: copyTarget.email, amount: parseFloat(copyAmount) })}
                disabled={!copyAmount || parseFloat(copyAmount) <= 0 || startCopyMutation.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
                {startCopyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Start Copying'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}