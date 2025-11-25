// src/pages/api/shoppingLists/[listId]/members.js

import { endpointHandler, generateDtoOut } from '../../../../lib/handler';
import { AddMemberDtoIn } from '../../../../lib/schemas';

const COMMAND = "shoppingList/addMember";
const REQUIRED_PROFILE = "ListOwner"; 

export default async function handler(req, res) {
  if (req.method === 'POST') {
    req.query.id = req.query.listId; 
    delete req.query.listId; 

    await endpointHandler(
      req,
      res,
      AddMemberDtoIn, // Schema requires ID (URL) and memberId (Body)
      REQUIRED_PROFILE,
      (dtoIn, userId) => {
        const mockDtoOut = {
            listId: dtoIn.id,
            addedMemberId: dtoIn.memberId, // Echo back memberId
            membersCount: 4 // Mock count
        };
        return generateDtoOut(mockDtoOut, userId, COMMAND);
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}