# Deployment — OCI Always Free (Ubuntu / Ampere A1)

This guide deploys the portal on an Oracle Cloud Infrastructure (OCI)
Compute instance using Docker Compose and Caddy for automatic HTTPS.

> **Cost honesty:** the official Always Free allocation for Ampere A1 is
> **2 OCPUs and 12 GB RAM total per tenancy** (1,500 OCPU-hours and
> 9,000 GB-hours per month). Ampere capacity is frequently
> "out of capacity" in popular regions — try other regions or retry.
> OCI may reclaim idle Always Free instances. ₹0 is **not** guaranteed:
> exceeding free limits, paid resources, or registering a domain costs
> money. A public domain name is required for trusted HTTPS and usually
> costs a small annual fee.

## 1. Create the VM

- Shape: `VM.Standard.A1.Flex` (Ampere ARM64) — within your Always Free
  limit — or an Always Free `VM.Standard.E2.1.Micro` (x86). The Docker
  images are multi-arch safe.
- Image: Ubuntu 24.04 (or 22.04).
- Networking: a VCN with a public subnet; assign a public IPv4.
- Generate/attach an SSH key.

## 2. Open the firewall (two layers)

**OCI Security List / NSG** on the subnet or instance:

| Direction | Source | Ports | Purpose |
| --- | --- | --- | --- |
| Ingress | your IP only | TCP 22 | SSH |
| Ingress | 0.0.0.0/0 | TCP 80 | HTTP → ACME + redirect |
| Ingress | 0.0.0.0/0 | TCP 443, UDP 443 | HTTPS / HTTP/3 |
| Egress | 0.0.0.0/0 | all | updates, ACME, SMTP |

**Host firewall** (Ubuntu, run on the VM):

```bash
sudo ufw allow from YOUR_IP to any port 22 proto tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
```

## 3. Install Docker Engine + Compose plugin

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER   # log out/in afterwards
```

## 4. DNS

Create an **A record** (and **AAAA** if you have IPv6) for your domain
pointing at the VM's public IP. Caddy cannot issue a certificate until
DNS resolves and ports 80/443 are reachable.

## 5. Configure the app

```bash
git clone https://github.com/Sadiya-125/HCP-Portal.git hcp-portal && cd hcp-portal
cp .env.example .env && nano .env
```

Set every value — especially:

- `DOMAIN=portal.yourdomain.example`
- `ACME_EMAIL=you@example.com` — required by the included Caddyfile for
  ACME registration.
- `BETTER_AUTH_URL=https://portal.yourdomain.example`
- `BETTER_AUTH_SECRET` — `openssl rand -base64 32`
- All `*_PASSWORD` values — long, random, **URL-safe** (letters, digits,
  `- _ . ~`) because Compose builds PostgreSQL URLs from them.
- SMTP block only if enabling password-reset email.

`.env` is git-ignored. Do not commit it.

## 6. Deploy

```bash
docker compose build
docker compose up -d
docker compose ps          # all services healthy; migrate exited 0
docker compose logs migrate
docker compose logs -f caddy   # watch certificate issuance
```

Startup order is automatic: `db` (healthy) → `migrate` (runs once,
`restart: "no"`) → `app` → `caddy`. Migrations re-run on every deploy;
they are idempotent. The public URL is `https://${DOMAIN}`.

## 7. Update

```bash
git pull
docker compose build
docker compose up -d
```

Compose recreates only changed services; the `migrate` service runs
again before the app starts.

## 8. Rollback

```bash
git checkout <previous-commit>
docker compose build && docker compose up -d
```

If a migration is involved, restore the database backup taken before
deploying (see below) — migrations are forward-only.

## 9. Health & troubleshooting

```bash
docker compose ps                       # health status
docker compose logs app | tail -100
# app port is intentionally unpublished; probe health inside the container:
docker compose exec app node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>console.log(r.status))"
docker compose logs caddy               # certificate problems
```

