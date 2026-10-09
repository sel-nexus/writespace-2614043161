import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { getSession } from '../utils/auth';
import { getPosts } from '../utils/storage';

/**
 * Render the authenticated newest-first post collection and its empty state.
 * @returns {JSX.Element} Blog collection page.
 */
export default function Home() {
  const session = getSession();
  const posts = [...getPosts()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-semibold text-indigo-700">WriteSpace community</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">All Blogs</h1>
            <p className="mt-3 text-slate-600">Read what people are writing in this browser.</p>
          </div>
          <Link className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" to="/write">Write a Post</Link>
        </div>
        {posts.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard canEdit={session?.role === 'admin' || post.authorId === session?.userId} index={index} key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-bold text-slate-900">No blogs yet. Be the first to write one!</h2>
            <p className="mt-3 text-slate-600">Start with a thought you want to share.</p>
            <Link className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" to="/write">Write a Post</Link>
          </section>
        )}
      </div>
    </main>
  );
}
