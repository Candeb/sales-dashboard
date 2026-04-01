import { DashboardPanel } from './DashboardPanel.jsx';
import { useExportVendedores } from '../../hooks/useExportVendedores.js';

const MOCK = [
  { id: '001', name: 'Delivery', initials: 'DE', color: 'bg-sky-100 text-sky-800' },
  { id: '002', name: 'Mostrador', initials: 'MO', color: 'bg-violet-100 text-violet-800' },
  { id: '003', name: 'Ventas', initials: 'VE', color: 'bg-amber-100 text-amber-900' },
  { id: '004', name: 'Canal Mayorista', initials: 'CM', color: 'bg-emerald-100 text-emerald-800' },
  { id: '005', name: 'Online', initials: 'ON', color: 'bg-rose-100 text-rose-800' },
];

/**
 * Lista de vendedores desde ExportVendedores (nombres reales).
 */
export function BySalesManagerCard() {
  const { items, loading, error } = useExportVendedores();
  const managers = items.length > 0 ? items : error ? MOCK : [];

  return (
    <DashboardPanel title="Por vendedor" titleClassName="text-lg font-bold sm:text-xl">
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
      {loading && managers.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-neutral-500">Cargando vendedores…</p>
        </div>
      ) : null}
      <ul
        className="flex min-h-0 flex-1 flex-col justify-start gap-4 overflow-y-auto pt-1 sm:gap-5"
        role="list"
      >
        {managers.map((m) => (
          <li key={m.id} className="flex items-center gap-3 sm:gap-4">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-md text-xs font-semibold sm:size-11 sm:text-sm ${m.color}`}
              aria-hidden
            >
              {m.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 sm:text-base">{m.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  );
}
