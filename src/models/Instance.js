import mongoose from 'mongoose';

const instanceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Instance name is required'],
        trim: true,
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: [true, 'Template is required'],
    },
}, {
    timestamps: true,
});

const Instance = mongoose.models.Instance || mongoose.model('Instance', instanceSchema);

export default Instance;
