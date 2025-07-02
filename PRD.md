# PRD (Product Requirements Document): Dashboard Pengelolaan Aset Digital

Dokumen ini menjelaskan persyaratan untuk pembuatan dashboard internal perusahaan yang bertujuan untuk mengelola aset digital seperti domain, hosting, dan VPS.

## 1. Latar Belakang & Tujuan

Saat ini, pengelolaan informasi mengenai domain, hosting, dan server VPS tersebar di berbagai platform dan dokumen, sehingga menyulitkan pelacakan, perpanjangan, dan audit.

**Tujuan Utama:** Membuat sebuah platform terpusat (dashboard) untuk mengelola, memantau, dan melaporkan semua aset digital perusahaan secara efisien. Dashboard ini akan menjadi "Single Source of Truth" untuk data domain, hosting, dan VPS.

## 2. Pengguna Target

*   **Administrator IT:** Bertanggung jawab penuh atas penambahan, pembaruan, dan penghapusan data.
*   **Manajemen/Tim Terkait:** Memiliki akses *read-only* untuk melihat laporan dan status aset.

## 3. Fitur Utama

### Fungsionalitas Umum
- **Autentikasi Pengguna:** Sistem login yang aman menggunakan email dan password.
- **Role-Based Access Control (RBAC):**
    - **Admin:** Dapat melakukan operasi CRUD (Create, Read, Update, Delete) pada semua data.
    - **Viewer:** Hanya dapat melihat (Read-only) data.
- **Dashboard Utama:** Halaman utama yang menampilkan ringkasan cepat:
    - Jumlah total domain, hosting, dan VPS.
    - Daftar domain & hosting yang akan kedaluwarsa dalam 30 hari.
    - Aktivitas terbaru.

### Manajemen Domain
- **CRUD Operasi:**
    - **Create:** Menambahkan domain baru beserta detailnya (nama domain, registrar, tanggal registrasi, tanggal kedaluwarsa, status).
    - **Read:** Menampilkan daftar semua domain dengan fitur pencarian dan filter.
    - **Update:** Mengedit informasi domain yang sudah ada.
    - **Delete:** Menghapus domain dari daftar.
- **Notifikasi:** Notifikasi email/dashboard untuk domain yang akan kedaluwarsa.

### Manajemen Hosting
- **CRUD Operasi:**
    - **Create:** Menambahkan akun hosting baru (provider, paket, domain utama, tanggal perpanjangan, biaya).
    - **Read:** Menampilkan daftar semua akun hosting dengan fitur pencarian.
    - **Update:** Mengedit informasi hosting.
    - **Delete:** Menghapus data hosting.
- **Relasi:** Menghubungkan akun hosting dengan domain yang relevan.

### Manajemen VPS (Virtual Private Server)
- **CRUD Operasi:**
    - **Create:** Menambahkan data VPS baru (provider, spesifikasi [CPU, RAM, Storage], alamat IP, lokasi, tanggal perpanjangan, biaya).
    - **Read:** Menampilkan daftar semua VPS dengan fitur pencarian.
    - **Update:** Mengedit informasi VPS.
    - **Delete:** Menghapus data VPS.

## 4. Spesifikasi Teknis

- **Framework Frontend:** Next.js 15
- **Styling:** Tailwind CSS 3
- **Database & Backend:** Supabase (PostgreSQL, Supabase Auth, Supabase Functions)
- **Deployment:** Vercel

## 5. Desain & UX (User Experience)

- **Antarmuka:** Bersih, modern, dan intuitif.
- **Responsif:** Tampilan yang optimal di perangkat desktop maupun mobile.
- **Konsistensi:** Menggunakan sistem desain atau library komponen (seperti shadcn/ui) untuk menjaga konsistensi visual di seluruh aplikasi.
- **Navigasi:** Mudah dan jelas, memungkinkan pengguna menemukan informasi dengan cepat. 