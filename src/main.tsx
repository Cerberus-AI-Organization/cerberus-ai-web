import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Home from './routes/home/Home.tsx'
import Dashboard from "./routes/dashboard/Dashboard.tsx";
import AdminDashboardPage from "./routes/admin_dashboard/AdminDashboardPage.tsx";
import NotFound from "./routes/not_found/NotFound.tsx";
import LoginPage from "./routes/login/LoginPage.tsx";
import {AuthProvider} from "./states/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import '@ant-design/v5-patch-for-react-19';
import AccessDeniedPage from "./routes/access_denied/AccessDeniedPage.tsx";
import {ThemeProvider} from "./states/ThemeContext.tsx";
import TestLayout from "./routes/TestLayout.tsx";

const router = createBrowserRouter([
  {path: '/', element: <Home/>},
  {path: '/login', element: <LoginPage/>},
  {path: '/access_denied', element: <AccessDeniedPage/>},
  {path: '/test', element: <TestLayout/>},
  {
    path: '/dashboard',
    element: <ProtectedRoute/>,
    children: [
      {index: true, element: <Dashboard/>},
      {
        path: 'admin', element: <ProtectedRoute requireAdmin/>,
        children: [
          {index: true, element: <AdminDashboardPage/>}
        ]
      }
    ]
  },
  {path: '*', element: <NotFound/>}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="w-screen h-screen">
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router}/>
        </AuthProvider>
      </ThemeProvider>
    </div>
  </StrictMode>,
)