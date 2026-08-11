# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Deployment

This app is a client-side-routed SPA (`react-router-dom` with `BrowserRouter`).
There is only one real HTML entry point — `index.html` — and every route
(`/`, `/fleet/<id>`, …) is resolved in the browser by the router.

**The hosting platform must be configured with an SPA fallback**: serve/rewrite
`index.html` for *all* paths that don't match a static asset. Without it, deep
links such as `https://example.com/fleet/bmw-5er` (shared links, bookmarks, a
page refresh on a detail page) will 404 at the host before the app ever loads.

Vite's `pnpm dev` and `pnpm preview` servers do this automatically, so the
problem only appears in production. Most static hosts do **not** do it by
default and need an explicit rule, e.g.:

- **Netlify** — `public/_redirects` containing `/*  /index.html  200`
- **Vercel** — `vercel.json` with a rewrite of `/(.*)` to `/index.html`
- **Nginx** — `try_files $uri $uri/ /index.html;`
- **Apache** — a `.htaccess` `RewriteRule` to `index.html`
- **S3 + CloudFront** — error document set to `index.html` (or a CloudFront
  Function / custom error response mapping 403/404 to `/index.html` with a 200)
- **GitHub Pages** — a `404.html` copy of `index.html`

No such config file is committed here because the target host isn't decided
yet — add the one matching your platform before deploying.

Note that the router's own catch-all route (which redirects unknown paths to
`/`) only helps *after* `index.html` has been served; it cannot rescue a
host-level 404.
