package com.Ignis.search.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResult {
    private String type;      // donation, volunteer, funding, post, notice
    private Long id;
    private String title;
    private String snippet;
    private String imagePath;
    private String createdAt;
    private Integer viewCount;
}


