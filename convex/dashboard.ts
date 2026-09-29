import { api, internal } from "./_generated/api";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getEventDashboard = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to view this dashboard");
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const totalRegistrations = registrations.filter(
      (r) => r.status === "confirmed"
    ).length;

    const checkedInCount = registrations.filter(
      (r) => r.checkedIn && r.status === "confirmed"
    ).length;

    const pendingCount = totalRegistrations - checkedInCount;

    let totalRevenue = 0;
    if (event.ticketType === "paid" && event.ticketPrice) {
      totalRevenue = checkedInCount * event.ticketPrice;
    }

    const checkInRate =
      totalRegistrations > 0
        ? (checkedInCount / totalRegistrations) * 100
        : 0;

    const timeUntilEvent = event.startDate - Date.now();
    const hoursUntilEvent = Math.max(
      0,
      Math.floor(timeUntilEvent / (1000 * 60 * 60))
    );
    const today = new Date().setHours(0, 0, 0, 0);
    const startDay = new Date(event.startDate).setHours(0, 0, 0, 0);
    const endDay = new Date(event.endDate).setHours(0, 0, 0, 0);
    const isEventToday = today >= startDay && today <= endDay;
    const isEventPast = event.endDate < Date.now();

    return {
      event,
      stats: {
        totalRegistrations,
        checkedInCount,
        pendingCount,
        capacity: event.capacity,
        checkInRate,
        totalRevenue,
        hoursUntilEvent,
        isEventToday,
        isEventPast,
      },
    };
  },
});
