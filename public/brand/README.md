# Noah brand assets

Os arquivos desta pasta são servidos diretamente pelo build estático do front (`/brand/*`).
Eles devem ser mantidos **locais** e versionados no repositório para garantir que o deploy
não dependa de S3 ou de qualquer domínio externo.

Arquivos esperados:

- `logo-light.png`
- `logo-dark.png`
- `favicon.ico` (preferencial)
- `favicon.png` (fallback opcional)
- `apple-touch-icon.png`
- `apple-touch.png` (fallback legado)
- `login-eclipse-desktop.png`
- `login-eclipse@2x.png`
- `login-eclipse-mobile.png`

Recomendações:

- A imagem principal de login (`login-eclipse-desktop.png`) deve ter, idealmente, 1920×1080 (ou superior),
  com área central limpa e compressão inferior a 400 KB.
- Prefira fundos com textura suave, geometria leve ou fotografia com blur e bom contraste.

Você pode substituir por versões oficiais seguindo o mesmo nome/estrutura.
