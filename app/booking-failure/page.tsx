//app/booking-failure/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleX as XCircle, RotateCcw, Home } from "lucide-react";

export default function BookingFailurePage() {
  const searchParams = useSearchParams(); // Ensure the component re-renders on URL change
  const router = useRouter();
  const bookingId = searchParams.get("id");

  // const handleRetry = () => {
  //   if (bookingId) {
  //     // Retry payment for the same booking
  //     router.push(`/retry?bookingId=${bookingId}`);
  //   } else {
  //     // Go back to booking page
  //     router.back();
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-red-800">
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't process your payment. Please try again or contact your
            bank if the amount was deducted.
          </p>

          <div className="space-y-3">
            {/* <Button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button> */}

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </div>

          {/* {bookingId && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Reference ID: <span className="font-mono">{bookingId}</span>
              </p>
            </div>
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}
