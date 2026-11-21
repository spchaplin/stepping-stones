import { WarriorAccountEntry, WarriorId } from '../types';

export const MAX_ARMY_SIZE = 4;
export const MAX_WARRIOR_NOTE_LENGTH = 300;
export const MAX_CAMPAIGN_NOTE_LENGTH = 1500;

export const CODEX_ENTRIES: WarriorAccountEntry[] = [
  {
    id: 'hsa',
    rank: 100,
    cardImageUrl: '/commander/warriors/card-size/compressed_tri-shield-healer--hsa.png',
    fullImageUrl: '/commander/warriors/full-size/tri-shield-healer--hsa.png',
    filters: ['all', 'tax-free', 'specialized'],
    element: {
      name: 'Jade Light',
      accentHex: '#10B981',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/35',
      activeBorderClass: 'border-emerald-400',
      surfaceTint: 'radial-gradient(circle at 50% 42%, rgba(16, 185, 129, 0.22), rgba(15, 23, 42, 0.92) 72%)',
      glowShadow: '0 0 28px rgba(16, 185, 129, 0.20)',
    },
    warrior: {
      name: 'The Tri-Shield Healer',
      concept:
        'A legendary battle-medic clad in radiant, triple-layered armor. While most warriors take damage at the start, middle, or end of a campaign, the Tri-Shield Healer deflects all three.',
      superpowerTitle: 'The Triple-Ward Shield',
      superpowerDetail: 'Deflects physical, chemical, and hallucinogenic attacks.',
      specialSkills: [
        {
          title: 'Elder’s Awakening',
          description: 'Once the medic reaches Level 65, he gains attack ability.',
        },
        {
          title: 'Time Travel',
          description: 'Can attack players in the past to destroy them in the future.',
        },
      ],
      limitations: [
        {
          title: 'Healer’s Oath',
          description: 'Can only heal in his youth, not attack.',
        },
        {
          title: 'Heavy Armor Requirement',
          description: 'Armor can only be bought by fording the treacherous Jade river.',
        },
      ],
    },
    account: {
      name: 'HSA (Health Savings Account)',
      shortName: 'HSA',
      superpower:
        'Triple-tax shield. Contributions lower your current taxable income, investments grow tax-free, and withdrawals for qualified medical expenses are completely tax-free.',
      specialSkills: [
        {
          title: 'No expiration timer',
          description:
            'There is no time limit on when you can reimburse yourself for past medical expenses, allowing your money to stay invested for decades.',
        },
        {
          title: 'Level 65 unlock',
          description:
            'Once you turn 65, you can withdraw money for any reason without a penalty (you only pay regular income tax on non-medical spending).',
        },
        {
          title: 'Portability',
          description: 'The account belongs to you forever, even if you change jobs or health plans.',
        },
      ],
      limitations: [
        {
          title: 'High-Deductible Health Plan required',
          description:
            'You must be enrolled in an eligible High-Deductible Health Plan (HDHP) to add money, which means higher out-of-pocket medical costs up front.',
        },
        {
          title: 'Strict yearly contribution caps',
          description: 'Strict yearly contribution caps apply ($4,400 for individuals in 2026).',
        },
        {
          title: 'Early non-medical penalty',
          description:
            'Spending on non-medical items before age 65 triggers income taxes plus a steep 20% penalty.',
        },
      ],
      taxTiming: 'triple-tax-free',
      taxTimingLabel: 'Triple-Tax Shield',
      accessType: 'specialized',
      accessLabel: 'Requires HDHP',
      contributionCap2026: '$4,400',
      goalFocus: 'Healthcare & long-term wealth',
    },
  },
  {
    id: 'roth-401k',
    rank: 95,
    cardImageUrl: '/commander/warriors/card-size/compressed_crimson-phoenix--roth-401k.png',
    fullImageUrl: '/commander/warriors/full-size/crimson-phoenix--roth-401k.png',
    filters: ['all', 'tax-free'],
    element: {
      name: 'Crimson Flame',
      accentHex: '#EF4444',
      textClass: 'text-rose-400',
      borderClass: 'border-rose-500/35',
      activeBorderClass: 'border-rose-400',
      surfaceTint: 'radial-gradient(circle at 50% 42%, rgba(239, 68, 68, 0.22), rgba(15, 23, 42, 0.92) 72%)',
      glowShadow: '0 0 28px rgba(239, 68, 68, 0.20)',
    },
    warrior: {
      name: 'The Crimson Phoenix',
      concept:
        'A heavy-armored knight belonging to the Order of the Roth. He pays a heavy toll to forge his weapons, which grant him complete immunity to dragons later.',
      superpowerTitle: 'Dragon Immunity',
      superpowerDetail: 'No health, achievements, or booty can ever be lost to dragons.',
      specialSkills: [
        {
          title: 'Guild Patronage',
          description: 'His local Guild automatically summons allied mercenaries to fight alongside him for free.',
        },
        {
          title: 'Heavy Arsenal',
          description: 'Can carry massive amounts of gold into battle each year—far more than their lighter Rogue counterpart.',
        },
      ],
      limitations: [
        {
          title: 'Guild-Locked',
          description: 'Can only be recruited if his local guild offers a barracks for him.',
        },
        {
          title: 'Upfront Toll',
          description: 'Weapons may only be forged with payment of radiant opal.',
        },
      ],
    },
    account: {
      name: 'Roth 401k',
      shortName: 'Roth 401k',
      superpower:
        'Tax-free retirement wealth. Your investments grow completely tax-free, and every dollar you pull out in retirement is 100% tax-free.',
      specialSkills: [
        {
          title: 'Free ally loot',
          description: 'Employers often match a portion of your contributions, giving you instant free money.',
        },
        {
          title: 'High capacity',
          description: 'You can contribute significantly more each year ($24,500 in 2026) than you can to an IRA.',
        },
        {
          title: 'No RMD penalties',
          description:
            'Unlike traditional workplace plans, you are never forced to withdraw money at a certain age during your lifetime.',
        },
        {
          title: 'No wealth cap',
          description: 'Unlike a Roth IRA, there are no income limits that block high earners from contributing.',
        },
      ],
      limitations: [
        {
          title: 'Employer availability required',
          description: 'You can only access this account if your employer offers it.',
        },
        {
          title: 'Taxes paid up front',
          description: 'You must pay income taxes up front before the money goes in.',
        },
        {
          title: 'Employer fund menu',
          description: 'Investment choices are restricted to the specific menu of funds your employer selects.',
        },
      ],
      taxTiming: 'tax-free-exit',
      taxTimingLabel: 'Tax-Free Exit',
      accessType: 'employer',
      accessLabel: 'Employer Plan',
      contributionCap2026: '$24,500',
      goalFocus: 'High-capacity retirement',
    },
  },
  {
    id: 'roth-ira',
    rank: 90,
    cardImageUrl: '/commander/warriors/card-size/compressed_emerald-shadow--roth-ira.png',
    fullImageUrl: '/commander/warriors/full-size/emerald-shadow--roth-ira.png',
    filters: ['all', 'tax-free'],
    element: {
      name: 'Emerald Shadow',
      accentHex: '#14B8A6',
      textClass: 'text-teal-400',
      borderClass: 'border-teal-500/35',
      activeBorderClass: 'border-teal-400',
      surfaceTint: 'radial-gradient(circle at 50% 42%, rgba(20, 184, 166, 0.22), rgba(15, 23, 42, 0.92) 72%)',
      glowShadow: '0 0 28px rgba(20, 184, 166, 0.20)',
    },
    warrior: {
      name: 'The Shadow Rogue',
      concept:
        'A nimble, independent operative from the same Order of the Roth as the Crimson Phoenix. While he cannot carry as much heavy treasure into battle, he owns no allegiance beyond his ages-past commission in the king’s army. He belongs to no Guild and can slip out of danger at a moment’s notice.',
      superpowerTitle: 'Free Agent',
      superpowerDetail: 'After breaking from the king’s ranks, he pays no dues and follows no orders.',
      specialSkills: [
        {
          title: 'Royal Pilfering',
          description:
            'His knowledge of the royal fortress allows him to plunder the king’s treasure, even before he gains the ability to morph at Level 59.5.',
        },
        {
          title: 'Solo Operative',
          description: 'Requires no Guild sponsorship; any adventurer with earned gold can hire him.',
        },
      ],
      limitations: [
        {
          title: 'Light Pack',
          description: 'Restricted to carrying a modest cap of gold per year ($7,500).',
        },
        {
          title: 'Upfront Toll',
          description: 'Can only be hired by precious sapphire mined in one’s youth.',
        },
      ],
    },
    account: {
      name: 'Roth IRA',
      shortName: 'Roth IRA',
      superpower: 'Tax-free growth and tax-free retirement withdrawals on a solo account you control completely.',
      specialSkills: [
        {
          title: 'Emergency escape hatch',
          description:
            'You can withdraw your original contributions (the exact money you put in) at any time, for any reason, with zero taxes or penalties.',
        },
        {
          title: 'Total freedom',
          description: 'You can open this at almost any brokerage and invest in nearly any stock, ETF, or index fund.',
        },
        {
          title: 'No forced withdrawals',
          description: 'Your money can stay invested and grow tax-free for your entire life.',
        },
      ],
      limitations: [
        {
          title: 'Earned income required',
          description: 'You must have earned income (from a job) to contribute.',
        },
        {
          title: 'Modest annual limit',
          description: 'Strict annual contribution limits apply ($7,500 per year in 2026).',
        },
        {
          title: 'High-earner phaseout',
          description: 'High earners are blocked from contributing directly once their income passes a certain threshold.',
        },
        {
          title: 'Early earnings penalty',
          description: 'Withdrawing investment earnings before age 59½ generally triggers taxes and a 10% penalty.',
        },
      ],
      taxTiming: 'tax-free-exit',
      taxTimingLabel: 'Tax-Free Exit',
      accessType: 'individual',
      accessLabel: 'Solo Account',
      contributionCap2026: '$7,500',
      goalFocus: 'Flexible solo retirement',
    },
  },
  {
    id: '529-plan',
    rank: 85,
    cardImageUrl: '/commander/warriors/card-size/compressed_attack-advisor--529.png',
    fullImageUrl: '/commander/warriors/full-size/attack-advisor--529.png',
    filters: ['all', 'tax-free', 'specialized'],
    element: {
      name: 'Arcane Violet',
      accentHex: '#8B5CF6',
      textClass: 'text-violet-400',
      borderClass: 'border-violet-500/35',
      activeBorderClass: 'border-violet-400',
      surfaceTint: 'radial-gradient(circle at 50% 42%, rgba(139, 92, 246, 0.24), rgba(15, 23, 42, 0.92) 72%)',
      glowShadow: '0 0 28px rgba(139, 92, 246, 0.20)',
    },
    warrior: {
      name: 'Attack Advisor',
      concept: 'A shrewd counselor who plans the king’s attacks and advises his campaigns.',
      superpowerTitle: 'Academy Protection',
      superpowerDetail: 'The advisor cannot be attacked from within the safety of the Royal Academy.',
      specialSkills: [
        {
          title: 'Transmutation',
          description:
            'Can bestow the academy endowment upon the Shadow Rogue or other warrior seeking a better life experience.',
        },
        {
          title: 'Scholarship Transfer',
          description:
            'If one of his students finishes their training early, he can reassign the student’s scholarship to another warrior.',
        },
        {
          title: 'Regional Blessing',
          description: 'Blesses warriors from his home region with springtime gifts.',
        },
      ],
      limitations: [
        {
          title: 'Scholar’s Vow',
          description: 'He is strictly confined to the Royal Academies.',
        },
      ],
    },
    account: {
      name: '529 Plan',
      shortName: '529 Plan',
      superpower: 'Tax-free growth and tax-free withdrawals at the federal level when used for qualified education expenses.',
      specialSkills: [
        {
          title: 'State tax buffs',
          description: 'Over 30 states offer state income tax deductions or credits just for putting money in.',
        },
        {
          title: 'Broad target range',
          description:
            'Funds aren’t just for four-year colleges; they cover trade schools, apprenticeships, student loan payments (up to $10,000), and K–12 tuition.',
        },
        {
          title: 'Shape-shifting',
          description:
            'You can change the beneficiary to another family member anytime, or roll up to $35,000 of unused funds into the beneficiary’s Roth IRA.',
        },
      ],
      limitations: [
        {
          title: 'Non-education penalty',
          description:
            'Using the money for non-education expenses triggers income taxes plus a 10% penalty on the investment earnings.',
        },
        {
          title: 'State portfolio menu',
          description:
            'Investment choices are limited to the specific portfolios offered by the state plan you choose, though brokerages like Fidelity and Vanguard offer state plans with additional options.',
        },
      ],
      taxTiming: 'tax-free-exit',
      taxTimingLabel: 'Tax-Free Exit',
      accessType: 'specialized',
      accessLabel: 'Education Focus',
      contributionCap2026: 'State limits (varies)',
      goalFocus: 'College, trade school & training',
    },
  },
  {
    id: 'able',
    rank: 85,
    cardImageUrl: '/commander/warriors/card-size/compressed_nimble-ranger--able.png',
    fullImageUrl: '/commander/warriors/full-size/nimble-ranger--able.png',
    filters: ['all', 'tax-free', 'specialized'],
    element: {
      name: 'Verdant Earth',
      accentHex: '#22C55E',
      textClass: 'text-green-400',
      borderClass: 'border-green-500/35',
      activeBorderClass: 'border-green-400',
      surfaceTint: 'radial-gradient(circle at 50% 42%, rgba(34, 197, 94, 0.22), rgba(15, 23, 42, 0.92) 72%)',
      glowShadow: '0 0 28px rgba(34, 197, 94, 0.20)',
    },
    warrior: {
      name: 'The Nimble Ranger',
      concept:
        'A swift pathfinder built for autonomy and survival in rugged terrain. Supplies warriors who would have to wait months for the king’s official convoy, and is free to provide bounty for living well right now without losing her stipend and blessing from the king.',
      superpowerTitle: 'Stealth Supply Line',
      superpowerDetail: 'Keeps gold out of convoy ambush attacks so the army never loses essential rations.',
      specialSkills: [
        {
          title: 'King’s Blessing',
          description: 'Owes no tax to the king on gold withdrawn from the official supply chest.',
        },
        {
          title: 'Pathfinder’s Versatility',
          description: 'Helps the troops obtain any item or help that improves quality of life.',
        },
        {
          title: 'High Cap & Heavy Quiver',
          description: 'The king allows her to store up ample supply each year, which can be used freely at any age.',
        },
      ],
      limitations: [
        {
          title: 'Final Tribute',
          description: 'When the ranger falls at the end of the game, the king takes back any booty gained through war.',
        },
        {
          title: 'King’s Approval',
          description: 'Only warriors approved by the king may receive help from the ranger.',
        },
      ],
    },
    account: {
      name: 'ABLE Account',
      shortName: 'ABLE',
      superpower:
        'Benefit shield. Allows individuals with disabilities to save and invest large sums without losing eligibility for vital government benefits like Medicaid and SSI.',
      specialSkills: [
        {
          title: 'Roth-style growth',
          description: 'Investments grow tax-free, and withdrawals for qualified expenses are completely tax-free.',
        },
        {
          title: 'Broad spending power',
          description:
            'Funds can be used at any age for almost anything that improves health, independence, or quality of life (housing, transportation, education, assistive tech, basic living).',
        },
        {
          title: 'High limits',
          description:
            'Standard contributions go up to the annual gift tax exclusion ($20,000 in 2026), and employed account owners can contribute even more.',
        },
      ],
      limitations: [
        {
          title: 'Strict eligibility',
          description: 'You must have a qualifying disability that began before age 46 (expanded from age 26 in 2026).',
        },
        {
          title: 'SSI cap ($100,000)',
          description:
            'If the account balance goes over $100,000, SSI monthly cash payments are suspended until the balance drops back below that line (though Medicaid continues).',
        },
        {
          title: 'Medicaid payback',
          description:
            'Upon the account owner’s death, the state can claim remaining funds to reimburse Medicaid costs paid on their behalf before heirs receive anything.',
        },
      ],
      taxTiming: 'tax-free-exit',
      taxTimingLabel: 'Tax-Free Exit',
      accessType: 'specialized',
      accessLabel: 'Disability Eligibility',
      contributionCap2026: '$20,000+',
      goalFocus: 'Independence & benefit protection',
    },
  },
  {
    id: 'traditional-401k',
    rank: 80,
    cardImageUrl: '/commander/warriors/card-size/compressed_electric-storm--traditional%20401k.png',
    fullImageUrl: '/commander/warriors/full-size/electric-storm--traditional%20401k.png',
    filters: ['all', 'pre-tax'],
    element: {
      name: 'Storm Cobalt',
      accentHex: '#0EA5E9',
      textClass: 'text-sky-400',
      borderClass: 'border-sky-500/35',
      activeBorderClass: 'border-sky-400',
      surfaceTint: 'radial-gradient(circle at 50% 42%, rgba(14, 165, 233, 0.22), rgba(15, 23, 42, 0.92) 72%)',
      glowShadow: '0 0 28px rgba(14, 165, 233, 0.20)',
    },
    warrior: {
      name: 'The Electric Storm',
      concept:
        'A frontliner who enters battle with a powered-up shield that deflects early enemy strikes, though his defenses later fizzle.',
      superpowerTitle: 'Electrified Shield',
      superpowerDetail: 'Projects a massive energy barrier at the start of battle that blocks attacks and knocks down enemies.',
      specialSkills: [
        {
          title: 'Ally Reinforcements',
          description: 'Guild leaders endow his rare shield with extra power.',
        },
        {
          title: 'Colossal War Chest',
          description: 'Carries massive gold into battle each year, dwarfing the carrying capacity of lone wandering warriors.',
        },
        {
          title: 'Unbound Prestige',
          description: 'Welcomes even the wealthiest lords to his forces without turning them away.',
        },
      ],
      limitations: [
        {
          title: 'Guild Exclusive',
          description: 'Can only be summoned if your commanding lord grants access to his barracks.',
        },
        {
          title: 'Power Drain',
          description: 'His shield loses all its power and becomes a heavy liability to carry.',
        },
        {
          title: 'Desertion Curse',
          description: 'Attempting to discharge before level 59½ destroys his health.',
        },
        {
          title: 'Escaped Electric',
          description: 'Once he hits level 73, he can no longer restrain his voltage and it flashes out of control.',
        },
      ],
    },
    account: {
      name: 'Traditional 401k',
      shortName: 'Traditional 401k',
      superpower:
        'Immediate, powered tax shield. Contributions are taken directly from your paycheck before taxes, lowering your taxable income right now while your investments grow tax-deferred.',
      specialSkills: [
        {
          title: 'Free ally loot',
          description: 'Employers often match a percentage of your contributions, giving you free money.',
        },
        {
          title: 'High capacity',
          description: 'You can stash away much more each year ($24,500 as of 2026) than you can in an IRA.',
        },
        {
          title: 'No wealth cap',
          description:
            'Unlike a Traditional IRA, high earners are never blocked from making pre-tax contributions, regardless of how much they make.',
        },
      ],
      limitations: [
        {
          title: 'Employer availability required',
          description: 'You can only access this account if your employer offers it.',
        },
        {
          title: 'Delayed tax bill',
          description:
            'Every dollar you withdraw in retirement—both your original contributions and your investment growth—is taxed as regular income.',
        },
        {
          title: 'Early exit penalty',
          description: 'Taking money out before age 59½ generally triggers income taxes plus a 10% penalty.',
        },
        {
          title: 'Forced loot drops (RMDs)',
          description: 'Once you reach age 73, the government forces you to take Required Minimum Distributions (RMDs) every year.',
        },
        {
          title: 'Employer fund menu',
          description: 'Investment choices are restricted to the specific menu of funds your employer selects.',
        },
      ],
      taxTiming: 'pre-tax-deferred',
      taxTimingLabel: 'Upfront Tax Shield',
      accessType: 'employer',
      accessLabel: 'Employer Plan',
      contributionCap2026: '$24,500',
      goalFocus: 'Pre-tax workplace retirement',
    },
  },
  {
    id: 'traditional-ira',
    rank: 75,
    cardImageUrl: '/commander/warriors/card-size/compressed_dawnbreaker--traditional-ira.png',
    fullImageUrl: '/commander/warriors/full-size/dawnbreaker--traditional-ira.png',
    filters: ['all', 'pre-tax'],
    element: {
      name: 'Dawn Amber',
      accentHex: '#F59E0B',
      textClass: 'text-amber-400',
      borderClass: 'border-amber-500/35',
      activeBorderClass: 'border-amber-400',
      surfaceTint: 'radial-gradient(circle at 50% 42%, rgba(245, 158, 11, 0.22), rgba(15, 23, 42, 0.92) 72%)',
      glowShadow: '0 0 28px rgba(245, 158, 11, 0.20)',
    },
    warrior: {
      name: 'The Dawnbreaker',
      concept:
        'A fierce frontline fighter who quickly destroys enemy fighters at the start of battle, but lacks endurance and sustains heavy injuries as the battle progresses.',
      superpowerTitle: 'Instant Fury',
      superpowerDetail: 'Wipes out entire sections of the attacking armies at the outset of a battle.',
      specialSkills: [
        {
          title: 'Special Quests',
          description: 'Skilled at carrying out special quests without taking any damage.',
        },
      ],
      limitations: [
        {
          title: 'The Final Reckoning',
          description: 'Mid to late battle, his strength melts and he endangers himself and the king’s army.',
        },
        {
          title: 'Forced March',
          description:
            'Game rules force this warrior to march out and spend his gold to fortify the king’s troops whether there is a need or not.',
        },
      ],
    },
    account: {
      name: 'Traditional IRA',
      shortName: 'Traditional IRA',
      superpower:
        'Up-front tax shield. Contributions can be deducted from your current year’s taxable income, lowering your tax bill right now.',
      specialSkills: [
        {
          title: 'Special quest exemptions',
          description:
            'You can withdraw money early without the standard 10% penalty for specific milestones, such as buying your first home (up to $10,000), paying for higher education, or covering major medical hardships.',
        },
        {
          title: 'Universal access',
          description: 'Anyone with earned income can open and contribute to one, regardless of how much money they make.',
        },
      ],
      limitations: [
        {
          title: 'Taxed in retirement',
          description: 'All withdrawals in retirement are taxed as ordinary income.',
        },
        {
          title: 'Forced loot drops (RMDs)',
          description:
            'Once you reach age 73, the government forces you to take Required Minimum Distributions (RMDs) every year, whether you need the cash or not.',
        },
        {
          title: 'Deduction income limits',
          description:
            'If you (or your spouse) have a retirement plan at work and earn above a certain amount, you lose the ability to deduct your contributions on your taxes.',
        },
      ],
      taxTiming: 'pre-tax-deferred',
      taxTimingLabel: 'Upfront Tax Shield',
      accessType: 'individual',
      accessLabel: 'Solo Account',
      contributionCap2026: '$7,500',
      goalFocus: 'Pre-tax solo retirement & milestones',
    },
  },
];

export const CODEX_BY_ID: Record<WarriorId, WarriorAccountEntry> = CODEX_ENTRIES.reduce(
  (acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  },
  {} as Record<WarriorId, WarriorAccountEntry>,
);

export function isValidWarriorId(value: string): value is WarriorId {
  return value in CODEX_BY_ID;
}
