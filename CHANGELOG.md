# Changelog

## 1.1.0

**Fixes**
- `index.mjs` was importing `anime-fetch.mjs` but the file is `.js` — crashed on startup
- `parseList()` had a `return;` inside the for-loop instead of `continue`, so it would silently stop after the first non-anime entry
- Removed `import fetch from 'node-fetch'` — wasn't installed and Node 18+ has it built in
- `package.json` had wrong `main` field and was missing `"type": "module"`
- README said `FINISHED` but the correct status is `COMPLETED`

**Added**
- Manga support via `MAL_MANGA...` comment markers (`enable_manga: true`)
- Score display (`show_score: true`)
- Entry limits (`max_entries: N`)
- Retry logic on all API calls (3 retries, exponential backoff)
- Tests (`npm test`)
- `.env.example`
- `action.yml` no longer does a manual `git clone` — uses `${{ github.action_path }}` instead; bumped to checkout@v4, setup-node@v4, Node 20
- Removed unused `axios` and `cheerio` deps

## 1.0.0

Initial release.
