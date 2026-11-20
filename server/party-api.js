import { randomInt } from "node:crypto";
import { act, create, tick, view } from "./party-game.js";

const ttl = 21600;
const memory = new Map();
const limits = new Map();
function storage(local) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    async function command(args) {
      const res = await fetch(url, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(args) });
      if (!res.ok) throw new Error("Penyimpanan room sedang bermasalah.");
      const data = await res.json();
      if (data.error) throw new Error("Penyimpanan room sedang bermasalah.");
      return data.result;
    }
    return {
      get: key => command(["GET", key]),
      allow: key => command(["EVAL", "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n", 1, key]),
      put: (key, old, value) => command(["EVAL", "local v=redis.call('GET',KEYS[1]); if (v or '')~=ARGV[1] then return 0 end; redis.call('SET',KEYS[1],ARGV[2],'EX',ARGV[3]); return 1", 1, key, old || "", value, ttl]),
    };
  }
  if (!local) throw new Error("Room online belum dikonfigurasi pada server ini.");
  for (const [key, record] of memory) if (record.until < Date.now()) memory.delete(key);
  return { allow(key) {
    for (const [id, value] of limits) if (value.until < Date.now()) limits.delete(id);
    const current = limits.get(key) || { count: 0, until: Date.now() + 60000 };
    current.count++; limits.set(key, current); return current.count;
  }, get: key => memory.get(key)?.value, put(key, old, value) {
    if (memory.get(key)?.value !== old) return false;
    memory.set(key, { value, until: Date.now() + ttl * 1000 });
    return true;
  } };
}
export async function partyApi(req, res, local = false) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "private, no-store");
  try {
    if (req.method !== "POST") throw new Error("Gunakan POST.");
    let body = req.body;
    if (!body) {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 4096) throw new Error("Pesan terlalu panjang.");
      }
      body = JSON.parse(raw);
    }
    if (typeof body === "string") body = JSON.parse(body);
    const secret = req.headers.authorization?.replace(/^Bearer /, "");
    if (!/^[a-f0-9]{48}$/.test(secret || "")) throw new Error("Sesi pemain tidak valid.");
    const db = storage(local);
    if (["create", "join"].includes(body.action)) {
      const { createHash } = await import("node:crypto");
      const address = req.headers["x-real-ip"] || req.socket?.remoteAddress || secret;
      const fingerprint = createHash("sha256").update(String(address)).digest("hex");
      if (await db.allow("herohunt:limits:" + fingerprint) > 30) {
        res.statusCode = 429;
        res.end(JSON.stringify({ error: "Terlalu banyak percobaan. Tunggu satu menit." }));
        return;
      }
    }
    for (let attempt = 0; attempt < 12; attempt++) {
      const creating = body.action === "create";
      const code = creating ? String(randomInt(100000, 1000000)) : body.code;
      if (!/^\d{6}$/.test(code)) throw new Error("Masukkan enam digit kode room.");
      const key = "herohunt:party:v1:" + code;
      const raw = await db.get(key);
      if (creating && raw) continue;
      if (!creating && !raw) throw new Error("Room tidak ditemukan atau sudah kedaluwarsa.");
      const room = creating ? create(code, body.name, secret) : JSON.parse(raw);
      const expired = tick(room, Date.now());
      if (expired && !(await db.put(key, raw, JSON.stringify(room)))) continue;
      if (expired) continue;
      if (!creating && body.action !== "read") act(room, secret, body);
      const snapshot = body.action === "leave" ? { left: true } : view(room, secret);
      if (body.action === "read" || await db.put(key, raw, JSON.stringify(room))) {
        res.end(JSON.stringify(snapshot));
        return;
      }
    }
    throw new Error("Room sedang sibuk. Coba lagi.");
  } catch (error) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: error.message }));
  }
}
