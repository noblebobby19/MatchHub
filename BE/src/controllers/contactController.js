import Contact from '../models/Contact.js';
import Notification from '../models/Notification.js';

// @desc    Create new contact message
// @route   POST /api/contacts
// @access  Private
export const createContact = async (req, res) => {
    try {
        const { subject, content } = req.body;

        const contact = await Contact.create({
            user: req.user._id,
            subject,
            content
        });

        res.status(201).json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private/Admin
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find()
            .populate('user', 'name email phone avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Reply to contact message
// @route   PUT /api/contacts/:id/reply
// @access  Private/Admin
export const replyContact = async (req, res) => {
    try {
        const { replyMessage } = req.body;
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        contact.replyMessage = replyMessage;
        contact.status = 'replied';
        await contact.save();

        // Create notification for user
        await Notification.create({
            user: contact.user,
            title: 'Phản hồi liên hệ từ Admin',
            message: `Admin đã trả lời tin nhắn: "${contact.subject}". Nội dung: ${replyMessage}`,
            type: 'info',
            link: '/profile' // Or specific contact view if available
        });

        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete contact message
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await contact.deleteOne();

        res.json({
            success: true,
            message: 'Contact removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
