import { DashboardPanel } from './DashboardPanel.jsx';

/** Puntos normalizados 0–1 (y) para dos series; las fechas son solo labels en el eje X. */
const MOCK = {
  labels: [
    '28 dic 2020',
    '15 mar 2021',
    '1 jun 2021',
    '20 ago 2021',
    '29 nov 2021',
  ],
  seriesA: [0.25, 0.42, 0.55, 0.68, 0.78],
  seriesB: [0.18, 0.35, 0.48, 0.58, 0.72],
};

const Y_TICKS = [0, 10_000, 20_000, 30_000, 40_000];

function formatAxis(n) {
  if (n === 0) return '0';
  return `${(n / 1000).toLocaleString('es-AR', { maximumFractionDigits: 0 })} mil`;
}

function pointsToPath(ys, width, height, padL, padR, padT, padB) {
  const w = width - padL - padR;
  const h = height - padT - padB;
  if (ys.length === 0) return '';
  return ys
    .map((yn, i) => {
      const x = padL + (w * i) / Math.max(1, ys.length - 1);
      const y = padT + h - yn * h;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

/**
 * Serie temporal semanal (mock); sustituir por datos agregados de la API.
 */
export function ByWeekCard({ labels = MOCK.labels, seriesA = MOCK.seriesA, seriesB = MOCK.seriesB } = {}) {
  const vbW = 400;
  const vbH = 200;
  const padL = 36;
  const padR = 12;
  const padT = 10;
  const padB = 42;

  const pathA = pointsToPath(seriesA, vbW, vbH, padL, padR, padT, padB);
  const pathB = pointsToPath(seriesB, vbW, vbH, padL, padR, padT, padB);

  const gridLines = [...Y_TICKS].map((_, i) => {
    const t = i / (Y_TICKS.length - 1);
    const y = padT + (vbH - padT - padB) * t;
    return y;
  });

  return (
    <DashboardPanel title="Por semana">
      <div className="flex min-h-0 flex-1 gap-1.5 sm:gap-2">
        <div className="flex w-7 shrink-0 flex-col justify-between py-1 pb-8 text-[9px] tabular-nums text-neutral-400 sm:w-8 sm:text-[10px]">
          {[...Y_TICKS].reverse().map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">
              {formatAxis(t)}
            </span>
          ))}
        </div>
        <div className="relative min-h-0 min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            className="h-full w-full min-h-[120px] max-h-[min(28vh,220px)]"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Tendencia de ventas por semana (dos series)"
          >
            <title>Ventas por semana</title>
            {gridLines.map((y) => (
              <line
                key={y}
                x1={padL}
                y1={y}
                x2={vbW - padR}
                y2={y}
                stroke="#f5f5f5"
                strokeWidth={1}
              />
            ))}
            <path d={pathB} fill="none" stroke="oklch(0.63 0.15 33)" strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={pathA} fill="none" stroke="oklch(0.72 0.14 47)" strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="mt-1 flex justify-between gap-0.5 px-1 text-[8px] text-neutral-500 sm:text-[9px]">
            {labels.map((lab) => (
              <span key={lab} className="max-w-[4.5rem] text-center leading-tight sm:max-w-none">
                {lab}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}
