"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { jobsAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Search } from "lucide-react"

interface Job {
  _id: string
  title: string
  description: string
  budget: number
  duration: number
  skillsRequired: string[]
  postedBy: string
  createdAt: string
}

export default function JobsPage() {
  const { token, isEmployer } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Get all unique skills from jobs
  const allSkills = [...new Set(jobs.flatMap((job) => job.skillsRequired))]

  useEffect(() => {
    if (!token) return

    const fetchJobs = async () => {
      try {
        const jobsData = await jobsAPI.getJobs(token)
        setJobs(jobsData)
        setFilteredJobs(jobsData)
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [token])

  useEffect(() => {
    // Filter jobs based on search term and selected skills
    let filtered = jobs

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (job) => job.title.toLowerCase().includes(term) || job.description.toLowerCase().includes(term),
      )
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter((job) => selectedSkills.every((skill) => job.skillsRequired.includes(skill)))
    }

    setFilteredJobs(filtered)
  }, [searchTerm, selectedSkills, jobs])

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Available Jobs</h1>
        {isEmployer && (
          <Link href="/jobs/create">
            <Button>Post a New Job</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                  <Input
                    placeholder="Search jobs..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill) => (
                    <Button
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSkill(skill)}
                      className="text-xs"
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No jobs match your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Link href={`/jobs/${job._id}`} key={job._id}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>
                        Budget: ${job.budget} • Duration: {job.duration} days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-muted-foreground">{job.description}</p>
                    </CardContent>
                    <CardFooter>
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.map((skill) => (
                          <span key={skill} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

