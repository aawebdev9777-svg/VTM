import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, X, Minimize2, Maximize2, Sparkles, TrendingUp, AlertCircle, Brain, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAutoScroll, setLastAutoScroll] = useState(Date.now());
  const [quickActions, setQuickActions] = useState([
    { icon: TrendingUp, label: 'Analyze Portfolio', prompt: 'Give me a comprehensive analysis of my portfolio performance, risk exposure, and diversification. Include specific recommendations.' },
    { icon: Sparkles, label: 'What to Buy?', prompt: 'Based on my current portfolio and cash balance, what are the top 5 stocks I should buy right now? Provide entry prices and allocation percentages.' },
    { icon: AlertCircle, label: 'Risk Check', prompt: 'Analyze my portfolio risk - calculate volatility, sector concentration, and suggest hedging strategies.' },
    { icon: Brain, label: 'Smart Moves', prompt: 'What are the smartest trades I can make today based on market conditions and my holdings?' },
  ]);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    if (isOpen && !conversation) {
      initConversation();
    }
  }, [isOpen]);

  const initConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'trading_assistant',
        metadata: { name: 'AI Assistant' }
      });
      setConversation(conv);
      setMessages(conv.messages || []);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages);
      setIsLoading(false);
      setLastAutoScroll(Date.now());
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  // Auto-scroll and auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      setLastAutoScroll(Date.now());
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleSend = async (message) => {
    const messageToSend = message || input;
    if (!messageToSend.trim() || !conversation || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: messageToSend,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt) => {
    handleSend(prompt);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '600px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[450px] shadow-2xl"
          >
            <Card className="h-full flex flex-col overflow-hidden border-2 border-violet-300 bg-gradient-to-br from-white to-violet-50">
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                <div className="flex items-center gap-2 relative z-10">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Elite AI Analyst</div>
                    <div className="text-xs text-violet-100 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Portfolio Intelligence
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 text-white hover:bg-white/30 rounded-lg transition-all"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-white hover:bg-white/30 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {messages.length === 0 && (
                    <div className="p-4 space-y-3">
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Your Elite Trading Analyst</h3>
                        <p className="text-xs text-gray-500">Advanced portfolio intelligence & personalized strategies</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action, idx) => {
                          const Icon = action.icon;
                          return (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleQuickAction(action.prompt)}
                              className="p-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl hover:shadow-md transition-all text-left group"
                            >
                              <Icon className="w-4 h-4 text-violet-600 mb-1 group-hover:scale-110 transition-transform" />
                              <p className="text-xs font-semibold text-gray-700">{action.label}</p>
                            </motion.button>
                          );
                        })}
                      </div>
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-900 mb-1">Pro Tips</p>
                            <p className="text-xs text-amber-700">Ask for specific analysis, entry prices, risk metrics, or sector recommendations!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-3">
                      {messages.length > 0 && (
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Analysis Active
                          </Badge>
                        </div>
                      )}

                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}>
                            {msg.role === 'user' ? (
                              <p className="font-medium">{msg.content}</p>
                            ) : (
                              <div className="space-y-2">
                                <ReactMarkdown 
                                  className="prose prose-sm max-w-none prose-headings:text-violet-900 prose-strong:text-violet-800 prose-p:text-gray-700 prose-li:text-gray-700"
                                  components={{
                                    h1: ({children}) => <h1 className="text-base font-bold text-violet-900 mb-2 flex items-center gap-1"><Sparkles className="w-4 h-4" />{children}</h1>,
                                    h2: ({children}) => <h2 className="text-sm font-bold text-violet-800 mb-1">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-sm font-semibold text-violet-700 mb-1">{children}</h3>,
                                    ul: ({children}) => <ul className="space-y-1 ml-4">{children}</ul>,
                                    li: ({children}) => <li className="text-xs leading-relaxed">{children}</li>,
                                    p: ({children}) => <p className="text-xs leading-relaxed">{children}</p>,
                                    strong: ({children}) => <strong className="font-bold text-violet-800">{children}</strong>,
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-white border border-violet-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                            <span className="text-xs text-violet-600 font-medium">Analyzing markets...</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="border-t border-violet-100 p-3 bg-gradient-to-r from-violet-50/50 to-purple-50/50">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for analysis, recommendations, risk metrics..."
                        className="text-sm border-violet-200 focus:border-violet-400 bg-white"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Powered by advanced financial AI</p>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:shadow-violet-400/50 transition-all relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 group-hover:from-white/10 group-hover:to-white/30 transition-all"></div>
        <Sparkles className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 border-2 border-white shadow-lg">
          <Zap className="w-3 h-3" />
        </div>
      </motion.button>
    </>
  );
}