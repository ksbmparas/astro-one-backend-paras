const mongoose = require("mongoose");

const PoojaItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    items: [
      {
        itemName: { type: String },
        itemImage: { type: String },
        itemPrice: { type: Number },
        payment: { 
          type: String, 
          enum: ["add", "deduct"], 
          required: true          
        },
      },
    ],
  },
  { timestamps: true }
);

const PoojaItem = mongoose.model("PoojaItem", PoojaItemSchema);

module.exports = PoojaItem;
