"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Calendar, CreditCard, Star, Home } from "lucide-react";
import Link from "next/link";
import { indianStates } from "@/lib/indian-states";
import { BookingFormData } from "@/types/booking";
import { useSearchParams } from "next/navigation";
// import { hotels } from "@/data/hotels"; // make sure this is imported
import { Hotel } from "@/types/hotel";

const bookingSchema = z.object({
  title: z.enum(["Mr", "Ms", "Mrs", "Dr"], {
    errorMap: () => ({ message: "Please select a title" }),
  }),
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(/^[A-Za-z\s]+$/, "Only alphabets allowed"),
  middleName: z.string().optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(/^[A-Za-z\s]+$/, "Only alphabets allowed"),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  state: z.string().min(1, "Please select a state"),
  companyName: z.string().min(1, "Company name is required"),
  gst: z.string().optional(),
  checkinDate: z.string().min(1, "Check-in date is required"),
  checkoutDate: z.string().min(1, "Check-out date is required"),
  roomType: z.string().min(1, "Please select a room type"),
  agreeToPolicy: z
    .boolean()
    .refine((val) => val === true, "You must agree to the booking policy"),
});

export default function BookingPage() {
  const [checkinDate, setCheckinDate] = useState<Date>();
  const [checkoutDate, setCheckoutDate] = useState<Date>();
  const [roomType, setRoomType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  console.log("Hotel data in booking page:", hotel);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchParams = useSearchParams();
  const hotelId = searchParams.get("hotel");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatDateYYYYMMDD = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!hotelId) return;

    // Fetch hotel dynamically from your API or local data
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel/${hotelId}`)
      .then((res) => res.json())
      .then((data: Hotel) => setHotel(data))
      .catch((err) => console.error("Failed to fetch hotel:", err));
  }, [hotelId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomType: "single",
    },
  });

  const watchedValues = watch();

  const selectedRoom = React.useMemo(() => {
    if (!hotel || !roomType) return null;

    return hotel.room_types?.find((room) => room.name === roomType) || null;
  }, [hotel, roomType]);

  const totalAmount = React.useMemo(() => {
    if (!selectedRoom) return 0;

    if (checkinDate && checkoutDate) {
      const nights = Math.ceil(
        (checkoutDate.getTime() - checkinDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return nights * selectedRoom.price;
    }

    return selectedRoom.price;
  }, [checkinDate, checkoutDate, selectedRoom]);

  // ADD THIS ONSUBMIT FUNCTION
  const onSubmit = async (data: BookingFormData) => {
    if (!hotel) {
      alert("Hotel information not loaded. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare booking data according to API requirements
      const selectedRoom = hotel.room_types.find(
        (room) => room.name === roomType,
      );

      if (!selectedRoom) {
        throw new Error("Please select a valid room type");
      }

      const bookingData = {
        hotel: hotelId,
        title: data.title,
        first_name: data.firstName,
        middle_name: data.middleName || "",
        last_name: data.lastName,
        gender: data.gender.charAt(0).toUpperCase() + data.gender.slice(1), // Capitalize first letter
        email: data.email,
        mobile: data.mobile,
        state: data.state,
        company_name: data.companyName,
        gst_number: data.gst || "",
        address: data.address,
        check_in_date: checkinDate ? formatDateYYYYMMDD(checkinDate) : "",
        check_out_date: checkoutDate ? formatDateYYYYMMDD(checkoutDate) : "",
        room_type: selectedRoom.name,
        total_amount: totalAmount,
      };
      console.log("Booking data.......", bookingData);
      // Call the payment initiation endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/initiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        },
      );

      const result = await response.json();

      if (response.ok) {
        // Redirect to Instamojo payment page
        window.location.href = result.payment_url;
      } else {
        throw new Error(result.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      alert("Failed to process booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDates = (start: Date, end: Date): Date[] => {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const availableCheckinDates = hotel
    ? generateDates(
        new Date(hotel.checkin_start_date),
        new Date(hotel.checkin_end_date),
      )
    : [];

  const getAvailableCheckoutDates = (checkin?: Date) => {
    if (!hotel || !checkin) return [];
    const start =
      checkin > new Date(hotel.checkout_start_date)
        ? checkin
        : new Date(hotel.checkout_start_date);
    const end = new Date(hotel.checkout_end_date);
    return generateDates(start, end);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Banner */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{
            backgroundImage: hotel?.main_image_url
              ? `url(${hotel.main_image_url})`
              : `url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg')`,
          }}
        ></div>

        {/* Floating Home Icon */}
        <div
          className={`fixed top-6 left-6 z-50 transition-all duration-300 ${
            isScrolled
              ? "bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-md shadow-xl rounded-full p-3 hover:from-blue-700 hover:to-purple-700 hover:scale-110 border-2 border-white/30"
              : "bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30"
          }`}
        >
          <Link href="/" className="flex items-center justify-center">
            <Home className="h-6 w-6 text-white" />
          </Link>
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              {hotel?.hotel_name || "Hotel Name"}
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Experience luxury and comfort in{" "}
              {hotel?.address || "the selected location"}
            </p>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span className="text-sm">{hotel?.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                {Array.from({ length: hotel?.star_rating || 0 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-sm ml-1">
                  {hotel?.star_rating}-Star Luxury
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Images and Map */}
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left: Hotel Image */}
          <Card className="overflow-hidden shadow-2xl">
            <div
              className="h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${hotel?.main_image_url})` }}
            ></div>
          </Card>

          {/* Right: Map */}
          <Card className="overflow-hidden shadow-2xl">
            <div className="h-64 relative">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  `${hotel?.hotel_name}, ${hotel?.address}` || "Hotel Location",
                )}&z=15&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                title="Hotel Map"
                allowFullScreen
              ></iframe>
            </div>
          </Card>
        </div>

        {/* Booking Form */}
        <Card className="shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span>Book Your Stay</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Select onValueChange={(value) => setValue("title", value)}>
                    <SelectTrigger
                      className={errors.title ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.title && (
                    <p className="text-red-500 text-sm">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className={errors.firstName ? "border-red-500" : ""}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    {...register("middleName")}
                    placeholder="Enter middle name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    className={errors.lastName ? "border-red-500" : ""}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select onValueChange={(value) => setValue("gender", value)}>
                    <SelectTrigger
                      className={errors.gender ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    {...register("mobile")}
                    className={errors.mobile ? "border-red-500" : ""}
                    placeholder="Enter mobile number"
                  />

                  {errors.mobile && (
                    <p className="text-red-500 text-sm">
                      {errors.mobile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select onValueChange={(value) => setValue("state", value)}>
                    <SelectTrigger
                      className={errors.state ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-red-500 text-sm">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    className={errors.companyName ? "border-red-500" : ""}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number (Optional)</Label>
                  <Input
                    id="gst"
                    {...register("gst")}
                    placeholder="Enter GST number if applicable"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...register("address")}
                  className={errors.address ? "border-red-500" : ""}
                  placeholder="Enter address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Booking Details */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Booking Details
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label>Check-in Date *</Label>
                    <DatePicker
                      date={checkinDate}
                      setDate={(date) => {
                        setCheckinDate(date);
                        setValue(
                          "checkinDate",
                          date?.toISOString().split("T")[0] || "",
                        );
                        setCheckoutDate(undefined);
                        setValue("checkoutDate", "");
                      }}
                      placeholder="Select check-in date"
                      disabled={(date) =>
                        !availableCheckinDates.some(
                          (d) => d.toDateString() === date.toDateString(),
                        )
                      }
                    />

                    {errors.checkinDate && (
                      <p className="text-red-500 text-sm">
                        {errors.checkinDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Check-out Date *</Label>
                    <DatePicker
                      date={checkoutDate}
                      setDate={(date) => {
                        setCheckoutDate(date);
                        setValue(
                          "checkoutDate",
                          date?.toISOString().split("T")[0] || "",
                        );
                      }}
                      placeholder="Select check-out date"
                      disabled={(date) => {
                        const allowedDates =
                          getAvailableCheckoutDates(checkinDate);
                        return !allowedDates.some(
                          (d) => d.toDateString() === date.toDateString(),
                        );
                      }}
                    />

                    {errors.checkoutDate && (
                      <p className="text-red-500 text-sm">
                        {errors.checkoutDate.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Room Selection */}
                <div className="space-y-4">
                  <Label>Room Type *</Label>

                  <RadioGroup
                    value={roomType}
                    onValueChange={(value) => {
                      setRoomType(value);
                      setValue("roomType", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    {hotel?.room_types?.map((room) => (
                      <div
                        key={room.name}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={room.name}
                          id={`room-${room.name}`}
                        />

                        <Label
                          htmlFor={`room-${room.name}`}
                          className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                            roomType === room.name
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{room.name}</div>

                              <div className="text-sm text-gray-500 mt-1">
                                {room.description}
                              </div>

                              <div className="text-sm text-gray-500 mt-1">
                                Up to {room.max_guests} guests
                              </div>
                            </div>

                            <div className="text-right ml-4">
                              <div className="font-bold text-lg">
                                ₹{room.price}
                              </div>

                              <div className="text-sm text-gray-500">
                                per night
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {errors.roomType && (
                    <p className="text-red-500 text-sm">
                      {errors.roomType.message}
                    </p>
                  )}
                </div>

                {/* Inventory Info */}
                {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">30 rooms available</span>
                  </div>
                </div> */}
              </div>

              {/* Booking Policy */}
              <div className="border-t pt-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Booking Policy</h4>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    {hotel?.policies?.map((policy, idx) => (
                      <li key={idx}>• {policy}</li>
                    ))}
                  </ul>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToPolicy"
                      onCheckedChange={(checked) =>
                        setValue("agreeToPolicy", checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="agreeToPolicy"
                      className="text-sm cursor-pointer"
                    >
                      I have read and agree to the booking policy *
                    </Label>
                  </div>
                  {errors.agreeToPolicy && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.agreeToPolicy.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Total Amount</h3>
                    <p className="opacity-90">
                      {checkinDate && checkoutDate ? (
                        <>
                          {`${Math.ceil(
                            (checkoutDate.getTime() - checkinDate.getTime()) /
                              (1000 * 60 * 60 * 24),
                          )} night(s) × ₹${(
                            <p className="opacity-90">
                              {checkinDate && checkoutDate && selectedRoom ? (
                                <>
                                  {`${Math.ceil(
                                    (checkoutDate.getTime() -
                                      checkinDate.getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  )} night(s) × ₹${selectedRoom.price}`}
                                </>
                              ) : selectedRoom ? (
                                `₹${selectedRoom.price} per night`
                              ) : (
                                "Select room and dates for calculation"
                              )}
                            </p>
                          )}`}
                        </>
                      ) : (
                        "Select dates for calculation"
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">₹{totalAmount}</div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay Now - ₹{totalAmount}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
