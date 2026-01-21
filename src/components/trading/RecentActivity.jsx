import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecentActivity() {
  const { data: transactions = [] } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => base44.asServiceRole.entities.Transaction.list('-created_date', 20),
    refetchInterval: 2000,
  });

  const recentTxns = transactions.slice(0, 10);

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          Live Trades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentTxns.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No trades yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentTxns.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {tx.type === 'buy' ? (
                    <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{tx.symbol}</div>
                    <div className="text-xs text-gray-500">{tx.shares} shares @ £{tx.price_per_share.toFixed(2)}</div>
                  </div>
                </div>
                <Badge variant={tx.type === 'buy' ? 'default' : 'outline'} className="text-xs flex-shrink-0">
                  {tx.type.toUpperCase()}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}