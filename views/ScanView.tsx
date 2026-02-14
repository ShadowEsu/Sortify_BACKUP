
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RotateCcw, Loader2, CheckCircle2, AlertCircle, Zap, Target, Activity, Crosshair, Cpu, Sparkles, WifiOff, CloudSync, X, Trash2, Recycle, Leaf } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { ScanResult, BinCategory, UserStats, ScanRecord } from '../types';

interface ScanViewProps {
  onScanSuccess?: (category: BinCategory, itemName: string) => void;
}

const ScanView: React.FC<ScanViewProps> = ({ onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true);
        attemptSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const attemptSync = async () => {
    const user = await dbService.getCurrentSessionUser();
    if (!user) return;
    
    const pending = await dbService.getPendingScans(user.uid);
    if (pending.length === 0) return;

    setSyncing(true);
    for (const scan of pending) {
      try {
        const classification = await geminiService.classifyWaste(scan.imageUrl);
        await dbService.updateScanAfterSync(scan.id, classification, 10);
      } catch (err) {
        console.error("Sync failed for scan", scan.id, err);
      }
    }
    setSyncing(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setError('FIELD OPS OFFLINE: CHECK CAMERA PERMS.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    setScanProgress(0);

    const progressInterval = setInterval(() => {
      setScanProgress(prev => Math.min(prev + 15, 95));
    }, 100);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    const targetWidth = 640;
    const targetHeight = (video.videoHeight / video.videoWidth) * targetWidth;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, targetWidth, targetHeight);

    const base64Image = canvas.toDataURL('image/jpeg', 0.7);

    try {
      const user = await dbService.getCurrentSessionUser();
      if (!user) throw new Error("OPERATIVE NOT AUTHORIZED.");

      let classification: ScanResult;

      if (isOnline) {
        classification = await geminiService.classifyWaste(base64Image);
        const saveResult = await dbService.saveScan(user.uid, base64Image, classification);
        setXpEarned(saveResult.scan.xpAwarded);
      } else {
        classification = {
          detectedItem: "OBJECT_DRAFT",
          binCategory: BinCategory.WASTE,
          confidence: 0.5,
          explanation: "OFFLINE CAPTURE: HIGH-FIDELITY ANALYSIS QUEUED FOR SYNC.",
          disposalTips: ["STORE UNTIL NETWORK RESTORED", "VERIFY VIA SORTIFY CLOUD"],
          funFact: "Did you know? Even without internet, recording waste helps build your sorting habit!"
        };
        const saveResult = await dbService.saveScan(user.uid, base64Image, classification, true);
        setXpEarned(saveResult.scan.xpAwarded);
      }
      
      setScanProgress(100);
      clearInterval(progressInterval);
      
      setTimeout(() => {
        setResult(classification);
        if (onScanSuccess) {
          onScanSuccess(classification.binCategory, classification.detectedItem);
        }
      }, 300);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'ANALYSIS CRITICAL FAILURE');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryTheme = (cat: BinCategory) => {
    switch (cat) {
      case BinCategory.RECYCLE: return { color: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/10', icon: Recycle, label: 'RECYCLE' };
      case BinCategory.COMPOST: return { color: 'text-green-400', border: 'border-green-400/50', bg: 'bg-green-400/10', icon: Leaf, label: 'COMPOST' };
      case BinCategory.WASTE: return { color: 'text-neutral-400', border: 'border-neutral-400/50', bg: 'bg-neutral-400/10', icon: Trash2, label: 'WASTE' };
    }
  };

  if (result) {
    const theme = getCategoryTheme(result.binCategory);
    return (
      <div className="min-h-screen bg-neutral-950 p-6 pb-32 animate-in fade-in zoom-in duration-300">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-2xl border transition-all ${!isOnline ? 'bg-orange-500/10 border-orange-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
              {isOnline ? <CheckCircle2 className="text-emerald-400" size={24} /> : <WifiOff className="text-orange-400" size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black font-gaming text-white uppercase tracking-tight">
                SORTIFY <span className={isOnline ? "text-emerald-500" : "text-orange-500"}>{isOnline ? "ANALYSIS" : "CACHED"}</span>
              </h2>
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                {isOnline ? "PLANETARY DATA LOGGED" : "OFFLINE_RECORD_SAVED"}
              </span>
            </div>
          </div>

          <div className="glass rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl relative">
             <div className="absolute top-6 left-6 z-10 animate-in fade-in slide-in-from-left-4 duration-500 delay-300">
                <div className={`px-4 py-2 rounded-xl backdrop-blur-md border shadow-lg flex items-center gap-3 ${theme.bg} ${theme.border}`}>
                  <theme.icon size={16} className={theme.color} />
                  <div>
                    <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] leading-none mb-1">TARGET BIN</p>
                    <p className={`text-[11px] font-black uppercase tracking-widest leading-none ${theme.color}`}>{theme.label}</p>
                  </div>
                </div>
             </div>

             <div className="relative aspect-[4/5] bg-neutral-900">
               <canvas ref={canvasRef} className="w-full h-full object-cover" />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="animate-bounce flex flex-col items-center">
                   <span className={`text-6xl font-black font-gaming drop-shadow-[0_0_20px_rgba(52,211,153,1)] ${isOnline ? 'text-emerald-400' : 'text-orange-400'}`}>+{xpEarned} XP</span>
                 </div>
               </div>
             </div>

             <div className="p-8">
                <div className="mb-8 text-center">
                  <h3 className="text-3xl font-black text-white font-gaming uppercase tracking-tighter mb-2">{result.detectedItem}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <Activity size={14} className={isOnline ? "text-emerald-500" : "text-orange-500"} />
                    <p className="text-[10px] font-black text-neutral-500 tracking-[0.3em] uppercase">
                      SYSTEM_CONFIDENCE: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                </div>

                {/* Tactical Disposal unit with specific location instruction */}
                <div className={`p-6 rounded-3xl border mb-8 text-center transition-all ${theme.bg} ${theme.border} shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] mb-3">TACTICAL DISPOSAL TARGET</p>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-4">
                      <theme.icon size={32} className={theme.color} />
                      <h4 className={`text-4xl font-black uppercase tracking-tighter ${theme.color}`}>{theme.label}</h4>
                    </div>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-2 border-t border-white/5 pt-2 w-full text-center">
                      Locate nearest <span className={theme.color}>{theme.label}</span> unit via radar
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
                  <p className="text-neutral-200 text-sm leading-relaxed font-medium italic">"{result.explanation}"</p>
                </div>

                {result.funFact && (
                  <div className="bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20 mb-8 flex gap-4 items-start">
                    <Sparkles className="text-emerald-400 shrink-0 mt-1" size={20} />
                    <div>
                      <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">ECO_FACT</h5>
                      <p className="text-xs text-emerald-100/90 font-medium leading-relaxed italic">{result.funFact}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-black text-white text-[12px] font-gaming tracking-[0.2em] uppercase flex items-center gap-3 mb-4">
                    <Target size={20} className="text-emerald-500" /> DISPOSAL PROTOCOL
                  </h4>
                  {result.disposalTips.map((tip, i) => (
                    <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                      <Zap className="text-emerald-500 shrink-0" size={18} />
                      <p className="text-[11px] text-neutral-200 font-black uppercase tracking-widest">{tip}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <button
            onClick={() => {setResult(null); startCamera();}}
            className={`w-full mt-8 font-black font-gaming py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 text-xs uppercase tracking-[0.4em] ${
                isOnline ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30' : 'bg-orange-500 hover:bg-orange-400 text-black'
            }`}
          >
            <RotateCcw size={20} />
            RE-INITIATE SCAN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden font-gaming">
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-70" />

      {/* Futuristic HUD */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-lg ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,1)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]'}`} />
              <span className="text-[10px] text-white font-black tracking-[0.4em]">SORTIFY_SCAN_CORE</span>
           </div>
           <span className={`text-[7px] font-black tracking-[0.2em] ml-3.5 uppercase ${isOnline ? 'text-emerald-500/50' : 'text-orange-500/50'}`}>
               {isOnline ? 'GEO_SYNC ACTIVE' : 'LOCAL_CACHE_MODE'}
           </span>
        </div>
        
        <div className="absolute top-8 right-8 flex flex-col items-end gap-1">
           <div className="flex items-center gap-2">
             <span className="text-[9px] text-white/50 font-black tracking-[0.2em]">
                 {isOnline ? 'SENSORS_OK' : 'NETWORK_OFFLINE'}
             </span>
             {isOnline ? <Cpu size={14} className="text-emerald-500" /> : <WifiOff size={14} className="text-orange-500" />}
           </div>
        </div>
        
        <div className={`absolute inset-16 border rounded-[3rem] transition-colors duration-500 ${isOnline ? 'border-white/5' : 'border-orange-500/10'}`}>
          <div className={`absolute -top-1 -left-1 w-12 h-12 border-t-[4px] border-l-[4px] rounded-tl-2xl transition-colors ${isOnline ? 'border-emerald-500' : 'border-orange-500'}`}></div>
          <div className={`absolute -top-1 -right-1 w-12 h-12 border-t-[4px] border-r-[4px] rounded-tr-2xl transition-colors ${isOnline ? 'border-emerald-500' : 'border-orange-500'}`}></div>
          <div className={`absolute -bottom-1 -left-1 w-12 h-12 border-b-[4px] border-l-[4px] rounded-bl-2xl transition-colors ${isOnline ? 'border-emerald-500' : 'border-orange-500'}`}></div>
          <div className={`absolute -bottom-1 -right-1 w-12 h-12 border-b-[4px] border-r-[4px] rounded-br-2xl transition-colors ${isOnline ? 'border-emerald-500' : 'border-orange-500'}`}></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-20">
            <Crosshair size={32} className={isOnline ? "text-emerald-500" : "text-orange-500"} />
          </div>

          {isProcessing && (
            <div className={`absolute left-0 right-0 h-[3px] animate-[scan_1s_ease-in-out_infinite] ${isOnline ? 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)]' : 'bg-orange-400 shadow-[0_0_20px_rgba(249,115,22,1)]'}`} />
          )}
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="flex-1" />

        <div className="bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center justify-center px-10 pb-36 pointer-events-auto">
          {error && (
             <div className="mb-6 bg-red-500/20 text-red-400 py-2.5 px-5 rounded-xl flex items-center gap-3 text-[9px] font-black border border-red-500/30 uppercase tracking-[0.2em] animate-bounce">
               <AlertCircle size={14} />
               {error}
             </div>
          )}
          
          <div className="relative mb-8 text-center">
             <h1 className="text-white text-[9px] font-black tracking-[0.5em] uppercase opacity-90 mb-2">
               {isProcessing ? `ANALYZING_CORE_${scanProgress}%` : isOnline ? 'LOCK ON OBJECT' : 'OFFLINE_CAPTURE_MODE'}
             </h1>
             <div className={`h-[2px] w-20 mx-auto rounded-full relative overflow-hidden ${isOnline ? 'bg-emerald-500/30' : 'bg-orange-500/30'}`}>
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-orange-500'}`}
                  style={{ width: `${scanProgress}%` }}
                />
             </div>
          </div>

          <button
            onClick={capturePhoto}
            disabled={isProcessing}
            className={`group relative w-24 h-24 rounded-full border-[6px] transition-all flex items-center justify-center ${
              isProcessing 
                ? (isOnline ? 'border-emerald-500 rotate-90 scale-90' : 'border-orange-500 rotate-90 scale-90') 
                : 'border-white/10 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <Loader2 className={isOnline ? "text-emerald-500 animate-spin" : "text-orange-500 animate-spin"} size={36} />
            ) : (
              <div className={`w-16 h-16 rounded-full group-hover:bg-opacity-80 transition-all shadow-2xl flex items-center justify-center ${isOnline ? 'bg-white' : 'bg-orange-400'}`}>
                <Target className="text-black" size={28} />
              </div>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ScanView;
