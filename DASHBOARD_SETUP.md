# Private dashboard

## Frontend handoff

Develop the frontend on a separate branch based on the latest `main`, ideally
in a separate Git worktree. Keep the current public website intact. The private
personal dashboard lives at `/desk`, with Google sign-in and no automatic sends.
The messaging HTML is currently served through `/desk/app` from the separate
Reply Queue repo (`dist/index.html`); changing Next components alone does not
redesign that shell. A frontend agent may replace the shell with a native Next
view, but must preserve the authenticated server-side API boundary and real data.

Use same-origin `/api/dashboard/v1/...` endpoints, never a browser bearer token.
Keep `lib/desk/auth.ts`, `lib/desk/google-auth.ts`, auth routes,
`lib/dashboard/proxy.ts`, proxy routes and provider credentials unchanged unless
coordinating with the backend owner. GET `/v1/drafts` supplies per-chat text,
metadata and worker status. Draft keys are `channel:chat`. PUT accepts `key`,
`text` and optional `register`/`intent`; edits must survive polling and navigation.
All sends require exact recipient/text review followed by a manual approval
header. An unknown send outcome requires checking history, never blind retry.

Background draft generation, connector sessions, history and send delivery run
in `maramasaeva/reply-queue`, not in the website process. Future calendar,
Obsidian tasks/notes, visualisations and images are unconnected modules: do not
fill them with fake data or pretend they are connected. Google login itself
requests identity only; Gmail/calendar OAuth consent is still pending.

Verify `npm test`, `npx tsc --noEmit` and `npm run build:webpack` before merging.
The webpack build avoids the local Turbopack process/port restriction. Google
login needs private environment configuration before real account access works;
the default unconfigured state must remain fail-closed. No dev auth bypass is
provided. The separate local gateway `/app` can preview actual messaging while
Google/domain setup is pending.

`/desk` redirects the signed-in owner to `/desk/app`, the mobile-responsive messaging workspace. Signed-out visits to `/desk` and `/desk/app` return not found, and the public navigation has no desk link. To sign in on a new device, bookmark `https://maramasaeva.com/api/desk/google/start`; Google still grants access only to the allowed owner account. The previous X public-post reply tool is preserved at `/desk/x`. All private routes share the owner-only Google session and sign-out endpoint. `/dashboard` redirects to `/desk`. The desk is noindex, but privacy comes from authentication, not obscurity.

## Architecture

The browser communicates only with `maramasaeva.com`. Next.js authenticates the session, checks same-origin writes and forwards an explicit allowlist of messaging operations through `/api/dashboard`. Relay credentials remain server-only; no token is emitted into browser HTML or JavaScript. Each send requires the UI's explicit message confirmation and a manual-approval request header. There is no automatic send loop.

The website is hosted on Vercel. The messaging connectors run continuously on a separate background host, not inside short-lived website request handlers. WhatsApp uses its dedicated headless connector and Signal uses signal-cli: their normal apps need not remain open. iMessage requires a signed-in, permissioned Mac. Closing the dashboard does not stop connector workers or server-side draft generation. The host must remain powered, awake and online; a future Mac mini is suitable.

## Server environment

Configure these in the linked Vercel project `maramasaeva`, for Production. Never use `NEXT_PUBLIC_` prefixes.

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (default `https://maramasaeva.com/api/desk/google/callback`), and `DESK_SESSION_SECRET` (random, 32+ bytes). `GOOGLE_ALLOWED_EMAILS` defaults to `maramasaeva@gmail.com`. Only the verified owner account may sign in; legacy passphrase sessions are not accepted for messaging. This sign-in requests identity only, not Gmail/calendar access.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: existing server-side database credentials for the X public reply tool. Apply `supabase/desk.sql` if the desk tables have not already been created.
- `DASHBOARD_GATEWAY_URL`: a fixed public HTTPS **origin**, without `/app`, query parameters or credentials, pointing to the restricted Reply Queue dashboard relay.
- `DASHBOARD_GATEWAY_TOKEN`: the relay's separate `DASHBOARD_RELAY_TOKEN`, not the main `REPLY_QUEUE_TOKEN`.

Use Vercel Secret environment variables for credentials. Adding or changing production variables requires a new deployment. Credentials, session files, private voice documents, and conversation data must never enter either repository.

The restricted relay provides authenticated `/dashboard-shell` and approved `/v1` operations only. Do not point this dashboard at the old interactive Google-OAuth ngrok endpoint: a website server cannot complete a browser login. Use a dedicated machine-accessible, bearer-protected relay tunnel and preserve the old tunnel separately. A stable domain or persistent tunnel is needed for reliable service. No tunnel purchase, DNS change or production deployment is performed by adding this code.

## Verification

Run `node --experimental-strip-types --test lib/dashboard/proxy.test.mts` and `npm run build`. Before exposing a relay, run its tests in the Reply Queue repository. Verify unauthenticated API requests return 401, cross-origin writes return 403, setup/extension routes are inaccessible, and a normal signed-in browser sees no bearer token. A delivery timeout means **unknown**, not safe-to-retry: inspect the conversation before sending again.

Drafts use the configured background host's voice profile and conversation history and remain editable. New platform links, Signal history limitations, paid X API usage and model credentials are configured privately on the host, not through publicly reachable account-setup routes.

Queue dismissal uses same-origin authenticated `POST /api/dashboard/v1/queue/dismiss` with `{channel,chat}`. Undo uses `POST /api/dashboard/v1/queue/restore`. These only update the host's reply queue: they never delete provider messages, mark them read, or send a reply. Drafts remain saved; a new incoming message reopens the conversation. Reply destinations are read-only and come from the verified queue record, never cached browser recipient fields. Timeouts and missing delivery confirmations remain unknown and require checking the conversation before another attempt.

## Handoff: Google data permissions

Google sign-in currently grants identity access only. A separate, explicit Gmail + Calendar consent flow is still pending; no mailbox/calendar grant is silently added during sign-in. The next implementation should bind an encrypted PKCE/state/nonce flow to the signed-in owner's verified Google `sub` and email, require `gmail.readonly`, `gmail.send`, `calendar.events.readonly` and an offline refresh token, and transfer credentials server-to-server to the relay's fixed `/internal/google/link` endpoint. Tokens must never reach browser responses, source code, logs or Supabase. The dedicated web client will need a separately registered `/api/desk/google/connect/callback` redirect URI. Calendar is not included in the website BFF allowlist until that flow is implemented and verified.
