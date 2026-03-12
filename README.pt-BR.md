# TravelApp Frontend

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> [Read in English (Ler em Inglês)](README.md)

## 🌍 Visão Geral

**TravelApp Frontend** é a aplicação cliente do ecossistema TravelApp, projetada para oferecer uma experiência fluida no planejamento de viagens, gerenciamento de itinerários e acompanhamento de despesas de viagem.

Este projeto vai além de uma simples interface de usuário; ele foca na **sincronização de estado com regras de domínio do backend**, garantindo que indicadores de saúde do orçamento e resumos de viagem sempre reflitam o estado em tempo real do servidor. Atua como um verdadeiro cliente SaaS, reagindo instantaneamente a mutações de dados.

## ✨ Funcionalidades Principais

| Funcionalidade | Descrição |
| :--- | :--- |
| **🔐 Autenticação** | Login seguro baseado em JWT com persistência de token e redirecionamento automático. |
| **✈️ Gestão de Viagens** | Crie, visualize e gerencie viagens com autocompletar de destinos (Países e Cidades). |
| **📅 Planejamento de Itinerário** | Organize atividades por dia e mantenha o controle da sua agenda. |
| **💰 Acompanhamento de Orçamento** | Visualização da saúde do orçamento em tempo real (Saudável, Atenção, Perigo, Excedido). |
| **💸 Gerenciador de Despesas** | Registre despesas com categorias e veja instantaneamente o impacto no seu orçamento. |
| **🌓 Suporte a Temas** | **Modo Escuro (Dark Mode)** e Modo Claro totalmente integrados com detecção automática do sistema. |

## 🛠️ Tecnologias Utilizadas

-   **Core**: React 18, TypeScript
-   **Build Tool**: Vite
-   **Roteamento**: React Router DOM v7
-   **Cliente HTTP**: Axios
-   **Ícones**: Lucide React
-   **Estilização**: Variáveis CSS Personalizadas e Design Tokens (Sem dependência de frameworks de UI externos)
-   **Arquitetura**: Arquitetura Modular Baseada em Features

## 📸 Capturas de Tela

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="https://via.placeholder.com/400x250?text=Tela+de+Login" alt="Tela de Login" width="400" />
  <img src="https://via.placeholder.com/400x250?text=Dashboard+de+Viagens" alt="Dashboard de Viagens" width="400" />
  <img src="https://via.placeholder.com/400x250?text=Resumo+da+Viagem" alt="Resumo da Viagem" width="400" />
  <img src="https://via.placeholder.com/400x250?text=Modo+Escuro" alt="Suporte a Modo Escuro" width="400" />
</div>

> *Nota: Substitua os placeholders por capturas de tela reais da aplicação.*

## 🚀 Começando

### Pré-requisitos

-   **Node.js** (v18 ou superior)
-   **npm** ou **yarn**
-   **TravelApp Backend** rodando localmente (geralmente na porta 8080)

### Instalação

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/seu-usuario/travelapp-frontend.git
    cd travelapp-frontend
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Configure o Ambiente**
    Crie um arquivo `.env` no diretório raiz:
    ```env
    VITE_API_URL=http://localhost:8080
    ```

4.  **Execute a aplicação**
    ```bash
    npm run dev
    ```

    O app estará disponível em `http://localhost:5173`.

## 📂 Estrutura do Projeto

O projeto segue uma **Arquitetura Baseada em Features** para garantir escalabilidade e manutenibilidade:

```
src/
├── api/            # Cliente API e definições de serviço
├── app/            # Providers globais e configuração
├── components/     # Componentes genéricos compartilhados (Header, Inputs)
├── domain/         # Lógica de domínio e definições de tipos
├── features/       # Componentes e hooks específicos de features
│   ├── auth/
│   ├── trips/
│   └── trip-summary/
├── pages/          # Páginas de rota (Pontos de entrada)
├── shared/         # Utilitários compartilhados, tokens de UI e estilos
│   ├── contexts/   # Contextos React (Tema, Auth)
│   └── ui/         # Tokens e primitivos do Design System
└── main.tsx        # Ponto de entrada da aplicação
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estes passos:

1.  Faça um Fork do projeto.
2.  Crie uma branch para sua feature (`git checkout -b feature/MinhaFeatureIncrivel`).
3.  Faça o commit das suas mudanças (`git commit -m 'Adiciona MinhaFeatureIncrivel'`).
4.  Faça o push para a branch (`git push origin feature/MinhaFeatureIncrivel`).
5.  Abra um Pull Request.

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**.

## 📞 Contato

**Paulo Henrique dos Anjos**

-   GitHub: [@Borkaart](https://github.com/Borkaart)
-   Email: seu-email@exemplo.com
