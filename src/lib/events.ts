export type NearbyEvent = {
  id: string | number;
  name: string;
  category: string;
  location: string;
  distance: string;
  time: string;
  attendees: string;
  price: string;
  highlight: string;
  lat: number;
  lng: number;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
};

export type NearbyEventsResponse = {
  events: NearbyEvent[];
};
