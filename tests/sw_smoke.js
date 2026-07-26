#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const handlers = {};
const deleted = [];
const added = [];
let claimed = false;
let skipped = false;

const cache = {
  async addAll(resources) { added.push(...resources); },
  async put() {}
};

const context = {
  URL,
  Response,
  fetch: async () => new Response("ok", { status: 200 }),
  caches: {
    async open() { return cache; },
    async keys() { return ["nightmare-404-v1.0.1", "nightmare-404-v1.1.1", "potato-404-v3"]; },
    async delete(key) { deleted.push(key); return true; },
    async match() { return null; }
  },
  self: {
    location: { origin: "https://example.test" },
    clients: { async claim() { claimed = true; } },
    async skipWaiting() { skipped = true; },
    addEventListener(type, handler) { handlers[type] = handler; }
  }
};

vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ROOT, "sw.js"), "utf8"), context, { filename: "sw.js" });

async function dispatch(type, extra = {}) {
  let waiting = Promise.resolve();
  let response = null;
  handlers[type]({
    ...extra,
    waitUntil(promise) { waiting = Promise.all([waiting, promise]); },
    respondWith(promise) { response = promise; }
  });
  await waiting;
  return response ? response : null;
}

(async () => {
  await dispatch("install");
  if (!skipped || !added.includes("./index.html") || !added.includes("./js/app.js")) {
    throw new Error("La instalación no precachea el shell completo.");
  }

  await dispatch("activate");
  if (!claimed) throw new Error("El Service Worker no reclama clientes.");
  if (deleted.join(",") !== "nightmare-404-v1.0.1,nightmare-404-v1.1.1") {
    throw new Error(`Limpieza de caché insegura: ${JSON.stringify(deleted)}`);
  }

  console.log(`SW SMOKE: ${added.length} recursos precacheados; cachés ajenas preservadas.`);
})().catch(error => {
  console.error(`SW SMOKE FALLIDO: ${error.message}`);
  process.exit(1);
});
