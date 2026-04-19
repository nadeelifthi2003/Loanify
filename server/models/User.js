const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['customer', 'officer', 'admin', 'manager'],
            default: 'customer',
        },
        status: {
            type: String,
            enum: ['active', 'disabled', 'pending'],
            default: 'active',
        },
        branch: {
            type: String,
            default: 'Head Office',
        },
        department: {
            type: String,
            default: 'Operations',
        },
        phone: {
            type: String,
            default: '',
        },
        notes: {
            type: String,
            default: '',
        },
        permissions: {
            type: [String],
            default: [],
        },
        lastActiveAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
