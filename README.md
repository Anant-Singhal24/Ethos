# Ethos - Campus Entity Resolution & Security Monitoring System

A comprehensive system for campus security monitoring with entity resolution, activity tracking, and predictive analytics.

## 🚀 Features

- **Entity Resolution**: Resolve campus entities across heterogeneous datasets
- **Cross-Source Linking**: Link matching records across structured data, text, and images
- **Timeline Generation**: Chronological activity reconstruction
- **Predictive Monitoring**: ML-based inference for missing data with explainability
- **Security Dashboard**: Interactive UI with alerts and real-time monitoring
- **Multi-Modal Fusion**: Unified view with provenance and confidence scores

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

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ethos
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm start
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

## 🎯 API Endpoints

- `GET /api/entities/search` - Search entities
- `GET /api/entities/:id` - Get entity details
- `GET /api/timeline/:entityId` - Get activity timeline
- `GET /api/predictions/:entityId` - Get predictions
- `GET /api/alerts` - Get active alerts
- `POST /api/entities/resolve` - Resolve entity across sources

## 🎨 Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Axios
- React Router
- Chart.js

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose

## 📝 License

MIT
