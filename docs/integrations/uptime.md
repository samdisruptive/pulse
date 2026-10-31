# Uptime (internal)

Pulse checks sites itself from the worker. No external API.

- Every minute per active site (batched, concurrency limited): `GET https://<domain>/` with a 10 second timeout, redirects followed up to 5, a "Pulse uptime check" user agent.
- Success: 2xx or 3xx final response. Record status, response time and error type (DNS, connect, TLS, timeout, HTTP status).
- Down after 3 consecutive failures: open a CRITICAL issue and an Incident; recover after 3 consecutive successes.
- TLS certificate expiry checked daily; warn under 21 days.
- Keep raw checks 7 days, daily rollups (uptime %, p50, p95) indefinitely.
- Single location: label the UI "Checked every minute from our server" so a network problem at the VPS is not mistaken for client downtime. If all sites fail at once, suppress client issues and raise one agency issue instead.
