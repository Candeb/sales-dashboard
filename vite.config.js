import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const token = env.VITE_ERP_API_KEY ?? '';
  const target = 'https://secure.sig2k.com';
  const rewritePath = '/sigmasaas/paoletti@sigma-ar/sigma/api/v10';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/sigma-api': {
          target,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/sigma-api/, rewritePath),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (token) {
                proxyReq.setHeader('X-Auth-Token', token);
              }
            });
          },
        },
      },
    },
  };
});
