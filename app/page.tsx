import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "Citizen Services",
    description:
      "Access verification requests, complaint status, and other citizen-facing police services through your account.",
  },
  {
    title: "Secure Account",
    description:
      "Your portal account is protected with strong password requirements and encrypted sessions.",
  },
  {
    title: "Official Channel",
    description:
      "This portal is the official online service desk of the Hyderabad City Police.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-4">
          <Image
            src="/logo.png"
            alt="Hyderabad City Police emblem"
            width={56}
            height={56}
            priority
            className="h-14 w-14"
          />
          <div>
            <p className="text-lg font-semibold tracking-wide">
              Hyderabad City Police
            </p>
            <p className="text-sm text-blue-200">Citizen Services Portal</p>
          </div>
          <nav className="ml-auto flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-soft"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="bg-navy-deep text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16 sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Official Portal
            </p>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
              Serving Hyderabad with duty, honour, and compassion.
            </h1>
            <p className="max-w-xl text-base text-blue-100 sm:text-lg">
              Sign in to the Hyderabad City Police portal to use secure online
              citizen services and manage your requests.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-md bg-gold px-6 py-3 text-sm font-semibold text-navy-deep hover:bg-gold-soft"
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="grid gap-6 sm:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-navy">
                  {service.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-navy px-6 py-6 text-center text-xs text-blue-200">
        Hyderabad City Police — Citizen Services Portal
      </footer>
    </div>
  );
}
