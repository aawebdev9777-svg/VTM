import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, Loader2, X } from 'lucide-react';

export default function Portfolio() {
  const [user, setUser] = useState(null);
  const [sellTarget, setSellTarget] = useState(null);
  const [sellShares, setSellShares] = useState('');
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => { if (!u) base44.auth.redirectToLogin(); else setUser(u); }).catch(() => base44.auth.redirectToLogin());
  }, []);

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

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: async () => {
      try { const r = await base44.functions.invoke('getUpdatedPrices', {}); return r.data.prices || []; }
      catch { return base44.entities.StockPrice.list(); }
    },
    refetchInterval: 6000,
  });

  const { data: copyTrades = [] } = useQuery({
    queryKey: ['copyTrades', user?.email],
    queryFn: () => base44.entities.CopyTrade.filter({ follower_email: user.email, is_active: true }),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const r = await base44.functions.invoke('getLeaderboard', {});
      return r.data.leaderboard || [];
    },
    refetchInterval: 15000,
  });

  const account = accounts[0];

  const sellMutation = useMutation({
    mutationFn: async ({ holding, shares }) => {
      const sp = stockPrices.find(p => p.symbol === holding.symbol);
      const price = Number(sp?.price_gbp) || Number(holding.average_buy_price) || 0;
      const sharesNum = Number(shares) || 0;
      const total = sharesNum * price;
      const currentCash = Number(account.cash_balance) || 0;
      const currentShares = Number(holding.shares) || 0;
      await base44.entities.UserAccount.update(account.id, { cash_balance: currentCash + total });
      if (sharesNum >= currentShares) {
        await base44.entities.Portfolio.delete(holding.id);
      } else {
        await base44.entities.Portfolio.update(holding.id, { shares: currentShares - sharesNum });
      }
      await base44.entities.Transaction.create({
        symbol: holding.symbol, company_name: holding.company_name,
        type: 'sell', shares: sharesNum, price_per_share: price, total_amount: total
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      qc.invalidateQueries({ queryKey: ['account'] });
      setSellTarget(null); setSellShares('');
    },
  });

  const stopCopyMutation = useMutation({
    mutationFn: async (ct) => {
      const leader = leaderboard.find(l => l.email === ct.leader_email);
      const invested = Number(ct.investment_amount) || 0;
      const leaderReturn = Number(leader?.percentageReturn) || 0;
      const val = invested * (1 + leaderReturn / 100);
      const currentCash = Number(account.cash_balance) || 0;
      await base44.entities.CopyTrade.update(ct.id, { is_active: false });
      await base44.entities.UserAccount.update(account.id, { cash_balance: currentCash + val });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['copyTrades'] });
      qc.invalidateQueries({ queryKey: ['account'] });
    },
  });

  const portfolioWithMetrics = portfolio.map(h => {
    const sp = stockPrices.find(p => p.symbol === h.symbol);
    const price = Number(sp?.price_gbp) || Number(h.average_buy_price) || 0;
    const shares = Number(h.shares) || 0;
    const avgBuy = Number(h.average_buy_price) || 0;
    const value = shares * price;
    const cost = shares * avgBuy;
    const pnl = value - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    const dividendYield = Number(sp?.dividend_yield_hourly) || 0;
    const hourlyDiv = value * (dividendYield / 100);
    return { ...h, price, value, cost, pnl, pnlPct, hourlyDiv };
  });

  const totalValue = portfolioWithMetrics.reduce((s, h) => s + (h.value || 0), 0);
  const totalCost = portfolioWithMetrics.reduce((s, h) => s + (h.cost || 0), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const totalHourlyDiv = portfolioWithMetrics.reduce((s, h) => s + (h.hourlyDiv || 0), 0);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white mb-6 flex items-center gap-2">
        <BarChart2 className="w-6 h-6 text-amber-500" /> Portfolio
      </motion.h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Holdings Value', value: `£${(totalValue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: 'Total P/L', value: `${totalPnl >= 0 ? '+' : ''}£${(Math.abs(totalPnl) || 0).toFixed(2)}`, color: totalPnl >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Return', value: `${totalPnlPct >= 0 ? '+' : ''}${(totalPnlPct || 0).toFixed(2)}%`, color: totalPnlPct >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Hourly Dividends', value: `£${(totalHourlyDiv || 0).toFixed(4)}/hr`, color: 'text-amber-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-[#141925] border border-white/5 rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-base font-black ${s.color || 'text-white'}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Copy Trades */}
      {copyTrades.length > 0 && (
        <div className="bg-[#141925] border border-white/5 rounded-2xl p-4 mb-6">
          <h2 className="text-sm font-bold text-slate-300 mb-3">Copy Trading Positions</h2>
          <div className="space-y-2">
            {copyTrades.map(ct => {
              const leader = leaderboard.find(l => l.email === ct.leader_email);
              const invested = Number(ct.investment_amount) || 0;
              const leaderReturn = Number(leader?.percentageReturn) || 0;
              const val = invested * (1 + leaderReturn / 100);
              const pnl = val - invested;
              return (
                <div key={ct.id} className="flex items-center justify-between p-3 bg-[#0d1220] rounded-xl border border-white/5">
                  <div>
                    <p className="font-bold text-white text-sm">Copying {ct.leader_email.split('@')[0]}</p>
                    <p className="text-xs text-slate-500">Invested: £{(Number(ct.investment_amount) || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">£{(val || 0).toFixed(2)}</p>
                      <p className={`text-xs font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}£{(pnl || 0).toFixed(2)}</p>
                    </div>
                    <button onClick={() => stopCopyMutation.mutate(ct)} disabled={stopCopyMutation.isPending}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-1 rounded-lg transition-colors">
                      Stop
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-[#141925] border border-white/5 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-slate-300 mb-3">Stock Holdings</h2>
        {portfolioWithMetrics.length === 0 ? (
          <div className="text-center py-12">
            <BarChart2 className="w-12 h-12 mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500">No holdings yet — start trading on the Home page</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-white/5">
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium text-right">Shares</th>
                  <th className="pb-3 font-medium text-right">Avg Cost</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium text-right">Value</th>
                  <th className="pb-3 font-medium text-right">P/L</th>
                  <th className="pb-3 font-medium text-right">Div/hr</th>
                  <th className="pb-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {portfolioWithMetrics.map((h, i) => (
                  <motion.tr key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-3">
                      <p className="font-bold text-white">{h.symbol}</p>
                      <p className="text-xs text-slate-500">{h.company_name}</p>
                    </td>
                    <td className="py-3 text-right text-slate-300">{(h.shares || 0).toLocaleString()}</td>
                    <td className="py-3 text-right text-slate-300">£{(Number(h.average_buy_price) || 0).toFixed(2)}</td>
                    <td className="py-3 text-right text-slate-300">£{(h.price || 0).toFixed(2)}</td>
                    <td className="py-3 text-right font-bold text-white">£{(h.value || 0).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <p className={`font-bold ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{h.pnl >= 0 ? '+' : ''}£{(h.pnl || 0).toFixed(2)}</p>
                      <p className={`text-xs ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{h.pnlPct >= 0 ? '+' : ''}{(h.pnlPct || 0).toFixed(2)}%</p>
                    </td>
                    <td className="py-3 text-right text-amber-400 text-xs font-semibold">£{(h.hourlyDiv || 0).toFixed(4)}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => { setSellTarget(h); setSellShares(''); }}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-1 rounded-lg transition-colors">
                        Sell
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sell Modal */}
      <AnimatePresence>
        {sellTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) { setSellTarget(null); setSellShares(''); } }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#141925] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-white text-lg">Sell {sellTarget.symbol}</h3>
                <button onClick={() => setSellTarget(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-slate-400 text-sm mb-1">Owned: {sellTarget.shares} shares</p>
              <p className="text-slate-400 text-sm mb-4">Price: £{(Number(sellTarget.price) || 0).toFixed(2)}</p>
              <input
                type="number" value={sellShares} onChange={e => setSellShares(e.target.value)}
                placeholder="Shares to sell" min="1" max={sellTarget.shares}
                className="w-full bg-[#0d1220] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 outline-none focus:border-amber-500/40 mb-3"
              />
              {sellShares && <p className="text-slate-400 text-sm mb-3">Total: £{(parseFloat(sellShares) * (sellTarget.price || 0)).toFixed(2)}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => sellMutation.mutate({ holding: sellTarget, shares: parseFloat(sellShares) })}
                  disabled={!sellShares || parseFloat(sellShares) <= 0 || parseFloat(sellShares) > sellTarget.shares || sellMutation.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  {sellMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Sell'}
                </button>
                <button
                  onClick={() => sellMutation.mutate({ holding: sellTarget, shares: sellTarget.shares })}
                  disabled={sellMutation.isPending}
                  className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Sell All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}