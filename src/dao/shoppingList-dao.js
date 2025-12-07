// src/dao/shoppingList-dao.js

import { connectToDatabase } from '../lib/mongo';
import ShoppingListModel from '../models/ShoppingList';
import { v4 as uuidv4 } from 'uuid'; // Need to install this package for UUID generation


/**
 * Ensures database connection and returns a clean DTO-Out object from the Mongoose document.
 * @param {object} doc - Mongoose Document
 * @param {string} command - The uuCmd name (e.g., "shoppingList/createList")
 * @param {string} userId - The ID of the user performing the command
 * @returns {object} The final DTO-Out structure including sys fields
 */
function createDtoOut(doc, command, userId) {
    // Convert Mongoose document to a plain JavaScript object
    const data = doc.toObject({ virtuals: true });
    
    // Clean up internal Mongoose fields (_id, __v)
    delete data._id;
    delete data.__v;
    
    // Generate system fields
    const now = new Date().toISOString();

    const sys = {
        command: command,
        profile: "ListOwner", // Mocked, should come from MOCK_CURRENT_USER
        currentTime: now,
        serverTime: now,
        ...data // Merge remaining data properties (like revision, state, etc.)
    };

    return {
        data: data,
        sys: sys
    };
}


// --- CORE CRUD OPERATIONS ---

/**
 * 1. shoppingList/createList (POST /shoppingLists)
 */
async function create(dtoIn, userId) {
    await connectToDatabase();
    
    const listId = uuidv4(); // Generate a new compliant UUID

    const newList = {
        _id: listId, // Use _id for MongoDB to store the UUID string
        name: dtoIn.name,
        ownerId: userId,
        members: [userId], // Owner is automatically a member
        revision: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        state: 'active',
    };

    const doc = await ShoppingListModel.create(newList);
    
    return createDtoOut(doc, "shoppingList/createList", userId);
}


/**
 * 2. shoppingList/loadList (GET /shoppingLists/:id)
 */
async function getById(dtoIn, userId) {
    await connectToDatabase();
    
    // Find list by its UUID (_id field)
    const doc = await ShoppingListModel.findById(dtoIn.id);

    if (!doc) {
        throw new Error(`List with ID ${dtoIn.id} not found.`);
    }

    // Check authorization: User must be owner or a member
    if (doc.ownerId !== userId && !doc.members.includes(userId)) {
         throw new Error("User is not authorized to view this list.");
    }

    return createDtoOut(doc, "shoppingList/loadList", userId);
}


/**
 * 3. shoppingList/updateListName (PUT /shoppingLists/:id)
 */
async function updateName(dtoIn, userId) {
    await connectToDatabase();

    const update = {
        name: dtoIn.name,
        updatedAt: new Date(),
        $inc: { revision: 1 } // Increment revision counter
    };

    // Find by ID and check if the user is the owner
    const doc = await ShoppingListModel.findOneAndUpdate(
        { _id: dtoIn.id, ownerId: userId },
        update,
        { new: true } // Return the updated document
    );

    if (!doc) {
        throw new Error("List not found or user is not the owner.");
    }
    
    return createDtoOut(doc, "shoppingList/updateListName", userId);
}


/**
 * 4. shoppingList/deleteList (DELETE /shoppingLists/:id)
 */
async function deleteList(dtoIn, userId) {
    await connectToDatabase();

    // Find by ID and check if the user is the owner
    const result = await ShoppingListModel.deleteOne({ 
        _id: dtoIn.id, 
        ownerId: userId 
    });

    if (result.deletedCount === 0) {
        throw new Error("List not found or user is not the owner.");
    }

    // Return the specific DTO-Out for delete
    return {
        data: {
            id: dtoIn.id,
            message: `List ${dtoIn.id} deleted successfully.`
        },
        sys: {
            command: "shoppingList/deleteList",
            profile: "ListOwner",
            currentTime: new Date().toISOString(),
        }
    };
}


/**
 * 5. shoppingList/getActiveLists (GET /shoppingLists/active)
 */
async function listActive(dtoIn, userId) {
    await connectToDatabase();
    
    const { page, limit } = dtoIn;
    const skip = page * limit;

    const query = {
        state: 'active',
        // User must be the owner OR a member
        $or: [{ ownerId: userId }, { members: userId }]
    };

    const [lists, total] = await Promise.all([
        ShoppingListModel.find(query)
            .skip(skip)
            .limit(limit)
            .lean(), // Return plain JavaScript objects
        ShoppingListModel.countDocuments(query)
    ]);
    
    // Manually map MongoDB lists to the required DTO structure
    const itemList = lists.map(list => ({
        id: list._id,
        name: list.name,
        ownerId: list.ownerId,
        state: list.state,
        // Include other fields needed for the list summary
    }));


    return {
        data: {
            pageInfo: {
                page: page,
                limit: limit,
                total: total
            },
            itemList: itemList,
            user: { id: userId, listsCount: total }
        },
        sys: {
            command: "shoppingList/getActiveLists",
            profile: "User",
            currentTime: new Date().toISOString(),
        }
    };
}

