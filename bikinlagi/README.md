# Dashboard Pengelolaan Aset Digital

Platform terpusat untuk mengelola domain, hosting, VPS, dan website perusahaan.

## 🚀 Fitur Utama

- **Manajemen Domain**: CRUD operasi dengan integrasi WHOIS API otomatis
- **Manajemen Hosting**: Kelola akun hosting dengan relasi ke domain
- **Manajemen VPS**: Kelola server VPS dengan enkripsi kredensial
- **Manajemen Website**: Kelola website dengan relasi ke hosting/VPS
- **Manajemen Staff**: Kelola pengguna dengan 3 role berbeda
- **Dashboard Analitik**: Statistik real-time dan notifikasi aset kedaluwarsa
- **Notifikasi WhatsApp**: Integrasi Fonnte API untuk reminder otomatis
- **Role-Based Access Control**: 3 level akses (Super Admin, Admin Web, Finance)

## 📋 Persyaratan Sistem

- Node.js 18.x atau lebih tinggi
- NPM atau Yarn
- Akun Supabase
- Akun Fonnte (untuk notifikasi WhatsApp)

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS v3, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## ⚙️ Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd digital-asset-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env.local` dan isi dengan konfigurasi Anda:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Whois API Configuration
NEXT_PUBLIC_WHOIS_API_URL=https://get.indexof.id/api/whois

# Fonnte API Configuration (for WhatsApp notifications)
FONNTE_API_TOKEN=your_fonnte_api_token
FONNTE_DEVICE_ID=your_fonnte_device_id
```

4. Setup database di Supabase:
   - Buat project baru di Supabase
   - Jalankan SQL schema dari file `database/schema.sql`
   - Enable Row Level Security (RLS)

5. Jalankan development server:
```bash
npm run dev
```

6. Buka [http://localhost:3000](http://localhost:3000)

## 👤 Role & Permissions

### Super Admin
- Full CRUD access ke semua modul
- Dapat mengelola staff/pengguna
- Akses ke semua fitur sistem

### Admin Web
- CRUD access ke domain, hosting, VPS, website
- Tidak dapat mengelola staff
- Akses ke dashboard dan laporan

### Finance
- Read-only access ke semua data
- Dapat update WHOIS data domain
- Akses ke laporan keuangan

## 📁 Struktur Project

```
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   │   ├── domains/      # Domain management
│   │   ├── hosting/      # Hosting management
│   │   ├── vps/          # VPS management
│   │   ├── websites/     # Website management
│   │   └── staff/        # Staff management
│   ├── login/            # Authentication
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   └── dashboard/       # Dashboard components
├── lib/                 # Utility functions
│   ├── auth.ts         # Authentication helpers
│   └── supabase/       # Supabase clients
├── database/           # SQL schemas
└── types/              # TypeScript types
```

## 🔐 Security

- Semua kredensial VPS dan website disimpan terenkripsi
- Row Level Security (RLS) aktif di semua tabel
- Authentication menggunakan Supabase Auth
- Session management otomatis

## 📊 Database Schema

### Tabel Utama:
- `staff` - Data pengguna sistem
- `domains` - Data domain
- `hosting` - Data hosting
- `vps` - Data VPS
- `websites` - Data website
- `domain_hosting` - Relasi domain-hosting
- `activity_logs` - Log aktivitas sistem

### Views:
- `expiring_assets` - Aset yang akan kedaluwarsa dalam 30 hari
- `dashboard_stats` - Statistik dashboard

## 🚀 Deployment

1. Push code ke GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel
4. Deploy!

## 📝 Catatan Pengembangan

- Gunakan `npm run dev` untuk development
- Gunakan `npm run build` untuk production build
- Gunakan `npm run lint` untuk check linting
- Database migrations ada di folder `database/`

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
