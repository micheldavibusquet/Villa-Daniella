'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

import { getRoom } from '@/libs/apis';
import HotelPhotoGallery from '@/components/HotelPhotoGallery/HotelPhotoGallery';
import BookRoomCta from '@/components/BookRoomCta/BookRoomCta';
import toast from 'react-hot-toast';
import { getStripe } from '@/libs/stripe';
import RoomReview from '@/components/RoomReview/RoomReview';
import { Room } from '@/models/room';

const RoomDetails = (props: { params: { slug: string } }) => {
  const {
    params: { slug },
  } = props;

  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState(false);

  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [noOfChildren, setNoOfChildren] = useState(0);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  // ✅ FETCH SEM SWR (SEM LOADING)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRoom(slug);
        setRoom(data);
      } catch {
        setError(true);
      }
    };

    fetchData();
  }, [slug]);

  const calcMinCheckoutDate = () => {
    if (checkinDate) {
      const minDate = new Date(checkinDate);
      minDate.setDate(minDate.getDate() + 2);
      return minDate;
    }
    return null;
  };

  const calcNumDays = () => {
    if (!checkinDate || !checkoutDate) return 0;
    const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
    return Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
  };

  const handleBookNowClick = async () => {
    if (!room) return;

    if (!checkinDate || !checkoutDate)
      return toast.error('Por favor, informe as datas');

    if (checkinDate > checkoutDate)
      return toast.error('Data de checkout inválida');

    const numberOfDays = calcNumDays();

    if (numberOfDays < 2)
      return toast.error('Mínimo de 2 diárias');

    try {
      const stripe = await getStripe();

      const { data: stripeSession } = await axios.post('/api/stripe', {
        checkinDate,
        checkoutDate,
        adults,
        children: noOfChildren,
        numberOfDays,
        hotelRoomSlug: room.slug.current,
      });

      if (stripe) {
        const result = await stripe.redirectToCheckout({
          sessionId: stripeSession.id,
        });

        if (result.error) {
          toast.error('Pagamento falhou');
        }
      }
    } catch {
      toast.error('Erro ao processar reserva');
    }
  };

  useEffect(() => {
    const checkAvailability = async () => {
      if (!room?._id || !checkinDate || !checkoutDate) {
        setIsBooked(false);
        return;
      }

      try {
        const res = await fetch('/api/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: room._id,
            checkinDate,
            checkoutDate,
          }),
        });

        const data = await res.json();
        setIsBooked(!data.available);
      } catch {
        setIsBooked(false);
      }
    };

    checkAvailability();
  }, [checkinDate, checkoutDate, room]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!room?._id) return;

      try {
        const res = await fetch(`/api/room-bookings?roomId=${room._id}`);
        const data = await res.json();

        const dates: Date[] = [];

        data.bookings.forEach((booking: any) => {
          const start = new Date(booking.checkinDate);
          const end = new Date(booking.checkoutDate);

          for (
            let date = new Date(start);
            date <= end;
            date.setDate(date.getDate() + 1)
          ) {
            dates.push(new Date(date));
          }
        });

        setBookedDates(dates);
      } catch {}
    };

    fetchBookedDates();
  }, [room]);

  if (error) return <div className="p-10">Erro ao carregar</div>;

  return (
    <div>

      {/* GALERIA */}
      {room && <HotelPhotoGallery photos={room.images || []} />}

      {/* CONTEÚDO */}
      {room && (
        <div className="container mx-auto px-4 mt-20 mb-20">
          <div className="grid md:grid-cols-12 gap-10">

            <div className="md:col-span-8">

              <h1 className="text-3xl font-bold mb-6">
                {room.name}
              </h1>

              <div className="flex flex-wrap gap-4 mb-10">
                {(room.offeredAmenities || []).map((amenity) => (
                  <div
                    key={amenity._key}
                    className="w-32 h-28 bg-gray-100 rounded-lg flex flex-col items-center justify-center"
                  >
                    <i className={`fa-solid ${amenity.icon}`} />
                    <p className="text-xs mt-2">{amenity.amenity}</p>
                  </div>
                ))}
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-3">Descrição</h2>
                <p className="text-gray-700 leading-relaxed">
                  {room.description}
                </p>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="font-semibold mb-4">Avaliações</h3>
                <RoomReview roomId={room._id} />
              </div>
            </div>

            <div className="md:col-span-4">
              <div className="sticky top-20 bg-white shadow rounded-xl p-4">

                <BookRoomCta
                  discount={room.discount}
                  price={room.price}
                  specialNote={room.specialNote}
                  checkinDate={checkinDate}
                  setCheckinDate={setCheckinDate}
                  checkoutDate={checkoutDate}
                  setCheckoutDate={setCheckoutDate}
                  calcMinCheckoutDate={calcMinCheckoutDate}
                  adults={adults}
                  noOfChildren={noOfChildren}
                  setAdults={setAdults}
                  setNoOfChildren={setNoOfChildren}
                  isBooked={isBooked}
                  bookedDates={bookedDates}
                  handleBookNowClick={handleBookNowClick}
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;