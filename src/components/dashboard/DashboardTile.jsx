/**
 * Envoltorio por celda: padding respecto a los bordes del grid y cadena flex para que la tarjeta ocupe bien la altura.
 */
export function DashboardTile({ children, className = '' }) {
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col items-stretch p-2.5 sm:p-3 md:p-3 lg:p-5 ${className}`.trim()}
    >
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col">{children}</div>
    </div>
  );
}
