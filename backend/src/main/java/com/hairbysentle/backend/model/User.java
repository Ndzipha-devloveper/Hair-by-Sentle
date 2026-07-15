package main.java.com.hairbysentle.backend.model;

import java.time.LocalDateTime;
public class User {
    // Attributes for customers
    private Long  customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private String homeAddress;
    private LocalDateTime createdAt;


    //Constructor 
    public User(Long customerIdLong, String firstName,
                String lastName, String email,
                String password, String phoneNumber,
                String homeAddress, LocalDateTime createdAt){

            this.customerId = customerId;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.password = password;
            this.phoneNumber = phoneNumber;
            this.homeAddress = homeAddress;
            this.createdAt = createdAt;

    }

    /*
        Getter and Setter methods
    */

    public  Long getCustomerId(){
        return customerId;
    }

    public 



}
