export const ISO = {
  FWC:'un',  USA:'us',  MEX:'mx',  CAN:'ca',  BRA:'br',  ARG:'ar',
  FRA:'fr',  ENG:'gb-eng', GER:'de', ESP:'es', ITA:'it',  POR:'pt',
  NED:'nl',  BEL:'be',  CRO:'hr',  URU:'uy',  COL:'co',  MAR:'ma',
  SEN:'sn',  JPN:'jp',  KOR:'kr',  AUS:'au',  ECU:'ec',  SUI:'ch',
  DEN:'dk',  SRB:'rs',  POL:'pl',  UKR:'ua',  SWE:'se',  TUR:'tr',
  EGY:'eg',  NGA:'ng',  GHA:'gh',  TUN:'tn',  ALG:'dz',  CMR:'cm',
  MLI:'ml',  KSA:'sa',  IRN:'ir',  IRQ:'iq',  UAE:'ae',  UZB:'uz',
  PAN:'pa',  CRC:'cr',  JAM:'jm',  HON:'hn',  SLV:'sv',  NZL:'nz', PAR:'py'
};

export function flagUrl(code) {
  const iso = ISO[code];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}

export const GROUPS = {
  fwc: { label: '🏆 FWC', sublabel: 'Símbolos & Estádios', times: ['FWC'], missing: [], pending: null },
  A: {
    label: 'Grupo A', sublabel: 'México · Coreia do Sul · África do Sul + Repescagem',
    times: ['MEX', 'KOR'], missing: [{ nome: 'África do Sul', cod: 'RSA' }],
    pending: { descricao: 'Repescagem Europa D', candidatos: 'Dinamarca, Macedônia do Norte, Rep. Tcheca ou Irlanda', albCods: ['DEN'] }
  },
  B: {
    label: 'Grupo B', sublabel: 'Canadá · Suíça · Catar + Repescagem',
    times: ['CAN', 'SUI'], missing: [{ nome: 'Catar', cod: 'QAT' }],
    pending: { descricao: 'Repescagem Europa A', candidatos: 'Itália, Irlanda do Norte, País de Gales ou Bósnia', albCods: ['ITA'] }
  },
  C: {
    label: 'Grupo C', sublabel: 'Brasil · Marrocos · Haiti · Escócia',
    times: ['BRA', 'MAR'], missing: [{ nome: 'Haiti', cod: 'HAI' }, { nome: 'Escócia', cod: 'SCO' }],
    pending: null
  },
  D: {
    label: 'Grupo D', sublabel: 'EUA · Paraguai · Austrália + Repescagem',
    times: ['USA', 'PAR', 'AUS'], missing: [],
    pending: { descricao: 'Repescagem Europa C', candidatos: 'Turquia, Romênia, Eslováquia ou Kosovo', albCods: ['TUR'] }
  },
  E: {
    label: 'Grupo E', sublabel: 'Alemanha · Equador · Curaçao · Costa do Marfim',
    times: ['GER', 'ECU'], missing: [{ nome: 'Curaçao', cod: 'CUW' }, { nome: 'Costa do Marfim', cod: 'CIV' }],
    pending: null
  },
  F: {
    label: 'Grupo F', sublabel: 'Holanda · Japão · Tunísia + Repescagem',
    times: ['NED', 'JPN', 'TUN'], missing: [],
    pending: { descricao: 'Repescagem Europa B', candidatos: 'Ucrânia, Suécia, Polônia ou Albânia', albCods: ['UKR', 'SWE', 'POL'] }
  },
  G: {
    label: 'Grupo G', sublabel: 'Bélgica · Egito · Irã · Nova Zelândia',
    times: ['BEL', 'EGY', 'IRN', 'NZL'], missing: [], pending: null
  },
  H: {
    label: 'Grupo H', sublabel: 'Espanha · Arábia Saudita · Uruguai · Cabo Verde',
    times: ['ESP', 'KSA', 'URU'], missing: [{ nome: 'Cabo Verde', cod: 'CPV' }],
    pending: null
  },
  I: {
    label: 'Grupo I', sublabel: 'França · Senegal · Noruega + Repescagem',
    times: ['FRA', 'SEN'], missing: [{ nome: 'Noruega', cod: 'NOR' }],
    pending: { descricao: 'Repescagem Intercontinental 2', candidatos: 'Bolívia, Suriname ou Iraque', albCods: ['IRQ'] }
  },
  J: {
    label: 'Grupo J', sublabel: 'Argentina · Argélia · Áustria · Jordânia',
    times: ['ARG', 'ALG'], missing: [{ nome: 'Áustria', cod: 'AUT' }, { nome: 'Jordânia', cod: 'JOR' }],
    pending: null
  },
  K: {
    label: 'Grupo K', sublabel: 'Portugal · Uzbequistão · Colômbia + Repescagem',
    times: ['POR', 'UZB', 'COL'], missing: [],
    pending: { descricao: 'Repescagem Intercontinental 1', candidatos: 'RD Congo, Jamaica ou Nova Caledônia', albCods: ['JAM'] }
  },
  L: {
    label: 'Grupo L', sublabel: 'Inglaterra · Croácia · Gana · Panamá',
    times: ['ENG', 'CRO', 'GHA', 'PAN'], missing: [], pending: null
  },
};

export const TIMES_SEM_GRUPO = ['SRB', 'NGA', 'CMR', 'MLI', 'UAE', 'CRC', 'HON', 'SLV'];
