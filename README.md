
# Article Web (next.js)

Ini adalah frontend aplikasi web yang dibangun menggunakan Next.js. Aplikasi ini berfungsi sebagai antarmuka (interface) untuk pengguna berinteraksi dengan data yang disediakan oleh API eksternal.

Aplikasi ini memiliki sistem autentikasi dan manajemen konten dengan dua peran utama: Admin dan User.


## Features

- Frontend Modern: Dibangun dengan Next.js untuk performa tinggi dan pengalaman pengguna yang responsif.
- Autentikasi Pengguna: Sistem pendaftaran (/register) dan login (/login) yang terhubung ke API.
- Manajemen Peran (Role): Hak akses halaman dan fungsionalitas dibedakan berdasarkan peran pengguna (Admin dan User).
- Styling Cepat & Konsisten: Desain antarmuka dibangun menggunakan Tailwind CSS untuk pengembangan UI yang cepat dan dapat dirawat.
- Routing Terproteksi: Halaman untuk Admin dan User hanya dapat diakses setelah login dan sesuai dengan perannya.


## Role

1. User
Pengguna dengan peran User memiliki hak akses terbatas, yaitu:
- Melihat semua artikel.
- Melihat detail dari satu artikel.
- Melihat profil pribadi mereka.
- Akses mereka hanya diizinkan pada halaman yang diawali dengan /user.
2. Admin
Pengguna dengan peran Admin memiliki hak akses tertinggi untuk mengelola konten:
- Semua hak akses yang dimiliki oleh User.
- Menambah, mengedit, dan menghapus artikel.
- Menambah, mengedit, dan menghapus kategori.
- Akses mereka hanya diizinkan pada halaman yang diawali dengan /admin.
## Struktur Halaman dan Rute (Page Routes)
Berikut adalah daftar rute halaman yang tersedia di aplikasi Next.js ini.

#Halaman Publik (Authentication)
| URL | Deskripsi |
| ----------- | :---------: |
| /login | Menampilkan halaman untuk masuk. | 
| /register| Menampilkan halaman untuk mendaftar.| 

#Halaman User (Login Terlebih Dahulu)
| URL | Deskripsi |
| ----------- | :---------: |
| /user/articles | Menampilkan halaman untuk masuk. | 
| /user/articles/{id}| 	Menampilkan detail satu artikel.| 
| /user/profile| Menampilkan halaman profil user.| 

#Halaman Admin (Login Terlebih Dahulu)
| URL | Deskripsi |
| ----------- | :---------: |
| /admin/articles | Menampilkan semua artikel (tampilan admin).| 
| /admin/articles/add | Menampilkan form untuk menambah artikel baru. | 
| /admin/articles/{id}| 	Menampilkan detail satu artikel.| 
| /admin/articles/edit/{id}| 	Menampilkan detail satu artikel.| 
| /admin/categories | Menampilkan semua kategori dan bisa menambah, mengubah dan menghapus kategori (tampilan admin). | 
| /admin/profile| Menampilkan halaman profil admin.| 

## Run Locally

Clone the project

```bash
  git clone https://github.com/KaisarF/Article-web-fe.git
```

Go to the project directory

```bash
  cd Article-web-fe
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```


## Tech Stack

**Client:** Nextjs, React Hooks, Axios, TailwindCSS


