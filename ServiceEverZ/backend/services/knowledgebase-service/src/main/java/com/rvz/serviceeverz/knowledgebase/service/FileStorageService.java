package com.rvz.serviceeverz.knowledgebase.service;
 
import com.rvz.serviceeverz.knowledgebase.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
 
@Service
public class FileStorageService {
 
    private static final long MAX_PDF_BYTES   = 50L * 1024 * 1024;
    private static final long MAX_VIDEO_BYTES = 500L * 1024 * 1024;
 
    @Value("${kb.upload.dir:uploads/kb}")
    private String uploadDir;
 
    public String storePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("PDF file is required.");
        if (!"application/pdf".equalsIgnoreCase(file.getContentType()))
            throw new BadRequestException("Only PDF files allowed.");
        if (file.getSize() > MAX_PDF_BYTES)
            throw new BadRequestException("PDF exceeds 50 MB limit.");
        return store(file, "pdf");
    }
 
    public String storeVideo(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("Video file is required.");
        String mime = file.getContentType();
        if (mime == null || !mime.startsWith("video/"))
            throw new BadRequestException("Only video files allowed.");
        if (file.getSize() > MAX_VIDEO_BYTES)
            throw new BadRequestException("Video exceeds 500 MB limit.");
        return store(file, "video");
    }
 
    private String store(MultipartFile file, String subDir) {
        try {
            Path dir = Paths.get(uploadDir, subDir);
            Files.createDirectories(dir);
            String ext = getExt(file.getOriginalFilename());
            String filename = UUID.randomUUID() + ext;
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return subDir + "/" + filename;
        } catch (IOException e) {
            throw new BadRequestException("File storage failed: " + e.getMessage());
        }
    }
 
    private String getExt(String name) {
        if (name == null || !name.contains(".")) return "";
        return name.substring(name.lastIndexOf("."));
    }
}
 