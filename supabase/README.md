## Supabase setup (GitHub Pages + Supabase)

### 1) Rotate leaked secrets (important)
- If you previously shared `service_role` or any `sb_secret...` keys, rotate them now from Supabase Dashboard.

### 2) Create tables + RLS
Run the SQL in `supabase/schema.sql` inside Supabase SQL Editor.

### 3) Create Storage bucket
- Create a bucket named `documents`
- Recommended: keep it **private**

### 4) Deploy Edge Function
Create an Edge Function named `create-company-user` with the code in:
`supabase/functions/create-company-user/index.ts`

Then set a Function secret:
- `SUPABASE_SERVICE_ROLE_KEY` = your **service_role** key (server-side only)

### 5) Frontend env (client)
Create `client/.env` locally (do not commit):

```
VITE_SUPABASE_URL=YOUR_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

Build + deploy:
```
cd client
npm run build
npm run deploy
```

