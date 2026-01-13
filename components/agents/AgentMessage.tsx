import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AGENTS, getAgentById } from '@/lib/ai/agents';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentMessageProps {
  content: string;
  senderName: string;
  senderRole: 'USER' | 'AGENT';
  senderAgentId?: string;
  isStreaming?: boolean;
}

export function AgentMessage({ 
  content, 
  senderName, 
  senderRole, 
  senderAgentId, 
  isStreaming = false 
}: AgentMessageProps) {
  const isUser = senderRole === 'USER';
  const agent = senderAgentId ? getAgentById(senderAgentId) : null;
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAgentColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-500',
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      pink: 'bg-pink-500',
      violet: 'bg-violet-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className={cn(
      'flex gap-3',
      isUser && 'flex-row-reverse'
    )}>
      <Avatar className="h-10 w-10">
        {agent ? (
          <AvatarFallback className={cn(
            'text-white',
            getAgentColor(agent.color)
          )}>
            {getInitials(agent.name)}
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(senderName)}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className={cn(
        'flex-1 space-y-2',
        isUser && 'text-right'
      )}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{senderName}</span>
          {agent && (
            <Badge variant="outline" className="text-xs">
              {agent.role}
            </Badge>
          )}
        </div>
        
        <div className={cn(
          'rounded-lg p-4 max-w-3xl',
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
        )}>
          {isStreaming ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm">
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}