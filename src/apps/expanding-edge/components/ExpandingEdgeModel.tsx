import React, { useState, useRef, useMemo } from 'react';
import { LifeStep, JourneyState, PlanetType, getPlanetName, getPlanetSizeMultiplier, getOrbitRadius } from '../types';
import { CosmicAudio } from './CosmicAudio';
import { Sparkles, Compass, AlertCircle, Volume2, VolumeX } from 'lucide-react';

interface ExpandingEdgeModelProps {
  state: JourneyState;
  setState: React.Dispatch<React.SetStateAction<JourneyState>>;
  activeStepId: string | 'core' | 'new' | null;
  setActiveStepId: (id: string | 'core' | 'new' | null) => void;
}

const ExpandingEdgeModel = React.memo(function ExpandingEdgeModel({ state, setState, activeStepId, setActiveStepId }: ExpandingEdgeModelProps) {
  const numSteps = state.steps.length;
  const isCoreDefined = state.coreLabel !== '';
  const isHalfCircle = true; // Always show the left half of the solar system model

  // Calculate maximum radius before scaling - don't scale until the outer edge reaches the right border of the screen with a 45px margin (800 - 45 = 755)
  const maxRadiusLimit = 755;
  const rawOuterRadius = isCoreDefined 
    ? getOrbitRadius(numSteps + 1)  // outer edge of the solar system (What's Possible ring)
    : 145;
  const scaleFactor = rawOuterRadius > maxRadiusLimit ? maxRadiusLimit / rawOuterRadius : 1;

  // Calculate outer limit of "What's Possible"
  const possibleRadius = rawOuterRadius;
  const possibleRadiusScaled = possibleRadius * scaleFactor;

  // Origin coordinate inside our SVG viewBox (0 0 800 800)
  // Shift the vertical center (cy) so that the outer "What's Possible" ring has a 20px buffer from the top of the screen!
  const cx = 0;
  const cy = possibleRadiusScaled + 20;

  // Scaled Radii (Solar Anchor half size)
  const rCore = 70 * scaleFactor;
  const rCoreMiddle = 75 * scaleFactor;
  const rCoreOuter = 82.5 * scaleFactor;

  // Track hovered element for the HUD telemetry card
  const [hoveredBody, setHoveredBody] = useState<{
    type: 'core' | 'step' | 'frontier' | 'possible';
    name: string;
    label: string;
    radius: number;
    speed?: number;
    risk?: string;
    skill?: string;
    description?: string;
    details?: string;
  } | null>(null);

  const hoverTimeoutRef = useRef<any>(null);
  const hoverActiveCountRef = useRef<number>(0);

  const clearHoverWithDelay = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (hoverActiveCountRef.current <= 0) {
        setHoveredBody(null);
      }
    }, 300);
  };

  const handleCardMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    clearHoverWithDelay();
  };

  // Calculate coordinates for the next available orbit
  const nextStepIndex = numSteps;
  const nextStepRadius = getOrbitRadius(nextStepIndex);
  const nextStepRadiusScaled = nextStepRadius * scaleFactor;
  


  // Helper to map planet type to static SVG assets and detect if still
  const getPlanetPath = (planetType: PlanetType): { path: string; isStill: boolean } => {
    switch (planetType) {
      case 'elysium':
        return { path: '/expanding-edge/planet/elysium.svg', isStill: false };
      case 'gaia':
        return { path: '/expanding-edge/planet/gaia.svg', isStill: false };
      case 'lumina':
        return { path: '/expanding-edge/planet/lumina.svg', isStill: true };
      case 'mythos':
        return { path: '/expanding-edge/planet/mythos.svg', isStill: false };
      case 'storm':
        return { path: '/expanding-edge/planet/storm.svg', isStill: true };
      case 'vespera':
        return { path: '/expanding-edge/planet/vespera.svg', isStill: true };
      default:
        return { path: '/expanding-edge/planet/gaia.svg', isStill: false };
    }
  };

  const getPlanetAnimationClass = (planetType: PlanetType): string => {
    switch (planetType) {
      case 'storm':
        return 'animate-spin-clockwise';
      default:
        return '';
    }
  };

  // Color mappings for planet styles
  const getPlanetGradient = (type: PlanetType) => {
    switch (type) {
      case 'elysium':
        return {
          base: 'url(#emeraldGrad)',
          glow: 'rgba(16, 185, 129, 0.6)',
          ambient: 'Atmosphere: Vibrant nitrogen-oxygen canopy with active biomes.'
        };
      case 'gaia':
        return {
          base: 'url(#oceanGrad)',
          glow: 'rgba(59, 130, 246, 0.6)',
          ambient: 'Atmosphere: Rich oceans and deep forests.'
        };
      case 'lumina':
        return {
          base: 'url(#gasGrad)',
          glow: 'rgba(245, 158, 11, 0.6)',
          ambient: 'Atmosphere: Brilliant stellar light waves.'
        };
      case 'mythos':
        return {
          base: 'url(#metallicGrad)',
          glow: 'rgba(139, 92, 246, 0.6)',
          ambient: 'Atmosphere: Legendary dark dust nebula.'
        };
      case 'storm':
        return {
          base: 'url(#fieryGrad)',
          glow: 'rgba(6, 182, 212, 0.6)',
          ambient: 'Atmosphere: High energy cyclone storms.'
        };
      case 'vespera':
        return {
          base: 'url(#fieryGrad)',
          glow: 'rgba(239, 68, 68, 0.6)',
          ambient: 'Atmosphere: Evening cooling magma flows.'
        };
      default:
        return {
          base: 'url(#sunGrad)',
          glow: 'rgba(245, 158, 11, 0.8)',
          ambient: 'Gaseous solar fusion corona.'
        };
    }
  };

  // Generate random cosmic dust particles in the "What's Possible" belt
  const cosmicDust = useMemo(() => {
    const list = [];
    const count = 10 + numSteps * 15; // more dust as the system expands!
    const dustOpacityScale = Math.min(1.0, 0.3 + numSteps * 0.18);
    for (let i = 0; i < count; i++) {
      // Angle between 0 and 90 degrees (quarter) or -90 and 90 degrees (half)
      const angleDeg = isHalfCircle ? (Math.random() * 180 - 90) : (Math.random() * 90);
      const angleRad = (angleDeg * Math.PI) / 180;
      // Radially distribute within the "What's Possible" belt width (say r +/- 15)
      const r = possibleRadiusScaled + (Math.random() * 30 - 15) * scaleFactor;
      
      list.push({
        id: i,
        x: cx + r * Math.cos(angleRad),
        y: cy - r * Math.sin(angleRad),
        r: Math.random() * 1.5 + 0.6,
        opacity: (Math.random() * 0.7 + 0.2) * dustOpacityScale,
        blinkSpeed: 1.5 + Math.random() * 3,
      });
    }
    return list;
  }, [possibleRadiusScaled, numSteps, isHalfCircle, scaleFactor, cx, cy]);

  const handleBodyHover = (
    type: 'core' | 'step' | 'frontier' | 'possible',
    name: string,
    label: string,
    radius: number,
    extra?: Partial<typeof hoveredBody>
  ) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Check if we are already hovering the SAME concentric orbit/body
    if (hoveredBody && hoveredBody.radius === radius && hoveredBody.type === type) {
      return;
    }

    setHoveredBody({
      type,
      name,
      label,
      radius,
      ...extra
    });
    CosmicAudio.playHoverSound();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden">
      {/* Audio toggle in the upper right (replaces Semicircle Telemetry Area) */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={() => {
            const nextAudioState = !state.isAudioEnabled;
            setState(prev => ({ ...prev, isAudioEnabled: nextAudioState }));
            CosmicAudio.toggleBackgroundHum(nextAudioState);
            CosmicAudio.playClickSound();
          }}
          className="p-3 rounded-full bg-slate-900/80 border border-white/5 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer"
          title={state.isAudioEnabled ? "Mute Soundtrack" : "Unmute Soundtrack"}
          id="sound-toggle-btn"
        >
          {state.isAudioEnabled ? (
            <Volume2 className="w-5 h-5 text-cyan-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </div>



      {/* Main Visual Model viewport */}
      <div className="flex-1 w-full relative min-h-[500px]">
        <svg 
          viewBox={`0 0 800 ${2 * cy}`} 
          className="w-full h-full object-contain object-top"
          id="expanding-edge-svg"
          preserveAspectRatio="xMidYMin meet"
        >
          {/* DEFINITIONS FOR GRADIENTS AND GLOW FILTERS */}
          <defs>
            {/* Stable Nebulous Blur Filter */}
            <filter id="nebulousBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" />
            </filter>

            {/* Core Sun Glow Filter */}
            <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Orbit Highlight / Glow */}
            <filter id="orbitGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* General Planet Glow */}
            <filter id="planetGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Planet Gradients */}
            <radialGradient id="sunGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>

            <radialGradient id="fieryGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="85%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>

            <radialGradient id="oceanGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="30%" stopColor="#38bdf8" />
              <stop offset="75%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            <radialGradient id="gasGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="35%" stopColor="#fbbf24" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>

            <radialGradient id="crystalGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fae8ff" />
              <stop offset="30%" stopColor="#c084fc" />
              <stop offset="75%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#3b0764" />
            </radialGradient>

            <radialGradient id="metallicGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="40%" stopColor="#94a3b8" />
              <stop offset="80%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            <radialGradient id="emeraldGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ecfdf5" />
              <stop offset="30%" stopColor="#34d399" />
              <stop offset="75%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>

            {/* Nebulous gradient for the "What's Possible" edge */}
            <linearGradient id="nebulousGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="nebulousBrightGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="30%" stopColor="#c084fc" />
              <stop offset="70%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* GRIDLINES / POLAR COORDINATE MARKERS */}
          {Array.from({ length: isHalfCircle ? 13 : 8 }).map((_, i) => {
            const angleDeg = isHalfCircle ? (i * 15 - 90) : (i * 15);
            const angle = (angleDeg * Math.PI) / 180;
            const targetX = cx + 720 * Math.cos(angle);
            const targetY = cy - 720 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={targetX}
                y2={targetY}
                stroke="rgba(34, 211, 238, 0.04)"
                strokeWidth="1"
                strokeDasharray={i % 3 === 0 ? "none" : "4 4"}
              />
            );
          })}

          {/* 1. THE SOLAR CORE (Current Life Situation) */}
          <g 
            className="cursor-pointer group"
            onClick={() => {
              setActiveStepId('core');
              CosmicAudio.playClickSound();
            }}
            onMouseEnter={() => {
              hoverActiveCountRef.current += 1;
              handleBodyHover(
                'core',
                'Solar Core\n(The Anchor)',
                isCoreDefined ? state.coreLabel : 'Uncharted Current Life Situation',
                140,
                { description: isCoreDefined ? state.coreDescription : 'Click to define your starting baseline parameters.' }
              );
            }}
            onMouseLeave={() => {
              hoverActiveCountRef.current = Math.max(0, hoverActiveCountRef.current - 1);
              clearHoverWithDelay();
            }}
            id="solar-core-g"
          >
            {/* Blazing Corona (Outer Glow) */}
            <path
              d={isHalfCircle
                ? `M ${cx},${cy} L ${cx},${cy - rCoreOuter} A ${rCoreOuter},${rCoreOuter} 0 0,1 ${cx},${cy + rCoreOuter} Z`
                : `M ${cx},${cy} L ${cx},${cy - rCoreOuter} A ${rCoreOuter},${rCoreOuter} 0 0,1 ${cx + rCoreOuter},${cy} Z`}
              fill="rgba(245, 158, 11, 0.15)"
              filter="url(#sunGlow)"
              className="transition-transform duration-500 group-hover:scale-105"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
            
            {/* Middle Fire Belt */}
            <path
              d={isHalfCircle
                ? `M ${cx},${cy} L ${cx},${cy - rCoreMiddle} A ${rCoreMiddle},${rCoreMiddle} 0 0,1 ${cx},${cy + rCoreMiddle} Z`
                : `M ${cx},${cy} L ${cx},${cy - rCoreMiddle} A ${rCoreMiddle},${rCoreMiddle} 0 0,1 ${cx + rCoreMiddle},${cy} Z`}
              fill="rgba(239, 68, 68, 0.25)"
              filter="url(#sunGlow)"
            />

            {/* Solid Sun Core Image */}
            <image
              href="/expanding-edge/planet/sun_512.gif"
              x={cx - rCore}
              y={cy - rCore}
              width={rCore * 2}
              height={rCore * 2}
              style={{ pointerEvents: 'none', maxWidth: '400px', background: 'transparent' }}
            />

            {/* Selection / Highlight Stroke Overlay */}
            <path
              d={isHalfCircle
                ? `M ${cx},${cy} L ${cx},${cy - rCore} A ${rCore},${rCore} 0 0,1 ${cx},${cy + rCore} Z`
                : `M ${cx},${cy} L ${cx},${cy - rCore} A ${rCore},${rCore} 0 0,1 ${cx + rCore},${cy} Z`}
              fill="transparent"
              className="transition-colors duration-300"
              stroke={activeStepId === 'core' ? 'rgba(34, 211, 238, 0.8)' : 'rgba(255,255,255,0.2)'}
              strokeWidth={activeStepId === 'core' ? '3' : '1.5'}
              style={{ pointerEvents: 'none' }}
            />

            {/* Core Label curved text */}
            {(() => {
              const fontSize = Math.max(4.67 * 1.4, 6 * scaleFactor);
              const rText = Math.max(20, (rCore * 0.75) - (2.25 * fontSize));
              return (
                <>
                  <path
                    id="sunTextPath"
                    d={isHalfCircle
                      ? `M ${cx},${cy + rText} A ${rText},${rText} 0 0,0 ${cx},${cy - rText}`
                      : `M ${cx + 10},${cy - rText} A ${rText},${rText} 0 0,1 ${cx + rText},${cy - 10}`}
                    fill="none"
                  />
                  <text 
                    style={{ fontSize: `${fontSize}px` }}
                    className="fill-amber-100 font-mono uppercase tracking-widest font-bold pointer-events-none"
                  >
                    <textPath href="#sunTextPath" startOffset="50%" textAnchor="middle">
                      {isCoreDefined ? '★ SOLAR ANCHOR ★' : '⚠ CLASSIFY BASELINE ⚠'}
                    </textPath>
                  </text>
                </>
              );
            })()}

            {/* Small decorative inner center point */}
            <circle cx={cx} cy={cy} r="12.5" fill="rgba(255, 255, 255, 0.15)" />
            <circle cx={cx} cy={cy} r="5" fill="#ffffff" className="animate-pulse" />
          </g>

          {/* 2. CONCENTRIC STAGES (Existing Orbiting Planets) */}
          {state.steps.map((step) => {
            const r = getOrbitRadius(step.index);
            const rScaled = r * scaleFactor;
            const isSelected = activeStepId === step.id;
            const gradMeta = getPlanetGradient(step.planetType);

            // Fetch planet SVG details
            const { path: planetPath } = getPlanetPath(step.planetType);

            // Increased planet sizes matching precise relative multipliers
            const baseRadius = 10;
            let sizeMultiplier = getPlanetSizeMultiplier(step.planetType);
            if (step.planetType === 'storm') {
              sizeMultiplier *= 1.25;
            }
            const scaledRadius = baseRadius * sizeMultiplier * scaleFactor;

            // Track if either this planet or its orbit is hovered
            const isCurrentHovered = hoveredBody && hoveredBody.radius === r;

            const pathD = isHalfCircle
              ? `M ${cx},${cy - rScaled} A ${rScaled},${rScaled} 0 0,1 ${cx},${cy + rScaled}`
              : `M ${cx},${cy - rScaled} A ${rScaled},${rScaled} 0 0,1 ${cx + rScaled},${cy}`;

            const orbitValues = isHalfCircle
              ? `90 ${cx} ${cy}; -90 ${cx} ${cy}; 90 ${cx} ${cy}`
              : `0 ${cx} ${cy}; -90 ${cx} ${cy}; 0 ${cx} ${cy}`;

            const name = getPlanetName(step.planetType);

            return (
              <g key={step.id} id={`orbit-group-${step.index}`}>
                {/* Thin visible Orbit Track Arc */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? "rgba(34, 211, 238, 0.6)" : "rgba(147, 197, 253, 0.12)"}
                  strokeWidth={isSelected ? "2.5" : "1"}
                  className="transition-all duration-300 pointer-events-none"
                  filter={isSelected ? "url(#orbitGlow)" : undefined}
                />

                {/* Transparent Hover/Click Hitbox Zone (up to half the distance to the next orbital line, 40 LY width) */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={40 * scaleFactor}
                  className="cursor-pointer"
                  style={{ pointerEvents: 'stroke' }}
                  onMouseEnter={() => {
                    hoverActiveCountRef.current += 1;
                    handleBodyHover(
                      'step',
                      name,
                      step.label,
                      r,
                      {
                        speed: step.orbitSpeed,
                        risk: step.risk,
                        skill: step.skill,
                        description: step.description,
                        details: gradMeta.ambient
                      }
                    );
                  }}
                  onMouseLeave={() => {
                    hoverActiveCountRef.current = Math.max(0, hoverActiveCountRef.current - 1);
                    clearHoverWithDelay();
                  }}
                  onClick={() => {
                    setActiveStepId(isSelected ? null : step.id);
                    CosmicAudio.playClickSound();
                  }}
                />

                {/* THE PLANET */}
                <g className="cursor-pointer">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values={orbitValues}
                    dur={`${step.orbitSpeed}s`}
                    repeatCount="indefinite"
                  />

                  {/* Planet Core Target */}
                  <g
                    onClick={() => {
                      setActiveStepId(isSelected ? null : step.id);
                      CosmicAudio.playClickSound();
                    }}
                    onMouseEnter={() => {
                      hoverActiveCountRef.current += 1;
                      handleBodyHover(
                        'step',
                        name,
                        step.label,
                        r,
                        {
                          speed: step.orbitSpeed,
                          risk: step.risk,
                          skill: step.skill,
                          description: step.description,
                          details: gradMeta.ambient
                        }
                      );
                    }}
                    onMouseLeave={() => {
                      hoverActiveCountRef.current = Math.max(0, hoverActiveCountRef.current - 1);
                      clearHoverWithDelay();
                    }}
                    transform={`translate(${cx + rScaled}, ${cy})`}
                  >
                    {/* Planet shadow underlay */}
                    <circle r={scaledRadius * 1.1} fill="rgba(0,0,0,0.6)" />

                    {/* Main Planet SVG Asset Wrapper */}
                    <g>
                      <g className={getPlanetAnimationClass(step.planetType)}>
                        {/* SVG Planet Image */}
                        <image
                          href={planetPath}
                          x={-scaledRadius}
                          y={-scaledRadius}
                          width={scaledRadius * 2}
                          height={scaledRadius * 2}
                          className="filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
                        />
                      </g>
                    </g>

                    {/* Tiny Orbiting Moon (removed) */}
                  </g>
                </g>
              </g>
            );
          })}

          {/* 3. THE ACTIVE FRONTIER STEP (Highlighted Ghost Orbit Invitation) */}
          {isCoreDefined && numSteps < 15 && (
            <g id="active-frontier-g">
              {/* Frontier dashed orbit line */}
              <path
                d={isHalfCircle
                  ? `M ${cx},${cy - nextStepRadiusScaled} A ${nextStepRadiusScaled},${nextStepRadiusScaled} 0 0,1 ${cx},${cy + nextStepRadiusScaled}`
                  : `M ${cx},${cy - nextStepRadiusScaled} A ${nextStepRadiusScaled},${nextStepRadiusScaled} 0 0,1 ${cx + nextStepRadiusScaled},${cy}`}
                fill="none"
                stroke="url(#nebulousGrad)"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-[pulse_2s_infinite_ease-in-out] pointer-events-none"
                filter="url(#orbitGlow)"
              />

              {/* Transparent Click/Hover Hitbox Area (up to half the distance to the next orbital line, 40 LY width) */}
              <path
                d={isHalfCircle
                  ? `M ${cx},${cy - nextStepRadiusScaled} A ${nextStepRadiusScaled},${nextStepRadiusScaled} 0 0,1 ${cx},${cy + nextStepRadiusScaled}`
                  : `M ${cx},${cy - nextStepRadiusScaled} A ${nextStepRadiusScaled},${nextStepRadiusScaled} 0 0,1 ${cx + nextStepRadiusScaled},${cy}`}
                fill="none"
                stroke="transparent"
                strokeWidth={40 * scaleFactor}
                className="cursor-pointer"
                style={{ pointerEvents: 'stroke' }}
                onMouseEnter={() => {
                  hoverActiveCountRef.current += 1;
                  handleBodyHover(
                    'frontier',
                    'Active Frontier (The Edge)',
                    'Unfulfilled Development Step',
                    nextStepRadius,
                    { description: 'Click this ring or the plus planet to define your next courageous life milestone.' }
                  );
                }}
                onMouseLeave={() => {
                  hoverActiveCountRef.current = Math.max(0, hoverActiveCountRef.current - 1);
                  clearHoverWithDelay();
                }}
                onClick={() => {
                  setActiveStepId(activeStepId === 'new' ? null : 'new');
                  CosmicAudio.playClickSound();
                  setTimeout(() => {
                    const input = document.getElementById('new-step-label');
                    if (input) {
                      input.focus();
                    }
                  }, 50);
                }}
              />

              {/* Ghost / Transparent Invite Planet */}
              <g>
                {/* Keeps the ghost planet spinning at a standard 22s period */}
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values={isHalfCircle
                    ? `90 ${cx} ${cy}; -90 ${cx} ${cy}; 90 ${cx} ${cy}`
                    : `0 ${cx} ${cy}; -90 ${cx} ${cy}; 0 ${cx} ${cy}`}
                  dur="22s"
                  repeatCount="indefinite"
                />

                <g
                  transform={`translate(${cx + nextStepRadiusScaled}, ${cy})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveStepId(activeStepId === 'new' ? null : 'new');
                    CosmicAudio.playClickSound();
                    setTimeout(() => {
                      const input = document.getElementById('new-step-label');
                      if (input) {
                        input.focus();
                      }
                    }, 50);
                  }}
                  onMouseEnter={() => {
                    hoverActiveCountRef.current += 1;
                    handleBodyHover(
                      'frontier',
                      'Active Frontier (The Edge)',
                      'Unfulfilled Development Step',
                      nextStepRadius,
                      { description: 'Click this node or the left log to define this concentric boundary. Setting a milestone pushes your potential further.' }
                    );
                  }}
                  onMouseLeave={() => {
                    hoverActiveCountRef.current = Math.max(0, hoverActiveCountRef.current - 1);
                    clearHoverWithDelay();
                  }}
                >
                  {/* Glowing selection ring */}
                  <circle
                    r="22"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    className="animate-spin opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all"
                    style={{ animationDuration: '10s' }}
                  />

                  {/* Ghost planet center core */}
                  <circle
                    r="10"
                    fill="rgba(34, 211, 238, 0.15)"
                    stroke="#22d3ee"
                    strokeWidth="1"
                    className="group-hover:fill-cyan-500/30 transition-colors"
                  />

                  {/* Inner glowing pulse */}
                  <circle
                    r="6"
                    fill="#22d3ee"
                    className="animate-ping"
                  />
                  
                  {/* "+" symbol inside the ghost planet */}
                  <path
                    d="M -3,0 L 3,0 M 0,-3 L 0,3"
                    stroke="#e0f7fa"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              </g>
            </g>
          )}

          {/* 4. THE "WHAT'S POSSIBLE" OUTER BELT (Mysterious Outermost Ring) */}
          <g 
            className="group"
            onMouseEnter={() => {
              hoverActiveCountRef.current += 1;
              handleBodyHover(
                'possible',
                "What's Possible\n(The Horizon)",
                'The Uncharted Nebulous Margin',
                possibleRadius,
                { 
                  description: 'The shifting celestial envelope representing structural potential. It grows thicker, brighter, and expands dynamically for every life risk you take.',
                  details: `Boundary Potential Level: Class-${numSteps + 1} Nebula.`
                }
              );
            }}
            onMouseLeave={() => {
              hoverActiveCountRef.current = Math.max(0, hoverActiveCountRef.current - 1);
              clearHoverWithDelay();
            }}
            id="whats-possible-g"
          >
            {/* Outer Belt Nebulous Background Glow Arc */}
            <path
              d={isHalfCircle
                ? `M ${cx},${cy - possibleRadiusScaled} A ${possibleRadiusScaled},${possibleRadiusScaled} 0 0,1 ${cx},${cy + possibleRadiusScaled}`
                : `M ${cx},${cy - possibleRadiusScaled} A ${possibleRadiusScaled},${possibleRadiusScaled} 0 0,1 ${cx + possibleRadiusScaled},${cy}`}
              fill="none"
              stroke="url(#nebulousGrad)"
              // Thickness expands dynamically as the user adds more steps! Capped to 45px to prevent GPU layout overflows.
              strokeWidth={Math.min(45, 10 + numSteps * 3) * scaleFactor}
              strokeLinecap="round"
              className="animate-[pulse_4s_infinite_ease-in-out]"
              filter="url(#nebulousBlur)"
              style={{ 
                opacity: Math.min(0.7, 0.15 + numSteps * 0.05)
              }}
            />

            {/* Core glowing filament arc */}
            <path
              d={isHalfCircle
                ? `M ${cx},${cy - possibleRadiusScaled} A ${possibleRadiusScaled},${possibleRadiusScaled} 0 0,1 ${cx},${cy + possibleRadiusScaled}`
                : `M ${cx},${cy - possibleRadiusScaled} A ${possibleRadiusScaled},${possibleRadiusScaled} 0 0,1 ${cx + possibleRadiusScaled},${cy}`}
              fill="none"
              stroke="url(#nebulousBrightGrad)"
              strokeWidth={Math.min(10, 1.5 + numSteps * 0.8) * scaleFactor}
              strokeDasharray="250 15 80 45"
              style={{ opacity: Math.min(0.8, 0.2 + numSteps * 0.05) }}
            >
              {/* Slowly rotate the stardust ring dash offsets */}
              <animate
                attributeName="stroke-dashoffset"
                values="0; 1000; 0"
                dur={`${Math.max(8, 30 - numSteps * 5.5)}s`}
                repeatCount="indefinite"
              />
            </path>

            {/* A second dashed overlay for high particle texture */}
            <path
              d={isHalfCircle
                ? `M ${cx},${cy - possibleRadiusScaled} A ${possibleRadiusScaled},${possibleRadiusScaled} 0 0,1 ${cx},${cy + possibleRadiusScaled}`
                : `M ${cx},${cy - possibleRadiusScaled} A ${possibleRadiusScaled},${possibleRadiusScaled} 0 0,1 ${cx + possibleRadiusScaled},${cy}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth={Math.min(4, 0.5 + numSteps * 0.3) * scaleFactor}
              strokeDasharray="4 20 2 10 6 30"
              style={{ opacity: Math.min(0.7, 0.1 + numSteps * 0.05) }}
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0; -500; 0"
                dur={`${Math.max(5, 20 - numSteps * 3.5)}s`}
                repeatCount="indefinite"
              />
            </path>

            {/* Cosmic dust particle sprites */}
            {cosmicDust.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill="#ffffff"
                className="pointer-events-none transition-opacity duration-1000"
                opacity={p.opacity}
              />
            ))}

            {/* Sparkle text indicator alongside the belt */}
            <path
              id="possibleTextPath"
              d={isHalfCircle
                ? `M ${cx},${cy + possibleRadiusScaled - 20} A ${possibleRadiusScaled - 20},${possibleRadiusScaled - 20} 0 0,0 ${cx},${cy - possibleRadiusScaled + 20}`
                : `M ${cx + 25},${cy - possibleRadiusScaled + 15} A ${possibleRadiusScaled - 20},${possibleRadiusScaled - 20} 0 0,1 ${cx + possibleRadiusScaled - 15},${cy - 25}`}
              fill="none"
            />
            <text className="fill-cyan-300 font-mono text-[9px] font-bold uppercase tracking-[0.25em] animate-pulse">
              <textPath href="#possibleTextPath" startOffset="50%" textAnchor="middle">
                ✧ WHAT&apos;S POSSIBLE ✧
              </textPath>
            </text>
          </g>
        </svg>

        {/* 5. FLOATING HUD SYSTEM VIEWPATH / SPECTRAL ANALYSIS TELEMETRY */}
        {hoveredBody && (
          <div 
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className={`fixed bottom-5 right-5 w-[calc(100%-2.5rem)] ${hoveredBody.type === 'frontier' || hoveredBody.type === 'possible' ? 'sm:w-[512px]' : 'sm:w-96'} p-5 rounded-2xl border border-white/5 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className="space-y-3.5" id="hud-telemetry">
              {/* Telemetry Header - Planet Name / Region at top styled as spectral scanner */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono text-slate-100 uppercase tracking-wider font-black whitespace-pre-line">
                    {hoveredBody.name}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20 whitespace-nowrap">
                  Radius: {hoveredBody.radius} LY
                </span>
              </div>

              {/* Main Body Info */}
              <div>
                <p className="text-xs text-slate-200 mt-1 font-sans leading-relaxed">
                  {hoveredBody.label}
                </p>
              </div>

              {/* Description */}
              {hoveredBody.description && (
                <p className="text-[11px] text-slate-400 italic leading-relaxed font-sans bg-slate-900/30 p-2.5 rounded-xl border border-white/5">
                  &ldquo;{hoveredBody.description}&rdquo;
                </p>
              )}

              {/* Risks block */}
              {hoveredBody.risk && (
                <div className="flex flex-col gap-3 pt-2 border-t border-white/5 text-xs">
                  <div className="flex flex-col gap-0.5 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10 w-full">
                    <span className="text-[8px] font-mono text-amber-400 font-black uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" /> Courageous Risk
                    </span>
                    <span className="text-slate-300 text-[10px] leading-normal">{hoveredBody.risk}</span>
                  </div>
                </div>
              )}

              {/* Atmospheric Details / Custom classification (Moved to bottom) */}
              {hoveredBody.details && (
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                  {hoveredBody.details}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ExpandingEdgeModel;
