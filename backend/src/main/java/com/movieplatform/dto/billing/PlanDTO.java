package com.movieplatform.dto.billing;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class PlanDTO {
    private Integer id;
    private String name;
    private String rankLevel;
    private BigDecimal price;
    private Integer durationDays;
    private List<String> features;
}
