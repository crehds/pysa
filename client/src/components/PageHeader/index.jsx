import React, { useEffect, useRef, useState } from 'react';
import { ImInfo } from 'react-icons/im';
import { Actions, Header, Intro, Logo, MedalRangesButton, Title, TitleBlock } from './styles';
import { RefreshButton } from '../RefreshButton';
import { Medails } from '../Medails';
import logo from '../../assets/logopysa_90x90.png';

const MEDAILS_ID = 'medails';
// SweetAlert2's overlay, present while a login/logout dialog is open.
const DIALOG_SELECTOR = '.swal2-container';

// A page's header: the h1 and an optional intro, the refresh button and, when
// `medalRanges` is set, the medal ranges disclosure. The ranges toggle is a real
// button (keyboard and touch) and lives here, not in the table header, so phones
// can reach it too.
export const PageHeader = ({ title, intro, medalRanges = false, onRefresh }) => {
  const [rangesOpen, setRangesOpen] = useState(false);
  const rangesButtonRef = useRef(null);

  // Escape closes the ranges and hands focus back to the button, unless a
  // dialog is open: Escape then belongs to the dialog (the listener is on the
  // document, so it would otherwise also move focus out from under it).
  useEffect(() => {
    if (!rangesOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape' && !document.querySelector(DIALOG_SELECTOR)) {
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
        <Title>{title}</Title>
        {intro && <Intro>{intro}</Intro>}
      </TitleBlock>
      <Actions>
        <RefreshButton onClick={onRefresh} />
        {medalRanges && (
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
        )}
      </Actions>
      {medalRanges && <Medails open={rangesOpen} />}
    </Header>
  );
};
