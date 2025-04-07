"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { jobsAPI, bidsAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

interface Job {
  _id: string
  title: string
  description: string
  budget: number
  duration: number
  skillsRequired: string[]
  postedBy: {
    _id: string
    name: string
  }
  createdAt: string
}

interface Bid {
  _id: string
  job: string
  freelancer: {
    _id: string
    name: string
  }
  bidAmount: number
  timeline: number
  message: string
  status: "Pending" | "Accepted" | "Rejected"
  createdAt: string
}

export default function DashboardPage() {
  const { user, token, isEmployer, isFreelancer } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        if (isEmployer) {
          // Fetch jobs posted by this employer
          const jobsData = await jobsAPI.getJobs(token)
          console.log("Jobs Data:", jobsData)
          setJobs(jobsData.filter((job: Job) => job.postedBy._id === user?.id))

          // For each job, fetch bids
          const allBids: Bid[] = []
          for (const job of jobsData) {
            if (job.postedBy._id === user?.id) {
              const jobBids = await bidsAPI.getBids(token, job._id)
              allBids.push(...jobBids)
            }
          }
          setBids(allBids)
        } else if (isFreelancer) {
          // Fetch all jobs
          const jobsData = await jobsAPI.getJobs(token)
          setJobs(jobsData)

          // Fetch bids made by this freelancer
          // Note: This is a simplified approach. In a real app, you might need a dedicated endpoint
          const allBids: Bid[] = []
          for (const job of jobsData) {
            const jobBids = await bidsAPI.getBids(token, job._id)
            const myBids = jobBids.filter((bid: Bid) => bid.freelancer._id === user?.id)
            allBids.push(...myBids)
          }
          setBids(allBids)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, user, isEmployer, isFreelancer])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      {isEmployer && (
        <>
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Your Posted Jobs</h2>
              <Link href="/jobs/create">
                <Button>Post a New Job</Button>
              </Link>
            </div>

            {jobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="mb-4 text-lg text-gray-500">You haven't posted any jobs yet</p>
                  <Link href="/jobs/create">
                    <Button>Post Your First Job</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <Link href={`/jobs/${job._id}`} key={job._id}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{job.title}</CardTitle>
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
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Recent Bids on Your Jobs</h2>

            {bids.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No bids have been placed on your jobs yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <Card key={bid._id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Bid from {bid.freelancer.name}</span>
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            bid.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : bid.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {bid.status}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Amount: ${bid.bidAmount} • Timeline: {bid.timeline} days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{bid.message}</p>
                    </CardContent>
                    {bid.status === "Pending" && (
                      <CardFooter className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={async (e) => {
                            e.preventDefault()
                            await bidsAPI.rejectBid(token!, bid._id)
                            setBids(bids.map((b) => (b._id === bid._id ? { ...b, status: "Rejected" } : b)))
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={async (e) => {
                            e.preventDefault()
                            await bidsAPI.acceptBid(token!, bid._id)
                            setBids(bids.map((b) => (b._id === bid._id ? { ...b, status: "Accepted" } : b)))
                          }}
                        >
                          Accept
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {isFreelancer && (
        <>
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Your Bids</h2>
              <Link href="/jobs">
                <Button>Find More Jobs</Button>
              </Link>
            </div>

            {bids.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="mb-4 text-lg text-gray-500">You haven't placed any bids yet</p>
                  <Link href="/jobs">
                    <Button>Browse Available Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => {
                  const job = jobs.find((j) => j._id === bid.job)
                  return (
                    <Card key={bid._id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <Link href={`/jobs/${bid.job}`} className="hover:underline">
                            {job?.title || "Job"}
                          </Link>
                          <span
                            className={`px-3 py-1 text-sm rounded-full ${
                              bid.status === "Accepted"
                                ? "bg-green-100 text-green-800"
                                : bid.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {bid.status}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Your bid: ${bid.bidAmount} • Timeline: {bid.timeline} days
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{bid.message}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Available Jobs</h2>

            {jobs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No jobs available at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.slice(0, 6).map((job) => (
                  <Link href={`/jobs/${job._id}`} key={job._id}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{job.title}</CardTitle>
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

            {jobs.length > 6 && (
              <div className="flex justify-center mt-6">
                <Link href="/jobs">
                  <Button variant="outline">View All Jobs</Button>
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

