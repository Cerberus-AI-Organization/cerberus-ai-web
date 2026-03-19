import {useState} from "react"
import {Eye, EyeOff, KeyRound, UserCircle2, Sparkles} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Separator} from "@/components/ui/separator"
import {toast} from "sonner"
import type {User} from "@/types/user"
import {API_URL} from "@/lib/api.ts";
import {useAuth} from "@/states/AuthContext.tsx";

// ─── Password strength ────────────────────────────────────────────────────────

type StrengthLevel = {
  label: string
  color: string
  bars: number
}

const STRENGTH_LEVELS: StrengthLevel[] = [
  {label: "Catastrophic",  color: "bg-red-600",    bars: 1},
  {label: "Weak",          color: "bg-orange-500", bars: 2},
  {label: "Okay",          color: "bg-yellow-400", bars: 3},
  {label: "Good",          color: "bg-lime-500",   bars: 4},
  {label: "Strong",        color: "bg-green-500",  bars: 5},
]

function getStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function PasswordStrengthBar({password}: {password: string}) {
  const score = getStrength(password)

  const adjustedScore = Math.max(0, Math.min(score, STRENGTH_LEVELS.length - 1));
  const level = STRENGTH_LEVELS[adjustedScore];

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {STRENGTH_LEVELS.map((_l, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < score ? level.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {level.label}
          {score < 3 && " — try adding numbers, symbols or uppercase letters"}
        </p>
      )}
    </div>
  )
}

// ─── Sub-forms ────────────────────────────────────────────────────────────────

function ProfileTab({user}: {user: User}) {
  const [name, setName] = useState(user.name)
  const [loading, setLoading] = useState(false)
  const {token, fetchCurrentUser} = useAuth()

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty")
      return
    }
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          email: user.email,
          password: null,
          role: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update username');
      }

      await fetchCurrentUser();
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Failed to update username');
    }

    setLoading(false)
    toast.success("Name updated")
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user.email}
          disabled
          className="text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>

      <Button onClick={handleSave} disabled={loading || name === user.name} className="w-full">
        {loading ? "Saving…" : "Save changes"}
      </Button>
    </div>
  )
}

function PasswordTab({user}: {user: User}) {
  const [oldPassword, setOldPassword]   = useState("")
  const [newPassword, setNewPassword]   = useState("")
  const [confirmPass, setConfirmPass]   = useState("")
  const [showOld, setShowOld]           = useState(false)
  const [showNew, setShowNew]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const {token} = useAuth()

  const strength = getStrength(newPassword)
  const mismatch = confirmPass.length > 0 && newPassword !== confirmPass

  const handleSave = async () => {
    if (!oldPassword) { toast.error("Enter your current password"); return }
    if (strength < 3)  { toast.error("New password is too weak");    return }
    if (newPassword !== confirmPass) { toast.error("Passwords don't match"); return }
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/users/${user.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      toast.success("Password changed")
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }

    setLoading(false)
    toast.success("Password changed")
    setOldPassword(""); setNewPassword(""); setConfirmPass("")
  }

  const ToggleButton = ({show, onToggle}: {show: boolean; onToggle: () => void}) => (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
    >
      {show ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
    </button>
  )

  return (
    <div className="space-y-4 pt-2">
      {/* Old password */}
      <div className="space-y-1.5">
        <Label htmlFor="old-pass">Current password</Label>
        <div className="relative">
          <Input
            id="old-pass"
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            placeholder="••••••••"
            className="pr-10"
          />
          <ToggleButton show={showOld} onToggle={() => setShowOld(v => !v)}/>
        </div>
      </div>

      <Separator/>

      {/* New password */}
      <div className="space-y-1.5">
        <Label htmlFor="new-pass">New password</Label>
        <div className="relative">
          <Input
            id="new-pass"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="pr-10"
          />
          <ToggleButton show={showNew} onToggle={() => setShowNew(v => !v)}/>
        </div>
        <PasswordStrengthBar password={newPassword}/>
      </div>

      {/* Confirm */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm-pass">Confirm new password</Label>
        <div className="relative">
          <Input
            id="confirm-pass"
            type={showConfirm ? "text" : "password"}
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            placeholder="••••••••"
            className={`pr-10 ${mismatch ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
          <ToggleButton show={showConfirm} onToggle={() => setShowConfirm(v => !v)}/>
        </div>
        {mismatch && (
          <p className="text-xs text-red-500">Passwords don't match</p>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={loading || !oldPassword || !newPassword || !confirmPass}
        className="w-full"
      >
        {loading ? "Updating…" : "Change password"}
      </Button>
    </div>
  )
}

function ContextTab() {
  return (
    <div className="pt-2 space-y-3">
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center space-y-2">
        <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/50"/>
        <p className="text-sm font-medium text-muted-foreground">User context — coming soon</p>
        <p className="text-xs text-muted-foreground/70">
          You'll be able to set preferences and context that personalise your experience.
        </p>
      </div>
    </div>
  )
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

type AccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

function AccountDialog({open, onOpenChange, user}: AccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="profile"  className="flex-1 gap-1.5"><UserCircle2 className="h-3.5 w-3.5"/> Profile</TabsTrigger>
            <TabsTrigger value="password" className="flex-1 gap-1.5"><KeyRound    className="h-3.5 w-3.5"/> Password</TabsTrigger>
            <TabsTrigger value="context"  className="flex-1 gap-1.5"><Sparkles    className="h-3.5 w-3.5"/> Context</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab user={user}/>
          </TabsContent>

          <TabsContent value="password">
            <PasswordTab user={user}/>
          </TabsContent>

          <TabsContent value="context">
            <ContextTab/>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AccountDialog;