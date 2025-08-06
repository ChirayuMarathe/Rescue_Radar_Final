import Head from 'next/head'
import Hero from '../src/components/hero'
import { Stats } from '../src/components/stats'
import { About } from '../src/components/about'
import { Footer } from '../src/components/footer'
import { NgoMap } from '../src/components/ngo-map'
import { Stories } from '../src/components/stories'
import { JoinNetworkForm } from '../src/components/join-network-form'
import { Testimonials } from '../src/components/testimonials'
import { Navbar } from '../src/components/navbar'
import KnowledgeCenter from '../src/components/knowledge-center'

export default function Home() {
  return (
    <>
      <Head>
        <title>RescueRadar - AI-Powered Animal Cruelty Reporting</title>
        <meta name="description" content="Report animal cruelty and help us create a safer world for all animals. Our AI-powered system ensures rapid response and proper routing to authorities." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/dog-svgrepo-com.svg" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <section id="home">
            <Hero />
            <Stats />
          </section>
          <section id="about">
            <About />
          </section>
          <Stories />
          <NgoMap />
          <KnowledgeCenter />
          <JoinNetworkForm />
          <Testimonials />
        </main>
        <Footer />
      </div>
    </>
  )
}
