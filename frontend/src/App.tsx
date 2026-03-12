import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoadingPage from './pages/LoadingPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;