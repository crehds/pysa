// import './App.css';
import { useEffect, useState } from 'react';
import { Loading } from './components/initLoading';
import { GlobalStyle } from './styles/GlobalStyles';
import { Home } from './pages/Home';
import { NavBar } from './components/NavBar';
import { navigate, Redirect, Router } from '@reach/router';
import { Players } from './pages/Players';
import { AdminPlayers } from './pages/AdminPlayers';
import './App.css';
import { Logging } from './components/Logging';
import { useGetData } from './hooks/useGetData';
import { useStateValue } from './Context';

function App() {
  const [{ isAuth }] = useStateValue()
  const [isLoading, setLoading] = useState(false);
  const [isLogging, setLogging] = useState(isAuth);
  const loading = useGetData(isLoading);

  // async function testHeroku() {
  //   let result = await fetch('/users')
  //     .then((response) => response.text())
  //     .then((result) => result);
  //   console.log(result);
  // }

  useEffect(() => {
    let t = undefined;
    if (loading) {
      t = setTimeout(() => setLoading(true), 4000);
    }
    return () => clearTimeout(t);
  }, [loading]);

  function handleLogging(value) {
    setLogging(value);
    if (value) {
      navigate('/adminPlayers', { replace: true });
    }
  }

  return (
    <div id='app' className='App'>
      <GlobalStyle />
      {console.log(loading)}
      {/* {console.log('holi')} */}
      {isLoading ? (
        <>
          <NavBar isLogging={isLogging} />
          <Logging handleLogging={handleLogging} isLogging={isLogging} />
          <Router style={{ height: '100vh' }}>
            <Home exac path='/' />
            <Players exac path='/players' />
            {!isLogging && <Redirect noThrow from='/adminPlayers' to='/' />}
            <AdminPlayers exac path='/adminPlayers' />
          </Router>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default App;
