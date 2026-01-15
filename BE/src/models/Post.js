import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['teammate', 'opponent'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamName: {
        // Optional: If the user is a team captain or we want to allow ad-hoc names
        type: String
    },
    fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field'
    },
    fieldName: {
        type: String, // Fallback purely for display if no field relation
        required: true
    },
    date: {
        type: String, // DD/MM/YYYY or YYYY-MM-DD
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    // Condition 1: Teammate finding
    currentPlayers: {
        type: Number
    },
    neededPlayers: {
        type: Number
    },
    // Condition 2: Opponent finding
    matchType: {
        type: String // e.g., "5vs5", "7vs7"
    },
    competitionLevel: {
        type: String // e.g., "Giao hữu", "Giải đấu"
    },
    skillLevel: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    }
}, {
    timestamps: true
});

const Post = mongoose.model('Post', postSchema);
export default Post;
