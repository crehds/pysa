// import './App.css';
import { useEffect, useState } from 'react';
import { Loading } from './components/initLoading';
import { GlobalStyle } from './styles/GlobalStyles';
import { Home } from './pages/Home';
import { NavBar } from './components/NavBar';
import { Router } from '@reach/router';
import { Players } from './pages/Players';
import { AdminPlayers } from './pages/AdminPlayers';
import './App.css';

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
    <div id='app' className='App'>
      <GlobalStyle />
      {isLoading ? (
        <>
          <NavBar />
          <Router style={{ height: '100vh' }}>
            <Home exac path='/' />
            <Players exac path='/players' />
            <AdminPlayers exac path='/adminPlayers'/>
          </Router>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default App;
