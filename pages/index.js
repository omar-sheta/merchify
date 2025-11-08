import Head from 'next/head'
import dynamic from 'next/dynamic'
import UploadForm from '../components/UploadForm'
import VideoPlayer from '../components/VideoPlayer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Merchify — Sprint 1</title>
      </Head>

      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Merchify — Video frame capture demo</h1>
        <p className="mb-6">Upload a short video, scrub, capture a frame, and run Nano Banana image tests.</p>

        <UploadForm />
        <div className="mt-8">
          <VideoPlayer />
        </div>
      </main>
    </div>
  )
}
