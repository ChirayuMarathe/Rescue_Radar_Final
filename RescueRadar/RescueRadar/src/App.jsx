"use client";
import { useState } from "react";
import Hero from "./components/hero";
import { Stats } from "./components/stats";
import { About } from "./components/about";
import { ReportForm } from "./components/report-form";

import { Footer } from "./components/footer";
import { NgoMap } from "./components/ngo-map";
import { Stories } from "./components/stories";
import { JoinNetworkForm } from "./components/join-network-form";

import { Testimonials } from "./components/testimonials";
import { Navbar } from "./components/navbar";
import KnowledgeCenter from "./components/knowledge-center";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <>
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
                </>
              }
            />
            <Route path="/report" element={<ReportForm />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
