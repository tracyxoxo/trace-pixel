# 🎨 Traço & Pixel

> **Laboratório Visual e Interativo de Computação Gráfica**  
> Uma experiência educativa e intuitiva que conecta o desenho vetorial contínuo à computação discreta: veja como traços matemáticos viram grades de pixels em tempo real, aplique filtros digitais e explore o resultado em 3D.

---

## 📋 Sumário
1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Pré-requisito Essencial: Instalação do Node.js](#-pré-requisito-essencial-instalação-do-nodejs)
   - [O que é o Node.js?](#o-que-é-o-nodejs)
   - [Passo a Passo de Instalação (Windows)](#passo-a-passo-de-instalação-windows)
   - [Como Testar se Foi Instalado Corretamente](#como-testar-se-foi-instalado-corretamente)
   - [Resolvendo Problemas Comuns com o Node.js](#resolvendo-problemas-comuns-com-o-nodejs)
3. [Como Inicializar o Projeto](#-como-inicializar-o-projeto)
   - [Opção 1: 1 Clique no Windows (Recomendado)](#opção-1-1-clique-no-windows-iniciarbat)
   - [Opção 2: Pelo Terminal / Linha de Comando](#opção-2-pelo-terminal--linha-de-comando)
4. [Como Usar o Estúdio](#-como-usar-o-estúdio)
   - [Tutorial Interativo Integrado](#tutorial-interativo-integrado)
   - [Modelos Prontos (Presets)](#modelos-prontos-presets)
   - [Ferramentas de Desenho](#ferramentas-de-desenho)
   - [Modos de Visualização (Vetor, Pixels e 3D)](#modos-de-visualização)
   - [Filtros de Processamento de Imagem](#filtros-de-processamento-de-imagem)
5. [Estrutura do Código-Fonte](#-estrutura-do-código-fonte)
6. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
7. [Dúvidas Frequentes (FAQ)](#-dúvidas-frequentes-faq)

---

## 💡 Sobre o Projeto

Quando desenhamos em uma tela de computador, o software lida com equações geométricas perfeitas (retas, arcos, curvas de Bézier). No entanto, o monitor físico é composto por uma malha fixa de quadradinhos: os **pixels**.

O **Traço & Pixel** foi criado para tornar esse processo tangível, visual e educativo:
- **01. Vetor**: Desenhe formas livres ou geométricas em alta precisão.
- **02. Rasterização**: O sistema calcula em tempo real a cor média de cada célula em uma grade de **32 × 20 pixels**.
- **03. Filtros Digitais**: Aplique algoritmos fundamentais de Visão Computacional (Escala de Cinza por luminância, Desfoque por convolução e Detecção de Bordas tipo Sobel).
- **04. Profundidade 3D**: Cada pixel ativo ganha volume, sombras e iluminação dinâmica, transformando seu desenho em uma escultura voxel navegável.

---

## ⚙️ Pré-requisito Essencial: Instalação do Node.js

Para rodar o **Traço & Pixel** no seu computador, é necessário ter o **Node.js** instalado.

### O que é o Node.js?
O Node.js é o ambiente que permite executar código JavaScript fora do navegador. Ele vem acompanhado do **npm** (*Node Package Manager*), que gerencia as bibliotecas que fazem o Next.js, o React e o Three.js funcionarem.

> [!IMPORTANT]
> A versão mínima recomendada para este projeto é o **Node.js 18.x** ou superior (recomendamos a versão **20.x LTS** ou **22.x LTS**).

---

### Passo a Passo de Instalação (Windows)

1. **Acesse o site oficial:**
   Abra seu navegador e acesse: [**https://nodejs.org**](https://nodejs.org)

2. **Baixe a versão recomendada (LTS):**
   - Na página inicial, clique no botão verde que diz **"LTS (Recommended for Most Users)"** ou **"Recomendado para a maioria dos usuários"**.
   - O download de um instalador `.msi` (ex: `node-v20.x.x-x64.msi`) começará automaticamente.

3. **Execute o instalador:**
   - Dê dois cliques no arquivo baixado na sua pasta de *Downloads*.
   - Clique em **Next** na primeira tela.
   - Marque a opção aceitando os termos de licença (*I accept the terms in the License Agreement*) e clique em **Next**.
   - Escolha o diretório padrão (não precisa mudar nada) e clique em **Next**.

4. **Configuração de Componentes (Importante):**
   - Na tela *Custom Setup*, certifique-se de que a opção **"Add to PATH"** está ativada (ela já vem selecionada por padrão com um ícone de disco rígido). **Isso é essencial para o Windows reconhecer o comando `node`**.
   - Clique em **Next**.

5. **Ferramentas Adicionais (Tools for Native Modules):**
   - Você verá uma tela perguntando se deseja instalar automaticamente ferramentas como Chocolatey/Python. **Pode deixar desmarcado** e clicar em **Next**.

6. **Concluir a instalação:**
   - Clique em **Install**. O Windows pode pedir permissão de Administrador (clique em *Sim*).
   - Ao terminar, clique em **Finish**.

---

### Como Testar se Foi Instalado Corretamente

1. Abra o **Prompt de Comando** (digite `cmd` no Menu Iniciar) ou o **PowerShell**.
2. Digite o comando abaixo e aperte <kbd>Enter</kbd>:
   ```bash
   node -v
   ```
   *Deve aparecer algo como `v20.18.0` ou similar.*

3. Digite o comando para testar o gerenciador de pacotes:
   ```bash
   npm -v
   ```
   *Deve aparecer algo como `10.8.2` ou similar.*

Se ambos responderem com números de versão, o Node.js está **100% configurado e pronto para uso!** 🎉

---

### Resolvendo Problemas Comuns com o Node.js

#### ❌ Erro: *"'node' não é reconhecido como um comando interno ou externo"*
- **Causa:** O terminal estava aberto antes da instalação terminar, ou a variável de ambiente `PATH` ainda não foi recarregada pelo Windows.
- **Solução:**
  1. Feche **todas** as janelas abertas do Prompt de Comando, PowerShell ou VS Code.
  2. Abra uma nova janela do terminal e teste novamente com `node -v`.
  3. Se ainda assim não reconhecer, reinicie o computador para que o Windows atualize as variáveis de ambiente do sistema.

---

## 🚀 Como Inicializar o Projeto

Com o Node.js instalado, você tem duas formas de iniciar o estúdio:

### Opção 1: 1 Clique no Windows (`iniciar.bat`)
A forma mais rápida e prática! Não precisa digitar nenhum comando no terminal.

1. Abra a pasta do projeto no Explorador de Arquivos.
2. Dê dois cliques sobre o arquivo:
   ```cmd
   iniciar.bat
   ```
   *(ou no atalho `start.bat`)*

**O que o `iniciar.bat` faz automaticamente por você:**
1. Valida se o Node.js está presente no sistema (caso não esteja, avisa amigavelmente onde baixar).
2. Se for a primeira vez que você abre, executa o `npm install` para baixar as dependências necessárias.
3. Garante que a porta 3000 esteja livre antes de subir o servidor, evitando travamentos.
4. Inicia o servidor local do Next.js.
5. Abre automaticamente o projeto no seu navegador padrão no endereço **http://localhost:3000**.

> [!TIP]
> Para fechar o servidor quando terminar de usar, basta fechar a janela preta do terminal ou pressionar <kbd>Ctrl</kbd> + <kbd>C</kbd>.

---

### Opção 2: Pelo Terminal / Linha de Comando
Se você prefere o terminal ou está em outro sistema operacional (macOS / Linux):

1. Abra o terminal na pasta raiz do projeto:
   ```bash
   cd caminho/para/trace-pixel
   ```

2. Instale as dependências (necessário apenas na primeira execução ou após atualizações):
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra seu navegador e acesse:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🎮 Como Usar o Estúdio

### Tutorial Interativo Integrado
Ao abrir o projeto pela primeira vez, uma janela de boas-vindas com **5 passos didáticos** é exibida automaticamente. Você pode navegar com as setas do teclado (<kbd>←</kbd> / <kbd>→</kbd>) ou pelo mouse.

Para rever o tutorial a qualquer momento, clique no botão destacado **`✨ Como Usar`** no topo da página.

---

### Modelos Prontos (Presets)
Para não começar com o quadro em branco, clique no seletor **MODELO ATIVO** no topo da tela e experimente:
- 🏡 **Estudo da Casa**: Casa com telhado poligonal, janelas e sol.
- ❤️ **Coração Geométrico**: Curvas e simetria ótimas para testar o filtro de bordas.
- 🚀 **Foguete em Decolagem**: Linhas inclinadas que mostram o efeito de escada (*aliasing*) na rasterização.
- 😊 **Emoticon Sorridente**: Ilustração amigável com círculos e arcos.
- 🔤 **Tipografia (Glifo 'A')**: O clássico desafio da computação gráfica de renderizar fontes vetoriais em matrizes de baixa resolução.

---

### Ferramentas de Desenho (Barra Esquerda)
- **Selecionar**: Cursor livre para navegar sem riscar a tela.
- **Lápis**: Traço livre contínuo com interpolação suave.
- **Linha**: Reta precisa entre dois pontos.
- **Retângulo**: Caixas proporcionais.
- **Círculo**: Círculos traçados a partir do centro até o raio desejado.
- **Polígono**: Clique em vários pontos no quadro para definir vértices. Ao ter 3 ou mais pontos, o botão **"Fechar polígono"** ficará verde para concluir a forma fechada.
- **Borracha**: Apaga partes do desenho usando a cor base do papel.
- **Paleta de Tintas**: Cores curadas (*Verde Tinta, Terracota, Mostarda Ocre e Sálvia*).
- **Espessura**: Controle deslizante de 2px a 18px.

---

### Modos de Visualização
Na barra superior da prancheta, alterne entre os 3 modos:
1. **Desenho Vetorial**: Visualização das linhas matemáticas puras e suaves.
2. **Pixels (Raster)**: A malha discreta de 32 × 20 células coloridas calculadas pela média ponderada de tinta.
3. **Profundidade 3D**: Extrusão volumétrica de cada pixel em blocos 3D iluminados com sombras:
   - **Girar / Orbitar**: Clique e arraste com o botão esquerdo do mouse.
   - **Zoom**: Use a roda do mouse ou os botões flutuantes **`+`** e **`-`** no canto superior direito da cena.
   - **Restaurar**: Clique no botão **`↺`** para voltar a câmera à posição inicial.

---

### Filtros de Processamento de Imagem (Painel Direito)
Clique sobre os filtros para aplicar transformações matemáticas na matriz:
- **01. Original**: Exibe as cores capturadas na rasterização.
- **02. Cinza**: Converte RGB em luminância perceptual humana ($Y = 0.299R + 0.587G + 0.114B$).
- **03. Desfoque (Blur)**: Convolução espacial que calcula a média das 8 células vizinhas (suavização $3 \times 3$).
- **04. Bordas**: Algoritmo de gradiente que destaca apenas os contornos onde há transição brusca de cor/luminância.

---

## 📂 Estrutura do Código-Fonte

```text
trace-pixel/
├── iniciar.bat                  # Inicializador rápido com 1 clique para Windows
├── start.bat                    # Atalho secundário para o iniciar.bat
├── package.json                 # Dependências e scripts do projeto
├── README.md                    # Documentação completa
├── src/
│   └── app/
│       ├── page.tsx             # Ponto de entrada da aplicação Next.js
│       ├── layout.tsx           # Layout raiz, fontes Geist e metadados
│       ├── globals.css          # Design system, temas, tokens e regras de layout
│       ├── studio.tsx           # Componente principal do estúdio, estado e canvas 2D
│       ├── pixel-scene.tsx      # Renderizador tridimensional Three.js / R3F com controles
│       ├── types.ts             # Tipos TypeScript centralizados (Shape, Filter, Tool, etc.)
│       ├── components/
│       │   └── tutorial-modal.tsx # Modal interativo com o guia passo a passo
│       └── constants/
│           └── presets.ts       # Modelos pré-desenhados (Casa, Coração, Foguete, etc.)
```

---

## 🛠️ Tecnologias Utilizadas

- **[Next.js 16](https://nextjs.org/)** (App Router & Turbopack para compilação instantânea)
- **[React 19](https://react.dev/)** (Interface declarativa e componentes modulares)
- **[Three.js](https://threejs.org/)** + **[@react-three/fiber](https://r3f.docs.pmnd.rs/)** + **[@react-three/drei](https://github.com/pmndrs/drei)** (Cena 3D acelerada por hardware via WebGL)
- **[Tailwind CSS v4](https://tailwindcss.com/)** (Estilização moderna e responsiva)
- **[Lucide React](https://lucide.dev/)** (Ícones SVG consistentes e leves)
- **Canvas API (HTML5)** (Renderização vetorial 2D e amostragem de dados via `getImageData`)

---

## ❓ Dúvidas Frequentes (FAQ)

### 1. O que fazer se a porta 3000 estiver ocupada?
O script `iniciar.bat` já possui uma instrução para limpar processos anteriores na porta 3000 automaticamente. Se você estiver rodando manualmente pelo terminal e receber esse aviso, pode encerrar o processo no Windows com o comando:
```cmd
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"
```

### 2. O projeto funciona sem internet?
Sim! Após a primeira execução (onde o `npm install` baixa as bibliotecas necessárias), todo o processamento de imagem, a rasterização e a renderização 3D acontecem **100% localmente no seu navegador**.

### 3. Como exportar meu desenho?
Clique no botão preto **`Exportar`** no canto superior direito do cabeçalho. O sistema gerará um arquivo `.png` com o nome da sua composição pronto para download.

---

Feito com dedicação para estudos e exploração de **Computação Visual e Gráfica**.
