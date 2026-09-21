# Changelog

All notable changes to PacBoom are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and published releases continue to use the existing Git tag versioning.

## [Unreleased]

### Added

- React 19 application powered by the Next.js 16 App Router and TypeScript.
- Server-rendered pages with focused client-side hydration for the arcade game and wallet interactions.
- RainbowKit, wagmi, viem, and TanStack Query integration for wallet connection and Blast contract calls.
- Responsive React canvas game with keyboard, boost, and mobile swipe controls.
- Global Pac-Man soundtrack with a visible play/pause control.
- Restored animated yellow starfield, game sound effects, explosion audio, vibration, and Game Over animation.
- Wallet authentication flow based on signed messages and server-side sessions.
- Onchain score-claim modal with transaction status, entry fee, explorer link, and score sharing.
- Next.js pages for the game, player account, leaderboard, About, and PAC Fidelity.
- ESLint, strict TypeScript checking, production build scripts, environment example, and project documentation.

### Changed

- Reworked `server.js` as a custom Express and Next.js server while preserving PostgreSQL, OAuth, leaderboard, score-validation, and signing endpoints.
- Replaced direct `window.ethereum` access with RainbowKit and wagmi.
- Upgraded the blockchain integration from ethers v5 to ethers v6.
- Rebuilt the interface around the original PacBoom identity: Geom typography, black navigation and footer, Blast yellow controls, and the historical two-column game layout.
- Reduced the client contract ABI to the functions required by the core game, score claims, and PacNub ownership.
- Focused the product on the core arcade experience; Arena, Boosts, and PFP Lab are no longer exposed.

### Fixed

- Centered the Game Over modal reliably by rendering it through a document-level portal.
- Kept the Game Over modal visible and actionable after a rejected or failed wallet transaction.
- Restored the fatal-collision explosion sound, death sound, and visual feedback.
- Made the site soundtrack persist independently of individual game runs and comply with browser autoplay restrictions.
- Updated the leaderboard provider and unit-formatting calls for ethers v6 compatibility.
- Prevented the legacy static homepage from bypassing Next.js server rendering.

### Removed

- Arena, Boost dashboard, and PFP generator routes and React components.
- Legacy HTML and EJS pages replaced by Next.js routes.
- Legacy browser scripts, obfuscated JavaScript bundles, Bootstrap-era stylesheet, and bundled ethers v5 build.
- Obsolete Babel configuration and JavaScript obfuscation script.
- Unused frontend and build dependencies left over from the legacy application.
- Tracked `.DS_Store` files from public asset directories.

## [4.1.0.7] - 2025-07-22

### Changed

- Updated the affected image reference from JPG to PNG.

## [4.1.0.6] - 2025-06-27

### Changed

- Removed the seasonal Christmas presentation.
- Refreshed the obfuscated legacy JavaScript bundles.

[Unreleased]: https://github.com/farau/pacboom/compare/v4.1.0.7...HEAD
[4.1.0.7]: https://github.com/farau/pacboom/compare/v4.1.0.6...v4.1.0.7
[4.1.0.6]: https://github.com/farau/pacboom/releases/tag/v4.1.0.6
