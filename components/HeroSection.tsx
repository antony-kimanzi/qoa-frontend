import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-[80vh] flex items-center justify-start bg-[url(/landing-image.jpg)] bg-cover bg-center bg-no-repeat px-16">
      <div className="relative text-center px-4">
        <h1 className="font-cormorant text-5xl md:text-7xl font-bold text-white mb-4">
          Queen of Aroma
        </h1>
        <p className="text-lg md:text-2xl text-white mb-8">
          Discover your signature scent
        </p>
        <Link
          href="/shop"
          className="inline-block bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
