# Traço & Pixel

> Laboratório visual e interativo de computação gráfica: conectando o desenho vetorial contínuo à matriz discreta de pixels e à extrusão 3D.

---

## 🚀 Como Inicializar

### No Windows (1 Clique)
Basta dar dois cliques no arquivo:
```cmd
iniciar.bat
```
*(ou execute `start.bat`)*

O script irá automaticamente:
1. Verificar a instalação do Node.js.
2. Instalar as dependências (`npm install`) caso seja a primeira execução.
3. Iniciar o servidor local.
4. Abrir automaticamente a aplicação no navegador em **http://localhost:3000**.

---

### Via Terminal (Qualquer Sistema)
```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🎨 Funcionalidades

- **Tutorial Interativo Integrado**: Guia passo a passo ("Como Usar") explicando os conceitos fundamentais de computação gráfica, rasterização e filtros.
- **Estúdio de Desenho Vetorial**: Crie formas geométricas (lápis livre, retângulos, círculos, linhas, polígonos de múltiplos vértices e borracha) com espessura ajustável e paleta curada.
- **Modelos Prontos (Presets)**: Carregue com 1 clique modelos clássicos como *Estudo da Casa*, *Coração Geométrico*, *Foguete em Decolagem*, *Emoticon Sorridente* e *Tipografia (Glifo 'A')*.
- **Rasterização em Tempo Real (32 × 20)**: Observe como cada traço contínuo é amostrado e convertido em uma matriz discreta de dados.
- **Processamento de Imagem & Filtros**:
  - *Original*: Matriz com as cores puras.
  - *Cinza*: Cálculo de luminância perceptual humana ($Y = 0.299R + 0.587G + 0.114B$).
  - *Desfoque (Blur)*: Convolução e suavização espacial pela média dos vizinhos 3×3.
  - *Detecção de Bordas*: Identificação de descontinuidades bruscas de contraste (gradientes tipo Sobel).
- **Extrusão 3D Voxel Interativa**:
  - Cada pixel ativo é renderizado como um bloco 3D com iluminação e sombras em tempo real via Three.js e React Three Fiber.
  - Controles de órbita suaves (arraste para girar, role o mouse para zoom).
  - Botões flutuantes para Aproximar (+), Afastar (-) e Restaurar Câmera (↺).
- **Exportação PNG**: Exporte o resultado da sua composição em alta qualidade.

---

## 🛠️ Tecnologias

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Three.js** & **@react-three/fiber** / **@react-three/drei**
- **Lucide Icons**
- **Tailwind CSS v4**
