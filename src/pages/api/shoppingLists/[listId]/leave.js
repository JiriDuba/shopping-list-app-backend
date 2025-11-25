// src/pages/api/shoppingLists/[listId]/leave.js

import { endpointHandler, generateDtoOut } from '../../../../lib/handler';
import { ListIdOnlyDtoIn } from '../../../../lib/schemas';

const COMMAND = "shoppingList/leaveList";
const REQUIRED_PROFILE = "User"; // ListMember rights are often treated as authenticated User rights

export default async function handler(req, res) {
  if (req.method === 'POST') {
    req.query.id = req.query.listId; 
    delete req.query.listId; 

    await endpointHandler(
      req,
      res,
      ListIdOnlyDtoIn, 
      REQUIRED_PROFILE,
      (dtoIn, userId) => {
        const mockDtoOut = {
            listId: dtoIn.id,
            userId: userId,
            message: "Successfully left list."
        };
        return generateDtoOut(mockDtoOut, userId, COMMAND);
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}