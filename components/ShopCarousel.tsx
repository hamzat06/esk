"use client";

import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

const ShopCarousel = () => {
  const autoplay = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  );

  return (
    <Carousel plugins={[autoplay.current]} className="w-full">
      <CarouselContent>
        <CarouselItem className="h-48 sm:h-96 md:h-150">
          <Image
            alt=""
            src="/assets/banner-1.png"
            width={1200}
            height={500}
            className="w-screen h-full object-center object-cover"
          />
        </CarouselItem>
        <CarouselItem className="h-48 sm:h-96 md:h-150">
          <Image
            alt=""
            src="/assets/banner-2.png"
            width={1200}
            height={500}
            className="w-full h-full object-center object-cover"
          />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default ShopCarousel;
