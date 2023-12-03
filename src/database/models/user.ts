import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  login: String,
  password: String,
  role: String,
});

const User = models.User || model("User", userSchema);

export default User;
