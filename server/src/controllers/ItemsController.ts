import { Request, Response } from "express";
import knex from "../database/connection";

class ItemsController {
  async index(request: Request, response: Response) {
    const items = await knex("Item").select("*");
    const serializedItems = items.map((i) => {
      return {
        id: i.id,
        title: i.title,
        image_url: `http://192.168.0.17:3333/assets/${i.image}`,
      };
    });

    return response.json(serializedItems);
  }
}

export default ItemsController;
