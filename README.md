# ftsduaenam.web.id

Portal tipografi imersif 3-scene untuk **ftsduaenam** (FATISDA UNS Angkatan 2026, Vikolvere & Verivela), di-host statis di **GitHub Pages**.

## Struktur 3 Scene

1. **01 // FTSDUAENAM** (`#0B0B0C`): Monolith tipografi interaktif dengan cursor-reactive cobalt aura dan transisi scroll-zoom portal.
2. **02 // TASKPANEL** (`#F4F4F0` -> `#0258FF`): Gerbang tunggal monumental menuju `https://taskpanel.ftsduaenam.web.id` dengan efek full-bleed cobalt flood saat hover/focus.
3. **03 // SIGNAL** (`#0B0B0C`): Lockup tipografi `CONTACT` (`admin@ftsduaenam.web.id`) dengan tombol salin cepat serta tautan `LOGIN`, `PRIVACY`, dan `TERMS`.

## Stack

- **Vite + React 19 + TypeScript** (static build di `dist/`)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Motion (`motion/react`)** (`useScroll`, `useTransform`, `useMotionValue`, `useSpring`)
- **Phosphor Icons (`@phosphor-icons/react`)**
- **Fontsource** (`Barlow Condensed`, `Instrument Serif`, `Inter`, `Kaushan Script`)

## Pengembangan & Verifikasi

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

## Deploy ke GitHub Pages & DNS Cloudflare

1. Pastikan visibility repository sesuai paket GitHub (**Public**, atau GitHub Pro/Enterprise jika **Private**).
2. Di GitHub repository, buka **Settings -> Pages -> Build and deployment** lalu pilih **Source: GitHub Actions**.
3. Push ke branch `main`; workflow `.github/workflows/deploy.yml` akan otomatis membangun dan memublikasikan `dist/` beserta `CNAME` (`ftsduaenam.web.id`).
4. Di **Cloudflare -> DNS -> Records** (status **DNS only / awan abu-abu**):
   - 4 record `A` untuk `@` (`ftsduaenam.web.id`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - 1 record `CNAME` untuk `www` -> `<username>.github.io`.
5. Setelah DNS valid di **Settings -> Pages**, aktifkan **Enforce HTTPS**.
