export const ISO = {
  FWC:'un',  USA:'us',  MEX:'mx',  CAN:'ca',  BRA:'br',  ARG:'ar',
  FRA:'fr',  ENG:'gb-eng', GER:'de', ESP:'es', ITA:'it',  POR:'pt',
  NED:'nl',  BEL:'be',  CRO:'hr',  URU:'uy',  COL:'co',  MAR:'ma',
  SEN:'sn',  JPN:'jp',  KOR:'kr',  AUS:'au',  ECU:'ec',  SUI:'ch',
  DEN:'dk',  POL:'pl',  SWE:'se',  TUR:'tr',
  EGY:'eg',  GHA:'gh',  TUN:'tn',  ALG:'dz',
  KSA:'sa',  IRN:'ir',  IRQ:'iq',  UZB:'uz',
  PAN:'pa',  JAM:'jm',  NZL:'nz',  PAR:'py',
  RSA:'za',  QAT:'qa',  HAI:'ht',  SCO:'gb-sct', CUW:'cw', CIV:'ci',
  CPV:'cv',  NOR:'no',  AUT:'at',  JOR:'jo'
};

export function flagUrl(code) {
  const iso = ISO[code];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}

export const GROUPS = {
  fwc: { label: '🏆 FWC', sublabel: 'Símbolos & Estádios', times: ['FWC'] },
  A: { label: 'Grupo A', sublabel: 'México · Coreia do Sul · África do Sul · Dinamarca', times: ['MEX', 'KOR', 'RSA', 'DEN'] },
  B: { label: 'Grupo B', sublabel: 'Canadá · Suíça · Catar · Itália', times: ['CAN', 'SUI', 'QAT', 'ITA'] },
  C: { label: 'Grupo C', sublabel: 'Brasil · Marrocos · Haiti · Escócia', times: ['BRA', 'MAR', 'HAI', 'SCO'] },
  D: { label: 'Grupo D', sublabel: 'Estados Unidos · Paraguai · Austrália · Turquia', times: ['USA', 'PAR', 'AUS', 'TUR'] },
  E: { label: 'Grupo E', sublabel: 'Alemanha · Equador · Curaçao · Costa do Marfim', times: ['GER', 'ECU', 'CUW', 'CIV'] },
  F: { label: 'Grupo F', sublabel: 'Holanda · Japão · Tunísia · Suécia · Polônia', times: ['NED', 'JPN', 'TUN', 'SWE', 'POL'] },
  G: { label: 'Grupo G', sublabel: 'Bélgica · Egito · Irã · Nova Zelândia', times: ['BEL', 'EGY', 'IRN', 'NZL'] },
  H: { label: 'Grupo H', sublabel: 'Espanha · Cabo Verde · Arábia Saudita · Uruguai', times: ['ESP', 'CPV', 'KSA', 'URU'] },
  I: { label: 'Grupo I', sublabel: 'França · Senegal · Noruega · Iraque', times: ['FRA', 'SEN', 'NOR', 'IRQ'] },
  J: { label: 'Grupo J', sublabel: 'Argentina · Argélia · Áustria · Jordânia', times: ['ARG', 'ALG', 'AUT', 'JOR'] },
  K: { label: 'Grupo K', sublabel: 'Portugal · Uzbequistão · Colômbia · Jamaica', times: ['POR', 'UZB', 'COL', 'JAM'] },
  L: { label: 'Grupo L', sublabel: 'Inglaterra · Croácia · Gana · Panamá', times: ['ENG', 'CRO', 'GHA', 'PAN'] },
};
