# TravelApp Web

Frontend application for the TravelApp ecosystem.

This project consumes the TravelApp REST API and provides an interactive interface for planning trips, managing expenses and tracking budget health in real time.

The focus of this frontend is not only UI — but **state synchronization with domain rules coming from the backend**.

---

## Tech Stack

* React 18
* TypeScript
* Vite
* React Router
* Context API
* Modular feature-based architecture

---

## Core Concepts

This frontend was designed to behave like a real SaaS client:

Instead of duplicating business logic in the UI, the frontend:

* fetches aggregated summary from API
* reacts to domain state changes
* updates views automatically after mutations

Example:

When an expense is created →
Budget health updates →
Trip summary updates →
Progress bar updates

No manual refresh required.

---

## Features

### Authentication

* JWT login
* Token persistence in localStorage
* Automatic authenticated requests

### Trips

* View trips
* Navigate between modules

### Summary

* Aggregated trip information
* Budget health visualization
* Real-time synchronization

### Budget

* Configure trip budget
* Immediate UI feedback

### Expenses

* CRUD expenses
* Category selection
* Auto refresh summary

---

## Budget Health Visualization

The UI reflects backend domain state:

| Status   | Meaning |
| -------- | ------- |
| Healthy  | < 70%   |
| Warning  | < 90%   |
| Danger   | < 100%  |
| Exceeded | > 100%  |

The progress bar is a visual representation of a backend domain calculation — not a frontend estimate.

---

## Project Structure

Feature oriented organization:

```
src/
  app/            → providers and router
  domain/         → shared domain contracts (budget health)
  features/       → application modules
      auth/
      trips/
      trip-summary/
  pages/          → route screens
  shared/         → reusable UI and utilities
```

This avoids the traditional "components folder chaos".

---

## Running the project

### 1 — Install dependencies

```
npm install
```

### 2 — Configure API URL

Create `.env`:

```
VITE_API_URL=http://localhost:8080
```

### 3 — Run

```
npm run dev
```

App runs at:

```
http://localhost:5173
```

---

## Backend Dependency

This app requires the TravelApp API running locally:

```
http://localhost:8080
```

---

## Design Decisions

* Domain state lives in backend
* Frontend reflects backend truth
* No duplicated calculations
* UI reacts to mutations via refreshKey pattern

This simulates real world enterprise frontends where consistency matters more than local state hacks.

---

## Future Improvements

* React Query for caching
* Optimistic updates
* Offline support
* Dark/light theme
* Mobile responsive layout

---

## Author

Paulo Henrique dos Anjos
