import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Search, X, ArrowUpRight, ArrowDownRight, Loader2, Zap } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [shares, setShares] = useState('');
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

  const { data: transactions = [] } = useQuery({
    queryKey: ['recentTx', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ created_by: user.email }, '-created_date', 8),
    enabled: !!user?.email,
    refetchInterval: 8000,
  });

  const account = accounts[0];
  const cash = Number(account?.cash_balance) || 0;
  const portfolioValue = portfolio.reduce((s, h) => {
    const sp = stockPrices.find(p => p.symbol === h.symbol);
    const price = Number(sp?.price_gbp) || Number(h.average_buy_price) || 0;
    return s + (Number(h.shares) || 0) * price;
  }, 0);
  const total = cash + portfolioValue;
  const initialBalance = Number(account?.initial_balance) || 10000;
  const pnl = total - initialBalance;
  const pnlPct = initialBalance > 0 ? (pnl / initialBalance) * 100 : 0;

  const buyMutation = useMutation({
    mutationFn: async ({ stock, shares }) => {
      const r = await base44.functions.invoke('buyStock', { stock, shares });
      if (!r.data.success) throw new Error(r.data.error || 'Failed');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['account'] });
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      qc.invalidateQueries({ queryKey: ['recentTx'] });
      setSelected(null); setShares('');
    },
  });

  const filtered = stockPrices.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    (s.company_name || '').toLowerCase().includes(search.toLowerCase())
  ).slice(0, 12);

  const topMovers = [...stockPrices].sort((a, b) => Math.abs(b.daily_change_percent || 0) - Math.abs(a.daily_change_percent || 0)).slice(0, 6);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Value', value: `£${(total || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: `${pnl >= 0 ? '+' : ''}${(pnlPct || 0).toFixed(2)}%`, positive: pnl >= 0 },
          { label: 'Cash', value: `£${(cash || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Available', positive: true },
          { label: 'Invested', value: `£${(portfolioValue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: `${portfolio.length} holdings`, positive: true },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-[#141925] border border-white/5 rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-lg font-black text-white truncate">{s.value}</p>
            <p className={`text-xs font-semibold mt-0.5 ${s.label === 'Total Value' ? (s.positive ? 'text-green-400' : 'text-red-400') : 'text-slate-400'}`}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Trade Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="bg-[#141925] border border-white/5 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" />Trade</h2>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stocks..."
                className="w-full bg-[#0d1220] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/40 transition-colors"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>}
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {(search ? filtered : topMovers).map(stock => (
                <button
                  key={stock.symbol}
                  onClick={() => { setSelected(stock); setShares(''); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    selected?.symbol === stock.symbol
                      ? 'bg-amber-500/15 border border-amber-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div>
                    <p className="font-bold text-white text-sm">{stock.symbol}</p>
                    <p className="text-xs text-slate-500">£{stock.price_gbp?.toFixed(2)}</p>
                  </div>
                  <div className={`text-sm font-bold flex items-center gap-0.5 ${(stock.daily_change_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(stock.daily_change_percent || 0) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(stock.daily_change_percent || 0).toFixed(2)}%
                  </div>
                </button>
              ))}
            </div>

            {/* Buy form */}
            <AnimatePresence>
              {selected && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-black text-white">{selected.symbol}</p>
                      <p className="text-xs text-slate-400">£{selected.price_gbp?.toFixed(2)} per share</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={shares}
                      onChange={e => setShares(e.target.value)}
                      placeholder="Shares"
                      min="1"
                      className="flex-1 bg-[#0d1220] border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/40"
                    />
                    <button
                      onClick={() => buyMutation.mutate({ stock: selected, shares: parseInt(shares) })}
                      disabled={!shares || buyMutation.isPending || (selected.price_gbp * parseInt(shares)) > cash}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {buyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Buy · £${(selected.price_gbp * (parseInt(shares) || 0)).toFixed(2)}`}
                    </button>
                  </div>
                  {shares && (selected.price_gbp * parseInt(shares)) > cash && (
                    <p className="text-xs text-red-400 mt-2">Insufficient funds</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent Transactions */}
          <div className="bg-[#141925] border border-white/5 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-slate-300 mb-3">Recent Activity</h2>
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-1.5">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${tx.type === 'buy' ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div>
                        <p className="text-sm font-semibold text-white">{tx.symbol}</p>
                        <p className="text-xs text-slate-500">{tx.shares} shares · {tx.type.toUpperCase()}</p>
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

        {/* Holdings */}
        <div className="lg:col-span-2">
          <div className="bg-[#141925] border border-white/5 rounded-2xl p-4 sticky top-20">
            <h2 className="text-sm font-bold text-slate-300 mb-3">Holdings</h2>
            {portfolio.length === 0 ? (
              <div className="text-center py-10">
                <TrendingUp className="w-10 h-10 mx-auto text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">No holdings yet</p>
                <p className="text-slate-600 text-xs mt-1">Search and buy your first stock</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {portfolio.map(h => {
                  const sp = stockPrices.find(p => p.symbol === h.symbol);
                  const price = Number(sp?.price_gbp) || Number(h.average_buy_price) || 0;
                  const shares = Number(h.shares) || 0;
                  const avgBuy = Number(h.average_buy_price) || 0;
                  const value = shares * price;
                  const cost = shares * avgBuy;
                  const pnl = value - cost;
                  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                  return (
                    <div key={h.id} className="flex items-center justify-between p-3 bg-[#0d1220] rounded-xl border border-white/5">
                      <div>
                        <p className="font-bold text-white text-sm">{h.symbol}</p>
                        <p className="text-xs text-slate-500">{h.shares} shares</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white text-sm">£{(value || 0).toFixed(2)}</p>
                        <p className={`text-xs font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}{(pnlPct || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}