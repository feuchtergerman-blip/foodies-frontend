import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import CustomerMenu from './components/CustomerMenu';
import RestaurantPanel from './components/RestaurantPanel';
import SuperAdminPanel from './components/SuperAdminPanel';
import Login from './components/Login';
import { Store, LogOut, User as UserIcon } from 'lucide-react';

function MainRouter() {
  const { user, token, logout } = useAuth();
  const [currentMode, setCurrentMode] = useState('customer');

  if (token && user) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-black text-apple-text">
        <header className="apple-glass border-b border-apple-border px-6 py-3.5 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold tracking-tight text-white">
              Foodies <span className="text-apple-blue">360</span> Master Admin
            </span>
            <span className="px-2.5 py-0.5 bg-apple-blue/10 text-apple-blue border border-apple-blue/20 text-[11px] rounded-full font-medium capitalize">
              Rol: {user.role || 'admin'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-apple-subtext flex items-center gap-1.5">
              <UserIcon size={14} /> {user.name || user.email}
            </span>
            <button 
              onClick={logout}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-apple-border rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} /> Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative bg-black">
          {user.role === 'superadmin' || user.role === 'super_admin' ? (
            <SuperAdminPanel />
          ) : (
            <RestaurantPanel />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-black text-apple-text">
      <header className="apple-glass border-b border-apple-border px-6 py-3.5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold tracking-tight text-white">
            Foodies <span className="text-apple-blue">360</span>
          </span>
          <span className="text-xs text-apple-subtext">· Menú Digital Comensal</span>
        </div>

        <div>
          {currentMode === 'customer' ? (
            <button 
              onClick={() => setCurrentMode('login')}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-apple-border rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Store size={14} className="text-apple-blue" /> Acceso Socios / Admin
            </button>
          ) : (
            <button 
              onClick={() => setCurrentMode('customer')}
              className="px-4 py-2 bg-apple-blue hover:bg-apple-blueHover text-white rounded-full text-xs font-semibold transition cursor-pointer"
            >
              Ver Menú Comensal
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative bg-black flex justify-center items-center">
        {currentMode === 'customer' ? (
          <CustomerMenu />
        ) : (
          <Login onSwitchToCustomer={() => setCurrentMode('customer')} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}