// src/pages/api/shoppingLists/[listId]/items/[itemId].js

import { endpointHandler, generateDtoOut } from '../../../../../lib/handler';
import { ItemActionDtoIn } from '../../../../../lib/schemas';

// This handler covers two commands: resolveItem (PUT) and removeItem (DELETE)

export default async function handler(req, res) {
  // Map the two URL parameters into the single DtoIn object: id and itemId
  req.query.id = req.query.listId;
  req.query.itemId = req.query.itemId;
  delete req.query.listId;
  
  switch (req.method) {
    // --- shoppingList/resolveItem ---
    case 'PUT':
      await endpointHandler(
        req,
        res,
        ItemActionDtoIn, 
        "ListMember", // Actor: ListMember
        (dtoIn, userId) => {
          const COMMAND = "shoppingList/resolveItem";

          const mockDtoOut = {
            itemId: dtoIn.itemId,
            listId: dtoIn.id,
            status: "resolved",
            resolvedBy: userId
          };
          return generateDtoOut(mockDtoOut, userId, COMMAND);
        }
      );
      break;
    
    // --- shoppingList/removeItem ---
    case 'DELETE':
      await endpointHandler(
        req,
        res,
        ItemActionDtoIn, 
        "ListMember", // Actor: ListMember
        (dtoIn, userId) => {
          const COMMAND = "shoppingList/removeItem";

          const mockDtoOut = {
            itemId: dtoIn.itemId,
            listId: dtoIn.id,
            message: "Item removed."
          };
          return generateDtoOut(mockDtoOut, userId, COMMAND);
        }
      );
      break;

    default:
      res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}