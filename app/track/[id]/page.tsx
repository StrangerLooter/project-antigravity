import { Suspense } from "react"
import TrackComplaintPage from "@/components/TrackComplaintPage"

export default async function TrackByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense fallback={null}>
      <TrackComplaintPage initialId={id} />
    </Suspense>
  )
}
