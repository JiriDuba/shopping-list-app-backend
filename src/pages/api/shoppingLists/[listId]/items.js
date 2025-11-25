// src/pages/api/shoppingLists/[listId]/items.js

import { endpointHandler, generateDtoOut } from '../../../../lib/handler';
import { AddItemDtoIn } from '../../../../lib/schemas';

const COMMAND = "shoppingList/addItem";
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
      (dtoIn, userId) => {
        const mockNewItemId = "i-55555555-4444-3333-2222-111111111111";

        const mockDtoOut = {
            listId: dtoIn.id,
            item: {
                id: mockNewItemId,
                name: dtoIn.itemName, // Echo back input name
                addedBy: userId
            }
        };
        return generateDtoOut(mockDtoOut, userId, COMMAND);
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}