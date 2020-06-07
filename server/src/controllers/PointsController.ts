import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items} = request.query;
    const parsedItems = String(items).split(',').map(i => Number(i.trim()));

    const points = await knex('Point')
      .join('Point_Item', 'Point.id', '=', 'Point_Item.point_id')
      .whereIn('Point_Item.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('Point.*');
    
    return response.json(points);
  }
  
  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('Point').where('id', id).first();

    if(!point) {
      return response.status(400).json({ message: 'Point not found' });
    }

    const items = await knex('Item')
      .join('Point_Item', 'Item.id', '=', 'Point_Item.item_id')
      .where('Point_Item.point_id', id)
      .select('Item.*');

    return response.json({point, items});
  }

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
    
    try {
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
  
      await transaction.commit();
  
      return response.json({
        id: ids[0],
        ...point,
      });
    } catch (error) {
      transaction.rollback();
      return response.status(400).json({message: 'Error when creating', error })
    }
  }
}

export default PointsController;