import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;
  
    const transaction = await knex.transaction();
  
    const point = {
      name,
      image: 'placeholder',
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    }

    const ids = await transaction('Point').insert(point);
  
    const pointItems = items.map((item_id: number) => {
      return { 
        item_id,
        point_id: ids[0],
      };
    })
  
    await transaction('Point_Item').insert(pointItems);

    transaction.commit();

    return response.json({
      id: ids[0],
      ...point,
    }); 
  }
}

export default PointsController;