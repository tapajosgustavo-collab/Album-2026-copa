import streamlit as st
from backend import carregar_dados, salvar_dados

# --- CONFIGURAÇÃO DA PÁGINA ---
st.set_page_config(page_title="Álbum Copa 2026", page_icon="🏆", layout="wide")

if 'album' not in st.session_state:
    st.session_state.album = carregar_dados()

album = st.session_state.album

# --- BARRA LATERAL (Sidebar) ---
with st.sidebar:
    st.title("🏆 Meu Álbum 2026")
    st.markdown("---")
    # Removemos a página de Registrar, agora tudo fica em "Gerenciar Álbum"
    menu = st.radio(
        "Navegação", 
        ["📖 Gerenciar Álbum", "📊 Estatísticas"]
    )
    st.markdown("---")

# --- PÁGINA: GERENCIAR ÁLBUM ---
if menu == "📖 Gerenciar Álbum":
    st.header("📖 Gerenciar Figurinhas")
    st.info("👆 **Dica:** Clique no botão da figurinha para adicionar +1 à sua coleção!")
    
    selecao = st.selectbox("Escolha a Seleção para visualizar:", list(album.keys()))
    
    st.subheader(f"Bandeira: {album[selecao]['nome']}")
    st.markdown("---")
    
    figurinhas = album[selecao]["figurinhas"]
    itens = list(figurinhas.items())
    
    # Criando o Grid de botões
    itens_por_linha = 5
    for i in range(0, len(itens), itens_por_linha):
        cols = st.columns(itens_por_linha)
        pedaco_linha = itens[i:i + itens_por_linha]
        
        for j, (cod, dados) in enumerate(pedaco_linha):
            with cols[j]:
                qtd = dados["qtd"]
                
                # Definindo o visual do botão baseado na quantidade
                if qtd == 0:
                    emoji = "❌"
                    status = "Falta"
                    btn_type = "secondary" # Botão com visual mais apagado
                elif qtd == 1:
                    emoji = "✅"
                    status = "Tenho"
                    btn_type = "primary" # Botão com destaque (cor principal do app)
                else:
                    emoji = "🔄"
                    status = f"Repetida ({qtd})"
                    btn_type = "primary"
                
                # Texto que vai aparecer no botão
                label_botao = f"{emoji} {cod} \n {status}"
                
                # Cria o botão e verifica se foi clicado
                if st.button(label_botao, key=f"btn_{cod}", use_container_width=True, type=btn_type):
                    # Adiciona +1 na quantidade
                    st.session_state.album[selecao]["figurinhas"][cod]["qtd"] += 1
                    # Salva no arquivo JSON/Banco de dados
                    salvar_dados(st.session_state.album)
                    # Recarrega a página instantaneamente para atualizar o botão
                    st.rerun()

# --- PÁGINA: ESTATÍSTICAS ---
elif menu == "📊 Estatísticas":
    st.header("📊 Progresso do Álbum")
    
    total_figurinhas = 980
    adquiridas = sum(1 for sel in album.values() for f in sel["figurinhas"].values() if f["qtd"] > 0)
    repetidas = sum(f["qtd"] - 1 for sel in album.values() for f in sel["figurinhas"].values() if f["qtd"] > 1)
    faltam = total_figurinhas - adquiridas
    porcentagem = (adquiridas / total_figurinhas) * 100
    
    st.progress(adquiridas / total_figurinhas)
    st.markdown(f"**{porcentagem:.1f}% Completo** ({adquiridas} de {total_figurinhas})")
    st.markdown("<br>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(label="✅ Únicas Adquiridas", value=adquiridas, delta=f"{porcentagem:.1f}%", delta_color="normal")
    with col2:
        st.metric(label="❌ Faltantes", value=faltam)
    with col3:
        st.metric(label="🔄 Repetidas para Troca", value=repetidas, delta="Bora trocar!", delta_color="off")
