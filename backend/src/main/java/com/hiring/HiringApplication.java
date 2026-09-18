package com.hiring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HiringApplication {
    public static void main(String[] args) {
        SpringApplication.run(HiringApplication.class, args);
    }
}
