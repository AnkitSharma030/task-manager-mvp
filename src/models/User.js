import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        select: false, // Don't include password by default in queries
    },
    role: {
        type: String,
        enum: ['Admin', 'Member'],
        default: 'Member',
    },
}, {
    timestamps: true,
});

// Prevent model overwrite error in development
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
