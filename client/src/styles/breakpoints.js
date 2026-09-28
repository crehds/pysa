// Mobile-first breakpoints, in px. Media queries can't read CSS custom
// properties, so the widths live here instead of with the other design tokens
// in GlobalStyles.js. Use the ready-made query strings inside styled-components:
//
//   const Grid = styled.div`
//     display: grid;
//     ${media.md} {
//       grid-template-columns: repeat(2, 1fr);
//     }
//   `;
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
};

export const media = {
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
};
