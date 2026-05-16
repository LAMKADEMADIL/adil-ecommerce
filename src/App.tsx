import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import StoreFront from './pages/StoreFront';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoreFront />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