Common issues:

- **Certificate not issued** — DNS not pointed at the VM, or 80/443
  blocked at the NSG/security list or ufw.
- **app unhealthy** — check `DATABASE_URL` credentials and
  `docker compose logs migrate`.
- **migrate failed** — check `MIGRATION_DB_*` values; the role must exist
  (created on first init only — a fresh `db-data` volume is needed if
  the first init ran with wrong values).

## 10. Backups & restores

The database lives in the named volume `db-data`.
`docker compose down` keeps it; **`docker compose down -v` destroys all
data permanently.**

Backup (from the host, no published port needed; credentials and the
database name are read inside the container, so no host-shell env
exports are required):

```bash
docker compose exec -T db sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > backup-$(date +%F).dump
```

Copy the dump off-box (e.g. `scp` or OCI Object Storage).

Restore — prefer restoring into a **new empty database** first and
verifying it, because restores are destructive:

```bash
docker compose exec db sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" createdb -U "$POSTGRES_USER" restore_check'
cat backup-YYYY-MM-DD.dump | docker compose exec -T db sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore -U "$POSTGRES_USER" -d restore_check --no-owner'
# verify with: docker compose exec db psql -U postgres -d restore_check -c '\dt'
```

This `restore_check` database is **for validation only**. Restoring as
the `postgres` superuser makes the restored objects postgres-owned and
leaves the least-privilege `APP_DB_USER` without grants, so do not point
the app at it as-is.

Before promoting a restored database to production, restore ownership
and ACLs for the migration/app roles. Recommended flow — create the
target DB as admin, grant it to the migration role, restore **as the
migration role** (so objects are owned by it), then re-apply the app
role grants:

```bash
# 1. Admin creates the target DB and grants role privileges
docker compose exec db sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -d postgres -c \
   "CREATE DATABASE hcp_portal_restore;"'
docker compose exec db sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -d hcp_portal_restore -c \
   "GRANT CONNECT, CREATE ON DATABASE hcp_portal_restore TO $MIGRATION_DB_USER;
    REVOKE CREATE ON SCHEMA public FROM PUBLIC;
    GRANT USAGE, CREATE ON SCHEMA public TO $MIGRATION_DB_USER;
    GRANT CONNECT ON DATABASE hcp_portal_restore TO $APP_DB_USER;
    GRANT USAGE ON SCHEMA public TO $APP_DB_USER;"'

# 2. Restore as the migration role so objects get the right owner
cat backup-YYYY-MM-DD.dump | docker compose exec -T db sh -c \
  'PGPASSWORD="$MIGRATION_DB_PASSWORD" pg_restore -U "$MIGRATION_DB_USER" -d hcp_portal_restore --no-owner'

# 3. Re-apply app-role DML grants (same privileges as the init script)
docker compose exec db sh -c \
  'PGPASSWORD="$MIGRATION_DB_PASSWORD" psql -U "$MIGRATION_DB_USER" -d hcp_portal_restore -c \
   "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $APP_DB_USER;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $APP_DB_USER;"'

# 4. Verify, then set POSTGRES_DB=hcp_portal_restore in .env and run
#    `docker compose up -d` — Compose rebuilds both service DB URLs
#    from POSTGRES_DB (app and migrate must not be pointed by hand).
#    Alternatively, rename the databases and keep .env unchanged.
```

`pg_restore --clean` drops existing objects — it is destructive and
should only be run deliberately against a database you intend to
overwrite.

## 11. Rotating database passwords

Editing `.env` alone does **not** change passwords inside an existing
database — the init scripts in `docker/postgres/init/` run only once,
on first creation of the `db-data` volume. To rotate a role password on
a live deployment, change it in the database first, then update `.env`
and redeploy:

```bash
docker compose exec db psql -U postgres
# in the psql prompt:
\password hcp_app        # enter the new password interactively
\password hcp_migrate
\q
# then update .env and: docker compose up -d
```
