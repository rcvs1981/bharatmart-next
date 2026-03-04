"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroCarousel({ banners }) {
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      loop={banners.length > 1}
      navigation={banners.length > 1}
      pagination={{
        clickable: true,
      }}
      className="rounded-md overflow-hidden"
    >
      {banners.map((banner, i) => {
        return (
          <SwiperSlide key={i}>
            <Link href={banner.link} className="block">
              <Image
                width={712}
                height={384}
                src={banner.imageUrl}
                className="w-full"
                alt={banner.title}
              />
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
