import React, { useEffect, useState } from 'react';
import {
  IconsWrapper,
  FocusWrapper,
  Form,
  ImageWrapper,
  ImgNameMedailWrapper,
  ImgNameWrapper,
  MedailWrapper,
  NameWrapper,
} from './styles';

import { ScorePlayerFocus } from '../ScorePlayerFocus';
import { useStateValue } from '../../../Context';
import { useGetWidth } from '../../../hooks/useGetWidth';
import { AiFillCamera, AiOutlineCheck } from 'react-icons/ai';
import { BsX } from 'react-icons/bs';
import Swal from 'sweetalert2';

export const PlayerFocus = ({ player }) => {
  console.log(player);
  const regex = /^[/][a-z]+[/].*/gi;
  const imageSrc =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4000'
      : 'https://pysabackend.herokuapp.com';
  const imgData = regex.test(player.imgURL)
    ? `${imageSrc}${player.imgURL}`
    : `data:image/${player.imgURL.mimetype};base64,${player.imgURL.data}`;
  const [medail, setMedail] = useState(player.medail);
  const [src, setSrc] = useState({
    path: '',
    imgURL: imgData,
    oldImgURL: '',
  });
  const [{ medails }, dispatch] = useStateValue();
  const size = useGetWidth();

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
        return Swal.fire(
          'Datos Inválidos',
          'Se excedió los límites de las medallas',
          'error'
        );
      }
      setMedail(medail.name);
    } else {
      setMedail('Sin Calibrar');
    }
  }

  async function updateImage(form) {
    const uri =
      process.env.NODE_ENV === 'development'
        ? '/'
        : 'https://pysa-production.up.railway.app/';
    const updated = await fetch(`${uri}players/updateImage/${player['_id']}`, {
      method: 'POST',
      body: form,
    }).then((result) => result.json());

    return updated;
  }
  function onSubmit(event) {
    event.preventDefault();
    let form = new FormData(event.target);
    Swal.fire({
      title: 'Guardando...',
      didOpen: () => {
        Swal.showLoading();
        let button = Swal.getConfirmButton();
        button.click();
      },
      preConfirm: async () => {
        return await updateImage(form);
      },
    }).then((result) => {
      handleShowIcons('none');
      const imgURL = result.value.body.imgURL;
      if (result.isConfirmed) {
        dispatch({
          type: 'UPDATE_IMAGE',
          payload: { id: player['_id'], newImgURL: imgURL },
        });
        Swal.fire({
          title: `Guardado y actualizado con éxito`,
          icon: 'success',
        });
      }
    });
  }

  function handleCheck(event) {
    let button = document.getElementById('button-test');
    return button.click();
  }
  function onClickCamera() {
    let input = document.getElementById('input_to_setImage');

    return input.click();
  }

  function handleCancel() {
    let input = document.getElementById('input_to_setImage');
    input.value = '';
    handleShowIcons('none');
    setSrc({ path: '', imgURL: src.oldImgURL, oldImgURL: '' });
  }

  function onChangeImage(event) {
    let file = event.target.files[0];
    if (file) {
      handleShowIcons('block');
      let reader = new FileReader();
      let image = new Image();
      reader.readAsDataURL(file);
      reader.onload = () => {
        image.src = reader.result;
        setSrc((prevState) => {
          return prevState.oldImgURL
            ? {
                ...prevState,
                path: file.name,
                imgURL: image.src,
              }
            : {
                path: file.name,
                imgURL: image.src,
                oldImgURL: src.imgURL,
              };
        });
      };
    }
  }

  function handleShowIcons(display) {
    let icons = document.getElementsByName('check');
    icons[0].style.display = display;
    icons[1].style.display = display;
  }

  useEffect(() => {
    setMedail(player.medail);
    setSrc(() => ({
      path: '',
      imgURL: imgData,
      oldImgURL: '',
    }));
  }, [player, imgData]);

  return (
    <FocusWrapper>
      <ImgNameMedailWrapper>
        <MedailWrapper>
          <i className='icon-medal4'></i>
          <p>{player.medail} </p>
        </MedailWrapper>
        <ImgNameWrapper size={size}>
          <NameWrapper>
            <h1>{player.nickname}</h1>
          </NameWrapper>
          <ImageWrapper>
            <img src={src.imgURL} alt='imagen del jugador' />
            <IconsWrapper>
              <Form id='form_to_update_image' onSubmit={onSubmit}>
                <input
                  type='file'
                  name='image'
                  id='input_to_setImage'
                  onChange={onChangeImage}
                />
                <button id='button-test'>test</button>
              </Form>
              <AiOutlineCheck
                className='icon__control'
                onClick={handleCheck}
                name='check'
              />
              <BsX
                name='check'
                className='icon__control'
                onClick={handleCancel}
              />
              <AiFillCamera onClick={onClickCamera} />
            </IconsWrapper>
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
