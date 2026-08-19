insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/*']::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Admins can upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());
