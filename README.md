# Volt & Wrench EV Garage

Website for an independent electric vehicle repair shop, built with React + Vite.

## Pages

- **Home** - overview, quick links to booking and remote programming
- **Services** - list of shop services
- **Remote Online Programming** - form-only intake (no WhatsApp) for customers who need
  remote ECU/module/key programming. Requires name, phone, email, car model, and VIN.
- **About** - shop info and hours
- **Book a Service** - in-shop appointment request form
- **Customer Portal** - customer sign-in and a live view of their submitted requests

Shop name, contact info, hours, and the services list are all defined in one place:
`src/siteConfig.js`.

## Running locally

```bash
npm install
npm run dev
```

## Connecting to your ERP system

The site never calls your ERP directly from the browser - that would expose your ERP's
API credentials to every visitor. Instead, all portal/booking/remote-programming
requests go through `src/api/client.js`, which calls **your own backend** at
`VITE_API_BASE_URL`. Your backend holds the real ERP API key server-side and proxies
these calls to the ERP.

Expected backend endpoints:

- `POST /auth/login` - `{ email, password }` → `{ token, email }`
- `POST /customer/requests` - creates a service/remote-programming request, forwarded
  to the ERP as a new job/ticket
- `GET /customer/requests` - returns the signed-in customer's requests and their
  current status from the ERP (authenticated via `Authorization: Bearer <token>`)

Until `VITE_API_BASE_URL` is set (see `.env.example`), the site runs in **demo mode**:
requests are stored in the browser's `localStorage` so every page and form is fully
testable without a backend.

## Build

```bash
npm run build
```
