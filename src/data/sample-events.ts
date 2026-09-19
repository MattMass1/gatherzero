import type { EventInputs } from "../lib/types";

export interface SampleEvent {
  id: string;
  label: string;
  blurb: string;
  disclaimer: string;
  inputs: EventInputs;
}

export const SAMPLE_DISCLAIMER =
  "Illustrative sample for demo purposes — not an official measurement of any real event.";

export const SAMPLE_EVENTS: SampleEvent[] = [
  {
    id: "bay-hacks",
    label: "Bay Hacks-style hackathon",
    blurb: "24-hour campus hackathon with meals, mixed travel, bottles, printing, and landfill waste.",
    disclaimer: SAMPLE_DISCLAIMER,
    inputs: {
      name: "Bay Hacks-style Hackathon",
      eventType: "hackathon",
      attendees: 180,
      durationHours: 24,
      averageRoundTripMiles: 16,
      travelShares: { car: 55, carpool: 15, transit: 20, bike_walk: 10 },
      mealsPerAttendee: 4,
      mealProfile: "mixed",
      waterService: "single_use",
      printedPagesPerAttendee: 6,
      printProfile: "paper_heavy",
      wasteKg: 120,
      wasteProfile: "landfill",
      electricityKwh: 450,
      budgetFlexibility: "moderate",
    },
  },
  {
    id: "community-market",
    label: "Community market",
    blurb: "Daytime outdoor market with vendor/attendee travel, food service, packaging, and recycling.",
    disclaimer: SAMPLE_DISCLAIMER,
    inputs: {
      name: "Harbor Community Market",
      eventType: "community_market",
      attendees: 350,
      durationHours: 5,
      averageRoundTripMiles: 8,
      travelShares: { car: 45, carpool: 20, transit: 15, bike_walk: 20 },
      mealsPerAttendee: 1,
      mealProfile: "meat_heavy",
      waterService: "bulk_jugs",
      printedPagesPerAttendee: 2,
      printProfile: "limited",
      wasteKg: 90,
      wasteProfile: "recycling",
      electricityKwh: 60,
      budgetFlexibility: "low",
    },
  },
];

export function getSampleEvent(id: string): SampleEvent | undefined {
  return SAMPLE_EVENTS.find((sample) => sample.id === id);
}
