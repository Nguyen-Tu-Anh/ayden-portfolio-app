"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
// iOS shows/hides its URL bar while scrolling; don't recompute every trigger when it does.
ScrollTrigger.config({ ignoreMobileResize: true });

// GSAP exposes these media lifecycle events at runtime; its bundled declarations
// omit the event methods. Keep the added surface narrow and fully typed.
type MediaEvent = "matchMediaInit" | "matchMedia";
const mediaEvents = gsap as typeof gsap & {
  addEventListener(event: MediaEvent, callback: () => void): void;
  removeEventListener(event: MediaEvent, callback: () => void): void;
};

// Motion layer ported from the Okai theme (html.bslthemes.com/okai): smooth scroll,
// scroll progress bar, fade-up reveals and scrubbed image zoom.
// Opt in from markup with `reveal` and `scale-img` (+ data-scale-from / data-scale-to).

export function ScrollMotion({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    const progress = progressRef.current;
    if (!wrapper || !content || !progress) return;

    let active = true;
    let refreshFrame: number | undefined;
    let mediaScroll: number | undefined;
    const rememberScroll = () => {
      mediaScroll = window.scrollY;
    };
    const restoreScroll = () => {
      if (!active || mediaScroll === undefined) return;
      // Recreating completed, one-time reveals can clear ScrollTrigger's saved
      // scroll position. Preserve the browser's offset across media changes.
      window.scrollTo(0, Math.min(mediaScroll, ScrollTrigger.maxScroll(window)));
      ScrollTrigger.update();
      mediaScroll = undefined;
    };
    const refresh = () => {
      if (!active) return;
      if (refreshFrame !== undefined) cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = undefined;
        ScrollTrigger.refresh();
      });
    };

    const images = Array.from(content.querySelectorAll<HTMLImageElement>(".scale-img"));
    const media = gsap.matchMedia(content);
    mediaEvents.addEventListener("matchMediaInit", rememberScroll);
    mediaEvents.addEventListener("matchMedia", restoreScroll);

    // Rebuild and revert motion when rotating a device, attaching a pointer or
    // changing the system motion preference. Touch devices keep native scrolling.
    media.add(
      {
        all: "all",
        reduceMotion: "(prefers-reduced-motion: reduce)",
        desktop: "(min-width: 1100px) and (hover: hover) and (pointer: fine)",
        touch: "(any-pointer: coarse)",
        compact: "(max-width: 768px), (max-width: 1024px) and (orientation: portrait)",
      },
      (context) => {
        const conditions = context.conditions;
        if (!conditions || conditions.reduceMotion) return;

        const smoother = conditions.desktop && !conditions.touch
          ? ScrollSmoother.create({ wrapper, content, smooth: 0.7, effects: true, smoothTouch: false })
          : undefined;

        gsap.fromTo(progress, { scaleY: 0 }, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.2, invalidateOnRefresh: true },
        });

        content.querySelectorAll<HTMLElement>(".reveal").forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0, y: conditions.compact || conditions.touch ? 20 : 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 92%", once: true },
            },
          );
        });

        images.forEach((image) => {
          const from = Number(image.dataset.scaleFrom ?? 1);
          const requestedScale = Number(image.dataset.scaleTo ?? 1.04);
          const to = conditions.compact || conditions.touch ? Math.min(requestedScale, 1.04) : requestedScale;
          gsap.fromTo(image, { scale: from }, {
            scale: to,
            ease: "none",
            scrollTrigger: { trigger: image, scrub: 0.2, invalidateOnRefresh: true },
          });
        });

        return () => smoother?.kill();
      },
    );

    images.forEach((image) => image.addEventListener("load", refresh));
    void document.fonts.ready.then(refresh);
    refresh();

    return () => {
      active = false;
      if (refreshFrame !== undefined) cancelAnimationFrame(refreshFrame);
      images.forEach((image) => image.removeEventListener("load", refresh));
      mediaEvents.removeEventListener("matchMediaInit", rememberScroll);
      mediaEvents.removeEventListener("matchMedia", restoreScroll);
      media.revert();
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <div ref={progressRef} className="scroll-progress__bar" />
      </div>
      <div ref={wrapperRef} id="smooth-wrapper">
        <div ref={contentRef} id="smooth-content">{children}</div>
      </div>
    </>
  );
}
