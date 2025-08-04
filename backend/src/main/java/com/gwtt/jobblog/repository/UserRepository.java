package com.gwtt.jobblog.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gwtt.jobblog.domain.Provider;
import com.gwtt.jobblog.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {    
    Optional<User> findByEmailAndProvider(String email, Provider provider);
    Optional<User> findByProviderAndProviderId(Provider provider, String providerId);
}
