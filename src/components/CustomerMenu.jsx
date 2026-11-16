import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Flame, Signal, Wifi, Battery } from 'lucide-react';
import api from '../services/api';

export default function CustomerMenu() {
  const [dishes, setDishes] = useState([]);
  const [currentFilter, setCategory] = useState('all');
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      // Petición al backend (ajustar la ruta según tu endpoint de platillos o menú público)
      const response = await api.get('/restaurants/1/menu'); 
      setDishes(response.data.data || response.data);
    } catch (error) {
      console.log('Usando datos locales de respaldo mientras se conecta el endpoint del menú');
      // Datos mock de respaldo basados en tu maqueta para pruebas inmediatas
      setDishes([
        {
          id: 1,
          name: "Hamburguesa Clásica Doble",
          price: 180,
          category: "burgers",
          available: true,
          desc: "Carne angus, doble queso cheddar y aderezo de la casa.",
          tags: ["Más Vendido", "HD"],
          videoUrl: "https://videos.pexels.com/video-files/8879534/8879534-uhd_1440_2732_25fps.mp4"
        },
        {
          id: 2,
          name: "Papas Rústicas con Cheddar y Tocino",
          price: 160,
          category: "sides",
          available: true,
          desc: "Papas gajo crujientes bañadas en queso cheddar fundido y tocino ahumado.",
          tags: ["Nuevo"],
          videoUrl: "https://media.istockphoto.com/id/1988144069/video/super-slow-motion-of-flying-tasty-french-fries.mp4?s=mp4-640x640-is&k=20&c=rJAKlIAs26_I1OZiTd93aivYUHe1_hv9pa58aL2schM="
        },
        {
          id: 3,
          name: "Malteada Artesanal de Oreo & Nutella",
          price: 140,
          category: "desserts",
          available: true,
          desc: "Helado artesanal de vainilla con galleta Oreo, Nutella derretida y crema batida.",
          tags: ["Especial"],
          videoUrl: "https://videos.pexels.com/video-files/32272236/13763809_2560_1440_30fps.mp4"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = currentFilter === 'all' 
    ? dishes 
    : dishes.filter(d => d.category === currentFilter);

  return (
    <div className="w-full h-full flex justify-center items-center p-0 md:p-6">
      {/* Contenedor tipo marco de dispositivo móvil (iPhone aesthetic) */}
      <div className="w-full h-full md:max-w-md md:h-[88vh] md:max-h-[850px] bg-apple-card md:border md:border-apple-border md:rounded-[48px] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Barra de Estado Simulada */}
        <div className="bg-black text-apple-subtext px-6 py-2.5 flex justify-between items-center text-xs shrink-0 md:rounded-t-[44px]">
          <span className="font-semibold text-white">9:41</span>
          <div className="w-24 h-4 bg-apple-card rounded-full mx-auto hidden md:block absolute left-1/2 -translate-x-1/2 top-1.5 border border-apple-border"></div>
          <div className="flex items-center space-x-2">
            <Signal size={14} />
            <Wifi size={14} />
            <Battery size={14} className="text-white" />
          </div>
        </div>

        {/* Encabezado del Restaurante */}
        <div className="bg-apple-card px-4 py-3.5 border-b border-apple-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-apple-blue/20 border border-apple-blue/40 flex items-center justify-center text-apple-blue font-bold text-lg">
              🍔
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Burgers & Grill House</h2>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Mesa 04 · Menú Digital HD
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-neutral-900 text-apple-subtext hover:text-white flex items-center justify-center text-xs border border-apple-border transition"
            title="Activar/Silenciar Audio"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-apple-blue" />}
          </button>
        </div>

        {/* Pestañas de Categorías */}
        <div className="bg-apple-card/90 backdrop-blur border-b border-apple-border px-4 py-2.5 flex space-x-2 overflow-x-auto hide-scrollbar shrink-0">
          {['all', 'burgers', 'sides', 'desserts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition border border-apple-border capitalize ${
                currentFilter === cat 
                  ? 'bg-apple-blue text-white font-semibold border-transparent shadow' 
                  : 'bg-neutral-900 text-apple-subtext hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat === 'burgers' ? 'Burgers' : cat === 'sides' ? 'Complementos' : 'Postres'}
            </button>
          ))}
        </div>

        {/* Feed de Videos en bucle estilo Reels */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {loading ? (
            <div className="text-center py-20 text-apple-subtext text-xs">Cargando menú en video...</div>
          ) : filteredDishes.length === 0 ? (
            <div className="text-center py-20 text-apple-subtext text-xs">No hay platillos en esta categoría.</div>
          ) : (
            filteredDishes.map((dish) => (
              <div key={dish.id} className="bg-black border border-apple-border rounded-3xl overflow-hidden relative shadow-lg group">
                <div className="w-full h-96 relative flex items-center justify-center overflow-hidden bg-black">
                  
                  {/* Video de fondo */}
                  <video
                    src={dish.video_url || dish.videoUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Degradado inferior para contraste */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                  {/* Aviso si está agotado */}
                  {dish.available === false && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-20">
                      <span className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 font-bold text-xs rounded-2xl uppercase tracking-wider">
                        Agotado Temporalmente
                      </span>
                    </div>
                  )}

                  {/* Etiquetas superiores */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    {dish.tags && dish.tags.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-black/30 backdrop-blur-sm border border-white/10 text-sky-300 text-[10px] font-semibold rounded-lg">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Información del Platillo */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-black/20 backdrop-blur-xs border-t border-white/10 z-10">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-sm text-white drop-shadow-md">{dish.name}</h3>
                      <span className="text-sky-300 font-extrabold text-sm shrink-0 drop-shadow-md">
                        ${dish.price} <span className="text-[10px] text-gray-200 font-normal">MXN</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-100 line-clamp-2 mb-2.5 drop-shadow-md">{dish.desc || dish.description}</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-[11px] text-gray-200 flex items-center gap-1 drop-shadow-md">
                        <Flame size={12} className="text-apple-blue" /> Preparación al momento
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie del marco */}
        <div className="bg-apple-card/95 backdrop-blur border-t border-apple-border p-3.5 text-center shrink-0">
          <span className="text-[11px] text-apple-subtext">Foodies 360 · Experiencia Gastronómica Interactiva</span>
        </div>

      </div>
    </div>
  );
}