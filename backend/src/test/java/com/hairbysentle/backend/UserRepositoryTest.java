package com.hairbysentle.backend;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.hairbysentle.backend.model.User;
import com.hairbysentle.backend.repository.UserRepository;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveUserAndFindByEmail() {
        User user = new User("Lerato", "Mokoena", "lerato@example.com", "secret123",
                "0712345678", "123 Main Road");

        User saved = userRepository.save(user);

        assertThat(saved.getCustomerId()).isNotNull();
        assertThat(userRepository.findByEmail("lerato@example.com")).isPresent();
    }
}
