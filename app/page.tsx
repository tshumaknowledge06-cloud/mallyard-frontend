import HeroSection from "@/components/home/HeroSection";
import ServiceShowcase from "@/components/home/ServiceShowcase";
import ProductShowcase from "@/components/home/ProductShowcase";
import DeliveryStory from "@/components/home/DeliveryStory";
import DeliveryPartnerSection from "@/components/home/DeliveryPartnerSection";
import MerchantSection from "@/components/home/MerchantSection";
import VisionSection from "@/components/home/VisionSection";
import IdentitySection from "@/components/home/IdentitySection";

export default function HomePage() {
  return (
    <>
      {/* 01 — The Mallyard World */}
      <HeroSection />

      {/* 02 — People who get things done (Services) */}
      <ServiceShowcase />

      {/* 03 — Things worth finding (Products) */}
      <ProductShowcase />

      {/* 04 — From order to doorstep */}
      <DeliveryStory />

      {/* 05 — Turn your vehicle into an opportunity */}
      <DeliveryPartnerSection />

      {/* 06 — Your business belongs in the conversation */}
      <MerchantSection />

      {/* 07 — More than a marketplace */}
      <VisionSection />

      {/* 08 — The Mallyard identity */}
      <IdentitySection />
    </>
  );
}