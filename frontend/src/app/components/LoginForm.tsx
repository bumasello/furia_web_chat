"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

import type { ChangeEvent, FormEvent, JSX } from "react";

export default function LoginForm(): JSX.Element {
  const { login } = useAuth();
  const css =
    "w-[400px] text-black rounded-lg border border-gray-200 py-2 px-6 bg-zinc-100";

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email || !password) {
      setError("Por favor preencher todos os campos.");
      return;
    }

    try {
      const res = await fetch(
        "https://furia-web-chat-api.onrender.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        const detail = data.data;
        throw new Error(detail);
      }

      login(data.token, data.user, data.username);

      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Ocorreu um erro inesperado.");
      }
    }
  };
  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-blue-500 bg-gray-900">
        <h1 className="text-xl font-bold my-4">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            type="text"
            placeholder="Email"
            className={css}
          />
          <input
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            type="password"
            placeholder="Password"
            className={css}
          />
          <button className="bg-blue-500 rounded-md text-white font-bold cursor-pointer px-6 py-2">
            Login
          </button>
          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          <Link className="w-fit text-sm mt-3 text-right" href={"/register"}>
            Não tem uma conta? <span className="underline">Criar</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
