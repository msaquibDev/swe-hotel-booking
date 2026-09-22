"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { hotels } from "@/data/hotels";
import { useRouter } from "next/navigation";
import { MapPin, Plane, Landmark, Bus, TrainFront } from "lucide-react";
import { Hotel } from "@/types/hotel";

export default function HotelListing() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("all");

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel`);
        const data = await res.json();
        // console.log("Fetched hotels:", data);
        setHotels(data);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  // Filter hotels dynamically
  const filteredHotels = hotels.filter((hotel) => {
    let starMatch =
      starFilter === "all" || hotel.star_rating === Number(starFilter);

    // venue distance = last element in distances[] (e.g., "2 Kms away from the venue")
    const venueDistance = hotel.distances.find((d) =>
      d.toLowerCase().includes("venue"),
    );
    const distanceValue = venueDistance
      ? parseFloat(venueDistance.split(" ")[0])
      : null;

    let distanceMatch =
      distanceFilter === "all" ||
      (distanceFilter === "near" &&
        distanceValue !== null &&
        distanceValue <= 3) ||
      (distanceFilter === "far" && distanceValue !== null && distanceValue > 3);

    return starMatch && distanceMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">
        Choose Your Stay
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sidebar Filter */}
        <aside className="bg-white rounded-xl shadow-md p-6 space-y-10 h-fit">
          <h3 className="text-lg font-semibold">Filters</h3>

          {/* Star Rating Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Star Rating</label>
            <Select value={starFilter} onValueChange={setStarFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="5">5 Star</SelectItem>
                <SelectItem value="3">3 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Distance from Venue</label>
            <Select value={distanceFilter} onValueChange={setDistanceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="near">Near (&lt;= 3 km)</SelectItem>
                <SelectItem value="far">Far (&gt; 3 km)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(starFilter !== "all" || distanceFilter !== "all") && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setStarFilter("all");
                setDistanceFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </aside>

        {/* Hotel Listing */}
        <div className="md:col-span-3">
          {filteredHotels.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <Card
                  key={hotel._id}
                  className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 flex flex-col"
                >
                  {/* Image + Star Badge */}
                  <div className="relative">
                    <img
                      src={hotel.main_image_url}
                      alt={hotel.hotel_name}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-sm px-2 py-1 rounded-full font-semibold shadow-md">
                      ⭐ {hotel.star_rating}
                    </div>
                  </div>

                  {/* Content fills space, flex-col */}
                  <CardContent className="p-5 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="text-blue-700 text-xl font-bold mb-1">
                      {hotel.hotel_name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 mt-4 mb-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={20} className="shrink-0" />
                        <p className="text-sm">{hotel.address}</p>
                      </div>
                    </div>

                    {/* Distances */}
                    <div className="flex flex-col space-y-4 justify-between text-gray-700 text-sm mb-4">
                      {hotel.distances.map((dist, index) => {
                        let Icon;
                        if (dist.toLowerCase().includes("railway")) {
                          Icon = TrainFront;
                        } else if (dist.toLowerCase().includes("airport")) {
                          Icon = Plane;
                        } else if (dist.toLowerCase().includes("venue")) {
                          Icon = Landmark;
                        } else {
                          Icon = Bus;
                        }
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <Icon size={16} className="shrink-0" />
                            <span>{dist}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Book Button pushed to bottom */}
                    <div className="mt-auto">
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-2 rounded-lg hover:scale-105 transition-transform"
                        onClick={() =>
                          router.push(`/booking?hotel=${hotel._id}`)
                        }
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">
              No hotels match your filters.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
