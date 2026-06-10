import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Proxy Ollama so the browser can stream from it without CORS issues.
            "/ollama": {
                target: "http://localhost:11434",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/ollama/, ""); },
            },
        },
    },
});
