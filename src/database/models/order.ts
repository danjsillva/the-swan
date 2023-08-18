import { Schema, model, models } from "mongoose";

const orderSchema = new Schema({
  date: Date,
  noteNumber: String,
  broker: String,
  currency: String,
  stockExchange: String,
  type: String,
  ticker: String,
  quantity: Number,
  price: Number,
  fees: Number,
  fileName: String,
  fileText: String,
  fileBuffer: Buffer,
});

const Order = models.Order || model("Order", orderSchema);

export default Order;
