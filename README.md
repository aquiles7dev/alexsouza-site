# Site Alex Souza · Imóveis (v2)

Site estático (HTML + CSS + JS puros, sem build), pronto para a Vercel.

## Estrutura
- `index.html` — home
- `city-code-ricardo-paranhos/index.html` — pré-lançamento
- `ora-vaca-brava/index.html` — página-modelo (noindex, fora do sitemap)
- `assets/css/style.css`, `assets/js/main.js`, `assets/img/`, `assets/fonts/` (Fraunces e Inter, licença OFL)
- `sitemap.xml`, `robots.txt`, `vercel.json`, `.vercelignore`
- `_antigo/` — versão anterior (não é publicada)

## Trocar fotos do Alex (sem mexer no layout)
- Hero: substituir `assets/img/alex-hero.jpg` (quadro 4:5, recorte automático).
- Sobre: substituir `assets/img/alex-sobre.jpg` (quadro 1:1, recorte automático).
- Ajuste fino do enquadramento: `object-position` em `.portrait img` e `.about img` no CSS.

## Publicar imagens de empreendimento (só com autorização escrita, sem logos)
Preencher `data-src` (e `data-alt`) no bloco `<div class="shot" ...>` correspondente.
A legenda "[imagem aguardando autorização]" some sozinha e o lightbox passa a usar a imagem.

## Ativar "Goiânia em análise"
Na home, remover `hidden` da seção `#analises` e preencher de 3 a 6 cards reais.

## Captação
Formulários abrem o WhatsApp (62) 99128-7785 com mensagem pronta. O ponto para conectar
Google Sheets/CRM está comentado em `assets/js/main.js` ("PONTO DE CONEXÃO").

## Pendências ([PLACEHOLDER])
CRECI · razão social · frase de posicionamento · texto "sobre" · leitura do Alex sobre o Marista ·
notas de vaga (Code Studio, 1 suíte, 2 quartos) · texto legal/registro de incorporação ·
dados do ÓRA Vaca Brava · domínio (canonical, og:url, sitemap) · IDs de GA4/Meta Pixel.

## Regras
Sem logos de incorporadoras · sem preços, simuladores, Pix/CNPJ · sem material interno de corretores ·
sem data de entrega do City Code RP · plantas e perspectivas só com autorização.
