# Orchard Catalog Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Improve this demo catalog's discovery, presentation and local catalog management while preserving Telegram integration.

**Architecture:** Keep buildless scripts. Shared catalog-core.js provides pure query/validation/persistence logic for storefront and admin, exportable to Node tests. Storefront retains current routes; admin is a separate static page.

**Tech Stack:** HTML, CSS, JavaScript, Node built-in test runner.

**Spec:** docs/superpowers/specs/2026-11-17-catalog-studio.md

## Global Constraints
- Demo only; no real orders, payments, backend, real shop photos, or new hosting.
- Preserve existing plain HTML/CSS/JavaScript and Telegram Mini App behavior.
- Local admin edits are browser-local; import/export must be validated.

## Review Focus
- Price and memory/SIM filters must match the same configuration.
- Invalid imports and unavailable storage must not destroy the current catalog.
- Stale persisted cart indices must never crash the app.
- Hidden/deleted products and empty catalogs must not break home or comparison.
- Older Telegram SDKs must start without unsupported-method failures.

### Task 1: Shared catalog behavior
**Files:** js/catalog-core.js, tests/catalog.test.cjs
**Interfaces:** Catalog.query(products, filters), Catalog.validate(payload,categories), Catalog.read(storage,defaults,categories), Catalog.write(storage,products,categories), Catalog.cleanCart(cart,products), Catalog.toggleCompare(ids,id,products).
- [x] Write failing Node tests covering Russian queries, matching configurations, price bounds, malformed imports, roundtrip persistence/failure, stale cart, comparison limit.
- [x] Run `node --test tests/catalog.test.cjs`; confirm missing behavior fails.
- [x] Implement shared validation and query/persistence functions.
- [x] Run the full test suite; expect all tests passing.

### Task 2: Storefront discovery and appearance
**Files:** js/app.js, css/style.css, index.html, js/telegram-bridge.js, tests/telegram.test.cjs
**Interfaces:** use Task 1 query and cleanCart; Catalog state loaded after photos.js. Telegram bridge wraps optional SDK methods and safe area updates.
- [x] Write failing Telegram bridge tests for startup/back/theme and unsupported SDKs.
- [x] Implement compact home, filtering, saved lists, comparison, demo labeling, fallback images, responsive green visual style.
- [x] Preserve current product/cart flow and Telegram integrations; run Node suite and syntax checks.

### Task 3: Local catalog studio
**Files:** admin.html, js/admin.js, css/admin.css, README.md
**Interfaces:** same Catalog.read/write/validate format; admin edits update storefront on return.
- [x] Implement accessible product editor, create/duplicate/hide, validation, import/export and reset with error states.
- [x] Check actual browser paths: local save/reload, storefront price, saved lists, comparison, filtering, cart and responsive layouts.
- [x] Run `node --test tests/*.test.cjs`, syntax checks, git diff --check; capture preview screenshots and package source for review.
