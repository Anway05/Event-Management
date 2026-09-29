import { api, internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    let user;
    try {
      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();
    } catch (error: any) {
      if (error?.message && error.message.includes("backfilling")) {
        user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
          .unique();
      } else {
        throw error;
      }
    }

    if (user !== null) {
      const updates: Record<string, any> = {};
      if (user.name !== identity.name) {
        updates.name = identity.name ?? "Anonymous";
      }
      if (user.email !== identity.email) {
        updates.email = identity.email ?? "";
      }
      if (user.imageUrl !== identity.pictureUrl) {
        updates.imageUrl = identity.pictureUrl;
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = Date.now();
        await ctx.db.patch(user._id, updates);
      }

      return user._id;
    }

    return await ctx.db.insert("users", {
      email: identity.email ?? "",
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? "Anonymous",
      imageUrl: identity.pictureUrl,
      hasCompletedOnboarding: false,
      freeEventsCreated: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();

      if (!user) {
        return null;
      }

      return user;
    } catch (error: any) {
      if (error?.message && error.message.includes("backfilling")) {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
          .unique();
        return user || null;
      }
      throw error;
    }
  },
});

export const completeOnboarding = mutation({
  args: {
    location: v.object({
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
    }),
    interests: v.array(v.string()),
  },

  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      location: args.location,
      interests: args.interests,
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });
    return user._id;
  },
});
