package com.hiring.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SubmitMcqRequest {
    private Long assessmentId;
    
    // Key: Question ID, Value: Selected Option IDs
    private Map<Long, List<Long>> answers;
    
    private int tabSwitches;
    private int copyPasteDetects;
}
