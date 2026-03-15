# TravelApp Frontend

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> [Ler em Português (Read in Portuguese)](README.pt-BR.md)

## 🌍 Overview

**TravelApp Frontend** is the client-side application for the TravelApp ecosystem, designed to provide a seamless experience for planning trips, managing itineraries, and tracking travel expenses.

This project goes beyond a simple UI; it focuses on **state synchronization with domain rules from the backend**, ensuring that budget health indicators and trip summaries always reflect the real-time state of the server. It acts as a true SaaS client, reacting to data mutations instantly.

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🔐 Authentication** | Secure JWT-based login with token persistence and automatic redirection. |
| **✈️ Trip Management** | Create, view, and manage trips with destination autocomplete (Countries & Cities). |
| **📅 Itinerary Planning** | Organize activities by day and keep track of your schedule. |
| **💰 Budget Tracking** | Real-time budget health visualization (Healthy, Warning, Danger, Exceeded). |
| **💸 Expense Manager** | Log expenses with categories and instantly see the impact on your budget. |
| **theme Theme Support** | Fully integrated **Dark Mode** and Light Mode with automatic system detection. |

## 🛠️ Tech Stack

-   **Core**: React 18, TypeScript
-   **Build Tool**: Vite
-   **Routing**: React Router DOM v7
-   **HTTP Client**: Axios
-   **Icons**: Lucide React
-   **Styling**: Custom CSS Variables & Design Tokens (No external UI framework dependency)
-   **Architecture**: Modular Feature-based Architecture

## 📸 Screenshots

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="https://via.placeholder.com/400x250?text=Login+Screen" alt="Login Screen" width="400" />
  <img src="https://via.placeholder.com/400x250?text=Trips+Dashboard" alt="Trips Dashboard" width="400" />
  <img src="https://via.placeholder.com/400x250?text=Trip+Summary" alt="Trip Summary" width="400" />
  <img src="https://via.placeholder.com/400x250?text=Dark+Mode" alt="Dark Mode Support" width="400" />
</div>

>

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18 or higher)
-   **npm** or **yarn**
-   **TravelApp Backend** running locally (usually on port 8080)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/travelapp-frontend.git
    cd travelapp-frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_URL=http://localhost:8080
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

    The app will be available at `http://localhost:5173`.

## 📂 Project Structure

The project follows a **Feature-based Architecture** to ensure scalability and maintainability:

```
src/
├── api/            # API client and service definitions
├── app/            # App-wide providers and configuration
├── components/     # Shared generic components (Header, Inputs)
├── domain/         # Domain logic and type definitions
├── features/       # Feature-specific components and hooks
│   ├── auth/
│   ├── trips/
│   └── trip-summary/
├── pages/          # Route pages (Entry points)
├── shared/         # Shared utilities, UI tokens, and styles
│   ├── contexts/   # React Contexts (Theme, Auth)
│   └── ui/         # Design System tokens and primitives
└── main.tsx        # Application entry point
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the project.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the **MIT License**.

## 📞 Contact

**Paulo Henrique dos Anjos**

-   GitHub: [@Borkaart](https://github.com/Borkaart)
-   Email: pborkart@outlook.com
