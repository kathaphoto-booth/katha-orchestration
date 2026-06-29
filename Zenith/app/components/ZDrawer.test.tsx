import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ZDrawer } from './ZDrawer';

describe('ZDrawer', () => {
  it('renders children when open', () => {
    render(<ZDrawer open={true} onClose={() => {}}><div>panel content</div></ZDrawer>);
    expect(screen.getByText('panel content')).toBeTruthy();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<ZDrawer open={true} onClose={onClose}><div /></ZDrawer>);
    fireEvent.click(screen.getByTestId('zdrawer-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('adds body.drawer class when open', () => {
    render(<ZDrawer open={true} onClose={() => {}}><div /></ZDrawer>);
    expect(document.body.classList.contains('drawer')).toBe(true);
  });

  it('removes body.drawer class when closed', () => {
    const { rerender } = render(<ZDrawer open={true} onClose={() => {}}><div /></ZDrawer>);
    rerender(<ZDrawer open={false} onClose={() => {}}><div /></ZDrawer>);
    expect(document.body.classList.contains('drawer')).toBe(false);
  });
});
