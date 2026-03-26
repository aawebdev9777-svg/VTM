import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';

export default function Transactions() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const txns = await base44.entities.Transaction.filter(
        { created_by: currentUser?.email },
        '-created_date',
        100
      );
      return txns;
    },
    enabled: !!currentUser?.email,
    refetchInterval: 15000,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-amber-500" />
          Transaction History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          All your trades and transfers
        </p>
      </motion.div>

        <Card className="border border-slate-700 shadow-lg bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">No transactions yet</p>
                <p className="text-sm text-slate-500 mt-1">Start trading to see your history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-700/30 transition-colors border border-slate-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.symbol === 'TRANSFER'
                            ? transaction.type === 'buy'
                              ? 'bg-blue-900/40'
                              : 'bg-orange-900/40'
                            : transaction.symbol === 'DIVIDEND'
                              ? 'bg-amber-900/40'
                            : transaction.symbol === 'COPY' || transaction.symbol === 'COPY_EXIT'
                              ? 'bg-violet-900/40'
                            : transaction.type === 'buy' 
                              ? 'bg-green-900/40' 
                              : 'bg-red-900/40'
                        }`}>
                          {transaction.symbol === 'TRANSFER' ? (
                            transaction.type === 'buy' ? (
                              <TrendingUp className="w-5 h-5 text-blue-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-orange-600" />
                            )
                          ) : transaction.symbol === 'COPY' ? (
                            transaction.type === 'buy' ? (
                              <TrendingUp className="w-5 h-5 text-violet-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-purple-600" />
                            )
                          ) : transaction.type === 'buy' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white">
                              {transaction.symbol === 'TRANSFER' 
                                ? (transaction.type === 'buy' ? '↓ Received' : '↑ Sent')
                                : transaction.symbol
                              }
                            </h3>
                            <Badge variant={
                              transaction.symbol === 'TRANSFER'
                                ? transaction.type === 'buy' ? 'secondary' : 'outline'
                                : transaction.type === 'buy' ? 'default' : 'destructive'
                            } className="uppercase">
                              {transaction.symbol === 'TRANSFER' 
                                ? (transaction.type === 'buy' ? 'Received' : 'Sent')
                                : transaction.type
                              }
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">{transaction.company_name}</p>
                          {transaction.symbol !== 'TRANSFER' && transaction.symbol !== 'COPY' && (
                            <p className="text-xs text-slate-500 mt-1">
                              {transaction.shares > 0 ? `${transaction.shares?.toLocaleString()} shares @ £${transaction.price_per_share?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : transaction.company_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'buy' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {transaction.type === 'buy' ? '-' : '+'}£{transaction.total_amount?.toLocaleString('en-GB', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(new Date(transaction.created_date), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}