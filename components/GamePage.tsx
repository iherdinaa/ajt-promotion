
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IMAGES } from '../constants';

// --- Asset URLs ---
const ASSETS = {
  fish1: 'https://files.ajt.my/images/marketing-campaign/image-3a6c96ae-3355-4c3d-8d9c-b4889b2c2b09.png',
  fish2: 'https://files.ajt.my/images/marketing-campaign/image-ca2ca365-3138-4b80-90bc-dd8bfa7fb543.png',
  squid: 'https://files.ajt.my/images/marketing-campaign/image-f3687eaa-ed09-459a-be51-086ead91fd1c.png',
  cloud: 'https://files.ajt.my/images/marketing-campaign/image-692cd893-bf9d-4753-9dd6-25f6954ec137.png',
  firework: 'https://cliply.co/wp-content/uploads/2021/09/CLIPLY_372109170_FREE_FIREWORKS_400.gif',
  bush: 'https://files.ajt.my/images/marketing-campaign/image-52b8bfce-3e39-4497-a862-b3fa89786c8b.png',
  wind: 'https://i.pinimg.com/originals/9f/2d/fd/9f2dfd681c266e8d35220faff31a99f4.gif',
  tangerine: 'https://files.ajt.my/images/marketing-campaign/image-bfc3671e-f065-4f7d-b1af-f899e3d1d241.png',
};

interface GamePageProps {
  currentSpin: number;
  setSpinCount: React.Dispatch<React.SetStateAction<number>>;
  onComplete: (finalCount: number) => void;
}

