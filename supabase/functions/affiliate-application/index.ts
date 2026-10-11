import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders, json } from '../_shared/http.ts';

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') ?? undefined;
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin);
  const token = req.headers.get('Authorization');
  if (!token?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401, origin);
  const url = Deno.env.get('SUPABASE_URL')!; const key = Deno.env.get('SUPABASE_ANON_KEY')!;
  const client = createClient(url, key, { global: { headers: { Authorization: token } } });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return json({ error: 'Authentication required' }, 401, origin);
  const body = await req.json();
  const { data, error: insertError } = await client.rpc('apply_affiliate_application', {
    p_display_name: String(body.display_name ?? '').slice(0, 120),
    p_phone: String(body.phone ?? '').replace(/\D/g, ''),
    p_account_name: String(body.account_name ?? '').slice(0, 120),
    p_bank_name: String(body.bank_name ?? '').slice(0, 120),
    p_account_number: String(body.account_number ?? '').slice(0, 80),
  });
  if (insertError) return json({ error: 'Could not submit affiliate application' }, 400, origin);
  return json({ application: data }, 201, origin);
});
