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
import { Logging } from './components/Logging';

function App() {
  const [isLoading, setLoading] = useState(false);
  const [isLogging, setLogging] = useState(false);
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

  function handleLogging(value) {
    setLogging(value);
  }

  return (
    <div id='app' className='App'>
      <GlobalStyle />
      {isLoading ? (
        <>
          <NavBar isLogging={isLogging} />
          <Logging handleLogging={handleLogging} isLogging={isLogging} />
          <Router style={{ height: '100vh' }}>
            <Home exac path='/' />
            <Players exac path='/players' />
            {isLogging && <AdminPlayers exac path='/adminPlayers' />}
          </Router>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default App;
