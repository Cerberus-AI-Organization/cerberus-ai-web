import {useEffect, useState} from "react";
import {useAuth} from "../../states/AuthContext.tsx";
import {useNavigate, useSearchParams} from "react-router-dom";
import {LoginForm} from "@/routes/login/LoginForm.tsx";
import {toast} from "sonner"

function LoginPage () {
  const [searchParams] = useSearchParams();
  const navigate =  useNavigate()

  const {login, isAuthenticated} = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(searchParams.get('redirect') || '/');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Please fill all fields")
      return;
    }

    setIsAuthenticating(true);
    try {
      const success = await login(email, password);

      if (success) {
        toast.success("Login successful")
      } else {
        toast.error("Invalid email or password")
      }
    } catch {
      toast.error("Error logging in")
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm isAuthenticating={isAuthenticating}
                   onLoginSubmit={(email, password) => {
          handleSubmit(email, password);
        }}/>
      </div>
    </div>
  );
}

export default LoginPage;