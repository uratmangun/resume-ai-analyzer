const domain = process.env.AUTH0_DOMAIN;
const clientId = process.env.AUTH0_M2M_CLIENT_ID || process.env.AUTH0_CLIENT_ID;
const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET || process.env.AUTH0_CLIENT_SECRET;

const argName = process.argv.slice(2).find(a => !a.startsWith("--"));
const targetName = argName || process.env.AUTH0_APP_NAME || "ChatGPT";
const confirmed = process.argv.includes("--yes") || process.env.CONFIRM === "true";

async function getToken() {
  if (!domain || !clientId || !clientSecret) {
    throw new Error("Missing AUTH0_DOMAIN, AUTH0_CLIENT_ID, or AUTH0_CLIENT_SECRET env vars");
  }
  const res = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Failed to obtain token: ${res.status} ${res.statusText} ${t}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function listAllClients(token) {
  const perPage = 100;
  let page = 0;
  const all = [];
  while (true) {
    const url = `https://${domain}/api/v2/clients?page=${page}&per_page=${perPage}`;
    const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Failed to list clients: ${res.status} ${res.statusText} ${t}`);
    }
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    all.push(...arr);
    if (arr.length < perPage) break;
    page += 1;
  }
  return all;
}

async function deleteClient(token, id) {
  const res = await fetch(`https://${domain}/api/v2/clients/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Failed to delete client ${id}: ${res.status} ${res.statusText} ${t}`);
  }
}

async function main() {
  const token = await getToken();
  const clients = await listAllClients(token);
  const matches = clients.filter(c => (c && c.name) === targetName);

  if (matches.length === 0) {
    console.log(`No applications found with name '${targetName}'.`);
    return;
  }

  console.log(`Found ${matches.length} application(s) named '${targetName}':`);
  for (const c of matches) {
    console.log(JSON.stringify({ client_id: c.client_id, name: c.name, app_type: c.app_type }, null, 2));
  }

  if (!confirmed) {
    console.log("Dry run. Pass --yes or set CONFIRM=true to delete.");
    return;
  }

  for (const c of matches) {
    await deleteClient(token, c.client_id);
    console.log(`Deleted client ${c.client_id} (${c.name}).`);
  }

  console.log("Done.");
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
