import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  isCompact?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isCompact = false }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [coins, setCoins] = useState<{id: number, left: number, delay: number, duration: number, img: string}[]>([]);

  useEffect(() => {
    // Generate static coins for the background effect with random images
    const newCoins = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      img: Math.random() > 0.5 ? IMAGES.fallingCoin : IMAGES.fallingSycee
    }));
    setCoins(newCoins);
  }, []);

  useEffect(() => {
    // Attempt autoplay
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.log("Autoplay blocked, waiting for interaction", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full min-h-screen h-[100dvh] festive-bg text-white overflow-hidden select-none flex flex-col">
      {/* Background Audio */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://cdn.pixabay.com/audio/2026/01/14/audio_3265c1aace.mp3" 
      />

      {/* Global Falling Coins Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {coins.map((coin) => (
          <img
            key={coin.id}
            src={coin.img}
            alt=""
            className="absolute w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain opacity-80 animate-fall-continuous drop-shadow-md"
            style={{
              left: `${coin.left}%`,
              top: '-50px',
              animationDelay: `${coin.delay}s`,
              animationDuration: `${coin.duration}s`
            }}
          />
        ))}
      </div>

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden z-0">
        <i className="fa-solid fa-fireworks absolute top-10 left-[10%] text-6xl text-yellow-400 rotate-12"></i>
        <i className="fa-solid fa-fireworks absolute bottom-20 right-[15%] text-8xl text-orange-400 -rotate-12"></i>
        <div className="absolute top-1/4 right-[5%] w-32 h-32 border-4 border-yellow-500 rounded-full opacity-30 rotate-slow"></div>
        <div className="absolute bottom-1/4 left-[5%] w-20 h-20 border-2 border-orange-500 rounded-full opacity-30 rotate-slow"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header Section */}
        <header className={`shrink-0 flex items-center justify-between px-3 sm:px-6 md:px-8 transition-all duration-500 ${isCompact ? 'pt-1 pb-1 sm:pt-2 sm:pb-2' : 'pt-2 pb-2 sm:pt-4 sm:pb-4'}`}>
          <div className="opacity-90 hover:opacity-100 transition-opacity">
            {/* Logo Bigger */}
            <img 
              src={IMAGES.logo} 
              alt="Ajobthing Logo" 
              className="h-8 sm:h-12 md:h-16 lg:h-20 w-auto drop-shadow-md"
            />
          </div>
          
          {/* Music Toggle Button */}
          <button 
            onClick={toggleMusic}
            className="bg-red-900/50 hover:bg-red-900/80 p-2 sm:p-3 rounded-full border border-yellow-500/50 backdrop-blur-sm transition-all transform hover:scale-105"
          >
            {isPlaying ? (
              <i className="fa-solid fa-volume-high text-yellow-400 text-base sm:text-lg md:text-xl animate-pulse"></i>
            ) : (
              <i className="fa-solid fa-volume-xmark text-gray-300 text-base sm:text-lg md:text-xl"></i>
            )}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>

      {/* Floating Lanterns */}
      <div className="absolute top-8 right-24 md:right-32 float-animation pointer-events-none hidden lg:block z-20 opacity-80">
         <div className="w-12 h-16 bg-red-600 border-[2px] border-yellow-500 rounded-lg flex items-center justify-center text-yellow-400 text-3xl font-black shadow-2xl">
           发
         </div>
         <div className="h-4 w-1 bg-yellow-500 mx-auto mt-[-2px]"></div>
         <div className="h-2 w-8 bg-red-700 mx-auto mt-[-2px] rounded-full"></div>
      </div>

      <style>{`
        @keyframes fall-continuous {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall-continuous {
          animation-name: fall-continuous;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default Layout;
