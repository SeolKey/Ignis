package com.Ignis.common;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileManagerService {

    // 프로젝트 루트 기준으로 static 디렉토리 설정
    private final String FILE_UPLOAD_PATH = new File("src/main/resources/static/images/funding").getAbsolutePath() + "/";

    public String saveFile(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;

        // 고유한 파일 이름 생성
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // 디렉토리 생성 (없으면 생성)
        File dir = new File(FILE_UPLOAD_PATH);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 저장 대상 파일 객체 생성
        File dest = new File(FILE_UPLOAD_PATH + fileName);

        try {
            // 실제 파일 저장
            file.transferTo(dest);
            // Web 경로 반환 (브라우저에서 접근할 수 있는 URL)
            return "/images/funding/" + fileName;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
