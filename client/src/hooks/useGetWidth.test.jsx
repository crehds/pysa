import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { useGetWidth } from './useGetWidth';

function Probe() {
  const width = useGetWidth();
  return <p data-testid='width'>{String(width)}</p>;
}

function renderInMain() {
  return render(
    <main>
      <Probe />
    </main>
  );
}

function setClientWidth(element, value) {
  Object.defineProperty(element, 'clientWidth', { configurable: true, value });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('re-measures when the observed element reports a new size', () => {
  const instances = [];
  class FakeResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.observe = vi.fn();
      this.disconnect = vi.fn();
      instances.push(this);
    }
  }
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  const proto = HTMLElement.prototype;
  const original = Object.getOwnPropertyDescriptor(proto, 'clientWidth');
  let current = 800;
  Object.defineProperty(proto, 'clientWidth', {
    configurable: true,
    get: () => current,
  });

  try {
    const { container, unmount } = renderInMain();
    expect(screen.getByTestId('width')).toHaveTextContent('800');
    expect(instances).toHaveLength(1);
    expect(instances[0].observe).toHaveBeenCalledWith(container.querySelector('main'));

    current = 1200;
    act(() => instances[0].callback());
    expect(screen.getByTestId('width')).toHaveTextContent('1200');

    unmount();
    expect(instances[0].disconnect).toHaveBeenCalled();
  } finally {
    if (original) Object.defineProperty(proto, 'clientWidth', original);
    else delete proto.clientWidth;
  }
});

test('without ResizeObserver it falls back to the window resize event', () => {
  vi.stubGlobal('ResizeObserver', undefined);
  const { container } = renderInMain();
  const main = container.querySelector('main');
  setClientWidth(main, 640);

  act(() => {
    window.dispatchEvent(new Event('resize'));
  });

  expect(screen.getByTestId('width')).toHaveTextContent('640');
});
