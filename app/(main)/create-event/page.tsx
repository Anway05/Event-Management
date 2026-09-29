"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { State, City } from "country-state-city";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import EnhancedImagePicker from "@/components/enhanced-image-picker";
import AIEventCreator from "./_components/ai-event-creator";
import UpgradeModal from "@/components/upgrade-modal";
import { CATEGORIES } from "@/lib/data";
import Image from "next/image";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Please select a category"),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string().regex(timeRegex, "Start time must be HH:MM"),
  endTime: z.string().regex(timeRegex, "End time must be HH:MM"),
  locationType: z.enum(["physical", "online"]),
  venue: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  ticketType: z.enum(["free", "paid"]),
  ticketPrice: z.number().optional(),
  coverImage: z.string().optional(),
  themeColor: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

const CreateEvent = () => {
  const router = useRouter();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("limit");

  const { has } = useAuth();
  const hasPro = has?.({ plan: "pro" });

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const { mutate: createEvent, isLoading } = useConvexMutation(
    api.events.createEvent
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      locationType: "physical",
      ticketType: "free",
      capacity: 50,
      themeColor: "#4f46e5",
      category: "",
      state: "",
      city: "",
      startTime: "",
      endTime: "",
    },
  });

  const themeColor = watch("themeColor");
  const ticketType = watch("ticketType");
  const selectedState = watch("state");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const coverImage = watch("coverImage");

  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);
  const cities = useMemo(() => {
    if (!selectedState) return [];
    const st = indianStates.find((s) => s.name === selectedState);
    if (!st) return [];
    return City.getCitiesOfState("IN", st.isoCode);
  }, [selectedState, indianStates]);

  const FREE_COLORS = ["#4f46e5", "#10b981", "#f59e0b"];
  const PRO_GRADIENTS = [
    "linear-gradient(90deg, #a855f7, #f59e0b)",
    "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "linear-gradient(135deg, #ef4444, #f59e0b)",
  ];

  const colorPresets = [
    ...FREE_COLORS,
    ...(hasPro ? ["#9333ea", "#1f2937", ...PRO_GRADIENTS] : []),
  ];

  const handleColorClick = (color: string) => {
    if (!hasPro && !FREE_COLORS.includes(color)) {
      setUpgradeReason("color");
      setShowUpgradeModal(true);
      return;
    }
    setValue("themeColor", color);
  };

  const combineDateTime = (date: Date | undefined, time: string) => {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const onSubmit = async (data: EventFormValues) => {
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

      if (!hasPro && currentUser?.freeEventsCreated >= 1) {
        setUpgradeReason("limit");
        setShowUpgradeModal(true);
        return;
      }

      if (!hasPro && data.themeColor && !FREE_COLORS.includes(data.themeColor)) {
        setUpgradeReason("color");
        setShowUpgradeModal(true);
        return;
      }

      await createEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        tags: [data.category],
        startDate: start.getTime(),
        endDate: end.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locationType: data.locationType,
        venue: data.venue || undefined,
        address: data.address || undefined,
        city: data.city,
        state: data.state || undefined,
        country: "India",
        capacity: data.capacity,
        ticketType: data.ticketType,
        ticketPrice: data.ticketPrice || undefined,
        coverImage: data.coverImage || undefined,
        themeColor: data.themeColor,
      } as any);

      toast.success("Event created successfully! 🎉");
      router.push("/my-events");
    } catch (error: any) {
      toast.error(error.message || "Failed to create event");
    }
  };

  const handleAIGenerate = (generatedData: any) => {
    if (generatedData.title) setValue("title", generatedData.title);
    if (generatedData.description) setValue("description", generatedData.description);
    if (generatedData.category) setValue("category", generatedData.category);
    if (generatedData.suggestedCapacity) setValue("capacity", generatedData.suggestedCapacity);
    if (generatedData.suggestedTicketType) setValue("ticketType", generatedData.suggestedTicketType);
    toast.success("Event details filled! Customize as needed.");
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300 px-4 md:px-8 py-8 -mt-6 md:-mt-16 lg:-mt-5 rounded-2xl border border-border/40"
      style={
        themeColor?.startsWith("linear-gradient")
          ? { backgroundImage: themeColor }
          : { backgroundColor: themeColor }
      }
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_360px] gap-6 mb-10 items-center">
        <div className="space-y-3 bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            Create an Event
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-2xl font-medium">
            Craft a memorable experience — add details, set the vibe, and share it with your audience.
          </p>
          {!hasPro && (
            <p className="text-xs text-white/80 font-medium">
              Free Account: {currentUser?.freeEventsCreated || 0}/1 events created
            </p>
          )}
        </div>
        <div className="bg-card/80 backdrop-blur-md rounded-2xl p-5 border border-border/50 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-foreground">AI Assisted Event Creator</h2>
          </div>
          <AIEventCreator onEventGenerated={handleAIGenerate} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-[300px_1fr] gap-8">
        {/* LEFT: Image + Theme */}
        <div className="space-y-6">
          <div
            className="aspect-square w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer bg-card/70 backdrop-blur-md border border-border/60 hover:border-purple-500/60 transition-all shadow-md group"
            onClick={() => setShowImagePicker(true)}
          >
            {coverImage ? (
              <Image
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={500}
                height={500}
                priority
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto opacity-70" />
                <span className="text-xs font-semibold text-muted-foreground block">
                  Click to add cover image
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border/60">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold">Theme Color</Label>
              {!hasPro && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-purple-500/20 text-purple-300 border-none">
                  <Sparkles className="w-3 h-3" />
                  Pro
                </Badge>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    !hasPro && !FREE_COLORS.includes(color)
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:scale-110"
                  }`}
                  style={
                    typeof color === "string" && color.startsWith("linear-gradient")
                      ? {
                          backgroundImage: color,
                          borderColor: themeColor === color ? "white" : "transparent",
                        }
                      : {
                          backgroundColor: color,
                          borderColor: themeColor === color ? "white" : "transparent",
                        }
                  }
                  onClick={() => handleColorClick(color)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card/80 backdrop-blur-xl rounded-2xl p-6 border border-border/60 shadow-xl">
          {/* Title */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Event Title</Label>
            <Input
              {...register("title")}
              placeholder="e.g. Next.js 16 & AI Developer Meetup"
              className="text-2xl font-bold bg-transparent border-border/50 h-12"
            />
            {errors.title && (
              <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Start Date & Time</Label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-xs rounded-xl">
                      {startDate ? format(startDate, "PPP") : "Pick date"}
                      <CalendarIcon className="w-3.5 h-3.5 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => setValue("startDate", date as Date)}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  {...register("startTime")}
                  className="w-24 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* End */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">End Date & Time</Label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-xs rounded-xl">
                      {endDate ? format(endDate, "PPP") : "Pick date"}
                      <CalendarIcon className="w-3.5 h-3.5 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => setValue("endDate", date as Date)}
                      disabled={(date) => date < (startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  {...register("endTime")}
                  className="w-24 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full text-xs rounded-xl">
                    <SelectValue placeholder="Select event category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-xs">
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold">Location</Label>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("city", "");
                    }}
                  >
                    <SelectTrigger className="w-full text-xs rounded-xl">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {indianStates.map((s) => (
                        <SelectItem key={s.isoCode} value={s.name} className="text-xs">
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedState}
                  >
                    <SelectTrigger className="w-full text-xs rounded-xl">
                      <SelectValue placeholder={selectedState ? "City" : "State first"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {cities.map((c) => (
                        <SelectItem key={c.name} value={c.name} className="text-xs">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Input
                {...register("venue")}
                placeholder="Google Maps link or venue URL (optional)"
                type="url"
                className="text-xs rounded-xl"
              />
              <Input
                {...register("address")}
                placeholder="Full address / hall name (optional)"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Provide event details, schedule, agenda..."
              rows={4}
              className="text-xs rounded-xl"
            />
          </div>

          {/* Ticketing & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ticket Type</Label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    value="free"
                    {...register("ticketType")}
                    defaultChecked
                    className="accent-purple-500"
                  />
                  Free
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    value="paid"
                    {...register("ticketType")}
                    className="accent-purple-500"
                  />
                  Paid
                </label>
              </div>

              {ticketType === "paid" && (
                <Input
                  type="number"
                  placeholder="Price ($)"
                  {...register("ticketPrice", { valueAsNumber: true })}
                  className="mt-2 text-xs rounded-xl"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Capacity</Label>
              <Input
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                placeholder="e.g. 100"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 text-base font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Event...
              </>
            ) : (
              "Publish Event"
            )}
          </Button>
        </form>
      </div>

      {showImagePicker && (
        <EnhancedImagePicker
          onImageSelect={(url) => {
            setValue("coverImage", url);
          }}
          onClose={() => setShowImagePicker(false)}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeReason}
      />
    </div>
  );
};

export default CreateEvent;