// --- New DAO Methods in src/dao/shoppingList-dao.js ---

/**
 * 6. shoppingList/archiveList (PUT /shoppingLists/:id/archive)
 */
async function archiveList(dtoIn, userId) {
    await connectToDatabase();

    const update = {
        state: 'archived',
        updatedAt: new Date(),
        $inc: { revision: 1 } // Increment revision counter
    };

    // Find by ID and check if the user is the owner
    const doc = await ShoppingListModel.findOneAndUpdate(
        { _id: dtoIn.id, ownerId: userId, state: 'active' }, // Only archive active lists
        update,
        { new: true } // Return the updated document
    );

    if (!doc) {
        throw new Error("List not found, is already archived, or user is not the owner.");
    }
    
    return createDtoOut(doc, "shoppingList/archiveList", userId);
}


/**
 * 7. shoppingList/leaveList (POST /shoppingLists/:id/leave)
 */
async function leaveList(dtoIn, userId) {
    await connectToDatabase();

    const doc = await ShoppingListModel.findOne({ _id: dtoIn.id });

    if (!doc) {
        throw new Error(`List with ID ${dtoIn.id} not found.`);
    }

    // Business rule: Owner cannot leave the list
    if (doc.ownerId === userId) {
        throw new Error("List owner cannot leave their own list. Use deleteList instead.");
    }
    
    // Pull (remove) the user from the members array
    const result = await ShoppingListModel.updateOne(
        { _id: dtoIn.id, members: userId }, // Check if user is a member
        { 
            $pull: { members: userId }, 
            updatedAt: new Date(),
            $inc: { revision: 1 }
        }
    );

    if (result.modifiedCount === 0) {
        // This covers the case where the user was not a member
        throw new Error("User is not currently a member of this list or update failed.");
    }

    // Return the specific DTO-Out for leaveList
    return {
        data: {
            listId: dtoIn.id,
            userId: userId,
            message: "Successfully left list."
        },
        sys: {
            command: "shoppingList/leaveList",
            profile: "User",
            currentTime: new Date().toISOString(),
        }
    };
}

// --- MEMBER MANAGEMENT OPERATIONS ---

/**
 * 8. shoppingList/addMember (POST /shoppingLists/:id/members)
 */
async function addMember(dtoIn, userId) {
    await connectToDatabase();
    
    // Authorization check: Must be the owner
    const ownerCheck = await ShoppingListModel.findOne({ _id: dtoIn.id, ownerId: userId });
    
    if (!ownerCheck) {
        throw new Error("List not found or user is not the owner.");
    }
    
    const update = {
        $addToSet: { members: dtoIn.memberId }, // Use $addToSet to prevent duplicates
        updatedAt: new Date(),
        $inc: { revision: 1 }
    };

    const doc = await ShoppingListModel.findOneAndUpdate(
        { _id: dtoIn.id },
        update,
        { new: true }
    );

    if (!doc) {
        throw new Error(`List with ID ${dtoIn.id} not found.`);
    }

    return createDtoOut(doc, "shoppingList/addMember", userId);
}

/**
 * 9. shoppingList/removeMember (DELETE /shoppingLists/:id/members/:memberId)
 */
async function removeMember(dtoIn, userId) {
    await connectToDatabase();
    
    // Check if the user attempting removal is the owner
    const list = await ShoppingListModel.findOne({ _id: dtoIn.id });

    if (!list || list.ownerId !== userId) {
        throw new Error("List not found or user is not the owner.");
    }

    // Business rule: Owner cannot remove themselves
    if (dtoIn.memberId === list.ownerId) {
        throw new Error("Cannot remove the list owner.");
    }

    const result = await ShoppingListModel.updateOne(
        { _id: dtoIn.id, members: dtoIn.memberId }, // Ensure member exists
        { 
            $pull: { members: dtoIn.memberId }, 
            updatedAt: new Date(),
            $inc: { revision: 1 }
        }
    );

    if (result.modifiedCount === 0) {
        throw new Error("Member not found in list or update failed.");
    }
    
    // Return specific DTO-Out
    return {
        data: {
            listId: dtoIn.id,
            removedMemberId: dtoIn.memberId,
            message: "Member removed successfully."
        },
        sys: {
            command: "shoppingList/removeMember",
            profile: "ListOwner",
            currentTime: new Date().toISOString(),
        }
    };
}


// --- ITEM MANAGEMENT OPERATIONS ---

/**
 * 10. shoppingList/addItem (POST /shoppingLists/:id/items)
 */
