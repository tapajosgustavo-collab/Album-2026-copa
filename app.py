import streamlit as st
from backend import carregar_dados, salvar_dados

# Carrega os dados para a sessão do Streamlit
if 'album' not in st.session_state:
    st.session_state.album = carregar_dados()

album = st.session_state.album

# --- INTERFACE (Frontend) ---
st.set_page_config(page_title="Álbum Copa 2026", layout="wide")
st.title("🏆 Meu Álbum Copa 2026")

menu = st.sidebar.radio("Navegação", ["Registrar Figurinha", "Visualizar Álbum", "Estatísticas"])

if menu == "Registrar Figurinha":
    st.header("Adicionar Nova Figurinha")
    codigo = st.text_input("Digite o código (Ex: BRA10, FWC1):").strip().upper()
    
    if st.button("Registrar"):
        prefixo = "".join([c for c in codigo if c.isalpha()])
        if prefixo in album and codigo in album[prefixo]["figurinhas"]:
            album[prefixo]["figurinhas"][codigo]["qtd"] += 1
            salvar_dados(album)
            st.success(f"Figurinha {codigo} registrada com sucesso!")
        else:
            st.error("Código inválido!")

elif menu == "Visualizar Álbum":
    st.header("Minhas Figurinhas")
    selecao = st.selectbox("Escolha a Seleção", list(album.keys()))
    
    st.subheader(album[selecao]["nome"])
    figurinhas = album[selecao]["figurinhas"]
    
    cols = st.columns(5) 
    for i, (cod, dados) in enumerate(figurinhas.items()):
        cor = "🟩 Tenho" if dados["qtd"] == 1 else "🟨 Repetida" if dados["qtd"] > 1 else "⬜ Falta"
        
        with cols[i % 5]:
            st.markdown(f"**{cod}**")
            st.caption(f"{cor} (x{dados['qtd']})")

elif menu == "Estatísticas":
    st.header("Progresso")
    adquiridas = sum(1 for sel in album.values() for f in sel["figurinhas"].values() if f["qtd"] > 0)
    repetidas = sum(f["qtd"] - 1 for sel in album.values() for f in sel["figurinhas"].values() if f["qtd"] > 1)
    
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Adquiridas", f"{adquiridas}/980")
    col2.metric("Repetidas", repetidas)
    col3.metric("Faltam", 980 - adquiridas)
    
    st.progress(adquiridas / 980)