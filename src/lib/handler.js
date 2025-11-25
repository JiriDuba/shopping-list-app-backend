// src/lib/handler.js

import { ZodError } from 'zod';

/**
 * Mocks the authenticated user's profile and ID.
 * In a real application, this would come from a JWT or session.
 */
const MOCK_CURRENT_USER = {
  id: "u-a1b2c3d4e5f6g7h8i9j0", // Example UUID for the current authenticated user
  profile: "ListOwner", // We'll assume the current user is a ListOwner for testing
};

/**
 * Middleware that handles input parsing, Zod validation, and mock authorization.
 * * @param {object} req - Next.js/Express Request object
 * @param {object} res - Next.js/Express Response object
 * @param {object} schema - The Zod schema (DtoIn) to use for validation
 * @param {string} requiredProfile - The profile required for this command (User, ListOwner, ListMember)
 * @param {function} callback - The actual function that executes the business logic (in this case, echoing input)
 */
export async function endpointHandler(req, res, schema, requiredProfile, callback) {
  // 1. Merge and Prepare Input (dtoIn)
  let dtoIn = {};
  
  // GET and DELETE requests often use query parameters
  if (req.method === 'GET' || req.method === 'DELETE') {
    // Note: We are mocking URL parameters (like /:id) as req.query 
    dtoIn = { ...req.query };
  } 
  // POST and PUT requests use the body
  else if (req.method === 'POST' || req.method === 'PUT') {
    dtoIn = { ...req.query, ...req.body };
  }
  
  // 2. Authorization Check (Mock)
  const { profile, id: userId } = MOCK_CURRENT_USER;

  if (profile !== requiredProfile) {
    // This is a simple mock auth check. A real app would check permission roles more robustly.
    return res.status(403).json({
      code: "uu-app-authorization-error",
      message: `Profile '${profile}' does not have permission for '${requiredProfile}' command.`,
    });
  }

  // 3. Validation (Zod)
  try {
    // Validate the combined input object
    const validatedDtoIn = schema.parse(dtoIn);

    // 4. Execute Logic (Echo Input)
    const dtoOut = callback(validatedDtoIn, userId);
    
    // 5. Success Response (DtoOut must include received input data)
    return res.status(200).json(dtoOut);

  } catch (error) {
    // 6. Error Handling
    if (error instanceof ZodError) {
      // Zod Validation Error
      return res.status(400).json({
        code: "uu-app-input-validation-error",
        message: "Input validation failed.",
        paramMap: error.formErrors.fieldErrors,
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

/**
 * Generates the mock DtoOut structure.
 */
export function generateDtoOut(dtoIn, userId, command) {
  return {
    // Echo back the received, validated input
    data: dtoIn, 
    // Mock system fields for 'uuApp' style responses
    sys: {
      cts: new Date().toISOString(), // Current Timestamp
      uuIdentity: userId,
      command: command,
    },
    // Indicate success
    error: null, 
  };
}