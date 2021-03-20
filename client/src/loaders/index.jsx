import React from 'react';
import { WrapperDiv } from '../components/WrapperDiv';
import { LoadingWrapper } from './styles';

export const Loader = (props) => {
  return (
    <WrapperDiv>
      <LoadingWrapper>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </LoadingWrapper>
    </WrapperDiv>
  );
};
