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
    tasks: {
        type: [String],
        required: [true, 'At least one task is required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one task is required',
        },
    },
}, {
    timestamps: true,
});

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

export default Template;
