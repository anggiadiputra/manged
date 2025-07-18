# Dashboard Redesign TODO

> Menyelaraskan desain dashboard Career-style ke dalam sistem Manajemen Aset Digital (Domain, Hosting, VPS, Website).

## 🌐 Layout & Struktur
- [x] Update `app/dashboard/layout.tsx` menjadi 3-column flex (Sidebar, Content, Right Panel)
- [x] Refactor `components/dashboard/sidebar.tsx` agar sesuai desain baru
- [x] Tambah komponen `RightSidebar` untuk panel Interview/Reminder & Calendar

## 📊 Data Summary Cards
- [x] Buat komponen `SummaryCard` (props: label, value, delta, color)
- [ ] Hook `useDashboardStats()` untuk:
  - [ ] Total Domain Aktif
  - [ ] Hosting Kedaluwarsa ≤30 Hari
  - [ ] VPS Aktif
- [x] Render 3 kartu di `app/dashboard/page.tsx`

## 📦 Applications → Domain Status Section
- [x] Komponen `DomainStatusBlock` (kategori & 3 status)
- [x] Query domain by status & kategori

## 🍩 Distribusi Aset (Donut)
- [ ] Install `react-chartjs-2` & `chart.js`
- [ ] Komponen `AssetDistributionChart` menampilkan slice Domain/Hosting/VPS/Website/Staff

## 📈 Penambahan Aset per Hari (Bar Chart)
- [ ] `AssetGrowthChart` (7 hari terakhir) dengan dataset Domain vs Website

## 🔔 Panel Pengingat Kedaluwarsa
- [ ] Buat tabel/daftar `ExpiryReminderList`
  - [ ] Query gabungan domain/hosting/vps kedaluwarsa terdekat
  - [ ] Tombol "Tambah Pengingat Manual" (placeholder)
- [ ] Mini Calendar (`react-day-picker`) highlight tanggal kedaluwarsa

## 📱 Responsiveness
- [ ] Sembunyikan panel kanan di <1024px & overlay sidebar di <640px

## 🧪 Testing & QA
- [ ] Manual test semua breakpoint
- [ ] Verifikasi query Supabase & RLS compliance

## 🚀 Deployment
- [ ] Tambah dependensi baru ke `package.json`
- [ ] Update README dengan instruksi setup chart & calendar 

CREATE OR REPLACE FUNCTION public.total_domains_active()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) FROM public.domains WHERE status='active';
$$;
GRANT EXECUTE ON FUNCTION public.total_domains_active() TO authenticated, anon; 