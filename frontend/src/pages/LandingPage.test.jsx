import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

beforeEach(() => window.localStorage.clear());

function renderLanding() {
  return render(<MemoryRouter><LandingPage /></MemoryRouter>);
}

describe('landing page', () => {
  it('shows the public hero, feature cards, footer links, and empty preview state', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: /Your thoughts\./ })).toBeInTheDocument();
    expect(screen.getByText('Your thoughts. Your space. Beautifully simple.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Write Freely' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Private & Local' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Instant & Fast' })).toBeInTheDocument();
    expect(screen.getByText('No posts yet - check back soon!')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toHaveTextContent('Register');
  });

  it('shows at most three recent post previews in newest-first order', () => {
    window.localStorage.setItem('writespace_posts', JSON.stringify([
      { id: 'old', title: 'Older note', content: 'Old content', createdAt: '2024-01-01T00:00:00.000Z' },
      { id: 'new', title: 'Newest note', content: 'New content', createdAt: '2025-01-01T00:00:00.000Z' },
      { id: 'mid', title: 'Middle note', content: 'Middle content', createdAt: '2024-06-01T00:00:00.000Z' },
      { id: 'fourth', title: 'Fourth note', content: 'Fourth content', createdAt: '2023-01-01T00:00:00.000Z' },
    ]));
    renderLanding();
    const links = screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/blog/'));
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent('Newest note');
    expect(links[2]).toHaveTextContent('Older note');
    expect(links.map((link) => link.textContent).join(' ')).not.toContain('Fourth note');
  });
});
