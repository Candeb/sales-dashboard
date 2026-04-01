import { ByCategoryCard } from './ByCategoryCard.jsx';
import { ByQuarterCard } from './ByQuarterCard.jsx';
import { DashboardTile } from './DashboardTile.jsx';
import { TotalSalesCard } from './TotalSalesCard.jsx';

/**
 * Fila superior: Total sales, By category, By quarter (12 cols → 4+4+4 desde `sm`).
 */
export function DashboardTopRow({ className = '' }) {
  return (
    <div
      className={`grid min-h-0 grid-cols-12 gap-px bg-neutral-200 md:h-full md:min-h-0 ${className}`.trim()}
      aria-label="Resumen de ventas"
    >
      <div className="col-span-12 flex min-h-0 min-w-0 flex-col bg-neutral-100 sm:col-span-4">
        <DashboardTile>
          <TotalSalesCard />
        </DashboardTile>
      </div>
      <div className="col-span-12 flex min-h-0 min-w-0 flex-col bg-neutral-100 sm:col-span-4">
        <DashboardTile>
          <ByCategoryCard />
        </DashboardTile>
      </div>
      <div className="col-span-12 flex min-h-0 min-w-0 flex-col bg-neutral-100 sm:col-span-4">
        <DashboardTile>
          <ByQuarterCard />
        </DashboardTile>
      </div>
    </div>
  );
}
