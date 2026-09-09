import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#121316] text-[#e3e2e6] flex flex-col items-center justify-center p-0 md:p-4 transition-all duration-300">
      {/* Top Desktop Utility Bar */}
      <aside aria-label="Device Controls" className="hidden md:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-300">Suraj Yadav</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          id="btn-toggle-expand"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
          title={isExpanded ? 'Switch to Phone Frame' : 'Expand to Full View'}
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Compact Frame</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand Layout</span>
            </>
          )}
        </button>
      </aside>

      {/* Device Shell Container */}
      <div
        className={`w-full bg-[#1a1b1f] overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${
          isExpanded
            ? 'max-w-4xl h-[94vh] rounded-2xl border border-slate-700/60 shadow-indigo-950/40'
            : 'max-w-[430px] h-screen md:h-[900px] md:max-h-[94vh] md:rounded-[44px] md:border-[10px] md:border-[#2b2d33] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Android Status Bar */}
        <header className="shrink-0 h-10 px-6 pt-1 flex items-center justify-between bg-[#1a1b1f] select-none z-30">
          {/* Clock */}
          <span className="text-xs font-semibold tracking-tight text-slate-200">{currentTime}</span>

          {/* Camera Notch / Punch-hole (when not expanded) */}
          {!isExpanded && (
            <div className="w-4 h-4 rounded-full bg-[#0c0d0e] border border-slate-700/40 mx-auto shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>
          )}

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-slate-400">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-medium text-slate-300">98%</span>
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Android Gesture Navigation Pill */}
        <footer className="shrink-0 h-4 bg-[#1a1b1f] flex items-center justify-center select-none z-20">
          <div className="w-32 h-1 bg-slate-500/50 hover:bg-slate-400 rounded-full transition-colors" />
        </footer>
      </div>
    </div>
  );
};
