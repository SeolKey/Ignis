package com.Ignis.search;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.Ignis.search.domain.SearchResult;
import com.Ignis.search.bo.SearchBO;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchBO searchBO;

    @GetMapping
    public String search(
            @RequestParam(name = "q", defaultValue = "") String q,
            @RequestParam(name = "types", required = false) List<String> types,
            @RequestParam(name = "fulltext", defaultValue = "false") boolean useFulltext,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            Model model
    ) {
        SearchBO.Page<SearchResult> result = searchBO.search(q, types, useFulltext, page, size);

        // ---- 페이징 값을 모두 서버에서 계산 (템플릿에서는 산술 X) ----
        int total = result.total;
        int totalPages = Math.max(1, (total + result.size - 1) / result.size); // 정수 올림
        int lastIndex = totalPages - 1;
        int prevPage = (page > 0) ? page - 1 : 0;
        int nextPage = (page < lastIndex) ? page + 1 : lastIndex;
        boolean hasPrev = page > 0;
        boolean hasNext = page < lastIndex;
        int currentPageDisplay = page + 1; // 사람 눈에 보이는 페이지

        // 0..lastIndex 페이지 인덱스 리스트
        List<Integer> pageNumbers = new ArrayList<>();
        if (lastIndex >= 0) {
            IntStream.rangeClosed(0, lastIndex).forEach(pageNumbers::add);
        }

        model.addAttribute("query", q);
        model.addAttribute("results", result.content);
        model.addAttribute("total", total);
        model.addAttribute("page", page);
        model.addAttribute("size", result.size);

        // 페이징 관련 추가 속성들
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("lastIndex", lastIndex);
        model.addAttribute("prevPage", prevPage);
        model.addAttribute("nextPage", nextPage);
        model.addAttribute("hasPrev", hasPrev);
        model.addAttribute("hasNext", hasNext);
        model.addAttribute("pageNumbers", pageNumbers);
        model.addAttribute("currentPageDisplay", currentPageDisplay);

        return "search/searchResults";
    }
}
