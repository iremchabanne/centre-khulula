# client — Centre Khulula

The React frontend. Plain React: `useState`, `useEffect`, `fetch`. Two libraries only,
React Router and Tailwind. No form library and no Zod here — see `docs/decisions.md`.

```bash
npm install       # once
npm run dev       # http://localhost:5173
npm run build     # production build, into dist/
```

The whole stack, API and database included, starts from the repository root with
`docker compose up -d`.

- `src/pages/public/` — the six pages a visitor sees, no account needed
- `src/pages/staff/` — the seven pages behind a login
- `src/components/` — the two layouts and the three shared components
- `src/index.css` — the palette of `docs/conception/charte-graphique.md`, declared once
