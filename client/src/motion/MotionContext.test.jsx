import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { MotionProvider, useMotionLevel } from './MotionContext';

function Level() {
  return <p data-testid="level">{useMotionLevel()}</p>;
}

// A minimal MediaQueryList and NetworkInformation that record listeners.
function fakeEmitter(initial) {
  const listeners = new Set();
  return {
    ...initial,
    listeners,
    addEventListener: vi.fn((type, fn) => type === 'change' && listeners.add(fn)),
    removeEventListener: vi.fn((type, fn) => type === 'change' && listeners.delete(fn)),
    emit() {
      listeners.forEach((fn) => fn());
    },
  };
}

function setConnection(connection) {
  Object.defineProperty(navigator, 'connection', { value: connection, configurable: true });
}

function renderLevel() {
  return render(
    <MotionProvider>
      <Level />
    </MotionProvider>
  );
}

describe('MotionContext', () => {
  afterEach(() => {
    delete window.matchMedia;
    delete navigator.connection;
    document.documentElement.removeAttribute('data-motion');
  });

  test('a component outside the provider gets full', () => {
    render(<Level />);
    expect(screen.getByTestId('level')).toHaveTextContent('full');
  });

  test('exposes the detected level and mirrors it to <html data-motion>', () => {
    setConnection({ effectiveType: '3g' });
    renderLevel();
    expect(screen.getByTestId('level')).toHaveTextContent('lite');
    expect(document.documentElement.dataset.motion).toBe('lite');
  });

  test('works with neither matchMedia nor connection', () => {
    renderLevel();
    expect(screen.getByTestId('level')).toHaveTextContent('full');
    expect(document.documentElement.dataset.motion).toBe('full');
  });

  test('a reduced-motion change flips the level live', () => {
    const query = fakeEmitter({ matches: false });
    window.matchMedia = vi.fn(() => query);
    renderLevel();
    expect(screen.getByTestId('level')).toHaveTextContent('full');

    query.matches = true;
    act(() => query.emit());
    expect(screen.getByTestId('level')).toHaveTextContent('none');
    expect(document.documentElement.dataset.motion).toBe('none');
  });

  test('a connection change flips the level live', () => {
    const connection = fakeEmitter({ effectiveType: '4g', saveData: false });
    setConnection(connection);
    renderLevel();
    expect(screen.getByTestId('level')).toHaveTextContent('full');

    connection.saveData = true;
    act(() => connection.emit());
    expect(screen.getByTestId('level')).toHaveTextContent('lite');
  });

  test('removes both listeners and the attribute on unmount', () => {
    const query = fakeEmitter({ matches: false });
    const connection = fakeEmitter({ effectiveType: '4g' });
    window.matchMedia = vi.fn(() => query);
    setConnection(connection);
    const { unmount } = renderLevel();
    expect(query.listeners.size).toBe(1);
    expect(connection.listeners.size).toBe(1);

    unmount();
    expect(query.listeners.size).toBe(0);
    expect(connection.listeners.size).toBe(0);
    expect(document.documentElement).not.toHaveAttribute('data-motion');
  });

  test('a connection without event support does not break the provider', () => {
    setConnection({ effectiveType: '2g' });
    renderLevel();
    expect(screen.getByTestId('level')).toHaveTextContent('lite');
  });
});
