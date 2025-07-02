# Daftar Tugas: Proyek Dashboard Pengelolaan Aset

Ini adalah daftar tugas untuk pengembangan dashboard internal perusahaan.

## Fase 1: Penyiapan Proyek & Konfigurasi Awal
- [ ] Inisialisasi proyek Next.js 15.
- [ ] Konfigurasi Tailwind CSS v3.
- [ ] Buat proyek baru di Supabase.
- [ ] Konfigurasi variabel lingkungan (`.env.local`) untuk koneksi ke Supabase.
- [ ] Inisialisasi repositori Git dan lakukan *initial commit*.
- [ ] Pilih dan instal library komponen UI (misalnya: shadcn/ui, Headless UI).

## Fase 2: Autentikasi & Skema Database
- [ ] Implementasikan Supabase Auth untuk fungsionalitas login & logout.
- [ ] Buat halaman login.
- [ ] Terapkan *protected routes* untuk halaman dashboard.
- [ ] Rancang skema database untuk tabel `domains`, `hostings`, dan `vps` di Supabase.
- [ ] Buat tabel-tabel tersebut menggunakan Supabase SQL Editor atau Migrations.
- [ ] Tentukan RLS (Row Level Security) Policies untuk keamanan data.

## Fase 3: Fitur Inti - Manajemen Domain
- [ ] Buat halaman untuk menampilkan daftar domain.
- [ ] Buat *Server Actions* atau API routes untuk mengambil data domain dari Supabase.
- [ ] Buat komponen form untuk menambah/mengedit domain.
- [ ] Implementasikan fungsionalitas untuk **menambah** domain baru.
- [ ] Implementasikan fungsionalitas untuk **memperbarui** domain.
- [ ] Implementasikan fungsionalitas untuk **menghapus** domain.

## Fase 4: Fitur Inti - Manajemen Hosting
- [ ] Buat halaman untuk menampilkan daftar akun hosting.
- [ ] Buat *Server Actions* atau API routes untuk mengambil data hosting.
- [ ] Buat komponen form untuk menambah/mengedit hosting.
- [ ] Implementasikan fungsionalitas untuk **menambah** akun hosting baru.
- [ ] Implementasikan fungsionalitas untuk **memperbarui** data hosting.
- [ ] Implementasikan fungsionalitas untuk **menghapus** data hosting.

## Fase 5: Fitur Inti - Manajemen VPS
- [ ] Buat halaman untuk menampilkan daftar VPS.
- [ ] Buat *Server Actions* atau API routes untuk mengambil data VPS.
- [ ] Buat komponen form untuk menambah/mengedit VPS.
- [ ] Implementasikan fungsionalitas untuk **menambah** VPS baru.
- [ ] Implementasikan fungsionalitas untuk **memperbarui** data VPS.
- [ ] Implementasikan fungsionalitas untuk **menghapus** data VPS.

## Fase 6: Dashboard & Penyelesaian
- [ ] Buat halaman dashboard utama yang menampilkan ringkasan statistik.
- [ ] Implementasikan logika untuk menampilkan notifikasi layanan yang akan kedaluwarsa.
- [ ] Lakukan *refactoring* dan perbaikan UI/UX.
- [ ] Pastikan seluruh aplikasi sudah responsif.
- [ ] (Opsional) Tambahkan unit/integration tests.

## Fase 7: Deployment
- [ ] Konfigurasi proyek di Vercel.
- [ ] Atur *environment variables* di Vercel.
- [ ] Lakukan deployment ke production.
- [ ] Lakukan pengujian akhir di lingkungan production. 