import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
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

  const [initialPosition, setinitialPosition] = useState<MapPosition>({
    latitude: 0,
    longitude: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [selectedUf, setSelectedUf] = useState<string>();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [selectedItemsIds, setSelectedItemsIds] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<MapPosition>({
    latitude: 0,
    longitude: 0,
  });

  const history = useHistory();

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setinitialPosition({
        latitude,
        longitude,
      });
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

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    const currentForm = { ...formData };

    currentForm[name] = value;

    setFormData(currentForm);
  }

  function handleSelectItem(item: Item) {
    let currentSelectedItemsIds = [...selectedItemsIds];

    const index = currentSelectedItemsIds.indexOf(item.id);
    if (index === -1) {
      currentSelectedItemsIds.push(item.id);
    } else {
      currentSelectedItemsIds.splice(index, 1);
    }

    setSelectedItemsIds(currentSelectedItemsIds);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const { latitude, longitude } = selectedPosition;
    const items = selectedItemsIds;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };

    await api.post('points', data);

    alert('Ponto de coleta criado com sucesso');
    history.push('/');
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

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <Map
          center={[initialPosition.latitude, initialPosition.longitude]}
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
              <li
                className={selectedItemsIds.includes(i.id) ? 'selected' : ''}
                key={i.id}
                onClick={() => handleSelectItem(i)}
              >
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