const GamePage: React.FC<GamePageProps> = ({ currentSpin, onComplete }) => {
  // --- Game Config ---
  const METER_SCALE = 20; // 20px = 1 meter
  const RIVER_START_M = 288; // Target is now 288m (The River)
  const RIVER_WIDTH_M = 300; // Wide river
  const RIVER_END_M = RIVER_START_M + RIVER_WIDTH_M; 
  const MAX_THROWS = 8;
  
  // Physics Constants - EVEN SLOWER & FLOATIER
  const GRAVITY = 0.25; 
  const BOUNCE_DAMPING = 0.5;
  const FRICTION = 0.98;
  const FORCE_MULTIPLIER = 0.25; // Reduced force for slower fly
  const MAX_DRAG_PX = 300; 
  const GROUND_Y = 0; 

  // --- State ---
  const [gameState, setGameState] = useState<'IDLE' | 'DRAGGING' | 'FLYING' | 'LANDED' | 'IN_RIVER' | 'WON'>('IDLE');
  const [showTutorial, setShowTutorial] = useState(true);
  const [throwCount, setThrowCount] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [bestDistance, setBestDistance] = useState(0);
  const [message, setMessage] = useState("Drag & Release to Fly!");

  // --- Refs (Mutable Physics State) ---
  const requestRef = useRef<number>();
  const worldRef = useRef<HTMLDivElement>(null);
  const tangerineRef = useRef<HTMLDivElement>(null);
  const trajectoryRef = useRef<HTMLDivElement>(null);
  
  // Audio Refs
  const audioWin = useRef<HTMLAudioElement | null>(null);
  const audioSplash = useRef<HTMLAudioElement | null>(null);
  const audioShoot = useRef<HTMLAudioElement | null>(null);

  // Physics State Objects
  const gameStateRef = useRef(gameState); // Ref to track state in animation loop
  const pos = useRef({ x: 0, y: 0, r: 0 }); // y is UP
  const vel = useRef({ x: 0, y: 0, r: 0 });
  const cam = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const dragCurrent = useRef({ x: 0, y: 0 });

  // --- Ornament Generation ---
  
  // CLOUDS: Added Clouds above River
  const clouds = useMemo(() => {
    // 1. Initial Background clouds
    const bgClouds = Array.from({ length: 20 }).map((_, i) => ({
        id: `bg-cloud-${i}`,
        left: -1000 + (i * 250) + Math.random() * 400,
        top: 200 + Math.random() * 350, 
        scale: 0.8 + Math.random() * 0.8,
        opacity: 0.4 + Math.random() * 0.4 
    }));

    // 2. River Clouds (Positioned specifically over the river area)
    const riverStartPx = RIVER_START_M * METER_SCALE;
    const riverWidthPx = RIVER_WIDTH_M * METER_SCALE;
    
    const riverClouds = Array.from({ length: 15 }).map((_, i) => ({
        id: `river-cloud-${i}`,
        // Distribute across the river width
        left: riverStartPx + (i * (riverWidthPx / 15)) + Math.random() * 200, 
        top: 50 + Math.random() * 300, // Higher up in sky
        scale: 1.5 + Math.random() * 1.0, // Bigger clouds
        opacity: 0.6 + Math.random() * 0.3 
    }));

    return [...bgClouds, ...riverClouds];
  }, [RIVER_START_M, RIVER_WIDTH_M, METER_SCALE]);

  // FIREWORKS: Made Bigger
  const fireworks = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: -400 + (i * 350) + Math.random() * 300,
    top: 50 + Math.random() * 400,
    scale: 2.5 + Math.random() * 1.5, // INCREASED SCALE (was 1.0)
    delay: Math.random() * 4
  })), []);

  // WIND: Small floating particles
  const windParticles = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: `wind-${i}`,
    left: -1000 + i * 350 + Math.random() * 200, 
    top: 100 + Math.random() * 500,
    scale: 0.8 + Math.random() * 0.4, 
    opacity: 0.5 + Math.random() * 0.3
  })), []);

  // FISHES: More (25) and Smaller
  const riverFishes = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    type: i % 3, // 0: fish1, 1: fish2, 2: squid
    left: 50 + Math.random() * (RIVER_WIDTH_M * METER_SCALE - 200),
    top: 20 + Math.random() * 150,
    scale: 0.8 + Math.random() * 0.8,
    animDuration: 2 + Math.random() * 3,
    delay: Math.random() * 2
  })), [RIVER_WIDTH_M, METER_SCALE]);

  // BUSHES: Updated Asset, Bigger, Transparent
  const bushes = useMemo(() => {
    const launchPadBushes = Array.from({ length: 25 }).map((_, i) => ({
        id: `lp-${i}`,
        left: -900 + i * 80 + Math.random() * 60, 
        scale: 0.6 + Math.random() * 0.5
    }));
    const farBankBushes = Array.from({ length: 25 }).map((_, i) => ({
        id: `fb-${i}`,
        left: 50 + i * 150 + Math.random() * 150,
        scale: 0.6 + Math.random() * 0.5
    }));
    return { launchPadBushes, farBankBushes };
  }, []);

  // TREES: Smaller, Spaced out, No overlap
  const trees = useMemo(() => {
    // Launchpad Trees: ~30 trees spread over ~4800px space
    const launchPadTrees = Array.from({ length: 30 }).map((_, i) => ({
        id: `lp-tree-${i}`,
        // Distribute them evenly with some randomness, ensuring distance
        left: -1000 + i * 160 + Math.random() * 40, 
        // Scale reduced to prevent visual overlap (approx 80px - 120px width)
        scale: 0.3 + Math.random() * 0.2, 
        opacity: 0.7 + Math.random() * 0.3,
        zIndex: Math.random() > 0.5 ? 20 : 5
    }));

    const farBankTrees = Array.from({ length: 20 }).map((_, i) => ({
        id: `fb-tree-${i}`,
        left: 100 + i * 200 + Math.random() * 150,
        scale: 0.4 + Math.random() * 0.3, // Smaller
        opacity: 0.4 + Math.random() * 0.3,
        zIndex: 0
    }));
    
    // River edge trees: positioned just before the river starts
    const riverEdgeTrees = Array.from({ length: 8 }).map((_, i) => ({
        id: `river-tree-${i}`,
        left: (RIVER_START_M - 30) * METER_SCALE + i * 80 + Math.random() * 30,
        scale: 0.35 + Math.random() * 0.25,
        opacity: 0.6 + Math.random() * 0.3,
        zIndex: 15
    }));
    
    return { launchPadTrees, farBankTrees, riverEdgeTrees };
  }, []);


  // Sync state to ref
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Initialize Audio
  useEffect(() => {
    // Replaced with stable mixkit preview URLs to avoid 403/404 errors
    audioWin.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'); 
    audioSplash.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-water-splash-1311.mp3'); 
    audioShoot.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fast-rocket-whoosh-1714.mp3'); 
  }, []);

  // Cleanup Loop
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- Main Physics Loop ---
  const animate = () => {
    const currentState = gameStateRef.current;

    if (currentState === 'FLYING') {
      // 1. Apply Forces
      vel.current.y -= GRAVITY;
      
      // 2. Update Position
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;
      pos.current.r += vel.current.r;

      // 3. Collision Detection
      
      // Check if hit the "Ground" level
      if (pos.current.y <= GROUND_Y) {
        // Convert Position to Meters
        const currentMeters = pos.current.x / METER_SCALE;

        // Check River Collision (X-axis)
        // New Logic: River is the Target (Start at 288m)
        if (currentMeters >= RIVER_START_M) {
          // HIT WATER -> TRANSITION TO SINKING
          if (gameStateRef.current !== 'IN_RIVER') {
             if(audioSplash.current) audioSplash.current.play().catch(e => console.log('Audio play failed', e));
             setGameState('IN_RIVER'); 
             gameStateRef.current = 'IN_RIVER';
             
             // Initial splash physics
             vel.current.x *= 0.5; // Massive slowdown
             vel.current.y = -2;   // Start sinking immediately
          }
        } else {
          // LANDED ON GROUND (SHORT)
          pos.current.y = GROUND_Y;
          vel.current.y = -vel.current.y * BOUNCE_DAMPING;
          vel.current.x *= FRICTION;
          vel.current.r *= FRICTION;

          // Stop if slow
          if (Math.abs(vel.current.y) < 2 && Math.abs(vel.current.x) < 0.5) {
            handleLandShort();
          }
        }
      }
    } else if (currentState === 'IN_RIVER') {
       // SINKING LOGIC
       vel.current.y = -1.5; // Constant sink speed
       vel.current.x *= 0.9; // Water resistance
       
       pos.current.x += vel.current.x;
       pos.current.y += vel.current.y;
       pos.current.r += vel.current.x; // Spin slowly with flow
       
       // Sunk deep enough? Trigger Win
       if (pos.current.y < -100) {
          handleWinInRiver();
       }
    }

    // 4. Camera Follow
    // Target: Center on Tangerine, but keep left bound 0
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const targetCamX = pos.current.x - viewW * 0.25;
    const targetCamY = pos.current.y - viewH * 0.4;
    
    // Smooth Lerp
    cam.current.x += (targetCamX - cam.current.x) * 0.1;
    cam.current.y += (targetCamY - cam.current.y) * 0.1;

    // Clamps
    if (cam.current.x < -50) cam.current.x = -50;
    if (cam.current.y < -100) cam.current.y = -100; // Allow looking down into river

    // 5. Render
    updateDOM();

    // Continue loop
    requestRef.current = requestAnimationFrame(animate);
  };

  const updateDOM = () => {
    if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(${-cam.current.x}px, ${cam.current.y}px, 0)`;
    }
    // FIX: Only update tangerine from physics loop if NOT dragging.
    // While dragging, the handleMove function updates the transform directly for 0 lag.
    if (tangerineRef.current && gameStateRef.current !== 'DRAGGING') {
        // Physics Y is Up (+), CSS Translate Y is Down (-)
        tangerineRef.current.style.transform = `translate3d(${pos.current.x}px, ${-pos.current.y}px, 0) rotate(${pos.current.r}deg)`;
    }
  };

  // --- Game Logic Handlers ---

  const handleWinInRiver = () => {
    if (gameStateRef.current === 'WON') return; 
    
    const finalDist = Math.floor(pos.current.x / METER_SCALE);
    setCurrentDistance(finalDist);
    if (finalDist > bestDistance) setBestDistance(finalDist);

    setGameState('WON');
    gameStateRef.current = 'WON';
    setMessage("HUAT AH! The Prosperity River!");
    if(audioWin.current) audioWin.current.play().catch(e => console.log('Audio play failed', e));
  };

  const handleLandShort = () => {
    if (gameStateRef.current === 'LANDED') return;
    
    const finalDist = Math.floor(pos.current.x / METER_SCALE);
    setCurrentDistance(finalDist);
    
    setGameState('LANDED');
    gameStateRef.current = 'LANDED';
    setMessage("Too short! Try Again!");
    
    // Shorter timeout for quick retry
    setTimeout(() => {
        resetRound();
    }, 1200);
  };

  const resetRound = () => {
    setGameState('IDLE');
    // Reset positions
    pos.current = { x: 0, y: 0, r: 0 };
    vel.current = { x: 0, y: 0, r: 0 };
    cam.current = { x: -50, y: -50 };
    dragCurrent.current = { x: 0, y: 0 };
    setMessage("Drag & Release to Fly!");
    updateDOM();
    
    // Reset tangerine visual override manually
    if (tangerineRef.current) {
        tangerineRef.current.style.transform = `translate3d(0px, 0px, 0) rotate(0deg)`;
    }
  };

  // --- Input Handlers ---

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (showTutorial) return;
    if (gameStateRef.current !== 'IDLE') return;
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }
    
    dragStart.current = { x: clientX, y: clientY };
    setGameState('DRAGGING');
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (gameStateRef.current !== 'DRAGGING') return;
    if (e.cancelable) e.preventDefault();

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
    }
    
    let dx = clientX - dragStart.current.x;
    let dy = clientY - dragStart.current.y;
    
    // Cap drag
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len > MAX_DRAG_PX) {
        const ratio = MAX_DRAG_PX / len;
        dx *= ratio;
        dy *= ratio;
    }
    
    // Ensure tangerine stays within screen bounds
    if (tangerineRef.current) {
        const rect = tangerineRef.current.getBoundingClientRect();
        const parentRect = tangerineRef.current.parentElement?.getBoundingClientRect();
        
        if (parentRect) {
            // Calculate the tangerine's would-be position
            const newLeft = rect.left + dx;
            const newTop = rect.top + dy;
            const newRight = newLeft + rect.width;
            const newBottom = newTop + rect.height;
            
            // Constrain to screen bounds
            if (newLeft < 0) dx = -rect.left;
            if (newTop < 0) dy = -rect.top;
            if (newRight > window.innerWidth) dx = window.innerWidth - rect.right;
            if (newBottom > window.innerHeight) dy = window.innerHeight - rect.bottom;
        }
    }
    
    dragCurrent.current = { x: dx, y: dy };

    // Move Tangerine Visually - DIRECT DOM UPDATE
    if (tangerineRef.current) {
        tangerineRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }
    
    // Visual Trajectory
    if (trajectoryRef.current) {
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx*dx + dy*dy);
        trajectoryRef.current.style.width = `${length}px`;
        trajectoryRef.current.style.transform = `rotate(${angle}rad)`;
        trajectoryRef.current.style.opacity = `${Math.min(length/50, 1)}`;
    }
  };

  const handleEnd = () => {
    if (gameStateRef.current !== 'DRAGGING') return;
    
    const forceX = -dragCurrent.current.x * FORCE_MULTIPLIER;
    const forceY = -dragCurrent.current.y * FORCE_MULTIPLIER;

    // Minimum force check
    if (Math.abs(forceX) < 2 && Math.abs(forceY) < 2) {
        setGameState('IDLE');
        // Reset transform if drag cancelled
        if (tangerineRef.current) {
            tangerineRef.current.style.transform = `translate3d(0px, 0px, 0)`;
        }
        updateDOM();
        return;
    }

    // Set initial position to the drag point so it doesn't snap back
    pos.current.x = dragCurrent.current.x;
    pos.current.y = -dragCurrent.current.y; // Invert Y for physics (Up is +)
    
    // Add randomness to rotation
    vel.current = { x: forceX, y: -forceY, r: (Math.random() - 0.5) * 30 };
    
    setThrowCount(prev => prev + 1);
    setGameState('FLYING');
    gameStateRef.current = 'FLYING';
    setMessage("Flying...");
    if(audioShoot.current) audioShoot.current.play().catch(e => console.log('Audio play failed', e));

    if (trajectoryRef.current) trajectoryRef.current.style.opacity = '0';
    
    if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'DRAGGING') {
        window.addEventListener('mousemove', handleMove, { passive: false });
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
    }
    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
    };
  }, [gameState]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#1a4064] via-[#4a90d9] to-[#c2e5ff] select-none touch-none">
        
        {/* --- UI HUD --- */}
        <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
            <div className="bg-black/30 backdrop-blur-md p-3 rounded-2xl text-white">
                <div className="text-xs font-bold uppercase text-yellow-300">Target</div>
                <div className="text-xl font-black">{RIVER_START_M}m+</div>
            </div>

            <div className="flex flex-col items-center">
                 <h2 className={`text-4xl md:text-5xl font-black drop-shadow-lg uppercase italic tracking-tighter transition-colors duration-300
                    ${gameState === 'WON' ? 'text-yellow-400 scale-110' : 'text-white'}
                 `}>
                    {gameState === 'WON' ? "HUAT AH!" : 
                     `${Math.floor(currentDistance)}m`}
                 </h2>
                 <div className={`px-4 py-1 rounded-full mt-2 font-bold shadow-md transition-all
                    ${gameState === 'LANDED' ? 'bg-red-600 text-white animate-pulse' : 'bg-white/90 text-gray-800'}
                 `}>
                    {message}
                 </div>
            </div>

            <div className="bg-black/30 backdrop-blur-md p-3 rounded-2xl text-white text-right">
                <div className="text-xs font-bold uppercase text-yellow-300">Best</div>
                <div className="text-xl font-black">{bestDistance}m</div>
            </div>
        </div>

        {/* --- GAME WORLD --- */}
        <div 
            ref={worldRef}
            className="absolute top-[65%] left-[15%] w-0 h-0 visible" // World Anchor
        >
            {/* 1. Sky & Background Scenery */}
            <div className="absolute -top-[800px] -left-[1000px] w-[6000px] h-[800px] pointer-events-none">
                 
                 {/* Generated Wind Particles - Small & Distributed */}
                 {windParticles.map((w) => (
                    <img
                      key={w.id}
                      src={ASSETS.wind}
                      alt="wind"
                      className="absolute mix-blend-screen opacity-50 pointer-events-none"
                      style={{
                          left: `${w.left}px`,
                          top: `${w.top}px`,
                          width: '60px', // Small size like tangerine
                          transform: `scale(${w.scale})`,
                          opacity: w.opacity
                      }}
                    />
                 ))}

                 {/* Moon/Sun */}
                 <div className="absolute top-20 left-[200px] w-32 h-32 bg-yellow-100 rounded-full shadow-[0_0_60px_rgba(255,255,200,0.6)]"></div>

                 {/* Dragon Kite/Ornament */}
                 <div className="absolute top-40 left-[1000px] opacity-80 animate-pulse z-10">
                     <i className="fa-solid fa-dragon text-red-600 text-[180px] drop-shadow-xl transform -scale-x-100"></i>
                 </div>

                 {/* Generated Clouds - Mix of Background and River clouds */}
                 {clouds.map((cloud) => (
                    <img 
                      key={cloud.id}
                      src={ASSETS.cloud}
                      alt="cloud"
                      className="absolute animate-float-slow w-32"
                      style={{
                          left: `${cloud.left}px`,
                          top: `${cloud.top}px`,
                          transform: `scale(${cloud.scale})`,
                          opacity: cloud.opacity
                      }}
                    />
                 ))}

                 {/* Generated Fireworks - Bigger & Transparent */}
                 {fireworks.map((fw) => (
                    <img
                      key={fw.id}
                      src={ASSETS.firework}
                      alt="firework"
                      className="absolute mix-blend-screen opacity-40 w-48 md:w-64"
                      style={{
                          left: `${fw.left}px`,
                          top: `${fw.top}px`,
                          transform: `scale(${fw.scale})`,
                      }}
                    />
                 ))}

                 {/* Hanging Lanterns */}
                 <div className="absolute top-0 left-[300px] h-40 w-1 bg-yellow-800/50">
                    <div className="absolute bottom-0 -left-6 text-red-600 text-6xl drop-shadow-lg animate-bounce" style={{animationDuration:'3s'}}>🏮</div>
                 </div>
                 <div className="absolute top-0 left-[800px] h-60 w-1 bg-yellow-800/50">
                    <div className="absolute bottom-0 -left-6 text-red-600 text-5xl drop-shadow-lg animate-bounce" style={{animationDuration:'4s'}}>🏮</div>
                 </div>
                 <div className="absolute top-0 left-[1500px] h-32 w-1 bg-yellow-800/50">
                    <div className="absolute bottom-0 -left-6 text-red-600 text-7xl drop-shadow-lg animate-bounce" style={{animationDuration:'2.5s'}}>🏮</div>
                 </div>
            </div>

            {/* 2. The Launch Pad (Grass) */}
            <div 
                className="absolute top-[30px] -left-[1000px] h-[800px] bg-[#2d6a4f] border-t-[8px] border-[#40916c]"
                style={{ width: `${1000 + (RIVER_START_M * METER_SCALE)}px` }}
            >
                {/* Generated Bushes - Bigger (w-40), Transparent & On Ground */}
                {bushes.launchPadBushes.map(bush => (
                    <img 
                        key={bush.id}
                        src={ASSETS.bush}
                        alt="bush"
                        className="absolute -top-16 mix-blend-multiply w-40 opacity-60 filter brightness-110"
                        style={{
                            left: `${bush.left}px`,
                            transform: `scale(${bush.scale})`
                        }}
                    />
                ))}

                {/* Trees - Small, Spaced out, No Overlap */}
                {trees.launchPadTrees.map(tree => (
                    <i 
                        key={tree.id}
                        className="fa-solid fa-tree text-[#1b4332] absolute -top-40 text-[250px] pointer-events-none"
                        style={{
                            left: `${tree.left}px`,
                            transform: `scale(${tree.scale})`,
                            opacity: tree.opacity,
                            zIndex: tree.zIndex
                        }}
                    ></i>
                ))}
            </div>

            {/* Trees Before River - On Launch Pad Edge */}
            <div 
                className="absolute top-[30px] h-[800px] pointer-events-none"
                style={{ 
                    left: `-1000px`,
                    width: `${1000 + (RIVER_START_M * METER_SCALE)}px` 
                }}
            >
                {trees.riverEdgeTrees.map(tree => (
                    <i 
                        key={tree.id}
                        className="fa-solid fa-tree text-[#1b4332] absolute -top-40 text-[250px] pointer-events-none"
                        style={{
                            left: `${tree.left}px`,
                            transform: `scale(${tree.scale})`,
                            opacity: tree.opacity,
                            zIndex: tree.zIndex
                        }}
                    ></i>
                ))}
            </div>

            {/* 3. The River (Target) */}
            <div 
                className="absolute top-[50px] h-[800px] bg-gradient-to-b from-[#0077b6] to-[#03045e] opacity-90 overflow-hidden"
                style={{ 
                    left: `${RIVER_START_M * METER_SCALE}px`, 
                    width: `${RIVER_WIDTH_M * METER_SCALE}px` 
                }}
            >
                {/* Water Surface */}
                <div className="w-full h-4 bg-white/20 absolute top-0 animate-pulse"></div>
                <div className="w-full h-8 bg-[#0096c7]/50 absolute top-0 animate-bounce" style={{ animationDuration: '3s' }}></div>
                
                {/* River Fishes & Squid - Smaller */}
                {riverFishes.map(fish => {
                    let imgUrl = ASSETS.fish1;
                    if (fish.type === 1) imgUrl = ASSETS.fish2;
                    if (fish.type === 2) imgUrl = ASSETS.squid;

                    return (
                        <img 
                            key={fish.id}
                            src={imgUrl}
                            alt="fish"
                            className="absolute animate-bounce"
                            style={{
                                left: `${fish.left}px`,
                                top: `${fish.top}px`,
                                width: fish.type === 2 ? '80px' : '60px',
                                animationDuration: `${fish.animDuration}s`,
                                animationDelay: `${fish.delay}s`,
                                transform: `scale(${fish.scale})`
                            }}
                        />
                    );
                })}

                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-800 text-yellow-300 px-6 py-2 rounded-xl text-lg font-black whitespace-nowrap border-2 border-yellow-500 shadow-xl z-20">
                    <i className="fa-solid fa-water mr-2"></i> PROSPERITY RIVER
                </div>
            </div>

            {/* 4. Far Bank (Grass) */}
            <div 
                className="absolute top-[30px] h-[800px] bg-[#2d6a4f] border-t-[8px] border-[#40916c]"
                style={{ 
                    left: `${RIVER_END_M * METER_SCALE}px`, 
                    width: '5000px' 
                }}
            >
                {/* Generated Bushes - Bigger (w-40), Transparent */}
                {bushes.farBankBushes.map(bush => (
                    <img 
                        key={bush.id}
                        src={ASSETS.bush}
                        alt="bush"
                        className="absolute -top-16 mix-blend-multiply w-40 opacity-60 filter brightness-110"
                        style={{
                            left: `${bush.left}px`,
                            transform: `scale(${bush.scale})`
                        }}
                    />
                ))}
                
                {/* Generated Trees - Transparent, Bigger */}
                {trees.farBankTrees.map(tree => (
                    <i 
                        key={tree.id}
                        className="fa-solid fa-tree text-[#1b4332] absolute -top-40 text-[250px] pointer-events-none"
                        style={{
                            left: `${tree.left}px`,
                            transform: `scale(${tree.scale})`,
                            opacity: tree.opacity,
                            zIndex: tree.zIndex
                        }}
                    ></i>
                ))}

                <i className="fa-solid fa-pagoda text-red-800 absolute -top-40 left-[400px] text-[150px]"></i>
            </div>

            {/* 5. Slingshot Visuals */}
            <div className="absolute top-[30px] -left-2 w-4 h-24 bg-amber-900 rounded-full z-10 shadow-lg"></div>
            <div className="absolute top-[30px] left-8 w-4 h-24 bg-amber-950 rounded-full z-0 shadow-lg"></div>

            {/* 6. Trajectory Line */}
            <div 
                ref={trajectoryRef}
                className="absolute top-0 left-0 h-3 bg-white/50 rounded-full origin-left pointer-events-none z-20 border border-white/80"
                style={{ width: 0, opacity: 0 }}
            ></div>

            {/* 7. The Tangerine - SMALLER (w-32 h-32) */}
            <div 
                ref={tangerineRef}
                className={`absolute z-30 cursor-grab active:cursor-grabbing w-32 h-32 -mt-16 -ml-16 flex items-center justify-center touch-none`}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
            >
                <img 
                    src={ASSETS.tangerine} 
                    alt="Tangerine" 
                    className="w-full h-full object-contain drop-shadow-2xl select-none pointer-events-none filter brightness-110"
                />
            </div>
            
            {/* 8. Victory Fireworks */}
            {gameState === 'WON' && (
                <div className="absolute left-[1500px] -top-[500px] w-full h-full pointer-events-none">
                    <i className="fa-solid fa-fireworks text-red-500 text-9xl absolute animate-ping duration-1000"></i>
                    <i className="fa-solid fa-fireworks text-yellow-400 text-[200px] absolute top-20 left-60 animate-ping delay-200 duration-1000"></i>
                    <i className="fa-solid fa-fireworks text-orange-500 text-[150px] absolute -top-40 -left-60 animate-ping delay-500 duration-1000"></i>
                </div>
            )}
        </div>

        {/* --- HOW TO PLAY TUTORIAL OVERLAY --- */}
        {showTutorial && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="bg-white p-6 md:p-8 rounded-[2rem] max-w-lg w-full mx-4 text-center border-4 border-yellow-500 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-4 bg-red-600"></div>
                    
                    <h2 className="text-3xl md:text-4xl font-black text-red-700 uppercase italic mb-4">How to Play</h2>
                    
                    {/* GIF Demo */}
                    <div className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 shadow-inner">
                        <img 
                            src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTU2cnhpazh1dDF4cWd3NzJmOWFoNHJwNHE1MGpnZXJjbHlocGY5aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sxe5qMdvJqvYYH6QFp/giphy.gif" 
                            alt="How to play demo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    {/* Instructions */}
                    <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200 mb-6">
                        <p className="text-base md:text-lg font-bold text-gray-800 leading-relaxed">
                            Drag & pull back the tangerine. Release to launch. <span className="text-blue-600 font-black">Target: Aim at the river!</span>
                        </p>
                    </div>

                    <button 
                        onClick={() => setShowTutorial(false)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xl py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest active:scale-95"
                    >
                        Start Playing
                    </button>
                </div>
            </div>
        )}

        {/* --- Game Over / Win Modal --- */}
        {(gameState === 'WON') && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-red-600 p-8 rounded-[2rem] border-8 border-yellow-500 text-center shadow-2xl max-w-sm mx-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="text-6xl mb-4 animate-bounce">🌊🍊🌊</div>
                        <h3 className="text-4xl font-black text-yellow-300 uppercase italic mb-2">Huat Ah!</h3>
                        <p className="text-white font-bold text-lg mb-6">
                            You splashed into the Prosperity River at {Math.floor(currentDistance)}m!
                        </p>
                        <button 
                            onClick={() => onComplete(1)}
                            className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black text-2xl py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest border-b-4 border-yellow-600 active:scale-95"
                        >
                            CLAIM REWARD
                        </button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default GamePage;
