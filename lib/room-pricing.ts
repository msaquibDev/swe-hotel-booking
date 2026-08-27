export const roomTypes = {
  single: {
    name: "Single Occupancy",
    price: 9500,
    description: "Comfortable room for one person",
  },
  double: {
    name: "Double Occupancy",
    price: 10000,
    description: "Spacious room for two people",
  },
};

export const calculateBookingAmount = (
  checkinDate: string,
  checkoutDate: string,
  roomType: "single" | "double",
): number => {
  const checkin = new Date(checkinDate);
  const checkout = new Date(checkoutDate);
  const nights = Math.ceil(
    (checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24),
  );

  return nights > 0
    ? nights * roomTypes[roomType].price
    : roomTypes[roomType].price;
};
