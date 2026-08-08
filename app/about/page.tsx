import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Queen of Aroma | About Us",
  description: "Learn about Queen of Aroma",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">
        About Queen of Aroma
      </h1>
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-lg text-gray-700">
          Queen of Aroma is a premium fragrance brand dedicated to bringing you
          the finest scents from around the world.
        </p>
        <p className="text-lg text-gray-700">
          Our curated collection features both classic and contemporary
          fragrances, carefully selected to suit every personality and occasion.
        </p>
        <p className="text-lg text-gray-700">
          We believe that a fragrance is more than just a scent - it&apos;s an
          expression of who you are.
        </p>
      </div>
    </div>
  );
}
