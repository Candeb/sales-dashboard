import { DashboardSiteBar } from '../dashboard/DashboardSiteBar.jsx';
import { useVendorDailySales } from '../../hooks/useVendorDailySales.js';
import { IoMdRefresh } from 'react-icons/io';

function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

export function VendorDetailPage({ vendorId, vendorName, onBack }) {
  const { today, items, loading, error, summary } = useVendorDailySales(vendorId);

  return (
    <div className="min-h-dvh overflow-y-auto bg-neutral-200 font-sans antialiased md:h-dvh md:overflow-hidden">
      <div className="mx-auto box-border flex min-h-dvh w-full max-w-[1600px] flex-col gap-3 bg-neutral-200 px-3 py-3 sm:px-4 sm:py-4 md:h-full md:min-h-0 md:px-5 md:py-5 lg:px-6 lg:py-6">
        <DashboardSiteBar />
        <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-red-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Volver
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-neutral-900 sm:text-xl">
               {vendorName}
              </h2>
              <p className="text-xs text-neutral-500 sm:text-sm text-center">
                Ventas del día {today}
              </p>
            </div>
            <div className="text-right text-xs text-neutral-600 sm:text-sm">
              <p>Vendedor {vendorId}</p>
              <p>Items: {items.length}</p>
              <p>Total: {formatARS(summary.totalMonto)}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <IoMdRefresh
                aria-hidden="true"
                className="size-8 animate-spin text-orange-500 sm:size-9"
              />
              <p className="text-sm font-medium text-black-600">Cargando detalle del vendedor…</p>
            </div>
          ) : null}

          {!loading && error ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : null}

          {!loading && !error ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <ul className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <li key={`${item.id}-${item.articuloId}`} className="grid grid-cols-12 gap-2 py-2 text-sm">
                    <p className="col-span-12 truncate font-medium text-neutral-900 sm:col-span-7">
                      {item.descripcion}
                    </p>
                    <p className="col-span-4 text-neutral-600 sm:col-span-2">Art: {item.articuloId || '-'}</p>
                    <p className="col-span-4 text-neutral-600 sm:col-span-1">Cant: {item.cantidad}</p>
                    <p className="col-span-4 text-right font-semibold text-neutral-900 sm:col-span-2">
                      {formatARS(item.monto)}
                    </p>
                  </li>
                ))}
              </ul>
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-500">
                  No hay ventas para este vendedor en la fecha seleccionada.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
