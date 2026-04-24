import { DashboardPanel } from './DashboardPanel.jsx';
import { useQuarterSales } from '../../hooks/useQuarterSales.js';
import { IoMdRefresh } from 'react-icons/io';

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

function roundUpNice(n) {
  const safe = Math.max(1, n);
  const magnitude = 10 ** Math.floor(Math.log10(safe));
  const normalized = safe / magnitude;
  let nice = 1;
  if (normalized > 1) nice = 2;
  if (normalized > 2) nice = 2.5;
  if (normalized > 2.5) nice = 5;
  if (normalized > 5) nice = 10;
  return nice * magnitude;
}

function buildTicks(max) {
  const axisMax = roundUpNice(max);
  const step = axisMax / 3;
  const ticks = Array.from({ length: 4 }, (_, i) => Math.round(step * i));
  return { axisMax, ticks };
}

function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

function RefreshIcon({ spinning = false }) {
  return (
    <IoMdRefresh aria-hidden="true" className={`size-4 ${spinning ? 'animate-spin' : ''}`} />
  );
}

/**
 * Barras verticales por trimestre.
 */
export function ByQuarterCard({ quarters = MOCK, yMax = Y_MAX } = {}) {
  const {
    quarters: apiQuarters,
    loading,
    error,
    secondsUntilAllowed,
    refreshFromApi,
  } = useQuarterSales();
  const data = apiQuarters.length > 0 ? apiQuarters : [];
  const maxValue = Math.max(1, ...data.map((q) => q.amount), yMax);
  const { axisMax, ticks: yTicks } = buildTicks(maxValue);
  const canHitApi = !loading && secondsUntilAllowed <= 0;
  const showInitialLoading = loading && data.length === 0;
  const showEmptyState = !loading && data.length === 0;

  const refreshHeaderButton = (
    <button
      type="button"
      onClick={() => void refreshFromApi()}
      disabled={!canHitApi}
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 sm:size-9"
      aria-label={
        canHitApi
          ? 'Actualizar ventas trimestrales'
          : `Esperar ${secondsUntilAllowed} segundos para actualizar`
      }
      title={canHitApi ? 'Actualizar ventas trimestrales' : `${secondsUntilAllowed}s`}
    >
      {canHitApi ? (
        <RefreshIcon spinning={loading} />
      ) : (
        <span className="text-[10px] font-semibold leading-none tabular-nums sm:text-[11px]">
          {secondsUntilAllowed}s
        </span>
      )}
    </button>
  );

  return (
    <DashboardPanel title="Por trimestre" headerRight={refreshHeaderButton}>
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
      {showInitialLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-neutral-500">Cargando ventas trimestrales…</p>
        </div>
      ) : null}
      {showEmptyState ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-neutral-500">Sin datos trimestrales para mostrar.</p>
        </div>
      ) : null}
      {!showInitialLoading && !showEmptyState ? (
      <div className="flex min-h-0 flex-1 gap-1.5 overflow-hidden sm:gap-2">
        <div className="flex shrink-0 flex-col justify-between pt-1 pb-5 text-[9px] tabular-nums text-neutral-400 sm:text-[10px]">
          {[...yTicks].reverse().map((t) => (
            <span key={t} className="leading-none">
              {formatAxis(t)}
            </span>
          ))}
        </div>
        <div className="relative min-h-0 min-w-0 flex-1">
          <div
            className="flex h-[min(17vh,8.2rem)] min-h-[90px] items-end gap-1.5 border-b border-l border-neutral-200 pb-0.5 pl-1 sm:h-[min(20vh,9.5rem)] sm:gap-2"
            role="list"
            aria-label="Ventas por trimestre"
          >
            {data.map((q) => {
              const h = Math.min(100, (q.amount / axisMax) * 100);
              return (
                <div key={q.id} className="flex h-full min-w-0 flex-1 flex-col justify-end" role="listitem">
                  <div
                    className="mx-auto w-[70%] max-w-[2.6rem] rounded-t-md sm:max-w-[3rem]"
                    style={{
                      height: `${h}%`,
                      minHeight: '6px',
                      backgroundColor: 'oklch(0.66 0.17 31)',
                    }}
                    title={`${q.label}: ${formatARS(q.amount)}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5 text-center text-[9px] font-medium text-neutral-600 sm:gap-2 sm:text-[10px]">
            {data.map((q) => (
              <span key={q.id} className="truncate px-0.5">
                {q.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      ) : null}
    </DashboardPanel>
  );
}
