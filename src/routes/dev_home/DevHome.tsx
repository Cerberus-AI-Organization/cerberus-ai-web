import {Link, useNavigate} from "react-router-dom"
import {LayoutDashboard, LogOut, Moon, ShieldCheck, Sun, TestTube} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card} from "@/components/ui/card"
import {useAuth} from "@/states/AuthContext.tsx";
import {useTheme} from "@/states/ThemeProvider.tsx";
import {useEffect} from "react";

function DevHome() {
  const navigate = useNavigate();
  const {isAuthenticated, logout} = useAuth();
  const {theme, setTheme} = useTheme();

  useEffect(() => {
    const isDev = window.location.hostname === "localhost";
    if(!isDev) {
      navigate("/");
    }
  }, [])

  return (
    <div className="min-h-screen bg-muted p-8">
      <Card className="max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Developer Home</h1>

        <div className="flex flex-col space-y-4">
          <Button
            asChild
            variant="outline"
            className="w-full justify-start"
          >
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4"/>
              Dashboard
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full justify-start"
          >
            <Link to="/dashboard/admin">
              <ShieldCheck className="mr-2 h-4 w-4"/>
              Admin Dashboard
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full justify-start"
          >
            <Link to="/test">
              <TestTube className="mr-2 h-4 w-4"/>
              Test
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4"/>
            ) : (
              <Moon className="mr-2 h-4 w-4"/>
            )}
            Switch Theme
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={!isAuthenticated}
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4"/>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default DevHome