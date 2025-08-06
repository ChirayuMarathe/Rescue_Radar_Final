// Image Upload API Route
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: './public/uploads',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // Ensure upload directory exists
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    
    // TODO: Integrate your existing image upload logic here
    // This could include cloud storage (AWS S3, Cloudinary, etc.)
    
    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalFilename || '');
    const filename = `${timestamp}_${randomString}${extension}`;
    const newPath = path.join(uploadDir, filename);

    // Move file to final location
    fs.renameSync(file.filepath, newPath);

    const imageUrl = `/uploads/${filename}`;

    res.status(200).json({
      success: true,
      image_url: imageUrl,
      filename: filename,
      size: file.size
    });
    
  } catch (error) {
    console.error('Image Upload Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload image' 
    });
  }
}
