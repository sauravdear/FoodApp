import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { pathname } = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        pathname === to
          ? 'bg-emerald-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <span className="text-emerald-400 font-bold text-lg tracking-tight">
        FoodRedist
      </span>
      <div className="flex gap-2">
        {navLink('/', 'Dashboard')}
        {navLink('/transfers', 'Transfers')}
      </div>
    </nav>
  );
};

export default Navbar;
