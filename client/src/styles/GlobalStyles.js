import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  ul, li, h1, h2, h3, p, button { margin: 0; padding: 0; }
  ul { list-style: none; }
  button { background: transparent; border: 0; outline: 0 }

  /* #app {
    box-shadow: 0 0 10px rgba(0, 0, 0, .05);
    overflow-x: hidden;
    min-height: 100vh;
    padding-bottom: 10px; 
  } */

  body {
  margin: 0;
  padding: 0;
  height: 100vh;
  }


  #root {
    background-color: rgb(34, 40, 49, .9);
    /* width: 100vw; */
    min-height: 100vh;
  }

  .App {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    /* position: relative;
    height: 100vh; */
  }
`;
