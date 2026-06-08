package com.rvz.serviceeverz.dto.request;

import java.util.Map;

public class SpecSearchRequest {
        private Map<String, String> specs;
        private String keyword;
        private String category;

        public Map<String, String> getSpecs()    { return specs; }
        public void setSpecs(Map<String, String> v) { specs = v; }
        public String getKeyword()               { return keyword; }
        public void setKeyword(String v)         { keyword = v; }
        public String getCategory()              { return category; }
        public void setCategory(String v)        { category = v; }
    }