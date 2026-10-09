import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WriteBlog from './WriteBlog';

const session = { userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' };
const post = { id: 'p1', title: 'Existing note', content: 'Existing content', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Reader' };

afterEach(() => vi.useRealTimers());

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('writespace_session', JSON.stringify(session));
});

function renderEditor(path = '/write') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<WriteBlog />} path="/write" />
        <Route element={<WriteBlog />} path="/edit/:id" />
        <Route element={<p>Blogs destination</p>} path="/blogs" />
        <Route element={<p>Post destination</p>} path="/blog/:id" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('post editor', () => {
  it('creates a post with the complete session author data and navigates to its detail', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('crypto', { randomUUID: () => 'new-post-id' });
    renderEditor();
    await user.type(screen.getByLabelText('Title'), 'A new thought');
    await user.type(screen.getByLabelText('Content'), 'Words worth keeping.');
    expect(screen.getByText('20 characters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Publish Post' }));
    expect(await screen.findByText('Post destination')).toBeInTheDocument();
    const [createdPost] = JSON.parse(window.localStorage.getItem('writespace_posts'));
    expect(createdPost).toEqual({ id: 'new-post-id', title: 'A new thought', content: 'Words worth keeping.', createdAt: expect.any(String), authorId: 'u1', authorName: 'Reader', authorRole: 'user' });
    expect(new Date(createdPost.createdAt).toISOString()).toBe(createdPost.createdAt);
    vi.unstubAllGlobals();
  });

  it('shows field-level errors and does not save empty or whitespace-only fields', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByRole('button', { name: 'Publish Post' }));
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Content is required.')).toBeInTheDocument();
    expect(window.localStorage.getItem('writespace_posts')).toBeNull();
    await user.type(screen.getByLabelText('Title'), '   ');
    await user.type(screen.getByLabelText('Content'), '   ');
    await user.click(screen.getByRole('button', { name: 'Publish Post' }));
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Content is required.')).toBeInTheDocument();
    expect(window.localStorage.getItem('writespace_posts')).toBeNull();
  });

  it('prefills and persists an owned post edit without changing its identity or author metadata', async () => {
    const user = userEvent.setup();
    const originalPost = { ...post, authorRole: 'user' };
    window.localStorage.setItem('writespace_posts', JSON.stringify([originalPost]));
    renderEditor('/edit/p1');
    expect(screen.getByLabelText('Title')).toHaveValue('Existing note');
    expect(screen.getByLabelText('Content')).toHaveValue('Existing content');
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated note');
    await user.clear(screen.getByLabelText('Content'));
    await user.type(screen.getByLabelText('Content'), 'Updated content');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText('Post destination')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([{ ...originalPost, title: 'Updated note', content: 'Updated content' }]);
  });

  it('shows a save error and preserves the form when creating a post cannot be saved', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('crypto', { randomUUID: () => 'failed-post-id' });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage unavailable'); });
    renderEditor();
    await user.type(screen.getByLabelText('Title'), 'Unsaved thought');
    await user.type(screen.getByLabelText('Content'), 'This should remain in the form.');
    await user.click(screen.getByRole('button', { name: 'Publish Post' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save this post in your browser.');
    expect(screen.getByLabelText('Title')).toHaveValue('Unsaved thought');
    expect(screen.queryByText('Post destination')).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('shows a save error and preserves the original post when an edit cannot be saved', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('writespace_posts', JSON.stringify([post]));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage unavailable'); });
    renderEditor('/edit/p1');
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Unsaved update');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save this post in your browser.');
    expect(screen.getByLabelText('Title')).toHaveValue('Unsaved update');
    expect(screen.queryByText('Post destination')).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([post]);
  });

  it('redirects a user away from another account post edit', () => {
    window.localStorage.setItem('writespace_posts', JSON.stringify([{ ...post, authorId: 'u2' }]));
    renderEditor('/edit/p1');
    expect(screen.getByText('Blogs destination')).toBeInTheDocument();
  });

  it('cancel returns to the collection without saving', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.type(screen.getByLabelText('Title'), 'Unsaved');
    await user.click(screen.getAllByRole('link', { name: 'Cancel' })[0]);
    expect(await screen.findByText('Blogs destination')).toBeInTheDocument();
    expect(window.localStorage.getItem('writespace_posts')).toBeNull();
  });
});
