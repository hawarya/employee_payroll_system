package com.example.payroll.security.services;

import com.example.payroll.models.User;
import com.example.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String employeeId) throws UsernameNotFoundException {
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with employeeId: " + employeeId));
        return UserDetailsImpl.build(user);
    }
}
