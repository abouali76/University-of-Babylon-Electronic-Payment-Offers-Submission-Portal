-- 1. Create a public storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- 2. Allow public access to the bucket (for reading and uploading during this phase)
create policy "Public Access"
on storage.objects for all
using ( bucket_id = 'documents' )
with check ( bucket_id = 'documents' );

-- 3. Add document_url column to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "document_url" TEXT;
