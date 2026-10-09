import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import StatCard from '../components/StatCard';
import { getSession } from '../utils/auth';
import { getPosts, getUsers, savePosts } from '../utils/storage';

/**
 * Render admin statistics and recent post management actions.
 * @returns {JSX.Element} Admin dashboard.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const posts = [...getPosts()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const users = getUsers();
  const stats = [
    { label: 'Total Posts', value: posts.length, tone: 'indigo', mark: 'P' },
    { label: 'Total Users', value: users.length, tone: 'violet', mark: 'U' },
    { label: 'Total Admins', value: users.filter((user) => user.role === 'admin').length + 1, tone: 'pink', mark: 'A' },
    { label: 'Total users', value: users.length, tone: 'teal', mark: 'U' },
  ];
  const deletePost = (post) => {
    if (!window.confirm(`Delete “${post.title}”? This action cannot be undone.`)) return;
    savePosts(getPosts().filter((entry) => entry.id !== post.id));
    navigate('/admin', { replace: true });
  };
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
          <p className="font-medium text-white/80">WriteSpace overview</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome, {session?.displayName || 'Admin'}</h1>
          <p className="mt-3 max-w-2xl text-white/90">Manage the posts and accounts stored in this browser.</p>
        </section>
        <section aria-label="Dashboard statistics" className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => <StatCard key={`${stat.label}-${index}`} {...stat} />)}
        </section>
        <section className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" to="/write">Write New Post</Link>
          <Link className="rounded-lg border border-indigo-200 bg-white px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" to="/users">Manage Users</Link>
        </section>
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Recent Posts</h2>
            <Link className="font-semibold text-indigo-700 hover:underline" to="/blogs">All Blogs</Link>
          </div>
          {posts.length ? (
            <div className="space-y-3">
              {posts.slice(0, 5).map((post) => (
                <article className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4" key={post.id}>
                  <Link className="min-w-0 flex-1" to={`/blog/${post.id}`}>
                    <h3 className="truncate font-semibold text-slate-900 hover:text-indigo-700">{post.title}</h3>
                    <span className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Avatar className="h-7 w-7 text-sm" role={post.authorRole || 'user'} />{post.authorName || 'Unknown author'}</span>
                  </Link>
                  <div className="flex gap-2">
                    <Link className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50" to={`/edit/${post.id}`}>Edit</Link>
                    <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100" onClick={() => deletePost(post)} type="button">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="rounded-xl bg-slate-50 p-8 text-center text-slate-600">No posts yet. Create the first one.</p>}
        </section>
      </div>
    </main>
  );
}
