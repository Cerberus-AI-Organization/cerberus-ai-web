import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './global.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import DevHome from '@/routes/dev_home/DevHome.tsx'
import Dashboard from "./routes/dashboard/Dashboard.tsx";
import NotFound from "./routes/not_found/NotFound.tsx";
import LoginPage from "./routes/login/LoginPage.tsx";
import {AuthProvider} from "./states/AuthContext.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import AccessDeniedPage from "./routes/access_denied/AccessDeniedPage.tsx";
import {ThemeProvider} from "@/states/ThemeProvider.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import AdminDashboardPage from "./routes/admin_dashboard/AdminDashboardPage.tsx"
import Home from "@/routes/home/Home.tsx";

const router = createBrowserRouter([
  {path: '/', element: <Home/>},
  {path: '/login', element: <LoginPage/>},
  {path: '/access_denied', element: <AccessDeniedPage/>},
  {path: '/dev', element: <DevHome/>},
  {
    path: '/dashboard',
    element: <ProtectedRoute/>,
    children: [
      {index: true, element: <Dashboard/>},
      {
        path: 'admin', element: <ProtectedRoute requireAdmin/>,
        children: [
          {index: true, element: <AdminDashboardPage />}
        ]
      }
    ]
  },
  {path: '*', element: <NotFound/>}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="w-screen h-[100dvh] overflow-hidden max-w-screen max-h-[100dvh]">
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-center" />
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </div>
  </StrictMode>,
)