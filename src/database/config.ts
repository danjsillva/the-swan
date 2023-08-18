import mongoose from "mongoose";

const connectMongo = async () =>
  mongoose.connect(process.env.DATABASE_URL as string);

export default connectMongo;
