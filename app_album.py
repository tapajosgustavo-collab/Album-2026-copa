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

# Loop do menu principal
while True:
    print("\n--- ÁLBUM COPA 2026 ---")
    print("1. Registrar nova figurinha")
    print("2. Ver Estatísticas Gerais")
    print("3. Listar Faltantes de uma Seleção")
    print("4. Exportar Repetidas para WhatsApp")
    print("5. Sair e Salvar")
    opcao = input("Opção: ")

    if opcao == '1':
        codigo = input("Digite o código (Ex: BRA1, ARG10): ").strip().upper()
        # Extrai apenas as letras para o prefixo (funciona para FWC e seleções com 3 letras)
        prefixo = "".join([c for c in codigo if c.isalpha()])
        
        # Verifica se a figurinha existe na estrutura
        if prefixo in meu_album and codigo in meu_album[prefixo]["figurinhas"]:
            meu_album[prefixo]["figurinhas"][codigo]["qtd"] += 1
            
            # Atualiza o status
            if meu_album[prefixo]["figurinhas"][codigo]["qtd"] == 1:
                meu_album[prefixo]["figurinhas"][codigo]["status"] = "tenho"
                print(f"Boa! Figurinha {codigo} adicionada pela primeira vez.")
            else:
                meu_album[prefixo]["figurinhas"][codigo]["status"] = "repetida"
                print(f"Figurinha {codigo} registrada como REPETIDA.")
        else:
            print("Código inválido. Verifique a digitação.")
            
    elif opcao == '2':
        exibir_estatisticas(meu_album)
        
    elif opcao == '3':
        pref = input("Digite o prefixo da seleção (Ex: BRA, FWC): ").strip().upper()
        listar_faltantes_por_selecao(meu_album, pref)

    elif opcao == '4':
        exportar_repetidas_whatsapp(meu_album)
        
    elif opcao == '5':
        salvar_dados(meu_album)
        print("Progresso salvo no arquivo 'album_salvo.json'. Saindo...")
        break
    else:
        print("Opção inválida.")