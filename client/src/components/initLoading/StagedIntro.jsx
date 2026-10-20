import React, { useEffect } from 'react';
import logo from '../../assets/logo_pysa_6.png';
import { Beam, Logo, LogoWrap, Overlay, Panel, Shadow, SkipButton, Stage } from './introStyles.jsx';
import { INTRO_TIMING } from './useStagedIntro';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMotionLevel } from '../../motion/MotionContext';

// The first-load intro. The container is the status the other loading
// assertions look for; everything visual is decorative. A click anywhere, Esc
// or the button skips it (focus is never moved here on mount). `level` is the
// level the intro started with; it falls back to the live one.
export const StagedIntro = ({ curtain, onSkip, level: startLevel }) => {
  const { t } = useLanguage();
  const liveLevel = useMotionLevel();
  const level = startLevel ?? liveLevel;
  const sweep = level === 'full';
  const { curtainMs } = INTRO_TIMING[level] ?? INTRO_TIMING.lite;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onSkip();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onSkip]);

  return (
    <Overlay role='status' aria-label={t('loading')} onClick={onSkip} $curtain={curtain}>
      <Panel aria-hidden='true' $side='left' $curtain={curtain} $curtainMs={curtainMs} />
      <Panel aria-hidden='true' $side='right' $curtain={curtain} $curtainMs={curtainMs} />
      <Stage $curtain={curtain}>
        <Beam aria-hidden='true' $sweep={sweep} />
        <LogoWrap>
          <Shadow aria-hidden='true' $sweep={sweep} />
          <Logo src={logo} alt='' />
        </LogoWrap>
        {!curtain && (
          <SkipButton type='button' onClick={onSkip}>
            {t('intro.skip')}
          </SkipButton>
        )}
      </Stage>
    </Overlay>
  );
};
