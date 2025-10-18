import { FormEvent, useState } from "react";
import { login } from "@/services/api";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErr(null);
    try {
      await login(email, pwd);
      window.location.href = "/";
    } catch {
      setErr("Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/brand/login-eclipse-desktop.png')] bg-cover">
      <form
        onSubmit={submit}
        className="w-[360px] rounded-2xl p-6 bg-black/70 backdrop-blur text-white space-y-4"
      >
        <div className="text-center">
          <img src="/brand/noah-logo.svg" alt="NOAH" className="mx-auto h-10" />
          <h1 className="mt-4 text-2xl font-semibold">Acessar</h1>
        </div>

        <div className="space-y-2">
          <label className="text-sm">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full h-11 rounded-xl bg-neutral-900 px-3 outline-none focus:ring-2 focus:ring-[#C3FF00]"
            placeholder="email@empresa.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Senha</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pwd}
              onChange={(event) => setPwd(event.target.value)}
              className="w-full h-11 rounded-xl bg-neutral-900 px-3 pr-10 outline-none focus:ring-2 focus:ring-[#C3FF00]"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShow((state) => !state)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-800"
              aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-[#C3FF00] hover:opacity-90 text-black font-medium"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
