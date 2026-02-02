
import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../constants';

interface GamePageProps {
  currentSpin: number;
  setSpinCount: React.Dispatch<React.SetStateAction<number>>;
  onComplete: (finalCount: number) => void;
}

const GamePage: React.FC<GamePageProps> = ({ currentSpin, onComplete }) => {
  const [shakeCount, setShakeCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const maxShakes = 8;
  const lastShakeRef = useRef(0);
  
  // Coin particle system
  const [particles, setParticles] = useState<{id: number, x: number, y: number, angle: number}[]>([]);
  const particleIdRef = useRef(0);

  const spawnParticles = () => {
    const newParticles = [];
    for(let i=0; i<12; i++) {
        newParticles.push({
            id: particleIdRef.current++,
            x: 50 + (Math.random() * 40 - 20), // Centerish
            y: 40 + (Math.random() * 20 - 10),
            angle: Math.random() * 360
        });
    }
    setParticles(prev => [...prev, ...newParticles]);
    
    // Cleanup particles
    setTimeout(() => {
        setParticles(prev => prev.slice(newParticles.length));
    }, 1000);
  };

  const handleInteraction = () => {
    if (shakeCount >= maxShakes) return;

    setShakeCount(prev => prev + 1);
    
    setIsAnimating(true);
    spawnParticles();
    
    setTimeout(() => setIsAnimating(false), 200);
  };

  // Shake Detection for Mobile
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      if (shakeCount >= maxShakes) return;

      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const now = Date.now();
      if ((now - lastShakeRef.current) < 300) return; // Debounce

      const deltaX = current.x || 0;
      const deltaY = current.y || 0;
      const deltaZ = current.z || 0;
      
      const speed = Math.abs(deltaX + deltaY + deltaZ);

      if (speed > 25) { // Sensitivity threshold
        lastShakeRef.current = now;
        handleInteraction();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [shakeCount]);

  // Dynamic Styles based on progress
  const scale = 1 + (shakeCount * 0.15); // Grow by 15% each shake
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-8 md:pt-12 p-4 space-y-8 animate-slide-up relative overflow-hidden">
      
      {/* Particles Layer */}
      {particles.map(p => (
         <img 
            key={p.id}
            src={IMAGES.fallingCoin}
            alt=""
            className="absolute pointer-events-none w-10 h-10 animate-fall object-contain"
            style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                '--angle': `${p.angle}deg`
            } as any}
         />
      ))}

      {/* Progress Text - Increased Size & Margin */}
      <div className="z-20 text-center space-y-3 mt-12 md:mt-16">
         <h2 className="text-4xl md:text-6xl font-black text-yellow-400 drop-shadow-lg uppercase italic tracking-tighter">
            {shakeCount >= maxShakes ? "HUAT AH! 🧧" : "Tap for Ong!"}
         </h2>
         <p className="text-white font-bold text-xl md:text-2xl drop-shadow-md max-w-xl mx-auto leading-relaxed">
            {shakeCount >= maxShakes ? "Prosperity unlocked!" : "Tap 8 Times to open your Angpau."}
         </p>
      </div>

      {/* The Angpao Interaction Area */}
      <div 
        className="relative cursor-pointer transition-transform duration-200 select-none touch-manipulation mt-8 md:mt-12"
        style={{ transform: `scale(${scale})` }}
        onClick={handleInteraction}
      >
        {/* Glow behind */}
        <div className="absolute inset-0 bg-yellow-400/50 rounded-full blur-3xl animate-pulse"></div>

        {/* Angpao SVG/Div */}
        <div className={`w-48 h-64 md:w-64 md:h-80 bg-red-600 rounded-3xl border-4 border-yellow-400 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden ${isAnimating ? 'animate-shake' : 'float-animation'}`}>
            {/* Angpao Detail */}
            <div className="absolute top-0 w-full h-20 bg-red-700 rounded-b-[100%] shadow-md border-b-2 border-yellow-500/30"></div>
            <div className="z-10 bg-yellow-400 text-red-700 w-24 h-24 rounded-full flex items-center justify-center border-4 border-yellow-200 shadow-inner">
                <span className="text-5xl font-black">福</span>
            </div>
            
            {/* Click Hint */}
            {shakeCount < maxShakes && (
                <div className="absolute bottom-4 text-yellow-200/50 text-xs font-black tracking-widest uppercase animate-pulse">
                    Tap Me
                </div>
            )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-64 md:w-96 h-4 bg-black/30 rounded-full border border-yellow-500/30 overflow-hidden backdrop-blur-sm fixed bottom-12">
        <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 ease-out"
            style={{ width: `${(shakeCount / maxShakes) * 100}%` }}
        ></div>
      </div>

      {/* Completion Overlay - Claim Prize */}
      {shakeCount >= maxShakes && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
              <div className="bg-red-600 p-8 rounded-3xl border-[6px] border-yellow-400 shadow-[0_0_50px_rgba(255,215,0,0.6)] text-center animate-scale-bounce max-w-sm mx-4">
                   <h3 className="text-3xl font-black text-yellow-400 uppercase mb-4 italic">Angpau Ready!</h3>
                   <p className="text-white font-bold mb-8 text-lg">Your mysterious prize is waiting inside.</p>
                   <button 
                      onClick={() => onComplete(1)}
                      className="w-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-red-900 font-black text-2xl py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest border-b-4 border-yellow-700"
                   >
                      CLAIM NOW
                   </button>
              </div>
          </div>
      )}

      <style>{`
        @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
            animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes fall {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(var(--angle), 200px) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
            animation: fall 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GamePage;
