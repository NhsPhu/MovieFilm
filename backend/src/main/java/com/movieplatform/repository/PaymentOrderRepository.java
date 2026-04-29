package com.movieplatform.repository;

import com.movieplatform.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    List<PaymentOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
}
