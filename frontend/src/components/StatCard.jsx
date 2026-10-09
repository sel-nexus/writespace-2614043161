import PropTypes from 'prop-types';

const tones = {
  indigo: 'bg-indigo-50 text-indigo-700',
  violet: 'bg-violet-50 text-violet-700',
  pink: 'bg-pink-50 text-pink-700',
  teal: 'bg-teal-50 text-teal-700',
};

/**
 * Render a dashboard statistic with a colored icon tile.
 * @param {{label: string, value: number, tone: string, mark: string}} props Statistic properties.
 * @returns {JSX.Element} Statistic card.
 */
export default function StatCard({ label, value, tone, mark }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900">{value}</p>
        </div>
        <span aria-hidden="true" className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${tones[tone] || tones.indigo}`}>{mark}</span>
      </div>
    </article>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  tone: PropTypes.string.isRequired,
  mark: PropTypes.string.isRequired,
};
