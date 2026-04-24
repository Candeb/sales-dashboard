import { useMemo, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
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
export function BySalesManagerCard({ onOpenVendor } = {}) {
  const { items, loading, error } = useExportVendedores();
  const [search, setSearch] = useState('');
  const managers = items.length > 0 ? items : error ? MOCK : [];
  const normalizedSearch = search.trim().toLocaleLowerCase('es-AR');
  const filteredManagers = useMemo(() => {
    if (!normalizedSearch) return managers;
    return managers.filter((m) => {
      const nameMatch = m.name.toLocaleLowerCase('es-AR').includes(normalizedSearch);
      const idMatch = String(m.id ?? '')
        .toLocaleLowerCase('es-AR')
        .includes(normalizedSearch);
      return nameMatch || idMatch;
    });
  }, [managers, normalizedSearch]);
  const showNoResults = !loading && filteredManagers.length === 0 && normalizedSearch.length > 0;

  const searchInput = (
    <div className="relative">
      <IoSearch
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400 sm:size-4"
      />
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar vendedor..."
        aria-label="Buscar vendedor"
        className="h-8 w-44 rounded-md border border-neutral-200 bg-neutral-50 pl-7 pr-2.5 text-xs text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:outline-none sm:h-9 sm:w-52 sm:text-sm"
      />
    </div>
  );

  return (
    <DashboardPanel
      title="Por vendedor"
      titleClassName="text-lg font-bold sm:text-xl"
      headerRight={searchInput}
    >
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
      {loading && managers.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-neutral-500">Cargando vendedores…</p>
        </div>
      ) : null}
      {showNoResults ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-neutral-500">
            No hay resultados para la búsqueda "{search.trim()}".
          </p>
        </div>
      ) : null}
      <ul
        className="flex min-h-0 flex-1 flex-col justify-start gap-2.5 overflow-y-auto pt-1 sm:gap-3"
        role="list"
      >
        {filteredManagers.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onOpenVendor?.({ id: m.id, name: m.name })}
              className="group flex w-full items-center gap-2.5 rounded-md border border-transparent px-2 py-1 text-left transition-colors hover:bg-neutral-100 focus-visible:border-neutral-300 focus-visible:bg-neutral-100 focus-visible:outline-none sm:gap-3 cursor-pointer"
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold transition-colors sm:size-9 sm:text-xs ${m.color}`}
                aria-hidden
              >
                {m.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-neutral-900 sm:text-sm">
                  {m.name}
                </p>
                <p className="truncate text-[11px] text-neutral-400 sm:text-xs">ID {m.id}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  );
}
