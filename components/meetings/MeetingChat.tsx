'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Loader2, Square, RefreshCw, Users, DollarSign, Code, Scale, Megaphone, User, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MeetingStrategy } from '@/lib/ai/agents';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TypingIndicator } from './TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';

/** Extended UIMessage with optional custom properties */
interface ExtendedUIMessage extends UIMessage {
  name?: string;
  content?: string;
}

type InitialDbMessage = {
  id: string;
  sender_role: 'USER' | 'AGENT';
  content: string;
  sender_name: string;
  sender_agent_id?: string;
};

interface MeetingChatProps {
  meetingId: string;
  initialMessages: InitialDbMessage[];
  strategy: MeetingStrategy;
  agents: string[];
}

interface AgentStyle {
  bgColor: string;
  textColor: string;
  icon: LucideIcon;
}

const agentStyles: Record<string, AgentStyle> = {
  moderator: { bgColor: 'bg-blue-100 dark:bg-blue-950', textColor: 'text-blue-700 dark:text-blue-300', icon: Users },
  cfo: { bgColor: 'bg-green-100 dark:bg-green-950', textColor: 'text-green-700 dark:text-green-300', icon: DollarSign },
  cto: { bgColor: 'bg-purple-100 dark:bg-purple-950', textColor: 'text-purple-700 dark:text-purple-300', icon: Code },
  legal: { bgColor: 'bg-amber-100 dark:bg-amber-950', textColor: 'text-amber-700 dark:text-amber-300', icon: Scale },
  cmo: { bgColor: 'bg-pink-100 dark:bg-pink-950', textColor: 'text-pink-700 dark:text-pink-300', icon: Megaphone },
  user: { bgColor: 'bg-muted', textColor: 'text-foreground', icon: User },
};

export function MeetingChat({ meetingId, initialMessages, strategy, agents }: MeetingChatProps) {
  console.log('MeetingChat initialized', { meetingId });
  const scrollRef = useRef<HTMLDivElement>(null);

  const convertedInitialMessages = useMemo(() => initialMessages.map((m) => ({
    id: m.id,
    role: m.sender_role === 'USER' ? 'user' as const : 'assistant' as const,
    parts: [{ type: 'text' as const, text: m.content }],
  })), [initialMessages]);

  const [input, setInput] = useState('');

  const chat = useChat({
    id: meetingId,
    messages: convertedInitialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { meetingId, strategy, agents },
    }),
    onError: (error: Error) => {
      console.error('Chat error:', error)
    },
  });

  const {
    sendMessage,
    regenerate,
    stop,
    status,
    messages,
    error,
  } = chat;

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleManualInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleManualSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      const currentInput = input.trim();
      setInput(''); // Clear input immediately

      await sendMessage({ text: currentInput });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Use regenerate as verified in runtime keys
  const handleReload = () => {
    if (regenerate) regenerate();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Cleanup effect to stop generation when unmounting
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const getAgentStyle = (name: string, role: string) => {
    if (role === 'user') return agentStyles.user;
    // Simple mapping based on name or role, assuming name contains role or we map it
    // For now, we try to match the name to the keys, or default to moderator
    const lowerName = name.toLowerCase();
    if (lowerName.includes('cfo')) return agentStyles.cfo;
    if (lowerName.includes('cto')) return agentStyles.cto;
    if (lowerName.includes('legal')) return agentStyles.legal;
    if (lowerName.includes('cmo')) return agentStyles.cmo;
    return agentStyles.moderator;
  };

  return (
    <div className="flex flex-col flex-1 bg-muted/30">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const extMessage = message as ExtendedUIMessage;
              const isUser = message.role === 'user';
              // Extract agent name from message metadata or parts
              const textPart = message.parts?.find((p): p is { type: 'text'; text: string } =>
                typeof p === 'object' && 'type' in p && p.type === 'text'
              );
              const agentName = extMessage.name ||
                (textPart?.text?.includes('CFO') ? 'CFO' :
                  textPart?.text?.includes('CTO') ? 'CTO' :
                    textPart?.text?.includes('Legal') ? 'Legal' :
                      textPart?.text?.includes('CMO') ? 'CMO' :
                        'Moderator');

              const style = getAgentStyle(agentName, message.role);
              const Icon = style.icon;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    'flex gap-3',
                    isUser && 'flex-row-reverse'
                  )}
                >
                  <Avatar className="h-10 w-10 bg-white border">
                    <AvatarFallback className={cn(style.bgColor, style.textColor)}>
                      <Icon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className={cn(
                    'flex-1 space-y-2',
                    isUser && 'text-right'
                  )}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{isUser ? 'You' : agentName}</span>
                      {!isUser && (
                        <Badge variant="outline" className="text-xs">
                          {agentName}
                        </Badge>
                      )}
                    </div>

                    <div className={cn(
                      'rounded-lg p-4 max-w-3xl transition-all duration-200 hover:shadow-md',
                      style.bgColor,
                      style.textColor
                    )}>
                      <div className="whitespace-pre-wrap text-sm">
                        {message.parts ? message.parts.map((p) => {
                          if (typeof p === 'object' && 'type' in p && p.type === 'text') {
                            return (p as { text: string }).text;
                          }
                          return '';
                        }).join('') : extMessage.content || ''}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && <TypingIndicator agentName="AI Board" />}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-sm text-center py-2"
            >
              Error: {error.message}. Please try again.
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center gap-2">
            {isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={stop}
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}

            {!isLoading && messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReload}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            )}
          </div>

          <form onSubmit={handleManualSubmit}>
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={handleManualInputChange}
                placeholder="اطرح سؤالك أو مشكلتك على المجلس... / Present your question to the board..."
                className="min-h-[60px] resize-none transition-all focus:shadow-md"
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleManualSubmit();
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input?.trim()}
                className="transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
