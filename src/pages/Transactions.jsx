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
      const userTxns = await base44.entities.Transaction.filter({ created_by: currentUser?.email }, '-created_date', 50);
      const receivedTxns = await base44.asServiceRole.entities.Transaction.filter({ created_by: currentUser?.email }, '-created_date', 50);
      const combined = [...userTxns, ...receivedTxns];
      return combined.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 50);
    },
    enabled: !!currentUser?.email,
    refetchInterval: 3000,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-violet-600" />
          Transaction History
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          All your trades and transfers
        </p>
      </motion.div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400 mt-1">Start trading to see your history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.symbol === 'TRANSFER'
                            ? transaction.type === 'buy'
                              ? 'bg-blue-100'
                              : 'bg-orange-100'
                            : transaction.symbol === 'COPY'
                              ? transaction.type === 'buy'
                                ? 'bg-violet-100'
                                : 'bg-purple-100'
                            : transaction.type === 'buy' 
                              ? 'bg-green-100' 
                              : 'bg-red-100'
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
                            <h3 className="font-bold text-gray-900">
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
                          <p className="text-sm text-gray-500">{transaction.company_name}</p>
                          {transaction.symbol !== 'TRANSFER' && transaction.symbol !== 'COPY' && (
                            <p className="text-xs text-gray-400 mt-1">
                              {transaction.shares?.toLocaleString()} shares @ £{transaction.price_per_share?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'buy' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'buy' ? '-' : '+'}£{transaction.total_amount?.toLocaleString('en-GB', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
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