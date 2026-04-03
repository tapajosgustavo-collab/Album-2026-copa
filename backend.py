import json
import os

def gerar_album_copa_2026():
    # 48 seleções + FWC = 49 seções × 20 = 980 figurinhas
    prefixos_2026 = [
        "FWC",
        "MEX", "RSA", "KOR", "CZE",       # Grupo A
        "CAN", "BIH", "QAT", "SUI",       # Grupo B
        "BRA", "MAR", "HAI", "SCO",        # Grupo C
        "USA", "PAR", "AUS", "TUR",        # Grupo D
        "GER", "CUW", "CIV", "ECU",        # Grupo E
        "NED", "JPN", "SWE", "TUN",        # Grupo F
        "BEL", "EGY", "IRN", "NZL",        # Grupo G
        "ESP", "CPV", "KSA", "URU",        # Grupo H
        "FRA", "SEN", "IRQ", "NOR",        # Grupo I
        "ARG", "ALG", "AUT", "JOR",        # Grupo J
        "POR", "COD", "UZB", "COL",        # Grupo K
        "ENG", "CRO", "GHA", "PAN",        # Grupo L
    ]

    nomes = {
        "MEX": "México", "RSA": "África do Sul", "KOR": "Coreia do Sul", "CZE": "República Tcheca",
        "CAN": "Canadá", "BIH": "Bósnia e Herzegovina", "QAT": "Catar", "SUI": "Suíça",
        "BRA": "Brasil", "MAR": "Marrocos", "HAI": "Haiti", "SCO": "Escócia",
        "USA": "Estados Unidos", "PAR": "Paraguai", "AUS": "Austrália", "TUR": "Turquia",
        "GER": "Alemanha", "CUW": "Curaçao", "CIV": "Costa do Marfim", "ECU": "Equador",
        "NED": "Holanda", "JPN": "Japão", "SWE": "Suécia", "TUN": "Tunísia",
        "BEL": "Bélgica", "EGY": "Egito", "IRN": "Irã", "NZL": "Nova Zelândia",
        "ESP": "Espanha", "CPV": "Cabo Verde", "KSA": "Arábia Saudita", "URU": "Uruguai",
        "FRA": "França", "SEN": "Senegal", "IRQ": "Iraque", "NOR": "Noruega",
        "ARG": "Argentina", "ALG": "Argélia", "AUT": "Áustria", "JOR": "Jordânia",
        "POR": "Portugal", "COD": "RD Congo", "UZB": "Uzbequistão", "COL": "Colômbia",
        "ENG": "Inglaterra", "CRO": "Croácia", "GHA": "Gana", "PAN": "Panamá",
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



