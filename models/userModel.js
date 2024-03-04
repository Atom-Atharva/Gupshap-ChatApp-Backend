import mongoose from "mongoose";
const userModel = mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      image:{
        type: String,
        default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      }
    },
    {
      timeStamp: true,
    }
  );
  
const User = mongoose.model("User", userModel);
module.exports = User;