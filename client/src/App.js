// import './App.css';
import { useEffect, useState } from 'react';
import { Loading } from './components/initLoading';
import { GlobalStyle } from './styles/GlobalStyles';
import { Home } from './components/pages/Home';
// import './App.css';
function App() {
  const [isLoading, setLoading] = useState(false);

  // async function testHeroku() {
  //   let result = await fetch('/users')
  //     .then((response) => response.text())
  //     .then((result) => result);
  //   console.log(result);
  // }

  useEffect(() => {
    // testHeroku();
    return setTimeout(() => setLoading(true), 4000);
  }, []);

  // console.log(typeof process.env.NODE_ENV);
  return (
    <div className='App'>
      <GlobalStyle />
      {isLoading ? <Home /> : <Loading />}
    </div>
  );
}

export default App;
