// src/pages/api/shoppingLists/[listId]/items.js (UPDATED)

import { endpointHandler } from '../../../../lib/handler';
import { AddItemDtoIn } from '../../../../lib/schemas';
import shoppingListDao from '../../../../dao/shoppingList-dao';

const REQUIRED_PROFILE = "ListMember"; 

export default async function handler(req, res) {
  if (req.method === 'POST') {
    req.query.id = req.query.listId; 
    delete req.query.listId; 

    await endpointHandler(
      req,
      res,
      AddItemDtoIn, // Schema requires ID (URL) and itemName (Body)
      REQUIRED_PROFILE,
      async (dtoIn, userId) => {
        const dtoOut = await shoppingListDao.addItem(dtoIn, userId);
        return dtoOut;
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}