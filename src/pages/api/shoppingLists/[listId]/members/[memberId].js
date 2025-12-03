// src/pages/api/shoppingLists/[listId]/members/[memberId].js (UPDATED)

import { endpointHandler } from '../../../../../lib/handler';
import { RemoveMemberDtoIn } from '../../../../../lib/schemas';
import shoppingListDao from '../../../../../dao/shoppingList-dao';

const REQUIRED_PROFILE = "ListOwner"; 

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    // Map URL parameters into DtoIn: listId -> id, memberId -> memberId
    req.query.id = req.query.listId; 
    req.query.memberId = req.query.memberId; 
    delete req.query.listId; 
    delete req.query.memberId; 

    await endpointHandler(
      req,
      res,
      RemoveMemberDtoIn, 
      REQUIRED_PROFILE, 
      async (dtoIn, userId) => {
        const dtoOut = await shoppingListDao.removeMember(dtoIn, userId); 
        return dtoOut;
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}