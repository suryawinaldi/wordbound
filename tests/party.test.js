import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { act, choices, create, tick, view } from "../server/party-game.js";

test("sembilan kartu unik dan respons pribadi, tiga nyawa serta voting pemain selesai", () => {
  const r = create("123456", "P0", "k0");
  for (let i=1; i<9; i++) act(r,"k"+i,{action:"join",name:"P"+i});
  assert.throws(() => act(r,"x",{action:"join",name:"X"}));
  act(r,"k0",{action:"start"},0);
  assert.equal(new Set(r.players.map(p=>p.hero)).size,9);
  for (const p of r.players) {
    const visible = view(r,p.token);
    assert.equal(visible.players.find(x=>x.id===p.id).image,undefined);
    assert.ok(visible.players.every(x=>!x.hero && !x.token));
    assert.ok(existsSync("public"+p.image));
  }
  const move = (key,action,value) => act(r,key,{action,value,turn:r.turn},0);
  move("k0","guess",r.players[0].hero);
  move("k1","ask","Mage?");
  for (const p of r.players.filter(p=>p.token!=="k1")) move(p.token,"vote","Ragu");
  assert.equal(view(r,"k1").canClarify,true);
  move("k1","clarify");
  move("k1","ask","Punya role Mage?");
  tick(r,31000);
  assert.throws(()=>move("k1","clarify"));
  const wrong = choices.find(x=>x!==r.players[1].hero);
  for (let life=2; life>=0; life--) {
    move("k1","guess",wrong);
    assert.equal(r.players[1].lives,life);
    if (life) while(r.index!==1) move(r.players[r.index].token,"pass");
  }
  while(r.phase!=="selesai") move(r.players[r.index].token,"guess",r.players[r.index].hero);
  assert.ok(view(r,"k1").players.every(x=>x.hero && x.skin));
});
