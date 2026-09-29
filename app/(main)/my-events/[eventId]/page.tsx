"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Trash2,
  QrCode,
  Loader2,
  CheckCircle,
  Download,
  Search,
  Eye,
} from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import QRScannerModal from "../_components/qr-scanner-modal";
import { AttendeeCard } from "../_components/attendee-card";
import { RegistrationItem } from "@/types";

export default function EventDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as any;

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { data: dashboardData, isLoading } = useConvexQuery(
    api.dashboard.getEventDashboard,
    { eventId }
  );

  const { data: registrations, isLoading: loadingRegistrations } =
    useConvexQuery(api.registrations.getEventRegistrations, { eventId });

  const { mutate: deleteEvent, isLoading: isDeleting } = useConvexMutation(
    api.events.deleteEvent
  );

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteEvent({ eventId } as any);
      toast.success("Event deleted successfully");
      router.push("/my-events");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }

    const csvContent = [
      [
        "Name",
        "Email",
        "Registered At",
        "Checked In",
        "Checked In At",
        "QR Code",
      ],
      ...(registrations as RegistrationItem[]).map((reg) => [
        reg.attendeeName,
        reg.attendeeEmail,
        new Date(reg.registeredAt).toLocaleString(),
        reg.checkedIn ? "Yes" : "No",
        reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString() : "-",
        reg.qrCode,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dashboardData?.event.title || "event"}_registrations.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  if (isLoading || loadingRegistrations) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!dashboardData) {
    notFound();
  }

  const { event, stats } = dashboardData;

  const filteredRegistrations = (registrations as RegistrationItem[])?.filter((reg) => {
    const matchesSearch =
      reg.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.qrCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch && reg.status === "confirmed";
    if (activeTab === "checked-in")
      return matchesSearch && reg.checkedIn && reg.status === "confirmed";
    if (activeTab === "pending")
      return matchesSearch && !reg.checkedIn && reg.status === "confirmed";

    return matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20 px-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/my-events")}
          className="gap-2 rounded-xl text-xs font-semibold -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Events
        </Button>
      </div>

      {event.coverImage && (
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden border border-border/50 shadow-xl">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
            </Badge>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>{format(event.startDate, "PPP")}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pink-400" />
              <span>
                {event.locationType === "online"
                  ? "Online Event"
                  : `${event.city}, ${event.state || event.country}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/events/${event.slug}`)}
            className="gap-1.5 rounded-xl text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            View Event
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1.5 rounded-xl text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* QR Code Scanner CTA */}
      {!stats.isEventPast && (
        <Button
          size="lg"
          className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl py-6 shadow-lg shadow-purple-500/20 font-bold text-base"
          onClick={() => setShowQRScanner(true)}
        >
          <QrCode className="w-5 h-5" />
          {stats.isEventToday ? "Scan QR Code for Gate Entry" : "Open QR Scanner"}
        </Button>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/70 backdrop-blur-md border border-border/50 rounded-2xl p-4">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {stats.totalRegistrations}/{stats.capacity}
              </p>
              <p className="text-xs text-muted-foreground">Capacity</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-md border border-border/50 rounded-2xl p-4">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.checkedInCount}</p>
              <p className="text-xs text-muted-foreground">Checked In</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-md border border-border/50 rounded-2xl p-4">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {event.ticketType === "paid" ? `$${stats.totalRevenue}` : `${Math.round(stats.checkInRate)}%`}
              </p>
              <p className="text-xs text-muted-foreground">
                {event.ticketType === "paid" ? "Revenue" : "Check-in Rate"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-md border border-border/50 rounded-2xl p-4">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {stats.isEventPast
                  ? "Ended"
                  : stats.hoursUntilEvent > 24
                    ? `${Math.floor(stats.hoursUntilEvent / 24)}d`
                    : `${stats.hoursUntilEvent}h`}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.isEventPast ? "Status" : "Time Left"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendees Management */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold tracking-tight">Attendee Management</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All ({stats.totalRegistrations})
            </TabsTrigger>
            <TabsTrigger value="checked-in">
              Checked In ({stats.checkedInCount})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({stats.pendingCount})
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by attendee name, email, or QR code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2 rounded-xl text-xs font-semibold"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          <TabsContent value={activeTab} className="space-y-3 mt-0">
            {filteredRegistrations && filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((registration) => (
                <AttendeeCard
                  key={registration._id}
                  registration={registration}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground text-xs">
                No matching attendees found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showQRScanner && (
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
