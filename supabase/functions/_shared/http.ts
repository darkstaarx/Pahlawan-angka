const configuredOrigin = (() => {
  try { return new URL(Deno.env.get('APP_URL') ?? 'https://darkstaarx.github.io/Pahlawan-angka/').origin; } catch { return 'https://darkstaarx.github.io'; }
})();
// Both public sites may start a checkout: Netlify (users) and GitHub Pages (testing).
const localOrigins = new Set(['http://localhost:8770', 'http://127.0.0.1:8770', 'https://pahlawanangka.netlify.app', 'https://darkstaarx.github.io']);
export function corsHeaders(requestOrigin?: string) {
  const origin = requestOrigin && (requestOrigin === configuredOrigin || localOrigins.has(requestOrigin)) ? requestOrigin : configuredOrigin;
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin' };
}

export function json(body: unknown, status = 200, requestOrigin?: string) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(requestOrigin), 'Content-Type': 'application/json' } });
}

export function requireConfig(...names: string[]) {
  const values = Object.fromEntries(names.map((name) => [name, Deno.env.get(name) ?? '']));
  const missing = names.filter((name) => !values[name]);
  if (missing.length) throw new Error(`Missing payment configuration: ${missing.join(', ')}`);
  return values as Record<string, string>;
}
