/* eslint-disable @next/next/no-img-element -- source uses plain <img> with CSS-driven sizing */
import Link from "next/link";
import { Fragment } from "react";
import { CaptureForm } from "./capture-form";
import {
  ASSET,
  bio,
  email,
  footerLinks,
  headerLeft,
  headerRight,
  isExternal,
  linkCards,
  phone,
  portfolio,
  profile,
} from "./content";
import { ScrollMotion } from "./scroll-motion";
import { SocialIcon } from "./social-icons";

const ext = { target: "_blank", rel: "noopener" } as const;

export function HomePage() {
  return (
    <>
      <div className="noise" />

      <header className="site-nav">
        <div className="site-nav__inner">
          <ul className="site-nav__menu site-nav__menu--left">
            {headerLeft.map((l) => (
              <li key={l.label}>
                <a href={l.href} aria-label={l.label} {...(isExternal(l.href) ? ext : {})}>
                  <SocialIcon name={l.icon} />
                  <span>{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <Link href="/" className="site-nav__logo" aria-label="Home">
            <img src={`${ASSET}/ayden-logo.png`} alt="Ayden" width={240} height={44} />
          </Link>
          <ul className="site-nav__menu site-nav__menu--right">
            {headerRight.map((l) => (
              <li key={l.label}>
                <a href={l.href} aria-label={l.label} {...(isExternal(l.href) ? ext : {})}>
                  <SocialIcon name={l.icon} />
                  <span>{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <ScrollMotion>
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <h1 className="hero-title reveal">DJ &middot; PRODUCER</h1>
            <p className="hero-tagline reveal">Open Format</p>
            <dl className="hero-profile">
              {profile.map((r) => (
                <div key={r.label} className="hero-profile__row reveal">
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
              <div className="hero-profile__row hero-profile__row--contact reveal">
                <dt>Điện thoại</dt>
                <dd>{phone.label}</dd>
                <dt>Email</dt>
                <dd>{email}</dd>
              </div>
            </dl>
          </div>
          <div className="hero-photo-area">
            <img
              src={`${ASSET}/hero-photo.jpg`}
              alt="Performing live"
              width={1024}
              height={1536}
              fetchPriority="high"
              decoding="async"
              className="scale-img"
              data-scale-from="1"
              data-scale-to="1.11"
            />
          </div>
        </section>

        <div className="divider" />

        <section className="portfolio" id="portfolio">
          <div className="portfolio-head">
            <h2 className="portfolio-heading reveal">{portfolio.heading}</h2>
          </div>
          <div className="portfolio-grid">
            <div className="portfolio-col">
              {portfolio.left.map((c) => (
                <ProjectCard key={c.src} {...c} />
              ))}
            </div>
            <div className="portfolio-col">
              {portfolio.right.map((c) => (
                <ProjectCard key={c.src} {...c} />
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        <section className="bio">
          <div className="bio-photo">
            <img
              src={`${ASSET}/bio-photo.jpg`}
              alt="Chân dung Ayden mặc vest đen trên nền than đen"
              width={1024}
              height={1536}
              loading="lazy"
              decoding="async"
              className="scale-img"
              data-scale-to="1.04"
            />
          </div>
          <div className="bio-content">
            <p className="bio-label reveal">{bio.label}</p>
            <h2 className="bio-heading reveal">{bio.heading}</h2>
            <div className="bio-text reveal">
              {bio.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="bio-quote reveal">
              {/* initials spell A-Y-D-E-N, so each word's first letter is picked out */}
              {bio.quote.split(" ").map((w, i) => (
                <Fragment key={w}>
                  {i > 0 && " "}
                  <span className="bio-quote__initial">{w[0]}</span>
                  {w.slice(1)}
                </Fragment>
              ))}
            </p>
          </div>
        </section>

        <div className="divider" />

        <footer className="site-footer">
          <div className="footer-logo">
            <Link href="/" aria-label="Home">
              <img src={`${ASSET}/ayden-logo.png`} alt="Ayden" width={120} height={24} />
            </Link>
          </div>
          <div className="footer-links reveal">
            {footerLinks.map((l) => (
              <a key={l.label} href={l.href} {...(isExternal(l.href) ? ext : {})}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="footer-right">&copy; 2026 Ayden</div>
        </footer>
      </ScrollMotion>
    </>
  );
}

function ProjectCard({ src, alt, href, shape }: { src: string; alt: string; href: string; shape: "v" | "s" | "h" }) {
  return (
    <a href={href} className="project-card reveal">
      <div className={`project-cover project-cover--${shape}`}>
        <div className="project-frame">
          <img
            src={src}
            alt={alt}
            width={1024}
            height={1536}
            loading="lazy"
            decoding="async"
            className="scale-img"
            data-scale-to="1.04"
          />
        </div>
        <div className="project-overlay" />
      </div>
    </a>
  );
}

// Hidden for now: CONNECT, ON TOUR and THE LIST. Render <HiddenSections />
// inside <ScrollMotion> in HomePage to bring them back.
export function HiddenSections() {
  return (
    <>
      <section className="links-section" id="learn">
        <p className="section-label reveal">CONNECT</p>
        <div className="links-grid reveal">
          {linkCards.map((c) => (
            <a key={c.title} href={c.href} className="link-card" {...ext}>
              <span className="link-title">{c.title}</span>
              <span className="link-sub">{c.sub}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="tickets-preview tickets-preview--bg">
        <p className="section-label reveal">ON TOUR</p>
        <h2 className="tickets-heading reveal">SEE AYDEN LIVE</h2>
        <p className="tickets-sub reveal">TOUR DATES AND TICKETS WORLDWIDE</p>
        <a href={`tel:${phone.tel}`} className="tickets-cta">
          GET TICKETS
        </a>
      </section>

      <div className="divider" />

      <section className="capture-section" id="email">
        <p className="section-label reveal">THE LIST</p>
        <h2 className="capture-heading reveal">GET IT FIRST</h2>
        <p className="capture-sub reveal">
          NEW MUSIC, TOUR DATES AND DJ &amp; PRODUCER LESSONS &mdash; STRAIGHT TO YOUR INBOX
        </p>
        <CaptureForm />
      </section>
    </>
  );
}
