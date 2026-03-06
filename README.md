# PawTel – Pet Hotel Management System (Client & Pet Module)

PawTel is a web application for managing a pet hotel. It provides a comprehensive interface for handling clients (owners) and their pets, including detailed profiles, medical records, vaccination tracking, and reporting. This repository contains the **Client & Pet Management module**, which serves as the core for the larger pet hotel system.

## ✨ Features

- **Owners Management** – Create, read, update, and delete owner records. Search by name/phone and sort by name or pet count.
- **Pets Management** – Full CRUD for pets with photo uploads, medical records, and special needs tracking. Filter by type, breed, gender, and age group.
- **Veterinary Passport** – Each pet can have a passport. Track vaccinations (vaccine, date, expiration) with visual indicators for expired/expiring shots.
- **Reports** – Generate reports on animals by type, owner summaries, and lists of pets with expiring or expired vaccinations. Export to CSV and PDF.
- **Dashboard** – At-a-glance statistics (total owners, pets, expiring vaccinations) and quick access to all modules.
- **Responsive UI** – Built with Material‑UI, works on desktop and mobile.
- **Authentication** – Simple login (admin/admin) to protect the system.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Material‑UI (MUI), React Router, Axios
- **Backend**: Node.js, Express, PostgreSQL (pg)
- **Other**: jsPDF (PDF export), date‑fns (date handling)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- PostgreSQL (v18 or compatible)
- npm or yarn
ttps://github.com/yourusername/pawtel.git
   cd pawtel
