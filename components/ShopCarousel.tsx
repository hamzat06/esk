"use client";

import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { getBanners } from "@/lib/queries/settings";
import { ImageOff } from "lucide-react";

type BannerImage = {
  id: string;
  image: string;
  alt: string;
  order: number;
};

type ShopCarouselProps = {
  initialBanners?: BannerImage[];
};

const ShopCarousel = ({ initialBanners }: ShopCarouselProps) => {
  const [banners, setBanners] = useState<BannerImage[]>(initialBanners || []);
  const [isLoading, setIsLoading] = useState(!initialBanners);

  const autoplay = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  );

  useEffect(() => {
    if (!initialBanners) {
      const fetchBanners = async () => {
        try {
          const fetchedBanners = await getBanners();
          if (fetchedBanners.length > 0) {
            setBanners(fetchedBanners.sort((a, b) => a.order - b.order));
          }
        } catch (error) {
          console.error("Error fetching banners:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBanners();
    }
  }, [initialBanners]);

  if (isLoading) {
    return (
      <div className="relative bg-gray-100 h-56 sm:h-80 md:h-96 lg:h-125 flex items-center justify-center">
        <div className="text-gray-400">
          <div className="size-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm">Loading banners...</p>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative bg-linear-to-br from-gray-100 via-gray-50 to-gray-100 h-56 sm:h-80 md:h-96 lg:h-125 flex items-center justify-center border-b-2 border-gray-200">
        <div className="text-center px-4">
          <div className="size-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <ImageOff className="size-10 text-gray-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2 font-playfair">
            No Banners Available
          </h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
            Banner images will be displayed here once uploaded by the
            administrator
          </p>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 size-32 bg-gray-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 size-40 bg-gray-200/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900">
      <Carousel
        plugins={[autoplay.current]}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
          watchDrag: false,
        }}
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem
              key={banner.id}
              className="relative h-56 sm:h-80 md:h-96 lg:h-125"
            >
              <div className="relative w-full h-full">
                {banner.image.startsWith("http") ? (
                  <Image
                    alt={banner.alt}
                    src={banner.image}
                    fill
                    priority={index === 0}
                    unoptimized
                    className="object-cover object-center"
                  />
                ) : (
                  <CldImage
                    alt={banner.alt}
                    src={banner.image}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    className="object-cover object-center"
                    crop={{ type: "fill", source: true }}
                  />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default ShopCarousel;
