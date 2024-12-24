import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getRecieversocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password")

        res.status(200)
        .json(filteredUsers)

    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(400)
        .json({
            message: "Internal Server Error"
        })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: senderId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: senderId}
            ]
        })
        res.status(200)
        .json(messages)
    } catch (error) {
        console.log("Error in getMessages: ", error.message);
        res.status(400)
        .json({
            message: "Internal Server Error"
        })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Validate required fields
        if (!receiverId || (!text && !image)) {
            return res.status(400).json({
                message: "Receiver ID and at least one of text or image are required.",
            });
        }

        let imageUrl = null;

        // If image is provided, upload to Cloudinary
        if (image) {
            if (typeof image !== 'string') {
                return res.status(400).json({ message: "Invalid image format." });
            }
        
            // Decode base64 to calculate size
            const sizeInBytes = (image.length * (3 / 4)) - (image.includes('=') ? 2 : 0);
            const sizeInMB = sizeInBytes / (1024 * 1024);
        
            if (sizeInMB > 5) { // Example: 5MB limit
                return res.status(400).json({ message: "Image size exceeds the 5MB limit." });
            }
        
            try {
                const uploadedResponse = await cloudinary.uploader.upload(image, {
                    folder: "messages",
                });
                imageUrl = uploadedResponse.secure_url;
            } catch (error) {
                console.error("Cloudinary upload failed:", error);
                return res.status(500).json({ message: "Failed to upload image." });
            }
        }        
        // Create a new message
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Real-time functionality goes here
        const receiverSocketId = getRecieversocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage Controller:", error.message, error.stack);
        res.status(500).json({
            message: "An internal server error occurred.",
        });
    }
};