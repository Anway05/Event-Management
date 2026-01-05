import { api } from "@/convex/_generated/api";
import { set } from "date-fns/set";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConvexQuery } from "./use-convex-query";

// Pages that require onboarding (attendee-centered)
const ATTENDEE_PAGES = ["/explore", "/events", "/my-tickets", "/profile"];

export function useOnboarding(){
    const [showOnboarding, setShowOnboarding] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { data: currentUser, isLoading } = useConvexQuery(
        api.users.getCurrentUser
    );

    useEffect(() => {
    if (isLoading || !currentUser) return;

    // Check if user hasn't completed onboarding
    if (!currentUser.hasCompletedOnboarding) {
      // Check if current page requires onboarding
      const requiresOnboarding = ATTENDEE_PAGES.some((page) =>
        pathname.startsWith(page)
      );

      if (requiresOnboarding) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowOnboarding(true);
      }
    }
  }, [currentUser, pathname, isLoading]);

const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    router.refresh(); // Refresh to reflect updated user state
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    router.push("/"); // Redirect to home page 
  }

  return {
    showOnboarding,
    handleOnboardingComplete,
    handleOnboardingSkip,
    needsOnboarding: currentUser && !currentUser.hasCompletedOnboarding,
  }
}