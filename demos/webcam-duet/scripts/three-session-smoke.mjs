import WebSocket from "ws";

const connect = () => new Promise((resolve, reject) => {
  const ws = new WebSocket("ws://127.0.0.1:8899");
  const session = { ws, clientId: "", scene: null, messages: [] };
  ws.once("error", reject);
  ws.on("message", (data) => {
    const m = JSON.parse(data.toString());
    session.messages.push(m);
    if (m.type === "session.welcome" && !session.clientId) { session.clientId=m.clientId;session.scene=m.scene;resolve(session); }
  });
});
const waitFor = (session, predicate, label) => new Promise((resolve, reject) => {
  const deadline=Date.now()+2500;
  const check=()=>{const found=session.messages.find(predicate);if(found)return resolve(found);if(Date.now()>=deadline)return reject(new Error(`Timed out: ${label}`));setTimeout(check,10);};check();
});
const send = (session, value) => session.ws.send(JSON.stringify(value));

const [one,two,viewer]=await Promise.all([connect(),connect(),connect()]);
send(one,{type:"puppet.claim",puppetId:"ember"});
await waitFor(one,m=>m.type==="puppet.claimed"&&m.puppetId==="ember","performer 1 claim");
send(two,{type:"puppet.claim",puppetId:"tide"});
await waitFor(two,m=>m.type==="puppet.claimed"&&m.puppetId==="tide","performer 2 claim");
send(viewer,{type:"puppet.claim",puppetId:"ember"});
await waitFor(viewer,m=>m.type==="claim.rejected","viewer cannot take an owned puppet");
const pose={performerId:one.clientId,puppetId:"ember",timestamp:Date.now(),body:{x:.77,y:.44,rotation:.2,depth:.7},handles:{leftArm:{x:.55,y:.42},rightArm:{x:.81,y:.38}},gestures:{}};
send(one,{type:"control.frame",frame:pose});
const threeSessionScene=await waitFor(viewer,m=>m.type==="scene.snapshot"&&m.scene.puppets.ember.frame.body.x===.77,"viewer receives pose");
if(threeSessionScene.scene.audience!==3)throw new Error(`Expected three sessions, received ${threeSessionScene.scene.audience}`);
send(one,{type:"scene.leave"});
await waitFor(viewer,m=>m.type==="scene.snapshot"&&m.scene.puppets.ember.ownerId===null,"disconnect releases ownership");
send(viewer,{type:"puppet.claim",puppetId:"ember"});
await waitFor(viewer,m=>m.type==="puppet.claimed","viewer can take released puppet");
const handoff=await waitFor(viewer,m=>m.type==="scene.snapshot"&&m.scene.puppets.ember.ownerId===viewer.clientId,"handoff snapshot");
if(handoff.scene.puppets.ember.frame.body.x!==.77)throw new Error("Puppet jumped during ownership handoff");
[one,two,viewer].forEach(s=>s.ws.close());
console.log("Three-session room smoke test passed: two performers, viewer, propagation, release, stable handoff.");
