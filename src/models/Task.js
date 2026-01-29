import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Task name is required'],
        trim: true,
    },
    order: {
        type: Number,
        required: true,
    },
    instance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instance',
        required: [true, 'Instance is required'],
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assignee is required'],
    },
}, {
    timestamps: true,
});

// Index for faster queries
taskSchema.index({ instance: 1, order: 1 });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
