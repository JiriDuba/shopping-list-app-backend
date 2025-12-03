// src/pages/api/shoppingLists/[listId]/members.js

import { endpointHandler } from '../../../../lib/handler';
import { AddMemberDtoIn } from '../../../../lib/schemas';
import shoppingListDao from '../../../../dao/shoppingList-dao';

const REQUIRED_PROFILE = "ListOwner"; 

export default async function handler(req, res) {
  if (req.method === 'POST') {
    req.query.id = req.query.listId; 
    delete req.query.listId; 

    await endpointHandler(
      req,
      res,
      AddMemberDtoIn, 
      REQUIRED_PROFILE,
      async (dtoIn, userId) => {
        const dtoOut = await shoppingListDao.addMember(dtoIn, userId); 
        return dtoOut;
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}