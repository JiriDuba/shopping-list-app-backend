// src/pages/api/shoppingLists/[listId]/members/[memberId].js

// Změna na require pro zajištění kompatibility s upraveným DAO
const { endpointHandler } = require('../../../../../lib/handler');
const { RemoveMemberDtoIn } = require('../../../../../lib/schemas');
const shoppingListDao = require('../../../../../dao/shoppingList-dao');

const REQUIRED_PROFILE = "ListOwner"; 

async function handler(req, res) {
  if (req.method === 'DELETE') {
    // Mapování URL parametrů do DtoIn
    req.query.id = req.query.listId; 
    req.query.memberId = req.query.memberId; 
    delete req.query.listId; 
    delete req.query.memberId; 

    await endpointHandler(
      req,
      res,
      RemoveMemberDtoIn, 
      REQUIRED_PROFILE, 
      async (dtoIn, userId) => {
        // Volání DAO metody
        const dtoOut = await shoppingListDao.removeMember(dtoIn, userId); 
        return dtoOut;
      }
    );
  } else {
    res.status(405).json({ code: "method-not-allowed", message: `${req.method} method not allowed.` });
  }
}

module.exports = handler;