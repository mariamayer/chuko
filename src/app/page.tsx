import Link from "next/link";

/* ── Brand colours ── */
const C = {
  hero:    "#4D4D4D",
  service: "#C9C6FF",
  contact: "#F5F4EF",
  footer:  "#1A1A18",
  white:   "#FFFFFF",
  black:   "#0D0D0D",
};

/* ── Shared nav height so hero padding is consistent ── */
const NAV_H = 64;

/* ─────────────────────────────────────────────────────────
   NAV
───────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: NAV_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
        background: C.hero,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "1.25rem",
          color: C.white,
          letterSpacing: "-0.02em",
        }}
      >
        Chuko
      </span>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {["Work", "Services", "Contact"].map((l) => (
          <a
            key={l}
            href={`#${l.toLowerCase()}`}
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            {l}
          </a>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="#contact"
        style={{
          background: C.white,
          color: C.black,
          fontSize: "0.8125rem",
          fontWeight: 600,
          padding: "0.5rem 1.25rem",
          borderRadius: "999px",
          textDecoration: "none",
          letterSpacing: "0.01em",
        }}
      >
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
    <section
      id="hero"
      style={{
        background: C.hero,
        minHeight: "100vh",
        paddingTop: NAV_H,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: `${NAV_H + 80}px 2rem 80px`,
      }}
    >
      {/* Headline */}
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 900,
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: C.white,
          maxWidth: "820px",
          margin: "0 auto 1.5rem",
        }}
      >
        We build software that actually works for people.
      </h1>

      {/* Sub */}
      <p
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: "1rem",
          lineHeight: 1.6,
          maxWidth: "440px",
          margin: "0 auto 2.5rem",
        }}
      >
        Chuko is a small team of developers and designers who care about craft.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginBottom: "4rem" }}>
        <a
          href="#work"
          style={{
            background: C.white,
            color: C.black,
            fontWeight: 600,
            fontSize: "0.875rem",
            padding: "0.75rem 1.75rem",
            borderRadius: "999px",
            textDecoration: "none",
          }}
        >
          Work
        </a>
        <a
          href="#contact"
          style={{
            background: "transparent",
            color: C.white,
            fontWeight: 600,
            fontSize: "0.875rem",
            padding: "0.75rem 1.75rem",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.35)",
            textDecoration: "none",
          }}
        >
          Contact
        </a>
      </div>

      {/* Feature tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderTop: "1px solid rgba(255,255,255,0.15)",
          width: "100%",
          maxWidth: "700px",
        }}
      >
        {tabs.map((t, i) => (
          <div
            key={t}
            style={{
              flex: 1,
              padding: "1rem 0.5rem",
              borderRight: i < tabs.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.75rem",
              letterSpacing: "0.03em",
              textAlign: "center",
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   SERVICES
───────────────────────────────────────────────────────── */
const services = [
  {
    n: "01",
    tag: "Services",
    title: "What we do",
    body: "We shape ideas into products that matter. Each project is built with intention and care.",
  },
  {
    n: "02",
    tag: "Capabilities",
    title: "Web and product development",
    body: "We develop web applications and digital products that solve real problems. From concept to launch, we handle the full stack with care.",
  },
  {
    n: "03",
    tag: "Intelligence",
    title: "AI-powered tools",
    body: "We build AI systems that augment human work, not replace it. Tools that learn your patterns and make your team smarter.",
  },
  {
    n: "04",
    tag: "Systems",
    title: "Design systems and ops",
    body: "We create design systems that grow with you. Scalable, maintainable, and built for teams that move fast without losing coherence.",
  },
];

function Services() {
  return (
    <section
      id="services"
      style={{ background: C.service, padding: "6rem 2.5rem" }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {services.map((s, i) => (
          <div
            key={s.n}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              alignItems: "start",
              gap: "2rem",
              padding: "3.5rem 0",
              borderTop: i === 0 ? "1px solid rgba(0,0,0,0.15)" : "none",
              borderBottom: "1px solid rgba(0,0,0,0.15)",
            }}
          >
            {/* Big number */}
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                fontSize: "clamp(4rem, 8vw, 7rem)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: C.black,
              }}
            >
              {s.n}
            </div>

            {/* Content */}
            <div>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.45)",
                  marginBottom: "0.75rem",
                }}
              >
                — {s.tag}
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: C.black,
                  marginBottom: "1rem",
                }}
              >
                {s.title}
              </h2>
              <p
                style={{
                  color: "rgba(0,0,0,0.6)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  maxWidth: "520px",
                  marginBottom: "1.25rem",
                }}
              >
                {s.body}
              </p>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <a href="#contact" style={linkStyle}>Explore</a>
                <a href="#contact" style={linkStyle}>Learn →</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const linkStyle: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: C.black,
  textDecoration: "none",
  borderBottom: "1px solid rgba(0,0,0,0.3)",
  paddingBottom: "1px",
};

