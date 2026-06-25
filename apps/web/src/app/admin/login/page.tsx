"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/admin/auth/login", { email, password });
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Đã có lỗi xảy ra",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--konnit-pink-01)] p-4">
      <div
        aria-hidden
        className="animate-blob pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-[var(--konnit-pink-04)]/40 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[var(--konnit-pink-04)]/40 blur-3xl"
        style={{ animationDelay: "-5s" }}
      />
      <Card className="rise-in relative w-full max-w-sm border-[var(--konnit-pink-03)] shadow-[0_30px_60px_-20px_rgba(143,47,103,0.35)]">
        <CardHeader className="items-center text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--konnit-berry)] text-lg font-bold text-white shadow-sm">
            K
          </span>
          <CardTitle className="mt-3 text-xl text-[var(--konnit-berry)]">
            Konnit Admin
          </CardTitle>
          <p className="text-sm text-[var(--konnit-muted)]">
            Đăng nhập để quản lý nội dung
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="btn-shine w-full bg-[var(--konnit-berry)] text-white"
            >
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