async function addItem(dtoIn, userId) {
    await connectToDatabase();
    
    // Authorization Check: Must be a member
    const memberCheck = await ShoppingListModel.findOne({ _id: dtoIn.id, members: userId });
    
    if (!memberCheck) {
        throw new Error("List not found or user is not a member.");
    }
    
    const newItem = {
        id: uuidv4(), 
        name: dtoIn.itemName,
        addedBy: userId,
        resolved: false,
    };

    const doc = await ShoppingListModel.findOneAndUpdate(
        { _id: dtoIn.id },
        { 
            $push: { items: newItem }, 
            updatedAt: new Date(),
            $inc: { revision: 1 }
        },
        { new: true }
    );

    // Find the item that was just added to return it in the DTO
    const addedItem = doc.items.find(item => item.id === newItem.id);

    // Return specific DTO-Out
    return {
        data: {
            listId: doc._id,
            item: addedItem
        },
        sys: {
            command: "shoppingList/addItem",
            profile: "ListMember",
            currentTime: new Date().toISOString(),
        }
    };
}

/**
 * 11. shoppingList/resolveItem (PUT /shoppingLists/:id/items/:itemId)
 */
async function resolveItem(dtoIn, userId) {
    await connectToDatabase();
    
    // Authorization Check: Must be a member
    const memberCheck = await ShoppingListModel.findOne({ _id: dtoIn.id, members: userId });

    if (!memberCheck) {
        throw new Error("List not found or user is not a member.");
    }
    
    // Use the array positional operator ($) to update the specific item
    const doc = await ShoppingListModel.findOneAndUpdate(
        { 
            _id: dtoIn.id, 
            'items.id': dtoIn.itemId 
        },
        { 
            $set: { 
                'items.$.resolved': true,
                'items.$.resolvedBy': userId, // Also set the resolvedBy field
            },
            updatedAt: new Date(),
            $inc: { revision: 1 }
        },
        { new: true }
    );

    if (!doc) {
        throw new Error(`List or item ID ${dtoIn.itemId} not found.`);
    }

    const resolvedItem = doc.items.find(item => item.id === dtoIn.itemId);

    // Return specific DTO-Out
    return {
        data: {
            itemId: resolvedItem.id,
            listId: doc._id,
            status: "resolved",
            resolvedBy: userId
        },
        sys: {
            command: "shoppingList/resolveItem",
            profile: "ListMember",
            currentTime: new Date().toISOString(),
        }
    };
}

/**
 * 12. shoppingList/removeItem (DELETE /shoppingLists/:id/items/:itemId)
 */
async function removeItem(dtoIn, userId) {
    await connectToDatabase();
    
    // Authorization Check: Must be a member
    const memberCheck = await ShoppingListModel.findOne({ _id: dtoIn.id, members: userId });

    if (!memberCheck) {
        throw new Error("List not found or user is not a member.");
    }
    
    // Use $pull to remove the item from the embedded array
    const result = await ShoppingListModel.updateOne(
        { _id: dtoIn.id },
        { 
            $pull: { items: { id: dtoIn.itemId } }, 
            updatedAt: new Date(),
            $inc: { revision: 1 }
        }
    );

    if (result.modifiedCount === 0) {
        throw new Error("Item not found in list or update failed.");
    }
    
    // Return specific DTO-Out for removeItem
    return {
        data: {
            itemId: dtoIn.itemId,
            listId: dtoIn.id,
            message: "Item removed."
        },
        sys: {
            command: "shoppingList/removeItem",
            profile: "ListMember",
            currentTime: new Date().toISOString(),
        }
    };
}

// --- LIST RETRIEVAL ---

/**
 * 13. shoppingList/getArchivedLists (GET /shoppingLists/archived)
 */
async function listArchived(dtoIn, userId) {
    await connectToDatabase();
    
    const { page, limit } = dtoIn;
    const skip = page * limit;

    const query = {
        state: 'archived',
        $or: [{ ownerId: userId }, { members: userId }]
    };

    const [lists, total] = await Promise.all([
        ShoppingListModel.find(query)
            .skip(skip)
            .limit(limit)
            .lean(),
        ShoppingListModel.countDocuments(query)
    ]);
    
    const itemList = lists.map(list => ({
        id: list._id,
        name: list.name,
        ownerId: list.ownerId,
        state: list.state,
    }));


    return {
        data: {
            pageInfo: {
                page: page,
                limit: limit,
                total: total
            },
            itemList: itemList,
            user: { id: userId, listsCount: total }
        },
        sys: {
            command: "shoppingList/getArchivedLists",
            profile: "User",
            currentTime: new Date().toISOString(),
        }
    };
}



const shoppingListDao = {
    create,
    getById,
    updateName,
    deleteList,
    listActive,
    archiveList,
    leaveList,
    addMember,
    removeMember,
    addItem,
    resolveItem,
    removeItem,
    listArchived,
};

// --- Export the DAO object as the module default ---
export default shoppingListDao;