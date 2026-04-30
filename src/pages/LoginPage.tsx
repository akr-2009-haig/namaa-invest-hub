import { useNavigate } from "react-router-dom";
import { LoginDialog } from "@/components/auth/LoginDialog";

export function LoginPage() {
  const nav = useNavigate();
  return <LoginDialog onClose={() => nav("/")} onSwitchToRegister={() => nav("/register")} />;
}
