import { useEffect, useState } from 'react';
import { SalesDashboard } from './components/dashboard/SalesDashboard.jsx';
import { VendorDetailPage } from './components/vendors/VendorDetailPage.jsx';

function readViewFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view === 'vendor') {
    return {
      page: 'vendor',
      vendorId: params.get('id') ?? '',
      vendorName: params.get('name') ?? '',
    };
  }
  return { page: 'dashboard', vendorId: '', vendorName: '' };
}

export default function App() {
  const [state, setState] = useState(() => readViewFromLocation());

  useEffect(() => {
    function onPopState() {
      setState(readViewFromLocation());
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function openVendor({ id, name }) {
    const params = new URLSearchParams(window.location.search);
    params.set('view', 'vendor');
    params.set('id', id);
    params.set('name', name);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', nextUrl);
    setState({ page: 'vendor', vendorId: id, vendorName: name });
  }

  function goDashboard() {
    const nextUrl = window.location.pathname;
    window.history.pushState({}, '', nextUrl);
    setState({ page: 'dashboard', vendorId: '', vendorName: '' });
  }

  if (state.page === 'vendor') {
    return (
      <VendorDetailPage
        vendorId={state.vendorId}
        vendorName={state.vendorName}
        onBack={goDashboard}
      />
    );
  }

  return <SalesDashboard onOpenVendor={openVendor} />;
}
