/**
 * Mira Wishlist API — Cloudflare Worker + KV
 * Endpoints:
 *   GET  /api/reservations    → returns all reservations
 *   POST /api/reservations    → { itemId, name } → reserves
 *   DELETE /api/reservations  → { itemId } → cancels
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const KV_KEY = "reservations";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/reservations") {
      return handleReservations(request, env);
    }

    return new Response("Mira Wishlist API", {
      headers: { "Content-Type": "text/plain", ...CORS_HEADERS },
    });
  },
};

async function handleReservations(request, env) {
  const headers = { "Content-Type": "application/json", ...CORS_HEADERS };

  if (request.method === "GET") {
    const data = await env.WISHLIST_KV.get(KV_KEY);
    return new Response(data || "{}", { headers });
  }

  if (request.method === "POST") {
    const { itemId, name } = await request.json();
    if (!itemId || !name) {
      return new Response(JSON.stringify({ error: "itemId and name required" }), {
        status: 400, headers,
      });
    }
    const data = JSON.parse((await env.WISHLIST_KV.get(KV_KEY)) || "{}");
    data[itemId] = name;
    await env.WISHLIST_KV.put(KV_KEY, JSON.stringify(data));
    return new Response(JSON.stringify(data), { headers });
  }

  if (request.method === "DELETE") {
    const { itemId } = await request.json();
    if (!itemId) {
      return new Response(JSON.stringify({ error: "itemId required" }), {
        status: 400, headers,
      });
    }
    const data = JSON.parse((await env.WISHLIST_KV.get(KV_KEY)) || "{}");
    delete data[itemId];
    await env.WISHLIST_KV.put(KV_KEY, JSON.stringify(data));
    return new Response(JSON.stringify(data), { headers });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405, headers,
  });
}
