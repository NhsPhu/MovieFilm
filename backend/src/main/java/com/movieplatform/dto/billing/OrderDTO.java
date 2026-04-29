package com.movieplatform.dto.billing;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String planName;
    private String rankLevel;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
