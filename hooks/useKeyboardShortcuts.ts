'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description: string;
}

/**
 * Global keyboard shortcuts hook
 * Provides consistent keyboard navigation across the app
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] = []) {
    const router = useRouter();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Check custom shortcuts first
            for (const shortcut of shortcuts) {
                const modifierMatch =
                    (shortcut.ctrlKey === undefined || shortcut.ctrlKey === e.ctrlKey) &&
                    (shortcut.metaKey === undefined || shortcut.metaKey === e.metaKey) &&
                    (shortcut.shiftKey === undefined || shortcut.shiftKey === e.shiftKey) &&
                    (shortcut.altKey === undefined || shortcut.altKey === e.altKey);

                if (modifierMatch && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
                    e.preventDefault();
                    shortcut.action();
                    return;
                }
            }

            // Global shortcuts
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            // Cmd/Ctrl + K: Search (placeholder for future implementation)
            if (cmdOrCtrl && e.key === 'k') {
                e.preventDefault();
                // TODO: Implement search functionality
                console.log('Search shortcut triggered');
            }

            // Cmd/Ctrl + N: New project
            if (cmdOrCtrl && e.key === 'n') {
                e.preventDefault();
                router.push('/dashboard/projects/new');
            }

            // Cmd/Ctrl + /: Show keyboard shortcuts help
            if (cmdOrCtrl && e.key === '/') {
                e.preventDefault();
                // TODO: Implement shortcuts help modal
                console.log('Keyboard shortcuts help');
            }

            // Escape: Close modals/dialogs (handled by individual components)
            if (e.key === 'Escape') {
                // Let components handle this
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [shortcuts, router]);
}

/**
 * Default keyboard shortcuts for the application
 */
export const defaultShortcuts: KeyboardShortcut[] = [
    {
        key: 'k',
        ctrlKey: true,
        metaKey: true,
        description: 'Search',
        action: () => console.log('Search'),
    },
    {
        key: 'n',
        ctrlKey: true,
        metaKey: true,
        description: 'New Project',
        action: () => console.log('New Project'),
    },
    {
        key: '/',
        ctrlKey: true,
        metaKey: true,
        description: 'Show Keyboard Shortcuts',
        action: () => console.log('Show Shortcuts'),
    },
];
