package com.example.springapp.models;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordUpdate {
    private String id;
    private String oldpassword;
    private String newpassword;
}
