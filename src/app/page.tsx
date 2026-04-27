"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useRef } from "react";
import { setupLandingAnimations } from "./landing-animations";
import styles from "./home.module.css";

/* ── Brand colours ── */
const C = {
  hero:    "#4D4D4D",
  service: "#C9C6FF",
  contact: "#F5F4EF",
  footer:  "#1A1A18",
  white:   "#FFFFFF",
  black:   "#0D0D0D",
};

const NAV_H = 64;

function RevealWords({
  text,
  as: Tag = "span",
  className,
  style,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "span";
  className?: string;
  style?: CSSProperties;
}) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return (
    <Tag className={className} style={style} data-reveal="words">
      {words.map((w, i) => (
        <span key={i} className={styles.revealWordMask}>
          <span className={styles.revealWordInner} data-reveal-target="word">
            {w}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────
   NAV
───────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav
      data-a="nav"
      className={styles.nav}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: C.hero,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-nav-logo)", color: C.white, letterSpacing: "-0.02em" }}>
        Chuko
      </span>

      <div className={styles.navLinks}>
        {["Work", "Services", "Contact"].map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`}
            style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--fs-nav-link)", fontWeight: 500, textDecoration: "none" }}>
            {l}
          </a>
        ))}
      </div>

      <Link href="#contact"
        className={styles.navCta}
        style={{ background: C.white, color: C.black, fontSize: "var(--fs-nav-cta)", fontWeight: 600, padding: "0.5rem 1.25rem", borderRadius: "999px", textDecoration: "none" }}>
        Reach out
      </Link>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────── */
function Hero() {
  const tabs = ["Purpose-first", "Thoughtful design", "Built to last", "Real results"];
  return (
    <section id="work" className={styles.hero} style={{ background: C.hero, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", paddingTop: `${NAV_H + 80}px`, paddingBottom: "80px" }}>
      <RevealWords
        className={styles.heroTitle}
        as="h1"
        text="We build software that actually works for people."
        style={{ fontFamily: "var(--font-heading)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", color: C.white }}
      />

      <p
        className={`${styles.revealLineHost} ${styles.heroSub}`}
        data-reveal="line"
        style={{ color: "rgba(255,255,255,0.55)", fontSize: "var(--fs-hero-sub)", lineHeight: 1.6 }}>
        <span data-reveal-target="line" style={{ display: "inline-block" }}>
          Chuko is a small team of developers and designers who care about craft.
        </span>
      </p>

      <div data-reveal="fade-up-stagger" className={styles.heroCtas} style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginBottom: "4rem" }}>
        <a data-reveal-stagger-child href="#services" style={{ background: C.white, color: C.black, fontWeight: 600, fontSize: "var(--fs-hero-cta)", padding: "0.75rem 1.75rem", borderRadius: "999px", textDecoration: "none" }}>Services</a>
        <a data-reveal-stagger-child href="#contact"  style={{ background: "transparent", color: C.white, fontWeight: 600, fontSize: "var(--fs-hero-cta)", padding: "0.75rem 1.75rem", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", textDecoration: "none" }}>Contact</a>
      </div>

      <div data-reveal="fade-up-stagger" className={`${styles.heroTabs} ${styles.heroTabsWrap}`} style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        {tabs.map((t, i) => (
          <div key={t} data-reveal-stagger-child className={styles.heroTab}
            style={{ flex: 1, padding: "1rem 0.5rem", borderRight: i < tabs.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none", color: "rgba(255,255,255,0.6)", fontSize: "var(--fs-hero-tab)", letterSpacing: "0.03em", textAlign: "center" }}>
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   SERVICES (full-viewport swipe stack — wheel / touch steps)
───────────────────────────────────────────────────────── */
const services = [
  { n: "01", tag: "Services",     title: "What we do",                  body: "We shape ideas into products that matter. Each project is built with intention and care." },
  { n: "02", tag: "Capabilities", title: "Web and product development",  body: "We develop web applications and digital products that solve real problems. From concept to launch, we handle the full stack with care." },
  { n: "03", tag: "Intelligence", title: "AI-powered tools",             body: "We build AI systems that augment human work, not replace it. Tools that learn your patterns and make your team smarter." },
  { n: "04", tag: "Systems",      title: "Design systems and ops",       body: "We create design systems that grow with you. Scalable, maintainable, and built for teams that move fast without losing coherence." },
];

const linkStyle: CSSProperties = { fontSize: "var(--fs-link-sm)", fontWeight: 600, color: C.black, textDecoration: "none", borderBottom: "1px solid rgba(0,0,0,0.3)", paddingBottom: "1px" };

function Services() {
  return (
    <section id="services" className={styles.services} style={{ background: C.service }}>
      <div data-services-swipe className={styles.servicesSwipe}>
        {services.map((s, i) => (
          <div
            key={s.n}
            data-services-swipe-panel
            className={styles.servicesSwipePanel}
            style={{ zIndex: services.length - i }}
          >
            <div className={styles.servicesSwipeInner}>
              <div className={styles.serviceRow}>
                <div
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "var(--fs-service-num)", lineHeight: 1, letterSpacing: "-0.04em", color: C.black }}>
                  {s.n}
                </div>

                <div>
                  <p style={{ fontSize: "var(--fs-service-tag)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)", marginBottom: "0.75rem" }}>— {s.tag}</p>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "var(--fs-service-title)", lineHeight: 1.1, letterSpacing: "-0.025em", color: C.black, margin: "0 0 1rem" }}>
                    {s.title}
                  </h2>
                  <p style={{ color: "rgba(0,0,0,0.6)", fontSize: "var(--fs-service-body)", lineHeight: 1.65, maxWidth: "520px", marginBottom: "1.25rem" }}>{s.body}</p>
                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    <a href="#contact" style={linkStyle}>Explore</a>
                    <a href="#contact" style={linkStyle}>Learn →</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   CONTACT CTA
───────────────────────────────────────────────────────── */
function ContactCTA() {
  return (
    <section id="contact" data-a="contact" className={styles.contact} style={{ background: C.contact }}>
      <div className={styles.contactGrid} style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", alignItems: "center" }}>
        <RevealWords
          as="h2"
          text="Let's build something together."
          style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "var(--fs-contact-title)", lineHeight: 1.1, letterSpacing: "-0.03em", color: C.black }}
        />

        <div>
          <p className={styles.revealLineHost} data-reveal="line" style={{ color: "rgba(0,0,0,0.55)", fontSize: "var(--fs-contact-body)", lineHeight: 1.65, marginBottom: "2rem", maxWidth: "380px" }}>
            <span data-reveal-target="line" style={{ display: "inline-block" }}>
              We&apos;d like to hear about your project. Reach out and let&apos;s talk.
            </span>
          </p>
          <div className={styles.contactActions} data-reveal="fade-up-stagger" style={{ display: "flex", gap: "0.75rem" }}>
            <a
              data-reveal-stagger-child
              href="mailto:hola@medialunas.es"
              style={{ background: C.black, color: C.white, fontWeight: 600, fontSize: "var(--fs-contact-btn)", padding: "0.75rem 1.5rem", borderRadius: "999px", textDecoration: "none", cursor: "pointer", display: "inline-block" }}
            >
              Email
            </a>
            <a data-reveal-stagger-child href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              style={{ background: "transparent", color: C.black, fontWeight: 600, fontSize: "var(--fs-contact-btn)", padding: "0.75rem 1.5rem", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.25)", textDecoration: "none" }}>
              Connect
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer data-a="footer" className={styles.footer} style={{ background: C.footer, paddingTop: "4rem", paddingBottom: "2rem", color: C.white }}>
      <div data-reveal="fade-up" style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className={styles.footerTop} style={{ display: "grid", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-footer-brand)", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>Chuko</div>
            <p style={{ fontSize: "var(--fs-footer-text)", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "1rem" }}>Studio<br />Barcelona, Spain</p>
            <a
              href="mailto:hola@medialunas.es"
              style={{
                display: "inline-block",
                fontSize: "var(--fs-footer-text)",
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <span style={{ display: "block", color: "rgba(255,255,255,0.4)" }}>Email</span>
              <span style={{ color: "rgba(255,255,255,0.65)", textDecoration: "underline", textUnderlineOffset: "2px" }}>hola@medialunas.es</span>
            </a>
          </div>

          <div className={styles.footerLinks} style={{ display: "grid" }}>
            {[
              { heading: "Our work", links: ["Services", "About us", "Get in touch"] },
            ].map((col) => (
              <div key={col.heading}>
                <p style={{ fontSize: "var(--fs-footer-heading)", fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: "0.75rem" }}>{col.heading}</p>
                {col.links.map((l) => (
                  <p key={l} style={{ marginBottom: "0.5rem" }}>
                    <a href="#" style={{ fontSize: "var(--fs-footer-link)", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{l}</a>
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footerBottom} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.5rem", fontSize: "var(--fs-footer-legal)", color: "rgba(255,255,255,0.3)" }}>
          <span>© 2026 Chuko. All rights reserved.</span>
          <div className={styles.footerLegal} style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy policy", "Terms of service", "Cookies settings"].map((l) => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */
export default function HomePage() {
  const animCleanupRef = useRef<(() => void) | null>(null);

  const setPageRootRef = useCallback((el: HTMLDivElement | null) => {
    animCleanupRef.current?.();
    animCleanupRef.current = null;
    if (el) {
      animCleanupRef.current = setupLandingAnimations(el);
    }
  }, []);

  return (
    <div ref={setPageRootRef} className={styles.pageRoot} style={{ fontFamily: "var(--font-space-grotesk)", colorScheme: "light" }}>
      <Nav />
      <Hero />
      <Services />
      <ContactCTA />
      <Footer />
    </div>
  );
}
