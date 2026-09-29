"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building, Crown, Plus, Ticket, Compass } from "lucide-react";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { useOnboarding } from "@/hooks/use-onboarding";
import OnboardingModal from "./onboarding-modal";
import SearchLocationBar from "./search-location-bar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UpgradeModal from "./upgrade-modal";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { isLoading } = useStoreUser();
  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
    useOnboarding();

  const { has } = useAuth();
  const hasPro = has?.({ plan: "pro" });

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl z-50 border-b border-border/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo + Brand */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative flex items-center justify-center">
                <Image
                  src="/logo-transparent.png"
                  alt="Nova Events logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                  priority
                />
              </div>
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-amber-500 bg-clip-text text-transparent text-xl md:text-2xl font-black tracking-tight">
                Nova Events
              </span>
              {hasPro && (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white gap-1 ml-0.5 hidden sm:flex border-none shadow-sm">
                  <Crown className="w-3 h-3" />
                  Pro
                </Badge>
              )}
            </Link>

            {/* Search & Location - Desktop Only */}
            <div className="hidden lg:flex flex-1 max-w-2xl justify-center mx-4">
              <SearchLocationBar />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />

              {!hasPro && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpgradeModal(true)}
                  className="hidden md:flex text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:flex text-muted-foreground hover:text-foreground gap-1.5"
              >
                <Link href="/explore">
                  <Compass className="w-4 h-4 text-purple-500" />
                  Explore
                </Link>
              </Button>

              <Authenticated>
                {/* Create Event Button */}
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-purple-500/25 transition-all duration-300 gap-1.5 rounded-full px-4"
                >
                  <Link href="/create-event">
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline font-medium">Create Event</span>
                  </Link>
                </Button>

                {/* User Button */}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 rounded-full ring-2 ring-purple-500/20",
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="My Tickets"
                      labelIcon={<Ticket size={16} />}
                      href="/my-tickets"
                    />
                    <UserButton.Link
                      label="My Events"
                      labelIcon={<Building size={16} />}
                      href="/my-events"
                    />
                    <UserButton.Action label="manageAccount" />
                  </UserButton.MenuItems>
                </UserButton>
              </Authenticated>

              <Unauthenticated>
                <SignInButton mode="modal">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-5 shadow-sm hover:shadow-md transition-all"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </Unauthenticated>
            </div>
          </div>
        </div>

        {/* Mobile Search & Location - Below Header */}
        <div className="lg:hidden border-t border-border/40 px-3 py-2.5 bg-background/90 backdrop-blur-md">
          <SearchLocationBar />
        </div>

        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full">
            <BarLoader width={"100%"} color="#a855f7" height={3} />
          </div>
        )}
      </nav>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="header"
      />
    </>
  );
}
