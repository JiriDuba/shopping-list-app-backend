// src/pages/api/shoppingLists/active.js (UPDATED)

import { endpointHandler } from '../../../lib/handler';
import { GetListsDtoIn } from '../../../lib/schemas';
import shoppingListDao from '../../../dao/shoppingList-dao'; // <<< IMPORT DAO

const REQUIRED_PROFILE = "User"; 

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await endpointHandler(
      req,
      res,
      GetListsDtoIn, 
      REQUIRED_PROFILE,
      async (dtoIn, userId) => { // <<< async callback
        const dtoOut = await shoppingListDao.listActive(dtoIn, userId); // <<< DAO CALL
        return dtoOut;
      }
    );
  } else {
    res.status(405).json({ 
        code: "method-not-allowed", 
        message: `${req.method} method not allowed for this command.` 
    });
  }
}