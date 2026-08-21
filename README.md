# Medusa E2E Test Automation Suite

A Playwright + TypeScript test automation framework built against a real Medusa.js e-commerce application (storefront, admin, and API layers). Built as a portfolio project to demonstrate practical test automation skills.

## Why this project is scoped the way it is

Rather than automating one flow deeply, this suite is built to demonstrate a broad range of Playwright techniques — page object design, custom fixtures, multi-app auth handling, async race conditions, and API testing — across a small, deliberately varied set of scenarios. The goal was breadth of technique over depth of coverage.

## What's covered

**Storefront**
- Variant-gated add-to-cart behavior (button disabled until a required option is selected)
- Cart line-item math (quantity changes recalculate price correctly; removing an item empties the cart)
- Multi-item cart subtotal correctness across randomly selected products/variants
- Guest checkout end-to-end (address → delivery → payment → order confirmation, with total verified pre- and post-checkout)
- Checkout form validation (can't proceed with required fields empty)

**Admin**
- Full multi-step product creation wizard: general details, enabling variants, selecting option types, configuring per-variant pricing and inventory, publishing
- Handles real UI quirks: duplicate DOM instances of the same field across wizard steps, sticky-header overlap, dropdown/combobox timing

**Cross-app**
- A product created and published in the admin actually appears on the public storefront, verified in a genuinely separate, unauthenticated browser context (not just a second tab) — including working around Next.js ISR cache lag

**API**
- Public Store API returns correctly shaped product data
- Authenticated Admin API session (reusing the same login-once `storageState` as the UI tests) can read protected data
- Unauthenticated requests to the Admin API are correctly rejected with 401 (maps to a real security scenario from the original risk assessment)

## Techniques demonstrated

- **Page Object Model** — one class per page/app-section, business logic (e.g. `calculateExpectedSubtotal`) kept out of test files
- **Custom fixtures** (`fixtures/PageFixtures.ts`) — page objects injected as typed fixtures instead of instantiated per test
- **Auth once, reuse everywhere** — `auth.setup.ts` logs in as admin once and saves `storageState`, reused across both UI *and* API projects
- **Multi-project config** — separate Playwright projects per app/base URL (storefront, admin, cross-app, api), since a single global `baseURL` breaks once you have more than one app under test
- **Genuine cross-context testing** — a fresh, unauthenticated browser context to prove storefront behavior independent of the admin session, rather than reusing an already-authenticated page
- **Retry-until-consistent async patterns** (`expect(...).toPass()`) — for real eventual-consistency issues like ISR cache lag, retrying the whole navigation, not just the assertion
- **`test.step()`** — for readable, structured HTML reports

## Project structure

```
├── tests/
│   ├── storefront/       # product discovery, cart, checkout
│   ├── admin/             # product creation
│   ├── cross-app/         # admin → storefront propagation
│   ├── api/                # Store API, Admin API, auth enforcement
│   └── auth.setup.ts       # logs in once, saves admin session
├── page_objects/
│   ├── storefront/         # HomePage, StorePage, ProductPage, CartPage, CheckoutPage
│   └── admin/               # AdminLoginPage, AdminProductsPage, AdminOrdersPage
├── fixtures/
│   └── PageFixtures.ts      # wires page objects into Playwright's test fixture
├── data/                     # test data (admin product fixtures, checkout addresses)
├── .github/workflows/        # CI (see below)
└── playwright.config.ts
```

## Running locally

Prerequisites: a Medusa backend + storefront running locally (`npm run dev` in each), matching the ports in `playwright.config.ts` (storefront `:8000`, backend/admin `:9000`).

```bash
npm ci
npx playwright install --with-deps

# run everything
npx playwright test

# or scope to one project
npx playwright test --project=storefront
npx playwright test --project=admin
npx playwright test --project=cross-app
npx playwright test --project=api
```

The `api` project's Store API test needs a publishable API key set in `.env` as `MEDUSA_STORE_PUBLISHABLE_KEY` (Settings → API Key Management in the Medusa admin).

## CI

GitHub Actions runs on every push/PR: installs dependencies, type-checks the whole suite, installs Playwright's browsers, and verifies every test file is discoverable and error-free (`playwright test --list`).

**What CI deliberately does *not* do yet:** run the tests against a live Medusa instance. Medusa only runs locally right now and isn't containerized, so there's nothing for the CI runner to test against. Rather than fake this or leave it silently broken, CI is scoped to catch what it *can* catch automatically — TypeScript errors and broken test files — until the app is containerized.

## Known limitations / next steps

- **Dockerize Medusa** (backend + storefront + Postgres) so CI can spin up a real instance and run the full suite end-to-end, not just validate it. This is a substantial follow-up project on its own, not a quick add-on.
- **Test data cleanup** — repeated cross-app test runs have left a number of throwaway products in the store (`Cross App Test Product ...`). The cross-app test doesn't currently tear down what it creates; adding cleanup (via the Admin API) is a natural next step.
- **`POST /admin/products` API test** — an `AdminApi` helper (create/delete product, get default sales channel) exists but isn't wired into a test yet, since it needs a payload shape confirmed against the exact Medusa version in use.
