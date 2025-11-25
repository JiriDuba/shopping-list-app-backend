// src/pages/api/shoppingLists/archived.js

import { endpointHandler, generateDtoOut } from '../../../lib/handler';
import { GetListsDtoIn } from '../../../lib/schemas';

const COMMAND = "shoppingList/getArchivedLists"; // <--- CHANGE
const REQUIRED_PROFILE = "User"; 

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await endpointHandler(
      req,
      res,
      GetListsDtoIn, 
      REQUIRED_PROFILE,
      (dtoIn, userId) => {
        // --- APPLICATION LOGIC MOCK ---
        // Mock a list of archived shopping lists.
        const mockList = { id: "c1d2-archived-list", name: "Old Xmas Shopping List" };
        
        const dtoOutData = {
          pageInfo: {
            ...dtoIn, 
            total: 2 // Mock total count
          },
          itemList: [mockList],
          user: { id: userId, listsCount: 2 } 
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