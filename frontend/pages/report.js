import Head from 'next/head'
import { ReportForm } from '../src/components/report-form'
import { Footer } from '../src/components/footer'
import { Navbar } from '../src/components/navbar'

export default function Report() {
  return (
    <>
      <Head>
        <title>Report Animal Cruelty - RescueRadar</title>
        <meta name="description" content="Report incidents of animal cruelty or neglect. All reports are processed immediately by our AI system." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/dog-svgrepo-com.svg" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <ReportForm />
        </main>
        <Footer />
      </div>
    </>
  )
}
