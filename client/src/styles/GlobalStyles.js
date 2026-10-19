import { createGlobalStyle } from 'styled-components';
import { media } from './breakpoints';

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
    /* Flat red for the navigation rail (6.08:1 for the text on it). */
    --color-rail: #a03131;
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
    --rail-width: 5.5rem;
    --bottom-bar-height: 4rem;

    /* Widest a podium card grows on wide screens. */
    --podium-card-max-width: 16rem;

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
  /* The admin styles its form fields and some buttons with light fills and no
     text color, so they keep the browser's light rendering (dark text) instead
     of the page's dark scheme. Buttons that need light text set it themselves. */
  input, select, textarea, button { color-scheme: light; }

  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
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

  /* SweetAlert2 dialogs (login, logout, admin) follow the tokens: dark surface,
     light text, a gold focus ring and no purple. SweetAlert2 reads its own
     custom properties, so these are set on its overlay. */
  .swal2-container {
    color-scheme: dark;
    --swal2-background: var(--color-surface);
    --swal2-color: var(--color-text);
    --swal2-border-radius: var(--radius-md);
    --swal2-backdrop: color-mix(in srgb, var(--color-bg) 80%, transparent);
    --swal2-input-background: var(--color-bg);
    /* The muted text color keeps the field's edge above 3:1 on the surface. */
    --swal2-input-border: 1px solid var(--color-text-muted);
    --swal2-input-border-radius: var(--radius-sm);
    --swal2-input-box-shadow: none;
    --swal2-input-hover-box-shadow: none;
    --swal2-input-focus-border: 1px solid var(--color-focus);
    --swal2-input-focus-box-shadow: 0 0 0 var(--focus-ring-width) var(--color-focus);
    --swal2-confirm-button-background-color: var(--color-brand);
    --swal2-confirm-button-color: var(--color-text);
    --swal2-confirm-button-border-radius: var(--radius-sm);
    --swal2-cancel-button-background-color: var(--color-surface-raised);
    --swal2-cancel-button-color: var(--color-text);
    --swal2-cancel-button-border-radius: var(--radius-sm);
    --swal2-action-button-focus-box-shadow: 0 0 0 var(--focus-ring-width) var(--color-focus);
  }

  /* The login dialog's titles use the body font: Reggae One only has a 400
     weight and reads too ornamental in a small dialog. */
  .swal2-container .swal2-title {
    font-family: var(--font-body);
    font-size: var(--font-size-xl);
    font-weight: 700;
  }

  .swal2-container .swal2-html-container {
    font-size: var(--font-size-base);
  }

  .swal2-container .swal-label {
    display: block;
    margin: var(--space-4) 0 var(--space-1);
    font-size: var(--font-size-sm);
    font-weight: 500;
    text-align: left;
  }

  .swal2-container .swal2-input {
    width: 100%;
    margin: 0;
    color: var(--color-text);
    font-family: var(--font-body);
    /* The admin fields are light on purpose; the dialogs are dark. */
    color-scheme: dark;
  }

  /* The document scrolls. Below the md breakpoint the nav is a fixed bottom
     bar out of the grid flow; from it up it is the first column. */
  .App {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-height: 100vh;
    position: relative;
  }

  ${media.md} {
    .App {
      grid-template-columns: var(--rail-width) minmax(0, 1fr);
    }
    /* The rail is hidden (display: none) so the content takes the full width. */
    .App[data-menu-hidden='true'] {
      grid-template-columns: minmax(0, 1fr);
    }
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
