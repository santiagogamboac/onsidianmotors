export type VehicleType = "Sedan" | "SUV";
export type Brand =
  | "BMW"
  | "Mercedes-Benz"
  | "Audi"
  | "Porsche"
  | "Range Rover";

export interface Vehicle {
  id: string;
  name: string;
  brand: Brand;
  type: VehicleType;
  pricePerDay: number;
  engine: string;
  zeroToHundred: string;
  doors: number;
  seats: number;
  images: string[];
  description: string;
}

// All images served from Pexels CDN (verified reachable, free for display use)
// Format: auto=compress&cs=tinysrgb for optimal delivery, w=800&h=600 for 4:3
const px = (id: number, w = 800, h = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

export const fleet: Vehicle[] = [
  {
    id: "bmw-5er",
    name: "BMW 5 Series",
    brand: "BMW",
    type: "Sedan",
    pricePerDay: 139,
    engine: "R4",
    zeroToHundred: "6.3 s",
    doors: 4,
    seats: 5,
    images: [
      px(3802510), // silver BMW sedan, exterior
      px(112460), // BMW front three-quarter, alternate angle
      px(620335), // alloy wheel detail
    ],
    description:
      "A confident executive sedan that balances effortless performance with everyday comfort — ideal for business trips or a weekend away in style.",
  },
  {
    id: "bmw-7er",
    name: "BMW 7 Series",
    brand: "BMW",
    type: "Sedan",
    pricePerDay: 349,
    engine: "R6",
    zeroToHundred: "5.2 s",
    doors: 4,
    seats: 5,
    images: [
      px(1007410), // dark executive sedan, exterior
      px(100653), // BMW front three-quarter, alternate angle
      px(190537), // cabin / dashboard detail
    ],
    description:
      "The flagship BMW saloon — spacious, quiet, and finished with the kind of detail that makes long drives feel short.",
  },
  {
    id: "mercedes-e-klasse",
    name: "Mercedes-Benz E-Class",
    brand: "Mercedes-Benz",
    type: "Sedan",
    pricePerDay: 159,
    engine: "R4",
    zeroToHundred: "7.3 s",
    doors: 4,
    seats: 5,
    images: [
      px(244206), // Mercedes sedan on road
      px(810357), // Mercedes front three-quarter, alternate angle
      px(620335), // alloy wheel detail
    ],
    description:
      "The benchmark business sedan: smooth, refined, and equipped with just enough tech to make every journey effortless.",
  },
  {
    id: "mercedes-s-klasse",
    name: "Mercedes-Benz S-Class",
    brand: "Mercedes-Benz",
    type: "Sedan",
    pricePerDay: 399,
    engine: "V6",
    zeroToHundred: "4.9 s",
    doors: 4,
    seats: 5,
    images: [
      px(1000633), // luxury black sedan, exterior
      px(244553), // Mercedes front, alternate angle
      px(3729464), // Mercedes front three-quarter, alternate angle
      px(190537), // cabin / dashboard detail
    ],
    description:
      "Mercedes' flagship limousine — first-class comfort, a whisper-quiet cabin, and the kind of presence that turns heads on arrival.",
  },
  {
    id: "audi-a6",
    name: "Audi A6",
    brand: "Audi",
    type: "Sedan",
    pricePerDay: 179,
    engine: "V6",
    zeroToHundred: "5.8 s",
    doors: 4,
    seats: 5,
    images: [
      px(210019), // Audi on road
      px(1149831), // Audi front three-quarter, alternate angle
      px(620335), // alloy wheel detail
    ],
    description:
      "A sharp, understated sedan with quattro confidence and an interior built for focus behind the wheel.",
  },
  {
    id: "audi-q8",
    name: "Audi Q8",
    brand: "Audi",
    type: "SUV",
    pricePerDay: 229,
    engine: "V6",
    zeroToHundred: "5.9 s",
    doors: 5,
    seats: 5,
    images: [
      px(116675), // premium SUV exterior
      px(190537), // cabin / dashboard detail
      px(620335), // alloy wheel detail
    ],
    description:
      "Audi's coupé-SUV flagship — bold styling outside, first-class comfort for five inside.",
  },
  {
    id: "porsche-cayenne",
    name: "Porsche Cayenne",
    brand: "Porsche",
    type: "SUV",
    pricePerDay: 249,
    engine: "V6",
    zeroToHundred: "6.0 s",
    doors: 5,
    seats: 5,
    images: [
      px(1545743), // sports SUV, exterior
      px(620335), // alloy wheel detail
      px(190537), // cabin / dashboard detail
    ],
    description:
      "A sports car in an SUV's body — Porsche handling with room for the whole trip's luggage.",
  },
  {
    id: "range-rover-vogue",
    name: "Range Rover Vogue",
    brand: "Range Rover",
    type: "SUV",
    pricePerDay: 289,
    engine: "V6",
    zeroToHundred: "6.5 s",
    doors: 5,
    seats: 5,
    images: [
      px(627678), // large luxury SUV, exterior
      px(190537), // cabin / dashboard detail
      px(620335), // alloy wheel detail
    ],
    description:
      "The definitive luxury SUV — commanding on the road, serene inside, and ready for any terrain.",
  },
];

export const brandCounts = fleet.reduce<Record<string, number>>((acc, v) => {
  acc[v.brand] = (acc[v.brand] ?? 0) + 1;
  return acc;
}, {});
