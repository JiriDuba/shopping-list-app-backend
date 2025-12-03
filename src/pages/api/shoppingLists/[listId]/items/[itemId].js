// src/pages/api/shoppingLists/[listId]/items/[itemId].js (UPDATED)

import { endpointHandler } from '../../../../../lib/handler';
import { ItemActionDtoIn } from '../../../../../lib/schemas'; // Assuming ItemActionDtoIn exists

export default async function handler(req, res) {
  // Map the two URL parameters into the single DtoIn object: id and itemId
  req.query.id = req.query.listId;
  req.query.itemId = req.query.itemId;
  delete req.query.listId;
  
  switch (req.method) {
    // --- shoppingList/resolveItem (PUT) ---
    case 'PUT':
      await endpointHandler(
        req,
        res,
        ItemActionDtoIn, 
        "ListMember", 
        async (dtoIn, userId) => {
          const dtoOut = await shoppingListDao.resolveItem(dtoIn, userId);
          return dtoOut;
        }
      );
      break;
    
    // --- shoppingList/removeItem (DELETE) ---
    case 'DELETE':
      await endpointHandler(
        req,
        res,
        ItemActionDtoIn, 
        "ListMember", 
        async (dtoIn, userId) => {
          const dtoOut = await shoppingListDao.removeItem(dtoIn, userId);
          return dtoOut;
        }
      );
      break;
    
    default:
        res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
        break;
  }
}