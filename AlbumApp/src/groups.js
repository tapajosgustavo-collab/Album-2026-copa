export const ISO = {
  FWC:'un', MEX:'mx', RSA:'za', KOR:'kr', CZE:'cz',
  CAN:'ca', BIH:'ba', QAT:'qa', SUI:'ch',
  BRA:'br', MAR:'ma', HAI:'ht', SCO:'gb-sct',
  USA:'us', PAR:'py', AUS:'au', TUR:'tr',
  ESP:'es', JPN:'jp', PER:'pe', SWE:'se',
  GER:'de', CMR:'cm', NZL:'nz',
  URU:'uy', KSA:'sa', SVK:'sk', BEN:'bj',
  NED:'nl', ECU:'ec', HUN:'hu', IRL:'ie',
  FRA:'fr', SEN:'sn', NOR:'no', IRQ:'iq',
  ARG:'ar', ALG:'dz', AUT:'at', JOR:'jo',
  POR:'pt', COD:'cd', UZB:'uz', COL:'co',
  ENG:'gb-eng', CRO:'hr', GHA:'gh', PAN:'pa'
};

export function flagUrl(code) {
  const iso = ISO[code];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}

export const GROUPS = {
  fwc: { label: '🏆 FWC', sublabel: 'Símbolos & Estádios', times: ['FWC'] },
  A: { label: 'Grupo A', sublabel: 'México · África do Sul · Coreia do Sul · Rep. Tcheca', times: ['MEX', 'RSA', 'KOR', 'CZE'] },
  B: { label: 'Grupo B', sublabel: 'Canadá · Bósnia · Catar · Suíça', times: ['CAN', 'BIH', 'QAT', 'SUI'] },
  C: { label: 'Grupo C', sublabel: 'Brasil · Marrocos · Haiti · Escócia', times: ['BRA', 'MAR', 'HAI', 'SCO'] },
  D: { label: 'Grupo D', sublabel: 'Estados Unidos · Paraguai · Austrália · Turquia', times: ['USA', 'PAR', 'AUS', 'TUR'] },
  E: { label: 'Grupo E', sublabel: 'Espanha · Japão · Peru · Suécia', times: ['ESP', 'JPN', 'PER', 'SWE'] },
  F: { label: 'Grupo F', sublabel: 'Alemanha · México · Camarões · Nova Zelândia', times: ['GER', 'MEX', 'CMR', 'NZL'] },
  G: { label: 'Grupo G', sublabel: 'Uruguai · Arábia Saudita · Eslováquia · Benin', times: ['URU', 'KSA', 'SVK', 'BEN'] },
  H: { label: 'Grupo H', sublabel: 'Holanda · Equador · Hungria · Irlanda', times: ['NED', 'ECU', 'HUN', 'IRL'] },
  I: { label: 'Grupo I', sublabel: 'França · Senegal · Noruega · Iraque', times: ['FRA', 'SEN', 'NOR', 'IRQ'] },
  J: { label: 'Grupo J', sublabel: 'Argentina · Argélia · Áustria · Jordânia', times: ['ARG', 'ALG', 'AUT', 'JOR'] },
  K: { label: 'Grupo K', sublabel: 'Portugal · RD Congo · Uzbequistão · Colômbia', times: ['POR', 'COD', 'UZB', 'COL'] },
  L: { label: 'Grupo L', sublabel: 'Inglaterra · Croácia · Gana · Panamá', times: ['ENG', 'CRO', 'GHA', 'PAN'] },
};
