// types/booking.ts
export interface BookingFormData {
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  companyName: string;
  gst?: string;
  checkinDate: string;
  checkoutDate: string;
  roomType: string;
  agreeToPolicy: boolean;
}

export interface Booking {
  _id?: string;
  booking_id: string;
  hotel: string;
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  company_name: string;
  gst_number: string;
  check_in_date: string;
  check_out_date: string;
  room_type: string;
  total_amount: number;
  payment_status: "pending" | "success" | "failed";
  payment_id?: string;
  payment_request_id?: string;
  payment_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InstamojoPaymentRequest {
  id: string;
  phone: string | null;
  email: string | null;
  buyer_name: string;
  amount: string;
  purpose: string;
  status: string;
  shorturl: string;
  longurl: string;
  redirect_url: string;
  webhook_url: string;
  created_at: string;
  modified_at: string;
}

export interface InstamojoWebhookPayload {
  payment_id: string;
  payment_request_id: string;
  status: string;
  amount: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  mac: string;
}
