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
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { 
        path: "admin", 
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "recycling-center", 
        element: (
          <ProtectedRoute allowedRoles={["recycling_center"]}>
            <RecyclingCenterDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "collector", 
        element: (
          <ProtectedRoute allowedRoles={["collector"]}>
            <CollectorDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "user", 
        element: (
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "guest", 
        element: (
          <ProtectedRoute allowedRoles={["guest"]}>
            <GuestView />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "profile", 
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "settings", 
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ) 
      },
      { path: "help", Component: HelpSupport },
      { path: "*", Component: NotFound },
    ],
  },
]);
