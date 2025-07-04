# PRD (Product Requirements Document): Dashboard Pengelolaan Aset Digital

Dokumen ini menjelaskan persyaratan untuk pembuatan dashboard internal perusahaan yang bertujuan untuk mengelola aset digital seperti domain, hosting, dan VPS.

## 1. Latar Belakang & Tujuan

Saat ini, pengelolaan informasi mengenai domain, hosting, dan server VPS tersebar di berbagai platform dan dokumen, sehingga menyulitkan pelacakan, perpanjangan, dan audit.

**Tujuan Utama:** Membuat sebuah platform terpusat (dashboard) untuk mengelola, memantau, dan melaporkan semua aset digital perusahaan secara efisien. Dashboard ini akan menjadi "Single Source of Truth" untuk data domain, website, hosting, VPS dan Staff.

## 2. Pengguna Target

*   **Administrator IT:** Bertanggung jawab penuh atas penambahan, pembaruan, dan penghapusan data.
*   **Admin Website:** Penambahan, pembaruan, dan penghapusan data.
*   **Finance:** Bertanggung jawab untuk membayar biaya perpanjangan domain, hosting dan vps.

## 3. Fitur Utama

### Fungsionalitas Umum
- **Autentikasi Pengguna:** Sistem login yang aman menggunakan email dan password.
- **Role-Based Access Control (RBAC):**
    - **Super_Admin:** Dapat melakukan operasi CRUD (Create, Read, Update, Delete) pada semua data.
    - **Admin_Web:** Dapat melakukan operasi CRUD (Create, Read, Update, Delete) pada semua data kecuali Staff.
    - **Finance:** Hanya dapat update whois domain dan melihat (Read-only) data.
- **Dashboard Utama:** Halaman utama yang menampilkan ringkasan cepat:
    - Jumlah total domain, hosting, VPS dan Website.
    - Daftar domain & hosting yang akan kedaluwarsa dalam 30 hari.
    - Aktivitas terbaru.

### Manajemen Domain
- **CRUD Operasi:**
    - **Create:** Menambahkan domain baru beserta detailnya menggunakan API Whois https://get.indexof.id/api/whois?domain={domain}.
    - **Read:** Menampilkan daftar semua domain dengan fitur pencarian dan filter.
    - **Update:** Mengedit informasi domain yang sudah ada.
    - **Delete:** Menghapus domain dari daftar.
- **Notifikasi:** Notifikasi WhatsApp menggunakan API Fonnte untuk domain, hosting dan VPS yang akan kedaluwarsa.

### Manajemen Hosting
- **CRUD Operasi:**
    - **Create:** Menambahkan akun hosting baru (provider, paket, domain utama, tanggal perpanjangan, biaya).
    - **Read:** Menampilkan daftar semua akun hosting dengan fitur pencarian.
    - **Update:** Mengedit informasi hosting.
    - **Delete:** Menghapus data hosting.
- **Relasi:** Menghubungkan akun hosting dengan domain yang relevan.

### Manajemen VPS (Virtual Private Server)
- **CRUD Operasi:**
    - **Create:** Menambahkan data VPS baru (provider, alamat IP, lokasi, Root User, Password, tanggal perpanjangan, biaya).
    - **Read:** Menampilkan daftar semua VPS dengan fitur pencarian.
    - **Update:** Mengedit informasi VPS.
    - **Delete:** Menghapus data VPS.

### Manajemen Website
- **CRUD Operasi:**
    - **Create:** Menambahkan data Website baru domain, CMS, alamat IP, Hosting/VPS, Username, Password, tanggal perpanjangan, biaya.
    - **Read:** Menampilkan daftar semua Website dengan fitur pencarian.
    - **Update:** Mengedit informasi Website.
    - **Delete:** Menghapus data Website.

### Manajemen Staff
- **CRUD Operasi:**
    - **Create:** Menambahkan staff baru dengan role supper admin, web admin adan finance.
    - **Read:** Menampilakn seluruh staff.
    - **Update:** Mengedit informasi staff.
    - **Delete:** Menghapus data staff.

## 4. Spesifikasi Teknis

- **Framework Frontend:** React
- **Styling:** Tailwind CSS 3
- **Database & Backend:** Supabase (PostgreSQL, Supabase Auth, Supabase Functions)
- **Deployment:** Vercel

## 5. Desain & UX (User Experience)

- **Antarmuka:** Bersih, modern, dan intuitif.
- **Responsif:** Tampilan yang optimal di perangkat desktop maupun mobile.
- **Konsistensi:** Menggunakan sistem desain atau library komponen shadcn/ui untuk menjaga konsistensi visual di seluruh aplikasi.
- **Navigasi:** Mudah dan jelas, memungkinkan pengguna menemukan informasi dengan cepat. 