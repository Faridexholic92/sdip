export type SabahMetLocation = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

export const SABAH_MET_LOCATIONS: SabahMetLocation[] = [
  {
    id: "LOCATION:238",
    name: "Beaufort",
    latitude: 5.3473,
    longitude: 115.7455
  },
  {
    id: "LOCATION:239",
    name: "Beluran",
    latitude: 5.8956,
    longitude: 117.5557
  },
  {
    id: "LOCATION:873",
    name: "Kalabakan",
    latitude: null,
    longitude: null
  },
  {
    id: "LOCATION:245",
    name: "Keningau",
    latitude: 5.25,
    longitude: 116.25
  },
  {
    id: "LOCATION:242",
    name: "Kinabatangan",
    latitude: 5.41667,
    longitude: 117.58333
  },
  {
    id: "LOCATION:240",
    name: "Kota Belud",
    latitude: 6.351,
    longitude: 116.4305
  },
  {
    id: "LOCATION:241",
    name: "Kota Kinabalu",
    latitude: 5.9749,
    longitude: 116.0724
  },
  {
    id: "LOCATION:243",
    name: "Kota Marudu",
    latitude: 6.41667,
    longitude: 116.75
  },
  {
    id: "LOCATION:244",
    name: "Kuala Penyu",
    latitude: 5.41667,
    longitude: 115.41667
  },
  {
    id: "LOCATION:246",
    name: "Kudat",
    latitude: 6.8837,
    longitude: 116.8477
  },
  {
    id: "LOCATION:452",
    name: "Kunak",
    latitude: 4.7258393,
    longitude: 117.8687431
  },
  {
    id: "LOCATION:247",
    name: "Lahad Datu",
    latitude: 5,
    longitude: 118
  },
  {
    id: "LOCATION:874",
    name: "Labuk & Sugut",
    latitude: null,
    longitude: null
  },
  {
    id: "LOCATION:871",
    name: "Membakut",
    latitude: null,
    longitude: null
  },
  {
    id: "LOCATION:343",
    name: "Nabawan",
    latitude: 5.0397959,
    longitude: 116.4240058
  },
  {
    id: "LOCATION:248",
    name: "Papar",
    latitude: 5.73333,
    longitude: 115.93333
  },
  {
    id: "LOCATION:799",
    name: "Paitan",
    latitude: null,
    longitude: null
  },
  {
    id: "LOCATION:249",
    name: "Penampang",
    latitude: 5.83333,
    longitude: 116.25
  },
  {
    id: "LOCATION:798",
    name: "Pensiangan",
    latitude: null,
    longitude: null
  },
  {
    id: "LOCATION:457",
    name: "Pitas",
    latitude: 6.7461559,
    longitude: 116.9735866
  },
  {
    id: "LOCATION:447",
    name: "Putatan",
    latitude: 5.8806047,
    longitude: 116.0215037
  },
  {
    id: "LOCATION:251",
    name: "Ranau",
    latitude: 5.91667,
    longitude: 116.75
  },
  {
    id: "LOCATION:252",
    name: "Sandakan",
    latitude: 5.75,
    longitude: 118
  },
  {
    id: "LOCATION:254",
    name: "Semporna",
    latitude: 4.5,
    longitude: 118.33333
  },
  {
    id: "LOCATION:255",
    name: "Sipitang",
    latitude: 5.08333,
    longitude: 115.55
  },
  {
    id: "LOCATION:872",
    name: "Sook",
    latitude: null,
    longitude: null
  },
  {
    id: "LOCATION:256",
    name: "Tambunan",
    latitude: 5.71667,
    longitude: 116.4
  },
  {
    id: "LOCATION:257",
    name: "Tawau",
    latitude: 4.2498,
    longitude: 117.8871
  },
  {
    id: "LOCATION:455",
    name: "Telupid",
    latitude: 5.6286757,
    longitude: 117.1164687
  },
  {
    id: "LOCATION:258",
    name: "Tenom",
    latitude: 5.13333,
    longitude: 115.95
  },
  {
    id: "LOCATION:454",
    name: "Tongod",
    latitude: 5.0669967,
    longitude: 116.7498352
  },
  {
    id: "LOCATION:250",
    name: "Tuaran",
    latitude: 6.08333,
    longitude: 116.33333
  }
];

export const DEFAULT_SABAH_MET_LOCATION =
  SABAH_MET_LOCATIONS.find(
    (location) =>
      location.id === "LOCATION:251"
  ) ?? SABAH_MET_LOCATIONS[0];

export function getSabahMetLocation(
  locationId: string
) {
  return SABAH_MET_LOCATIONS.find(
    (location) =>
      location.id === locationId
  );
}
