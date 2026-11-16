import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Login({ onSwitchToCustomer }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const result = await login(email, password);
    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-apple-card border border-apple-border rounded-[32px] shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-apple-blue/20 border border-apple-blue/40 rounded-2xl mx-auto flex items-center justify-center text-apple-blue font-bold text-xl mb-3">
          <Lock size={22} />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Foodies <span className="text-apple-blue">360</span></h2>
        <p className="text-xs text-apple-subtext mt-1">Ingresa a tu panel de administración o red</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-apple-subtext font-medium mb-1.5">Correo Electrónico</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-3 text-apple-subtext" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@foodies360.com" 
              className="w-full bg-neutral-900 border border-apple-border rounded-xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-apple-blue transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-apple-subtext font-medium mb-1.5">Contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-3 text-apple-subtext" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-neutral-900 border border-apple-border rounded-xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-apple-blue transition"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-2 py-3 bg-apple-blue hover:bg-apple-blueHover text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-apple-blue/20 cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Iniciar Sesión <ArrowRight size={16} /></>}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-apple-border pt-4">
        <button 
          onClick={onSwitchToCustomer}
          className="text-apple-subtext hover:text-apple-blue text-xs transition font-medium"
        >
          ← Ver Menú Comensal (Vista QR Pública)
        </button>
      </div>
    </div>
  );
}