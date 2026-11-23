# ftsduaenam.web.id

Portal statis minimalis untuk **Mahasiswa Fakultas Teknologi Informasi dan Sains Data (FATISDA) UNS Angkatan 2026 (Vikolvere & Verivela)**, siap di-host langsung di **GitHub Pages**.

## Stack

- **Vite + React 19 + TypeScript** (100% static output di `dist/`)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Motion (`motion/react`)** untuk animasi spring berbasis physics dan scroll depth
- **Phosphor Icons (`@phosphor-icons/react`)**
- **Fontsource** (self-hosted `Barlow Condensed`, `Instrument Serif`, `Inter`, dan `Kaushan Script`)

## Pengembangan Lokal

```bash
pnpm install
pnpm dev
```

## Verifikasi & Build

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm preview
```

## Menambah Layanan Baru

Seluruh katalog layanan, tautan akses, dan item Pintasan Cepat (`Cmd/Ctrl + K`) tersimpan di [`src/data/services.ts`](src/data/services.ts). Tambahkan entri baru di file tersebut tanpa perlu mengubah struktur halaman.

## Konfigurasi Opsional Discord Invite

Salin `.env.example` menjadi `.env.local` (atau tambahkan di **GitHub Repository Settings -> Secrets and variables -> Actions -> Variables**):

```env
VITE_DISCORD_INVITE_URL=https://discord.gg/...
```

(`NEXT_PUBLIC_DISCORD_INVITE_URL` juga ikut terbaca otomatis melalui `envPrefix` di `vite.config.ts`.) Jika dikosongkan, tombol Discord akan otomatis mengarah ke halaman Login Discord OAuth2 di TaskPanel.

## Deploy ke GitHub Pages & DNS Cloudflare

1. Pastikan visibility repository sesuai paket GitHub (gunakan **Public**, atau GitHub Pro/Enterprise jika **Private**).
2. Di GitHub repository, buka **Settings -> Pages -> Build and deployment** lalu pilih **Source: GitHub Actions**.
3. (Opsional) Tambahkan variable `VITE_DISCORD_INVITE_URL` di **Settings -> Secrets and variables -> Actions -> Variables**.
4. Push ke branch `main`; workflow `.github/workflows/deploy.yml` akan otomatis menjalankan `pnpm build` dan memublikasikan isi folder `dist/` beserta file `CNAME` (`ftsduaenam.web.id`).
5. Konfigurasi DNS di **Cloudflare -> DNS -> Records** (wajib **DNS only / awan abu-abu**, bukan *Proxied* saat verifikasi GitHub Pages):
   - Hapus record CNAME lama yang salah mengarah ke `www.<username>.github.io`.
   - Tambahkan **4 record `A`** untuk apex `@` (`ftsduaenam.web.id`):
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Tambahkan **1 record `CNAME`** untuk `www` mengarah ke `<username>.github.io` (tanpa awalan `www.`, contoh: `izerrr.github.io`), dengan status **DNS only**.
6. Kembali ke **Settings -> Pages**, klik **Check again** pada Custom domain `ftsduaenam.web.id`, lalu aktifkan **Enforce HTTPS** setelah sertifikat terbit.
