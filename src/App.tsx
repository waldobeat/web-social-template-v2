import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Overlay from './pages/Overlay';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import HallOfFame from './pages/HallOfFame';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/hall-of-fame" element={<HallOfFame />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/overlay/:userId" element={<Overlay />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
