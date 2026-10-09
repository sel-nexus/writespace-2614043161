import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WriteBlog from './WriteBlog';

const session = { userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' };
const post = { id: 'p1', title: 'Existing note', content: 'Existing content', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Reader' };

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
  it('creates a post with session author data and navigates to its detail', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('crypto', { randomUUID: () => 'new-post-id' });
    renderEditor();
    await user.type(screen.getByLabelText('Title'), 'A new thought');
    await user.type(screen.getByLabelText('Content'), 'Words worth keeping.');
    expect(screen.getByText('20 characters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Publish Post' }));
    expect(await screen.findByText('Post destination')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))[0]).toMatchObject({ id: 'new-post-id', title: 'A new thought', content: 'Words worth keeping.', authorId: 'u1', authorName: 'Reader' });
    vi.unstubAllGlobals();
  });

  it('shows field-level errors and does not save empty fields', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByRole('button', { name: 'Publish Post' }));
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Content is required.')).toBeInTheDocument();
    expect(window.localStorage.getItem('writespace_posts')).toBeNull();
  });

  it('prefills and persists an owned post edit', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('writespace_posts', JSON.stringify([post]));
    renderEditor('/edit/p1');
    expect(screen.getByLabelText('Title')).toHaveValue('Existing note');
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated note');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText('Post destination')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))[0].title).toBe('Updated note');
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
