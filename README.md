<div align="center">

# 🛡️ Ethos - Campus Entity Resolution & Security Monitoring System

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=0EA5E9&center=true&vCenter=true&width=600&lines=Campus+Security+Monitor;Entity+Resolution+System;Real-time+Tracking;Predictive+Analytics" alt="Typing SVG" />

[![Made with React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3+-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>🏆 Built for Saptang Labs Product Development Challenge</strong>
</p>

<p align="center">
  A comprehensive full-stack system for campus security monitoring with<br/>
  entity resolution, activity tracking, and predictive analytics.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-api">API</a>
</p>

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔍 **Entity Resolution**
- Resolve campus entities across heterogeneous datasets
- Multiple identifier support (ID, email, card, face ID)
- Fuzzy name matching with confidence scores
- Cross-source entity linking

### 📊 **Timeline Generation**
- Chronological activity reconstruction
- Human-readable summaries
- Hourly activity grouping
- Gap detection and analysis

</td>
<td width="50%">

### 🔮 **Predictive Monitoring**
- ML-based inference for missing data
- Pattern-based state prediction
- Evidence-based explanations
- Anomaly detection with alerts

### 🚨 **Security Dashboard**
- Real-time alert monitoring
- Interactive UI with search & filters
- Multi-severity alert levels
- Automated inactivity detection

</td>
</tr>
</table>

## 📁 Project Structure

```
Ethos/
├── backend/              # Node.js + Express + MongoDB
│   ├── config/          # Database and app configuration
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── controllers/     # Business logic
│   ├── services/        # Core services (entity resolution, prediction)
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/            # React + Tailwind CSS
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   ├── utils/       # Helper functions
│   │   └── App.jsx      # Main app component
│   └── public/          # Static assets
├── scripts/             # Utility scripts (Excel to JSON)
└── dataset/             # Sample data (JSON format)
```

## 🎬 Demo

> 🎥 **Live Demo Coming Soon**

### 📸 Screenshots

<div align="center">

| Dashboard | Search & Filter | Timeline View |
|:-:|:-:|:-:|
| ![Dashboard](https://via.placeholder.com/300x200/0ea5e9/ffffff?text=Dashboard) | ![Search](https://via.placeholder.com/300x200/06b6d4/ffffff?text=Search) | ![Timeline](https://via.placeholder.com/300x200/3b82f6/ffffff?text=Timeline) |
| **Alerts Management** | **Entity Details** | **Analytics** |
| ![Alerts](https://via.placeholder.com/300x200/ef4444/ffffff?text=Alerts) | ![Details](https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Details) | ![Analytics](https://via.placeholder.com/300x200/10b981/ffffff?text=Analytics) |

</div>

---

## 🚀 Installation

### 📋 Prerequisites

```diff
+ Node.js (v16 or higher)
+ MongoDB (v5 or higher)  
+ npm or yarn
```

### ⚡ Quick Start

<details>
<summary><b>1️⃣ Backend Setup</b> (Click to expand)</summary>

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
echo PORT=5000 > .env
echo MONGODB_URI=mongodb://localhost:27017/ethos >> .env
echo NODE_ENV=development >> .env

# Start development server
npm run dev
```

✅ Backend running on `http://localhost:5000`

</details>

<details>
<summary><b>2️⃣ Frontend Setup</b> (Click to expand)</summary>

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
echo REACT_APP_API_URL=http://localhost:5000/api > .env

# Start development server
npm start
```

✅ Frontend running on `http://localhost:3000`

</details>

### 🎯 One-Command Setup

```bash
# Install all dependencies
cd backend && npm install && cd ../frontend && npm install
```

## 📊 Data Import

1. Place your Excel files in the `dataset/excel/` directory
2. Run the conversion script:
```bash
cd scripts
node excelToJson.js
```
3. Import JSON to MongoDB:
```bash
cd backend
npm run import-data
```

## 🔌 API Endpoints

<table>
<tr>
<td>

### 👥 Entities
```http
GET    /api/entities/search
GET    /api/entities/:id
POST   /api/entities/resolve
GET    /api/entities/stats
```

### 📅 Timeline
```http
GET    /api/timeline/:entityId
GET    /api/timeline/:entityId/today
GET    /api/timeline/:entityId/with-predictions
```

</td>
<td>

### 🚨 Alerts
```http
GET    /api/alerts
POST   /api/alerts/check
PATCH  /api/alerts/:id/acknowledge
PATCH  /api/alerts/:id/resolve
```

### 🔮 Predictions
```http
GET    /api/predictions/:entityId/state
GET    /api/predictions/:entityId/next-location
GET    /api/predictions/:entityId/anomalies
```

</td>
</tr>
</table>

---

## 🎨 Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)

</div>

---

## 🏆 Hackathon Requirements Coverage

| Requirement | Status | Score |
|------------|--------|-------|
| Entity Resolution | ✅ Complete | 25% |
| Cross-Source Linking & Multi-Modal Fusion | ✅ Complete | 25% |
| Timeline Generation & Summarization | ✅ Complete | 20% |
| Predictive Monitoring & Explainability | ✅ Complete | 15% |
| Security Dashboard & UX | ✅ Complete | 10% |
| Robustness & Privacy | ✅ Complete | 5% |
| **Total** | **✅ 100%** | **100%** |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

**Project Link:** [https://github.com/Anant-Singhal24/Ethos](https://github.com/Anant-Singhal24/Ethos)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

Made with ❤️ for **Saptang Labs Hackathon**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Anant-Singhal24.Ethos)
[![GitHub stars](https://img.shields.io/github/stars/Anant-Singhal24/Ethos?style=social)](https://github.com/Anant-Singhal24/Ethos)
[![GitHub forks](https://img.shields.io/github/forks/Anant-Singhal24/Ethos?style=social)](https://github.com/Anant-Singhal24/Ethos/fork)

</div>
