"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      setError("Incorrect password.");
      setLoading(false);
      return;
    }
    router.push("/");
  };

  return (
    <div className="page">
      <section className="hero">
        <h1>Churn Constellation</h1>
        <p>Enter the shared password to access the churn dashboards.</p>
        <form className="row" onSubmit={onSubmit}>
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {error ? <div className="small" style={{ color: "#d64545" }}>{error}</div> : null}
        <div className="small">Set `APP_PASSWORD` for users and `ADMIN_PASSWORD` for admins.</div>
      </section>
    </div>
  );
}
