import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: (req, file) => {
            // My spacial.Image!@.png
            const fileName = file.originalname
                .toLocaleLowerCase()
                .replace(/\s+/g, "-") // Remove empty space use "-"
                .replace(/\./g, "-")
                // eslint-disable-next-line no-useless-escape
                .replace(/[^a-z0-9\-\.]/g, "") // remove special character !@#$

            const extension = file.originalname.split(".").pop() // png
            const uniqueFileName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileName + "." + extension
            return uniqueFileName

        }
    }
})

export const multerUpload = multer({
    storage: storage
})

