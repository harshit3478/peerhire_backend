import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <h1 className="text-xl font-bold">Job Bidding Platform</h1>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-white to-gray-100">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">Find Work or Hire Talent</h2>
            <p className="max-w-2xl mx-auto mb-8 text-lg text-gray-600">
              Connect with freelancers and employers on our secure job bidding platform
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register?role=freelancer">
                <Button size="lg" className="px-8">
                  Find Work
                </Button>
              </Link>
              <Link href="/auth/register?role=employer">
                <Button size="lg" variant="outline" className="px-8">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="p-6 text-center bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-white bg-primary rounded-full">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">Post a Job</h3>
                <p className="text-gray-600">Employers can post jobs with detailed requirements and budget</p>
              </div>
              <div className="p-6 text-center bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-white bg-primary rounded-full">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">Place Bids</h3>
                <p className="text-gray-600">Freelancers can browse jobs and place competitive bids</p>
              </div>
              <div className="p-6 text-center bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-white bg-primary rounded-full">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">Get Hired</h3>
                <p className="text-gray-600">Employers review bids and select the best freelancer for the job</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-gray-600 bg-gray-100">
        <p>© {new Date().getFullYear()} Job Bidding Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}

