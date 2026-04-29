package com.movieplatform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "plan_id", nullable = false)
    private Integer planId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 50)
    private String paymentMethod = "QR_BANK_TRANSFER";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(length = 50)
    private String planName;

    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum OrderStatus {
        PENDING, COMPLETED, FAILED, CANCELLED
    }
}
