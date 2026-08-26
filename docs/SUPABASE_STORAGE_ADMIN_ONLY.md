# Supabase product-image storage: admin-only writes

Use a bucket named `product-images`. It may be **public** when product photos should be visible to every shopper. Public access allows downloads only; the policies below still prevent customers from uploading, replacing, or deleting files.

## Important: do not use `auth.role() = 'authenticated'` for writes

The two policies named **Authenticated Upload** and **Authenticated Update** would allow *every signed-in customer* to upload or update an image. In Supabase, `auth.role()` distinguishes the Supabase API roles (`anon`, `authenticated`, and `service_role`), not this application's `ADMIN` / `CUSTOMER` role.

The application stores its roles in `public.profiles` and `public.user_roles`. The SQL below checks that the current authenticated user has the `ADMIN` role instead.

## One-time SQL setup

1. In Supabase Dashboard, open **Storage** and create the `product-images` bucket. Mark it **Public** if storefront images must be available without signing in.
2. Open **SQL Editor**, create a new query, and run the following SQL. If your bucket has a different name, replace `product-images` everywhere.

```sql
-- If the two broad policies were already created, remove them first.
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Authenticated Update" on storage.objects;

-- This function maps the signed-in Supabase user to the app's ADMIN role.
create or replace function public.is_storage_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.user_id
    where p.user_id = (select auth.uid()::text)
      and ur.role = 'ADMIN'
  );
$$;

revoke all on function public.is_storage_admin() from public;
grant execute on function public.is_storage_admin() to authenticated;

-- Admin uploads only.
create policy "Admin product-image upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_storage_admin()
);

-- Admin replacements/metadata updates only.
create policy "Admin product-image update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_storage_admin()
)
with check (
  bucket_id = 'product-images'
  and public.is_storage_admin()
);

-- Needed if admins remove product images from Storage.
create policy "Admin product-image delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_storage_admin()
);
```

3. Verify the result in **Storage → Policies → product-images**. There should be no INSERT or UPDATE policy using only `auth.role() = 'authenticated'`.
4. Sign in as a customer and confirm that an upload or overwrite returns a policy/RLS error. Sign in as an app admin and confirm that it succeeds.

## Application checks

The app independently enforces the same boundary before changing products, product images, or variants:

- Product create, edit, archive: `requireAdmin()`
- Product image record create, edit, reorder, delete: `requireAdmin()`
- Variant create and edit: `requireAdmin()`
- `/admin` routes: require a user whose application role is `ADMIN`

The existing image action records an image URL in the database; it does not currently call Supabase Storage's `.upload()` API. Upload the file through Storage Dashboard or add a server-side upload endpoint later; when one is added, it must call `requireAdmin()` before uploading. The Storage policies above remain the final enforcement layer even if a customer bypasses the UI.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never prefix it with `NEXT_PUBLIC_` or expose it in client code, because the service role bypasses Storage RLS.
