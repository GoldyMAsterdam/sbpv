import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Pv from './pv';
import Home from './Home';

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pv" element={<Pv />} />
        </Routes>
      </div>
    </Router>
  );
}