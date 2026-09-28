import { createGlobalStyle } from 'styled-components';

// Design tokens (CSS custom properties on :root) and the base styles every page
// shares. Read a token with var(--token-name) from any styled component.
// Breakpoints are the one exception: media queries can't read custom
// properties, so they live in ./breakpoints.js.
export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: dark;

    /* Colors: the existing palette (assets/paletteColors.css and the logo). */
    --color-bg: #222831;
    --color-surface: #303841;
    --color-surface-raised: #393e46;
    --color-border: #3a4750;
    --color-text: #eeeeee;
    --color-text-muted: #99adb3;
    /* Logo red. About 2.6:1 on --color-bg, so use it for fills and marks, never for text. */
    --color-brand: #cc1924;
    /* Flat red for the navigation rail. Candidate to compare in screenshots: #a03131. */
    --color-rail: #7a1313;
    --color-gold: #ffd369;
    --color-silver: #c0c0c0;
    --color-bronze: #cd7f32;
    --color-focus: #ffd369;

    /* Fonts: Reggae One for display (it only has a 400 weight, so never bold it),
       Ubuntu for everything else. */
    --font-display: 'Reggae One', system-ui, sans-serif;
    --font-body: 'Ubuntu', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

    /* Type scale */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 2rem;
    --font-size-4xl: 2.5rem;
    --line-height-body: 1.5;

    /* Spacing: multiples of 0.25rem, named by that multiple. */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;

    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-full: 9999px;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.35);

    /* Shell layout: the labeled rail on wide screens, the bottom bar on phones. */
    --rail-width: 5rem;
    --bottom-bar-height: 4rem;

    --focus-ring-width: 2px;
    --focus-ring-offset: 2px;
  }

  html {
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  ul, li, h1, h2, h3, p, button { margin: 0; padding: 0; }
  ul { list-style: none; }
  button { background: transparent; border: 0; }
  button, input, select, textarea { font-family: inherit; }
  /* The admin styles its form fields as light fields with dark text, so they
     keep the browser's light rendering instead of the page's dark scheme. */
  input, select, textarea { color-scheme: light; }

  body {
    margin: 0;
    padding: 0;
    height: 100vh;
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    line-height: var(--line-height-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 400;
  }

  :focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus);
    outline-offset: var(--focus-ring-offset);
  }

  #root {
    background-color: var(--color-bg);
    min-height: 100vh;
  }

  .App {
    display: grid;
    grid-template-columns: auto 1fr;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *:before, *:after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      transition-delay: 0s !important;
    }
  }
`;
