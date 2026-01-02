"use client"

import { api } from '@/convex/_generated/api'
import { useConvexQuery } from '@/hooks/use-onboarding'
import React from 'react'

const ExplorePage = () => {

  const { data:currentUser } = useConvexQuery(api.users.getCurrentUser)

  const { data: featuredEvents, isLoading: loadingFeatured } = useConvexQuery(api.explore.getFeaturedEvents,{ limit: 3 });

  const { data: localEvents, isLoading: loadingLocl } = useConvexQuery(api.explore.getEventsByLocation, { 
    city: currentUser?.city || "Kolkata", 
    state: currentUser?.state || "West Bengal",
    limit: 4 });

  const { data: popularEvents, isLoading: loadingPopular } = useConvexQuery(
    api.explore.getPopularEvents,{ limit: 6 }
  );

    const { data: categoryCounts } = useConvexQuery(
      api.explore.getCategoryCounts
  );

  return (
    <div>ExplorePage</div>
  )
}

export default ExplorePage