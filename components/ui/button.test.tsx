import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('applies variant classes', () => {
        const { container } = render(<Button variant="destructive">Delete</Button>);
        const button = container.querySelector('button');
        expect(button).toHaveClass('bg-destructive');
    });

    it('applies size classes', () => {
        const { container } = render(<Button size="sm">Small</Button>);
        const button = container.querySelector('button');
        expect(button).toHaveClass('h-8');
    });

    it('handles click events', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={handleClick}>Click me</Button>);

        await user.click(screen.getByRole('button', { name: /click me/i }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can render as a child component (Slot)', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        );
        const link = screen.getByRole('link', { name: /link button/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/test');
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
    });
});
