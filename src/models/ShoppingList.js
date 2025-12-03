// src/models/ShoppingList.js

import mongoose from '../lib/mongo'; // Use the exported mongoose instance

const { Schema } = mongoose;

// 1. Schema for individual items (e.g., "Milk")
const ItemSchema = new Schema({
    // Store the item ID as a raw string for simplicity and UUID compatibility
    id: { type: String, required: true }, 
    name: { type: String, required: true, trim: true },
    addedBy: { type: String, required: true }, // User ID (UUID string)
    // Use an explicit Boolean for status (true = resolved/purchased)
    resolved: { type: Boolean, default: false }, 
});

// 2. Schema for the main Shopping List
const ShoppingListSchema = new Schema({
    // The list ID, matching your DTO-in UUID
    _id: { type: String, required: true }, 
    name: { type: String, required: true, trim: true },
    ownerId: { type: String, required: true }, // User ID (UUID string)
    
    // An array of user IDs (UUID strings) who are members of the list
    members: { type: [String], default: [] }, 
    
    // Embed the items directly in the list document
    items: { type: [ItemSchema], default: [] },
    
    // Current state (e.g., "active", "archived")
    state: { type: String, enum: ['active', 'archived'], default: 'active' }, 
    
    // Metadata for tracking
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    revision: { type: Number, default: 1 } // Used for optimistic locking/tracking changes
}, 
// Add a virtual property for a generic 'id' to match DTOs, even though MongoDB uses _id
{ toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual property to map _id to id for DTO compliance
ShoppingListSchema.virtual('id').get(function() {
    return this._id;
});


// Mongoose model instance. Use the cached version if available.
const ShoppingListModel = mongoose.models.ShoppingList || mongoose.model('ShoppingList', ShoppingListSchema);

export default ShoppingListModel;