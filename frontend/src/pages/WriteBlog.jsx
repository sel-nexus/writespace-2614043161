import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getSession } from '../utils/auth';
import { getPosts, savePosts } from '../utils/storage';

/**
 * Render the create/edit post form and enforce ownership before editing.
 * @returns {JSX.Element} Post editor or a redirect for unauthorized edits.
 */
export default function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const editing = Boolean(id);
  const posts = getPosts();
  const existing = editing ? posts.find((post) => post.id === id) : null;
  const canEdit = existing && (session?.role === 'admin' || existing.authorId === session?.userId);
  const [title, setTitle] = useState(canEdit ? existing.title : '');
  const [content, setContent] = useState(canEdit ? existing.content : '');
  const [errors, setErrors] = useState({});
  if (editing && !canEdit) return <Navigate replace to="/blogs" />;
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!content.trim()) nextErrors.content = 'Content is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const updated = editing
      ? posts.map((post) => post.id === id ? { ...post, title: title.trim(), content } : post)
      : [...posts, {
        id: crypto.randomUUID(),
        title: title.trim(),
        content,
        createdAt: new Date().toISOString(),
        authorId: session.userId,
        authorName: session.displayName,
        authorRole: session.role,
      }];
    if (!savePosts(updated)) {
      setErrors({ form: 'Unable to save this post in your browser.' });
      return;
    }
    const postId = editing ? id : updated[updated.length - 1].id;
    navigate(`/blog/${postId}`, { replace: true });
  };
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-12 sm:px-6 lg:py-16">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <Link className="font-medium text-indigo-700 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500" to={editing ? `/blog/${id}` : '/blogs'}>Cancel</Link>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">{editing ? 'Edit Post' : 'Write a Post'}</h1>
        <p className="mt-2 text-slate-600">Keep it plain, clear, and yours.</p>
        <form className="mt-8 space-y-6" noValidate onSubmit={submit}>
          <div>
            <label className="mb-2 block font-medium text-slate-700" htmlFor="title">Title</label>
            <input aria-describedby={errors.title ? 'title-error' : undefined} aria-invalid={Boolean(errors.title)} className="w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" id="title" onChange={(event) => setTitle(event.target.value)} required value={title} />
            {errors.title && <p className="mt-2 text-sm text-red-700" id="title-error" role="alert">{errors.title}</p>}
          </div>
          <div>
            <label className="mb-2 block font-medium text-slate-700" htmlFor="content">Content</label>
            <textarea aria-describedby={errors.content ? 'content-error' : undefined} aria-invalid={Boolean(errors.content)} className="min-h-64 w-full resize-y rounded-lg border border-slate-300 px-3 py-3 leading-relaxed text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" id="content" onChange={(event) => setContent(event.target.value)} required value={content} />
            <p className="mt-2 text-right text-sm text-slate-500">{content.length} characters</p>
            {errors.content && <p className="mt-2 text-sm text-red-700" id="content-error" role="alert">{errors.content}</p>}
          </div>
          {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{errors.form}</p>}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Link className="rounded-lg px-4 py-2 text-center font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2" to={editing ? `/blog/${id}` : '/blogs'}>Cancel</Link>
            <button className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" type="submit">{editing ? 'Save Changes' : 'Publish Post'}</button>
          </div>
        </form>
      </section>
    </main>
  );
}

