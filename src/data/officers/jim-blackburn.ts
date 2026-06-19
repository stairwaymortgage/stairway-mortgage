/**
 * Jim Blackburn officer profile data for LoProfile.astro.
 * Source: rebuilt from old WP page `jim-blackburn-mortgage`.
 *
 * Compliance corrections vs. old page:
 *   - Stat $350M → $500M+ (locked defensible stat).
 *   - NEXA NMLS #1660690 removed from body → footer only (Footer.astro).
 *   - Jim's individual NMLS #1072866 retained in body (founder/story context).
 *
 * TESTIMONIAL PHOTOS: placeholder slots. Replace each `photo` with a real Pexels
 * headshot at public/testimonials/{firstname-lastname}.jpg. Do NOT guess Pexels IDs.
 */
export const jimBlackburn = {
  name: 'Jim Blackburn',
  nmls: '1072866',
  slug: 'jim-blackburn',
  role: 'Founder & Originating Branch Manager',

  title: 'Jim Blackburn Mortgage Broker & Lender | Fort Lauderdale | Nationwide',
  metaDescription:
    'Jim Blackburn (NMLS #1072866) is a Scotsman Guide Top Producer and Fort Lauderdale mortgage broker & direct lender specializing in complex, non-QM, and investor lending.',
  canonical: '/jim-blackburn-mortgage/',

  heroEyebrow: 'Mortgage Broker & Direct Lender',
  heroHeadline: 'Jim Blackburn — built for the loans others decline',
  heroLede:
    'A Scotsman Guide Top Producer with deep specialization in the complex lending scenarios most mortgage professionals never develop. As both a direct lender and a licensed broker with access to 300+ wholesale partners, Jim gives clients more options, better-fit programs, and faster closings.',

  stats: [
    { value: '$500M+', label: 'Personally closed loan volume' },
    { value: '7 yrs', label: 'Scotsman Guide Top Producer' },
    { value: '20+ yrs', label: 'Banking & finance' },
    { value: '300+', label: 'Wholesale lending partners' },
  ],

  bio: [
    'Jim Blackburn is the founder and Originating Branch Manager of Stairway Mortgage. He operates as both a direct lender and a licensed mortgage broker, a dual model that gives his clients more options, better-fit programs, and faster closings.',
    'Jim built Stairway Mortgage on a simple but powerful belief: your home is more than shelter \u2014 it is a wealth engine waiting to be activated through faithful stewardship. With over two decades of mortgage expertise, he is the author of eight faith-based real estate playbooks spanning every stage of the journey, from Smart Stewards (ages 16\u201325) to Legacy Angels (ultra-high-net-worth estate planning).',
    'He created the Certified Stairway Advisor (CSA) designation to train loan officers in his methodology \u2014 one that prioritizes long-term wealth-building over commission-chasing and views every transaction through the lens of generational impact. His mission is clear: help families leverage wisely, grow wealthy, and create legacies that outlive their bank accounts.',
  ],

  specialties: [
    {
      iconKey: 'briefcase',
      title: 'Self-Employed & Business Owner Lending',
      body: 'Bank statement programs using 12 or 24 months of deposits \u2014 no tax returns required. P&L statement programs also available for maximum flexibility.',
    },
    {
      iconKey: 'home',
      title: 'Real Estate Investor Financing',
      body: 'DSCR loans that qualify on rental income, not personal income \u2014 no W-2s, no tax returns.',
      bullets: [
        'Fix-and-flip bridge loans',
        'Short-term rental / Airbnb financing',
        'Multi-family (2\u20134 and 5+ units)',
        'Portfolio loans for 10+ financed properties',
      ],
    },
    {
      iconKey: 'gem',
      title: 'High-Net-Worth & Asset-Based Lending',
      body: 'Asset depletion and asset-based programs for retirees, trust beneficiaries, recently-sold business owners, and executives between roles.',
    },
    {
      iconKey: 'key',
      title: 'Non-QM Mortgage Solutions',
      body: 'Alternative-documentation programs for borrowers traditional lenders decline.',
      bullets: [
        'Recent credit events with shorter waiting periods',
        'Interest-only payment options',
        'Foreign national programs',
        'Jumbo / super-jumbo with alternative documentation',
        'Mixed-use property financing',
      ],
    },
    {
      iconKey: 'building',
      title: 'Conventional, FHA, VA & Government Loans',
      body: 'Full spectrum of residential mortgage products with rate shopping across 300+ lenders.',
    },
  ],

  localExpertise: {
    heading: 'Fort Lauderdale\u2019s mortgage specialist',
    intro:
      'From the waterfront estates of Las Olas Isles and Harbor Beach to the emerging investor market in Flagler Village, Jim understands the lending challenges specific to Broward County \u2014 non-warrantable condos, flood-zone requirements, foreign national buyers, and property types national lenders routinely decline.',
    bullets: [
      { label: 'Condo financing', body: 'Navigation of non-warrantable buildings, post-Surfside structural requirements, and condo-questionnaire challenges that block most lenders.' },
      { label: 'Waterfront & luxury', body: 'Jumbo and super-jumbo programs for properties requiring alternative documentation and specialized appraisal processes.' },
      { label: 'International buyers', body: 'Foreign national programs, ITIN lending, and cross-border income documentation for Fort Lauderdale\u2019s international buyer population.' },
      { label: 'Investor market knowledge', body: 'DSCR underwriting calibrated to Fort Lauderdale rental yields, short-term rental financing, and multi-family investment strategies.' },
    ],
  },

  process: [
    { step: '01', title: 'Discovery Call', body: 'A deep review of your financial picture \u2014 income, assets, debts, credit profile, property goals, and timeline. Not a surface-level pre-qualification, but a real analysis to identify the best path forward.' },
    { step: '02', title: 'Scenario Pricing', body: 'Your file is submitted to multiple wholesale lenders simultaneously. Rates, terms, and program features are compared across 300+ partners and presented as options \u2014 not a single take-it-or-leave-it offer.' },
    { step: '03', title: 'Lock & Submit', body: 'Once you choose the best option, your rate is locked and the file goes to underwriting. Conditions are managed proactively \u2014 you know what\u2019s needed before the underwriter asks.' },
    { step: '04', title: 'Clear to Close', body: 'The team coordinates with the title company, appraiser, insurance agent, and real estate attorneys so nothing falls through the cracks. One point of contact who knows your file inside and out.' },
    { step: '05', title: 'Beyond the Close', body: 'Your relationship doesn\u2019t end at the closing table \u2014 annual mortgage reviews, refinance monitoring, and guidance for your next step on the Stairway Journey.' },
  ],

  credentials: [
    { title: 'CFP coursework', body: 'A wealth-management perspective most originators lack.' },
    { title: '20+ years banking & finance', body: 'Underwriting, risk assessment, and financial planning.' },
    { title: 'Scotsman Guide Top Producer', body: '7 consecutive years among the nation\u2019s top originators.' },
    { title: 'Author & educator', body: 'Creator of the Stairway wealth-building framework.' },
  ],

  testimonials: [
    {
      quote: 'We had a difficult jumbo loan scenario most lenders couldn\u2019t close. Jim\u2019s team not only closed our refinance \u2014 now we can pursue our dream home in the Florida Keys. We\u2019ll use them again.',
      name: 'Chad Brocato',
      meta: 'Public Speaker & Retired Fire Chief \u2014 Florida \u00B7 via Google',
      photo: '/testimonials/chad-brocato.jpg',
    },
    {
      quote: 'I\u2019m an RE investor with tons of properties, living in China with unique income \u2014 he made it work. He even called me at 1 AM to close a deal. Now on our third deal together.',
      name: 'Dennis Nikolaev',
      meta: 'Real Estate Investor \u00B7 via Facebook',
      photo: '/testimonials/dennis-nikolaev.jpg',
    },
    {
      quote: 'We closed within 19 days \u2014 just in time for Thanksgiving. We\u2019d started with a different office whose rate and down payment were ridiculous. We\u2019ve been referring the team ever since.',
      name: 'Elizabeth Torres',
      meta: 'Senior Branch Manager, JP Morgan Chase \u2014 Illinois \u00B7 via Facebook',
      photo: '/testimonials/elizabeth-torres.jpg',
    },
    {
      quote: 'Run, don\u2019t walk. They helped us get financing when it seemed impossible \u2014 buying 2,000 miles away, in a competitive market, while self-employed. They made sure financing wasn\u2019t a barrier.',
      name: 'David Livermore',
      meta: 'Founder, Cultural Intelligence \u2014 California \u00B7 via Google',
      photo: '/testimonials/david-livermore.jpg',
    },
  ],

  faqs: [
    { q: 'What is Jim Blackburn\u2019s NMLS number?', a: 'NMLS #1072866. You can verify at nmlsconsumeraccess.org.' },
    { q: 'Is Jim a mortgage broker or a direct lender?', a: 'Both. Jim operates as a direct lender and a licensed broker with access to 300+ wholesale partners.' },
    { q: 'What types of loans does Jim specialize in?', a: 'Bank statement loans, DSCR investor loans, asset-based lending, non-QM, jumbo, and foreign national programs, plus conventional, FHA, and VA.' },
    { q: 'How do I get pre-approved?', a: 'Call (954) 993-1625 or apply online. The consultation is free, with no obligation.' },
    { q: 'Are there broker fees?', a: 'Compensation varies by program and is disclosed transparently upfront. In many cases, broker compensation is paid by the wholesale lender.' },
    { q: 'Does Jim work with real estate investors?', a: 'Yes \u2014 investor lending is a core focus: DSCR loans that qualify on rental income (no tax returns or W-2s), fix-and-flip bridge loans, short-term rental financing, multi-family programs, and portfolio loans for 10+ financed properties.' },
    { q: 'Can you help if I\u2019ve been turned down by another lender?', a: 'This is one of the most common reasons borrowers reach out. With 300+ wholesale lenders and deep non-QM expertise, there is frequently a path forward when banks and single-channel lenders cannot help \u2014 recent credit events, self-employment income, non-warrantable condos, and foreign national status are all handled routinely.' },
  ],
};
