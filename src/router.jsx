import { createBrowserRouter } from "react-router-dom";
import HeroLibraryPage from "./features/hero-hunt/HeroLibraryPage.jsx";
import { Shell } from "./features/hero-hunt/components.jsx";
import {
  HomePage,
  PlaySetupPage,
  GamePage,
  ResultsPage,
  StatsPage,
  ProfilePage,
  LegacyRedirect,
} from "./features/hero-hunt/pages.jsx";

// Legacy source remains in the repository for staged migration. It is not
// imported into the new guest-first app or exposed through public routes.
export const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/play", element: <PlaySetupPage /> },
      { path: "/play/solo", element: <GamePage /> },
      { path: "/results/:sessionId", element: <ResultsPage /> },
      { path: "/stats", element: <StatsPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/heroes", element: <HeroLibraryPage /> },
      { path: "*", element: <LegacyRedirect /> },
    ],
  },
]);
