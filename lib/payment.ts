// lib/payment.ts
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";

interface PaymentInitiateParams {
  bookingId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  redirectUrl: string;
}

interface InstamojoPaymentResponse {
  success: boolean;
  payment_request: {
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
  };
}

/**
 * Generate hash for Instamojo payment verification
 * Format: sha1(private_salt + data_string)
 */
export function generateInstamojoHash(data: Record<string, string>): string {
  // Sort keys alphabetically and create data string
  const sortedKeys = Object.keys(data).sort();
  const dataString = sortedKeys.map((key) => data[key]).join("|");

  // Generate SHA1 hash with salt
  const hash = crypto
    .createHash("sha1")
    .update(process.env.INSTAMOJO_PRIVATE_SALT + "|" + dataString)
    .digest("hex");

  return hash;
}

/**
 * Verify webhook hash from Instamojo
 */
export function verifyInstamojoWebhookHash(
  data: Record<string, string>,
  receivedHash: string,
): boolean {
  const calculatedHash = generateInstamojoHash(data);
  return calculatedHash === receivedHash;
}

export async function initiatePayment({
  bookingId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  description,
  redirectUrl,
}: PaymentInitiateParams): Promise<{ paymentUrl: string; paymentId: string }> {
  const INSTAMOJO_API_URL =
    process.env.INSTAMOJO_API_URL || "https://www.instamojo.com/api/1.1";
  const INSTAMOJO_API_KEY = process.env.INSTAMOJO_PRIVATE_API_KEY!;
  const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_PRIVATE_AUTH_TOKEN!;

  const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/payment/callback`;

  const formData = new URLSearchParams();
  formData.append("purpose", description);
  formData.append("amount", amount.toString());
  formData.append("buyer_name", customerName);
  formData.append("email", customerEmail);
  formData.append("phone", customerPhone);
  formData.append("redirect_url", redirectUrl);
  formData.append("webhook_url", webhookUrl);
  formData.append("send_email", "false");
  formData.append("send_sms", "false");
  formData.append("allow_repeated_payments", "false");

  console.log("Initiating payment with Instamojo:", {
    purpose: description,
    amount: amount.toString(),
    buyer_name: customerName,
    email: customerEmail,
    phone: customerPhone,
    redirect_url: redirectUrl,
    webhook_url: webhookUrl,
  });

  const response = await fetch(`${INSTAMOJO_API_URL}/payment-requests/`, {
    method: "POST",
    headers: {
      "X-Api-Key": INSTAMOJO_API_KEY,
      "X-Auth-Token": INSTAMOJO_AUTH_TOKEN,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const responseText = await response.text();
  console.log("Instamojo response:", responseText);

  if (!response.ok) {
    console.error("Payment initiation failed:", responseText);
    throw new Error(`Payment initiation failed: ${responseText}`);
  }

  const data: InstamojoPaymentResponse = JSON.parse(responseText);

  if (!data.success) {
    throw new Error("Payment request was not successful");
  }

  // Update booking with payment URL and ID
  const db = await getDb();
  await db.collection("bookings").updateOne(
    { booking_id: bookingId },
    {
      $set: {
        payment_id: data.payment_request.id,
        payment_url: data.payment_request.longurl,
        updated_at: new Date(),
      },
    },
  );

  return {
    paymentUrl: data.payment_request.longurl,
    paymentId: data.payment_request.id,
  };
}

/**
 * Verify payment status with Instamojo API
 */
export async function verifyPaymentStatus(
  paymentRequestId: string,
  paymentId: string,
): Promise<{
  success: boolean;
  status: string;
  amount: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}> {
  const INSTAMOJO_API_URL =
    process.env.INSTAMOJO_API_URL || "https://www.instamojo.com/api/1.1";
  const INSTAMOJO_API_KEY = process.env.INSTAMOJO_PRIVATE_API_KEY!;
  const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_PRIVATE_AUTH_TOKEN!;

  try {
    // First, get the payment request details
    const paymentRequestResponse = await fetch(
      `${INSTAMOJO_API_URL}/payment-requests/${paymentRequestId}/`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": INSTAMOJO_API_KEY,
          "X-Auth-Token": INSTAMOJO_AUTH_TOKEN,
        },
      },
    );

    if (!paymentRequestResponse.ok) {
      throw new Error("Failed to fetch payment request");
    }

    const paymentRequestData = await paymentRequestResponse.json();

    // Then, get the specific payment details
    const paymentResponse = await fetch(
      `${INSTAMOJO_API_URL}/payments/${paymentId}/`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": INSTAMOJO_API_KEY,
          "X-Auth-Token": INSTAMOJO_AUTH_TOKEN,
        },
      },
    );

    if (!paymentResponse.ok) {
      throw new Error("Failed to fetch payment details");
    }

    const paymentData = await paymentResponse.json();

    return {
      success: paymentData.success,
      status: paymentData.payment?.status || "unknown",
      amount: paymentData.payment?.amount || "0",
      buyerName: paymentData.payment?.buyer_name || "",
      buyerEmail: paymentData.payment?.buyer_email || "",
      buyerPhone: paymentData.payment?.buyer_phone || "",
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error;
  }
}
