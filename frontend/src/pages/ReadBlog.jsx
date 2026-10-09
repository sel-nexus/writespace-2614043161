import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { getSession } from '../utils/auth';
import { getPosts, savePosts } from '../utils/storage';

/**
 * Render a full post with role- and ownership-aware edit/delete actions.
 * @returns {JSX.Element} Post detail page or not-found state.
 */
export default function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const post = getPosts().find((entry) => entry.id === id);
  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Post not found</h1>
        <p className="mt-3 text-slate-600">This post may have been removed or is not available in this browser.</p>
        <Link className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" to="/blogs">Back to All Posts</Link>
      </main>
    );
  }
  const canManage = session?.role === 'admin' || post.authorId === session?.userId;
  const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Date unavailable';
  const removePost = () => {
    if (!canManage || !window.confirm('Delete this post? This action cannot be undone.')) return;
    savePosts(getPosts().filter((entry) => entry.id !== post.id));
    navigate('/blogs', { replace: true });
  };
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-12 sm:px-6 lg:py-16">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <Link className="font-medium text-indigo-700 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500" to="/blogs">← Back to All Posts</Link>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900">{post.title}</h1>
        <div className="mt-6 flex items-center gap-3">
          <Avatar role={post.authorRole || (post.authorId === 'writespace-default-admin' ? 'admin' : 'user')} />
          <div>
            <p className="font-semibold text-slate-800">{post.authorName || 'Unknown author'}</p>
            <p className="text-sm text-slate-500">{date}</p>
          </div>
        </div>
        <div className="mt-8 whitespace-pre-wrap break-words leading-8 text-slate-700">{post.content}</div>
        <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          {canManage ? <>
            <Link className="rounded-lg border border-indigo-200 bg-white px-4 py-2 font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" to={`/edit/${post.id}`}>Edit</Link>
            <button className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" onClick={removePost} type="button">Delete</button>
          </> : <Link className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" to="/blogs">Back to All Posts</Link>}
        </div>
      </article>
    </main>
  );
}
