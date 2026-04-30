// Vercel Serverless Function — GitHub JSON Proxy
// Path: /api/data?entity=users|wallets|content
// Methods: GET (read), PUT (write { data })
//
// Env vars required on Vercel:
//   GITHUB_TOKEN   — Personal Access Token with `repo` scope
//   GITHUB_OWNER   — your GitHub username or org
//   GITHUB_REPO    — repo name (private recommended)
//   GITHUB_BRANCH  — optional, defaults to "main"
//   ALLOW_ORIGIN   — optional, defaults to "*"

export default async function handler(req, res) {
  const allow = process.env.ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const { entity } = req.query;
  const valid = ["users", "wallets", "content"];
  if (!valid.includes(entity)) return res.status(400).json({ error: "invalid entity" });

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !owner || !repo) return res.status(500).json({ error: "GitHub env vars missing" });

  const path = `data/${entity}.json`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    if (req.method === "GET") {
      const r = await fetch(`${apiUrl}?ref=${branch}`, { headers });
      if (r.status === 404) return res.json({ data: entity === "content" ? null : [] });
      if (!r.ok) return res.status(r.status).json({ error: await r.text() });
      const j = await r.json();
      const content = Buffer.from(j.content, "base64").toString("utf-8");
      return res.json({ data: JSON.parse(content) });
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      const data = typeof body === "string" ? JSON.parse(body).data : body.data;
      // get current sha if exists
      let sha;
      const cur = await fetch(`${apiUrl}?ref=${branch}`, { headers });
      if (cur.ok) sha = (await cur.json()).sha;

      const put = await fetch(apiUrl, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `update ${entity}.json`,
          content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
          branch,
          sha,
        }),
      });
      if (!put.ok) return res.status(put.status).json({ error: await put.text() });
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
