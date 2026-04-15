import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "api": path.resolve(__dirname, "./src/api"),
            "components": path.resolve(__dirname, "./src/components"),
            "data": path.resolve(__dirname, "./src/data"),
            "hooks": path.resolve(__dirname, "./src/hooks"),
            "lib": path.resolve(__dirname, "./src/lib"),
            "routes": path.resolve(__dirname, "./src/routes"),
            "types": path.resolve(__dirname, "./src/types"),
            "pages": path.resolve(__dirname, "./src/pages"),
            "context": path.resolve(__dirname, "./src/context"),
            "features": path.resolve(__dirname, "./src/components/features"),
            "utils": path.resolve(__dirname, "./src/utils"),
        }
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
});
