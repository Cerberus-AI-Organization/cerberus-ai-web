import {useNavigate} from 'react-router-dom';
import {Button} from "@/components/ui/button";
import {AlertTriangle} from "lucide-react";

function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 box-border bg-background-secondary">
      <div className="flex flex-col items-center gap-6">
        <AlertTriangle className="h-12 w-12 text-warning"/>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Unauthorized
          </h1>

          <p className="text-muted-foreground">
            Sorry, you are not authorized to access this page.
          </p>
        </div>

        <Button
          variant="default"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export default AccessDeniedPage;