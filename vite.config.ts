
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injeta a variável de ambiente process.env.API_KEY para ser acessível no código do cliente
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
  },
});
