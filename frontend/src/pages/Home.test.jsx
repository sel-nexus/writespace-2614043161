import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' }));
});

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>);
}

describe('blog collection', () => {
  it('shows the empty state and a write action when no posts exist', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: 'No blogs yet. Be the first to write one!' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Write a Post' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Write a Post' })[1]).toHaveAttribute('href', '/write');
  });

  it('sorts posts newest first and shows excerpts, author, and ownership actions', () => {
    window.localStorage.setItem('writespace_posts', JSON.stringify([
      { id: 'old', title: 'Older', content: 'Old content', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u2', authorName: 'Other' },
      { id: 'mine', title: 'Mine', content: 'My content', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Reader' },
      { id: 'theirs', title: 'Theirs', content: 'Their content', createdAt: '2024-06-01T00:00:00.000Z', authorId: 'u2', authorName: 'Other' },
    ]));
    renderHome();
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual(['Mine', 'Theirs', 'Older']);
    expect(screen.getByText('My content')).toBeInTheDocument();
    expect(screen.getByText('Reader')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit Mine' })).toHaveAttribute('href', '/edit/mine');
    expect(screen.queryByRole('link', { name: 'Edit Theirs' })).not.toBeInTheDocument();
  });
});
