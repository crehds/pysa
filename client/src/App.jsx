// import './App.css';
import { useEffect, useRef, useState } from 'react';
import { Loading } from './components/initLoading';
import { GlobalStyle } from './styles/GlobalStyles';
import { Home } from './pages/Home';
import { NavBar } from './components/NavBar';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { Players } from './pages/Players';
import { AdminPlayers } from './pages/AdminPlayers';
import './App.css';
import { Logging } from './components/Logging';
import { useGetData } from './hooks/useGetData';
import { useCheckAuth } from './hooks/useCheckAuth';
import { useStateValue } from './Context';

function App() {
  const [{ isAuth }] = useStateValue();
  const [isLoading, setLoading] = useState(false);
  const [isLogging, setLogging] = useState(isAuth);
  const [loadingData, setLoadingData] = useGetData(isLoading);
  useCheckAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const routeContainerRef = useRef(null);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (loadingData) {
      setLoading(true);
    }
  }, [loadingData]);

  // isAuth starts out null (not yet known) and resolves asynchronously once
  // useCheckAuth's GET /auth/me completes; mirror it into isLogging once it
  // does, without re-navigating (that only happens from an explicit login,
  // via handleLogging below), so a reload of /adminPlayers with a valid
  // session does not flash a redirect to / first.
  useEffect(() => {
    if (isAuth !== null) {
      setLogging(isAuth);
    }
  }, [isAuth]);

  // Moves focus to the route container on every route change (but not on the
  // initial render) so screen-reader users get a signal that the page
  // changed, since react-router doesn't do this on its own.
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    routeContainerRef.current?.focus();
  }, [pathname]);

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
          @reach/router's <Router>, so this element keeps the same 100vh box
          the rest of the layout (see WrapperDiv's height: inherit) relies
          on. It also doubles as the route container: focused on every route
          change (outline suppressed since that focus is programmatic, not
          from keyboard navigation) so assistive tech announces the new
          page. */}
          <main
            ref={routeContainerRef}
            tabIndex={-1}
            style={{ height: '100vh', outline: 'none' }}
          >
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/players' element={<Players />} />
              <Route
                path='/adminPlayers'
                element={
                  isLogging === null ? null : isLogging ? (
                    <AdminPlayers />
                  ) : (
                    <Navigate to='/' replace />
                  )
                }
              />
            </Routes>
          </main>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default App;
