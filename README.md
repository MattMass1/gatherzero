# GatherZero

**Plan the event. Cut the footprint.**

GatherZero helps organizers estimate the impact of gatherings and compare lower-impact plans before the event happens.

- **Gather** — events, people, venues  
- **Zero** — less waste, lower emissions, fewer unnecessary costs  
- **G0** — compact app/logo mark (zero + location pin)

Prototype estimates only — for scenario comparison, not formal carbon accounting.

> Prototype estimates based on published conversion factors and organizer-provided assumptions. Results are intended for scenario comparison, not formal carbon accounting.

## Stack

Next.js, TypeScript, Tailwind CSS, Vitest.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run build
```

## Factor sources and limitations

All conversion factors live in `src/data/factors.ts`. The impact engine must not invent numeric constants elsewhere.

| Category | Factor IDs | Primary sources | Known limitations |
|---|---|---|---|
| Travel | `travel_car`, `travel_carpool`, `travel_transit`, `travel_bike_walk` | [EPA typical passenger vehicle](https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle), [EPA GHG Emission Factors Hub](https://www.epa.gov/climateleadership/ghg-emission-factors-hub) | Single national proxies; carpool uses a fixed 2.5 occupancy split; bike/walk direct emissions are 0 by prototype policy |
| Food | `food_meat_heavy`, `food_mixed`, `food_vegetarian` | [Our World in Data — food impacts](https://ourworldindata.org/environmental-impacts-of-food) | Meal-scale approximations, not recipe LCAs |
| Materials | `water_*`, `print_page` | [EPA plastics facts](https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/plastics-material-specific-data), [EPA WaterSense](https://www.epa.gov/watersense), Environmental Paper Network | Water factors are per attendee-serving proxies; print is per page before profile multipliers |
| Waste | `waste_landfill`, `waste_recycling`, `waste_recycling_compost` | [EPA WARM](https://www.epa.gov/warm) | Simplified mixed-waste intensities; local capture rates ignored |
| Energy | `energy_grid_electricity` | [EPA eGRID](https://www.epa.gov/egrid) | US average grid — not venue-specific |

**Print profile multipliers** (effective pages): paper_heavy `1.0`, limited `0.5`, digital_first `0.15`.

These values are good enough to rank scenarios for a hackathon demo. They are not a substitute for ISO-aligned event carbon accounting.

## Backup names

1. VenueZero  
2. TreadZero  
3. GatherLow  
4. ZeroGather  
