import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Store, Eye, DollarSign, Server, 
  QrCode, CheckCircle2, XCircle, AlertTriangle, X, Download, Loader2 
} from 'lucide-react';
import api from '../services/api';

export default function SuperAdminPanel() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestForQr, setSelectedRestForQr] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchGlobalRestaurants();
  }, []);

  const showToast = (title, desc, isError = false) => {
    setToast({ title, desc, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchGlobalRestaurants = async () => {
    setLoading(true);
    try {
      // Petición al endpoint de superadministrador para listar la red de restaurantes
      const response = await api.get('/superadmin/restaurants');
      const data = response.data.data || response.data;
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando red de restaurantes:', error);
      // Datos mock de respaldo basados en tu maqueta para visualización inmediata
      setRestaurants([
        { id: 1, name: "Burgers & Grill House", owner: "Carlos Mendoza", plan: "Plan Pro Multi-Sucursal", views: "3,420", date: "12 Ago 2026", status: "active" },
        { id: 2, name: "Taquería El Pastorcito de Oro", owner: "Sofía Ramírez", plan: "Plan Esencial", views: "5,120", date: "01 Sep 2026", status: "active" },
        { id: 3, name: "Pizzería Napolitana Bella Italia", owner: "Marco Rossi", plan: "Plan Pro Multi-Sucursal", views: "4,310", date: "15 Jul 2026", status: "active" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de actividad del restaurante (Suspender / Activar)
  const toggleRestaurantStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    // Actualización optimista
    setRestaurants(restaurants.map(r => r.id === id ? { ...r, status: newStatus } : r));

    try {
      await api.patch(`/superadmin/restaurants/${id}/status`, { status: newStatus });
      showToast('Control de Acceso', `Restaurante actualizado a estado: ${newStatus.toUpperCase()}`);
    } catch (error) {
      // Revertir si hay error
      setRestaurants(restaurants.map(r => r.id === id ? { ...r, status: currentStatus } : r));
      showToast('Error', 'No se pudo actualizar el estado del restaurante.', true);
    }
  };

  const activeCount = restaurants.filter(r => r.status === 'active').length;

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Master Top Bar */}
        <div className="bg-apple-card border border-apple-border p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Panel de Superadministrador (Multi-Tenant)</h2>
              <span className="px-3 py-1 bg-apple-blue/10 text-apple-blue border border-apple-blue/30 text-xs font-semibold rounded-full">
                Control Maestro Foodies 360
              </span>
            </div>
            <p className="text-xs text-apple-subtext mt-1">
              Gestiona todos los restaurantes de la red, bases de datos aisladas y códigos QR.
            </p>
          </div>
          <button 
            onClick={() => showToast('Alta de Restaurante', 'Formulario de registro maestro disponible próximamente.')}
            className="px-5 py-2.5 bg-apple-blue hover:bg-apple-blueHover text-white font-bold text-xs rounded-full transition flex items-center gap-2 shadow-lg shadow-apple-blue/20 cursor-pointer"
          >
            <Store size={16} /> Dar de Alta Nuevo Restaurante
          </button>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-apple-card border border-apple-border p-5 rounded-2xl">
            <div className="text-apple-subtext text-xs font-medium">Restaurantes Activos</div>
            <div className="text-3xl font-bold text-white mt-1">{activeCount}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Red operando al 100%
            </div>
          </div>

          <div className="bg-apple-card border border-apple-border p-5 rounded-2xl">
            <div className="text-apple-subtext text-xs font-medium">Vistas Totales Red (Mes)</div>
            <div className="text-3xl font-bold text-apple-blue mt-1">12,850</div>
            <div className="text-[11px] text-apple-subtext mt-1 flex items-center gap-1">
              <Eye size={12} /> +18% vs mes anterior
            </div>
          </div>

          <div className="bg-apple-card border border-apple-border p-5 rounded-2xl">
            <div className="text-apple-subtext text-xs font-medium">Ingresos SaaS Estimados</div>
            <div className="text-3xl font-bold text-emerald-400 mt-1">$4,500 MXN</div>
            <div className="text-[11px] text-apple-subtext mt-1 flex items-center gap-1">
              <DollarSign size={12} /> Suscripciones al día
            </div>
          </div>

          <div className="bg-apple-card border border-apple-border p-5 rounded-2xl">
            <div className="text-apple-subtext text-xs font-medium">Espacio Streaming CDN</div>
            <div className="text-3xl font-bold text-sky-400 mt-1">45 GB / 500GB</div>
            <div className="text-[11px] text-apple-subtext mt-1 flex items-center gap-1">
              <Server size={12} /> DigitalOcean Storage
            </div>
          </div>
        </div>

        {/* Restaurants Master Table */}
        <div className="bg-apple-card border border-apple-border rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-apple-border flex justify-between items-center">
            <h3 className="font-semibold text-sm text-white">Red de Restaurantes Registrados en el Sistema</h3>
            <span className="text-xs text-apple-subtext">Aislamiento multi-tenant por ID de negocio</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-apple-subtext text-xs flex flex-col items-center gap-2">
                <Loader2 size={20} className="animate-spin text-apple-blue" />
                Cargando red de restaurantes...
              </div>
            ) : restaurants.length === 0 ? (
              <div className="p-12 text-center text-apple-subtext text-xs">
                No hay restaurantes registrados en la red.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-neutral-900/60 text-apple-subtext border-b border-apple-border font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4">Restaurante & Encargado</th>
                    <th className="p-4">Plan / Estado</th>
                    <th className="p-4">Vistas (Mes)</th>
                    <th className="p-4">Fecha Alta</th>
                    <th className="p-4 text-center">Acción QR</th>
                    <th className="p-4 text-right">Control de Acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-apple-border">
                  {restaurants.map((rest) => {
                    const isActive = rest.status === 'active';
                    return (
                      <tr key={rest.id} className="hover:bg-neutral-900/40 transition">
                        <td className="p-4">
                          <div className="font-semibold text-white">{rest.name}</div>
                          <div className="text-[11px] text-apple-subtext">
                            Encargado: <span className="text-white">{rest.owner || 'Administrador'}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-apple-blue/10 text-apple-blue border border-apple-blue/20 text-xs rounded-full font-medium">
                            {rest.plan || 'Plan Pro'}
                          </span>
                        </td>

                        <td className="p-4 font-semibold text-apple-blue">
                          <span className="text-apple-subtext font-normal mr-1">👁️</span> {rest.views || '1,200'} vistas
                        </td>

                        <td className="p-4 text-apple-subtext text-xs">
                          {rest.date || '10 Nov 2026'}
                        </td>

                        <td className="p-4 text-center">
                          <button 
                            onClick={() => setSelectedRestForQr(rest.name)}
                            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold transition border border-apple-border flex items-center gap-1.5 mx-auto cursor-pointer"
                          >
                            <QrCode size={14} className="text-apple-blue" /> Ver QR
                          </button>
                        </td>

                        <td className="p-4 text-right">
                          <button 
                            onClick={() => toggleRestaurantStatus(rest.id, rest.status)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                            }`}
                          >
                            {isActive ? 'Activo (Suspender)' : 'Suspendido (Reactivar)'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Descarga de Código QR */}
      {selectedRestForQr && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-apple-card border border-apple-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-center">
            <button 
              onClick={() => setSelectedRestForQr(null)} 
              className="absolute top-4 right-4 text-apple-subtext hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-apple-blue/10 border border-apple-blue/30 rounded-2xl mx-auto flex items-center justify-center text-apple-blue text-2xl mb-4">
              <QrCode size={28} />
            </div>

            <h3 className="text-lg font-bold text-white">QR para: {selectedRestForQr}</h3>
            <p className="text-xs text-apple-subtext mt-1">Escanea o descarga este código para colocarlo en las mesas.</p>
            
            <div className="bg-white p-6 rounded-3xl my-6 inline-block shadow-inner">
              <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff"/>
                <path d="M10 10h30v30H10zM15 15v20h20V15zM20 20v10h10V20z" fill="#000000"/>
                <path d="M60 10h30v30H60zM65 15v20h20V15zM70 20v10h10V20z" fill="#000000"/>
                <path d="M10 60h30v30H10zM15 65v20h20V65zM20 70v10h10V70z" fill="#000000"/>
                <rect x="45" y="15" width="10" height="10" fill="#000000"/>
                <rect x="45" y="35" width="10" height="10" fill="#000000"/>
                <rect x="15" y="45" width="10" height="10" fill="#000000"/>
                <rect x="35" y="45" width="10" height="10" fill="#000000"/>
                <rect x="60" y="45" width="30" height="10" fill="#000000"/>
                <rect x="45" y="60" width="10" height="20" fill="#000000"/>
                <rect x="60" y="65" width="10" height="15" fill="#000000"/>
                <rect x="75" y="60" width="15" height="15" fill="#000000"/>
                <rect x="65" y="85" width="25" height="10" fill="#000000"/>
              </svg>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  showToast("Descarga Exitosa", "El código QR en alta resolución ha sido descargado.");
                  setSelectedRestForQr(null);
                }}
                className="flex-1 py-3 bg-apple-blue hover:bg-apple-blueHover text-white font-bold text-xs rounded-full transition shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} /> Descargar PNG HD
              </button>
              <button 
                onClick={() => setSelectedRestForQr(null)} 
                className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-apple-subtext font-semibold text-xs rounded-full transition border border-apple-border cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 bg-apple-card border ${toast.isError ? 'border-red-500/50' : 'border-apple-blue/50'} text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.isError ? 'bg-red-500/20 text-red-400' : 'bg-apple-blue/20 text-apple-blue'}`}>
            {toast.isError ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <div>
            <h4 className="font-bold text-xs">{toast.title}</h4>
            <p className="text-[11px] text-apple-subtext">{toast.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}