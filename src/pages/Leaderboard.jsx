import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, Copy, Loader2, MessageSquare, Heart, Send, Lightbulb, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [copyAmount, setCopyAmount] = useState('');
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [selectedType, setSelectedType] = useState('insight');
  const [userBalance, setUserBalance] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: userAccount } = useQuery({
    queryKey: ['userAccount', currentUser?.email],
    queryFn: () => base44.entities.UserAccount.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
  });

  useEffect(() => {
    if (userAccount && userAccount[0]) {
      setUserBalance(userAccount[0].cash_balance || 0);
    }
  }, [userAccount]);

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
    refetchInterval: 5000,
  });

  const { data: copiers = [] } = useQuery({
    queryKey: ['copiers', currentUser?.email],
    queryFn: () => base44.entities.CopyTrade.filter({ leader_email: currentUser?.email, is_active: true }),
    enabled: !!currentUser?.email,
    refetchInterval: 5000,
  });

  const startCopyTradeMutation = useMutation({
    mutationFn: async ({ leaderEmail, amount }) => {
      // Deduct investment from user's cash balance
      if (userAccount && userAccount[0]) {
        await base44.entities.UserAccount.update(userAccount[0].id, {
          cash_balance: userAccount[0].cash_balance - amount
        });
      }

      // Create transaction record for copy trade
      await base44.entities.Transaction.create({
        symbol: 'COPY',
        company_name: `Copy Trading - ${leaderEmail.split('@')[0]}`,
        type: 'buy',
        shares: 0,
        price_per_share: 0,
        total_amount: amount
      });

      return base44.entities.CopyTrade.create({
        follower_email: currentUser.email,
        leader_email: leaderEmail,
        investment_amount: amount,
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCopyTrades'] });
      queryClient.invalidateQueries({ queryKey: ['userAccount'] });
      queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
      setCopyAmount('');
      setSelectedLeader(null);
    },
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['socialPosts'],
    queryFn: () => base44.entities.SocialPost.list('-created_date', 100),
    refetchInterval: 5000,
  });

  const { data: myLikes = [] } = useQuery({
    queryKey: ['myLikes', currentUser?.email],
    queryFn: () => base44.entities.PostLike.filter({ user_email: currentUser?.email }),
    enabled: !!currentUser?.email,
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => base44.entities.SocialPost.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      setNewPost('');
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ post, isLiked }) => {
      if (isLiked) {
        const like = myLikes.find(l => l.post_id === post.id);
        if (like) {
          await base44.entities.PostLike.delete(like.id);
          await base44.asServiceRole.entities.SocialPost.update(post.id, {
            likes: Math.max(0, post.likes - 1)
          });
        }
      } else {
        await base44.entities.PostLike.create({
          post_id: post.id,
          user_email: currentUser.email
        });
        await base44.asServiceRole.entities.SocialPost.update(post.id, {
          likes: post.likes + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      queryClient.invalidateQueries({ queryKey: ['myLikes'] });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    createPostMutation.mutate({
      content: newPost,
      post_type: selectedType,
    });
  };

  const getPostIcon = (type) => {
    if (type === 'achievement') return <Award className="w-4 h-4 text-yellow-600" />;
    if (type === 'trade') return <TrendingUpIcon className="w-4 h-4 text-green-600" />;
    return <Lightbulb className="w-4 h-4 text-blue-600" />;
  };

  const getPostBadge = (type) => {
    if (type === 'achievement') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (type === 'trade') return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  const likedPostIds = myLikes.map(l => l.post_id);

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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Community
        </h1>
        <p className="text-sm text-gray-500 mt-1">Top traders, social feed & copy trading</p>
      </motion.div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="social">
            <MessageSquare className="w-4 h-4 mr-2" />
            Social Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
      {copiers.length > 0 && (
        <Card className="border-0 shadow-lg mb-6 bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-green-900 mb-2">People Copying You ({copiers.length})</p>
            <div className="space-y-2">
              {copiers.map(ct => {
                const leaderData = leaderboard.find(l => l.email === currentUser?.email);
                const currentValue = ct.investment_amount * (1 + ((leaderData?.percentageReturn || 0) / 100));
                const profitLoss = currentValue - ct.investment_amount;
                
                return (
                  <div key={ct.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{ct.follower_email.split('@')[0]}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">£{currentValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className={`text-xs ml-2 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({profitLoss >= 0 ? '+' : ''}£{profitLoss.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {myCopyTrades.filter(ct => ct.is_active).length > 0 && (
        <Card className="border-0 shadow-lg mb-6 bg-violet-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-violet-900 mb-2">Your Copy Trades</p>
            <div className="space-y-2">
              {myCopyTrades.filter(ct => ct.is_active).map(ct => {
                const leaderData = leaderboard.find(l => l.email === ct.leader_email);
                const currentValue = ct.investment_amount * (1 + ((leaderData?.percentageReturn || 0) / 100));
                const profitLoss = currentValue - ct.investment_amount;
                
                return (
                  <div key={ct.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Copying {ct.leader_email.split('@')[0]}</span>
                    <div className="text-right">
                      <span className="font-bold text-violet-900">£{currentValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className={`text-xs ml-2 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({profitLoss >= 0 ? '+' : ''}£{profitLoss.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </span>
                    </div>
                  </div>
                );
              })}
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
                        Balance: £{(trader.balance || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Total Value</p>
                      <p className="text-lg font-bold text-gray-900">
                        £{(trader.totalValue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs font-semibold ${
                        (trader.percentageReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(trader.percentageReturn || 0) >= 0 ? '+' : ''}{(trader.percentageReturn || 0).toFixed(2)}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Cash: £{(trader.balance || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} • 
                        Stocks: £{(trader.portfolioValue || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} • 
                        Copy: £{(trader.copyTradeValue || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                                  Performance: {(trader.percentageReturn || 0) >= 0 ? '+' : ''}{(trader.percentageReturn || 0).toFixed(2)}%
                                </p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Investment Amount (£) - Available: £{userBalance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </label>
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                value={copyAmount}
                                onChange={(e) => setCopyAmount(e.target.value)}
                                min="1"
                              />
                              <div className="flex gap-2 mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCopyAmount((userBalance * 0.25).toFixed(2))}
                                  className="flex-1 text-xs"
                                >
                                  25%
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCopyAmount((userBalance * 0.5).toFixed(2))}
                                  className="flex-1 text-xs"
                                >
                                  50%
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCopyAmount((userBalance * 0.75).toFixed(2))}
                                  className="flex-1 text-xs"
                                >
                                  75%
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCopyAmount(userBalance.toFixed(2))}
                                  className="flex-1 text-xs font-semibold"
                                >
                                  MAX
                                </Button>
                              </div>
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
        </TabsContent>

        <TabsContent value="social">
          <div className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Share your trading insights, achievements, or market analysis..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant={selectedType === 'insight' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType('insight')}
                        className="gap-2"
                      >
                        <Lightbulb className="w-4 h-4" />
                        Insight
                      </Button>
                      <Button
                        variant={selectedType === 'achievement' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType('achievement')}
                        className="gap-2"
                      >
                        <Award className="w-4 h-4" />
                        Win
                      </Button>
                      <Button
                        variant={selectedType === 'trade' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType('trade')}
                        className="gap-2"
                      >
                        <TrendingUpIcon className="w-4 h-4" />
                        Trade
                      </Button>
                    </div>

                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim() || createPostMutation.isPending}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <AnimatePresence>
                {posts.map((post, index) => {
                  const isLiked = likedPostIds.includes(post.id);
                  
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {post.created_by?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{post.created_by?.split('@')[0]}</p>
                                <p className="text-xs text-gray-500">{moment(post.created_date).fromNow()}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={getPostBadge(post.post_type)}>
                              {getPostIcon(post.post_type)}
                              <span className="ml-1 capitalize">{post.post_type}</span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                          
                          <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLikeMutation.mutate({ post, isLiked })}
                              className={`gap-2 ${isLiked ? 'text-red-600' : 'text-gray-600'}`}
                            >
                              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                              {post.likes || 0}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {posts.length === 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No posts yet. Be the first to share!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}