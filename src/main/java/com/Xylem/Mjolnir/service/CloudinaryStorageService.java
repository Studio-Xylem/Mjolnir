package com.Xylem.Mjolnir.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryStorageService {
    private final Cloudinary cloudinary;

    public CloudinaryStorageService(@Value("${cloudinary.url:}") String cloudinaryUrl) {
        this.cloudinary = cloudinaryUrl.isBlank() ? null : new Cloudinary(cloudinaryUrl);
    }

    public String store(MultipartFile file, String folder) {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary is not configured. Set CLOUDINARY_URL.");
        }
        if (file.isEmpty()) throw new IllegalArgumentException("Uploaded file is empty");
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "image",
                    "folder", folder == null || folder.isBlank() ? "mjolnir/posts" : "mjolnir/" + folder));
            return String.valueOf(result.get("secure_url"));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to upload image to Cloudinary", exception);
        }
    }
}