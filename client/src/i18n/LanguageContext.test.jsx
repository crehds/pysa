import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loading } from '../components/initLoading';
import { LanguageProvider } from './LanguageContext';

describe('LanguageContext', () => {
  test('a component outside the provider renders English, whatever the browser says', () => {
    // setupTests pins the browser to Spanish; without a provider nothing
    // detects it, so the default language (English) is used.
    render(<Loading />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  test('inside the provider the detected language is used', () => {
    render(
      <LanguageProvider>
        <Loading />
      </LanguageProvider>
    );
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument();
  });
});
