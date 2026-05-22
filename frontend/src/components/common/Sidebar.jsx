import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/transfers', label: 'Transfers', icon: '🔄' },
];

const Sidebar = () => (
  <aside className="w-56 bg-gray-900 border-r border-gray-700 min-h-screen flex flex-col pt-6 gap-1 px-3">
    {links.map(({ to, label, icon }) => (
      <NavLink
        key={to}
        to={to}
        end
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-emerald-700 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`
        }
      >
        <span>{icon}</span>
        {label}
      </NavLink>
    ))}
  </aside>
);

export default Sidebar;
