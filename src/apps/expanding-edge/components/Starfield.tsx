import React, { useMemo } from 'react';

interface Star {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number; // pixels
  twinkleDuration: number; // seconds
  twinkleDelay: number; // seconds
  opacity: number;
}

const Starfield = React.memo(function Starfield() {
  const stars = useMemo(() => {
    const list: Star[] = [];
    // Generate 120 stars with varied depths and twinkling speeds
    for (let i = 0; i < 120; i++) {
      list.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() < 0.15 ? Math.random() * 1.5 + 1.5 : Math.random() * 1.2 + 0.4,
        twinkleDuration: 3 + Math.random() * 5,
        twinkleDelay: Math.random() * 6,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
    return list;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#02020a] select-none pointer-events-none">
      {/* Dynamic Nebulae */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-900/15 blur-[120px]"
        style={{ transform: 'translate3d(0,0,0)' }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[150px]"
        style={{ transform: 'translate3d(0,0,0)' }}
      />
      <div 
        className="absolute top-1/3 left-1/2 w-80 h-80 rounded-full bg-indigo-950/20 blur-[100px]"
        style={{ transform: 'translate3d(0,0,0)' }}
      />
      <div 
        className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-amber-950/10 blur-[130px]"
        style={{ transform: 'translate3d(0,0,0)' }}
      />

      {/* Stellar grid patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_bottom_left,black_40%,transparent_100%)] opacity-30" />

      {/* Twinkling Stars */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.map((star) => (
          <circle
            key={star.id}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="#ffffff"
            style={{
              opacity: star.opacity,
              animation: `twinkle ${star.twinkleDuration}s infinite ease-in-out`,
              animationDelay: `${star.twinkleDelay}s`,
            }}
          />
        ))}
      </svg>

      {/* Cosmic dust overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_bottom_left] from-transparent via-transparent to-black/40" />

      {/* Custom keyframes injected via style tag to ensure animation is registered */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
});

export default Starfield;
