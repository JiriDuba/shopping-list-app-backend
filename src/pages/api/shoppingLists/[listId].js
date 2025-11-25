// src/pages/api/shoppingLists/[listId].js

import { endpointHandler, generateDtoOut } from '../../../lib/handler';
import { ListIdOnlyDtoIn, UpdateListNameDtoIn } from '../../../lib/schemas';

// This handler will route to the correct command based on the HTTP method

export default async function handler(req, res) {
  // Merge the URL parameter (listId) into the request query
  // This allows the handler to treat it as part of dtoIn
  req.query.id = req.query.listId; 
  delete req.query.listId; // Clean up the original name

  switch (req.method) {
    // --- shoppingList/loadList ---
    case 'GET':
      await endpointHandler(
        req,
        res,
        ListIdOnlyDtoIn, // Schema only requires the ID
        "User", // Actor: User/ListMember
        (dtoIn, userId) => {
          const COMMAND = "shoppingList/loadList";
          
          // Mocking a detailed list object
          const mockDtoOut = {
            id: dtoIn.id,
            name: "Current List Name",
            state: "active",
            ownerId: "u-a1b2c3d4e5f6g7h8i9j0",
            members: ["u-a1b2c3d4e5f6g7h8i9j0", "u-member-123"],
            items: [
              { id: "i-001", name: "Milk", resolved: false },
              { id: "i-002", name: "Eggs", resolved: true }
            ]
          };

          return generateDtoOut(mockDtoOut, userId, COMMAND);
        }
      );
      break;

    // --- shoppingList/updateListName ---
    case 'PUT':
      await endpointHandler(
        req,
        res,
        UpdateListNameDtoIn, // Schema requires ID and Name (from body)
        "ListOwner", // Actor: ListOwner
        (dtoIn, userId) => {
          const COMMAND = "shoppingList/updateListName";

          // Mocking the successful rename response
          const mockDtoOut = {
            id: dtoIn.id,
            name: dtoIn.name, // Echo the new name
            revision: 2 
          };

          return generateDtoOut(mockDtoOut, userId, COMMAND);
        }
      );
      break;
    // --- shoppingList/deleteList ---
      case 'DELETE':
      await endpointHandler(
        req,
        res,
        ListIdOnlyDtoIn, // Schema only requires the ID
        "ListOwner", // Actor: ListOwner
        (dtoIn, userId) => {
          const COMMAND = "shoppingList/deleteList";

          // Mocking the successful deletion response
          const mockDtoOut = {
            id: dtoIn.id,
            message: `List ${dtoIn.id} deleted successfully.`
          };

          return generateDtoOut(mockDtoOut, userId, COMMAND);
        }
      );
      break;

    default:
      res.status(405).json({
        code: "method-not-allowed",
        message: `${req.method} method not allowed for this path.`
      });
  }
}