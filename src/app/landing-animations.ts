import gsap from "gsap";
import type ObserverType from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function isAlreadyInViewport(el: Element, margin = 48): boolean {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return r.top < vh - margin && r.bottom > margin;
}

function scrollRevealFor(el: Element) {
  if (isAlreadyInViewport(el)) {
    return {};
  }
  return {
    scrollTrigger: {
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      /** Animate when entering from below or when scrolling back up into view */
      toggleActions: "restart none restart none",
      fastScrollEnd: true,
    },
  };
}

export function setupLandingAnimations(scope: HTMLElement): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const disposers: Array<() => void> = [];
  let normalizeOn = false;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = gsap.context(() => {
    const nav = scope.querySelector<HTMLElement>("[data-a='nav']");
    if (nav && !reducedMotion) {
      gsap.from(nav, {
        y: -24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });
    }

    if (reducedMotion) {
      return;
    }

    const wordBlocks = scope.querySelectorAll<HTMLElement>("[data-reveal='words']");
    wordBlocks.forEach((block) => {
      const targets = block.querySelectorAll<HTMLElement>("[data-reveal-target='word']");
      if (!targets.length) return;
      gsap.from(targets, {
        yPercent: 108,
        duration: 1.05,
        ease: "power4.out",
        stagger: 0.045,
        immediateRender: false,
        ...scrollRevealFor(block),
      });
    });

    const lineBlocks = scope.querySelectorAll<HTMLElement>("[data-reveal='line']");
    lineBlocks.forEach((block) => {
      const inner = block.querySelector<HTMLElement>("[data-reveal-target='line']");
      if (!inner) return;
      gsap.from(inner, {
        yPercent: 100,
        duration: 1.15,
        ease: "power4.out",
        immediateRender: false,
        ...scrollRevealFor(block),
      });
    });

    gsap.utils.toArray<HTMLElement>(scope.querySelectorAll("[data-reveal='fade-up']")).forEach((el) => {
      gsap.from(el, {
        y: 32,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        immediateRender: false,
        ...scrollRevealFor(el),
      });
    });

    gsap.utils.toArray<HTMLElement>(scope.querySelectorAll("[data-reveal='fade-up-stagger']")).forEach((parent) => {
      const kids = parent.querySelectorAll<HTMLElement>("[data-reveal-stagger-child]");
      if (!kids.length) return;
      gsap.from(kids, {
        y: 24,
        opacity: 0,
        duration: 0.65,
        ease: "power2.out",
        stagger: 0.08,
        immediateRender: false,
        ...scrollRevealFor(parent),
      });
    });

    const swipeSection = scope.querySelector<HTMLElement>("[data-services-swipe]");
    const swipePanels = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll("[data-services-swipe-panel]"));
    let intentObserver: ObserverType | null = null;
    let swipeScrollTrigger: ScrollTrigger | null = null;

    if (swipeSection && swipePanels.length) {
      let allowScroll = true;
      /** Unlocks wheel between steps (was 1s — felt like “tons of scrolling” between panels). */
      let unlockDelay: gsap.core.Tween | null = null;
      let currentIndex = 0;
      let ignoreWheelUntil = 0;
      const isTouch = ScrollTrigger.isTouch === 1;

      if (isTouch) {
        ScrollTrigger.normalizeScroll(true);
        normalizeOn = true;
      }

      gsap.set(swipePanels, { yPercent: 0 });

      function resetSwipeStack() {
        currentIndex = 0;
        gsap.set(swipePanels, { yPercent: 0 });
      }

      function gotoPanel(index: number, isScrollingDown: boolean) {
        if ((index === swipePanels.length && isScrollingDown) || (index === -1 && !isScrollingDown)) {
          intentObserver?.disable();
          return;
        }
        allowScroll = false;
        unlockDelay?.kill();
        const target = isScrollingDown ? swipePanels[currentIndex] : swipePanels[index];
        gsap.to(target, {
          yPercent: isScrollingDown ? -100 : 0,
          duration: 0.75,
          ease: "power2.inOut",
          onComplete: () => {
            allowScroll = true;
          },
        });
        currentIndex = index;
      }

      intentObserver = ScrollTrigger.observe({
        type: "wheel,touch",
        onUp: () => {
          if (performance.now() < ignoreWheelUntil) return;
          if (allowScroll) gotoPanel(currentIndex - 1, false);
        },
        onDown: () => {
          if (performance.now() < ignoreWheelUntil) return;
          if (allowScroll) gotoPanel(currentIndex + 1, true);
        },
        tolerance: 10,
        preventDefault: true,
        ...(isTouch ? { scrollSpeed: 1 as const } : {}),
        onEnable(self: ObserverType) {
          allowScroll = false;
          ignoreWheelUntil = performance.now() + 500;
          unlockDelay?.kill();
          unlockDelay = gsap.delayedCall(0.5, () => {
            allowScroll = true;
            unlockDelay = null;
          });
          const savedScroll = self.scrollY();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (self as any)._restoreScroll = () => self.scrollY(savedScroll);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          document.addEventListener("scroll", (self as any)._restoreScroll, { passive: false });
        },
        onDisable(self: ObserverType) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fn = (self as any)._restoreScroll;
          if (typeof fn === "function") {
            document.removeEventListener("scroll", fn);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      intentObserver.disable();

      // Shorter pin = less scroll to leave services (steps are driven by wheel/touch, not this distance).
      const swipePinDistance = () => `+=${window.innerHeight * 1.45}`;

      swipeScrollTrigger = ScrollTrigger.create({
        trigger: swipeSection,
        pin: true,
        start: "top top",
        end: swipePinDistance,
        anticipatePin: 1,
        onEnter(self) {
          if (intentObserver?.isEnabled) return;
          self.scroll(self.start + 1);
          intentObserver?.enable();
        },
        onEnterBack(self) {
          if (intentObserver?.isEnabled) return;
          self.scroll(self.end - 1);
          intentObserver?.enable();
        },
        onLeave() {
          intentObserver?.disable();
          resetSwipeStack();
        },
        onLeaveBack() {
          intentObserver?.disable();
          resetSwipeStack();
        },
      });

      disposers.push(() => {
        unlockDelay?.kill();
        intentObserver?.kill();
        intentObserver = null;
        swipeScrollTrigger?.kill();
        swipeScrollTrigger = null;
        gsap.set(swipePanels, { clearProps: "transform" });
      });
    }
  }, scope);

  const refreshAll = () => {
    try {
      ScrollTrigger.refresh();
    } catch {
      /* ignore */
    }
  };

  const onResize = () => refreshAll();
  window.addEventListener("resize", onResize);
  disposers.push(() => window.removeEventListener("resize", onResize));

  let raf2 = 0;
  const raf1 = requestAnimationFrame(() => {
    refreshAll();
    raf2 = requestAnimationFrame(() => refreshAll());
  });
  const t1 = window.setTimeout(refreshAll, 120);
  const t2 = window.setTimeout(refreshAll, 400);

  return () => {
    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    clearTimeout(t1);
    clearTimeout(t2);
    disposers.forEach((d) => d());
    ctx.revert();
    if (normalizeOn) {
      ScrollTrigger.normalizeScroll(false);
    }
  };
}
