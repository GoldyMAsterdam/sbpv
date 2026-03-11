import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Pv from './pv';

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

function Home() {
  return (
    <div>
        <h1>HI</h1>
    </div>
  );
}
