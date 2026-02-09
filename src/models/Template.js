import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    tasks: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            required: true,
            enum: ['Marketer', 'Reviewer', 'Designer', 'Member']
        },
        order: {
            type: Number,
            required: true
        }
    }],
}, {
    timestamps: true,
});

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

export default Template;
