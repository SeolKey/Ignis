package com.Ignis.search;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Ignis.search.domain.SearchResult;
import com.Ignis.search.bo.SearchBO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchRestController {

    private final SearchBO searchService;

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam(name = "q", defaultValue = "") String q,
            @RequestParam(name = "types", required = false) List<String> types,
            @RequestParam(name = "fulltext", defaultValue = "false") boolean useFulltext,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        SearchBO.Page<SearchResult> result = searchService.search(q, types, useFulltext, page, size);
        return ResponseEntity.ok(Map.of(
                "content", result.content,
                "total", result.total,
                "page", result.page,
                "size", result.size
        ));
    }
}


