import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EntitySearch from './pages/EntitySearch';
import EntityDetails from './pages/EntityDetails';
import Timeline from './pages/Timeline';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<EntitySearch />} />
            <Route path="/entity/:id" element={<EntityDetails />} />
            <Route path="/timeline/:id" element={<Timeline />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
