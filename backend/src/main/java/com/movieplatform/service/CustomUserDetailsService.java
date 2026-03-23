package com.movieplatform.service;

import com.movieplatform.entity.User;
import com.movieplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String account) throws UsernameNotFoundException {
        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with account: " + account));

        String principal = user.getEmail() != null ? user.getEmail() : user.getPhoneNumber();
        return new org.springframework.security.core.userdetails.User(
                principal,
                user.getPasswordHash(),
                user.getIsActive(),
                true,
                true,
                true,
                getAuthorities(user));
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }
}
