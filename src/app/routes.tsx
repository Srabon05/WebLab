import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { AdminDashboard } from "./components/AdminDashboard";
import { RecyclingCenterDashboard } from "./components/RecyclingCenterDashboard";
import { CollectorDashboard } from "./components/CollectorDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { GuestView } from "./components/GuestView";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { HelpSupport } from "./components/HelpSupport";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "admin", Component: AdminDashboard },
      { path: "recycling-center", Component: RecyclingCenterDashboard },
      { path: "collector", Component: CollectorDashboard },
      { path: "user", Component: UserDashboard },
      { path: "guest", Component: GuestView },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
      { path: "help", Component: HelpSupport },
      { path: "*", Component: NotFound },
    ],
  },
]);
