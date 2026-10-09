import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { getPosts } from '../utils/storage';
import { getSession } from '../utils/auth';

const features = [
  { title: 'Write Freely', description: 'Plain-text writing keeps your ideas clear and distraction-free.', mark: '01', tone: 'bg-indigo-50 text-indigo-700' },
  { title: 'Private & Local', description: 'Your posts and account stay in this browser, under your control.', mark: '02', tone: 'bg-violet-50 text-violet-700' },
  { title: 'Instant & Fast', description: 'A lightweight static experience with no server and no lag.', mark: '03', tone: 'bg-pink-50 text-pink-700' },
];

/**
 * Render the public landing page and recent local post previews.
 * @returns {JSX.Element} Landing page.
 */
export default function LandingPage() {
  const posts = [...getPosts()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const session = getSession();
  const readingPath = session ? (session.role === 'admin' ? '/admin' : '/blogs') : '/login';
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PublicNavbar />
      <main>
        <section className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-4 py-16 text-white sm:px-8">
          <div aria-hidden="true" className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">A quieter place to write</p>
              <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Your thoughts.<br />Your space.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">Your thoughts. Your space. Beautifully simple.</p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link className="rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700" to={readingPath}>Start Reading</Link>
                <Link className="rounded-xl border border-white/70 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-700" to="/register">Get Started Free</Link>
              </div>
            </div>
            <div aria-label="A preview of a simple writing space" className="relative mx-auto w-full max-w-md animate-float rounded-2xl border border-white/50 bg-white p-6 text-slate-800 shadow-2xl shadow-indigo-950/20 motion-reduce:animate-none">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="font-bold text-indigo-700">WriteSpace</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">Draft</span>
              </div>
              <p className="mt-6 text-sm font-medium text-slate-500">A note to begin</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Make room for the thought.</h2>
              <p className="mt-4 leading-relaxed text-slate-600">A clear page, a few honest words, and the freedom to keep going.</p>
              <div className="mt-8 flex items-center justify-between text-sm text-slate-500"><span>Plain text, always</span><span>Saved locally</span></div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">A simple space for your words</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">Everything you need to write and read, without the noise.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg" key={feature.title}>
                <span aria-hidden="true" className={`inline-flex h-11 w-11 items-center justify-center rounded-xl font-bold ${feature.tone}`}>{feature.mark}</span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="bg-white px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Recent writing</h2>
                <p className="mt-2 text-slate-600">A few recent posts from this browser.</p>
              </div>
              <Link className="font-semibold text-indigo-700 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" to={readingPath}>All Blogs</Link>
            </div>
            {posts.length ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {posts.map((post) => (
                  <Link className="group rounded-2xl border border-slate-200 border-t-4 border-t-indigo-500 bg-slate-50 p-6 transition-transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" key={post.id} to={`/blog/${post.id}`}>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700">{post.title}</h3>
                    <p className="mt-3 leading-relaxed text-slate-600">{(post.content || '').slice(0, 120)}{(post.content || '').length > 120 ? '…' : ''}</p>
                    <p className="mt-5 text-sm text-slate-500">{post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : ''}</p>
                  </Link>
                ))}
              </div>
            ) : <p className="rounded-2xl bg-slate-50 p-8 text-center text-slate-600">No posts yet - check back soon!</p>}
          </div>
        </section>
      </main>
      <footer className="bg-slate-900 px-4 py-10 text-slate-200 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-lg font-bold text-white" to="/">WriteSpace</Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link className="hover:text-white" to="/">Home</Link>
            <Link className="hover:text-white" to={readingPath}>All Blogs</Link>
            <Link className="hover:text-white" to="/login">Login</Link>
            <Link className="hover:text-white" to="/register">Register</Link>
          </nav>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} WriteSpace</p>
        </div>
      </footer>
    </div>
  );
}
