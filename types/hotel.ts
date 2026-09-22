// types/hotel.ts
export interface RoomType {
  name: string;
  description: string;
  price: number;
  max_guests: number;
}

export interface Hotel {
  _id: string;
  hotel_name: string;
  address: string;
  main_image_url: string;
  star_rating: number;
  distances: string[];
  room_types: RoomType[];
  policies: string[];
  checkin_start_date: string;
  checkin_end_date: string;
  checkout_start_date: string;
  checkout_end_date: string;
}
