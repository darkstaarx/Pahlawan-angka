-- Only the trusted backend can attach provider bills to orders.
grant select, update on public.payment_orders to service_role;
