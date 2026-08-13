import { useEffect, useRef, useState } from "react";
import { Check, Copy, MessageSquareText, Send, X } from "lucide-react";
import { CONTACT, SMS_PRESETS } from "../data/contact";

/**
 * Floating "text us" widget. Composes a message and hands it to the device SMS
 * app via an sms: link. Desktops usually have no handler for that scheme, so the
 * number is always copyable as a fallback.
 */
export default function SmsWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(SMS_PRESETS[0]);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Reset the confirmation so reopening the panel never shows a stale "Copied".
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.phone);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure context or denied permission) — the number
      // is rendered as text right next to the button, so it stays reachable.
      setCopied(false);
    }
  };

  // `?&body=` is the form both iOS and Android accept.
  const smsHref = `sms:${CONTACT.phone}?&body=${encodeURIComponent(message)}`;

  return (
    // The panel stays mounted so it can animate, which leaves this wrapper as
    // tall as the open panel. Without pointer-events-none it would swallow
    // clicks on the page behind it while closed.
    <div
      ref={ref}
      className="pointer-events-none fixed bottom-20 right-4 z-30 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6"
    >
      <div
        role="dialog"
        aria-label="Text us"
        aria-hidden={!open}
        inert={!open}
        className="w-[min(20rem,calc(100vw-2rem))] origin-bottom-right rounded-2xl border border-line bg-surface p-5 shadow-2xl transition-all duration-200 ease-out"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-base text-text">Text us</p>
            <p className="mt-0.5 text-xs text-muted">Typical reply in ~5 minutes</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-text"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SMS_PRESETS.map((preset, i) => (
            <button
              key={preset}
              type="button"
              onClick={() => setMessage(preset)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                message === preset
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-muted hover:border-line-strong hover:text-text"
              }`}
            >
              {["Availability", "Delivery", "Pricing"][i]}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs text-muted" htmlFor="sms-message">
          Message
        </label>
        <textarea
          id="sms-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full resize-none rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent"
        />

        <a
          href={smsHref}
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Send size={15} />
          Send SMS
        </a>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="spec text-xs text-muted">{CONTACT.phoneDisplay}</span>
          <button
            type="button"
            onClick={copyNumber}
            className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-text"
          >
            {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy number"}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close SMS widget" : "Text us"}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageSquareText size={22} />}
      </button>
    </div>
  );
}
