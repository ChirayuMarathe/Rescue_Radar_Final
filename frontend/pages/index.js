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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RescueRadar" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="RescueRadar" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" type="image/svg+xml" href="/dog-svgrepo-com.svg" />
        <link rel="apple-touch-icon" href="/dog-svgrepo-com.svg" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
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
