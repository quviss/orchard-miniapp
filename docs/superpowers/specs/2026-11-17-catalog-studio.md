# Orchard demo catalog improvements

The user approved improving equipment selection, the existing appearance, and a small catalog admin. Keep this a demonstration: no real orders, payments, backend, real shop photos, or new hosting. Preserve the existing plain HTML/CSS/JavaScript stack and Telegram Mini App behavior.

Selection: searchable catalog with Russian aliases, price/category/memory/SIM/availability filters, sorting, reset and helpful empty states. Favorites, recently viewed, and comparison of up to three products. Price/memory/SIM constraints must match one purchasable configuration, not unrelated variants. Main page shorter, no repeated category inventories, clear search and strictly monochrome (black/white/gray) interface; actual device photos and color swatches retain product colors. Keep light/dark support and existing device images/illustration fallbacks.

Admin: separate admin.html page, accessible from the store, browser-local edits, create/edit/duplicate/hide products, edit named configurations/prices/colors/stock/specs. Export/import versioned JSON, validate the entire import before writing, restore defaults after explicit local confirmation. Show local scope plainly. Handle storage failures visibly, never claim a failed save succeeded. Preserve valid cart entries after changes and discard invalid stale variants safely.

Telegram: retain SDK, BackButton, theme changes, haptics, ready/expand, older-client guards. Respect safe area and content safe area when available, viewport and keyboard. Keep checkout demo clearly labeled. No authentication claim for local admin. No deployment until reviewed.

Verification: Node built-in tests for real query and catalog persistence boundaries, invalid imports, corrupted state, selection constraints, compare limit; browser QA at phone and desktop sizes including admin persistence and cart. Exercise actual app startup/navigation/theme events with absent and partial Telegram SDK and modern SDK stand-ins. Actual Telegram client remains a separate verification limit.
