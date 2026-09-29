"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Loader2 } from "lucide-react";
import { State, City } from "country-state-city";
import { format } from "date-fns";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { createLocationSlug } from "@/lib/location-utils";
import { getCategoryIcon } from "@/lib/data";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { EventItem } from "@/types";

export default function SearchLocationBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  const { mutate: updateLocation } = useConvexMutation(
    api.users.completeOnboarding
  );

  const { data: searchResults, isLoading: searchLoading } = useConvexQuery(
    api.search.searchEvents,
    searchQuery.trim().length >= 2 ? ({ query: searchQuery, limit: 5 } as any) : "skip"
  );

  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    if (currentUser?.location) {
      setSelectedState(currentUser.location.state || "");
      setSelectedCity(currentUser.location.city || "");
    }
  }, [currentUser]);

  function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeoutId);
        func(...args);
      };
      clearTimeout(timeoutId);
      timeoutId = setTimeout(later, delay);
    };
  }

  const cities = useMemo(() => {
    if (!selectedState) return [];
    const state = indianStates.find((s) => s.name === selectedState);
    if (!state) return [];
    return City.getCitiesOfState("IN", state.isoCode);
  }, [selectedState, indianStates]);

  const debouncedSetQuery = useRef(
    debounce((value: string) => setSearchQuery(value), 300)
  ).current;

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSetQuery(value);
    setShowSearchResults(value.length >= 2);
  };

  const handleEventClick = (slug: string) => {
    setShowSearchResults(false);
    setSearchQuery("");
    router.push(`/events/${slug}`);
  };

  const handleLocationSelect = async (city: string, state: string) => {
    try {
      if (currentUser?.interests && currentUser?.location) {
        await updateLocation({
          location: { city, state, country: "India" },
          interests: currentUser.interests,
        } as any);
      }
      const slug = createLocationSlug(city, state);
      router.push(`/explore/${slug}`);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center w-full shadow-sm rounded-xl border border-border/50 bg-background/60 backdrop-blur-md overflow-hidden">
      {/* Search Bar */}
      <div className="relative flex-1" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search events, topics, or venues..."
            onChange={handleSearchInput}
            onFocus={() => {
              if (searchQuery.length >= 2) setShowSearchResults(true);
            }}
            className="pl-10 border-0 bg-transparent h-10 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className="absolute top-full left-0 mt-2 w-full md:w-96 bg-popover/95 border border-border/60 rounded-xl shadow-2xl backdrop-blur-xl z-50 max-h-96 overflow-y-auto p-1">
            {searchLoading ? (
              <div className="p-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              </div>
            ) : searchResults && (searchResults as EventItem[]).length > 0 ? (
              <div className="py-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Search Results
                </p>
                {(searchResults as EventItem[]).map((event) => (
                  <button
                    key={event._id}
                    onClick={() => handleEventClick(event.slug)}
                    className="w-full px-3 py-2.5 hover:bg-accent/60 rounded-lg text-left transition-colors flex items-center gap-3"
                  >
                    <div className="text-2xl shrink-0 p-1 bg-accent/40 rounded-md">
                      {getCategoryIcon(event.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-foreground line-clamp-1">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          {format(event.startDate, "MMM dd")}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-pink-400" />
                          {event.city}
                        </span>
                      </div>
                    </div>
                    {event.ticketType === "free" ? (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-none">
                        Free
                      </Badge>
                    ) : (
                      <span className="text-xs font-semibold text-purple-400">
                        ${event.ticketPrice}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No events found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-5 w-[1px] bg-border/60 shrink-0" />

      {/* State Select */}
      <Select
        value={selectedState}
        onValueChange={(value) => {
          setSelectedState(value);
          setSelectedCity("");
        }}
      >
        <SelectTrigger className="w-28 md:w-32 h-10 border-0 bg-transparent rounded-none focus:ring-0 text-xs font-medium">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {indianStates.map((state) => (
            <SelectItem key={state.isoCode} value={state.name} className="text-xs">
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="h-5 w-[1px] bg-border/60 shrink-0" />

      {/* City Select */}
      <Select
        value={selectedCity}
        onValueChange={(value) => {
          setSelectedCity(value);
          if (value && selectedState) {
            handleLocationSelect(value, selectedState);
          }
        }}
        disabled={!selectedState}
      >
        <SelectTrigger className="w-28 md:w-32 h-10 border-0 bg-transparent rounded-none focus:ring-0 text-xs font-medium">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {cities.map((city) => (
            <SelectItem key={city.name} value={city.name} className="text-xs">
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
