import React, { useState, useEffect, ChangeEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import axios from 'axios';
import api from '../../services/api';

import './styles.css';
import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface UF {
  id: number;
  abbreviation: string;
  name: string;
}

interface City {
  name: string;
}

interface MapPosition {
  latitude: number;
  longitude: number;
}

interface IBGEUFResponse {
  id: number;
  nome: string;
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<UF[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [selectedUf, setSelectedUf] = useState<string>();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [selectedPosition, setSelectedPosition] = useState<MapPosition>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
        {
          params: {
            orderBy: 'nome',
          },
        },
      )
      .then(response => {
        const ufsData: UF[] = response.data.map(uf => {
          return {
            id: uf.id,
            abbreviation: uf.sigla,
            name: uf.nome,
          };
        });

        setUfs(ufsData);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === '') return;

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`,
        {
          params: {
            orderBy: 'nome',
          },
        },
      )
      .then(response => {
        const cityNames = response.data.map(city => {
          return { name: city.nome };
        });

        setCities(cityNames);
      });
  }, [selectedUf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition({
      latitude: event.latlng.lat,
      longitude: event.latlng.lng,
    });
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form>
        <h1>Cadastro do ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" />
            </div>
          </div>
        </fieldset>

        <Map
          center={[-15.7540088, -47.9009033]}
          zoom={15}
          onClick={handleMapClick}
        >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={[selectedPosition.latitude, selectedPosition.longitude]}
          />
        </Map>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
              >
                <option value="">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf.id} value={uf.abbreviation}>
                    {uf.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(i => (
              <li key={i.id}>
                <img src={i.image_url} alt={i.title} />
                <span>{i.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
