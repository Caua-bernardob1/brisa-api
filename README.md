# Brisa

Pequeno app React + Vite para consultar o clima de cidades pela API pública Open-Meteo, sem chave de API.

## Executar

Requer Node.js 20.19+ ou 22.12+ e pnpm.

```bash
pnpm install
pnpm dev
```

`pnpm build` gera a versão de produção em `dist`. `pnpm test` verifica o tratamento da API.

## Funcionalidades

- Lista de cidades com temperatura, condição, máxima, mínima e umidade.
- Busca por cidade com resultados para escolher a localização correta.
- Detalhes e previsão de sete dias ao selecionar um cartão.
- Favoritas salvas no navegador e alternância entre °C e °F.
- Carregamento independente, limite de 15 segundos, cancelamento de consultas e erros com nova tentativa.
- Layout responsivo e controles acessíveis por teclado.

Os dados são consultados no navegador. É necessária conexão com a internet. A geocodificação usa `geocoding-api.open-meteo.com/v1/search`; o clima usa `api.open-meteo.com/v1/forecast`. Consulte os termos da [Open-Meteo](https://open-meteo.com/en/terms) antes de uso comercial.

## Páginas

- `/`: página inicial com a imagem do pátio e o botão Vamos começar.
- `/app.html`: aplicativo de clima completo. O logo Brisa retorna ao início.

A imagem fornecida foi otimizada em WebP para reduzir o tempo de carregamento.
