import {cn} from "@/lib/utils.ts"
import {Button} from "@/components/ui/button.tsx"
import {Card, CardContent} from "@/components/ui/card.tsx"
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Loader2, Mail} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {useState} from "react"

export function LoginForm({
                            onLoginSubmit,
                            isAuthenticating = false,
                            className,
                            ...props
                          }: React.ComponentProps<"div"> & {
  onLoginSubmit?: (email: string, password: string) => void,
  isAuthenticating: boolean,
}) {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")!.toString()
    const password = formData.get("password")!.toString()

    onLoginSubmit?.(email, password)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your CerberusAI account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsResetDialogOpen(true)
                    }}
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </Field>
              <Field>
                <Button disabled={isAuthenticating} type="submit">
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      Please wait
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Field>
              {/*<FieldDescription className="text-center">*/}
              {/*  Don&apos;t have an account? <a href="#">Sign up</a>*/}
              {/*</FieldDescription>*/}
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden overflow-hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-blue-500/60 to-blue-500/90"/>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5"/>
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Please contact your system administrator to reset your password.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/*<FieldDescription className="px-6 text-center">*/}
      {/*  By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}*/}
      {/*  and <a href="#">Privacy Policy</a>.*/}
      {/*</FieldDescription>*/}
    </div>
  )
}