"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { authAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["freelancer", "employer"]),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const defaultRole = searchParams.get("role") as "freelancer" | "employer" | null

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole || "freelancer",
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const response = await authAPI.register(data)
      toast({
        title: "Registration successful",
        description: "You have successfully registered an account",
      })

      // Login the user with the returned token
      login(response.token, response.user)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      // Error is handled by the apiRequest function
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <RadioGroup
                defaultValue={defaultRole || "freelancer"}
                onValueChange={(value) => setValue("role", value as "freelancer" | "employer")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="freelancer" id="freelancer" />
                  <Label htmlFor="freelancer">Freelancer - I want to find work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employer" id="employer" />
                  <Label htmlFor="employer">Employer - I want to hire talent</Label>
                </div>
              </RadioGroup>
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

