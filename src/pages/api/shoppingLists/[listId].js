// src/pages/api/shoppingLists/[listId].js (UPDATED)

import { endpointHandler } from '../../../lib/handler';
import { ListIdOnlyDtoIn, UpdateListNameDtoIn } from '../../../lib/schemas';
import shoppingListDao from '../../../dao/shoppingList-dao'; // <<< IMPORT DAO

export default async function handler(req, res) {
  // Merge the URL parameter (listId) into the request query
  req.query.id = req.query.listId; 
  delete req.query.listId; 

  switch (req.method) {
    // --- shoppingList/loadList (GET) ---
    case 'GET':
      await endpointHandler(
        req,
        res,
        ListIdOnlyDtoIn,
        "User",
        async (dtoIn, userId) => { // <<< async callback
          const dtoOut = await shoppingListDao.getById(dtoIn, userId); // <<< DAO CALL
          return dtoOut;
        }
      );
      break;

    // --- shoppingList/updateListName (PUT) ---
    case 'PUT':
      await endpointHandler(
        req,
        res,
        UpdateListNameDtoIn,
        "ListOwner",
        async (dtoIn, userId) => { // <<< async callback
          const dtoOut = await shoppingListDao.updateName(dtoIn, userId); // <<< DAO CALL
          return dtoOut;
        }
      );
      break;
      
    // --- shoppingList/deleteList (DELETE) ---
    case 'DELETE':
      await endpointHandler(
        req,
        res,
        ListIdOnlyDtoIn,
        "ListOwner",
        async (dtoIn, userId) => { // <<< async callback
          const dtoOut = await shoppingListDao.deleteList(dtoIn, userId); // <<< DAO CALL
          return dtoOut;
        }
      );
      break;
    
    default:
      res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
      break;
  }
}