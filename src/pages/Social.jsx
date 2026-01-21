import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, MessageSquare, Share2, Lightbulb, Award, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

export default function Social() {
  const [currentUser, setCurrentUser] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [selectedType, setSelectedType] = useState('insight');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

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
    if (type === 'trade') return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <Lightbulb className="w-4 h-4 text-blue-600" />;
  };

  const getPostBadge = (type) => {
    if (type === 'achievement') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (type === 'trade') return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  const likedPostIds = myLikes.map(l => l.post_id);

  const filteredPosts = posts;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-violet-600" />
          Social Feed
        </h1>
        <p className="text-sm text-gray-500 mt-1">Share insights and celebrate wins with the community</p>
      </motion.div>

      <Card className="border-0 shadow-md mb-6">
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
                  Achievement
                </Button>
                <Button
                  variant={selectedType === 'trade' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('trade')}
                  className="gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
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
          {filteredPosts.map((post, index) => {
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
  );
}