package com.hairbysentle.backend.controller;

import com.hairbysentle.backend.model.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {


    @PostMapping("/register")
    @ResponseBody
    public String registerUser(@RequestBody User user) {

        return "User registered: " + user.getFirstName();

    }

}