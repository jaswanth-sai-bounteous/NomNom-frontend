import logo from "@/assets/NomNom.png";
import SectionHeading from "@/components/SectionHeading";

type AboutProps = {
  variant?: "section" | "page";
};

const About = ({ variant = "page" }: AboutProps) => {
  const isPage = variant === "page";

  return (
    <section className={isPage ? "space-y-16 py-10 sm:py-14" : "space-y-12 py-6"}>
      <SectionHeading
        eyebrow="Our Story"
        title="A restaurant built around comfort, hospitality, and honest flavor"
        description="NomNom blends modern presentation with familiar favorites. Every dish is prepared with fresh ingredients, balanced seasoning, and the kind of care that makes people want to come back."
        align={isPage ? "left" : "center"}
      />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] bg-gradient-to-br from-amber-100 via-orange-50 to-white p-8 shadow-[0_24px_50px_-35px_rgba(194,65,12,0.45)]">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="NomNom"
              className="size-16 rounded-2xl border border-white bg-white p-2 shadow-sm"
            />
            <div>
              <p className="text-xl font-semibold text-stone-900">NomNom Kitchen</p>
              <p className="text-sm text-stone-600">
                A warm place for family dinners, quick lunches, and weekend treats
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-5">
              <p className="text-3xl font-semibold text-stone-900">25+</p>
              <p className="mt-2 text-sm text-stone-600">Popular dishes made fresh every day</p>
            </div>
            <div className="rounded-3xl bg-white p-5">
              <p className="text-3xl font-semibold text-stone-900">10k+</p>
              <p className="mt-2 text-sm text-stone-600">Happy guests served with care</p>
            </div>
            <div className="rounded-3xl bg-white p-5">
              <p className="text-3xl font-semibold text-stone-900">4.9</p>
              <p className="mt-2 text-sm text-stone-600">Average rating from repeat customers</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-[32px] border border-stone-200 bg-white p-8 shadow-[0_18px_40px_-30px_rgba(28,25,23,0.35)]">
          <h3 className="text-2xl font-semibold text-stone-900">Why guests choose us</h3>
          <p className="leading-7 text-stone-600">
            We keep things simple: ingredients that taste fresh, a space that feels
            inviting, and a menu designed to be comforting without feeling ordinary.
          </p>
          <ul className="space-y-4 text-sm leading-7 text-stone-600">
            <li className="rounded-2xl bg-stone-50 px-4 py-3">
              Seasonal ingredients and carefully balanced recipes
            </li>
            <li className="rounded-2xl bg-stone-50 px-4 py-3">
              Quick service for everyday meals and polished presentation for special outings
            </li>
            <li className="rounded-2xl bg-stone-50 px-4 py-3">
              A clean, cozy restaurant feel carried through the whole website experience
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;
