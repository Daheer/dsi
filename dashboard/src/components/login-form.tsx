"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { setToken, fetchUser } = useAuthStore()
  const { theme, systemTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine the current theme
  const currentTheme = theme === "system" ? systemTheme : theme
  const logoSrc = currentTheme === "dark"
    ? "/images/Dark Mode Transparent.svg"
    : "/images/Light Mode Transparent.svg"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { access_token } = await authApi.loginForm(
        credentials.username,
        credentials.password
      )

      setToken(access_token)
      await fetchUser()

      toast.success("Welcome back!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid credentials")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-4 text-center">
                {mounted && (
                  <Image
                    src={logoSrc}
                    alt="De Signature International"
                    width={240}
                    height={96}
                    className="w-auto h-24"
                    priority
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold">De Signature International</h1>
                  <p className="text-muted-foreground text-balance">
                    Welcome Back!
                  </p>
                </div>
              </div>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </Field>

            </FieldGroup>
          </form>
          <div className="relative hidden md:block">
            <Image
              src="/images/out.png"
              alt="De Signature International Hotel"
              width={800}
              height={1000}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        © 2026 De Signature International. All rights reserved.
      </FieldDescription>
    </div>
  )
}
