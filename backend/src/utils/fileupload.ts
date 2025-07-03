import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from 'fs-extra';
import { Request } from 'express';

const uploadDir = path.join(process.cwd(), 'uploads');
const avatarDir = path.join(uploadDir, 'avatars');
const projectDir = path.join(uploadDir, 'projects');


fs.ensureDirSync(avatarDir);
fs.ensureDirSync(projectDir);


const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = uploadDir;
        if (file.fieldname === 'avatar') {
            uploadPath = avatarDir;
        }
        else if (file.fieldname === 'projectImages') {
            uploadPath = projectDir;
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

export const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fieldSize: 5 * 1024 * 1024, //5GB
        files: 5,
    }
});

export const getFileUrl = (filename: string, type: 'avatar' | 'project'): string => {
    const baseUrl = process.env.API_URL || 'http://localhost:3001';
    const folder = type === 'avatar' ? 'avatars' : 'projects';
    return `${baseUrl}/uploads/${folder}/${filename}`;
};

export const deleteFile = (filePath: string): void => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File deleted: ${filePath}`);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

export const getFilePath = (filename: string, type: 'avatar' | 'project'): string => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    const folder = type === 'avatar' ? 'avatars' : 'projects';
    return path.join(uploadDir, folder, filename);
};

export const processUploadedImage = async (
    file: Express.Multer.File, 
    type: 'avatar' | 'project'
): Promise<{ filePath: string; fileUrl: string }> => {
    try {
        let processedPath: string;
        
        if (type === 'avatar') {
            processedPath = await ImageProcessor.processAvatar(file.path);
        } else {
            processedPath = await ImageProcessor.processProjectImage(file.path);
        }
        
        const filename = path.basename(processedPath);
        const fileUrl = getFileUrl(filename, type);
        
        return { filePath: processedPath, fileUrl };
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};

export const deleteMultipleFiles = (filePaths: string[]): void => {
    filePaths.forEach(filePath => {
        deleteFile(filePath);
    });
};
export const getUploadErrorMessage = (error: any): string => {
    return handleMulterError(error);
};

export class ImageProcessor {
    static async processAvatar(filePath: string): Promise<string> {
        const outputPath = filePath.replace(/\.[^/.]+$/, '-processed.jpg');

        await sharp(filePath)
            .resize(200, 200, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({
                quality: 90,
                progressive: true
            })
            .toFile(outputPath);

        return outputPath;

    }

    static async processProjectImage(filePath: string): Promise<string> {
        const outputPath = filePath.replace(/\.[^/.]+$/, '-processed.jpg');

        await sharp(filePath)
            .resize(800, 600, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 85,
                progressive: true
            })
            .toFile(outputPath);

        await fs.remove(filePath);

        return outputPath;
    }

    static getPublicUrl(filePath: string): string {
        const relativePath = path.relative(process.cwd(), filePath);
        return `${process.env.API_URL || 'http://localhost:3001'}/${relativePath.replace(/\\g/, '/')} `;
    }
}

export const handleMulterError = (error: any) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return 'File too large. Maximum size is 5MB.';
            case 'LIMIT_FILE_COUNT':
                return 'Too many files. Maximum is 5 files.';
            case 'LIMIT_UNEXPECTED_FILE':
                return 'Unexpected file field.';
            default:
                return 'File upload error.';
        }
    }
    return error.message || 'Unknown upload error.';
};