// src/pages/api/shoppingLists/[listId]/members/[memberId].js (OPRAVENO)

import { endpointHandler } from '../../../../../lib/handler';
import { RemoveMemberDtoIn } from '../../../../../lib/schemas';
import shoppingListDao from '../../../../../dao/shoppingList-dao';

const REQUIRED_PROFILE = "ListOwner"; 

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    // 1. Namapujte listId (z URL) na klíč 'id', který Zod očekává v DtoIn.
    req.query.id = req.query.listId; 
    
    // 2. KLÍČOVÝ ŘÁDEK: memberId je již v req.query, takže ho nemusíte znovu mapovat
    // a HLAVNĚ ho nesmíte mazat.
    
    // 3. Odstraňte pouze původní klíč 'listId'
    delete req.query.listId; 
    // 🛑 NEODSTRAŇUJTE req.query.memberId!
    
    await endpointHandler(
      req,
      res,
      RemoveMemberDtoIn, 
      REQUIRED_PROFILE, 
      async (dtoIn, userId) => {
        // ... (zde volání DAO)
        const dtoOut = await shoppingListDao.removeMember(dtoIn, userId); 
        return dtoOut;
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}