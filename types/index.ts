import { Id } from "@/convex/_generated/dataModel";

export interface UserLocation {
  city: string;
  state?: string;
  country: string;
}

export interface UserProfile {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  tokenIdentifier: string;
  name: string;
  imageUrl?: string;
  hasCompletedOnboarding: boolean;
  location?: UserLocation;
  interests?: string[];
  freeEventsCreated: number;
  createdAt: number;
  updatedAt: number;
}

export interface EventItem {
  _id: Id<"events">;
  _creationTime: number;
  title: string;
  description: string;
  slug: string;
  organizerId: Id<"users">;
  organizerName: string;
  category: string;
  tags: string[];
  startDate: number;
  endDate: number;
  timezone?: string;
  locationType: "online" | "physical";
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  venue?: string;
  ticketType: "free" | "paid";
  ticketPrice?: number;
  capacity: number;
  registrationCount: number;
  coverImage?: string;
  themeColor?: string;
  createdAt: number;
  updatedAt: number;
  organizer?: {
    _id: Id<"users">;
    name: string;
    imageUrl?: string;
  };
  isRegistered?: boolean;
}

export interface RegistrationItem {
  _id: Id<"registrations">;
  _creationTime: number;
  eventId: Id<"events">;
  userId: Id<"users">;
  attendeeName: string;
  attendeeEmail: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: number;
  status: "confirmed" | "cancelled";
  registeredAt: number;
  event?: EventItem;
}

export interface EventFilterState {
  category: string;
  locationType: "all" | "online" | "physical";
  searchQuery: string;
  country?: string;
  state?: string;
  city?: string;
  dateFilter?: "all" | "today" | "this_week" | "this_month";
}
