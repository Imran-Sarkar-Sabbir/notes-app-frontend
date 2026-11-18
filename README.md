# Notes web

Plain React + Vite frontend for the Notes API. Styling is minimal on purpose. The task is
about the backend.

- Live: `<add Render URL>`
- Backend repo: `<add link>`

## Running it

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:4000
npm run dev            # http://localhost:5173
```

## Pages

- **My notes**: create, edit, delete, "load more" paging
- **Posts**: write posts, read any user's posts by id (aggregation with `$lookup`)
- **Profile**: name, interests, password
- **Admin → Users**: add, edit (including role and password), delete, list. Links to each user's notes and posts
- **Admin → All notes**: everyone's notes, or one user's
- **Admin → By interest**: users grouped by interest, with an optional filter (aggregation scenario 1)

The token is stored in `localStorage`. A 401 from the API logs you out.

## Deploying

Render static site:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Env var: `VITE_API_URL` set to the deployed API (read at build time, so redeploy after changing it)
- Redirects/Rewrites: rewrite `/*` to `/index.html`, so a refresh on `/admin/users` doesn't 404
