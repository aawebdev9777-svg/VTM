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
  const [displayedContent, setDisplayedContent] = useState({});
  const [input, setInput] = useState('');
  const [lastAutoScroll, setLastAutoScroll] = useState(Date.now());
  const [quickActions, setQuickActions] = useState([
    { icon: TrendingUp, label: 'Analyze Portfolio', prompt: 'Give me a comprehensive analysis of my portfolio performance, risk exposure, and diversification. Include specific recommendations.' },
    { icon: Sparkles, label: 'What to Buy?', prompt: 'Based on my current portfolio and cash balance, what are the top 5 stocks I should buy right now? Provide entry prices and allocation percentages.' },
    { icon: AlertCircle, label: 'Risk Check', prompt: 'Analyze my portfolio risk - calculate volatility, sector concentration, and suggest hedging strategies.' },
    { icon: Brain, label: 'Smart Moves', prompt: 'What are the smartest trades I can make today based on market conditions and my holdings?' },
  ]);
  const scrollRef = React.useRef(null);
  const typewriterRefs = React.useRef({});

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
      setLastAutoScroll(Date.now());
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  // Typewriter effect for assistant messages
  useEffect(() => {
    messages.forEach((msg, idx) => {
      if (msg.role === 'assistant' && msg.content) {
        const messageKey = `${idx}-${msg.content.substring(0, 50)}`;
        
        // If we already have the full content displayed, skip
        if (displayedContent[messageKey] === msg.content) return;
        
        // Clear any existing interval for this message
        if (typewriterRefs.current[messageKey]) {
          clearInterval(typewriterRefs.current[messageKey]);
        }

        const fullContent = msg.content;
        let currentIndex = displayedContent[messageKey]?.length || 0;

        // Start typewriter effect
        typewriterRefs.current[messageKey] = setInterval(() => {
          if (currentIndex < fullContent.length) {
            const charsToAdd = Math.min(3, fullContent.length - currentIndex);
            currentIndex += charsToAdd;
            
            setDisplayedContent(prev => ({
              ...prev,
              [messageKey]: fullContent.substring(0, currentIndex)
            }));
          } else {
            clearInterval(typewriterRefs.current[messageKey]);
            delete typewriterRefs.current[messageKey];
          }
        }, 10);
      }
    });

    return () => {
      Object.values(typewriterRefs.current).forEach(interval => clearInterval(interval));
    };
  }, [messages]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages]);

  const handleSend = async (message) => {
    const messageToSend = message || input;
    if (!messageToSend.trim() || !conversation) return;

    setInput('');

    // Add user message immediately for instant feedback
    const tempMessage = {
      role: 'user',
      content: messageToSend,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: messageToSend,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m !== tempMessage));
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
            style={{ position: 'fixed', bottom: '100px', right: '24px', zIndex: 9999 }}
            className="w-[450px] shadow-2xl"
          >
            <Card className="h-full flex flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl">
              <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">VTM AI</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {messages.length === 0 && (
                    <div className="p-6 space-y-4">
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">How can I help you today?</h3>
                        <p className="text-sm text-gray-500">Ask me about your portfolio, market insights, or trading strategies</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action, idx) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleQuickAction(action.prompt)}
                              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all text-left group"
                            >
                              <Icon className="w-4 h-4 text-gray-600 mb-1" />
                              <p className="text-xs font-medium text-gray-700">{action.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <ScrollArea className="flex-1 p-4 bg-white">
                    <div className="space-y-4">
                      {messages.map((msg, idx) => {
                        const messageKey = `${idx}-${msg.content?.substring(0, 50) || ''}`;
                        const contentToDisplay = msg.role === 'assistant' 
                          ? (displayedContent[messageKey] || '')
                          : msg.content;
                        
                        return (
                          <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {msg.role !== 'user' && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                              msg.role === 'user'
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-white text-gray-900'
                            }`}>
                              {msg.role === 'user' ? (
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                              ) : (
                                <>
                                  <ReactMarkdown 
                                    className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                    components={{
                                      h1: ({children}) => <h1 className="text-base font-semibold text-gray-900 mb-2">{children}</h1>,
                                      h2: ({children}) => <h2 className="text-sm font-semibold text-gray-900 mb-1.5 mt-3">{children}</h2>,
                                      h3: ({children}) => <h3 className="text-sm font-semibold text-gray-900 mb-1">{children}</h3>,
                                      ul: ({children}) => <ul className="space-y-1 my-2 ml-4 list-disc">{children}</ul>,
                                      ol: ({children}) => <ol className="space-y-1 my-2 ml-4 list-decimal">{children}</ol>,
                                      li: ({children}) => <li className="text-sm leading-relaxed text-gray-700">{children}</li>,
                                      p: ({children}) => <p className="text-sm leading-relaxed text-gray-900 my-1.5">{children}</p>,
                                      strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                      code: ({inline, children}) => inline ? (
                                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-900">{children}</code>
                                      ) : (
                                        <code className="block bg-gray-100 p-3 rounded-lg text-sm my-2 overflow-x-auto">{children}</code>
                                      ),
                                      table: ({children}) => (
                                        <div className="overflow-x-auto my-3 border border-gray-200 rounded-lg">
                                          <table className="min-w-full divide-y divide-gray-200 text-xs">
                                            {children}
                                          </table>
                                        </div>
                                      ),
                                      thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
                                      tbody: ({children}) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
                                      tr: ({children}) => <tr className="hover:bg-gray-50">{children}</tr>,
                                      th: ({children}) => (
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                          {children}
                                        </th>
                                      ),
                                      td: ({children}) => (
                                        <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                                          {children}
                                        </td>
                                      ),
                                    }}
                                  >
                                    {contentToDisplay}
                                  </ReactMarkdown>
                                  {contentToDisplay && contentToDisplay !== msg.content && (
                                    <span className="inline-block w-1 h-4 bg-gray-900 animate-pulse ml-0.5"></span>
                                  )}
                                </>
                              )}
                            </div>
                            {msg.role === 'user' && (
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 text-white text-sm font-medium">
                                U
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div ref={scrollRef} />
                    </div>
                  </ScrollArea>

                  <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex gap-2 items-end">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Message VTM AI..."
                        className="text-sm border-gray-300 focus:border-gray-400 bg-white rounded-xl"
                      />
                      <Button
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        size="icon"
                        className="bg-gray-900 hover:bg-gray-800 rounded-xl h-9 w-9"
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
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}
        className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:shadow-violet-400/50 transition-all relative overflow-hidden group"
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