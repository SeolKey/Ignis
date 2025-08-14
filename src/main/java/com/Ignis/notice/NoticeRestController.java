package com.Ignis.notice;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.Ignis.notice.bo.NoticeBO;
import com.Ignis.notice.domain.Notice;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notice")
@RequiredArgsConstructor
public class NoticeRestController {

    private final NoticeBO noticeBO;

    @PostMapping("/create")
    public Map<String, Object> createNotice(
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        HttpSession session
    ) {
        Map<String, Object> result = new HashMap<>();

        Long userIdLong = (Long) session.getAttribute("userId");
        if (userIdLong == null) {
            result.put("code", 401);
            result.put("error", "로그인 필요");
            return result;
        }

        Notice notice = new Notice();
        notice.setTitle(title);
        notice.setContent(content);
        notice.setUserId(userIdLong.intValue());

        noticeBO.createNotice(notice);
        result.put("result", "성공");
        return result;
    }


    @PostMapping("/edit")
    public Map<String, Object> updateNotice(@RequestBody Notice notice) {
        Map<String, Object> result = new HashMap<>();
        noticeBO.updateNotice(notice);
        result.put("result", "성공");
        return result;
    }
    //테스트 중
        //여기에 추가
    // ================== React 전용 JSON 엔드포인트 (기존 뷰 라우트와 충돌 방지) ==================
        //여기에 추가
    // ✅ React 전용 공지 생성(JSON 응답) - POST /notice/react/create
    @PostMapping("/react/create")
    public Map<String, Object> createNoticeReact(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            HttpSession session
    ) {
        Map<String, Object> result = new HashMap<>();

        Long userIdLong = (Long) session.getAttribute("userId");
        if (userIdLong == null) {
            result.put("code", 401);
            result.put("error", "로그인 필요");
            return result;
        }

        Notice notice = new Notice();
        notice.setTitle(title);
        notice.setContent(content);
        notice.setUserId(userIdLong.intValue());

        noticeBO.createNotice(notice);
        result.put("result", "성공");
        return result;
    }



    // ✅ 공지 목록(JSON): GET /notice/react/list
    @GetMapping("/react/list")
    public Map<String, Object> getNoticeListReact() {
        Map<String, Object> result = new HashMap<>();
        // BO 메서드명은 프로젝트에 맞게 사용 (여기선 getNoticeList 가 있다고 가정)
        java.util.List<Notice> list = noticeBO.getNoticeList();
        result.put("noticeList", list);
        return result;
    }

    // ✅ 공지 상세(JSON): GET /notice/react/detail/{id}
    @GetMapping("/react/detail/{id}")
    public Map<String, Object> getNoticeDetailReact(@PathVariable("id") Integer id) {
        Map<String, Object> result = new HashMap<>();
        // 단건 조회
        Notice notice = noticeBO.getNoticeById(id);
        if (notice == null) {
            result.put("code", 404);
            result.put("error", "존재하지 않는 공지입니다.");
            return result;
        }
        result.put("notice", notice);
        return result;
    }

    // ✅ 공지 수정(JSON/폼): POST /notice/react/edit/{id}
    //    x-www-form-urlencoded: title, content
    @PostMapping("/react/edit/{id}")
    public Map<String, Object> updateNoticeByIdReact(
            @PathVariable("id") Integer id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            HttpSession session
    ) {
        Map<String, Object> result = new HashMap<>();

        // (정책 동일) 로그인 체크
        Long userIdLong = (Long) session.getAttribute("userId");
        if (userIdLong == null) {
            result.put("code", 401);
            result.put("error", "로그인 필요");
            return result;
        }

        // 기존 데이터 조회
        Notice notice = noticeBO.getNoticeById(id);
        if (notice == null) {
            result.put("code", 404);
            result.put("error", "존재하지 않는 공지입니다.");
            return result;
        }

        // 값 반영
        notice.setTitle(title);
        notice.setContent(content);
        notice.setUserId(userIdLong.intValue()); // 필요 시 작성자/수정자 정책에 맞게 유지

        // 수정 반영
        noticeBO.updateNotice(notice);

        result.put("result", "성공");
        result.put("id", id);
        return result;
    }

}
