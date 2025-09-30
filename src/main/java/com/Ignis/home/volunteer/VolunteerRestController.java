package com.Ignis.home.volunteer;

import com.Ignis.common.FileManagerService;
import com.Ignis.common.upload.UploadCategory;
import com.Ignis.home.volunteer.bo.VolunteerBO;
import com.Ignis.home.volunteer.domain.Volunteer;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/volunteer")
public class VolunteerRestController {

    @Autowired
    private VolunteerBO volunteerBO;

    @Autowired
    private FileManagerService fileManagerService;

    // ------------------------------
    // 1) 생성 (기존 HTML/폼용) - userId 파라미터 직접 전달
    // ------------------------------
    @PostMapping("/create")
    public ResponseEntity<?> createVolunteer(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam("startTime") String startTime,
            @RequestParam("endTime") String endTime,
            @RequestParam("maxParticipants") int maxParticipants,
            @RequestParam(value = "file", required = false) MultipartFile imageFile,
            HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("result","실패","error","UNAUTHORIZED"));
        }

        int rowCount = volunteerBO.addVolunteer(
                userId, title, description, location, startTime, endTime, maxParticipants, imageFile);

        return (rowCount > 0)
                ? ResponseEntity.ok(Map.of("code",1,"result","성공"))
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("code",500,"errorMessage","DB 저장 실패"));
    }


    // ------------------------------
    // 2) 목록 (React용)
    // ------------------------------
    @GetMapping("/react/list")
    public Map<String, Object> apiVolunteerList() {
        List<Volunteer> list = volunteerBO.getVolunteerList();
        return Map.of("volunteerList", list != null ? list : Collections.emptyList());
    }

    // ------------------------------
    // 3) 상세 (React용)
    // ------------------------------
    @GetMapping("/react/detail/{id}")
    public ResponseEntity<?> apiVolunteerDetail(@PathVariable("id") Long id) {
        Volunteer v = volunteerBO.getVolunteerById(id);
        if (v == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("result", "실패", "error", "NOT_FOUND"));
        }
        return ResponseEntity.ok(Map.of("result", "성공", "data", v));
    }

    // ------------------------------
    // 4) 생성 (React용 멀티파트/폼)
    // ------------------------------
    @PostMapping(value = "/react/create",
            consumes = { MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> apiVolunteerCreate(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam("startTime") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam("endTime") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime,
            @RequestParam("maxParticipants") Integer maxParticipants,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "currentPeople", required = false, defaultValue = "0") Integer currentPeople,
            HttpSession session) {

        try {
            Long userId = (Long) session.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("result", "실패", "error", "UNAUTHORIZED"));
            }

            if (isBlank(title) || isBlank(description) || isBlank(location)
                    || startTime == null || endTime == null || maxParticipants == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("result", "실패", "error", "필수 값 누락 또는 형식 오류"));
            }

            String imageUrl;
            try {
                if (file != null && !file.isEmpty()) {
                    imageUrl = fileManagerService.saveFile(UploadCategory.VOLUNTEER, file);
                } else {
                    // DB가 NOT NULL이면 기본 이미지로 방어
                    imageUrl = "/uploads/common/default.png";
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("result", "실패", "error", "이미지 저장 실패: " + e.getMessage()));
            }


            Volunteer v = new Volunteer();
            v.setUserId(userId);
            v.setTitle(title);
            v.setDescription(description);
            v.setLocation(location);
            v.setImagePath(imageUrl);
            v.setStartTime(startTime);
            v.setEndTime(endTime);
            v.setMaxParticipants(maxParticipants);
            v.setCurrentPeople(currentPeople != null ? currentPeople : 0);
            v.setStatus("PENDING"); // 승인 플로우가 있다면 이후에 바꾸기
            v.setCreatedAt(LocalDateTime.now());
            v.setUpdatedAt(LocalDateTime.now());

            // ✅ 실제 insert 수행 (PK 세팅됨)
            Long newId = volunteerBO.createVolunteerFromReact(v);

            Map<String, Object> body = new HashMap<>();
            body.put("result", "성공");
            body.put("id", newId);
            return ResponseEntity.ok(body);

        } catch (org.springframework.dao.DataIntegrityViolationException die) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("result", "실패", "error",
                            "데이터 제약 위반: " + die.getMostSpecificCause().getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("result", "실패", "error",
                            e.getMessage() != null ? e.getMessage() : "SERVER_ERROR"));
        }
    }

    // =========================================================
    // 5) 참여하기 / 취소 / 내 참여 여부
    // =========================================================
    @PostMapping("/{id}/join")
    public ResponseEntity<?> join(@PathVariable("id") Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("result", "실패", "error", "UNAUTHORIZED"));
        }
        try {
            volunteerBO.joinVolunteer(id, userId);
            return ResponseEntity.ok(Map.of("result", "성공"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("result", "실패", "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("result", "실패", "error", "SERVER_ERROR"));
        }
    }

    @DeleteMapping("/{id}/join")
    public ResponseEntity<?> cancel(@PathVariable("id") Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("result", "실패", "error", "UNAUTHORIZED"));
        }
        try {
            volunteerBO.cancelVolunteer(id, userId);
            return ResponseEntity.ok(Map.of("result", "성공"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("result", "실패", "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("result", "실패", "error", "SERVER_ERROR"));
        }
    }

    @GetMapping("/{id}/join/me")
    public Map<String, Object> joined(@PathVariable("id") Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        boolean joined = (userId != null) && volunteerBO.isJoined(id, userId);
        return Map.of("joined", joined);
    }

    // ------------------------------
    // 내부 유틸
    // ------------------------------
    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    // ✅ 참여 인원 목록 (작성자·관리자만)
    @GetMapping("/{id}/participants")
    public ResponseEntity<?> participants(@PathVariable("id") Long id, HttpSession session) {
        Long me = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");

        Volunteer v = volunteerBO.getVolunteerById(id);
        if (v == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error","NOT_FOUND"));
        }

        boolean isOwner = me != null && me.equals(v.getUserId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        if (!(isOwner || isAdmin)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error","FORBIDDEN"));
        }

        return ResponseEntity.ok(volunteerBO.getParticipantList(id));
    }
}
