import { randomInt, randomUUID } from "node:crypto";

import defaults from "./default-skins.json" with { type: "json" };
import skins from "./party-skins.json" with { type: "json" };
export const choices = Object.keys(skins);
export const votes = ["Ya", "Tidak", "Ragu"];
function check(condition, message) { if (!condition) throw new Error(message); }
function player(name, token) {
  check(typeof name === "string" && name.trim() && name.trim().length <= 24, "Isi nama panggilan (1–24 karakter).");
  return { id: randomUUID(), token, name: name.trim(), lives: 3, status: "main" };
}
export function create(code, name, token) {
  return { code, players: [player(name, token)], pace: "fast", skinMode: "all", game: 1, phase: "lobi", index: 0, turn: 0, log: [] };
}
function next(room, now) {
  for (let offset = 1; offset <= room.players.length; offset++) {
    const index = (room.index + offset) % room.players.length;
    if (room.players[index].status === "main") {
      room.index = index;
      room.turn++;
      room.clarified = false;
      room.phase = "tanya";
      room.deadline = now + (room.pace === "relaxed" ? 90000 : 30000);
      return;
    }
  }
  room.phase = "selesai";
  delete room.deadline;
}
function finishVote(room, now) {
  const entry = room.log.at(-1);
  entry.counts = Object.fromEntries(votes.map(v => [v, Object.values(room.ballots).filter(x => x === v).length]));
  delete room.ballots;
  room.phase = "tebak";
  room.deadline = now + (room.pace === "relaxed" ? 45000 : 15000);
}
export function tick(room, now) {
  if (!room.deadline || now < room.deadline) return false;
  if (room.phase === "tanya") {
    const player = room.players[room.index];
    player.missed = (player.missed || 0) + 1;
    if (player.missed >= 2) player.status = "keluar";
  }
  if (room.phase === "voting") finishVote(room, now);
  else next(room, now);
  return true;
}
export function act(room, token, body, now = Date.now()) {
  const me = room.players.find(p => p.token === token);
  if (body.action === "join") {
    if (me) return;
    check(room.phase === "lobi" && room.players.length < 9, "Room sudah mulai atau penuh.");
    room.players.push(player(body.name, token));
    return;
  }
  check(me, "Kamu belum bergabung.");
  if (body.action === "skins") {
    check(room.phase === "lobi" && me === (room.players.find(p => p.status !== "keluar") || room.players[0]), "Pengaturan hanya untuk host.");
    check(["all", "simple", "default", "mixed"].includes(body.value), "Pilihan kartu tidak valid.");
    room.skinMode = body.value;
    return;
  }
  if (body.action === "configure") {
    check(room.phase === "lobi" && me === (room.players.find(p => p.status !== "keluar") || room.players[0]), "Pengaturan hanya untuk host.");
    check(["fast", "relaxed"].includes(body.value), "Pilihan tempo tidak valid.");
    room.pace = body.value;
    return;
  }
  if (body.action === "rematch") {
    check(room.phase === "selesai" && me === (room.players.find(p => p.status !== "keluar") || room.players[0]), "Tunggu host memulai ronde baru.");
    room.players = room.players.filter(p => p.status !== "keluar");
    for (const p of room.players) {
      delete p.hero; delete p.image; delete p.skin; delete p.reference;
      p.status = "main"; p.lives = 3; p.missed = 0;
    }
    room.phase = "lobi"; room.log = []; room.game = (room.game || 1) + 1;
    delete room.deadline; delete room.ballots;
    return;
  }
  if (body.action === "leave" && room.phase === "selesai") return;
  if (body.action === "leave" && room.phase !== "lobi") {
    me.status = "keluar";
    if (room.players[room.index] === me) next(room, now);
    else if (room.phase === "voting" && room.players.filter(p => p !== room.players[room.index] && p.status !== "keluar").every(p => room.ballots[p.id])) finishVote(room, now);
    return;
  }
  if (body.action === "leave") {
    check(room.phase === "lobi", "Room sudah mulai.");
    room.players = room.players.filter(p => p !== me);
    if (!room.players.length) room.phase = "selesai";
    return;
  }
  if (body.action === "start") {
    check(room.phase === "lobi" && me === (room.players.find(p => p.status !== "keluar") || room.players[0]) && room.players.length >= 2, "Perlu host dan minimal dua pemain.");
    const pool = [...choices];
    for (const p of room.players) {
      p.hero = pool.splice(randomInt(pool.length), 1)[0];
      let variants = skins[p.hero];
      if (["simple", "default"].includes(room.skinMode) || room.skinMode === "mixed" && randomInt(2) === 0) {
        variants = variants.filter(card => card[1] === defaults[p.hero]);
      }
      const [label, imageId, referenceId] = variants[randomInt(variants.length)];
      p.image = "/assets/party/splash/" + imageId + ".webp";
      if (referenceId) p.reference = "/assets/party/splash/" + referenceId + ".webp";
      p.skin = label;
    }
    room.index = -1;
    next(room, now);
    return;
  }
  check(me.status !== "keluar", "Kamu sudah keluar dari ronde.");
  check(body.turn === room.turn && room.turn && room.phase !== "selesai", "Giliran sudah berubah.");
  const active = room.players[room.index];
  if (body.action === "vote") {
    check(room.phase === "voting" && active !== me && votes.includes(body.value) && !room.ballots[me.id], "Suara tidak dapat dikirim.");
    room.ballots[me.id] = body.value;
    if (room.players.filter(p => p !== active && p.status !== "keluar").every(p => room.ballots[p.id])) finishVote(room, now);
    return;
  }
  check(active === me, "Tunggu giliranmu.");
  me.missed = 0;
  if (body.action === "clarify") {
    const counts = room.log.at(-1)?.counts;
    check(room.phase === "tebak" && !room.clarified && ambiguous(counts), "Pertanyaan sudah selesai.");
    room.clarified = true;
    room.phase = "tanya";
    room.deadline = now + (room.pace === "relaxed" ? 45000 : 15000);
    return;
  }
  if (body.action === "ask") {
    check(room.phase === "tanya" && typeof body.value === "string" && body.value.trim() && body.value.length <= 180, "Tulis satu pertanyaan (maksimal 180 karakter).");
    room.log.push({ turn: room.turn, id: me.id, question: body.value.trim() });
    room.ballots = {};
    room.phase = "voting";
    room.deadline = now + (room.pace === "relaxed" ? 30000 : 15000);
    return;
  }
  check(["tanya", "tebak"].includes(room.phase), "Tunggu voting selesai.");
  if (body.action === "guess") {
    check(choices.includes(body.value), "Pilih hero dari daftar.");
    if (body.value === me.hero) me.status = "benar";
    else if (--me.lives === 0) me.status = "gugur";
    room.log.push({ turn: room.turn, id: me.id, result: me.status === "benar" ? "Tebakan benar" : "Tebakan salah" });
  } else check(body.action === "pass", "Aksi tidak dikenal.");
  next(room, now);
}
function ambiguous(counts) {
  return counts && (counts.Ya === counts.Tidak || counts.Ragu > counts.Ya + counts.Tidak);
}
export function view(room, token) {
  const me = room.players.find(p => p.token === token);
  check(me, "Kamu belum bergabung.");
  return { code: room.code, skinMode: room.skinMode || "all", pace: room.pace || "relaxed", game: room.game || 1, host: (room.players.find(p => p.status !== "keluar") || room.players[0]).id, phase: room.phase, turn: room.turn, deadline: room.deadline, me: me.id,
    canClarify: room.phase === "tebak" && !room.clarified && Boolean(ambiguous(room.log.at(-1)?.counts)),
    active: room.players[room.index]?.id, voted: Boolean(room.ballots?.[me.id]), log: room.log, choices,
    players: room.players.map(p => {
      const reveal = p.status !== "main" || room.phase === "selesai";
      return { id: p.id, name: p.name, lives: p.lives, status: p.status,
        image: p !== me || reveal ? p.image : undefined,
        reference: p !== me || reveal ? p.reference : undefined, hero: reveal ? p.hero : undefined, skin: reveal ? p.skin : undefined };
    }) };
}
