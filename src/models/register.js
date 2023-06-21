const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

employeeSchema.methods.generateAuthToken = async function(){
  try {
   const token = await jwt.sign({_id:this._id.toString()},  process.env.SECRET_KEY);
   this.tokens = this.tokens.concat({token})
   await this.save();
   return token
  } catch (error) {
    res.send(error)
    console.log(error);
    
  }
}

employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmpassword = await bcrypt.hash(this.confirmpassword, 10);
    console.log(`This is Hashing Password ${this.password}`);
    console.log(`This is Confirm Hashing password${this.confirmpassword}`);
  }
  next();
});

const Register = new mongoose.model("Project", employeeSchema);
module.exports = Register;
