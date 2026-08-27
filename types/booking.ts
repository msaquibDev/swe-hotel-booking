export interface BookingFormData {
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  gender: string;
  mobile: string;
  address: string;
  state: string;
  companyName?: string;
  gst?: string;
  checkinDate: string;
  checkoutDate: string;
  roomType: string;
  agreeToPolicy: boolean;
}

export interface StoredBooking extends BookingFormData {
  _id?: string;
  bookingId: string;
  paymentId?: string;
  paymentRequestId: string;
  amount: number;
  paymentStatus: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResponse {
  payment_request: {
    id: string;
    longurl: string;
    shorturl: string;
  };
}

export interface BookingConfirmation {
  bookingId: string;
  paymentId: string;
  amount: number;
  customerDetails: BookingFormData;
  hotelDetails: {
    name: string;
    checkinDate: string;
    checkoutDate: string;
    roomType: string;
  };
}
