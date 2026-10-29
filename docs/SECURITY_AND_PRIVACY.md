# Security & Privacy Notes

## What this app does and does not do

- **No analytics, tracking, social login, or third-party managed
  services.** Everything runs on your own VM: app, PostgreSQL, and Caddy.
  Next.js telemetry is explicitly disabled (`NEXT_TELEMETRY_DISABLED=1`
  in `.env` and the Dockerfile), Better Auth telemetry is explicitly
  disabled (`telemetry.enabled: false`), and Better Auth experimental
  instrumentation is disabled.
- Authentication is email + password via Better Auth. Passwords are
  hashed by Better Auth (scrypt); sessions are random tokens stored in
  the database.

## Cookies

Session cookies are `HttpOnly`, `SameSite=Lax`, `Secure` in production,
path `/`. `useSecureCookies` and `trustedProxyHeaders` are enabled only
when `NODE_ENV=production`.

## Stored user data

Better Auth tables (`user`, `session`, `account`, `verification`,
`rate_limit`) store: name, email, email-verified flag, hashed password,
session tokens with expiry, IP address and user agent on sessions, and
rate-limit counters. `/api/me` exposes only `id`, `name`, `email`,
`emailVerified`, `image` for the **current session** — no endpoint can
read another user's record.

## Password reset

Reset email delivery is **off by default** (`PASSWORD_RESET_ENABLED=false`);
no token or URL is ever logged. When enabled, the app makes outbound SMTP
connections (TLS 1.2+, STARTTLS or implicit TLS) to your configured SMTP
provider. Reset links are single-use, time-limited tokens managed by
Better Auth; sessions are revoked on password reset.

## Outbound communications

- **Caddy** contacts the ACME CA (Let's Encrypt by default) for
  certificate issuance/renewal and may perform OCSP/CRL checks.
- **SMTP** only when password reset is explicitly enabled.
- **OS/Docker** package registries during build/update only.

There are no other outbound calls at runtime.

## Logging

- Caddy's `Caddyfile` deliberately configures **no access log**, because
  password-reset tokens can appear in request query strings.
- The app logs no credentials, tokens, or reset URLs. A reset-delivery
  failure logs only the generic message `Password reset email delivery
  failed`.

## Secrets handling

- All secrets come from `.env` (git-ignored) → Compose environment. No
  secrets are baked into images; the Dockerfile uses placeholder build
  values only.
- Container environment variables are **visible to root on the host**
  (`docker inspect`, `/proc`). Keep host access restricted.
- The database admin password exists only on the `db` service; the app
  uses a DML-only role and migrations a separate DDL role.

## Infrastructure caveats

- OCI, your DNS provider, and the ACME CA inherently see metadata (VM,
  domain, certificate transparency logs list your domain publicly).

- Database backups contain personal data — store them encrypted and
  off-box.
- `docker compose down -v` permanently destroys the database volume.
- Data retention: expired sessions/verifications accumulate until
  cleaned; there is currently no automated purge — consider a scheduled
  job if retention limits matter to you.
- In an incident (suspected secret/session compromise), rotate
  `BETTER_AUTH_SECRET` (invalidates all sessions), DB passwords, and
  SMTP credentials, then redeploy.
