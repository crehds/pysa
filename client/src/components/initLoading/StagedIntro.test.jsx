import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { StagedIntro } from './StagedIntro';

function renderIntro(props = {}) {
  const onSkip = vi.fn();
  const view = render(
    <LanguageProvider>
      <StagedIntro curtain={false} onSkip={onSkip} {...props} />
    </LanguageProvider>
  );
  return { onSkip, ...view };
}

describe('StagedIntro', () => {
  test('is a status named after loading, with a decorative logo', () => {
    renderIntro();
    const status = screen.getByRole('status', { name: 'Cargando' });
    expect(status.querySelector('img')).toHaveAttribute('alt', '');
  });

  test('has a reachable skip button that does not take focus on mount', () => {
    renderIntro();
    const button = screen.getByRole('button', { name: 'Saltar intro' });
    expect(button).not.toHaveFocus();
    expect(button).not.toHaveAttribute('tabindex', '-1');
  });

  test('the skip button skips', () => {
    const { onSkip } = renderIntro();
    fireEvent.click(screen.getByRole('button', { name: 'Saltar intro' }));
    expect(onSkip).toHaveBeenCalled();
  });

  test('a click anywhere on the intro skips', () => {
    const { onSkip } = renderIntro();
    fireEvent.click(screen.getByRole('status', { name: 'Cargando' }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  test('Esc skips, other keys do not', () => {
    const { onSkip } = renderIntro();
    fireEvent.keyDown(document, { key: 'a' });
    expect(onSkip).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  test('stops listening for Esc once it unmounts', () => {
    const { onSkip, unmount } = renderIntro();
    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onSkip).not.toHaveBeenCalled();
  });

  test('during the curtain the skip button is gone', () => {
    renderIntro({ curtain: true });
    expect(screen.queryByRole('button', { name: 'Saltar intro' })).not.toBeInTheDocument();
  });
});
