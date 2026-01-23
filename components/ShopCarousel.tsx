"use client";

import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

const ShopCarousel = () => {
  const autoplay = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  );

  const slides = [
    {
      image: "/assets/banner-1.png",
      alt: "Featured dishes from EddySylva Kitchen",
    },
    {
      image: "/assets/banner-2.png",
      alt: "Special menu items",
    },
  ];

  return (
    <div className="relative bg-gray-900">
      <Carousel
        plugins={[autoplay.current]}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem
              key={index}
              className="relative h-56 sm:h-80 md:h-96 lg:h-125"
            >
              <div className="relative w-full h-full">
                <Image
                  alt={slide.alt}
                  src={slide.image}
                  fill
                  priority={index === 0}
                  quality={90}
                  className="object-cover object-center"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows - Hidden on mobile */}
        <div className="hidden sm:block">
          <CarouselPrevious className="left-4 bg-white/90 hover:bg-white border-none shadow-lg" />
          <CarouselNext className="right-4 bg-white/90 hover:bg-white border-none shadow-lg" />
        </div>
      </Carousel>

      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-white/60 transition-all duration-300"
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopCarousel;
