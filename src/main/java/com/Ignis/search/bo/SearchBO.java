package com.Ignis.search.bo;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.Ignis.search.domain.SearchResult;
import com.Ignis.search.mapper.SearchMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SearchBO {

    private final SearchMapper searchMapper;

    public static class Page<T> {
        public final List<T> content;
        public final int total;
        public final int page;
        public final int size;

        public Page(List<T> content, int total, int page, int size) {
            this.content = content;
            this.total = total;
            this.page = page;
            this.size = size;
        }
    }

    public Page<SearchResult> search(
            String q,
            List<String> types,
            boolean useFulltext,
            int page,
            int size
    ) {
        if (q == null) q = "";
        if (types == null) types = Collections.emptyList();
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 10;
        int offset = page * size;

        int total = searchMapper.countAll(q, types, useFulltext);
        List<SearchResult> list = total > 0
                ? searchMapper.searchAll(q, types, useFulltext, size, offset)
                : Collections.emptyList();

        return new Page<>(list, total, page, size);
    }
}


