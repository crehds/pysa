import React, { useEffect, useState } from 'react';
import {
  FocusWrapper,
  ImageWrapper,
  ImgNameMedailWrapper,
  ImgNameWrapper,
  MedailWrapper,
  NameWrapper,
} from './styles';
import user from '../../../assets/default-user.png';
import { ScorePlayerFocus } from '../ScorePlayerFocus';
import { useStateValue } from '../../../Context';
import Swal from 'sweetalert2';

export const PlayerFocus = ({  player }) => {
  const [medail, setMedail] = useState(player.medail);
  const [{ medails}, dispatch] = useStateValue();
  function handleUpdateMedail(mmr, partidas) {
    let medail = {};
    let condition =
      (player.medail === 'Sin Calibrar' && player.partidas + partidas >= 10) ||
      player.medail !== 'Sin Calibrar';
    if (condition) {
      medail = medails.find(
        (medail) => medail.minimo <= mmr && mmr <= medail.maximo
      );
      if (!medail) {
        return Swal.fire('Datos Inválidos', 'Se excedió los límites de las medallas','error')
      }
      setMedail(medail.name);
    } else {
      setMedail('Sin Calibrar')
    }
  }
  useEffect(() => {
    setMedail(player.medail)
  }, [player])

  return (
    <FocusWrapper>
      <ImgNameMedailWrapper>
        <MedailWrapper>
          <i className='icon-medal4'></i>
          <p>{player.medail} </p>
        </MedailWrapper>
        <ImgNameWrapper>
          <NameWrapper>
            <h1>{player.nickname}</h1>
          </NameWrapper>
          <ImageWrapper>
            <img src={user} alt='imagen del jugador' />
          </ImageWrapper>
        </ImgNameWrapper>
        <MedailWrapper>
          <i className='icon-medal4'></i>
          <p>{medail} </p>
        </MedailWrapper>
      </ImgNameMedailWrapper>
      <ScorePlayerFocus
        playerId={player['_id']}
        roles={player.rolesScore}
        mmr={player.mmr}
        medail={player.medail}
        handleUpdateMedail={handleUpdateMedail}
      />
    </FocusWrapper>
  );
};
