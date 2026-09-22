//app/booking-error/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Phone } from "lucide-react";

export default function BookingErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message");

  const getErrorMessage = () => {
    switch (message) {
      case "BookingNotFound":
        return "The booking reference was not found. Please contact support.";
      case "InternalError":
        return "An internal error occurred. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again or contact support";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-orange-800">
            Booking Error
          </h2>
          <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-700"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("tel:+911234567890", "_self")}
            >
              <Phone className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              If you continue to experience issues, please contact our customer
              support team with any reference numbers you may have.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
