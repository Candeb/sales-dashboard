import { DashboardBottomRow } from './DashboardBottomRow.jsx';
import { DashboardSiteBar } from './DashboardSiteBar.jsx';
import { DashboardTopRow } from './DashboardTopRow.jsx';

/**
 * Cascarón centrado (`max-w` + `mx-auto`) con margen exterior; barra del sitio y dos bloques de grilla.
 * En `md+` la zona de grilla usa el resto de la altura (`flex-1` + `min-h-0`).
 */
export function SalesDashboard() {
  return (
    <div className="min-h-dvh overflow-y-auto bg-neutral-200 font-sans antialiased md:h-dvh md:overflow-hidden">
      <div className="mx-auto box-border flex min-h-dvh w-full max-w-[1600px] flex-col gap-3 bg-neutral-200 px-3 py-3 sm:px-4 sm:py-4 md:h-full md:min-h-0 md:px-5 md:py-5 lg:px-6 lg:py-6">
        <DashboardSiteBar />
        <div className="flex min-h-0 flex-1 flex-col gap-px bg-neutral-200 md:min-h-0">
          <DashboardTopRow className="min-h-0 max-md:flex-none md:flex-1 md:min-h-0" />
          <DashboardBottomRow className="min-h-0 max-md:flex-none md:flex-1 md:min-h-0" />
        </div>
      </div>
    </div>
  );
}
