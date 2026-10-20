import { css } from 'styled-components';

// The spotlight of the Players grid: the hovered card comes forward and lights
// up while the others recede a little. Only for a pointer that can really hover
// (a phone tap would leave the last card stuck lit). Everything that animates is
// transform or opacity; the highlight is a ::before whose opacity fades in, never
// a transitioning shadow. With `$lift` false (motion level none) nothing moves:
// the highlight and the dimming still change, and the global reduced-motion rule
// makes that instant.
export const HOVER_MEDIA = '@media (hover: hover) and (pointer: fine)';

const TRANSITION = '200ms ease-out';

export const cardSpotlightCss = ({ $lift }) => css`
  ${HOVER_MEDIA} {
    position: relative;
    transition:
      transform ${TRANSITION},
      opacity ${TRANSITION};

    /* Just over the border, so it needs no room of its own. */
    &::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      box-shadow:
        0 0 0 1px var(--color-text-muted),
        0 var(--space-3) var(--space-6) rgba(0, 0, 0, 0.45);
      opacity: 0;
      pointer-events: none;
      transition: opacity ${TRANSITION};
    }

    &:hover {
      z-index: 1;
      ${$lift && 'transform: translateY(-4px) scale(1.02);'}
    }

    &:hover::before {
      opacity: 1;
    }
  }
`;

// On the grid: while one item is hovered, the cards of the others recede. Where
// :has() is unsupported the browser drops this rule and only the lift remains.
export const siblingsRecedeCss = ({ $lift }) => css`
  ${HOVER_MEDIA} {
    &:has(> li:hover) > li:not(:hover) > article {
      opacity: 0.75;
      ${$lift && 'transform: scale(0.98);'}
    }
  }
`;
