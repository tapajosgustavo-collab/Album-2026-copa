# 🎨 TODO — Assets binários pendentes (Fase Brand)

Arquivos que precisam regeneração manual porque eu (agente) não consigo gerar imagens.

## Ícones e splash

- [ ] `AlbumApp/assets/icon.png` (1024×1024 PNG) — ícone principal
  - Remover qualquer elemento que lembre logo FIFA / bola Adidas
  - Sugestão: um caderno/álbum estilizado com estrela dourada
  - Paleta atual: dourado `#f5c518` + azul-escuro `#020b1e`

- [ ] `AlbumApp/assets/splash-icon.png` — logo do splash screen
  - Mesmo padrão do ícone

- [ ] `AlbumApp/assets/android-icon-foreground.png` (adaptive icon foreground)
- [ ] `AlbumApp/assets/android-icon-background.png` (adaptive icon background)
- [ ] `AlbumApp/assets/android-icon-monochrome.png` (Android 13+ themed icon)
- [ ] `AlbumApp/assets/favicon.png` (web favicon 48×48)

## Ferramentas recomendadas

- **Figma** (gratuito) para desenhar e exportar PNGs
- **Expo Icon Builder**: https://www.figma.com/community/file/1155362909441341285
- **Remove.bg** se precisar remover fundo
- **Squoosh** para otimizar PNGs

## Prompt sugerido (se quiser usar IA generativa)

> "Minimalist app icon for a sticker album tracker. A stylized open notebook with a golden star above it, dark navy background (#020b1e), gold accent (#f5c518). Flat vector style, no text, no branded elements, no official sports logos. Square 1024x1024."

## Quando estiver pronto

Substitua os arquivos em `AlbumApp/assets/` mantendo os mesmos nomes. O `app.json` já aponta pra eles.

---

**Restante do rebranding textual**: ✅ concluído nesta branch `agent/brand`.
