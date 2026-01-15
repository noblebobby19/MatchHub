import JoinRequest from '../models/JoinRequest.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// Create Join Request
export const createRequest = async (req, res) => {
    try {
        const { postId, name, phone, skillLevel, description } = req.body;

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if pending request exists
        const existingPending = await JoinRequest.findOne({
            post: postId,
            user: req.user._id,
            status: 'pending'
        });
        if (existingPending) {
            return res.status(400).json({ message: 'Bạn đã gửi yêu cầu tham gia rồi. Vui lòng chờ phản hồi.' });
        }

        // Check if user is already a member (accepted request)
        const existingMember = await JoinRequest.findOne({
            post: postId,
            user: req.user._id,
            status: 'accepted'
        });
        if (existingMember) {
            return res.status(400).json({ message: 'Bạn đã gia nhập đội rồi' });
        }

        // Check for rejected request cooldown (1 hour)
        const lastRejected = await JoinRequest.findOne({
            post: postId,
            user: req.user._id,
            status: 'rejected'
        }).sort({ updatedAt: -1 });

        if (lastRejected) {
            const oneHour = 60 * 60 * 1000;
            const timeDiff = Date.now() - new Date(lastRejected.updatedAt).getTime();

            if (timeDiff < oneHour) {
                const minutesLeft = Math.ceil((oneHour - timeDiff) / 60000);
                return res.status(400).json({
                    message: `Yêu cầu trước đó đã bị từ chối. Vui lòng chờ ${minutesLeft} phút nữa để gửi lại.`
                });
            }
        }

        const request = await JoinRequest.create({
            post: postId,
            user: req.user._id,
            name,
            phone,
            skillLevel,
            description
        });

        // Create Notification for Post Owner
        const notificationTitle = post.type === 'opponent' ? 'Lời thách đấu mới' : 'Yêu cầu tham gia mới';
        const notificationMessage = post.type === 'opponent'
            ? `${name} muốn thách đấu với đội của bạn: ${post.teamName || 'Tin tìm đối thủ'}`
            : `${name} muốn tham gia đội của bạn: ${post.teamName || 'Tin tìm người'}`;
        const notificationLink = post.type === 'opponent'
            ? `/chi-tiet-doi-thu/${post._id}`
            : `/chi-tiet-bai-dang/${post._id}`;

        await Notification.create({
            user: post.user,
            title: notificationTitle,
            message: notificationMessage,
            type: 'info',
            link: notificationLink
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Accept/Reject Request
export const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        const request = await JoinRequest.findById(req.params.id).populate('post');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Prevent double actions
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        // Update status
        request.status = status;
        await request.save();

        // If Accepted, update Post counts
        if (status === 'accepted') {
            const post = await Post.findById(request.post._id);
            if (post) {
                // Ensure neededPlayers doesn't go below 0
                if (post.neededPlayers > 0) {
                    post.neededPlayers -= 1;
                }
                // Always increment currentPlayers when accepting a new member, even if full
                post.currentPlayers += 1;

                if (post.neededPlayers === 0) {
                    post.status = 'closed'; // Status field should exist in Post model
                }
                await post.save();
            }
        }

        // Notification to Requester
        let title, message;
        if (request.post.type === 'opponent') {
            title = status === 'accepted' ? 'Lời thách đấu được chấp nhận!' : 'Lời thách đấu bị từ chối';
            message = status === 'accepted'
                ? `Đối thủ đã chấp nhận lời thách đấu của bạn cho trận: ${request.post.teamName || ''}.`
                : `Đối thủ đã từ chối lời thách đấu của bạn cho trận: ${request.post.teamName || ''}.`;
        } else {
            title = status === 'accepted' ? 'Yêu cầu được chấp nhận!' : 'Yêu cầu bị từ chối';
            message = status === 'accepted'
                ? `Chúc mừng! Bạn đã được nhận vào đội ${request.post.teamName || ''}.`
                : `Rất tiếc, yêu cầu tham gia đội ${request.post.teamName || ''} của bạn đã bị từ chối.`;
        }

        const link = request.post.type === 'opponent'
            ? `/chi-tiet-doi-thu/${request.post._id}`
            : `/chi-tiet-bai-dang/${request.post._id}`;

        await Notification.create({
            user: request.user,
            title: title,
            message: message,
            type: status === 'accepted' ? 'success' : 'warning',
            link: link
        });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get User Notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'Marked all as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
