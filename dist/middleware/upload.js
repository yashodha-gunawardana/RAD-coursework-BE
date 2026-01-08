"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.handleMulterError = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Allow no file (optional image)
    if (!file) {
        return cb(null, true);
    }
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop() || '');
    if (mimetype && extname) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image files allowed (jpg, png, gif, webp)"));
    }
};
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
});
// Add error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large (max 5MB)" });
        }
    }
    if (err.message.includes("Only image files")) {
        return res.status(400).json({ message: err.message });
    }
    console.error("Multer error:", err);
    res.status(500).json({ message: "File upload error" });
};
exports.handleMulterError = handleMulterError;
exports.uploadImage = upload.single("image");
