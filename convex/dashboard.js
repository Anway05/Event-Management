import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
 
 // Get event with detailed stats for dashboard
 export const getEventDashboard = query({
    args: { eventId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        
        if (!user) {
            throw new Error("Not authenticated");
        }

        const event = await ctx.db.get("events", args.eventId);
        if (!event) {
            throw new Error("Event not found");
        }

        // Check if the user is the organizer of the event
        if (event.organizerId !== user._id) {
            throw new Error("You are not authorized to view this dashboard");
        }

        // Get all registrations
        const registrations = await ctx.db
        .query("registrations")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();

        // Calculate stats
        const totalRegistrations = registrations.filter(
            (r) => r.status === "confirmed"
        ).length;

        const checkedInCount = registrations.filter(
            (r) => r.checkedIn && r.status === "confirmed"
        ).length;

        const pendingCount = totalRegistrations - checkedInCount;

        // Calcilate revenue
        let totalRevenue = 0;
        if(event.ticketType === "paid" && event.ticketprice) {
            totalRevenue = checkedInCount * event.ticketprice;
        }

        // Calculate check-in rate
        const checkInRate =
        totalRegistrations > 0
            ? (checkedInCount / totalRegistrations) * 100
            : 0;

        // Claculate time untill event
        const timeUntilEvent = event.startDate - Date.now();
        const hoursUntilEvent = Math.max(
            0, Math.floor(timeUntilEvent / (1000 * 60 * 60))
        )
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
    }
 })