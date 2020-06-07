import express from 'express';
import knex from './database/connection';

const routes = express.Router();

routes.get('/items', async (request, response) => {
  const items = await knex('Item').select('*');
  const serializedItems = items.map(i => {
    return {
      title: i.title,
      image_url: `http://localhost:3333/assets/${i.image}`,
    }
  })

  return response.json(serializedItems);
})

export default routes;