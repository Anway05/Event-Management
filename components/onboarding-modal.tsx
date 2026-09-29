"use client";

import { useState, useMemo } from "react";
import { MapPin, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { State, City } from "country-state-city";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/data";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [location, setLocation] = useState({
    city: "",
    state: "",
    country: "India",
  });

  const { mutate: completeOnboarding, isLoading } = useConvexMutation(
    api.users.completeOnboarding
  );

  const indianStates = useMemo(() => {
    return State.getStatesOfCountry("IN");
  }, []);

  const cities = useMemo(() => {
    if (!location.state) return [];
    const selectedState = indianStates.find((s) => s.name === location.state);
    if (!selectedState) return [];
    return City.getCitiesOfState("IN", selectedState.isoCode);
  }, [location.state, indianStates]);

  const toggleInterest = (categoryId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNext = () => {
    if (step === 1 && selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }
    if (step === 2 && (!location.city || !location.state)) {
      toast.error("Please select both state and city");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding({
        location: {
          city: location.city,
          state: location.state,
          country: location.country,
        },
        interests: selectedInterests,
      } as any);
      toast.success("Welcome to Nova Events! 🎉");
      onComplete();
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error(error);
    }
  };

  const progress = (step / 2) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl border-border/60 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="mb-4">
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            {step === 1 ? (
              <>
                <Heart className="w-6 h-6 text-purple-500" />
                What interests you?
              </>
            ) : (
              <>
                <MapPin className="w-6 h-6 text-purple-500" />
                Where are you located?
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Select at least 3 categories to personalize your event recommendations"
              : "We'll show you local events happening near your city"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Select Interests */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleInterest(category.id)}
                    className={`p-4 rounded-xl border transition-all text-left duration-200 ${
                      selectedInterests.includes(category.id)
                        ? "border-purple-500 bg-purple-500/15 shadow-md shadow-purple-500/10 font-semibold"
                        : "border-border/60 hover:border-purple-400/50 bg-card/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-xs font-medium text-foreground">{category.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedInterests.length >= 3 ? "default" : "secondary"
                  }
                  className="bg-purple-600 text-white"
                >
                  {selectedInterests.length} selected
                </Badge>
                {selectedInterests.length >= 3 && (
                  <span className="text-xs text-emerald-500 font-medium">
                    ✓ Ready to continue
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-xs font-semibold">State</Label>
                  <Select
                    value={location.state}
                    onValueChange={(value) => {
                      setLocation({ ...location, state: value, city: "" });
                    }}
                  >
                    <SelectTrigger id="state" className="h-10 w-full rounded-xl">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {indianStates.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-semibold">City</Label>
                  <Select
                    value={location.city}
                    onValueChange={(value) =>
                      setLocation({ ...location, city: value })
                    }
                    disabled={!location.state}
                  >
                    <SelectTrigger id="city" className="h-10 w-full rounded-xl">
                      <SelectValue
                        placeholder={
                          location.state ? "Select city" : "Select state first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {cities.length > 0 ? (
                        cities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-cities" disabled>
                          No cities available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {location.city && location.state && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs text-foreground">Selected Primary Location</p>
                      <p className="text-xs text-muted-foreground">
                        {location.city}, {location.state}, {location.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border/40">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md"
          >
            {isLoading
              ? "Completing..."
              : step === 2
                ? "Complete Setup"
                : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
