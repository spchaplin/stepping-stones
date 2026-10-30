import { LifeDomain } from '../../src/apps/life-vision/types';

export const LIFE_DOMAINS: LifeDomain[] = [
  {
    id: 'daily-life-employment',
    label: 'My Day, My Work',
    iconPath: '/life-vision/icons/daily-life-employment.webp',
    prompt: 'What do I want to do with my days as an adult, including the job, career, or activities I would like to pursue?',
    description: 'Your daily routines, work life, career aspirations, and the activities that give each day meaning and purpose.',
  },
  {
    id: 'community-living',
    label: 'My Home & Neighbourhood',
    iconPath: '/life-vision/icons/community-living.webp',
    prompt: 'Where do I want to live, what do I want my home to be like, and who do I want around me?',
    description: 'Where you live, your neighbourhood relationships, and how you participate in local community life.',
  },
  {
    id: 'social-spirituality',
    label: 'My People & Passions',
    iconPath: '/life-vision/icons/social-spirituality.webp',
    prompt: 'How do I want to connect with friends, partners, spiritual or faith communities, and the activities I enjoy?',
    description: 'Meaningful friendships, faith, spirituality, and the connections that feed your soul and sense of belonging.',
  },
  {
    id: 'advocacy-engagement',
    label: 'My Role in the World',
    iconPath: '/life-vision/icons/advocacy-engagement.webp',
    prompt: 'How do I want to use my voice, make decisions, take responsibility, and play a valued part in my community?',
    description: 'Speaking up for yourself and others, civic engagement, and contributing your voice to the world.',
  },
  {
    id: 'healthy-living',
    label: 'My Health & Wellness',
    iconPath: '/life-vision/icons/healthy-living.webp',
    prompt: 'How will I care for my body and mind, build healthy routines, and get the health care support I need?',
    description: 'Physical wellbeing, nutrition, mental health, and daily wellness habits that fuel a good life.',
  },
  {
    id: 'safety-security',
    label: 'Feeling Safe & Secure',
    iconPath: '/life-vision/icons/safety-security.webp',
    prompt: 'How can I protect myself and my finances from harm and create a safe, secure adult life?',
    description: 'Living in a safe environment, financial stability, and emotional security — the foundation of peace of mind.',
  },
  {
    id: 'supports-for-family',
    label: 'Family Relationships',
    iconPath: '/life-vision/icons/supports-for-family.webp',
    prompt: 'How do I want my family to show up, stay connected, and be part of my adult life?',
    description: 'The relationships, care, and connection within family that provide love, belonging, and mutual support.',
  },
  {
    id: 'supports-and-services',
    label: 'My Support Network',
    iconPath: '/life-vision/icons/supports-and-services.webp',
    prompt: 'Who and what can support me to make choices, do the things I want, and live as independently as possible?',
    description: 'Access to formal and informal supports, services, and resources that help you live your best life.',
  },
];
