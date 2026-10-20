import styled, { css, keyframes } from 'styled-components';

// The staged intro: a red spotlight sweeping across, the logo's shadow swinging,
// then a curtain that opens on the loaded page. Everything that moves is a
// layer animated with transform or opacity, so it stays on the compositor.
// Colors are the old intro's reds; the curtain uses the page tokens.

// The beam's center travels from the top right to the top left (the layer is
// larger than the screen and clipped by the overlay).
const sweep = keyframes`
  from { transform: translate(calc(100vw - 50%), -25%); }
  to { transform: translate(-50%, -25%); }
`;

const swing = keyframes`
  from { transform: translate(-20px, -20px); }
  to { transform: translate(20px, 20px); }
`;

// Covers the screen above the app. Between the first paint and the curtain it
// is the whole screen; in the curtain it lets clicks through to the page.
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow: hidden;
  cursor: pointer;
  ${({ $curtain }) => $curtain && 'pointer-events: none;'}
`;

// Half of the curtain. They sit behind the stage and, in the last phase, slide
// out to their own side. A little wider than half so no seam shows between them.
export const Panel = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 51%;
  ${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}
  background:
    linear-gradient(
      ${({ $side }) => ($side === 'left' ? 'to right' : 'to left')},
      transparent 0,
      transparent 97%,
      var(--color-brand) 97%
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 0 2rem,
      rgba(0, 0, 0, 0.14) 2rem 4rem
    ),
    var(--color-bg);
  will-change: transform;
  transition: transform ${({ $curtainMs }) => $curtainMs}ms cubic-bezier(0.55, 0, 0.8, 0.4);
  ${({ $curtain, $side }) =>
    $curtain && `transform: translateX(${$side === 'left' ? '-100%' : '100%'});`}
`;

// The logo, the spotlight and the skip button. It fades out as the curtain opens.
export const Stage = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
  transition: opacity 200ms ease-out;
  ${({ $curtain }) => $curtain && 'opacity: 0;'}
`;

// A big radial gradient (the old eclipse). Still on the center in lite; sweeping
// back and forth in full, until the data land.
export const Beam = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 90vmax;
  height: 90vmax;
  border-radius: 50%;
  background: radial-gradient(
    circle closest-side,
    #ffffff 0%,
    #dd1818 4%,
    #7a1313 12.25%,
    #5a0d0d 31.25%,
    rgba(51, 51, 51, 0.55) 50%,
    transparent 72%
  );
  transform: translate(calc(50vw - 50%), -25%);
  will-change: transform;
  ${({ $sweep }) =>
    $sweep &&
    css`
      animation: ${sweep} 2s ease-in-out infinite alternate;
    `}
`;

export const LogoWrap = styled.div`
  position: relative;
  width: min(100%, calc(var(--space-16) * 5));
`;

export const Logo = styled.img`
  position: relative;
  display: block;
  width: 100%;
  height: auto;
`;

// A soft dark ellipse behind the logo, standing in for its shadow.
export const Shadow = styled.div`
  position: absolute;
  inset: 12% 8% -6%;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0.75), transparent);
  filter: blur(10px);
  transform: translate(0, 12px);
  will-change: transform;
  ${({ $sweep }) =>
    $sweep &&
    css`
      animation: ${swing} 2s ease-in-out infinite alternate;
    `}
`;

export const SkipButton = styled.button`
  position: absolute;
  right: var(--space-6);
  bottom: var(--space-8);
  min-height: 2.75rem;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-text-muted);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  cursor: pointer;

  &:hover {
    background-color: var(--color-surface-raised);
  }
`;
