// src/pages/api/shoppingLists/[listId]/leave.js (UPDATED)

import { endpointHandler } from '../../../../lib/handler';
import { ListIdOnlyDtoIn } from '../../../../lib/schemas';
import shoppingListDao from '../../../../dao/shoppingList-dao'; // <<< IMPORT DAO

const REQUIRED_PROFILE = "User"; 

export default async function handler(req, res) {
  if (req.method === 'POST') {
    req.query.id = req.query.listId; 
    delete req.query.listId; 

    await endpointHandler(
      req,
      res,
      ListIdOnlyDtoIn, 
      REQUIRED_PROFILE,
      async (dtoIn, userId) => { // <<< async callback
        const dtoOut = await shoppingListDao.leaveList(dtoIn, userId); // <<< DAO CALL
        return dtoOut;
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}