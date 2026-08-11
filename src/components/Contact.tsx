import { useState } from "react";
import { Check, Mail, Phone } from "lucide-react";
import { useInView } from "../hooks/useInView";

const PERKS = [
  "Response in under 1 hour",
  "No upfront payment",
  "Transparent pricing, no fine print",
];

// Pexels — verified reachable
const BG_IMAGE =
  "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const { ref: leftRef, inView: leftVisible } = useInView({ threshold: 0.2 });
  const { ref: formRef, inView: formVisible } = useInView({ threshold: 0.15 });

  return (
    <section id="contact" className="relative bg-bg py-24 lg:py-32 overflow-hidden">
      {/* Subtle background image — bottom right */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={BG_IMAGE}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center opacity-[0.04]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_100%,rgba(198,161,91,0.06),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left — copy */}
          <div
            ref={leftRef}
            className="transition-all duration-700 ease-out"
            style={{
              opacity: leftVisible ? 1 : 0,
              transform: leftVisible ? "translateX(0)" : "translateX(-24px)",
            }}
          >
            <p className="eyebrow mb-3">Contact</p>
            <h2 className="font-display max-w-md text-3xl font-medium sm:text-4xl">
              Your next car is waiting.
            </h2>
            <p className="mt-4 max-w-sm text-sm text-muted">
              Tell us what you need — we'll get back to you shortly.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {PERKS.map((p, i) => (
                <li
                  key={p}
                  className="flex items-center gap-2 text-sm text-text transition-all duration-500 ease-out"
                  style={{
                    opacity: leftVisible ? 1 : 0,
                    transform: leftVisible ? "translateX(0)" : "translateX(-16px)",
                    transitionDelay: `${200 + i * 80}ms`,
                  }}
                >
                  <Check size={16} className="text-accent shrink-0" />
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8">
              <a
                href="tel:+000000000"
                className="flex items-center gap-3 text-sm text-muted transition-colors hover:text-text"
              >
                <Phone size={16} />
                +00 000 000 000
              </a>
              <a
                href="mailto:info@yourcompany.com"
                className="flex items-center gap-3 text-sm text-muted transition-colors hover:text-text"
              >
                <Mail size={16} />
                info@yourcompany.com
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div
            ref={formRef}
            className="transition-all duration-700 ease-out"
            style={{
              opacity: formVisible ? 1 : 0,
              transform: formVisible ? "translateX(0)" : "translateX(24px)",
              transitionDelay: "100ms",
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="rounded-2xl border border-line bg-surface p-8"
            >
              {sent ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
                    <Check size={24} className="text-accent" />
                  </div>
                  <p className="font-display text-lg">Request sent</p>
                  <p className="mt-1 text-sm text-muted">We'll be in touch shortly.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Name" name="name" required />
                    <Field label="Phone" name="phone" type="tel" />
                  </div>
                  <Field label="Email" name="email" type="email" required />
                  <div>
                    <label className="mb-1.5 block text-xs text-muted">
                      Vehicle preference
                    </label>
                    <select
                      name="preference"
                      className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
                    >
                      <option>Sedan</option>
                      <option>SUV</option>
                      <option>Sports car</option>
                      <option>No preference</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-muted">Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      className="w-full resize-none rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-2 rounded-full bg-accent py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Send Request
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-muted">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}
