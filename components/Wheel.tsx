
import React, { useMemo } from 'react';
import { PRIZES } from '../constants';

interface WheelProps {
  rotation?: number;
  isTeaser?: boolean;
}

const Wheel: React.FC<WheelProps> = ({ rotation = 0, isTeaser = false }) => {
  const segments = 8;
  const radius = 150;
  const cx = 150;
  const cy = 150;

  const segmentPath = useMemo(() => {
    const angle = 360 / segments;
    const startAngle = -angle / 2 - 90;
    const endAngle = angle / 2 - 90;
    
    const x1 = cx + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);

    return `M ${cx},${cy} L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
  }, [segments]);

  return (
    <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] pulse-gold rounded-full">
      {/* Outer Border - Solid Gold */}
      <div className="absolute inset-[-10px] md:inset-[-15px] border-[10px] border-yellow-500 rounded-full bg-red-900 shadow-[0_0_40px_rgba(234,179,8,0.7),inset_0_0_15px_black] z-0"></div>
      
      {/* Lights around the border */}
      <div className="absolute inset-[-10px] md:inset-[-15px] rounded-full z-10 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-3 h-3 md:w-4 md:h-4 bg-yellow-200 rounded-full shadow-[0_0_12px_white] animate-pulse"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 22.5}deg) translateY(-135px) md:translateY(-205px)`
            }}
          ></div>
        ))}
      </div>

      {/* The Wheel */}
      <svg 
        viewBox="0 0 300 300" 
        className={`w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] z-20 transition-transform duration-[5000ms] cubic-bezier(0.1, 0, 0.1, 1) ${isTeaser ? 'rotate-slow' : ''}`}
        style={{ transform: isTeaser ? undefined : `rotate(${rotation}deg)` }}
      >
        <g>
          {PRIZES.map((prize, i) => (
            <g key={i} transform={`rotate(${i * (360 / segments)}, 150, 150)`}>
              <path 
                d={segmentPath} 
                fill={i % 2 === 0 ? '#E11D48' : '#BE123C'} 
                stroke="#FACC15" 
                strokeWidth="2.5"
              />
              {/* Prize Icon Group */}
              <g transform="translate(150, 50) scale(1.1)">
                <text 
                  y="12" 
                  font-size="28" 
                  textAnchor="middle" 
                  className="select-none filter drop-shadow-md"
                >
                  {prize.icon}
                </text>
                {/* Visual Glow for labels */}
                <circle r="22" fill="white" opacity="0.05" />
              </g>
            </g>
          ))}
        </g>
        
        {/* Center Pin */}
        <circle cx="150" cy="150" r="28" fill="#EAB308" className="shadow-lg" />
        <circle cx="150" cy="150" r="24" fill="#991B1B" />
        <text 
          x="150" 
          y="157" 
          fill="#FACC15" 
          fontSize="12" 
          fontWeight="900" 
          textAnchor="middle" 
          className="select-none font-black italic tracking-tighter"
        >
          HUAT
        </text>
      </svg>

      {/* The Pointer */}
      <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-40 drop-shadow-xl scale-110">
        <div className="w-8 h-12 bg-gradient-to-b from-yellow-300 to-yellow-600 clip-pointer shadow-lg transform rotate-180"></div>
        <div className="w-4 h-4 bg-white rounded-full absolute -top-1.5 left-[8px] shadow-[0_0_6px_white] animate-pulse"></div>
      </div>

      <style>{`
        .clip-pointer {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
};

export default Wheel;
