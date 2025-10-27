import {Navigate, Outlet, useLocation} from "react-router-dom";
import { useAuth } from "../states/AuthContext";
import Loading from "./Loading.tsx";

type Props = {
  requireAdmin?: boolean;
};

function ProtectedRoute({ requireAdmin = false }: Props) {
  const { user, isAuthenticated, isFetching } = useAuth();
  const location = useLocation();

  console.log(user, isAuthenticated, isFetching);
  
  if (isFetching && !isAuthenticated) {
    return (
      <Loading
        title={'Authenticating...'}
        description={'Please wait while we authenticate you.'}
      />
    );
  }

  if (!isAuthenticated) {
    const currentPath = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?redirect_path=${currentPath}`} replace/>;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/access_denied" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;