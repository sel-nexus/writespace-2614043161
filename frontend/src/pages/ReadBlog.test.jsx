import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReadBlog from './ReadBlog';

const post = { id: 'p1', title: 'A full note', content: 'First line\nSecond line', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Reader' };

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('writespace_posts', JSON.stringify([post]));
  window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' }));
});

function renderDetail(path = '/blog/p1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ReadBlog />} path="/blog/:id" />
        <Route element={<p>Blogs destination</p>} path="/blogs" />
        <Route element={<p>Edit destination</p>} path="/edit/:id" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('post detail', () => {
  it('renders full content, author, date, and owner actions', () => {
    renderDetail();
    expect(screen.getByRole('heading', { name: 'A full note' })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === 'First line\nSecond line')).toBeInTheDocument();
    expect(screen.getByText('Reader')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/edit/p1');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown post ID', () => {
    renderDetail('/blog/missing');
    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to All Posts' })).toHaveAttribute('href', '/blogs');
  });

  it('deletes an owned post after confirmation and redirects to blogs', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderDetail();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('Blogs destination')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([]);
  });

  it('does not delete when confirmation is declined', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderDetail();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([post]);
  });

  it('keeps the post visible and reports an error when deletion cannot be saved', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage unavailable'); });
    renderDetail();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to delete this post from your browser.');
    expect(screen.getByRole('heading', { name: 'A full note' })).toBeInTheDocument();
    expect(screen.queryByText('Blogs destination')).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([post]);
  });

  it('hides management actions for a post owned by another user', () => {
    window.localStorage.setItem('writespace_posts', JSON.stringify([{ ...post, authorId: 'u2' }]));
    renderDetail();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to All Posts' })).toBeInTheDocument();
  });
});
