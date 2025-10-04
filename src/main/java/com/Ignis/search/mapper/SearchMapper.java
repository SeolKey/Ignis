package com.Ignis.search.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.Ignis.search.domain.SearchResult;

@Mapper
public interface SearchMapper {
    List<SearchResult> searchAll(
            @Param("q") String q,
            @Param("types") List<String> types,
            @Param("useFulltext") boolean useFulltext,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    int countAll(
            @Param("q") String q,
            @Param("types") List<String> types,
            @Param("useFulltext") boolean useFulltext
    );
}


