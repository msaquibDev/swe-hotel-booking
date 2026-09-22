//app/booking-success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CircleCheck as CheckCircle,
  Calendar,
  Chrome as Home,
  Download,
  MapPinHouse,
} from "lucide-react";

export default function BookingSuccessPage() {
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("id");
  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      setIsLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${id}`,
      );
      if (response.ok) {
        const booking = await response.json();
        setBookingDetails(booking);
      }
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Loading Booking Details
            </h2>
            <p className="text-gray-600">
              Please wait while we fetch your booking information...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-3xl">Booking Confirmed!</CardTitle>
            <p className="text-green-100 mt-2">Thank you for your booking</p>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Booking Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-semibold">
                      {bookingDetails?.booking_id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-semibold text-green-600 capitalize">
                      {bookingDetails?.payment_status || "success"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guest Name</p>
                    <p className="font-semibold">
                      {bookingDetails
                        ? `${bookingDetails.first_name} ${bookingDetails.last_name}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-semibold text-green-600">
                      ₹{bookingDetails?.total_amount || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Stay Details
                </h3>
                <div className="space-y-3">
                  {/* Hotel Name */}
                  <div className="flex items-center space-x-3">
                    <MapPinHouse className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Hotel Name</p>
                      <p className="text-sm text-gray-600">
                        {bookingDetails?.hotel?.hotel_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Check-in</p>
                      <p className="text-sm text-gray-600">
                        {bookingDetails
                          ? new Date(
                              bookingDetails.check_in_date,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Check-out</p>
                      <p className="text-sm text-gray-600">
                        {bookingDetails
                          ? new Date(
                              bookingDetails.check_out_date,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Room Type</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {bookingDetails?.room_type || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Confirmation */}
              {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Confirmation Email Sent
                    </p>
                    <p className="text-sm text-blue-600">
                      A detailed confirmation has been sent to{" "}
                      {bookingDetails?.email || "your email"}
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Next Steps */}
              {/* <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>
                      You will receive a confirmation email with all details
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Please carry a valid ID proof during check-in</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>For any queries, contact our customer support</span>
                  </li>
                </ul>
              </div> */}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Print Confirmation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
