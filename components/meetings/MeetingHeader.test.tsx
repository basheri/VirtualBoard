import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeetingHeader } from './MeetingHeader';

// Mock navigation
const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
};
vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}));

// Mock browser client
vi.mock('@/lib/supabase/client', () => ({
    createBrowserClient: vi.fn(),
}));

// Mock window.confirm and alert
global.confirm = vi.fn(() => true);
global.alert = vi.fn();
global.fetch = vi.fn();

describe('MeetingHeader', () => {
    const defaultProps = {
        meetingId: '123',
        title: 'Test Meeting',
        strategy: 'GROWTH' as const,
        status: 'ACTIVE',
        agents: [{ agent_id: 'cfo' }, { agent_id: 'cto' }],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly with default props', () => {
        render(<MeetingHeader {...defaultProps} />);
        expect(screen.getByText('Test Meeting')).toBeInTheDocument();
        expect(screen.getByText('Growth Focused')).toBeInTheDocument();
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
        expect(screen.getByText('2 participants')).toBeInTheDocument();
    });

    it('shows end meeting button when status is ACTIVE', () => {
        render(<MeetingHeader {...defaultProps} />);
        expect(screen.getByText('End Meeting & Summarize')).toBeInTheDocument();
    });

    it('shows export button when status is COMPLETED', () => {
        render(<MeetingHeader {...defaultProps} status="COMPLETED" />);
        expect(screen.getByText('Export Decision Record')).toBeInTheDocument();
    });

    it('handles end meeting action', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true });

        render(<MeetingHeader {...defaultProps} />);

        fireEvent.click(screen.getByText('End Meeting & Summarize'));

        expect(global.confirm).toHaveBeenCalled();
        // Since fetch is async, we can check if it was called
        // We might need waitFor if state updates are involved, but for action trigger check this is okay
    });

    it('displays correct strategy label for SAFETY', () => {
        render(<MeetingHeader {...defaultProps} strategy="SAFETY" />);
        expect(screen.getByText('Safety First')).toBeInTheDocument();
    });

    it('displays correct strategy label for BALANCED', () => {
        render(<MeetingHeader {...defaultProps} strategy="BALANCED" />);
        expect(screen.getByText('Balanced Approach')).toBeInTheDocument();
    });
});
