// import './App.css';
import { useEffect, useRef, useState } from 'react';
import { Loading } from './components/initLoading';
import { StagedIntro } from './components/initLoading/StagedIntro';
import { useStagedIntro } from './components/initLoading/useStagedIntro';
import { LoadError } from './components/LoadError';
import { GlobalStyle } from './styles/GlobalStyles';
import { Home } from './pages/Home';
import { NavBar } from './components/NavBar';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { normalizePath, pageTitle } from './utils/pageTitle';
import { Players } from './pages/Players';
import { AdminPlayers } from './pages/AdminPlayers';
import './App.css';
import { Logging } from './components/Logging';
import { RefreshButton } from './components/RefreshButton';
import { Main } from './styles/Main';
import { useGetData } from './hooks/useGetData';
import { useCheckAuth } from './hooks/useCheckAuth';
import { useStateValue } from './Context';
import { useMenuHidden } from './hooks/useMenuHidden';
import { useLanguage } from './i18n/LanguageContext';
import { ShowMenuButton } from './components/ShowMenuButton';

// Routes whose page header holds the refresh button.
const ROUTES_WITH_HEADER = ['/', '/players'];

function App() {
  const [{ isAuth }] = useStateValue();
  const { language } = useLanguage();
  const [isLoading, setLoading] = useState(false);
  const [isLogging, setLogging] = useState(isAuth);
  const [loadingData, setLoadingData] = useGetData(isLoading);
  useCheckAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const path = normalizePath(pathname);
  const routeContainerRef = useRef(null);
  const isInitialRender = useRef(true);
  const [menuHidden, setMenuHidden] = useMenuHidden();
  const hideButtonRef = useRef(null);
  const showButtonRef = useRef(null);
  // Set by a toggle click so focus follows it (never on the initial render).
  const focusAfterToggle = useRef(null);

  useEffect(() => {
    if (loadingData) {
      setLoading(true);
    }
  }, [loadingData]);

  useEffect(() => {
    document.title = pageTitle(pathname, language);
  }, [pathname, language]);

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

  // After a toggle the clicked button disappears or stops being reachable, so
  // focus moves to the opposite control.
  useEffect(() => {
    if (focusAfterToggle.current === 'show') {
      showButtonRef.current?.focus();
    } else if (focusAfterToggle.current === 'hide') {
      hideButtonRef.current?.focus();
    }
    focusAfterToggle.current = null;
  }, [menuHidden]);

  function toggleMenu(hidden) {
    focusAfterToggle.current = hidden ? 'show' : 'hide';
    setMenuHidden(hidden);
  }

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

  // loadingData is null when the request failed (see useGetData).
  const loadFailed = !isLoading && loadingData === null;
  // The first load in a tab plays the staged intro; the page is mounted once
  // its curtain starts to open, and the fast loader covers every other wait.
  const intro = useStagedIntro({ ready: isLoading, failed: loadFailed });
  const showPage = isLoading && (!intro.active || intro.curtain);

  return (
    <div id='app' className='App' data-menu-hidden={menuHidden}>
      <GlobalStyle />
      {intro.active && <StagedIntro curtain={intro.curtain} onSkip={intro.skip} level={intro.level} />}
      {showPage ? (
        <>
          <NavBar
            isLogging={isLogging}
            menuHidden={menuHidden}
            onHide={() => toggleMenu(true)}
            hideButtonRef={hideButtonRef}
          >
            <Logging
              handleLogging={handleLogging}
              isLogging={isLogging}
            />
          </NavBar>
          {/* react-router's <Routes> renders no wrapper element, so <main>
          is the page container. It doubles as the route container: focused
          on every route change (outline suppressed since that focus is
          programmatic, not from keyboard navigation) so assistive tech
          announces the new page. */}
          <Main ref={routeContainerRef} tabIndex={-1}>
            {menuHidden && (
              <ShowMenuButton
                onClick={() => toggleMenu(false)}
                buttonRef={showButtonRef}
              />
            )}
            {/* Home and Players hold the refresh button in their page header;
            the other pages have no header yet, so it floats there. */}
            {!ROUTES_WITH_HEADER.includes(path) && (
              <RefreshButton floating onClick={handleRefreshApp} />
            )}
            <Routes>
              <Route path='/' element={<Home onRefresh={handleRefreshApp} />} />
              <Route
                path='/players'
                element={<Players onRefresh={handleRefreshApp} />}
              />
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
          </Main>
        </>
      ) : loadFailed ? (
        <LoadError onRetry={handleRefreshApp} />
      ) : intro.active ? null : (
        <Loading />
      )}
    </div>
  );
}

export default App;
