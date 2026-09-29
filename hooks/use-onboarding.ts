import { api } from "@/convex/_generated/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConvexQuery } from "./use-convex-query";

const ATTENDEE_PAGES = ["/explore", "/events", "/my-tickets", "/profile"];

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: currentUser, isLoading } = useConvexQuery(
    api.users.getCurrentUser
  );

  useEffect(() => {
    if (isLoading || !currentUser) return;

    if (!currentUser.hasCompletedOnboarding) {
      const requiresOnboarding = ATTENDEE_PAGES.some((page) =>
        pathname.startsWith(page)
      );

      if (requiresOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [currentUser, pathname, isLoading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    router.refresh();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    router.push("/");
  };

  return {
    showOnboarding,
    handleOnboardingComplete,
    handleOnboardingSkip,
    needsOnboarding: Boolean(currentUser && !currentUser.hasCompletedOnboarding),
  };
}
