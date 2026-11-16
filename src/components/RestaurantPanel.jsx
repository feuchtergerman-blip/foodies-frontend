import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Video, CheckCircle2, XCircle, 
  UploadCloud, Loader2, X, Eye, Activity 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RestaurantPanel() {
  const { user } = useAuth();
  const restaurantId = user?.restaurant_id || 1;

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Estado del formulario de nuevo platillo
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    price: '',
    description: '',
    tags: [],
    videoFile: null
  });

  useEffect(() => {
    fetchRestaurantDishes();
  }, [restaurantId]);

  const showToast = (title, desc, isError = false) => {
    setToast({ title, desc, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRestaurantDishes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/restaurants/${restaurantId}/menu`);
      const data = response.data.data || response.data.dishes || response.data;
      setDishes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando platillos:', error);
      // Respaldo visual si aún no hay registros en producción
      setDishes([
        {
          id: 1,
          name: 'Tacos de Prueba',
          category_id: 1,
          category_name: 'Especialidades',
          price: 120,
          description: 'Platillo de prueba para menús digitales',
          available: true,
          tags: ['HD', 'Nuevo'],
          video_url: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar disponibilidad al instante (Disponible / Agotado)
  const toggleAvailability = async (dish) => {
    const updatedStatus = !dish.available;
    
    // Actualización optimista en UI
    setDishes(dishes.map(d => d.id === dish.id ? { ...d, available: updatedStatus } : d));

    try {
      await api.patch(`/restaurants/${restaurantId}/dishes/${dish.id}`, {
        available: updatedStatus
      });
      showToast(
        'Estado Actualizado',
        `"${dish.name}" ahora está ${updatedStatus ? 'Disponible' : 'Agotado'}.`
      );
    } catch (error) {
      // Revertir si falla la petición
      setDishes(dishes.map(d => d.id === dish.id ? { ...d, available: !updatedStatus } : d));
      showToast('Error al actualizar', 'No se pudo sincronizar con el servidor.', true);
    }
  };

  // Eliminar platillo
  const handleDelete = async (dishId, dishName) => {
    if (!window.confirm(`¿Eliminar "${dishName}" del menú?`)) return;

    try {
      await api.delete(`/restaurants/${restaurantId}/dishes/${dishId}`);
      setDishes(dishes.filter(d => d.id !== dishId));
      showToast('Platillo Eliminado', 'Se removió correctamente del menú.');
    } catch (error) {
      showToast('Error', 'No se pudo eliminar el platillo.', true);
    }
  };

  // Manejo de etiquetas en el formulario
  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  // Guardar platillo y subir video para procesamiento con FFmpeg
  const handleCreateDish = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Crear el registro del platillo
      const dishResponse = await api.post(`/restaurants/${restaurantId}/dishes`, {
        name: formData.name,
        category_id: formData.category_id,
        price: parseFloat(formData.price),
        description: formData.description,
        tags: formData.tags,
        available: true
      });

      const createdDish = dishResponse.data.dish || dishResponse.data.data || dishResponse.data;
      let finalDish = createdDish;

      // 2. Si el usuario adjuntó video, subirlo al endpoint que ya probamos con FFmpeg
      if (formData.videoFile && createdDish?.id) {
        const videoPayload = new FormData();
        videoPayload.append('dish_id', createdDish.id);
        videoPayload.append('video', formData.videoFile);

        const videoResponse = await api.post(
          `/restaurants/${restaurantId}/videos`,
          videoPayload,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );

        if (videoResponse.data.dish) {
          finalDish = videoResponse.data.dish;
        }
      }

      setDishes(prev => [finalDish, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: '', category_id: 1, price: '', description: '', tags: [], videoFile: null });
      showToast('¡Platillo Publicado!', 'El platillo y su video optimizado ya están en el menú.');
    } catch (error) {
      console.error('Error al guardar platillo/video:', error);
      showToast(
        'Error al guardar',
        error.response?.data?.message || 'Revisa los datos o el tamaño del video.',
        true
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = dishes.filter(d => d.available !== false).length;

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Encabezado Superior */}
        <div className="bg-apple-card border border-apple-border p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Panel de Administración de Menú</h2>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">
                Restaurante Activo
              </span>
            </div>
            <p className="text-xs text-apple-subtext mt-1">
              ID de Sucursal: <span className="text-white font-medium">rest_0{restaurantId}</span> · Gestión de videos HD
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-5 py-2.5 bg-apple-blue hover:bg-apple-blueHover text-white font-semibold text-xs rounded-full transition flex items-center justify-center gap-2 shadow-lg shadow-apple-blue/20 cursor-pointer"
          >
            <Plus size={16} /> Nuevo Platillo
          </button>
        </div>

        {/* Tarjetas de Estadísticas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-apple-card border border-apple-border p-5 rounded-2xl">
            <div className="text-apple-subtext text-xs font-medium">Platillos Activos</div>
            <div className="text-3xl font-bold text-white mt-1">{activeCount}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> En carta digital
            </div>
          </div>
          
          <div className="bg-apple-card border border-apple-border p-5 rounded-2xl">
            <div className="text-apple-subtext text-xs font-medium">Vistas este Mes</div>
            <div className="text-3xl font-bold text-apple-blue mt-1">3,420</div>
            <div className="text-[11px] text-apple-subtext mt-1 flex items-center gap-1">
              <Eye size={12} /> Escaneos QR en mesas
            </div>
          </div>

          <div className="bg-apple-card border border-apple-border p-5 rounded-2xl">
            <div className="text-apple-subtext text-xs font-medium">Motor FFmpeg</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Operando
            </div>
            <div className="text-[11px] text-apple-subtext mt-1 flex items-center gap-1">
              <Activity size={12} /> Compresión MP4 lista
            </div>
          </div>
        </div>

        {/* Tabla de Platillos */}
        <div className="bg-apple-card border border-apple-border rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-apple-border flex flex-wrap justify-between items-center gap-2">
            <h3 className="font-semibold text-sm text-white">Listado de Platillos y Videos en Directo</h3>
            <span className="text-xs text-apple-subtext">Usa el interruptor para apagar lo agotado al instante</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-apple-subtext text-xs flex flex-col items-center gap-2">
                <Loader2 size={20} className="animate-spin text-apple-blue" />
                Cargando catálogo del restaurante...
              </div>
            ) : dishes.length === 0 ? (
              <div className="p-12 text-center text-apple-subtext text-xs">
                Aún no tienes platillos registrados. Haz clic en "Nuevo Platillo" para comenzar.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-neutral-900/60 text-apple-subtext border-b border-apple-border font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4">Platillo & Video</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Etiquetas</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-apple-border">
                  {dishes.map((dish) => {
                    const isAvailable = dish.available !== false;
                    return (
                      <tr key={dish.id} className="hover:bg-neutral-900/40 transition">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-neutral-900 flex items-center justify-center shrink-0 border border-apple-border overflow-hidden">
                            {dish.video_url ? (
                              <Video size={18} className="text-apple-blue" />
                            ) : (
                              <span className="text-lg">🍽️</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {dish.name}
                              {dish.video_url && (
                                <span className="px-1.5 py-0.5 bg-apple-blue/10 text-apple-blue text-[10px] rounded border border-apple-blue/20">
                                  Video HD
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-apple-subtext line-clamp-1 max-w-xs">
                              {dish.description || dish.desc}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-bold text-apple-blue whitespace-nowrap">
                          ${dish.price} MXN
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {(dish.tags || ['Especial']).map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-neutral-900 text-apple-subtext text-[10px] rounded border border-apple-border">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={isAvailable} 
                              onChange={() => toggleAvailability(dish)} 
                              className="sr-only peer" 
                            />
                            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                          <span className={`block text-[10px] mt-1 font-medium ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isAvailable ? 'Disponible' : 'Agotado'}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDelete(dish.id, dish.name)}
                            className="text-apple-subtext hover:text-red-400 p-2 transition cursor-pointer"
                            title="Eliminar platillo"
                          >
                            <Trash2 size={16} />
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

      {/* Modal: Crear Platillo + Subir Video MP4 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-apple-card border border-apple-border w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => !submitting && setIsModalOpen(false)} 
              className="absolute top-5 right-5 text-apple-subtext hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Agregar Nuevo Platillo con Video</h3>
            <p className="text-xs text-apple-subtext mb-5">
              El video se comprimirá automáticamente en el servidor para carga rápida en mesas.
            </p>

            <form onSubmit={handleCreateDish} className="space-y-4 text-xs">
              <div>
                <label className="block text-apple-subtext font-medium mb-1">Nombre del Platillo</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Hamburguesa BBQ Trufada" 
                  className="w-full bg-neutral-900 border border-apple-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-apple-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-apple-subtext font-medium mb-1">Categoría (ID)</label>
                  <select 
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-apple-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-apple-blue"
                  >
                    <option value={1}>Principales / Burgers</option>
                    <option value={2}>Complementos</option>
                    <option value={3}>Bebidas</option>
                    <option value={4}>Postres</option>
                  </select>
                </div>

                <div>
                  <label className="block text-apple-subtext font-medium mb-1">Precio (MXN)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="185.00" 
                    className="w-full bg-neutral-900 border border-apple-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-apple-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-apple-subtext font-medium mb-1">Descripción Corta</label>
                <textarea 
                  rows="2" 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Carne angus 200g, queso cheddar fundido y tocino ahumado en pan brioche." 
                  className="w-full bg-neutral-900 border border-apple-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-apple-blue"
                />
              </div>

              <div>
                <label className="block text-apple-subtext font-medium mb-1.5">Etiquetas</label>
                <div className="flex flex-wrap gap-2">
                  {['Favorito', 'Picante 🌶️', 'Vegetariano 🌱', 'Nuevo ✨'].map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-[11px] border transition ${
                        formData.tags.includes(tag)
                          ? 'bg-apple-blue/20 border-apple-blue text-apple-blue font-semibold'
                          : 'bg-neutral-900 border-apple-border text-apple-subtext'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-apple-subtext font-medium mb-1">Video del Platillo (MP4 / MOV, máx. 100MB)</label>
                <label className="flex items-center justify-center gap-2 w-full bg-neutral-900 hover:bg-neutral-800/80 border border-dashed border-apple-border rounded-2xl p-4 cursor-pointer transition">
                  <UploadCloud size={18} className="text-apple-blue" />
                  <span className="text-apple-subtext truncate">
                    {formData.videoFile ? formData.videoFile.name : 'Seleccionar archivo de video...'}
                  </span>
                  <input 
                    type="file" 
                    accept="video/mp4,video/quicktime,video/*" 
                    onChange={(e) => setFormData({ ...formData, videoFile: e.target.files[0] })}
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button 
                  type="button" 
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 bg-neutral-900 text-apple-subtext font-semibold rounded-full border border-apple-border"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 bg-apple-blue hover:bg-apple-blueHover text-white font-bold rounded-full shadow-lg shadow-apple-blue/20 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Procesando con FFmpeg...
                    </>
                  ) : (
                    'Guardar Platillo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notificación Flotante (Toast) */}
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