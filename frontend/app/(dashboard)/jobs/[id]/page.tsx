"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
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

const bidSchema = z.object({
  bidAmount: z.coerce.number().positive("Bid amount must be positive"),
  timeline: z.coerce.number().positive("Timeline must be positive"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type BidFormValues = z.infer<typeof bidSchema>

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  const { user, token, isEmployer, isFreelancer } = useAuth()
  const { toast } = useToast()

  const [job, setJob] = useState<Job | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userHasBid, setUserHasBid] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      bidAmount: 0,
      timeline: 0,
      message: "",
    },
  })

  useEffect(() => {
    if (!token || !jobId) return

    const fetchJobDetails = async () => {
      try {
        const jobData = await jobsAPI.getJob(token, jobId)
        setJob(jobData)

        const bidsData = await bidsAPI.getBids(token, jobId)
        setBids(bidsData)

        // Check if user has already bid on this job
        if (isFreelancer && user) {
          const userBid = bidsData.find((bid: Bid) => bid.freelancer._id === user.id)
          setUserHasBid(!!userBid)
        }
      } catch (error) {
        console.error("Error fetching job details:", error)
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobDetails()
  }, [token, jobId, user, isFreelancer, toast])

  const onSubmitBid = async (data: BidFormValues) => {
    if (!token || !jobId) return

    setIsSubmitting(true)
    try {
      const response = await bidsAPI.createBid(token, jobId, data)
      console.log("Bid created successfully:", response)
      toast({
        title: "Bid Submitted",
        description: "Your bid has been successfully submitted",
      })
      setUserHasBid(true)

      // Refresh bids
      const bidsData = await bidsAPI.getBids(token, jobId)
      setBids(bidsData)
    } catch (error) {
      // Error is handled by the apiRequest function
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptBid = async (bidId: string) => {
    if (!token) return

    try {
      await bidsAPI.acceptBid(token, bidId)
      toast({
        title: "Bid Accepted",
        description: "You have accepted this bid",
      })

      // Update bid status in the UI
      setBids(bids.map((bid) => (bid._id === bidId ? { ...bid, status: "Accepted" } : bid)))
    } catch (error) {
      // Error is handled by the apiRequest function
    }
  }

  const handleRejectBid = async (bidId: string) => {
    if (!token) return

    try {
      await bidsAPI.rejectBid(token, bidId)
      toast({
        title: "Bid Rejected",
        description: "You have rejected this bid",
      })

      // Update bid status in the UI
      setBids(bids.map((bid) => (bid._id === bidId ? { ...bid, status: "Rejected" } : bid)))
    } catch (error) {
      // Error is handled by the apiRequest function
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Job not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isJobOwner = isEmployer && user?.id === job.postedBy._id

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <CardDescription>
                Posted by {job.postedBy.name} • Budget: ${job.budget} • Duration: {job.duration} days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="whitespace-pre-line text-muted-foreground">{job.description}</p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill) => (
                    <span key={skill} className="px-2 py-1 text-sm rounded-full bg-primary/10 text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {isFreelancer && !userHasBid && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Place a Bid</CardTitle>
                <CardDescription>Submit your proposal for this job</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmitBid)}>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bidAmount">Bid Amount ($)</Label>
                      <Input id="bidAmount" type="number" {...register("bidAmount")} />
                      {errors.bidAmount && <p className="text-sm text-red-500">{errors.bidAmount.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Timeline (days)</Label>
                      <Input id="timeline" type="number" {...register("timeline")} />
                      {errors.timeline && <p className="text-sm text-red-500">{errors.timeline.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Cover Letter</Label>
                    <Textarea
                      id="message"
                      placeholder="Explain why you're the best fit for this job..."
                      className="min-h-[150px]"
                      {...register("message")}
                    />
                    {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Bid"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {isFreelancer && userHasBid && (
            <Card className="mt-6">
              <CardContent className="p-6 text-center">
                <p className="text-green-600">You have already placed a bid on this job</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Bids</CardTitle>
              <CardDescription>
                {bids.length} {bids.length === 1 ? "freelancer has" : "freelancers have"} placed bids
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <p className="text-center text-muted-foreground">No bids yet</p>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <Card key={bid._id}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{bid.freelancer.name}</span>
                          {bid.status !== "Pending" && (
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                bid.status === "Accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {bid.status}
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          ${bid.bidAmount} • {bid.timeline} days
                        </CardDescription>
                      </CardHeader>
                      {(isJobOwner || bid.freelancer._id === user?.id) && (
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">{bid.message}</p>

                          {isJobOwner && bid.status === "Pending" && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleRejectBid(bid._id)}
                              >
                                Reject
                              </Button>
                              <Button size="sm" className="w-full" onClick={() => handleAcceptBid(bid._id)}>
                                Accept
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

