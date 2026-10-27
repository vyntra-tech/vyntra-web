# VYNTRA Solutions – Company Website

Build. Deploy. Scale. React + TypeScript + Vite frontend, GSAP/ScrollTrigger animations, React Three Fiber hero, Express contact API.

## Setup
```bash
npm install
cp .env.example .env     # fill SMTP + CONTACT_TO / CONTACT_FROM
npm run dev              # web on :5173, API on :8787 (Vite proxies /api)
```
Needs Node 20.6+.

## Production
```bash
npm run build            # type-check + build to dist/
npm start                # Express serves dist/ and /api/contact
```
Or host `dist/` on Vercel/Netlify and the API elsewhere, then set `VITE_API_URL` at build time to the API's full `/api/contact` URL and `CLIENT_ORIGIN` on the API to your site URL.

## Contact form
`POST /api/contact` validates with zod, rate-limits (5 per 15 min per IP), has a honeypot field, escapes HTML, and sends mail via SMTP (nodemailer). If SMTP is not configured it returns 503 and the form shows an error; it never reports fake success. `GET /api/health` shows `mailConfigured`.

## Edit content
- `src/data/products.ts`, `src/data/projects.ts`: replace placeholders with verified items.
- `src/data/content.ts`: process steps, value props, and the footer email, social links, Privacy and Terms URLs (footer shows them only when set).
- `src/data/services.ts`: services copy.

## Notes
Plain CSS design tokens live in `src/index.css` (Tailwind is not used). Lenis was left out in favour of native scrolling.
