import { api, internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateQRCode() {
  return `EVT-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

export const registerForEvent = mutation({
  args: {
    eventId: v.id("events"),
    attendeename: v.string(),
    attendeeEmail: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) {
      throw new Error("User must be logged in to register for an event.");
    }
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.registrationCount >= event.capacity) {
      throw new Error("Event is full. Cannot register.");
    }

    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .collect();

    const confirmedReg = existingRegistration.find(
      (reg: any) => reg.status === "confirmed"
    );

    if (confirmedReg) {
      throw new Error("User already registered for this event.");
    }

    const cancelledReg = existingRegistration.find(
      (reg: any) => reg.status === "cancelled"
    );
    if (cancelledReg) {
      await ctx.db.patch(cancelledReg._id, {
        status: "confirmed",
        checkedIn: false,
      });
      await ctx.db.patch(args.eventId, {
        registrationCount: event.registrationCount + 1,
      });
      return cancelledReg._id;
    }

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
    });

    await ctx.db.patch(args.eventId, {
      registrationCount: event.registrationCount + 1,
    });
    return registrationId;
  },
});

export const checkRegistration = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) {
      return null;
    }

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();

    return registration;
  },
});

export const getMyRegistrations = query({
  handler: async (ctx): Promise<any> => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) {
      throw new Error("User must be logged in to view registrations.");
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const registrationsWithEvents = await Promise.all(
      registrations.map(async (reg: any) => {
        const event = await ctx.db.get(reg.eventId);
        return {
          ...reg,
          event,
        };
      })
    );

    return registrationsWithEvents;
  },
});

export const cancelRegistrations = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("User not authenticated");

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found.");
    }

    if (registration.userId !== user._id) {
      throw new Error("User not authorized to cancel this registration.");
    }

    if (registration.status === "cancelled") {
      throw new Error("Registration is already cancelled.");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Associated event not found.");
    }

    await ctx.db.patch(args.registrationId, {
      status: "cancelled",
    });

    if (event.registrationCount > 0) {
      await ctx.db.patch(event._id, {
        registrationCount: event.registrationCount - 1,
      });
    }

    return { success: true };
  },
});

export const getRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("User not authenticated");

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.organizerId !== user._id) {
      throw new Error("User not authorized to view registrations for this event.");
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();

    return registrations;
  },
});

export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("User not authenticated");

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.organizerId !== user._id) {
      throw new Error("User not authorized to view registrations for this event.");
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();

    return registrations;
  },
});

export const checkInWithQRCode = mutation({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("User not authenticated");

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .unique();

    if (!registration) {
      throw new Error("Invalid QR code.");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Associated event not found.");
    }

    if (event.organizerId !== user._id) {
      throw new Error("User not authorized to check in attendees for this event.");
    }

    if (registration.checkedIn) {
      return {
        success: false,
        message: "Attendee already checked in.",
        registration,
      };
    }

    await ctx.db.patch(registration._id, {
      checkedIn: true,
      checkedInAt: Date.now(),
    });

    return {
      success: true,
      message: "Attendee checked in successfully.",
      registration: {
        ...registration,
        checkedIn: true,
        checkedInAt: Date.now(),
      },
    };
  },
});
