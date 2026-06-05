package com.rvz.serviceeverz.dto.response;

import java.util.Map;

/**
 * Returned by GET /api/assets/spec-template/{category}
 * so the frontend knows which fields to render for a given category.
 */
public class SpecificationTemplateResponse {
    private String category;
    private Map<String, String> fields;   // key → hint/placeholder

    public SpecificationTemplateResponse() {}
    public SpecificationTemplateResponse(String category, Map<String, String> fields) {
        this.category = category;
        this.fields   = fields;
    }

    public String getCategory()               { return category; }
    public void setCategory(String v)         { category = v; }
    public Map<String, String> getFields()    { return fields; }
    public void setFields(Map<String, String> v) { fields = v; }
}
