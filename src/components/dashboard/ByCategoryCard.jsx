import { DashboardPanel } from './DashboardPanel.jsx';
import { useCategorySalesToday } from '../../hooks/useCategorySalesToday.js';
import { IoMdRefresh } from 'react-icons/io';

const MOCK = [
  { id: 'tech', name: 'Tecnología', amount: 271_731 },
  { id: 'office', name: 'Artículos de oficina', amount: 245_591 },
  { id: 'furniture', name: 'Mobiliario', amount: 214_412 },
];

function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCompactARS(n) {
  if (n >= 1_000_000) {
    return `$ ${(n / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} M`;
  }
  if (n >= 1_000) {
    return `$ ${(n / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 })} mil`;
  }
  return formatARS(n);
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
  const step = axisMax / 6;
  const ticks = Array.from({ length: 7 }, (_, i) => Math.round(step * i));
  return { axisMax, ticks };
}

function RefreshIcon({ spinning = false }) {
  return (
    <IoMdRefresh aria-hidden="true" className={`size-4 ${spinning ? 'animate-spin' : ''}`} />
  );
}

/**
 * Barras horizontales por categoría.
 */
export function ByCategoryCard() {
  const { categories, loading, error, secondsUntilAllowed, refreshFromApi } = useCategorySalesToday();
  const data = categories.length > 0 ? categories.slice(0, 4) : error ? MOCK : [];
  const maxValue = Math.max(1, ...data.map((d) => d.amount));
  const { axisMax } = buildTicks(maxValue);
  const canHitApi = !loading && secondsUntilAllowed <= 0;

  const refreshHeaderButton = (
    <button
      type="button"
      onClick={() => void refreshFromApi()}
      disabled={!canHitApi}
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 sm:size-9"
      aria-label={
        canHitApi
          ? 'Actualizar categorías'
          : `Esperar ${secondsUntilAllowed} segundos para actualizar`
      }
      title={canHitApi ? 'Actualizar categorías' : `${secondsUntilAllowed}s`}
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
    <DashboardPanel title="Por categoría" headerRight={refreshHeaderButton}>
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
      {loading && data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-neutral-500">Cargando categorías…</p>
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5">
        <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
          {data.map((row) => {
            const w = Math.min(100, (row.amount / axisMax) * 100);
            return (
              <div key={row.id} className="grid grid-cols-[minmax(0,6.4rem)_1fr] items-center gap-x-2.5 gap-y-1 sm:grid-cols-[6.8rem_1fr]">
                <span className="text-[11px] font-medium text-neutral-700 sm:text-xs">{row.name}</span>
                <div className="min-w-0  pl-1">
                  <div
                    className="relative h-7 w-full overflow-hidden rounded-md bg-neutral-100 ring-1 ring-inset ring-neutral-200/90 sm:h-8"
                    role="presentation"
                  >
                    <div
                      className="relative h-full rounded-md"
                      style={{
                        width: `${w}%`,
                        minWidth: w > 28 ? undefined : '4.25rem',
                        backgroundImage:
                          'linear-gradient(to right, oklch(0.72 0.15 46), oklch(0.64 0.17 31))',
                      }}
                    >
                      <span className="absolute end-1.5 top-1/2 max-w-[calc(100%-0.5rem)] -translate-y-1/2 truncate text-end text-[11px] font-semibold text-white tabular-nums sm:end-2 sm:text-xs">
                        {formatCompactARS(row.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardPanel>
  );
}
