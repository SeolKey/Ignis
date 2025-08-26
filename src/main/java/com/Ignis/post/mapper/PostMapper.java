package com.Ignis.post.mapper;

import com.Ignis.post.domain.Post;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PostMapper {
    List<Post> selectPostList();
    Post selectPostById(int id);
    void insertPost(Post post);
    void updatePost(Post post);
    void deletePost(int id);

    void incrementViewCount(int postId);
    List<Post> selectPostListByViews();
}
