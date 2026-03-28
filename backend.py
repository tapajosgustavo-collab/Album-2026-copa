import json
import os

def gerar_album_copa_2026():
    # As 48 seleções confirmadas/estimadas para os grupos de 2026
    prefixos_2026 = [
        "FWC", "USA", "MEX", "CAN", "BRA", "ARG", "FRA", "ENG", "GER", "ESP",
        "ITA", "POR", "NED", "BEL", "CRO", "URU", "COL", "MAR", "SEN", "JPN",
        "KOR", "AUS", "ECU", "SUI", "DEN", "POL", "SWE", "TUR",
        "EGY", "GHA", "TUN", "ALG", "KSA", "IRN", "IRQ",
        "UZB", "PAN", "JAM", "NZL", "PAR",
        "RSA", "QAT", "HAI", "SCO", "CUW", "CIV", "CPV", "NOR", "AUT", "JOR"
    ]

    nomes = {
        "USA": "Estados Unidos", "MEX": "México", "CAN": "Canadá", "BRA": "Brasil",
        "ARG": "Argentina", "FRA": "França", "ENG": "Inglaterra", "GER": "Alemanha",
        "ESP": "Espanha", "ITA": "Itália", "POR": "Portugal", "NED": "Holanda",
        "BEL": "Bélgica", "CRO": "Croácia", "URU": "Uruguai", "COL": "Colômbia",
        "MAR": "Marrocos", "SEN": "Senegal", "JPN": "Japão", "KOR": "Coreia do Sul",
        "AUS": "Austrália", "ECU": "Equador", "SUI": "Suíça", "DEN": "Dinamarca",
        "POL": "Polônia", "SWE": "Suécia",
        "TUR": "Turquia", "EGY": "Egito", "GHA": "Gana",
        "TUN": "Tunísia", "ALG": "Argélia",
        "KSA": "Arábia Saudita", "IRN": "Irã", "IRQ": "Iraque",
        "UZB": "Uzbequistão", "PAN": "Panamá", "JAM": "Jamaica",
        "NZL": "Nova Zelândia", "PAR": "Paraguai",
        "RSA": "África do Sul", "QAT": "Catar", "HAI": "Haiti", "SCO": "Escócia",
        "CUW": "Curaçao", "CIV": "Costa do Marfim", "CPV": "Cabo Verde",
        "NOR": "Noruega", "AUT": "Áustria", "JOR": "Jordânia",
    }

    album = {}

    # Seção Especial FWC (Estádios e Símbolos)
    album["FWC"] = {
        "nome": "Símbolos e Estádios",
        "figurinhas": {f"FWC{i}": {"qtd": 0, "status": "falta", "is_shiny": True} for i in range(1, 21)}
    }

    # Gerando as seleções x 20 figurinhas cada
    for pref in prefixos_2026[1:]:
        album[pref] = {
            "nome": nomes.get(pref, f"Seleção {pref}"),
            "figurinhas": {
                f"{pref}{i}": {
                    "qtd": 0, 
                    "status": "falta", 
                    "is_shiny": True if i == 1 else False
                } for i in range(1, 21)
            }
        }
    
    return album

def salvar_dados(album, arquivo='album_salvo.json'):
    try:
        with open(arquivo, 'w', encoding='utf-8') as f:
            json.dump(album, f, indent=4, ensure_ascii=False)
    except (IOError, OSError) as e:
        print(f"[ERRO] Falha ao salvar dados: {e}")

def carregar_dados(arquivo='album_salvo.json'):
    base = gerar_album_copa_2026()
    if os.path.exists(arquivo):
        try:
            with open(arquivo, 'r', encoding='utf-8') as f:
                salvo = json.load(f)
            # Mesclar: manter progresso salvo, adicionar seleções novas
            for key, sel in base.items():
                if key not in salvo:
                    salvo[key] = sel
            return salvo
        except (json.JSONDecodeError, IOError) as e:
            print(f"[ERRO] Arquivo corrompido, gerando novo álbum: {e}")
    return base



