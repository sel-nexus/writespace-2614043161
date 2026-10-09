import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

const borderClasses = ['border-indigo-500', 'border-violet-500', 'border-pink-500', 'border-teal-500'];

/**
 * Render a post summary with author details and an optional edit action.
 * @param {{post: Object, index: number, canEdit: boolean}} props Card properties.
 * @returns {JSX.Element} Blog card.
 */
export default function BlogCard({ post, index, canEdit }) {
  const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Date unavailable';
  return (
    <article className={`relative rounded-2xl border border-slate-200 border-t-4 ${borderClasses[index % borderClasses.length]} bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg`}>
      <Link aria-label={`Read ${post.title}`} className="absolute inset-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500" to={`/blog/${post.id}`} />
      <div className="relative pointer-events-none">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{post.title}</h2>
          {canEdit && <Link aria-label={`Edit ${post.title}`} className="pointer-events-auto rounded-lg p-2 text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={(event) => event.stopPropagation()} to={`/edit/${post.id}`}>Edit</Link>}
        </div>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-600">{(post.content || '').slice(0, 120)}{(post.content || '').length > 120 ? '…' : ''}</p>
        <div className="mt-6 flex items-center gap-3">
          <Avatar role={post.authorRole || 'user'} />
          <div>
            <p className="font-medium text-slate-800">{post.authorName || 'Unknown author'}</p>
            <p className="text-sm text-slate-500">{date}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string.isRequired, content: PropTypes.string, createdAt: PropTypes.string, authorName: PropTypes.string, authorRole: PropTypes.string }).isRequired,
  index: PropTypes.number.isRequired,
  canEdit: PropTypes.bool.isRequired,
};