/* ─────────────────────────────────────────────────────────
   WORK
───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
   CONTACT CTA
───────────────────────────────────────────────────────── */
function ContactCTA() {
  return (
    <section
      id="contact"
      style={{
        background: C.contact,
        padding: "7rem 2.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        {/* Left */}
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: C.black,
          }}
        >
          Let&apos;s build something together.
        </h2>

        {/* Right */}
        <div>
          <p
            style={{
              color: "rgba(0,0,0,0.55)",
              fontSize: "0.9375rem",
              lineHeight: 1.65,
              marginBottom: "2rem",
              maxWidth: "380px",
            }}
          >
            We&apos;d like to hear about your project. Reach out and let&apos;s talk.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a
              href="mailto:hola@medialunas.es"
              style={{
                background: C.black,
                color: C.white,
                fontWeight: 600,
                fontSize: "0.875rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                textDecoration: "none",
              }}
            >
              Email
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "transparent",
                color: C.black,
                fontWeight: 600,
                fontSize: "0.875rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                border: `1px solid rgba(0,0,0,0.25)`,
                textDecoration: "none",
              }}
            >
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
    <footer style={{ background: C.footer, padding: "4rem 2.5rem 2rem", color: C.white }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Top grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Left: logo + address + email + socials */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1.25rem",
                letterSpacing: "-0.02em",
                marginBottom: "1.5rem",
              }}
            >
              Chuko
            </div>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "1rem" }}>
              Studio<br />
              Barcelona, Spain
            </p>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Email<br />
              <a href="mailto:hola@medialunas.es" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
                hola@medialunas.es
              </a>
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: "1rem" }}>
              {["IG", "X", "LI", "BE"].map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Right: link columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem" }}>
            {[
              { heading: "Our work",   links: ["Services", "About us", "Get in touch"] },
              { heading: "LinkedIn",   links: ["Behance", "Dribbble"] },
              { heading: "Instagram",  links: ["Contact"] },
            ].map((col) => (
              <div key={col.heading}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.65)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {col.heading}
                </p>
                {col.links.map((l) => (
                  <p key={l} style={{ marginBottom: "0.5rem" }}>
                    <a
                      href="#"
                      style={{
                        fontSize: "0.8125rem",
                        color: "rgba(255,255,255,0.35)",
                        textDecoration: "none",
                      }}
                    >
                      {l}
                    </a>
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "1.5rem",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <span>© 2025 Chuko. All rights reserved.</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy policy", "Terms of service", "Cookies settings"].map((l) => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
                {l}
              </a>
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
  return (
    // Isolate from the dashboard's dark-mode CSS variables
    <div style={{ fontFamily: "var(--font-space-grotesk)", colorScheme: "light" }}>
      <Nav />
      <Hero />
      <Services />
      <ContactCTA />
      <Footer />
    </div>
  );
}
