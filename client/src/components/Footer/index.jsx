import React from 'react';
import { FooterBar, FooterLink, LinkList } from './styles';
import { VisuallyHidden } from '../../styles/VisuallyHidden';
import { useLanguage } from '../../i18n/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();
  return (
    <FooterBar>
      <p>{t('footer.text')}</p>
      <LinkList>
        <li>
          <FooterLink
            href='https://github.com/crehds/pysa'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('footer.github')}
            <VisuallyHidden> {t('footer.newTab')}</VisuallyHidden>
          </FooterLink>
        </li>
      </LinkList>
    </FooterBar>
  );
};
