"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { jobsAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { X } from "lucide-react"

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  budget: z.coerce.number().positive("Budget must be positive"),
  duration: z.coerce.number().positive("Duration must be positive"),
  skillsRequired: z.array(z.string()).min(1, "At least one skill is required"),
})

type JobFormValues = z.infer<typeof jobSchema>

export default function CreateJobPage() {
  const router = useRouter()
  const { token, isEmployer } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skillInput, setSkillInput] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
      duration: 0,
      skillsRequired: [],
    },
  })

  const skills = watch("skillsRequired")

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setValue("skillsRequired", [...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setValue(
      "skillsRequired",
      skills.filter((skill) => skill !== skillToRemove),
    )
  }

  const onSubmit = async (data: JobFormValues) => {
    if (!token) return

    setIsSubmitting(true)
    try {
     const response = await jobsAPI.createJob(token, data)
      console.log("Job created successfully:", response)
      toast({
        title: "Job Posted",
        description: "Your job has been successfully posted",
      })
      router.push("/dashboard")
    } catch (error) {
      // Error is handled by the apiRequest function
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect if not an employer
  if (!isEmployer) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">Only employers can post jobs</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>Fill in the details to create a new job posting</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g., Full Stack Developer for E-commerce Website"
                {...register("title")}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the job requirements, responsibilities, and expectations..."
                className="min-h-[200px]"
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input id="budget" type="number" placeholder="e.g., 1000" {...register("budget")} />
                {errors.budget && <p className="text-sm text-red-500">{errors.budget.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input id="duration" type="number" placeholder="e.g., 30" {...register("duration")} />
                {errors.duration && <p className="text-sm text-red-500">{errors.duration.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder="e.g., React"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button type="button" onClick={addSkill}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="w-4 h-4 rounded-full hover:bg-primary/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {errors.skillsRequired && <p className="text-sm text-red-500">{errors.skillsRequired.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Posting Job..." : "Post Job"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

