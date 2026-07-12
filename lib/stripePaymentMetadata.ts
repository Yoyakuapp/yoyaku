export type BookingPaymentIntentMetadataInput = {
  storeId: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  people: number;
};

export function buildBookingPaymentIntentMetadata(
  input: BookingPaymentIntentMetadataInput
) {
  return {
    storeId: input.storeId,
    bookingDate: input.bookingDate,
    bookingTime: input.bookingTime,
    duration: String(input.duration),
    people: String(input.people),
  };
}

export function getPaymentIntentStoreId(metadata: {
  storeId?: string | null;
}) {
  return metadata.storeId?.trim() || null;
}
