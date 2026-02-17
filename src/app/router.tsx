import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";

import LoginPage from "@/features/auth/LoginPage";
import TripsLayout from "@/features/trips/TripsLayout";

export const router = createBrowserRouter([

  { path: "/login", element: <LoginPage /> },
  {
    element: <RootLayout />,
    children: [
      {
        path: "/trips",
        element: <TripsLayout />,
      },
    ],
  },
]);
