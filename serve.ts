// NusaStat local server (Node 22, standard library only).
// Serves app/ so the site can be opened and tested in a browser:
//   node serve.ts            -> http://localhost:8080
//   node serve.ts --port 8081
// A development helper only; the site itself is plain static files.

import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(fileURLToPath(new URL("./app", import.meta.url)));
const args = process.argv.slice(2);
const portArg = args.indexOf("--port");
const wanted = portArg === -1 ? 8080 : Number(args[portArg + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

createServer((req, res) => {
  const raw = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {
    res.writeHead(400).end("bad request");
    return;
  }
  if (path.endsWith("/")) path += "index.html";
  const file = resolve(join(appRoot, normalize(path)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  let size;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error("not a file");
    size = info.size;
  } catch {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
    "content-length": size,
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log(`NusaStat app/ is on http://localhost:${port}`);
});
