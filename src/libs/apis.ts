import { CreateReviewDto, Review } from './../models/review';
import axios from 'axios';

import { CreateBookingDto, Room } from '@/models/room';
import { client, adminClient } from './sanity';
import * as queries from './sanityQueries';
import { Booking } from '@/models/booking';
import { UpdateReviewDto } from '@/models/review';

export async function getFeaturedRoom() {
  const result = await client.fetch<Room>(
    queries.getFeaturedRoomQuery,
    {},
    { cache: 'no-cache' }
  );

  return result;
}

export async function getRooms() {
  const result = await client.fetch<Room[]>(
    queries.getRoomsQuery,
    {},
    { cache: 'no-cache' }
  );
  return result;
}

export async function getRoom(slug: string) {
  const result = await client.fetch<Room>(
    queries.getRoom,
    { slug },
    { cache: 'no-cache' }
  );

  return result;
}

export const createBooking = async (data: any) => {
  return adminClient.create({
    _type: 'booking',

    adults: data.adults,
    checkinDate: data.checkinDate,
    checkoutDate: data.checkoutDate,
    children: data.children,
    numberOfDays: data.numberOfDays,
    discount: data.discount,
    totalPrice: data.totalPrice,

    user: {
      _type: "reference",
      _ref: data.user,
    },

    hotelRoom: {
      _type: "reference",
      _ref: data.hotelRoom,
    }
  });
};

export const updateHotelRoom = async (hotelRoomId: string) => {
  const mutation = {
    mutations: [
      {
        patch: {
          id: hotelRoomId,
          set: {
            isBooked: true,
          },
        },
      },
    ],
  };

  const { data } = await axios.post(
    `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`,
    mutation,
    { headers: { Authorization: `Bearer ${process.env.SANITY_API_TOKEN}` } }
  );

  return data;
};

export async function getUserBookings(userId: string) {
  const result = await client.fetch<Booking[]>(
    queries.getUserBookingsQuery,
    {
      userId,
    },
    { cache: 'no-cache' }
  );

  return result;
}

export async function getUserReviews(userId: string) {
  const result = await client.fetch(
    queries.getUserReviewsQuery,
    { userId },
    { cache: 'no-cache' }
  );
  return result as {
    _id: string;
    _createdAt: string;
    text: string;
    userRating: number;
    hotelRoom: { name: string; slug: { current: string } };
  }[];
}

export async function getUserData(userId: string) {
  const result = await client.fetch(
    queries.getUserDataQuery,
    { userId },
    { cache: 'no-cache' }
  );

  return result;
}

export async function checkReviewExists(
  userId: string,
  hotelRoomId: string
): Promise<null | { _id: string }> {
  const query = `*[_type == 'review' && user._ref == $userId && hotelRoom._ref == $hotelRoomId][0] {
    _id
  }`;

  const params = {
    userId,
    hotelRoomId,
  };

  const result = await client.fetch(query, params);

  return result ? result : null;
}

export const updateReview = async ({
  reviewId,
  reviewText,
  userRating,
}: UpdateReviewDto) => {
  const result = await adminClient
    .patch(reviewId)
    .set({ text: reviewText, userRating })
    .commit();

  return result;
};

export const createReview = async ({
  hotelRoomId,
  reviewText,
  userId,
  userRating,
}: CreateReviewDto) => {
  const result = await adminClient.create({
    _type: 'review',
    user: {
      _type: 'reference',
      _ref: userId,
    },
    hotelRoom: {
      _type: 'reference',
      _ref: hotelRoomId,
    },
    userRating,
    text: reviewText,
  });

  return result;
};

export async function getRoomReviews(roomId: string) {
  const result = await client.fetch<Review[]>(
    queries.getRoomReviewsQuery,
    {
      roomId,
    },
    { cache: 'no-cache' }
  );

  return result;
}
