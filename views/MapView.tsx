
import React, { useEffect, useState, useRef } from 'react';
import { Search, MapPin, Navigation as NavIcon, Recycle, Trash2, Leaf, Radar, Loader2, Target, X, ExternalLink } from 'lucide-react';
import { binService } from '../services/binService';
import { BinLocation, BinCategory } from '../types';
import L from 'leaflet';

const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [bins, setBins] = useState<BinLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BinCategory | 'all'>('all');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        fetchBins(coords);
      },
      () => {
        const fallback: [number, number] = [40.7128, -74.0060];
        setUserPos(fallback);
        fetchBins(fallback);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const fetchBins = async (coords: [number, number]) => {
    const data = await binService.getNearbyBins(coords[0], coords[1], 5000);
    setBins(data);
    setLoading(false);
    initMap(coords);
  };

  const initMap = (center: [number, number]) => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);

    const userIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(52,211,153,1)] animate-pulse"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    L.marker(center, { icon: userIcon }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
  };

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = bins.filter(hub => {
      const matchesCategory = selectedCategory === 'all' || hub.type === selectedCategory;
      const matchesSearch = hub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           hub.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    filtered.forEach(hub => {
      const color = hub.type === BinCategory.RECYCLE ? '#60a5fa' : hub.type === BinCategory.COMPOST ? '#34d399' : '#94a3b8';
      const hubIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-10 h-10 rounded-xl flex items-center justify-center bg-neutral-900 border-2 border-white/20 shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer" style="color: ${color}">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([hub.lat, hub.lng], { icon: hubIcon }).addTo(markersLayerRef.current!);
      
      const popupContent = document.createElement('div');
      popupContent.className = "p-4 font-gaming text-[12px] uppercase min-w-[180px]";
      popupContent.innerHTML = `
        <b class="text-emerald-400 block mb-1 text-sm font-black tracking-tight">${hub.name}</b>
        <span class="text-neutral-500 block mb-3 font-bold tracking-widest">UNIT: ${hub.type}</span>
        <button class="nav-btn w-full bg-emerald-500 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 text-[11px] tracking-[0.1em] shadow-[0_4px_15px_rgba(16,185,129,0.3)] active:translate-y-0.5 transition-all">
          ROUTE COMMAND <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </button>
      `;

      popupContent.querySelector('.nav-btn')?.addEventListener('click', () => {
        openInGoogleMaps(hub.lat, hub.lng);
      });

      marker.bindPopup(popupContent, { 
        closeButton: false, 
        className: 'tactical-popup',
        offset: [0, -10]
      });
    });

    if (filtered.length > 0 && searchQuery !== '') {
        const group = L.featureGroup(filtered.map(h => L.marker([h.lat, h.lng])));
        mapRef.current.fitBounds(group.getBounds().pad(0.3));
    }

  }, [bins, selectedCategory, searchQuery]);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-neutral-950 font-gaming relative overflow-hidden">
      {/* Header HUD - Scaled Up */}
      <div className="absolute top-0 left-0 right-0 p-6 pb-2 z-[1500] pointer-events-none space-y-4">
        <div className="flex justify-between items-start gap-6">
           <div className="flex-1 pointer-events-auto">
             <div className="flex items-center gap-3 mb-4">
                <Radar className="text-emerald-500 animate-[spin_10s_linear_infinite]" size={24} />
                <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] drop-shadow-xl">
                  SORTIFY <span className="text-emerald-500/40">RADAR</span>
                </h2>
             </div>

             {/* Functional Search Bar - Larger */}
             <div className="relative mb-4 group shadow-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH SECTOR..."
                  className="w-full bg-black/80 backdrop-blur-xl border-2 border-white/10 rounded-2xl py-4 pl-12 pr-10 text-xs font-bold text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 transition-all uppercase tracking-[0.2em]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <X size={18} className="text-neutral-500 hover:text-white" />
                  </button>
                )}
             </div>

             <div className="flex gap-2.5 overflow-x-auto no-scrollbar pointer-events-auto pb-2">
                {(['all', ...Object.values(BinCategory)] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 backdrop-blur-md shrink-0 ${
                      selectedCategory === cat 
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                      : 'bg-black/60 text-neutral-500 border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
           </div>
           
           <button 
             onClick={() => userPos && mapRef.current?.setView(userPos, 16)}
             className="bg-black/70 backdrop-blur-xl p-4 rounded-2xl border-2 border-white/10 pointer-events-auto active:scale-90 transition-all shrink-0 shadow-2xl"
           >
              <Target size={24} className="text-emerald-500" />
           </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} id="tactical-map" className="h-full w-full" />
        <div className="absolute inset-0 pointer-events-none leaflet-vignette opacity-70" />
        
        {loading && (
          <div className="absolute inset-0 z-[2500] bg-black flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-emerald-500 animate-spin" size={40} />
            <span className="text-[10px] font-black text-emerald-500 tracking-[0.8em] uppercase animate-pulse">GEO_LINKING...</span>
          </div>
        )}
      </div>

      {/* Floating Info Hub - Positioned higher to clear bottom nav */}
      <div className="absolute bottom-8 left-6 right-6 z-[1500] pointer-events-none">
        <div className="bg-neutral-900/95 backdrop-blur-2xl rounded-[2.5rem] p-6 border-2 border-white/10 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto transform translate-y-[-10px]">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border-2 border-emerald-500/20 shadow-inner">
               <MapPin size={28} />
            </div>
            <div className="max-w-[140px]">
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-1">PROXIMITY_HUB</p>
              <h4 className="font-black text-white uppercase text-sm tracking-tight truncate leading-tight">
                {bins[0]?.name || 'SCANNING...'}
              </h4>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter mt-1">
                RANGE: {bins[0]?.distance?.toFixed(2) || '0.00'} KM
              </p>
            </div>
          </div>
          <button 
            onClick={() => bins[0] && openInGoogleMaps(bins[0].lat, bins[0].lng)}
            className="bg-emerald-500 text-black px-7 py-5 rounded-[2rem] shadow-[0_10px_25px_rgba(16,185,129,0.4)] active:scale-95 transition-all flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em]"
          >
            <NavIcon size={18} className="fill-current" />
            DEPLOY
          </button>
        </div>
      </div>

      <style>{`
        .tactical-popup .leaflet-popup-content-wrapper {
          background: rgba(10, 10, 10, 0.98);
          color: white;
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 1.5rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 60px rgba(0,0,0,0.7);
        }
        .tactical-popup .leaflet-popup-tip {
          background: rgba(10, 10, 10, 0.98);
          border: 2px solid rgba(16, 185, 129, 0.3);
        }
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MapView;
