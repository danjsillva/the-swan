"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleLoginClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setError("");

    const response = await fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    });

    if (!response.ok) {
      console.error(response);

      const { message } = await response.json();

      setError(message);

      return;
    }

    const { user, token } = await response.json();

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    window.location.href = "/";
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <section>
        <h1 className="text-3xl font-bold">Login</h1>
      </section>

      <form className="mt-5 w-full max-w-sm">
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            placeholder="Email"
            onChange={(e) => setLogin(e.target.value)}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-2 mt-5">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-2 mt-5">
          <p className="text-red-500">{error ? error : ""}</p>
        </div>

        <div className="grid w-full max-w-sm items-center gap-2 mt-5">
          <Button type="submit" onClick={handleLoginClick}>
            Login
          </Button>
        </div>
      </form>
    </main>
  );
}
