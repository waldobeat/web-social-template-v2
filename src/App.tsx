import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Overlay from './pages/Overlay';

import Marketplace from './pages/Marketplace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/overlay" element={<Overlay />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;