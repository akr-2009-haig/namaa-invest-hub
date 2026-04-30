import { useNavigate } from "react-router-dom";
import { RegisterDialog } from "@/components/auth/RegisterDialog";

export function RegisterPage() {
  const nav = useNavigate();
  return <RegisterDialog onClose={() => nav("/")} />;
}
