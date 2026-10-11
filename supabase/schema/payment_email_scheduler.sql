-- Schedule the bounded email worker every five minutes using Vault secrets.
-- Apply only after storing all three secrets and while the worker remains disabled.
create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
declare project_url text;
declare gateway_jwt text;
declare worker_key text;
begin
  select decrypted_secret into project_url from vault.decrypted_secrets where name = 'payment_email_project_url';
  select decrypted_secret into gateway_jwt from vault.decrypted_secrets where name = 'payment_email_gateway_jwt';
  select decrypted_secret into worker_key from vault.decrypted_secrets where name = 'payment_email_worker_key';
  if project_url is null or gateway_jwt is null or worker_key is null then
    raise exception 'payment email scheduler secrets are required';
  end if;
  if project_url !~ '^https://[a-z0-9]{20}\.supabase\.co/?$' then
    raise exception 'payment_email_project_url must be a Supabase project HTTPS URL';
  end if;
  if length(worker_key) < 32 then
    raise exception 'payment_email_worker_key must be at least 32 characters';
  end if;
end $$;

select cron.unschedule(jobid)
from cron.job
where jobname = 'payment-email-worker';

select cron.schedule(
  'payment-email-worker',
  '*/5 * * * *',
  $$
    select net.http_post(
      url := rtrim((select decrypted_secret from vault.decrypted_secrets where name = 'payment_email_project_url'), '/') || '/functions/v1/send-payment-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'payment_email_gateway_jwt'),
        'x-payment-email-worker-key', (select decrypted_secret from vault.decrypted_secrets where name = 'payment_email_worker_key')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 120000
    );
  $$
);
