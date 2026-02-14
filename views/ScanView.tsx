
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RotateCcw, Loader2, CheckCircle2, AlertCircle, Zap, Target, Activity, Crosshair, Cpu, Sparkles, WifiOff, X, Trash2, Recycle, Leaf, ShieldAlert, Sun, Maximize, Move } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { soundService } from '../services/soundService';
import { ScanResult, BinCategory, UserStats } from '../types';

interface ScanViewProps {
  onScanSuccess?: (category: BinCategory, itemName: string, bonus: boolean) => void;
}

const ScanView: React.FC<ScanViewProps> = ({ onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [multiplierActive, setMultiplierActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          frameRate: { ideal: 60 }
        },
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
    
    soundService.playShutter();
    setIsProcessing(true);
    setError(null);
    setIsDuplicate(false);
    setMultiplierActive(false);
    setProgress(0);

    // Dynamic progress simulation
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return p;
        const inc = Math.random() * 15;
        return Math.min(p + inc, 98);
      });
    }, 100);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    const targetWidth = 512;
    const targetHeight = (video.videoHeight / video.videoWidth) * targetWidth;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, targetWidth, targetHeight);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.5);

    try {
      const user = await dbService.getCurrentSessionUser();
      if (!user) throw new Error("OPERATIVE NOT AUTHORIZED.");

      let classification: ScanResult;
      if (isOnline) {
        classification = await geminiService.classifyWaste(base64Image);
        const saveResult = await dbService.saveScan(user.uid, base64Image, classification);
        setXpEarned(saveResult.scan.xpAwarded);
        setIsDuplicate(saveResult.isDuplicate);
        setMultiplierActive(saveResult.multiplierActive);
      } else {
        classification = {
          detectedItem: "OBJECT_DRAFT",
          binCategory: BinCategory.WASTE,
          confidence: 0.5,
          explanation: "OFFLINE CAPTURE: ANALYSIS QUEUED.",
          disposalTips: ["STORE UNTIL NETWORK RESTORED"],
          funFact: "Saving waste logs offline builds your habit!"
        };
        const saveResult = await dbService.saveScan(user.uid, base64Image, classification, true);
        setXpEarned(saveResult.scan.xpAwarded);
        setIsDuplicate(saveResult.isDuplicate);
        setMultiplierActive(saveResult.multiplierActive);
      }
      
      setProgress(100);
      clearInterval(interval);
      soundService.playSuccess();
      
      setTimeout(() => {
        setResult(classification);
        if (onScanSuccess) onScanSuccess(classification.binCategory, classification.detectedItem, multiplierActive);
      }, 150);
      
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'ANALYSIS FAILURE');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryTheme = (cat: BinCategory) => {
    switch (cat) {
      case BinCategory.RECYCLE: return { color: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/10', glow: 'shadow-[0_0_40px_rgba(96,165,250,0.3)]', icon: Recycle, label: 'RECYCLE' };
      case BinCategory.COMPOST: return { color: 'text-emerald-400', border: 'border-emerald-400/50', bg: 'bg-emerald-400/10', glow: 'shadow-[0_0_40px_rgba(52,211,153,0.3)]', icon: Leaf, label: 'COMPOST' };
      case BinCategory.WASTE: return { color: 'text-neutral-400', border: 'border-neutral-400/50', bg: 'bg-neutral-400/10', glow: 'shadow-[0_0_40px_rgba(255,255,255,0.1)]', icon: Trash2, label: 'WASTE' };
    }
  };

  if (result) {
    const theme = getCategoryTheme(result.binCategory);
    return (
      <div className="min-h-screen bg-neutral-950 p-6 pb-32 animate-in fade-in zoom-in duration-100">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-2xl border transition-all ${isDuplicate ? 'bg-orange-500/10 border-orange-500/20' : isOnline ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
              {isDuplicate ? <ShieldAlert className="text-orange-400" size={24} /> : multiplierActive ? <Zap className="text-yellow-400" size={24} /> : isOnline ? <CheckCircle2 className="text-emerald-400" size={24} /> : <WifiOff className="text-orange-400" size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black font-gaming text-white uppercase tracking-tight">
                {isDuplicate ? "STALE DATA" : multiplierActive ? "PERK MULTIPLIER ACTIVE" : `SORTIFY ${isOnline ? "ANALYSIS" : "CACHED"}`}
              </h2>
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                {isDuplicate ? "OBJECT PREVIOUSLY LOGGED" : multiplierActive ? "SPECIALIZATION BONUS APPLIED" : "PLANETARY DATA LOGGED"}
              </span>
            </div>
          </div>

          <div className="glass rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl relative">
             <div className="relative aspect-[4/5] bg-neutral-900">
               <canvas ref={canvasRef} className="w-full h-full object-cover" />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 {isDuplicate ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <ShieldAlert size={64} className="text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,1)] mb-2" />
                        <span className="text-orange-500 font-black font-gaming text-xl uppercase tracking-widest bg-black/60 px-4 py-1 rounded-xl">0 XP</span>
                    </div>
                 ) : (
                    <div className="animate-bounce flex flex-col items-center">
                        <span className={`text-6xl font-black font-gaming drop-shadow-[0_0_20px_rgba(52,211,153,1)] ${multiplierActive ? 'text-yellow-400' : isOnline ? 'text-emerald-400' : 'text-orange-400'}`}>
                           +{xpEarned} XP
                        </span>
                    </div>
                 )}
               </div>
             </div>

             <div className="p-8">
                <div className="mb-8 text-center">
                  <h3 className="text-3xl font-black text-white font-gaming uppercase tracking-tighter mb-2">{result.detectedItem}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <Activity size={14} className={isOnline ? "text-emerald-500" : "text-orange-500"} />
                    <p className="text-[10px] font-black text-neutral-500 tracking-[0.3em] uppercase">
                      ANALYSIS_CONFIDENCE: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                </div>

                <div className={`p-8 rounded-[2.5rem] border-2 mb-8 text-center transition-all relative overflow-hidden group ${theme.bg} ${theme.border} ${theme.glow}`}>
                  <p className="text-[12px] font-black text-neutral-400 uppercase tracking-[0.5em] mb-6 relative z-10">PHYSICAL ACTION REQUIRED</p>
                  <div className="flex flex-col items-center justify-center gap-4 relative z-10">
                    <div className={`p-6 rounded-[2rem] bg-black/40 border-2 transition-transform duration-500 group-hover:scale-105 ${theme.border}`}>
                      <theme.icon size={64} className={theme.color} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">DEPOSIT ITEM TO:</p>
                        <h4 className={`text-6xl font-black uppercase tracking-tighter ${theme.color} drop-shadow-2xl`}>{theme.label}</h4>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
                  <p className="text-neutral-200 text-sm leading-relaxed font-medium italic">"{result.explanation}"</p>
                </div>

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
            onClick={() => {soundService.playClick(); setResult(null); startCamera();}}
            className={`w-full mt-8 font-black font-gaming py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 text-xs uppercase tracking-[0.4em] bg-emerald-500 hover:bg-emerald-400 text-black`}
          >
            <RotateCcw size={20} />
            RE-INITIATE SCANNER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden font-gaming">
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-70" />
      
      {/* HUD OVERLAYS */}
      <div className="absolute inset-16 border rounded-[3rem] border-white/5 transition-colors duration-500">
          <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[4px] border-l-[4px] border-emerald-500 rounded-tl-2xl"></div>
          <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[4px] border-r-[4px] border-emerald-500 rounded-tr-2xl"></div>
          <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[4px] border-l-[4px] border-emerald-500 rounded-bl-2xl"></div>
          <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[4px] border-r-[4px] border-emerald-500 rounded-br-2xl"></div>
          
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 rounded-[3rem]">
               <div className="text-6xl font-black text-white tabular-nums mb-4">{Math.round(progress)}%</div>
               <div className="text-[10px] font-black text-emerald-500 tracking-[0.5em] uppercase animate-pulse">ANALYZING_ITEM_DENSITY</div>
               <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-100" style={{ width: `${progress}%` }} />
               </div>
            </div>
          )}

          {!isProcessing && (
            <div className="absolute top-10 left-10 right-10 flex flex-col gap-4 pointer-events-none">
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10 animate-in slide-in-from-top-4 duration-500">
                <Sun size={14} className="text-yellow-400" />
                <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">ENHANCED_LIGHTING_ACTIVE</span>
              </div>
            </div>
          )}
      </div>

      {/* SCANNING INSTRUCTIONS */}
      {!isProcessing && !result && (
        <div className="absolute top-32 left-0 right-0 px-10 flex flex-col items-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] w-full max-w-xs space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] text-center mb-2">SCAN_PROTOCOL</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Maximize size={16} className="text-neutral-500" />
                <p className="text-[9px] font-black text-neutral-300 uppercase">CENTER OBJECT IN HUD</p>
              </div>
              <div className="flex items-center gap-3">
                <Sun size={16} className="text-neutral-500" />
                <p className="text-[9px] font-black text-neutral-300 uppercase">AVOID DARK SHADOWS</p>
              </div>
              <div className="flex items-center gap-3">
                <Move size={16} className="text-neutral-500" />
                <p className="text-[9px] font-black text-neutral-300 uppercase">KEEP DEVICE STEADY</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="absolute left-0 right-0 h-[8px] bg-emerald-400 shadow-[0_0_40px_rgba(52,211,153,1)] animate-[scan_0.4s_linear_infinite] z-20" />
      )}

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="flex-1" />
        <div className="bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center justify-center px-10 pb-36 pointer-events-auto">
          <button
            onClick={capturePhoto}
            disabled={isProcessing}
            className={`group relative w-24 h-24 rounded-full border-[6px] transition-all flex items-center justify-center ${
              isProcessing ? 'border-emerald-500 rotate-90 scale-90' : 'border-white/10 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="text-emerald-500 animate-spin" size={36} />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white group-hover:bg-opacity-80 transition-all shadow-2xl flex items-center justify-center">
                <Target className="text-black" size={28} />
              </div>
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ScanView;
