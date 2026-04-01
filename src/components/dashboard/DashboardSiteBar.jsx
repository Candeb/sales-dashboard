/**
 * Franja superior del sitio (solo `div` como contenedor; `role="banner"` para accesibilidad).
 */
export function DashboardSiteBar({ className = '' }) {
  return (
    <div
      className={`shrink-0 rounded-lg border border-red-200/80 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4 ${className}`.trim()}
      role="banner"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/logo-paoletti.png"
            alt="Logo Paoletti"
            className="h-9 w-auto shrink-0 rounded-sm sm:h-10"
            loading="eager"
          />
          <h1 className="truncate text-lg font-bold tracking-tight text-black-700 sm:text-xl">
            Panel de ventas Paoletti
          </h1>
        </div>
      </div>
    </div>
  );
}
