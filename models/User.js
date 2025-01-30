const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For password hashing

// Define the User schema
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    // subscription: {
    //   type: {
    //     type: String,
    //     enum: ['FreeTrial', 'Organization'],
    //   },
    //   startDate: { type: Date }, // Date when the subscription starts
    // },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Pre-save hook to hash the password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if the password isn't modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); // Hash password
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords during authentication
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error('Error comparing passwords');
  }
};

module.exports = mongoose.model('User', UserSchema);
