"use client";

import React from "react";

import "./globals.css";

import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Tickers Manager",
//   description: "Developed by @danjsillva",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoginPage = window.location.pathname === "/login";
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <html lang="pt-br">
      <body>
        {!isLoginPage && (
          <header
            className="flex justify-between items-center
            px-7 py-5 border-b border-gray-200"
          >
            <nav>
              <ul className="flex gap-5">
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/import">Import</a>
                </li>
                <li>
                  <a href="/tickers">Tickers</a>
                </li>
              </ul>
            </nav>

            <nav>
              <ul className="flex gap-5">
                <li>
                  <p onClick={handleLogout} className="cursor-pointer">
                    {user.login ? `Logout (${user.login})` : "Login"}
                  </p>
                </li>
              </ul>
            </nav>
          </header>
        )}

        {children}
      </body>
    </html>
  );
}
