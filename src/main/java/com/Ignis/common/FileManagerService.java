package com.Ignis.common;

import com.Ignis.common.upload.UploadCategory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FileManagerService {
    private final Path baseDirPath;
    private final String baseUrl;
    private final Set<String> allowedExt;

    public FileManagerService(
            @Value("${upload.base-dir}") String baseDir,
            @Value("${upload.base-url:/uploads}") String baseUrl,
            @Value("${upload.allowed-ext:}") String allowedExtCsv
    ) {
        this.baseDirPath = Paths.get(baseDir).toAbsolutePath().normalize();
        this.baseUrl = trimTrailingSlash(baseUrl);
        if (StringUtils.hasText(allowedExtCsv)) {
            this.allowedExt = Arrays.stream(allowedExtCsv.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());
        } else {
            this.allowedExt = Collections.emptySet();
        }
        createDirectoryIfNotExists(this.baseDirPath);
        log.info("FileManagerService initialized. baseDir={}, baseUrl={}, allowedExt={}",
                this.baseDirPath, this.baseUrl, this.allowedExt);
    }

    public String saveFile(UploadCategory category, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        // 확장자 검증
        String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "");
        String ext = getExtension(originalName);
        if (!ext.isEmpty() && !allowedExt.isEmpty() && !allowedExt.contains(ext.toLowerCase())) {
            throw new IOException("허용되지 않은 확장자입니다: " + ext);
        }

        // 날짜 경로
        LocalDate today = LocalDate.now();
        String y = String.format("%04d", today.getYear());
        String m = String.format("%02d", today.getMonthValue());
        String d = String.format("%02d", today.getDayOfMonth());

        // 저장 디렉토리: baseDir/category/yyyy/MM/dd
        Path targetDir = baseDirPath
                .resolve(category.dirName())
                .resolve(y).resolve(m).resolve(d)
                .normalize();
        createDirectoryIfNotExists(targetDir);

        // 파일명
        String safeExt = ext.isEmpty() ? "" : "." + ext.toLowerCase();
        String filename = UUID.randomUUID().toString().replaceAll("-", "") + safeExt;
        Path targetFile = targetDir.resolve(filename).normalize();

        // === 실제 저장 (로컬 디스크) ===
        file.transferTo(targetFile.toFile());

        // === 만약 S3로 전환한다면, 여기를 S3 putObject 로 교체하고, 아래에서 S3 URL을 조합해 반환하면 됨 ===
        // TODO: if (useS3) { s3Client.putObject(bucket, key, file.getInputStream(), metadata); return s3Url; }

        // 접근 URL 조합
        String url = buildPublicUrl(category, y, m, d, filename);
        log.debug("Saved file: {} -> {}", targetFile, url);
        return url;
    }

    /**
     * URL 기준으로 실제 파일 삭제 (내부 정적경로 사용하는 경우에만)
     * S3 사용 시에는 S3 키로 변환 후 삭제 로직 구현 필요
     */
    public boolean deleteByUrl(String fileUrl) {
        try {
            if (!StringUtils.hasText(fileUrl)) return false;

            // 내부 정적 URL (/uploads/...)만 매핑
            if (baseUrl.startsWith("/") && fileUrl.startsWith(baseUrl + "/")) {
                String rel = fileUrl.substring((baseUrl + "/").length()); // e.g. "funding/2025/09/20/uuid.jpg"
                Path target = baseDirPath.resolve(rel).normalize();
                return Files.deleteIfExists(target);
            }
        } catch (Exception e) {
            log.warn("deleteByUrl failed: {}", fileUrl, e);
        }
        return false;
    }

    private String buildPublicUrl(UploadCategory category, String y, String m, String d, String filename) {
        // baseUrl이 /uploads 처럼 내부 경로면: /uploads/{category}/yyyy/MM/dd/filename
        // baseUrl이 https://... 처럼 외부 도메인이면: https://.../{category}/yyyy/MM/dd/filename
        String prefix = trimTrailingSlash(baseUrl);
        return prefix + "/" + category.dirName() + "/" + y + "/" + m + "/" + d + "/" + filename;
    }

    private static void createDirectoryIfNotExists(Path dir) {
        try {
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }
        } catch (IOException e) {
            throw new RuntimeException("디렉토리 생성 실패: " + dir, e);
        }
    }

    private static String trimTrailingSlash(String s) {
        if (!StringUtils.hasText(s)) return s;
        if (s.endsWith("/")) return s.substring(0, s.length() - 1);
        return s;
    }

    private static String getExtension(String name) {
        if (!StringUtils.hasText(name)) return "";
        int i = name.lastIndexOf('.');
        if (i < 0 || i == name.length() - 1) return "";
        String ext = name.substring(i + 1);
        // 보안상 확장자에 이상 문자 제거
        return ext.replaceAll("[^A-Za-z0-9]", "");
    }
}
