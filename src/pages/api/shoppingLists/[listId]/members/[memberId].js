// src/pages/api/shoppingLists/[listId]/members/[memberId].js

import { endpointHandler, generateDtoOut } from '../../../../../lib/handler';
import { RemoveMemberDtoIn } from '../../../../../lib/schemas';

const COMMAND = "shoppingList/removeMember";
const REQUIRED_PROFILE = "ListOwner"; 

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    // Map URL parameters into DtoIn: listId -> id, memberId -> memberId
    req.query.id = req.query.listId; 
    req.query.memberId = req.query.memberId; 
    delete req.query.listId; // Keep the original listId cleanup

    await endpointHandler(
      req,
      res,
      RemoveMemberDtoIn, 
      REQUIRED_PROFILE, 
      (dtoIn, userId) => {
        const mockDtoOut = {
            listId: dtoIn.id,
            removedMemberId: dtoIn.memberId, 
            membersCount: 2 
        };
        return generateDtoOut(mockDtoOut, userId, COMMAND);
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}