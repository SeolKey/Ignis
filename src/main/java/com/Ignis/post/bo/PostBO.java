package com.Ignis.post.bo;

import com.Ignis.post.domain.Post;
import com.Ignis.post.mapper.PostMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostBO {

    @Autowired
    private PostMapper postMapper;

    public List<Post> getPostList(){
        return postMapper.selectPostList();
    }

    public Post getPostById(int id){
        return postMapper.selectPostById(id);
    }

    public void createPost(Post post){
        postMapper.insertPost(post);
    }
    public void updatePost(Post post){
        postMapper.updatePost(post);
    }
}
