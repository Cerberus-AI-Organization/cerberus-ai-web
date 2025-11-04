import {Loader2} from "lucide-react";

type LoadingProps = {
  title?: string;
  description?: string;
  extra?: React.ReactNode;
};

function Loading({title, description, extra}: LoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary"/>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {title ?? "Loading..."}
        </h2>
        <p className="text-muted-foreground">
          {description ?? "Please wait while we load the page."}
        </p>
        {extra && <div className="mt-4">{extra}</div>}
      </div>
    </div>
  );
}

export default Loading;