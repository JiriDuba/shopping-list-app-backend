// src/models/ShoppingList.js

// Importujte přímo mongoose, ne váš soubor mongo.js, 
// aby byla jistota, že máte přístup ke třídě Schema
const mongoose = require('mongoose'); 
const { Schema } = mongoose;

// 1. Schéma pro jednotlivé položky
const ItemSchema = new Schema({
    id: { type: String, required: true }, 
    name: { type: String, required: true, trim: true },
    addedBy: { type: String, required: true }, 
    resolved: { type: Boolean, default: false }, 
});

// 2. Hlavní schéma nákupního seznamu
const ShoppingListSchema = new Schema({
    _id: { type: String, required: true }, 
    name: { type: String, required: true, trim: true },
    ownerId: { type: String, required: true }, 
    members: { type: [String], default: [] }, 
    items: { type: [ItemSchema], default: [] },
    state: { type: String, enum: ['active', 'archived'], default: 'active' }, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    revision: { type: Number, default: 1 } 
}, 
{ toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtuální vlastnost pro mapování _id na id
ShoppingListSchema.virtual('id').get(function() {
    return this._id;
});

const ShoppingListModel = mongoose.models.ShoppingList || mongoose.model('ShoppingList', ShoppingListSchema);

// CommonJS export
module.exports = ShoppingListModel;