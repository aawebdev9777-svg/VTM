import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, TrendingUp, AlertCircle, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const quickActions = [
    { icon: TrendingUp, label: 'Analyze Portfolio', prompt: 'Give me a comprehensive analysis of my portfolio performance, risk exposure, and diversification. Include specific recommendations.' },
    { icon: Sparkles, label: 'What to Buy?', prompt: 'Based on my current portfolio and cash balance, what are the top 5 stocks I should buy right now? Provide entry prices and allocation percentages.' },
    { icon: AlertCircle, label: 'Risk Check', prompt: 'Analyze my portfolio risk - calculate volatility, sector concentration, and suggest hedging strategies.' },
    { icon: Brain, label: 'Smart Moves', prompt: 'What are the smartest trades I can make today based on market conditions and my holdings?' },
  ];

  useEffect(() => {
    if (isOpen && !conversation) {
      initConversation();
    }
  }, [isOpen]);

  const initConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'trading_assistant',
        metadata: { name: 'AI Trading Assistant' }
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
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-[450px] shadow-2xl z-[9999]"
            style={{ height: isMinimized ? '60px' : '600px' }}
          >
            <Card className="h-full flex flex-col overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">VTM AI Trading Assistant</div>
                    <div className="text-xs text-white/80">Your personal trading advisor</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {messages.length === 0 ? (
                    <div className="p-6 space-y-6">
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">How can I help you today?</h3>
                        <p className="text-sm text-gray-500">Ask me about your portfolio, market insights, or trading strategies</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, idx) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSend(action.prompt)}
                              className="p-4 bg-gradient-to-br from-gray-50 to-white hover:from-violet-50 hover:to-purple-50 border border-gray-200 hover:border-violet-300 rounded-xl transition-all text-left group"
                            >
                              <Icon className="w-5 h-5 text-violet-600 mb-2" />
                              <p className="text-sm font-medium text-gray-900">{action.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {msg.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                              msg.role === 'user'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              {msg.role === 'user' ? (
                                <p className="text-sm">{msg.content}</p>
                              ) : (
                                <ReactMarkdown 
                                  className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                  components={{
                                    p: ({children}) => <p className="text-sm mb-2 last:mb-0">{children}</p>,
                                    h1: ({children}) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                                    ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                                    li: ({children}) => <li className="text-sm">{children}</li>,
                                    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                    table: ({children}) => (
                                      <div className="overflow-x-auto my-3">
                                        <table className="min-w-full border border-gray-300 text-xs">{children}</table>
                                      </div>
                                    ),
                                    thead: ({children}) => <thead className="bg-gray-200">{children}</thead>,
                                    th: ({children}) => <th className="border border-gray-300 px-2 py-1 font-semibold">{children}</th>,
                                    td: ({children}) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              )}
                            </div>
                          </div>
                        ))}

                        {isLoading && (
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-gray-100 rounded-2xl px-4 py-3">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div ref={scrollRef} />
                      </div>
                    </ScrollArea>
                  )}

                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Ask me anything about trading..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center z-[9999]"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>
    </>
  );
}