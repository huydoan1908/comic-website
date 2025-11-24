'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Comic } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import '@/assets/css/ComicCarousel.css';

interface ComicCarouselProps {
  comics: Comic[];
}

export function ComicCarousel({ comics }: ComicCarouselProps) {
  if (!comics || comics.length === 0) {
    return (
      <section className="relative h-96 bg-muted/20 flex items-center justify-center">
        <div className="text-center text-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to ComicHub</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing comics and immerse yourself in incredible stories. 
            Check back soon for amazing content!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="comic-carousel relative w-full aspect-2/3 lg:aspect-5/2 overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        navigation={true}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="h-full w-full"
      >
        {comics.map((comic) => (
          <SwiperSlide key={comic.id}>
            <div className="relative h-full w-full">
              {/* Banner/Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={comic.bannerImageUrl || comic.coverImageUrl}
                  alt={`${comic.title} banner`}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Text Content */}
                    <div className="text-foreground space-y-4 md:space-y-6 order-2 lg:order-1">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight line-clamp-2 tracking-tight">
                        {comic.title}
                      </h1>
                      
                      <div className="space-y-2 text-base md:text-lg lg:text-xl text-muted-foreground">
                        <p><span className="font-semibold text-foreground">By:</span> {comic.author}</p>
                        <p><span className="font-semibold text-foreground">Genre:</span> {comic.genre}</p>
                      </div>
                      
                      <p className="text-sm md:text-base lg:text-lg leading-relaxed text-muted-foreground max-w-2xl line-clamp-3 md:line-clamp-4" >
                        {comic.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
                        <Link
                          href={`/comics/${comic.id}`}
                          className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full transition-all duration-200 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 text-base"
                        >
                          Read Now
                        </Link>
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="hidden lg:flex justify-center lg:justify-end order-1 lg:order-2">
                      <div className="relative w-64 lg:w-80 aspect-3/4 shadow-2xl rounded-xl overflow-hidden border-4 border-background/50 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Image
                          src={comic.coverImageUrl}
                          alt={`${comic.title} cover`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1280px) 288px, 320px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
