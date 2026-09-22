//app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Star,
  Users,
  Wifi,
  Car,
  Coffee,
  Waves,
} from "lucide-react";
import HotelListing from "./components/HotelListing";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      {/* <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg')] bg-cover bg-center mix-blend-overlay opacity-40"></div>

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Conference Hotel
              </span>
              <br />
              Booking System
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
              Experience luxury and comfort at Conference Hotel.
              Book your stay with us for an unforgettable experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/booking">
                <Button className="h-14 px-8 text-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Now
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-14 px-8 text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                <MapPin className="mr-2 h-5 w-5" />
                View Location
              </Button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2">5-Star Luxury</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Weikfield IT City</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <Header />

      <HotelListing />

      {/* Features Section */}
      {/* <div className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the perfect blend of modern amenities and traditional
            hospitality
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Users,
              title: "Premium Rooms",
              desc: "Luxurious accommodations with modern amenities",
            },
            {
              icon: Wifi,
              title: "Free Wi-Fi",
              desc: "High-speed internet throughout the property",
            },
            {
              icon: Car,
              title: "Valet Parking",
              desc: "Complimentary parking with valet service",
            },
            {
              icon: Coffee,
              title: "Fine Dining",
              desc: "World-class restaurants and room service",
            },
            {
              icon: Waves,
              title: "Pool & Spa",
              desc: "Relaxation facilities with spa services",
            },
            {
              icon: MapPin,
              title: "Prime Location",
              desc: "Heart of Pune's business district",
            },
            {
              icon: Calendar,
              title: "24/7 Service",
              desc: "Round-the-clock concierge assistance",
            },
            {
              icon: Star,
              title: "5-Star Luxury",
              desc: "Award-winning hospitality and service",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur"
            >
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}

      {/* CTA Section */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-20"> */}
      {/* <div className="container mx-auto px-4 text-center"> */}
      {/* <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for Your Perfect Stay?
          </h2> */}
      {/* <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            For any queries please email to – info@synergymeetings.in
          </p> */}
      {/* <Link href="/booking">
            <Button className="h-16 px-12 text-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-2xl">
              <Calendar className="mr-3 h-6 w-6" />
              Book Your Stay Today
            </Button>
          </Link> */}
      {/* </div> */}
      {/* </div> */}

      <Footer />
    </div>
  );
}
