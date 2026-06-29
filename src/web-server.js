const fs = require("fs/promises");
const path = require("path");
const http = require("http");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3010);
const rendererDir = path.join(__dirname, "renderer");
const userGuideDir = path.join(__dirname, "user-guide");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function send(response, statusCode, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(body);
}

async function serveStaticFile(requestPath, response, rootDir = rendererDir) {
  let normalized = requestPath === "/" ? "/index.html" : requestPath;
  if (normalized.endsWith("/")) {
    normalized += "index.html";
  }
  const filePath = path.join(rootDir, normalized.replace(/^\/+/, ""));
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(rootDir))) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    const buffer = await fs.readFile(resolved);
    const extension = path.extname(resolved).toLowerCase();
    send(response, 200, buffer, MIME_TYPES[extension] || "application/octet-stream");
  } catch (error) {
    if (error.code === "ENOENT") {
      send(response, 404, "Not Found");
      return;
    }
    throw error;
  }
}

async function handleRequest(request, response) {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `127.0.0.1:${PORT}`}`);
    if (url.pathname === "/api/health") {
      send(response, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
      return;
    }
    if (url.pathname === "/guide" || url.pathname.startsWith("/guide/")) {
      const guidePath = url.pathname === "/guide" ? "/index.html" : url.pathname.slice("/guide".length);
      await serveStaticFile(guidePath, response, userGuideDir);
      return;
    }
    await serveStaticFile(url.pathname, response, rendererDir);
  } catch (error) {
    console.error(error);
    send(response, 500, JSON.stringify({ error: error.message || "Server error" }), "application/json; charset=utf-8");
  }
}

function startServer(port = PORT) {
  const server = http.createServer((request, response) => {
    handleRequest(request, response);
  });
  server.listen(port, () => {
    console.log(`static preview running at http://127.0.0.1:${port}`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer
};
