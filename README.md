# CampusMart 🏪

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey)](https://expressjs.com/)

CampusMart is a modern, full-stack e-commerce platform designed specifically for IIIT Hyderabad's campus community. It provides a secure and user-friendly marketplace where students can buy and sell items within the campus ecosystem.


## ✨ Features

- **🔐 Secure Authentication**: CAS-based login with reCAPTCHA protection
- **🛒 Smart Shopping Cart**: Efficient cart management system
- **📱 Responsive Design**: Works seamlessly on all devices
- **🔍 Advanced Search**: Filter items by category, price, and more
- **📸 Image Management**: Multiple image upload with cloud storage
- **💰 Price Negotiation**: Built-in bargaining system
- **📊 User Dashboard**: Track orders, sales, and reviews
- **🎓 IIITH Exclusive**: Restricted to IIIT Hyderabad community

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or later
- MongoDB
- npm or yarn
- Git

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/saksham-chitkara/Buy-Sell-IIITH.git
cd Buy-Sell-IIITH
```

2. Set up environment variables:

- In the backend directory, create a `.env` file using `.env.example` as a template.
- In the frontend directory, create a `.env` file using `.env.example` as a template.
- Fill in the required environment variables in both files.

3. Install dependencies and start the backend:
```bash
cd backend
npm install
npm run dev
```

4. Install dependencies and start the frontend:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application running.

## 🏗️ Tech Stack

### Frontend
- Next.js 14
- TypeScript
- TailwindCSS
- Shadcn UI

### Backend
- Node.js
- Express
- MongoDB
- Socket.io
- Cloudinary
- TypeScript
