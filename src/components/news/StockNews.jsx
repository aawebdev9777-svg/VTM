import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink, TrendingUp, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from '@/api/base44Client';

export default function StockNews({ symbol, companyName, autoLoad = false }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol && !autoLoad) return;

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const searchTerm = autoLoad 
          ? 'latest stock market news and trending stocks today'
          : `${companyName || symbol} stock`;
        
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Find the latest 5 news articles about ${searchTerm}. For each article provide: headline (max 80 chars), summary (max 150 chars), source, and publish_date (format: "X hours ago" or "X days ago"). Return as JSON array.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    headline: { type: "string" },
                    summary: { type: "string" },
                    source: { type: "string" },
                    publish_date: { type: "string" },
                    url: { type: "string" }
                  }
                }
              }
            }
          }
        });

        setNews(response.articles || []);
      } catch (err) {
        setError('Failed to fetch news');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [symbol, companyName, autoLoad]);

  if (!symbol && !autoLoad) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            Stock News
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Newspaper className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Select a stock to see latest news</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-600" />
          {symbol ? `Latest News: ${symbol}` : 'Market News'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            <span className="ml-3 text-gray-600">Fetching latest news...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent news found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {news.map((article, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {article.headline}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {article.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.publish_date}
                        </span>
                      </div>
                    </div>
                    {article.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}