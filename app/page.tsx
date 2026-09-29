import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";
import { Sparkles, Calendar, Ticket, ShieldCheck, Zap, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="pt-6 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="text-center sm:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold tracking-wide backdrop-blur-md animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Event Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              Discover & <br />
              Create Amazing <br />
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                Unforgettable Events.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-lg font-normal leading-relaxed">
              Whether you&apos;re hosting a tech conference, workshop, live concert, or local meetup — Nova Events provides seamless ticketing, instant QR check-in, and vibrant community discovery.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center sm:justify-start">
              <Link href="/explore" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                >
                  Explore Events
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/create-event" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full px-8 py-6 text-base font-medium border-border/60 hover:bg-accent backdrop-blur-md"
                >
                  Host an Event
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="pt-6 flex items-center justify-center sm:justify-start gap-4 border-t border-border/40">
              <div className="flex -space-x-2">
                {["/logo.svg", "/logo.svg", "/logo.svg"].map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-purple-900/40 flex items-center justify-center text-xs font-bold text-purple-300">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">4.9/5 rating</span> from 2,000+ happy event organizers
              </div>
            </div>
          </div>

          {/* Right Hero Image / Mockup */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-lg aspect-square rounded-3xl p-4 bg-gradient-to-tr from-purple-500/20 via-pink-500/10 to-amber-500/20 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center group">
              <Image
                src="/hero.png"
                alt="Nova Events Showcase"
                width={650}
                height={650}
                className="w-full h-auto object-contain rounded-2xl drop-shadow-2xl group-hover:scale-102 transition-transform duration-500"
                priority
              />
              <div className="absolute -bottom-4 -left-4 bg-card/90 backdrop-blur-md p-4 rounded-2xl border border-border/60 shadow-xl hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Instant Digital Tickets</p>
                  <p className="text-[11px] text-muted-foreground">QR code entry ready in seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Slider / Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Explore Top Categories</h2>
            <p className="text-xs text-muted-foreground mt-1">Browse upcoming events tailored to your passions</p>
          </div>
          <Link href="/explore" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.slice(0, 12).map((cat) => (
            <Link key={cat.id} href={`/explore?category=${cat.id}`}>
              <div className="p-4 rounded-2xl border border-border/50 bg-card/60 hover:bg-accent/80 backdrop-blur-md hover:border-purple-500/40 transition-all duration-300 group text-center space-y-2 hover:-translate-y-1">
                <div className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</div>
                <p className="text-xs font-semibold text-foreground group-hover:text-purple-400 transition-colors">
                  {cat.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-12 border-y border-border/40">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Effortless Event Hosting</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create and publish high-converting event pages with integrated Unsplash image picker and AI cover generation in under 2 minutes.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md space-y-3">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Instant Mobile Tickets</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seamlessly claim free or paid tickets with secure QR validation that organizers can scan directly from their mobile browser.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Smart Location Filtering</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Filter by State, City, or Virtual Online events to never miss out on exciting local technology and cultural gatherings around you.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-purple-900/40 via-neutral-900/60 to-pink-900/40 border border-purple-500/30 text-center space-y-6 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40">Ready to Get Started?</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Turn Your Ideas Into Memorable Experiences.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Join thousands of attendees and creators building the future of local and virtual community gatherings.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/create-event">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-8 py-6 font-semibold shadow-xl">
              Create Your First Event Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
