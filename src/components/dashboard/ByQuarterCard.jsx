import { DashboardPanel } from './DashboardPanel.jsx';

const MOCK = [
  { id: 'q1', label: 'T1 2021', amount: 120_000 },
  { id: 'q2', label: 'T2 2021', amount: 165_000 },
  { id: 'q3', label: 'T3 2021', amount: 210_000 },
  { id: 'q4', label: 'T4 2021', amount: 285_000 },
];

const Y_MAX = 300_000;

function formatAxis(n) {
  if (n === 0) return '0';
  return `${(n / 1000).toLocaleString('es-AR', { maximumFractionDigits: 0 })} mil`;
}

/**
 * Barras verticales por trimestre.
 */
export function ByQuarterCard({ quarters = MOCK, yMax = Y_MAX } = {}) {
  const yTicks = [0, 100_000, 200_000, 300_000];

  return (
    <DashboardPanel title="Por trimestre">
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex shrink-0 flex-col justify-between pt-1 pb-6 text-[10px] tabular-nums text-neutral-400 sm:text-xs">
          {[...yTicks].reverse().map((t) => (
            <span key={t} className="leading-none">
              {formatAxis(t)}
            </span>
          ))}
        </div>
        <div className="relative min-h-0 min-w-0 flex-1">
          <div
            className="flex h-[min(22vh,11rem)] min-h-[120px] items-end gap-2 border-b border-l border-neutral-200 pb-0.5 pl-1 sm:h-[min(26vh,13rem)] sm:gap-3"
            role="list"
            aria-label="Ventas por trimestre"
          >
            {quarters.map((q) => {
              const h = Math.min(100, (q.amount / yMax) * 100);
              return (
                <div key={q.id} className="flex h-full min-w-0 flex-1 flex-col justify-end" role="listitem">
                  <div
                    className="mx-auto w-[72%] max-w-[3.25rem] rounded-t-md sm:max-w-[3.75rem]"
                    style={{
                      height: `${h}%`,
                      minHeight: '6px',
                      backgroundColor: 'oklch(0.71 0.17 34.5)',
                    }}
                    title={`${q.label}: ${q.amount}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[10px] font-medium text-neutral-600 sm:gap-3 sm:text-xs">
            {quarters.map((q) => (
              <span key={q.id} className="truncate px-0.5">
                {q.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}
