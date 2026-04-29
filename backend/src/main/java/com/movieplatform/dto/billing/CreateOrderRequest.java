package com.movieplatform.dto.billing;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotNull(message = "Plan ID is required")
    private Integer planId;

    private String paymentMethod = "QR_BANK_TRANSFER";
}
