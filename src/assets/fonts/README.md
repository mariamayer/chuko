# Fonts

Place your heading font files here (`.woff2`, `.woff`, `.ttf`, or `.otf`).

Then add them in `src/app/layout.tsx` using `next/font/local`:

```ts
import localFont from "next/font/local";

const headingFont = localFont({
  src: "../assets/fonts/YourFont.woff2",
  variable: "--font-heading",
  display: "swap",
});
```

Add `headingFont.variable` to the `<html>` or `<body>` className, and use `font-[var(--font-heading)]` on headings.
