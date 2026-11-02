import("file:///C:/Users/User/Downloads/cloaker%20deep/app/api/cloak/index.js").then(async (cloakModule) => {
  const headers = new Map([
    ["user-agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"],
    ["x-forwarded-for", "192.168.1.100"],
  ]);
  const req = {
    url: "http://localhost:3000/api/cloak/?utm_source=tiktok&utm_campaign=cam_bs3mpc&utm_medium=cpc&utm_content=anti&campaign_id=cam_bs3mpc",
    headers: {
      get: (k) => headers.get(k),
      has: (k) => headers.has(k),
      forEach: (fn) => headers.forEach((v, k) => fn(v, k, headers)),
    },
    socket: { remoteAddress: "192.168.1.100" },
  };
  let handler;
  try {
    handler = cloakModule.handler || cloakModule.default;
    if (!handler) throw new Error("handler nao encontrado - keys:", Object.keys(cloakModule));
    const res = await handler(req);
    console.log("STATUS:", res.status);
    console.log("LOCATION:", res.headers.get("location"));
    console.log("DECISION:", res.headers.get("x-cloaker-decision"));
  } catch (e) {
    console.error("ERRO:", e.message);
    console.error(e.stack);
  }
});
