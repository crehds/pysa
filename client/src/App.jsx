// import './App.css';
import { useEffect, useState } from 'react';
import { Loading } from './components/initLoading';
import { GlobalStyle } from './styles/GlobalStyles';
import { Home } from './pages/Home';
import { NavBar } from './components/NavBar';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import { Players } from './pages/Players';
import { AdminPlayers } from './pages/AdminPlayers';
import './App.css';
import { Logging } from './components/Logging';
import { useGetData } from './hooks/useGetData';
import { useStateValue } from './Context';

function App() {
  const [{ isAuth }] = useStateValue();
  const [isLoading, setLoading] = useState(false);
  const [isLogging, setLogging] = useState(isAuth);
  const [loadingData, setLoadingData] = useGetData(isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingData) {
      setLoading(true);
    }
  }, [loadingData]);

  function handleLogging(value) {
    setLogging(value);
    if (value) {
      navigate('/adminPlayers', { replace: true });
    }
  }

  function handleRefreshApp() {
    setLoadingData(false);
    setLoading(false);
  }

  console.log(loadingData);
  return (
    <div id='app' className='App'>
      <GlobalStyle />
      {isLoading ? (
        <>
          <NavBar isLogging={isLogging} />
          <Logging
            handleLogging={handleLogging}
            isLogging={isLogging}
            handleRefreshApp={handleRefreshApp}
          />
          {/* react-router's <Routes> renders no wrapper element, unlike
          @reach/router's <Router>, so this div keeps the same 100vh box
          the rest of the layout (see WrapperDiv's height: inherit) relies
          on. */}
          <div style={{ height: '100vh' }}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/players' element={<Players />} />
              <Route
                path='/adminPlayers'
                element={isLogging ? <AdminPlayers /> : <Navigate to='/' replace />}
              />
            </Routes>
          </div>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default App;
