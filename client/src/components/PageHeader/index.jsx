import React, { useEffect, useRef, useState } from 'react';
import { ImInfo } from 'react-icons/im';
import { Actions, Header, Intro, Logo, MedalRangesButton, Title, TitleBlock } from './styles';
import { RefreshButton } from '../RefreshButton';
import { Medails } from '../Medails';
import logo from '../../assets/logopysa_90x90.png';

const MEDAILS_ID = 'medails';

// Home's header: the title and intro, the refresh button and the medal ranges
// disclosure. The ranges toggle is a real button (keyboard and touch) and lives
// here, not in the table header, so phones can reach it too.
export const PageHeader = ({ onRefresh }) => {
  const [rangesOpen, setRangesOpen] = useState(false);
  const rangesButtonRef = useRef(null);

  // Escape closes the ranges and hands focus back to the button.
  useEffect(() => {
    if (!rangesOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setRangesOpen(false);
        rangesButtonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [rangesOpen]);

  return (
    <Header>
      <Logo src={logo} alt='' />
      <TitleBlock>
        <Title>Ranking</Title>
        <Intro>Clasificación de la comunidad Pysa de Dota 2, ordenada por MMR.</Intro>
      </TitleBlock>
      <Actions>
        <RefreshButton onClick={onRefresh} />
        <MedalRangesButton
          type='button'
          ref={rangesButtonRef}
          aria-expanded={rangesOpen}
          aria-controls={MEDAILS_ID}
          onClick={() => setRangesOpen((open) => !open)}
        >
          <ImInfo aria-hidden='true' size='1em' />
          Rangos de medallas
        </MedalRangesButton>
      </Actions>
      <Medails open={rangesOpen} />
    </Header>
  );
};
