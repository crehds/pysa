import React from 'react';
import { FooterBar, FooterLink, LinkList } from './styles';
import { VisuallyHidden } from '../../styles/VisuallyHidden';

export const Footer = () => (
  <FooterBar>
    <p>Pysa. Hecho con React, Express y MongoDB.</p>
    <LinkList>
      <li>
        <FooterLink
          href='https://github.com/crehds/pysa'
          target='_blank'
          rel='noopener noreferrer'
        >
          Código en GitHub
          <VisuallyHidden> (se abre en una pestaña nueva)</VisuallyHidden>
        </FooterLink>
      </li>
    </LinkList>
  </FooterBar>
);
