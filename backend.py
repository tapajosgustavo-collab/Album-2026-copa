import json
import os

def gerar_album_copa_2026():
    # 48 seleções confirmadas + FWC = 49 seções × 20 = 980 figurinhas
    prefixos_2026 = [
        "FWC", "MEX", "RSA", "KOR", "CZE",
        "CAN", "BIH", "QAT", "SUI",
        "BRA", "MAR", "HAI", "SCO",
        "USA", "PAR", "AUS", "TUR",
        "ESP", "JPN", "PER", "SWE",
        "GER", "CMR", "NZL",
        "URU", "KSA", "SVK", "BEN",
        "NED", "ECU", "HUN", "IRL",
        "FRA", "SEN", "NOR", "IRQ",
        "ARG", "ALG", "AUT", "JOR",
        "POR", "COD", "UZB", "COL",
        "ENG", "CRO", "GHA", "PAN"
    ]

    nomes = {
        "MEX": "México", "RSA": "África do Sul", "KOR": "Coreia do Sul", "CZE": "República Tcheca",
        "CAN": "Canadá", "BIH": "Bósnia e Herzegovina", "QAT": "Catar", "SUI": "Suíça",
        "BRA": "Brasil", "MAR": "Marrocos", "HAI": "Haiti", "SCO": "Escócia",
        "USA": "Estados Unidos", "PAR": "Paraguai", "AUS": "Austrália", "TUR": "Turquia",
        "ESP": "Espanha", "JPN": "Japão", "PER": "Peru", "SWE": "Suécia",
        "GER": "Alemanha", "CMR": "Camarões", "NZL": "Nova Zelândia",
        "URU": "Uruguai", "KSA": "Arábia Saudita", "SVK": "Eslováquia", "BEN": "Benin",
        "NED": "Holanda", "ECU": "Equador", "HUN": "Hungria", "IRL": "Irlanda",
        "FRA": "França", "SEN": "Senegal", "NOR": "Noruega", "IRQ": "Iraque",
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



