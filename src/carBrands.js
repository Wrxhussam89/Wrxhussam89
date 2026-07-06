export const carBrands = [
  {
    name: 'Tesla',
    models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
    svg: `<svg viewBox="0 0 100 100"><path d="M50 10 L50 90 M30 25 Q50 5 70 25 M20 20 L80 20" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'BYD',
    models: ['Atto 3', 'Dolphin', 'Seal', 'Han', 'Tang', 'Song Plus'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="32" fill="currentColor">BYD</text></svg>`,
  },
  {
    name: 'BMW',
    models: ['iX', 'iX3', 'i4', 'i5', 'i7', 'iX1', 'iX2'],
    svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="4"/><line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="3"/><line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" stroke-width="3"/><text x="50" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="14" fill="currentColor">BMW</text></svg>`,
  },
  {
    name: 'Mercedes-Benz',
    models: ['EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'EQS SUV', 'EQV'],
    svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="4"/><path d="M50 8 L50 50 M50 50 L17 78 M50 50 L83 78" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'Hyundai',
    models: ['Ioniq 5', 'Ioniq 6', 'Kona Electric', 'Ioniq 5 N'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="44" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="15" fill="currentColor">HYUNDAI</text><ellipse cx="50" cy="30" rx="40" ry="22" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
  },
  {
    name: 'Kia',
    models: ['EV6', 'EV9', 'Niro EV', 'Soul EV'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="34" fill="currentColor" letter-spacing="2">KIA</text></svg>`,
  },
  {
    name: 'Nissan',
    models: ['Leaf', 'Ariya'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="18" fill="currentColor" letter-spacing="3">NISSAN</text><line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="2"/></svg>`,
  },
  {
    name: 'Volkswagen',
    models: ['ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID.Buzz'],
    svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="4"/><text x="50" y="60" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="36" fill="currentColor">VW</text></svg>`,
  },
  {
    name: 'Audi',
    models: ['e-tron', 'e-tron GT', 'Q4 e-tron', 'Q8 e-tron'],
    svg: `<svg viewBox="0 0 120 50"><circle cx="22" cy="25" r="14" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="42" cy="25" r="14" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="62" cy="25" r="14" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="82" cy="25" r="14" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
  },
  {
    name: 'Volvo',
    models: ['XC40 Recharge', 'C40 Recharge', 'EX30', 'EX90'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="20" fill="currentColor" letter-spacing="2">VOLVO</text><line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="2"/></svg>`,
  },
  {
    name: 'Polestar',
    models: ['Polestar 2', 'Polestar 3', 'Polestar 4'],
    svg: `<svg viewBox="0 0 100 100"><path d="M50 15 L50 50 M50 50 L30 85 M50 50 L70 85 M50 50 L15 35 M50 50 L85 35" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'MG',
    models: ['MG4', 'ZS EV', 'Marvel R', 'MG5 EV'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="44" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="36" fill="currentColor">MG</text></svg>`,
  },
  {
    name: 'Chery',
    models: ['eQ1', 'eQ5', 'eQ7', 'Tiggo 8 Pro e+', 'iCar'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="18" fill="currentColor" letter-spacing="2">CHERY</text></svg>`,
  },
  {
    name: 'Toyota',
    models: ['bZ4X', 'RAV4 Prime', 'Prius Prime'],
    svg: `<svg viewBox="0 0 100 80"><ellipse cx="50" cy="40" rx="42" ry="30" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="50" cy="35" rx="24" ry="16" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="50" cy="40" rx="8" ry="25" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
  },
  {
    name: 'Porsche',
    models: ['Taycan', 'Taycan Cross Turismo', 'Macan Electric'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="14" fill="currentColor" letter-spacing="3">PORSCHE</text><line x1="8" y1="48" x2="92" y2="48" stroke="currentColor" stroke-width="2"/></svg>`,
  },
  {
    name: 'Jaguar',
    models: ['I-PACE'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="16" fill="currentColor" letter-spacing="2">JAGUAR</text></svg>`,
  },
  {
    name: 'Lexus',
    models: ['RZ 450e', 'UX 300e'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="20" fill="currentColor" letter-spacing="3">LEXUS</text></svg>`,
  },
  {
    name: 'Rivian',
    models: ['R1T', 'R1S'],
    svg: `<svg viewBox="0 0 100 60"><text x="50" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="20" fill="currentColor" letter-spacing="2">RIVIAN</text></svg>`,
  },
  {
    name: 'Other',
    models: [],
    svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="3"/><path d="M30 75 Q50 60 70 75" stroke="currentColor" stroke-width="3" fill="none"/><text x="50" y="45" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="16" fill="currentColor">?</text></svg>`,
  },
]

export const STATUS_PIPELINE = [
  'Received',
  'Waiting for Parts',
  'Diagnosing',
  'Quotation Sent',
  'Approved',
  'In Progress',
  'Quality Check',
  'Ready for Pickup',
  'Completed',
  'Cancelled',
]
