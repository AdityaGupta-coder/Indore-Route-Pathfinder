# 🚦 Indore Route Pathfinder

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

**A simple web application to plan routes between stations in Indore using Dijkstra's Algorithm**

[🚀 Live Demo](https://indore-route.vercel.app)

</div>

---

## ✨ What it does

- 📍 **Add Stations**: Create new stations/locations
- 🔗 **Connect Stations**: Link stations with distance and cost  
- 🧭 **Find Routes**: Calculate shortest path by distance OR cheapest path by cost
- 📊 **View All**: See all stations and connections in one place

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB
- **Algorithm**: Dijkstra's Shortest Path

---

## 🏃‍♂️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/harshitsingh4321/indore-route-planner.git
cd indore-route-planner

# Backend
cd backend && npm install

# Frontend  
cd ../frontend && npm install
```

### 2. Setup Environment
Create `.env` in backend folder:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 3. Run Application
```bash
# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)  
cd frontend && npm run dev
```

Open `http://localhost:3000` 🎉

---

## 🎯 How to Use

1. **Add Stations**: Enter station name and click "Add Station"
2. **Connect Stations**: Select two stations, enter distance (km) and cost (₹), click "Add Connection"  
3. **Find Route**: Choose start/end stations, select "Distance" or "Cost" optimization, click "Find Route"
4. **View Results**: See the optimal path with total distance and cost

---

## 📁 Project Structure

```
indore-route-planner/
├── frontend/          # React app
│   ├── src/
│   │   └── App.jsx    # Main component
│   └── package.json
├── backend/           # Express API
│   ├── models/        # MongoDB schemas  
│   ├── routes/        # API routes
│   ├── utils/         # Dijkstra algorithm
│   └── server.js      # Main server
└── README.md
```

---

## 🔌 API Endpoints

```bash
GET    /api/stations     # Get all stations
POST   /api/stations     # Add new station
GET    /api/connections  # Get all connections  
POST   /api/connections  # Add new connection
POST   /api/route        # Calculate optimal route
```

---

## 🧮 Algorithm

Uses **Dijkstra's Algorithm** to find:
- **Shortest Distance**: Minimum total kilometers
- **Cheapest Cost**: Minimum total rupees

---

## 🚀 Deployment

- **Frontend**: Deploy to Vercel : https://indore-metro.vercel.app
- **Backend**: Deploy to Render : https://indore-metro.onrender.com
- Set environment variables in deployment platforms

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push branch: `git push origin feature-name`
5. Open Pull Request.

---

## 📄 License

MIT License - feel free to use this project!
