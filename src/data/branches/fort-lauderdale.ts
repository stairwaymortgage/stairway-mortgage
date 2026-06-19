/**
 * Fort Lauderdale branch data for CityHub.astro.
 * Source: rebuilt from old WP Elementor template `1-team-jim`.
 *
 * Compliance notes applied vs. the old page:
 *   - Branch NMLS #2813280 and NEXA NMLS removed from body → footer only.
 *   - Stat corrected to "$500M+" (locked) instead of old "$350M".
 *   - CTAs are team-oriented, never "Talk to Jim."
 *   - Founder NMLS #1072866 appears in body trust signals (3x via component).
 *
 * TESTIMONIAL PHOTOS: placeholder slots below. Replace each `photo` with a real
 * Pexels headshot saved to public/testimonials/{firstname-lastname}.jpg.
 * Do NOT guess Pexels IDs — leave the placeholder path until a real file exists.
 */
export const fortLauderdale = {
  city: 'Fort Lauderdale',
  state: 'FL',
  cityState: 'Fort Lauderdale, FL',

  title: 'Fort Lauderdale Mortgage Broker | Stairway Mortgage',
  metaDescription:
    'Stairway Mortgage in Fort Lauderdale specializes in complex lending — self-employed, investor, jumbo, condo, and foreign national borrowers across South Florida. Talk to our team today.',

  heroEyebrow: 'Fort Lauderdale Branch',
  heroHeadline: 'Fort Lauderdale mortgage lending for complex borrowers',
  heroLede:
    'Stairway Mortgage is the Fort Lauderdale home base for borrowers whose income or property does not fit a simple W-2 box. As both a direct lender and a licensed broker, our team has the lender access to solve the scenarios South Florida throws at you.',

  intro: [
    'Whether you are a first-time buyer in Flagler Village, a real estate investor scaling across Broward County, or a business owner who needs alternative income documentation, our Fort Lauderdale team has the expertise and lender access to get it done.',
    'South Florida\u2019s economy runs on entrepreneurs, investors, and globally mobile professionals \u2014 exactly the borrowers traditional lenders struggle with. We built this branch around those scenarios, not around the easy ones.',
    'With access to a network of 300+ wholesale lending partners, we can match a borrower to the right program instead of forcing every file through the same narrow guidelines.',
  ],

  specialties: [
    {
      iconKey: 'briefcase',
      title: 'Self-Employed & Business Owner Lending',
      body: 'Fort Lauderdale\u2019s entrepreneurial economy means many of our clients are self-employed. Bank statement programs use 12 or 24 months of deposits \u2014 no tax returns. P&L statement programs add even more flexibility.',
    },
    {
      iconKey: 'home',
      title: 'Real Estate Investor Financing',
      body: 'From single-family rentals in Oakland Park to multi-family in Progresso Village to vacation rentals near the beach. DSCR loans qualify on rental income \u2014 no personal income verification required.',
    },
    {
      iconKey: 'building',
      title: 'Condo Financing',
      body: 'Fort Lauderdale\u2019s condo market along the Intracoastal and beach corridors includes many non-warrantable buildings. Our 300+ lender network includes multiple non-warrantable condo specialists.',
    },
    {
      iconKey: 'money',
      title: 'Luxury & Jumbo Lending',
      body: 'Harbor Beach, Las Olas Isles, Rio Vista \u2014 jumbo and super-jumbo programs with as little as 10% down for qualified buyers.',
    },
    {
      iconKey: 'globe',
      title: 'Foreign National Programs',
      body: 'Programs with 25\u201330% down, no U.S. credit requirement, and closings in a personal name or through an LLC.',
    },
  ],

  neighborhoods: [
    'Flagler Village', 'Las Olas Isles', 'Rio Vista', 'Harbor Beach',
    'Oakland Park', 'Progresso Village', 'Victoria Park', 'Coral Ridge',
  ],

  testimonials: [
    {
      quote:
        'Jim and his team were great through the whole process \u2014 prompt replies, and they secured the best rate. We dropped a 30 to a 15, took cash out for a renovation, and consolidated our first and second mortgage into one.',
      name: 'Brian Robertson',
      meta: 'President, Circadia Group Inc. \u2014 New Jersey \u00B7 via Zillow',
      photo: '/testimonials/brian-robertson.jpg',
    },
    {
      quote:
        'This is the second loan I\u2019ve done with Jim and again they exceeded my expectations. This time a multi-family unit \u2014 best possible service, job done. I\u2019ll definitely recommend family and friends.',
      name: 'Syed Saqib',
      meta: 'Chief Investment Officer, Zstep Capital \u2014 Illinois \u00B7 via Google',
      photo: '/testimonials/syed-saqib.jpg',
    },
    {
      quote:
        'We closed our loan within 19 days \u2014 just in time for Thanksgiving. We initially went with a different office whose rate and down payment were ridiculous. We\u2019ve been referring the team to everyone we know ever since.',
      name: 'Elizabeth Torres',
      meta: 'Senior Branch Manager, JP Morgan Chase \u2014 Illinois \u00B7 via Facebook',
      photo: '/testimonials/elizabeth-torres.jpg',
    },
    {
      quote:
        'Run, don\u2019t walk. They helped us get financing when it seemed impossible \u2014 buying 2,000 miles away, in an extremely competitive market, while self-employed. They made sure financing wasn\u2019t a barrier to our dream house.',
      name: 'David Livermore',
      meta: 'Founder, Cultural Intelligence \u2014 California \u00B7 via Google',
      photo: '/testimonials/david-livermore.jpg',
    },
  ],

  faqs: [
    {
      q: 'Do I need tax returns to qualify in Fort Lauderdale?',
      a: 'Not necessarily. For self-employed and business-owner borrowers, bank statement programs qualify on 12 or 24 months of business or personal deposits, and P&L programs use a CPA-prepared profit-and-loss statement \u2014 no tax returns required.',
    },
    {
      q: 'Can you finance an investment property without verifying my income?',
      a: 'Yes. DSCR (debt-service coverage ratio) loans qualify based on the property\u2019s rental income rather than your personal income, which is ideal for investors scaling a portfolio across Broward County.',
    },
    {
      q: 'My condo building is non-warrantable. Can you still help?',
      a: 'Many Fort Lauderdale buildings along the Intracoastal and beach lose warrantable status. Our network of 300+ wholesale lenders includes multiple non-warrantable condo specialists, so we can usually find a program traditional lenders decline.',
    },
    {
      q: 'I\u2019m not a U.S. citizen. Can I buy property here?',
      a: 'Yes. Foreign national programs typically require 25\u201330% down, do not require U.S. credit history, and allow closing in your personal name or through an LLC.',
    },
    {
      q: 'How fast can you close?',
      a: 'Timelines vary by program and file, but past clients have closed in roughly 19 days when documentation is ready. We give you a realistic timeline up front rather than an optimistic one.',
    },
    {
      q: 'What areas does the Fort Lauderdale branch serve?',
      a: 'We work with borrowers throughout South Florida \u2014 from Flagler Village and Victoria Park to Oakland Park, Las Olas Isles, Harbor Beach, and the surrounding Broward County markets.',
    },
  ],
};
