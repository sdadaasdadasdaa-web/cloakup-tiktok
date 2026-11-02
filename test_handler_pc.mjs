import("file:///C:/Users/User/Downloads/cloaker%20deep/app/api/cloak/index.js").then(async (cloakModule) => {
  const headers = new Map([
    ["user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"],
    ["x-forwarded-for", "192.168.1.100"],
  ]);
  const req = {
    url: "http://localhost:3000/api/cloak?utm_source=tiktok&utm_campaign=cam_bs3mpc&utm_medium=cpc&utm_content=anti&campaign_id=cam_bs3mpc",
    headers: {
      get: (k) => headers.get(k),
      has: (k) => headers.has(k),
      forEach: (fn) => headers.forEach((v, k) => fn(v, k, headers)),
    },
    socket: { remoteAddress: "192.168.1.100" },
  };
  let handler = cloakModule.handler || cloakModule.default;
  if (!handler) throw new Error("handler nao encontrado - keys:", Object.keys(cloakModule));
  try {
    const res = await handler(req);
    console.log("PC - status:", res.status);
    console.log("PC - location:", res.headers.get("location"));
    console.log("PC - decision:", res.headers.get("x-cloaker-decision"));
  } catch (e) {
    console.error("PC ERRO:", e.message);
    console.error(e.stack);
  }
});
