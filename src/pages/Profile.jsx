import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Edit, Trophy, TrendingUp, DollarSign, Crown, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const profileUsername = queryParams.get('user');
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authUser = await base44.auth.me();
        if (authUser) {
          const vtmUsers = await base44.entities.VTMUser.filter({ id: authUser.email });
          setCurrentUser(vtmUsers[0] || null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const { data: profileUser } = useQuery({
    queryKey: ['profileUser', profileUsername, currentUser?.username],
    queryFn: async () => {
      if (profileUsername) {
        const users = await base44.asServiceRole.entities.VTMUser.filter({ username: profileUsername });
        return users[0] || null;
      }
      return currentUser;
    },
    enabled: !!profileUsername || !!currentUser,
    refetchInterval: 5000,
  });

  const { data: userAccount } = useQuery({
    queryKey: ['userAccountProfile', profileUser?.id],
    queryFn: () => base44.asServiceRole.entities.UserAccount.filter({ created_by: profileUser?.id }),
    enabled: !!profileUser?.id,
    refetchInterval: 3000,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolioProfile', profileUser?.id],
    queryFn: () => base44.asServiceRole.entities.Portfolio.filter({ created_by: profileUser?.id }),
    enabled: !!profileUser?.id,
    refetchInterval: 3000,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactionsProfile', profileUser?.id],
    queryFn: () => base44.asServiceRole.entities.Transaction.filter({ created_by: profileUser?.id }, '-created_date', 20),
    enabled: !!profileUser?.id,
    refetchInterval: 5000,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['postsProfile', profileUser?.id],
    queryFn: () => base44.asServiceRole.entities.SocialPost.filter({ created_by: profileUser?.id }, '-created_date', 50),
    enabled: !!profileUser?.id,
    refetchInterval: 5000,
  });

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('getUpdatedPrices', {});
        return response.data.prices || [];
      } catch {
        return base44.entities.StockPrice.list();
      }
    },
    refetchInterval: 5000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.VTMUser.update(profileUser.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profileUser']);
      setIsEditOpen(false);
    },
  });

  const handleEditProfile = () => {
    setEditData({
      display_name: profileUser?.display_name || '',
      bio: profileUser?.bio || '',
      banner_color: profileUser?.banner_color || '#8b5cf6',
      favorite_stock: profileUser?.favorite_stock || '',
    });
    setIsEditOpen(true);
  };

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const account = userAccount?.[0];
  const isOwnProfile = currentUser?.id === profileUser.id;

  const portfolioValue = portfolio.reduce((sum, holding) => {
    const stockPrice = stockPrices.find(s => s.symbol === holding.symbol);
    const price = stockPrice?.price_gbp || holding.average_buy_price;
    return sum + (holding.shares * price);
  }, 0);

  const totalValue = (account?.cash_balance || 0) + portfolioValue;
  const profitLoss = totalValue - 10000;
  const profitPercent = (profitLoss / 10000) * 100;

  const winningTrades = transactions.filter(t => t.type === 'sell').length;
  const totalTrades = transactions.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Profile Header */}
        <Card className="border-0 shadow-xl overflow-hidden mb-6">
          <div 
            className="h-32 relative"
            style={{ background: `linear-gradient(135deg, ${profileUser.banner_color || '#8b5cf6'}, ${profileUser.banner_color || '#8b5cf6'}dd)` }}
          >
            <div className="absolute -bottom-16 left-6">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-violet-600">
                {profileUser.avatar_url ? (
                  <img src={profileUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  profileUser.username?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            {isOwnProfile && (
              <Button
                onClick={handleEditProfile}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 gap-2"
                size="sm"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>

          <CardContent className="pt-20 pb-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {profileUser.display_name || profileUser.username}
                {profitPercent > 50 && <Crown className="w-6 h-6 text-yellow-500" />}
              </h1>
              <p className="text-sm text-gray-500">@{profileUser.username}</p>
              {profileUser.bio && (
                <p className="text-gray-700 mt-3">{profileUser.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">£{totalValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-gray-500">Portfolio</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Return</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalTrades}</p>
                <p className="text-xs text-gray-500">Trades</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
            </div>

            {profileUser.favorite_stock && (
              <Badge className="bg-violet-100 text-violet-700 border-violet-300">
                💎 Favorite: {profileUser.favorite_stock}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Top Holdings
              </h3>
              <div className="space-y-3">
                {portfolio.slice(0, 5).map(holding => {
                  const stockPrice = stockPrices.find(s => s.symbol === holding.symbol);
                  const currentPrice = stockPrice?.price_gbp || holding.average_buy_price;
                  const value = holding.shares * currentPrice;
                  const profit = value - (holding.shares * holding.average_buy_price);
                  const profitPercent = (profit / (holding.shares * holding.average_buy_price)) * 100;

                  return (
                    <div key={holding.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{holding.symbol}</p>
                        <p className="text-xs text-gray-500">{holding.shares} shares</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">£{value.toFixed(2)}</p>
                        <p className={`text-xs ${profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
                {portfolio.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No holdings yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                Recent Posts
              </h3>
              <div className="space-y-3">
                {posts.slice(0, 5).map(post => (
                  <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{post.content.substring(0, 100)}...</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {post.post_type}
                      </Badge>
                      <span className="text-xs text-gray-500">❤️ {post.likes || 0}</span>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No posts yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Display Name</label>
              <Input
                value={editData.display_name}
                onChange={(e) => setEditData({...editData, display_name: e.target.value})}
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Bio</label>
              <Textarea
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Banner Color</label>
              <Input
                type="color"
                value={editData.banner_color}
                onChange={(e) => setEditData({...editData, banner_color: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Favorite Stock</label>
              <Input
                value={editData.favorite_stock}
                onChange={(e) => setEditData({...editData, favorite_stock: e.target.value.toUpperCase()})}
                placeholder="e.g., AAPL"
              />
            </div>
            <Button
              onClick={() => updateProfileMutation.mutate(editData)}
              disabled={updateProfileMutation.isPending}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}