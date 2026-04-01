import { getSigApiEnv } from '../../config/sigEnv.js';
import { useExportPedidosTotal } from '../../hooks/useExportPedidosTotal.js';
import { DashboardPanel } from './DashboardPanel.jsx';
import { IoMdRefresh } from 'react-icons/io';

const DEFAULT_GOAL = 500_000_000;

function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatARSShort(n) {
  if (n >= 1_000_000) {
    return `$ ${(n / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 0 })} M`;
  }
  if (n >= 1_000) {
    return `$ ${(n / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 })} mil`;
  }
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

function GaugeContent({ goal, total }) {
  const r = 94;
  const cx = 120;
  const cy = 122;
  const safeGoal = Number.isFinite(goal) && goal > 0 ? goal : DEFAULT_GOAL;
  const roundedTotal = Number.isFinite(total) ? Math.round(total) : 0;
  const pct = Math.min(1, Math.max(0, roundedTotal / safeGoal));
  const filledPct = pct * 100;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <div className="relative w-full max-w-[300px] shrink-0">
        <svg viewBox="0 0 240 170" className="h-auto w-full max-h-[180px] overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="gauge-red" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.76 0.15 52)" />
              <stop offset="100%" stopColor="oklch(0.68 0.17 34)" />
            </linearGradient>
          </defs>
          <path
            d={d}
            fill="none"
            stroke="#e9eef3"
            strokeWidth="18"
            strokeLinecap="round"
            pathLength={100}
          />
          {filledPct > 0 ? (
            <path
              d={d}
              fill="none"
              stroke="url(#gauge-red)"
              strokeWidth="18"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${filledPct} 100`}
              strokeDashoffset="0"
              style={{ transition: 'stroke-dasharray 900ms ease-out' }}
            />
          ) : null}
          <text
            x={cx - r}
            y={cy + 24}
            textAnchor="middle"
            className="fill-neutral-500 text-[11px] font-semibold tabular-nums"
          >
            {formatARSShort(0)}
          </text>
          <text
            x={cx + r}
            y={cy + 24}
            textAnchor="middle"
            className="fill-neutral-500 text-[11px] font-semibold tabular-nums"
          >
            {formatARSShort(goal)}
          </text>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-10 text-center">
          <p className="text-[1.85rem] font-bold tabular-nums tracking-tight text-neutral-900 sm:text-[1.2rem]">
            {formatARS(total)}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Total de ventas del día desde ExportPedidos (fecha de hoy).
 * @param {{ goal?: number }} [props]
 */
export function TotalSalesCard({ goal: goalProp } = {}) {
  const env = getSigApiEnv();
  const goal = goalProp ?? env.salesGoal ?? DEFAULT_GOAL;
  const { total, loading, error, secondsUntilAllowed, refreshFromApi, retry } = useExportPedidosTotal();
  const forcedTotal = typeof total === 'number' && Number.isFinite(total) ? total : 0;

  const hasTotal = typeof total === 'number' && Number.isFinite(total);
  const showInitialLoading = loading && !hasTotal && !error;
  const showFatalError = !!error && !hasTotal;
  const canHitApi = !loading && secondsUntilAllowed <= 0;

  async function handleRefreshClick() {
    if (hasTotal) {
      await refreshFromApi();
      return;
    }
    await retry();
  }

  const refreshHeaderButton = (
    <button
      type="button"
      onClick={() => void handleRefreshClick()}
      disabled={!canHitApi}
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 sm:size-9"
      aria-label={
        canHitApi ? 'Actualizar datos' : `Esperar ${secondsUntilAllowed} segundos para actualizar`
      }
      title={canHitApi ? 'Actualizar datos' : `${secondsUntilAllowed}s`}
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
    <DashboardPanel
      title="Ventas totales"
      titleClassName="text-xl font-bold sm:text-2xl"
      headerRight={refreshHeaderButton}
    >
      {showFatalError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : null}

      {showInitialLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-sm text-neutral-500">Cargando ventas del día…</p>
        </div>
      ) : null}

      {hasTotal ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {error ? (
            <p className="mb-2 rounded-md bg-red-50 px-2 py-1.5 text-center text-xs text-red-700">{error}</p>
          ) : null}
          <GaugeContent goal={goal} total={forcedTotal} />
   
        </div>
      ) : null}
    </DashboardPanel>
  );
}
