import { LifeDomain } from './types';

export const LIFE_DOMAINS: LifeDomain[] = [
  {
    id: 'healthy-living',
    label: 'Healthy Living',
    emoji: '🌿',
    svgIcon: `
      <g transform="translate(4,4)">
        <path d="M24 8 C20 2, 10 2, 10 10 C10 16, 17 20, 24 26 C31 20, 38 16, 38 10 C38 2, 28 2, 24 8 Z"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
        <polyline points="14,18 18,14 21,19 25,10 28,16 32,14"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `,
    color: 'from-emerald-400',
    colorTo: 'to-teal-500',
    glowColor: 'rgba(52,211,153,0.35)',
    prompt: 'What does healthy living look like for you? It could be staying active, eating well, managing stress, or nurturing your mental health…',
    description: 'Physical wellbeing, nutrition, mental health, and daily wellness habits that fuel a good life.',
  },
  {
    id: 'safety-security',
    label: 'Safety & Security',
    emoji: '🛡️',
    svgIcon: `
      <g transform="translate(4,4)">
        <path d="M24 4 L40 10 L40 22 C40 32, 32 40, 24 44 C16 40, 8 32, 8 22 L8 10 Z"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
        <polyline points="16,23 21,29 32,17"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `,
    color: 'from-blue-400',
    colorTo: 'to-indigo-500',
    glowColor: 'rgba(96,165,250,0.35)',
    prompt: 'What does feeling safe and secure mean to you? It could be a stable home, financial peace of mind, or a community where you feel protected…',
    description: 'Living in a safe environment, financial stability, and emotional security — the foundation of peace of mind.',
  },
  {
    id: 'supports-for-family',
    label: 'Supports for Family',
    emoji: '👨‍👩‍👧',
    svgIcon: `
      <g transform="translate(4,4)">
        <circle cx="14" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/>
        <circle cx="34" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/>
        <circle cx="24" cy="16" r="4" fill="none" stroke="currentColor" stroke-width="2.2"/>
        <path d="M6 38 C6 30, 10 26, 14 26 L18 26 M30 26 L34 26 C38 26, 42 30, 42 38"
          fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M18 38 C18 32, 20 28, 24 28 C28 28, 30 32, 30 38"
          fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M14 26 Q24 36 34 26" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,3"/>
      </g>
    `,
    color: 'from-amber-400',
    colorTo: 'to-orange-500',
    glowColor: 'rgba(251,191,36,0.35)',
    prompt: 'What role does family play in your vision? It could be closer bonds, regular gatherings, emotional support, or being a source of strength for loved ones…',
    description: 'The relationships, care, and connection within family that provide love, belonging, and mutual support.',
  },
  {
    id: 'supports-and-services',
    label: 'Supports & Services',
    emoji: '🤝',
    svgIcon: `
      <g transform="translate(4,4)">
        <path d="M8 28 L16 20 L20 24 M40 28 L32 20 L28 24 M20 24 L24 20 L28 24"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 34 L8 28 M32 34 L40 28 M16 34 L24 38 L32 34"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="24" cy="14" r="3" fill="currentColor" opacity="0.7"/>
        <line x1="24" y1="8" x2="24" y2="11" stroke="currentColor" stroke-width="1.8"/>
        <line x1="29" y1="10" x2="27" y2="12" stroke="currentColor" stroke-width="1.8"/>
        <line x1="19" y1="10" x2="21" y2="12" stroke="currentColor" stroke-width="1.8"/>
      </g>
    `,
    color: 'from-violet-400',
    colorTo: 'to-purple-500',
    glowColor: 'rgba(167,139,250,0.35)',
    prompt: 'What support systems matter most to you? It could be access to healthcare, transportation, community programs, or assistance with daily activities…',
    description: 'Access to formal and informal supports, services, and resources that help you live your best life.',
  },
  {
    id: 'daily-life-employment',
    label: 'Daily Life & Employment',
    emoji: '💼',
    svgIcon: `
      <g transform="translate(4,4)">
        <rect x="8" y="18" width="32" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <path d="M18 18 L18 14 C18 12, 20 10, 22 10 L26 10 C28 10, 30 12, 30 14 L30 18"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="8" y1="26" x2="40" y2="26" stroke="currentColor" stroke-width="2"/>
        <circle cx="24" cy="33" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <polyline points="24,30 24,33 27,35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </g>
    `,
    color: 'from-sky-400',
    colorTo: 'to-cyan-500',
    glowColor: 'rgba(56,189,248,0.35)',
    prompt: 'What does your ideal daily life and work look like? It could be a fulfilling job, a balanced routine, financial independence, or meaningful daily rituals…',
    description: 'Your daily routines, work life, career aspirations, and the activities that give each day meaning and purpose.',
  },
  {
    id: 'community-living',
    label: 'Community Living',
    emoji: '🏘️',
    svgIcon: `
      <g transform="translate(4,4)">
        <path d="M6 28 L14 16 L22 28 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="10" y="28" width="8" height="12" fill="none" stroke="currentColor" stroke-width="2.2"/>
        <path d="M20 26 L28 16 L36 26 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="24" y="26" width="8" height="14" fill="none" stroke="currentColor" stroke-width="2.2"/>
        <circle cx="39" cy="20" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M34 32 C34 27, 37 25, 39 25 C41 25, 44 27, 44 32"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="6" y1="40" x2="44" y2="40" stroke="currentColor" stroke-width="2" stroke-dasharray="4,3"/>
      </g>
    `,
    color: 'from-lime-400',
    colorTo: 'to-green-500',
    glowColor: 'rgba(163,230,53,0.35)',
    prompt: 'What does your ideal community look like? It could be a welcoming neighbourhood, active local involvement, strong neighbour bonds, or a place that reflects your values…',
    description: 'Where you live, your neighbourhood relationships, and how you participate in local community life.',
  },
  {
    id: 'social-spirituality',
    label: 'Social & Spirituality',
    emoji: '✨',
    svgIcon: `
      <g transform="translate(4,4)">
        <path d="M24 6 L27 17 L38 14 L29 22 L34 33 L24 27 L14 33 L19 22 L10 14 L21 17 Z"
          fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="10" cy="38" r="3" fill="currentColor" opacity="0.6"/>
        <circle cx="24" cy="42" r="3" fill="currentColor" opacity="0.6"/>
        <circle cx="38" cy="38" r="3" fill="currentColor" opacity="0.6"/>
        <line x1="10" y1="38" x2="24" y2="42" stroke="currentColor" stroke-width="1.5"/>
        <line x1="24" y1="42" x2="38" y2="38" stroke="currentColor" stroke-width="1.5"/>
      </g>
    `,
    color: 'from-pink-400',
    colorTo: 'to-rose-500',
    glowColor: 'rgba(244,114,182,0.35)',
    prompt: 'What do meaningful relationships and spiritual connection look like for you? It could be close friendships, faith practice, mindfulness, or a deep sense of purpose…',
    description: 'Meaningful friendships, faith, spirituality, and the connections that feed your soul and sense of belonging.',
  },
  {
    id: 'advocacy-engagement',
    label: 'Advocacy & Engagement',
    emoji: '📣',
    svgIcon: `
      <g transform="translate(4,4)">
        <path d="M10 18 L10 30 L18 30 L34 40 L34 8 L18 18 Z"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M10 18 L10 30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M37 16 C40 18, 40 30, 37 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M40 12 C45 16, 45 32, 40 36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 30 L14 38 L18 36 L18 30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
      </g>
    `,
    color: 'from-yellow-400',
    colorTo: 'to-amber-500',
    glowColor: 'rgba(251,191,36,0.35)',
    prompt: 'How do you want to advocate and engage? It could be speaking up for causes you believe in, joining organisations, volunteering, or empowering others in your community…',
    description: 'Speaking up for yourself and others, civic engagement, and contributing your voice to the world.',
  },
];
