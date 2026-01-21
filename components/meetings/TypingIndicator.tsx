'use client';

import { motion } from 'framer-motion';

interface TypingIndicatorProps {
    agentName?: string;
    className?: string;
}

/**
 * Typing indicator component for chat interfaces
 * Shows animated dots to indicate AI is processing
 */
export function TypingIndicator({ agentName, className }: TypingIndicatorProps) {
    return (
        <div className={`flex items-center gap-2 px-4 py-2 ${className || ''}`}>
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-primary/60 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
            <span className="text-sm text-muted-foreground">
                {agentName ? `${agentName} is thinking...` : 'AI is thinking...'}
            </span>
        </div>
    );
}
