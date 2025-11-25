// src/pages/api/shoppingLists/active.js

import { endpointHandler, generateDtoOut } from '../../../lib/handler';
import { GetListsDtoIn } from '../../../lib/schemas';

const COMMAND = "shoppingList/getActiveLists";
const REQUIRED_PROFILE = "User"; 

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await endpointHandler(
      req,
      res,
      GetListsDtoIn, // Uses schema for pagination (page, limit)
      REQUIRED_PROFILE,
      (dtoIn, userId) => {
        // --- APPLICATION LOGIC MOCK ---
        // Mock a list of active shopping lists owned/joined by the user.
        const mockList = { id: "a1b2-active-list", name: "Current Shopping List" };
        
        const dtoOutData = {
          pageInfo: {
            ...dtoIn, // Echo back pagination input
            total: 10 // Mock total count
          },
          itemList: [mockList],
          // Additional mock metadata
          user: { id: userId, listsCount: 3 } 
        };

        return generateDtoOut(dtoOutData, userId, COMMAND);
      }
    );
  } else {
    res.status(405).json({ 
        code: "method-not-allowed", 
        message: `${req.method} method not allowed for this command.` 
    });
  }
}