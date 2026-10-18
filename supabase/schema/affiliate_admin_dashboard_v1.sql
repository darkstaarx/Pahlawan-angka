-- Admin-only affiliate snapshot and atomic batch payout operations.
-- Apply after payment_affiliate_private_wrappers.sql.

create or replace function pa_private.admin_affiliate_dashboard()
returns jsonb language plpgsql security definer set search_path = '' stable
as $$
declare v_result jsonb;
begin
  if not exists (select 1 from public.app_user_roles r where r.user_id=(select auth.uid()) and r.role='admin') then
    raise exception 'Admin required' using errcode='42501';
  end if;
  select jsonb_build_object(
    'generated_at', now(),
    'affiliates', coalesce((select jsonb_agg(jsonb_build_object(
      'id',a.id,'display_name',a.display_name,'email',u.email,'code',a.code,'status',a.status,'created_at',a.created_at,
      'bank_ready',(b.phone is not null and b.account_name is not null and b.bank_name is not null and b.account_number is not null),'phone',b.phone
    ) order by a.created_at,a.id) from public.affiliate_applications a join auth.users u on u.id=a.user_id left join pa_private.affiliate_bank_info b on b.affiliate_id=a.id),'[]'::jsonb),
    'commissions', coalesce((select jsonb_agg(jsonb_build_object(
      'id',c.id,'affiliate_id',c.affiliate_id,'order_id',c.order_id,'amount_cents',c.amount_cents,'status',c.status,
      'payout_reference',c.payout_reference,'paid_at',c.paid_at,'created_at',c.created_at,'order_plan',o.plan,
      'order_amount_cents',o.amount_cents,'order_status',o.status,'order_paid_at',o.paid_at,'order_reference',o.billcode
    ) order by c.created_at,c.id) from public.affiliate_commissions c join public.payment_orders o on o.id=c.order_id),'[]'::jsonb),
    'orders', coalesce((select jsonb_agg(jsonb_build_object(
      'id',o.id,'affiliate_id',o.affiliate_id,'plan',o.plan,'amount_cents',o.amount_cents,'status',o.status,
      'paid_at',o.paid_at,'billcode',o.billcode,'created_at',o.created_at
    ) order by o.created_at,o.id) from public.payment_orders o where o.affiliate_id is not null),'[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

revoke all on function pa_private.admin_affiliate_dashboard() from public,anon,authenticated;
grant execute on function pa_private.admin_affiliate_dashboard() to authenticated;

create or replace function public.admin_affiliate_dashboard()
returns jsonb language sql security invoker set search_path = ''
as $$ select pa_private.admin_affiliate_dashboard(); $$;
revoke all on function public.admin_affiliate_dashboard() from public,anon,authenticated;
grant execute on function public.admin_affiliate_dashboard() to authenticated;

create or replace function pa_private.admin_record_affiliate_payout(
  p_affiliate_id uuid,p_commission_ids uuid[],p_reference text,p_expected_amount_cents integer
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_ref text; v_count integer; v_total integer; v_distinct integer;
begin
  if not exists (select 1 from public.app_user_roles r where r.user_id=(select auth.uid()) and r.role='admin') then
    raise exception 'Admin required' using errcode='42501';
  end if;
  if p_affiliate_id is null then raise exception 'Affiliate required'; end if;
  if p_commission_ids is null or cardinality(p_commission_ids)=0 then raise exception 'At least one commission is required'; end if;
  if cardinality(p_commission_ids)>500 then raise exception 'Too many commissions'; end if;
  if exists (select 1 from unnest(p_commission_ids) ids(id) where id is null) then raise exception 'Commission id required'; end if;
  select count(*),count(distinct id) into v_count,v_distinct from unnest(p_commission_ids) ids(id);
  if v_count<>v_distinct then raise exception 'Duplicate commission id'; end if;
  if p_expected_amount_cents is null or p_expected_amount_cents<=0 then raise exception 'Expected amount required'; end if;
  if p_reference is null or length(trim(p_reference))>120 then raise exception 'Payout reference must be 3 to 120 characters'; end if;
  v_ref:=trim(p_reference);
  if length(v_ref)<3 then raise exception 'Payout reference required'; end if;
  with locked as (
    select c.id,c.amount_cents,c.status,o.status order_status
    from public.affiliate_commissions c join public.payment_orders o on o.id=c.order_id
    where c.id=any(p_commission_ids) and c.affiliate_id=p_affiliate_id order by c.id for update of c,o
  ) select count(*),coalesce(sum(amount_cents),0) into v_count,v_total from locked
    where status in ('pending','approved') and order_status='paid' and amount_cents>0;
  if v_count<>cardinality(p_commission_ids) then raise exception 'Commission not payable'; end if;
  if v_total<>p_expected_amount_cents then raise exception 'Expected amount mismatch'; end if;
  update public.affiliate_commissions c set status='paid',payout_reference=v_ref,paid_at=now()
    where c.id=any(p_commission_ids) and c.affiliate_id=p_affiliate_id and c.status in ('pending','approved');
  get diagnostics v_distinct = row_count;
  if v_distinct<>v_count then raise exception 'Commission payout was incomplete'; end if;
  return jsonb_build_object('count',v_count,'amount_cents',v_total,'reference',v_ref);
end;
$$;

revoke all on function pa_private.admin_record_affiliate_payout(uuid,uuid[],text,integer) from public,anon,authenticated;
grant execute on function pa_private.admin_record_affiliate_payout(uuid,uuid[],text,integer) to authenticated;

create or replace function public.admin_record_affiliate_payout(
  p_affiliate_id uuid,p_commission_ids uuid[],p_reference text,p_expected_amount_cents integer
)
returns jsonb language sql security invoker set search_path = ''
as $$ select pa_private.admin_record_affiliate_payout(p_affiliate_id,p_commission_ids,p_reference,p_expected_amount_cents); $$;
revoke all on function public.admin_record_affiliate_payout(uuid,uuid[],text,integer) from public,anon,authenticated;
grant execute on function public.admin_record_affiliate_payout(uuid,uuid[],text,integer) to authenticated;
