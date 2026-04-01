import { BySalesManagerCard } from './BySalesManagerCard.jsx';
import { ByWeekCard } from './ByWeekCard.jsx';
import { DashboardTile } from './DashboardTile.jsx';

/**
 * Fila inferior: By Sales Manager (8) + By week (4) desde `md`.
 */
export function DashboardBottomRow({ className = '' }) {
  return (
    <div
      className={`grid min-h-0 grid-cols-12 gap-px bg-neutral-200 md:h-full md:min-h-0 ${className}`.trim()}
      aria-label="Detalle y tendencia"
    >
      <div className="col-span-12 flex min-h-0 min-w-0 flex-col bg-neutral-100 md:col-span-8">
        <DashboardTile>
          <BySalesManagerCard />
        </DashboardTile>
      </div>
      <div className="col-span-12 flex min-h-0 min-w-0 flex-col bg-neutral-100 md:col-span-4">
        <DashboardTile>
          <ByWeekCard />
        </DashboardTile>
      </div>
    </div>
  );
}
