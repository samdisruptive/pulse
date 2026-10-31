# Environment variables

All variables are validated at startup by `src/server/env.ts`. The app refuses to start if a required one is missing.

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | all | production, development, test |
| `APP_BASE_URL` | Yes | web, worker | Public URL, for example https://pulse.digitallydisruptive.co.uk |
| `DATABASE_URL` | Yes | web, worker | PostgreSQL connection string |
| `REDIS_URL` | Yes | web, worker | |
| `LOG_LEVEL` | No | all | info by default |
| `AUTH_SECRET` | Yes | web | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | web | Same as APP_BASE_URL |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Yes | web | Google OAuth client for sign-in |
| `ALLOWED_EMAIL_DOMAIN` | Yes | web | digitallydisruptive.co.uk |
| `PULSE_ENCRYPTION_KEYS` | Yes | web, worker | Comma-separated `keyId:base64key` pairs, 32-byte keys: `openssl rand -base64 32` |
| `PULSE_ACTIVE_KEY_ID` | Yes | web, worker | Key used for new encryption |
| `PULSE_BLIND_INDEX_KEY` | Yes | web, worker | Separate 32-byte key for HMAC indexes |
| `GOOGLE_INTEGRATION_CLIENT_ID`, `GOOGLE_INTEGRATION_CLIENT_SECRET` | Phase 3 | web, worker | OAuth client for data access (can be the same project as sign-in, separate client recommended) |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Phase 5 | worker | From the agency manager account |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Phase 5 | worker | Manager account id, digits only |
| `META_APP_ID`, `META_APP_SECRET` | Phase 5 | web, worker | Webhook signature checks use the secret |
| `META_WEBHOOK_VERIFY_TOKEN` | Phase 5 | web | Random string for webhook verification |
| `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Phase 5 | web, worker | Once Marketing API access is approved |
| `CRUX_API_KEY` | Phase 4 | worker | Google Cloud API key restricted to the CrUX API |
| `CLOUDFLARE_API_TOKEN` | Optional | worker | Read-only analytics token |
| `OPENAI_API_KEY` | Phase 7 | web, worker | Server only |
| `AI_MODEL_ANALYSIS`, `AI_MODEL_FAST` | Phase 7 | web, worker | Defaults; admins can change in settings |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Phase 4 | worker | Notifications and digests |
| `REPORTS_STORAGE_DIR` | Phase 6 | worker, web | Mounted volume for PDFs |
| `SENTRY_DSN` | Optional | all | Error tracking |
| `DEMO_DATA` | Dev only | worker | Enables the demo provider |
| `E2E_AUTH` | Test only | web | Enables the test sign-in provider. Must be impossible in production. |

Never commit `.env` files. Back up the encryption keys separately from database backups: without them, stored credentials and lead data cannot be decrypted.
