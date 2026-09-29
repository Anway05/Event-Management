import { internalMutation } from "./_generated/server";

const SAMPLE_EVENTS: Array<{
  title: string;
  description: string;
  category: string;
  tags: string[];
  city: string;
  state: string;
  venue: string;
  address: string;
  capacity: number;
  ticketType: "free" | "paid";
  ticketPrice?: number;
  coverImage: string;
  themeColor: string;
}> = [
  {
    title: "React 19 Workshop: Master the New Features",
    description: `Join us for an intensive hands-on workshop diving deep into React 19's revolutionary features!`,
    category: "tech",
    tags: ["tech", "react", "javascript", "frontend"],
    city: "Bangalore",
    state: "Karnataka",
    venue: "https://maps.google.com/?q=WeWork+Embassy+Golf+Links",
    address: "WeWork Embassy Golf Links, Domlur, Bangalore",
    capacity: 50,
    ticketType: "free",
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80",
    themeColor: "#4c1d95",
  },
  {
    title: "AI & Machine Learning Meetup - Building with LLMs",
    description: `Explore the exciting world of Large Language Models and learn how to integrate them into your applications!`,
    category: "tech",
    tags: ["tech", "ai", "machine-learning", "llm"],
    city: "Hyderabad",
    state: "Telangana",
    venue: "https://maps.google.com/?q=T-Hub+Hyderabad",
    address: "T-Hub, IIIT Hyderabad Campus, Gachibowli",
    capacity: 100,
    ticketType: "free",
    coverImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    themeColor: "#1e3a8a",
  },
  {
    title: "Indie Music Night - Acoustic Sessions",
    description: `An evening of soulful acoustic performances by indie artists from across India!`,
    category: "music",
    tags: ["music", "indie", "acoustic", "live"],
    city: "Mumbai",
    state: "Maharashtra",
    venue: "https://maps.google.com/?q=The+Habitat+Khar",
    address: "The Habitat, Khar West, Mumbai",
    capacity: 120,
    ticketType: "paid",
    ticketPrice: 499,
    coverImage:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
    themeColor: "#831843",
  },
];

function getRandomFutureDate(minDays = 7, maxDays = 90) {
  const now = Date.now();
  const randomDays = Math.floor(Math.random() * (maxDays - minDays) + minDays);
  return now + randomDays * 24 * 60 * 60 * 1000;
}

function getEventEndTime(startTime: number) {
  const durationHours = Math.floor(Math.random() * 3) + 2;
  return startTime + durationHours * 60 * 60 * 1000;
}

function generateSlug(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    `-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );
}

export const run = internalMutation({
  handler: async (ctx) => {
    let organizer = await ctx.db.query("users").first();

    if (!organizer) {
      const organizerId = await ctx.db.insert("users", {
        email: "organizer@eventhub.com",
        tokenIdentifier: "seed-user-token",
        name: "EventHub Team",
        hasCompletedOnboarding: true,
        location: {
          city: "Bangalore",
          state: "Karnataka",
          country: "India",
        },
        interests: ["tech", "music", "business"],
        freeEventsCreated: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      organizer = await ctx.db.get(organizerId);
    }

    if (!organizer) throw new Error("Failed to create seed organizer");

    const createdEvents: string[] = [];

    for (const eventData of SAMPLE_EVENTS) {
      const startDate = getRandomFutureDate();
      const endDate = getEventEndTime(startDate);
      const registrationCount = Math.floor(
        Math.random() * eventData.capacity * 0.7
      );

      const event = {
        ...eventData,
        slug: generateSlug(eventData.title),
        organizerId: organizer._id,
        organizerName: organizer.name,
        startDate,
        endDate,
        timezone: "Asia/Kolkata",
        locationType: "physical" as const,
        country: "India",
        registrationCount,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await ctx.db.insert("events", event);
      createdEvents.push(eventData.title);
    }

    return {
      success: true,
      count: createdEvents.length,
      events: createdEvents,
    };
  },
});

export const clear = internalMutation({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    let count = 0;

    for (const event of events) {
      const regs = await ctx.db
        .query("registrations")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      for (const reg of regs) {
        await ctx.db.delete(reg._id);
      }

      await ctx.db.delete(event._id);
      count++;
    }

    return { success: true, deleted: count };
  },
});
