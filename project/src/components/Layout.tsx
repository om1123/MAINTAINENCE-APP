import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, 
  Wrench, 
  ClipboardList, 
  Bell, 
  FileSpreadsheet,
  Settings,
  Cog
} from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
    <Link
      to={to}
      className={`flex items-center px-6 py-3 text-gray-300 transition-all duration-200 group ${
        isActive(to)
          ? 'bg-gray-800/50 text-indigo-400 border-r-4 border-indigo-500'
          : 'hover:bg-gray-800/30 hover:text-indigo-300'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${
        isActive(to) ? 'text-indigo-400' : ''
      }`} />
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
        <div className="p-6 border-b border-gray-700/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            MaintenanceHub
          </h1>
        </div>
        <nav className="flex-1 py-6">
          <NavLink to="/" icon={Home}>Dashboard</NavLink>
          <NavLink to="/machines" icon={Settings}>Machines</NavLink>
          <NavLink to="/work-orders" icon={ClipboardList}>Work Orders</NavLink>
          <NavLink to="/create-work-order" icon={Wrench}>Create Work Order</NavLink>
          <NavLink to="/notifications" icon={Bell}>Notifications</NavLink>
          <NavLink to="/export" icon={FileSpreadsheet}>Export Data</NavLink>
          <NavLink to="/settings" icon={Cog}>Settings</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;