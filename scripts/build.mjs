import * as esbuild from "esbuild-wasm";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const assets = path.join(dist, "assets");
const mode = process.argv.includes("--mode=development")
  ? "development"
  : "production";

await fs.rm(dist, { force: true, recursive: true });
await fs.mkdir(assets, { recursive: true });

await esbuild.initialize({});

const result = await esbuild.build({
  absWorkingDir: root,
  bundle: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
  entryPoints: ["src/main.tsx"],
  format: "esm",
  jsx: "automatic",
  loader: {
    ".jpeg": "file",
    ".jpg": "file",
    ".png": "file",
    ".svg": "file",
    ".webp": "file",
  },
  metafile: true,
  minify: mode === "production",
  outfile: "dist/assets/app.js",
  platform: "browser",
  sourcemap: mode === "development",
  target: ["es2021"],
});

const emittedCss = Object.keys(result.metafile.outputs).some((file) =>
  file.endsWith(".css"),
);

let html = await fs.readFile(path.join(root, "index.html"), "utf8");
html = html.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  `${emittedCss ? '    <link rel="stylesheet" href="./assets/app.css" />\n' : ""}    <script type="module" src="./assets/app.js"></script>`,
);

await fs.writeFile(path.join(dist, "index.html"), html);
await esbuild.stop();

console.log(`Built ${path.relative(root, dist)} in ${mode} mode`);
