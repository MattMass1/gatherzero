import type { EventInputs } from "@/src/lib/types";

type Props = {
  value: EventInputs;
  onChange: (next: EventInputs) => void;
  onSubmit: () => void;
};

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-neutral-300">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-lime-400"
      />
    </label>
  );
}

export function EventForm({ value, onChange, onSubmit }: Props) {
  const patch = (partial: Partial<EventInputs>) =>
    onChange({ ...value, ...partial });

  const patchTravel = (mode: keyof EventInputs["travelShares"], n: number) =>
    onChange({
      ...value,
      travelShares: { ...value.travelShares, [mode]: n },
    });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-neutral-300 sm:col-span-2">
          <span>Event name</span>
          <input
            value={value.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-lime-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          <span>Event type</span>
          <input
            value={value.eventType}
            onChange={(e) => patch({ eventType: e.target.value })}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-lime-400"
          />
        </label>
        <NumberField
          label="Attendees"
          value={value.attendees}
          min={1}
          onChange={(n) => patch({ attendees: n })}
        />
        <NumberField
          label="Duration (hours)"
          value={value.durationHours}
          min={0.5}
          step={0.5}
          onChange={(n) => patch({ durationHours: n })}
        />
        <NumberField
          label="Avg round-trip miles"
          value={value.averageRoundTripMiles}
          onChange={(n) => patch({ averageRoundTripMiles: n })}
        />
        <NumberField
          label="Meals / attendee"
          value={value.mealsPerAttendee}
          onChange={(n) => patch({ mealsPerAttendee: n })}
        />
        <NumberField
          label="Printed pages / attendee"
          value={value.printedPagesPerAttendee}
          onChange={(n) => patch({ printedPagesPerAttendee: n })}
        />
        <NumberField
          label="Waste (kg)"
          value={value.wasteKg}
          onChange={(n) => patch({ wasteKg: n })}
        />
        <NumberField
          label="Electricity (kWh)"
          value={value.electricityKwh}
          onChange={(n) => patch({ electricityKwh: n })}
        />
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-4">
        <legend className="mb-1 text-sm text-neutral-400">
          Travel shares (must total 100)
        </legend>
        {(
          [
            ["car", "Car"],
            ["carpool", "Carpool"],
            ["transit", "Transit"],
            ["bike_walk", "Bike / walk"],
          ] as const
        ).map(([mode, label]) => (
          <NumberField
            key={mode}
            label={label}
            value={value.travelShares[mode]}
            onChange={(n) => patchTravel(mode, n)}
          />
        ))}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          <span>Meal profile</span>
          <select
            value={value.mealProfile}
            onChange={(e) =>
              patch({ mealProfile: e.target.value as EventInputs["mealProfile"] })
            }
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-lime-400"
          >
            <option value="meat_heavy">Meat heavy</option>
            <option value="mixed">Mixed</option>
            <option value="vegetarian">Vegetarian</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          <span>Water service</span>
          <select
            value={value.waterService}
            onChange={(e) =>
              patch({
                waterService: e.target.value as EventInputs["waterService"],
              })
            }
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-lime-400"
          >
            <option value="single_use">Single-use bottles</option>
            <option value="bulk_jugs">Bulk jugs</option>
            <option value="refill_station">Refill stations</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          <span>Print profile</span>
          <select
            value={value.printProfile}
            onChange={(e) =>
              patch({
                printProfile: e.target.value as EventInputs["printProfile"],
              })
            }
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-lime-400"
          >
            <option value="paper_heavy">Paper heavy</option>
            <option value="limited">Limited</option>
            <option value="digital_first">Digital first</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          <span>Waste profile</span>
          <select
            value={value.wasteProfile}
            onChange={(e) =>
              patch({
                wasteProfile: e.target.value as EventInputs["wasteProfile"],
              })
            }
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-lime-400"
          >
            <option value="landfill">Landfill</option>
            <option value="recycling">Recycling</option>
            <option value="recycling_compost">Recycling + compost</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          <span>Budget flexibility</span>
          <select
            value={value.budgetFlexibility}
            onChange={(e) =>
              patch({
                budgetFlexibility: e.target
                  .value as EventInputs["budgetFlexibility"],
              })
            }
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-lime-400"
          >
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="rounded-md bg-lime-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-lime-300"
      >
        Calculate baseline & scenarios
      </button>
    </form>
  );
}
