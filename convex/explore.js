import { query } from "./_generated/server";
import { v } from "convex/values";

// Upcoming events, sorted by registrations to spotlight on the homepage
export const getFeaturedEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Pull all future events ordered by start time for baseline recency
    const events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter((q) => q.gte(q.field("startDate"), now))
      .order("desc")
      .collect();

    // Sort so the most registered events are first, then cap to requested size
    // This keeps the response lean while still showing the highest-demand picks
    const featured = events
      .sort((a, b) => b.registeredCount - a.registeredCount)
      .slice(0, args.limit ?? 3);

    return featured;
  },
});

export const getEventsByLocation = query({
  args: {
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Start from all upcoming events; location filtering happens in-memory
    // because we only have city/state on the document, not indexed composites
    let events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter((q) => q.gte(q.field("startDate"), now))
      .collect();

    // Trim the list to a specific metro area before paging
    if (args.city) {
      events = events.filter(
        (e) => e.city.toLowerCase() === args.city.toLowerCase()
      );
    } else if (args.state) {
      events = events.filter(
        (e) => e.state?.toLowerCase() === args.state.toLowerCase()
      );
    }

    // Enforce a small payload to keep UI fast (default 4)
    return events.slice(0, args.limit ?? 4);
  },
});

// Upcoming events ranked by registrations to surface trending picks
export const getPopularEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter((q) => q.gte(q.field("startDate"), now))
      .collect();

    // Order highest registration first so "trending" means most demand, not recency
    const popular = events
      .sort((a, b) => b.registrationCount - a.registrationCount)
      // Slice constrains the result size: caller-supplied limit or default 6
      // This prevents large responses when many events are active
      .slice(0, args.limit ?? 6);

    return popular;
  },
});

// Upcoming events filtered by a specific category
export const getEventsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Use the category index for fast filtering, then constrain to upcoming
    // Index usage avoids scanning all events for each category request
    const events = await ctx.db
      .query("events")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.gte(q.field("startDate"), now))
      .collect();

    // Keep result pages modest (default 12)
    return events.slice(0, args.limit ?? 12);
  },
});

// Count how many upcoming events exist per category for summary widgets
export const getCategoryCounts = query({
  handler: async (ctx) => {
    const now = Date.now();
    // Only count future events so summaries match listings
    const events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter((q) => q.gte(q.field("startDate"), now))
      .collect();

    // Count events by category to feed badges/filters
    const counts = {};
    events.forEach((event) => {
      counts[event.category] = (counts[event.category] || 0) + 1;
    });

    return counts;
  },
});