import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BlogCard from './BlogCard';

const post = {
  id: 'post-1',
  title: 'A useful post',
  content: 'A short summary.',
  authorName: 'Writer',
  authorRole: 'user',
};

function renderCard(canEdit) {
  return render(
    <MemoryRouter>
      <BlogCard post={post} index={0} canEdit={canEdit} />
    </MemoryRouter>,
  );
}

describe('BlogCard edit visibility', () => {
  it('shows the edit action when the current user owns the post', () => {
    renderCard(true);
    expect(screen.getByRole('link', { name: 'Edit A useful post' })).toHaveAttribute('href', '/edit/post-1');
  });

  it('shows the edit action when an admin can edit the post', () => {
    renderCard(true);
    expect(screen.getByRole('link', { name: 'Edit A useful post' })).toBeInTheDocument();
  });

  it('hides the edit action when a regular user does not own the post', () => {
    renderCard(false);
    expect(screen.queryByRole('link', { name: 'Edit A useful post' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read A useful post' })).toHaveAttribute('href', '/blog/post-1');
  });
});
