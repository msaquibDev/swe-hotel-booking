// app/booking-success/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CircleCheck as CheckCircle,
  Calendar,
  Chrome as Home,
  Download,
  MapPinHouse,
  Loader2,
} from "lucide-react";

function BookingSuccessContent() {
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

  // Helper: format currency
  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return "N/A";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (Number.isNaN(num)) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Helper: format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
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
    <>
      {/* Print styles — hide everything except .print-area when printing */}
      <style jsx global>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }

          /* Show only the print area and its children */
          .print-area,
          .print-area * {
            visibility: visible;
          }

          /* Position the print area at the top-left of the page */
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }

          /* Hide buttons on the printed page */
          .no-print {
            display: none !important;
          }

          /* Remove page background gradient */
          body {
            background: white !important;
          }

          /* Remove shadow from card when printing */
          .print-area .shadow-2xl {
            box-shadow: none !important;
          }

          /* Add some page margins */
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Wrap the printable content in .print-area */}
          <Card className="print-area max-w-2xl mx-auto shadow-2xl bg-white/95 backdrop-blur">
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
                        {formatCurrency(bookingDetails?.total_amount)}
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
                          {formatDate(bookingDetails?.check_in_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Check-out</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(bookingDetails?.check_out_date)}
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
              </div>
            </CardContent>
          </Card>

          {/* Action buttons OUTSIDE the print-area, wrapped in .no-print */}
          <div className="no-print max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 pt-6">
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
      </div>
    </>
  );
}

// Suspense wrapper required for useSearchParams in Next.js 14+
export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
