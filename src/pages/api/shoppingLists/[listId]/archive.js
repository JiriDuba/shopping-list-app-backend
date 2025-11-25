// src/pages/api/shoppingLists/[listId]/archive.js

import { endpointHandler, generateDtoOut } from '../../../../lib/handler';
import { ListIdOnlyDtoIn } from '../../../../lib/schemas';

const COMMAND = "shoppingList/archiveList";
const REQUIRED_PROFILE = "ListOwner"; 

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    req.query.id = req.query.listId; 
    delete req.query.listId; 

    await endpointHandler(
      req,
      res,
      ListIdOnlyDtoIn, // Schema only requires the ID
      REQUIRED_PROFILE,
      (dtoIn, userId) => {
        const mockDtoOut = {
            id: dtoIn.id,
            state: "archived",
            updatedBy: userId
        };
        return generateDtoOut(mockDtoOut, userId, COMMAND);
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}