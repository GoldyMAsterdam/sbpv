import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <ul style={{ display: 'flex', gap: '20px', listStyle: 'none' }}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/pv">PV Page</Link>
        </li>
      </ul>
    </nav>
  );
}
