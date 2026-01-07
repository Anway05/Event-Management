"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { State, City } from "country-state-city";
import Image from "next/image";
import { CalendarIcon, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import UnsplashImagePicker from "@/components/unsplash-image-picker";
import EnhancedImagePicker from "@/components/enhanced-image-picker";
import { CATEGORIES } from "@/lib/data";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Please select a category"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  startTime: z.string().regex(timeRegex, "Start time must be HH:MM"),
  endTime: z.string().regex(timeRegex, "End time must be HH:MM"),
  locationType: z.enum(["physical", "online"]).default("physical"),
  venue: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  ticketType: z.enum(["free", "paid"]).default("free"),
  ticketPrice: z.number().optional(),
  coverImage: z.string().optional(),
});

export default function ManageEventPage() {
  const params = useParams();
  const router = useRouter();
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Fetch event details
  const { data: event, isLoading } = useConvexQuery(
    api.events.getEventBySlug,
    { slug: params.slug }
  );

  const { mutate: updateEvent, isLoading: isUpdating } = useConvexMutation(
    api.events.updateEvent
  );

  const { mutate: deleteEvent, isLoading: isDeleting } = useConvexMutation(
    api.events.deleteEvent
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      startTime: format(new Date(event.startDate), "HH:mm"),
      endTime: format(new Date(event.endDate), "HH:mm"),
      locationType: event.locationType,
      venue: event.venue || "",
      address: event.address || "",
      city: event.city,
      state: event.state || "",
      capacity: event.capacity,
      ticketType: event.ticketType,
      ticketPrice: event.ticketPrice,
      coverImage: event.coverImage || "",
    } : {
      locationType: "physical",
      ticketType: "free",
      capacity: 50,
      category: "",
      state: "",
      city: "",
      startTime: "",
      endTime: "",
      coverImage: "",
    }
  });

  const selectedState = watch("state");
  const coverImage = watch("coverImage");
  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);
  const cities = useMemo(() => {
    if (!selectedState) return [];
    const st = indianStates.find((s) => s.name === selectedState);
    if (!st) return [];
    return City.getCitiesOfState("IN", st.isoCode);
  }, [selectedState, indianStates]);

  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const onSubmit = async (data) => {
    try {
      const start = combineDateTime(data.startDate, data.startTime);
      const end = combineDateTime(data.endDate, data.endTime);

      if (!start || !end) {
        toast.error("Please select both date and time for start and end.");
        return;
      }

      if (end.getTime() <= start.getTime()) {
        toast.error("End date/time must be after start date/time.");
        return;
      }

      await updateEvent({
        eventId: event._id,
        updates: {
          title: data.title,
          description: data.description,
          category: data.category,
          tags: [data.category],
          startDate: start.getTime(),
          endDate: end.getTime(),
          locationType: data.locationType,
          venue: data.venue || undefined,
          address: data.address || undefined,
          city: data.city,
          state: data.state || undefined,
          capacity: data.capacity,
          ticketType: data.ticketType,
          ticketPrice: data.ticketPrice || undefined,
          coverImage: data.coverImage || undefined,
        }
      });

      toast.success("Event updated successfully!");
      router.push(`/events/${event.slug}`);
    } catch (error) {
      toast.error(error.message || "Failed to update event");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteEvent({ eventId: event._id });
      toast.success("Event deleted successfully!");
      router.push("/my-events");
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background -mt-6 md:-mt-16 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">Manage Event</h1>
          <p className="text-lg text-muted-foreground">Update your event details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Image Section */}
          <Card className="glass border border-white/10 backdrop-blur-xl overflow-hidden">
            <CardContent className="pt-8 space-y-4">
              <h2 className="text-2xl font-bold mb-6">Cover Image</h2>
              <div
                className="relative aspect-video w-full rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer bg-muted/50 border-2 border-dashed border-white/20 hover:border-white/40 transition-colors group"
                onClick={() => setShowImagePicker(true)}
              >
                {coverImage ? (
                  <>
                    <Image
                      src={coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      width={800}
                      height={400}
                      priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="bg-black/50 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to change
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">Click to select cover image</p>
                    <p className="text-xs text-muted-foreground/60">JPG, PNG or GIF (max. 5MB)</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="glass border border-white/10 backdrop-blur-xl">
            <CardContent className="pt-8 space-y-6">
              <h2 className="text-2xl font-bold mb-6">Event Details</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter event title"
                    className="glass"
                  />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your event"
                  rows={5}
                  className="glass"
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card className="glass border border-white/10 backdrop-blur-xl">
            <CardContent className="pt-8 space-y-6">
              <h2 className="text-2xl font-bold mb-6">Date & Time</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full glass justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("startDate") ? format(watch("startDate"), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <Calendar
                        mode="single"
                        selected={watch("startDate")}
                        onSelect={(date) => setValue("startDate", date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register("startTime")}
                    className="glass"
                  />
                  {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full glass justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("endDate") ? format(watch("endDate"), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <Calendar
                        mode="single"
                        selected={watch("endDate")}
                        onSelect={(date) => setValue("endDate", date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register("endTime")}
                    className="glass"
                  />
                  {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="glass border border-white/10 backdrop-blur-xl">
            <CardContent className="pt-8 space-y-6">
              <h2 className="text-2xl font-bold mb-6">Location</h2>

              <div className="space-y-2">
                <Label htmlFor="locationType">Location Type</Label>
                <Select
                  value={watch("locationType")}
                  onValueChange={(value) => setValue("locationType", value)}
                >
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={watch("state")}
                    onValueChange={(value) => setValue("state", value)}
                  >
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={watch("city")}
                    onValueChange={(value) => setValue("city", value)}
                  >
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Event address"
                  className="glass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue URL (Maps Link)</Label>
                <Input
                  id="venue"
                  {...register("venue")}
                  placeholder="https://maps.google.com/..."
                  className="glass"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card className="glass border border-white/10 backdrop-blur-xl">
            <CardContent className="pt-8 space-y-6">
              <h2 className="text-2xl font-bold mb-6">Tickets</h2>

              <div className="space-y-2">
                <Label htmlFor="ticketType">Ticket Type</Label>
                <Select
                  value={watch("ticketType")}
                  onValueChange={(value) => setValue("ticketType", value)}
                >
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select ticket type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {watch("ticketType") === "paid" && (
                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Price (₹)</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      {...register("ticketPrice", { valueAsNumber: true })}
                      placeholder="Enter price"
                      className="glass"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    {...register("capacity", { valueAsNumber: true })}
                    placeholder="Event capacity"
                    className="glass"
                  />
                  {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUpdating || isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isUpdating || isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Event
            </Button>
            <Button
              type="submit"
              variant="brand"
              disabled={isUpdating || isDeleting}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <EnhancedImagePicker
          onImageSelect={(url) => {
            if (url) {
              setValue("coverImage", url);
              setTimeout(() => setShowImagePicker(false), 100);
            }
          }}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
}
