// src/lib/handler.js

import { ZodError } from 'zod';

/**
 * Mocks the authenticated user's profile and ID.
 * Set the default profile to "User" for general commands.
 */
const MOCK_CURRENT_USER = {
  id: "u-a1b2c3d4e5f6g7h8i9j0", // Example UUID for the current authenticated user
  profile: "User" // Default profile for initial testing
};

/**
 * Middleware that handles input parsing, Zod validation, and mock authorization.
 * * @param {object} req - Next.js/Express Request object
 * @param {object} res - Next.js/Express Response object
 * @param {object} schema - The Zod schema (DtoIn) to use for validation
 * @param {string} requiredProfile - The profile required for this command (User, ListOwner, ListMember)
 * @param {function} callback - The actual ASYNCHRONOUS function that executes the business logic
 */
export async function endpointHandler(req, res, schema, requiredProfile, callback) {
  const { id: userId, profile } = MOCK_CURRENT_USER;

  // 1. Merge and Prepare Input (dtoIn)
  let dtoIn = {};
  
  // GET and DELETE requests often use query parameters
  if (req.method === 'GET' || req.method === 'DELETE') {
    dtoIn = { ...req.query };
  } 
  // POST and PUT requests use the body
  else if (req.method === 'POST' || req.method === 'PUT') {
    dtoIn = { ...req.body, ...req.query };
  }

  // 2. Authorization Check (Mock)
  if (profile !== requiredProfile) {
    return res.status(403).json({
      code: "uu-app-authorization-error",
      message: `Profile '${profile}' does not have permission for '${requiredProfile}' command.`,
    });
  }

  // 3. Validation (Zod)
  try {
    const validatedDtoIn = schema.parse(dtoIn);

    // 4. Execute Logic (MUST BE AWAITED for database calls)
    const dtoOut = await callback(validatedDtoIn, userId);
    
    // 5. Success Response
    return res.status(200).json(dtoOut);

  } catch (error) {
    // 6. Error Handling
    if (error instanceof ZodError) {
      
      // Manually map Zod issues to the required { field: [messages] } structure
      const fieldErrors = {};
      error.issues.forEach(issue => {
          // Get the top-level field name from the path (e.g., ['id'] -> 'id')
          const fieldName = issue.path[0]; 
          if (fieldName) {
              if (!fieldErrors[fieldName]) {
                  fieldErrors[fieldName] = [];
              }
              fieldErrors[fieldName].push(issue.message);
          }
      });
      
      // Zod Validation Error (Return 400 Bad Request)
      return res.status(400).json({
        code: "uu-app-input-validation-error",
        message: "Input validation failed.",
        paramMap: fieldErrors, // Use the manually constructed object
        error: error.issues,
      });
    }

    // Generic Internal Error
    return res.status(500).json({
      code: "uu-app-internal-server-error",
      message: "An unexpected error occurred.",
      error: error.message, 
    });
  }
}