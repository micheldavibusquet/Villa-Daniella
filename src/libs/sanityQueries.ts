import { groq } from 'next-sanity';

export const getFeaturedRoomQuery = groq`*[_type == "hotelRoom" && isFeatured == true][0] {
    _id,
    description,
    discount,
    images,
    isFeatured,
    name,
    price,
    slug,
    coverImage
}`;

export const getRoomsQuery = groq`*[_type == "hotelRoom"] {
    _id,

    coverImage{
      "url": asset->url
    },

    description,
    dimension,

    isBooked,

    isFeatured,
    name,
    numberOfBeds,
    price,
    slug,
    type
}`;

export const getRoom = groq`*[_type == "hotelRoom" && slug.current == $slug][0] {
    _id,

    coverImage{
      "url": asset->url
    },

    description,
    dimension,
    discount,

    images[]{
      _key,
      "url": asset->url
    },

    isBooked,
    isFeatured,
    name,
    numberOfBeds,
    offeredAmenities,
    price,
    slug,
    specialNote,
    type
}`;

export const getUserBookingsQuery = groq`*[_type == 'booking' && user._ref == $userId] {
    _id,
    hotelRoom -> {
        _id,
        name,
        slug,
        price
    },
    checkinDate,
    checkoutDate,
    numberOfDays,
    adults,
    children,
    totalPrice,
    discount
}`;

export const getUserDataQuery = groq`*[_type == 'user' && _id == $userId][0] {
    _id,
    name,
    email,
    isAdmin,
    about,
    _createdAt,
    image,
}`;

export const getRoomReviewsQuery = groq`*[_type == "review" && hotelRoom._ref == $roomId] {
    _createdAt,
    _id,
    text,
    user -> {
        name
    },
    userRating
}`;

export const getUserReviewsQuery = groq`*[_type == "review" && user._ref == $userId] | order(_createdAt desc) {
    _id,
    _createdAt,
    text,
    userRating,
    hotelRoom -> { name, slug { current } }
}`;

export const checkRoomAvailabilityQuery = groq`*[
  _type == "booking" &&
  hotelRoom._ref == $roomId &&
  checkinDate < $checkoutDate &&
  checkoutDate > $checkinDate
]`;

export const getRoomBookingsQuery = groq`*[
  _type == "booking" &&
  hotelRoom._ref == $roomId
]{
  checkinDate,
  checkoutDate
}`;
