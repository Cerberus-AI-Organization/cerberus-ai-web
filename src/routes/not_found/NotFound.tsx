import {Home} from "lucide-react"
import {Button} from "@/components/ui/button"
import {useNavigate} from "react-router-dom"

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="flex items-center gap-2 text-4xl font-bold">
          <span>404</span>
          <span className="text-muted-foreground">|</span>
          <span>Not Found</span>
        </h1>
        <p className="text-lg text-muted-foreground">The page you are looking for does not exist.</p>
        <Button
          variant="default"
          onClick={() => navigate('/')}
          className="mt-4"
        >
          <Home className="mr-2 h-4 w-4"/>
          Back to Home
        </Button>
      </div>
    </div>
  )
}

export default NotFound;