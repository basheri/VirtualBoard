'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Loader2, Square, RefreshCw, Users, DollarSign, Code, Scale, Megaphone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MeetingStrategy } from '@/lib/ai/agents';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

const agentStyles: Record<string, { bgColor: string; textColor: string; icon: any }> = {
  moderator: { bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: Users },
  cfo: { bgColor: 'bg-green-100', textColor: 'text-green-700', icon: DollarSign },
  cto: { bgColor: 'bg-purple-100', textColor: 'text-purple-700', icon: Code },
  legal: { bgColor: 'bg-amber-100', textColor: 'text-amber-700', icon: Scale },
  cmo: { bgColor: 'bg-pink-100', textColor: 'text-pink-700', icon: Megaphone },
  user: { bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: User },
};

export function MeetingChat({ meetingId, initialMessages, strategy, agents }: MeetingChatProps) {
  console.log('MeetingChat initialized', { meetingId });
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Memoize body and initialMessages to prevent unnecessary re-renders in useChat
  const chatBody = useMemo(() => ({
    meetingId,
    strategy,
    agents,
  }), [meetingId, strategy, agents]);

  const convertedInitialMessages = useMemo(() => initialMessages.map((m) => ({
    id: m.id,
    role: m.sender_role === 'USER' ? 'user' as const : 'assistant' as const,
    content: m.content,
    parts: [{ type: 'text', text: m.content }],
  } as unknown as UIMessage), [] as UIMessage[]), [initialMessages]);

  const [input, setInput] = useState('');

  const {
    messages,
    sendMessage,
    status,
    error,
    regenerate,
    stop,
  } = useChat({
    id: meetingId,
    body: chatBody,
    initialMessages: convertedInitialMessages,
    onError: (error: Error) => {
      console.error('Chat error:', error)
    },
  } as any);

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      await sendMessage({
        role: 'user',
        content: input.trim(),
      } as any);
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const safeInput = input;

  // Use reload or regenerate depending on what's available
  const handleReload = () => {
    if (regenerate) regenerate();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
          {messages.map((message: UIMessage) => {
            const isUser = message.role === 'user';
            // Extract agent name from message metadata or parts
            const textPart = message.parts?.find((p): p is { type: 'text'; text: string } => 
              typeof p === 'object' && 'type' in p && p.type === 'text'
            );
            const agentName = (message as any).name || 
              (textPart?.text?.includes('CFO') ? 'CFO' :
               textPart?.text?.includes('CTO') ? 'CTO' :
               textPart?.text?.includes('Legal') ? 'Legal' :
               textPart?.text?.includes('CMO') ? 'CMO' :
               'Moderator');
            
            const style = getAgentStyle(agentName, message.role);
            const Icon = style.icon;
            
            return (
              <div key={message.id} className={cn(
                'flex gap-3',
                isUser && 'flex-row-reverse'
              )}>
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
                    'rounded-lg p-4 max-w-3xl',
                    style.bgColor,
                    style.textColor
                  )}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.parts ? message.parts.map((p) => {
                        if (typeof p === 'object' && 'type' in p && p.type === 'text') {
                          return (p as { text: string }).text;
                        }
                        return '';
                      }).join('') : (message as any).content || ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {error && (
            <div className="text-destructive text-sm text-center py-2">
              Error: {error.message}. Please try again.
            </div>
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

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <Textarea
                value={safeInput}
                onChange={handleInputChange}
                placeholder="اطرح سؤالك أو مشكلتك على المجلس... / Present your question to the board..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !safeInput.trim()}
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
