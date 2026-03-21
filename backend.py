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
    with open(arquivo, 'w', encoding='utf-8') as f:
        json.dump(album, f, indent=4, ensure_ascii=False)

def carregar_dados(arquivo='album_salvo.json'):
    if os.path.exists(arquivo):
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return gerar_album_copa_2026()

def exibir_estatisticas(album):
    total_figuras = 980
    adquiridas = 0
    repetidas = 0
    
    for selecao in album.values():
        for fig in selecao["figurinhas"].values():
            if fig["qtd"] > 0:
                adquiridas += 1
            if fig["qtd"] > 1:
                repetidas += (fig["qtd"] - 1)
    
    porcentagem = (adquiridas / total_figuras) * 100
    print("\n--- STATUS DO ÁLBUM ---")
    print(f"Progresso: {adquiridas}/{total_figuras} ({porcentagem:.2f}%)")
    print(f"Total de Repetidas: {repetidas}")
    print(f"Faltam: {total_figuras - adquiridas} figurinhas")

def listar_faltantes_por_selecao(album, prefixo):
    if prefixo in album:
        faltantes = [k for k, v in album[prefixo]["figurinhas"].items() if v["qtd"] == 0]
        print(f"\nFaltam em {album[prefixo]['nome']}: {', '.join(faltantes) if faltantes else 'COMPLETA!'}")
    else:
        print("Seleção não encontrada. Verifique o prefixo digitado.")

def exportar_repetidas_whatsapp(album):
    repetidas = []
    for selecao in album.values():
        for cod, fig in selecao["figurinhas"].items():
            if fig["qtd"] > 1:
                repetidas.append(f"{cod} (x{fig['qtd'] - 1})")
    
    if repetidas:
        texto = "*Minhas Repetidas - Copa 2026:*\n" + ", ".join(repetidas)
        print("\n--- COPIE O TEXTO ABAIXO PARA O WHATSAPP ---")
        print(texto)
    else:
        print("\nVocê ainda não tem figurinhas repetidas para trocar.")

# Carrega o álbum salvo ou cria um novo se não existir
meu_album = carregar_dados()

