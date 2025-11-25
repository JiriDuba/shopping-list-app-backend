// src/lib/schemas.js

import { z } from "zod";

// --- Base Types for Reusability ---

const listIdSchema = z.uuid({ invalid_type_error: "List ID must be a valid UUID" });
const itemIdSchema = z.uuid({ invalid_type_error: "Item ID must be a valid UUID" });
const userIdSchema = z.uuid({ invalid_type_error: "User ID must be a valid UUID" });

const nameSchema = z.string().min(3, "Name must be at least 3 characters").max(255);
const pageInfoSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// --- Group 1: Global/User Commands ---

// shoppingList/createList (POST /shoppingLists)
export const CreateListDtoIn = z.object({
  name: nameSchema,
});

// shoppingList/getActiveLists & shoppingList/getArchivedLists (GET /shoppingLists/active)
export const GetListsDtoIn = pageInfoSchema;

// --- Group 2: List Owner Commands (Requires Contextual Auth) ---

// All ListOwner commands require the list ID
const ListContextSchema = z.object({
  id: listIdSchema,
});

// shoppingList/updateListName (PUT /shoppingLists/:id/name)
export const UpdateListNameDtoIn = ListContextSchema.extend({
  name: nameSchema,
});

// shoppingList/archiveList (PUT /shoppingLists/:id/archive)
// shoppingList/loadList (GET /shoppingLists/:id)
// shoppingList/leaveList (POST /shoppingLists/:id/leave)
export const ListIdOnlyDtoIn = ListContextSchema;

// shoppingList/addMember (POST /shoppingLists/:id/members)
export const AddMemberDtoIn = ListContextSchema.extend({
  memberId: userIdSchema,
});

// shoppingList/removeMember (DELETE /shoppingLists/:id/members/:memberId)
export const RemoveMemberDtoIn = ListContextSchema.extend({
  memberId: userIdSchema,
});

// --- Group 3: List Member Commands (Item Management) ---

// shoppingList/addItem (POST /shoppingLists/:id/items)
export const AddItemDtoIn = ListContextSchema.extend({
  itemName: nameSchema,
});

// shoppingList/resolveItem (PUT /shoppingLists/:id/items/:itemId/resolve)
// shoppingList/removeItem (DELETE /shoppingLists/:id/items/:itemId)
export const ItemActionDtoIn = ListContextSchema.extend({
  itemId: itemIdSchema,
});