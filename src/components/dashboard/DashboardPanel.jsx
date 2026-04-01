/**
 * Contenedor común para tarjetas del dashboard (título + acción opcional).
 */
export function DashboardPanel({
  title,
  titleClassName = '',
  headerRight = null,
  children,
  className = '',
}) {
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-neutral-200/90 bg-white shadow-sm ${className}`.trim()}
    >
      <div className="shrink-0 px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className={`font-semibold tracking-tight text-neutral-900 ${titleClassName}`.trim()}>{title}</h2>
          {headerRight}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
        {children}
      </div>
    </div>
  );
}
