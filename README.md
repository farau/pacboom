# PacBoom

PacBoom now runs on React 19 and the Next.js App Router. Pages and their initial HTML are server-rendered; the arcade canvas, wallet connection, and contract interactions hydrate as focused client components.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>. A WalletConnect project ID is required for WalletConnect-based wallets in production. Browser-injected wallets remain available during local development.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm start
```

`server.js` is the custom server: it keeps the existing PostgreSQL, OAuth, score-validation, and signing endpoints, then delegates page rendering to Next.js. The UI no longer reads `window.ethereum`; RainbowKit, wagmi, and viem handle wallet and chain access.

See [CHANGELOG.md](./CHANGELOG.md) for the current migration details and release history.
