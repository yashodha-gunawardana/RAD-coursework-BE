import multer from "multer";

const storage = multer.memoryStorage()

const fileFilter = (req: any, file: any, cb: multer.FileFilterCallback) => {
    // Allow no file (optional image)
    if (!file) {
        return cb(null, true)
    }

    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype)
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop() || '')

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error("Only image files allowed (jpg, png, gif, webp)"))
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
})


// add error handling middleware
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {

        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ 
                message: "File too large (max 5MB)" 
            })
        }
    }

    if (err.message.includes("Only image files")) {
        return res.status(400).json({ 
            message: err.message 
        })
    }
    
    console.error("Multer error:", err)
    res.status(500).json({ 
        message: "File upload error" 
    })
}

export const uploadImage = upload.single("image")


