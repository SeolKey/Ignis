package com.Ignis.test;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/test")
public class TestController {
  @RequestMapping("/test2")
  public String ex02() {  
              // src/main/resources/templates/   {lesson01/ex02}   .html
      return "test/test1";
  }
}