"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent, JSX } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm(): JSX.Element {
  const css =
    "w-[400px] text-black rounded-lg border border-gray-200 py-2 px-6 bg-zinc-100";

  const [first_name, setFirst] = useState<string>("");
  const [last_name, setLast] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!first_name || !email || !password || !username) {
      setError("Primeiro nome, Email, Username e Password são obrigatórios.");
      return;
    }

    try {
      const res = await fetch("/user/createuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          username,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const detail = data.data;
        throw new Error(detail);
      }

      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error)
        setError(error.message || "Ocorreu um erro inesperado.");
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-blue-500 bg-gray-900">
        <h1 className="text-xl font-bold my-4">Criar Conta</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFirst(e.target.value)
            }
            type="text"
            placeholder="First Name"
            className={css}
          />
          <input
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLast(e.target.value)
            }
            type="text"
            placeholder="Last Name"
            className={css}
          />
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
              setUsername(e.target.value)
            }
            type="text"
            placeholder="Username"
            className={css}
          />
          <input
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            type="password"
            placeholder="Senha"
            className={css}
          />

          <button
            type="submit"
            className="bg-blue-500 rounded-md text-white font-bold cursor-pointer px-6 py-2"
          >
            Registrar
          </button>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          <Link className="w-fit text-sm mt-3 text-right" href={"/"}>
            Já possui uma conta? <span className="underline">Entrar</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
