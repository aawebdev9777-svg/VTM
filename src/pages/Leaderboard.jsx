import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Crown, Medal, Award, Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [copyAmount, setCopyAmount] = useState('');
  const [selectedLeader, setSelectedLeader] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getLeaderboard', {});
      return response.data.leaderboard || [];
    },
    refetchInterval: 5000,
  });

  const { data: myCopyTrades = [] } = useQuery({
    queryKey: ['myCopyTrades', currentUser?.email],
    queryFn: () => base44.entities.CopyTrade.filter({ follower_email: currentUser?.email }),
    enabled: !!currentUser?.email,
  });

  const startCopyTradeMutation = useMutation({
    mutationFn: async ({ leaderEmail, amount }) => {
      return base44.entities.CopyTrade.create({
        follower_email: currentUser.email,
        leader_email: leaderEmail,
        investment_amount: amount,
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCopyTrades'] });
      setCopyAmount('');
      setSelectedLeader(null);
    },
  });

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return null;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300";
    if (rank === 2) return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300";
    if (rank === 3) return "bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300";
    return "border-gray-200";
  };

  const isCopying = (leaderEmail) => {
    return myCopyTrades.some(ct => ct.leader_email === leaderEmail && ct.is_active);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Top traders - copy their trades automatically</p>
      </motion.div>

      {myCopyTrades.filter(ct => ct.is_active).length > 0 && (
        <Card className="border-0 shadow-lg mb-6 bg-violet-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-violet-900 mb-2">Active Copy Trades</p>
            <div className="space-y-2">
              {myCopyTrades.filter(ct => ct.is_active).map(ct => (
                <div key={ct.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Copying {ct.leader_email.split('@')[0]}</span>
                  <span className="font-bold text-violet-600">£{ct.investment_amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="divide-y">
            {leaderboard.map((trader, index) => {
              const rank = index + 1;
              const isCurrentUser = trader.email === currentUser?.email;
              const copying = isCopying(trader.email);

              return (
                <motion.div
                  key={trader.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`p-4 ${getRankClass(rank)} ${
                    isCurrentUser ? 'ring-2 ring-violet-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm font-bold text-gray-700">
                      {getMedalIcon(rank) || `#${rank}`}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {trader.email.split('@')[0]}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        {copying && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                            Copying
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Balance: £{trader.balance.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        £{trader.totalValue.toFixed(2)}
                      </p>
                      <p className={`text-xs font-semibold ${
                        trader.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trader.percentageReturn >= 0 ? '+' : ''}{trader.percentageReturn.toFixed(2)}%
                      </p>
                    </div>

                    {!isCurrentUser && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant={copying ? "outline" : "default"}
                            size="sm"
                            disabled={copying}
                            className="gap-2"
                            onClick={() => setSelectedLeader(trader)}
                          >
                            <Copy className="w-4 h-4" />
                            {copying ? 'Copying' : 'Copy'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Copy {trader.email.split('@')[0]}'s Trades</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-4">
                                Allocate funds to automatically copy all future trades made by this trader.
                              </p>
                              <div className="bg-violet-50 p-4 rounded-lg mb-4">
                                <p className="text-sm font-semibold text-violet-900">
                                  {trader.email.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Performance: {trader.percentageReturn >= 0 ? '+' : ''}{trader.percentageReturn.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Investment Amount (£)</label>
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                value={copyAmount}
                                onChange={(e) => setCopyAmount(e.target.value)}
                                min="1"
                              />
                            </div>
                            <Button
                              onClick={() => startCopyTradeMutation.mutate({ 
                                leaderEmail: trader.email, 
                                amount: parseFloat(copyAmount) 
                              })}
                              disabled={!copyAmount || parseFloat(copyAmount) <= 0 || startCopyTradeMutation.isPending}
                              className="w-full bg-violet-600 hover:bg-violet-700"
                            >
                              {startCopyTradeMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Starting...
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Start Copy Trading
                                </>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}