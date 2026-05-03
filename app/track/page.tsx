import { Suspense } from "react"
import TrackComplaintPage from "@/components/TrackComplaintPage"

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackComplaintPage />
    </Suspense>
  )
}
