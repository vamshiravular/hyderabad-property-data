# Raven: map, contact, and shared discussions

This update is designed for the existing Vercel Git deployment. No frontend framework or external npm dependencies are required. The name is Raven; the receiving inbox is configured privately through `CONTACT_TO_EMAIL`.

## Preview and release

- Node.js 22: run `npm test`, `npm run build`, then `npm run dev`.
- Vercel settings: Framework **Other**, Build Command `npm run build`, Output Directory `dist`, Production Branch `main`. These values are also declared in `vercel.json`; remove stale dashboard overrides if they conflict.
- Preview changes on the feature branch before merging. The map and copy-query option work without service secrets. Direct email and public posting remain honestly disabled until configured.
- GitHub Pages can continue serving the static map, but it does not execute `/api` server routes. Full functionality uses Vercel.

## Enable shared discussions and abuse limits

1. Create a Supabase project under your own account.
2. Run `supabase-schema.sql` in its SQL Editor.
3. In Vercel Project Settings → Environment Variables add `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. Use a server secret key, or a legacy service-role key, never an anonymous/publishable key. Do not paste keys in chat or commit them.
4. Add `RATE_LIMIT_SALT`: generate a random secret of at least 32 characters (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
5. Configure both Preview and Production environments as appropriate, then redeploy.

Postgres tables have Row Level Security enabled and no browser-facing grants. All reads and writes use server routes. Posts and replies are published without login; display names are unverified. The owner can set `status = hidden` on any comment to moderate it. Comments use text-only rendering. Five posts/replies per IP hash per hour are permitted; email enquiries permit three. The hourly counter is atomic and shared across serverless instances. Periodically delete rate-limit rows older than 48 hours.

Pagination reads 20 top-level threads and up to 200 replies for the visible batch; exceptionally busy threads can exceed that reply display cap. For a larger community, add authenticated identities, a dedicated moderation dashboard, a CAPTCHA, reply pagination, and stronger abuse controls.

## Enable private email enquiries

1. Create a Resend account and verify a sending domain you own. Use its restricted test sender only with the recipient permitted by your Resend account.
2. Add `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (for example `Raven <hello@your-verified-domain>`), and `CONTACT_TO_EMAIL` (the private receiving inbox confirmed by the owner) to Vercel’s server environment variables. The database/rate-limit variables above must also be configured.
3. Redeploy. Open Talk to us and submit a test query yourself. Verify its arrival in the inbox and spam folder. The UI reports provider acceptance only; final delivery still depends on the mail provider.

The visitor’s email is placed in Reply-To, never From. The recipient is chosen only from server configuration, never browser input. Retries use an idempotency key. There is no direct email attachment upload and no phone number has been configured. The copy-query option is available before server setup and requires the visitor to click Send in their email app.

## Values: required research, not fictional population

`data/area-values.json` starts with no reviewed records. This is intentional: government rates need exact-property scope, while market evidence needs observed asking/transaction records and dates. The old fictional values are excluded from the map.

Each new record uses a ward ID from `data/area-index.json` and may include:

```json
{
  "wardId": "ward-234",
  "government": {
    "status": "verified", "value": 0, "unit": "sq ft",
    "propertyType": "residential apartment", "scope": "EXACT STREET / CATEGORY",
    "sourceUrl": "https://OFFICIAL-SOURCE", "effectiveDate": "YYYY-MM-DD", "reviewedAt": "YYYY-MM-DD"
  },
  "market": {
    "status": "verified", "low": 0, "high": 0, "unit": "sq ft",
    "propertyType": "residential apartment", "basis": "asking", "sampleSize": 0,
    "sourceUrl": "https://PERMITTED-SOURCE", "observedFrom": "YYYY-MM-DD", "observedTo": "YYYY-MM-DD", "reviewedAt": "YYYY-MM-DD"
  }
}
```

The zeroes and dates above are schema placeholders, not valid production values. Run the validator after adding actual reviewed observations. Build validation rejects invalid metadata, unsourced values, nonpositive rates, and unknown ward IDs. A real observed value must retain its property scope and cannot be advertised as one universal price for the entire ward.

## Boundary provenance

Primary administrative reference: https://hydraa.telangana.gov.in/about, checked 2026-11-01. Boundary geometry: https://access.hyderabad.urbanobservatory.in/data/boundaries.pmtiles and its `endpoints.json` manifest dated 2026-07-12. Ward geometry and attributes were decoded from zoom 14; buffered tiles were clipped, feature fragments unioned, geometry simplified by 0.000025 degrees, and coordinates rounded to six decimals. Source processing/metadata are attributed to Hyderabad Urban Lab / Hyderabad Urban Observatory; underlying layers keep their source terms. The map is indicative digitisation, not a certified legal survey. See `data-sources.html` for user-facing provenance.

Expected totals: 300 wards (GHMC 150, Cyberabad 76, Malkajgiri 74), 60 circles, 12 zones, three municipal corporations, plus SCB and other special-area context. The property map uses the expanded footprint.

No actual email delivery or live database write is validated until the owner configures the services and runs the delivery/posting checks above.
