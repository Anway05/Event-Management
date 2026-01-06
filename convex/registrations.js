import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateQRCode(){
    return `EVT-4{Date.now()}-4{Math.random().toString(36).substring(2,8).toUpperCase()}`;
}

export const registerForEvent = mutation({
    args: {
        eventId: v.id("events"),
        attendeename: v.string(),
        attendeeEmail: v.string(),
    },
    handler: async(ctx, args) => { 
        const user = ctx.runQuery(internal.users.getCurrentUser);
        if(!user){
            throw new Error("User must be logged in to register for an event.");
        }
        const event = await ctx.db.get(args.eventId);
        if(!event){
            throw new Error("Event not found.");
        }

        // Check event is full
        if(event.registrationCount >= event.capacity){
            throw new Error("Event is full. Cannot register.");
        }

        // Check if user already registered
        const existingRegistration = await ctx.db
            .query("registrations")
            .withIndex("by_event_and_user", (q) => q.eq("eventId", args.eventId).eq("userId", user._id)).unique();

        if(existingRegistration){
            throw new Error("User already registered for this event.");
        }

        // Create registration
        const qrCode = generateQRCode();
        const registrationId = await ctx.db.insert("registrations", {
            eventId: args.eventId,
            userId: user._id,
            attendeeName: args.attendeename,
            attendeeEmail: args.attendeeEmail,
            qrCode: qrCode,
            checkedIn: false,
            status: "confirmed",
            registeredAt: Date.now(),
        })

        // Update event registration count
        await ctx.db.patch(args.eventId, {
            registrationCount: event.registrationCount + 1,
        });
        return registrationId;
    }
});

// Check if user is registered for an event
export const checkRegistration = query({
    args:{
        eventId: v.id("events"),
    },
    handler: async(ctx, args) => {
        const user = ctx.runQuery(internal.users.getCurrentUser);
        if(!user){
            throw new Error("User must be logged in to check registration.");
        }

        const registration = await ctx.db
            .query("registrations")
            .withIndex("by_event_and_user", (q) => q.eq("eventId", args.eventId).eq("userId", user._id)).unique();
        return registration ;
    }
});

// Get user's registrations (tickets)
export const getMyRegistrations = query({
    handler: async(ctx) => {
        const user = ctx.runQuery(internal.users.getCurrentUser);
        if(!user){
            throw new Error("User must be logged in to view registrations.");
        }

        const registrations = await ctx.db
            .query("registrations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        // Fetch event details for each registration
        const registrationsWithEvents = await Promise.all(
            registrations.map(async (reg) => {
                const event = await ctx.db.get(reg.eventId);
                return {
                    ...reg,
                    event,
                };
            })
        )

        return registrationsWithEvents;
    }
})