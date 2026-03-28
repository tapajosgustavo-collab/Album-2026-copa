import json
import os

def gerar_album_copa_2026():
    # As 48 seleções confirmadas/estimadas para os grupos de 2026
    prefixos_2026 = [
        "FWC", "USA", "MEX", "CAN", "BRA", "ARG", "FRA", "ENG", "GER", "ESP", 
        "ITA", "POR", "NED", "BEL", "CRO", "URU", "COL", "MAR", "SEN", "JPN",
        "KOR", "AUS", "ECU", "SUI", "DEN", "SRB", "POL", "UKR", "SWE", "TUR",
        "EGY", "NGA", "GHA", "TUN", "ALG", "CMR", "MLI", "KSA", "IRN", "IRQ",
        "UAE", "UZB", "PAN", "CRC", "JAM", "HON", "SLV", "NZL", "PAR"
    ] 

    album = {}
    
    # Seção Especial FWC (Estádios e Símbolos)
    album["FWC"] = {
        "nome": "Símbolos e Estádios",
        "figurinhas": {f"FWC{i}": {"qtd": 0, "status": "falta", "is_shiny": True} for i in range(1, 21)}
    }

    # Gerando as 48 seleções x 20 figurinhas cada = 960
    for pref in prefixos_2026[1:]:
        album[pref] = {
            "nome": f"Seleção {pref}",
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
    if os.path.exists(arquivo):
        try:
            with open(arquivo, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"[ERRO] Arquivo corrompido, gerando novo álbum: {e}")
    return gerar_album_copa_2026()



