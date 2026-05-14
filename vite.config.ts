import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// Plugin que permite guardar JSONs das páginas directamente nos ficheiros
function jsonSavePlugin() {
  const pagesDir = path.resolve(__dirname, "src/data/pages");

  return {
    name: "json-save-plugin",
    configureServer(server: any) {
      server.middlewares.use("/api/save-page", async (req: any, res: any) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk: any) => { body += chunk; });
        req.on("end", () => {
          try {
            const { pageKey, data } = JSON.parse(body);

            if (!pageKey || typeof pageKey !== "string" || !/^[a-zA-Z0-9_-]+$/.test(pageKey)) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "pageKey inválido" }));
              return;
            }

            const filePath = path.join(pagesDir, `${pageKey}.json`);

            if (!filePath.startsWith(pagesDir)) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Acesso negado" }));
              return;
            }

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Erro ao guardar ficheiro" }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && jsonSavePlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
