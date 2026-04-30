import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Send, TrendingUp, DollarSign, Loader2, Search } from 'lucide-react';

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMsg, setTransferMsg] = useState('');
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

  const { data: transactions = [] } = useQuery({
    queryKey: ['allTx', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ created_by: user.email }, '-created_date', 20),
    enabled: !!user?.email,
    refetchInterval: 8000,
  });

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: async () => {
      try { const r = await base44.functions.invoke('getUpdatedPrices', {}); return r.data.prices || []; }
      catch { return base44.entities.StockPrice.list(); }
    },
    refetchInterval: 10000,
  });

  const { data: copyTrades = [] } = useQuery({
    queryKey: ['copyTrades', user?.email],
    queryFn: () => base44.entities.CopyTrade.filter({ follower_email: user?.email, is_active: true }),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const transferMutation = useMutation({
    mutationFn: async ({ toEmail, amount }) => {
      const r = await base44.functions.invoke('transferMoney', { to_email: toEmail, amount });
      if (!r.data.success) throw new Error(r.data.error || 'Transfer failed');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['account'] });
      setTransferMsg('Transfer successful!');
      setTransferEmail(''); setTransferAmount('');
      setTimeout(() => setTransferMsg(''), 3000);
    },
    onError: (e) => { setTransferMsg(e.message); setTimeout(() => setTransferMsg(''), 3000); },
  });

  const account = accounts[0];
  const cash = account?.cash_balance || 0;
  const portfolioValue = portfolio.reduce((s, h) => {
    const sp = stockPrices.find(p => p.symbol === h.symbol);
    return s + h.shares * (sp?.price_gbp || h.average_buy_price);
  }, 0);
  const copyTradeValue = copyTrades.reduce((s, ct) => s + (ct.investment_amount || 0), 0);
  const total = cash + portfolioValue + copyTradeValue;
  const pnl = total - (account?.initial_balance || 10000);
  const pnlPct = (pnl / (account?.initial_balance || 10000)) * 100;

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white mb-6 flex items-center gap-2">
        <WalletIcon className="w-6 h-6 text-amber-500" /> Wallet
      </motion.h1>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-amber-500/20 via-[#141925] to-[#141925] border border-amber-500/20 rounded-2xl p-6 mb-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-slate-400 text-sm mb-2">Total Net Worth</p>
        <p className="text-4xl font-black text-white mb-1">£{total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className={`text-sm font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {pnl >= 0 ? '+' : ''}£{Math.abs(pnl).toFixed(2)} ({pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%) from start
        </p>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/5">
          {[
            { label: 'Cash', value: `£${cash.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: 'Stocks', value: `£${portfolioValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: 'Copy Trades', value: `£${copyTradeValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-base font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Transfer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[#141925] border border-white/5 rounded-2xl p-4 mb-6">
        <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><Send className="w-4 h-4 text-amber-500" />Send Cash</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={transferEmail} onChange={e => setTransferEmail(e.target.value)} placeholder="Recipient email"
            className="flex-1 bg-[#0d1220] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:border-amber-500/40" />
          <input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="Amount (£)" min="1"
            className="w-full sm:w-36 bg-[#0d1220] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:border-amber-500/40" />
          <button
            onClick={() => transferMutation.mutate({ toEmail: transferEmail, amount: parseFloat(transferAmount) })}
            disabled={!transferEmail || !transferAmount || transferMutation.isPending}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
            {transferMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
          </button>
        </div>
        {transferMsg && (
          <p className={`text-xs mt-2 font-medium ${transferMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{transferMsg}</p>
        )}
      </motion.div>

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-[#141925] border border-white/5 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-slate-300 mb-3">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-1.5">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                    tx.type === 'buy' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                  }`}>
                    {tx.type === 'buy' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{tx.symbol} <span className="text-slate-500 font-normal text-xs">· {tx.type.toUpperCase()}</span></p>
                    <p className="text-xs text-slate-500">{tx.shares} shares @ £{tx.price_per_share?.toFixed(2)}</p>
                  </div>
                </div>
                <p className={`text-sm font-black ${tx.type === 'buy' ? 'text-red-400' : 'text-green-400'}`}>
                  {tx.type === 'buy' ? '-' : '+'}£{tx.total_amount?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}