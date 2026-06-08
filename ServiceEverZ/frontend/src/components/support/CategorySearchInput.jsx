import { useState, useEffect, useRef, useCallback } from "react";
 
const API_BASE = "http://localhost:8080/api/kb";
 
/**
 * CategorySearchInput
 *
 * Props:
 *  - value         : { id, name } | null  — currently selected category
 *  - onChange      : (category: { id, name } | null) => void
 *  - token         : JWT token string (passed in Authorization header)
 *  - placeholder   : string (optional)
 *  - required      : boolean (optional)
 */
export default function CategorySearchInput({
  value,
  onChange,
  token,
  placeholder = "Search or create a category…",
  required = false,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
 
  // Inline "create" modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
 
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
 
  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  // ── Fetch suggestions with debounce ──────────────────────────────────────
  const fetchSuggestions = useCallback(
    async (q) => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/categories/search?q=${encodeURIComponent(q)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        setSuggestions(data.data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );
 
  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, open, fetchSuggestions]);
 
  // ── When a selection already exists, show its name in input ──────────────
  useEffect(() => {
    if (value) setQuery(value.name);
  }, [value]);
 
  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    setHighlightIdx(-1);
    if (value) onChange(null); // clear previous selection when typing
  };
 
  const handleFocus = () => {
    setOpen(true);
    fetchSuggestions(query);
  };
 
  const handleSelect = (cat) => {
    onChange(cat);
    setQuery(cat.name);
    setOpen(false);
    setHighlightIdx(-1);
  };
 
  const handleClear = () => {
    onChange(null);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };
 
  const openCreateModal = () => {
    setNewCatName(query.trim());
    setNewCatDesc("");
    setCreateError("");
    setShowCreateModal(true);
    setOpen(false);
  };
 
  const handleKeyDown = (e) => {
    if (!open) return;
    const total = suggestions.length + 1; // +1 for "create" option
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => (i + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => (i - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < suggestions.length) {
        handleSelect(suggestions[highlightIdx]);
      } else if (highlightIdx === suggestions.length) {
        openCreateModal();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };
 
  // ── Create category API call ──────────────────────────────────────────────
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      setCreateError("Category name is required.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.message || "Failed to create category.");
        return;
      }
      const created = data.data;
      onChange(created);
      setQuery(created.name);
      setShowCreateModal(false);
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  };
 
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div ref={wrapperRef} style={{ position: "relative" }}>
        {/* Input */}
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            className={`form-control ${required && !value ? "" : ""}`}
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            required={required && !value}
          />
          {value && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClear}
              title="Clear selection"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
 
        {/* Selected badge */}
        {value && (
          <div className="mt-1">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              <i className="bi bi-tag-fill me-1" />
              {value.name}
              <button
                type="button"
                className="btn-close btn-close ms-2"
                style={{ fontSize: "0.6rem" }}
                onClick={handleClear}
                aria-label="Remove"
              />
            </span>
          </div>
        )}
 
        {/* Dropdown */}
        {open && (
          <div
            className="dropdown-menu show w-100 shadow-sm"
            style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
          >
            {loading && (
              <div className="dropdown-item text-muted d-flex align-items-center gap-2">
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                />
                Searching…
              </div>
            )}
 
            {!loading && suggestions.length === 0 && query.trim() !== "" && (
              <div className="dropdown-item text-muted small">
                No categories found for &ldquo;{query}&rdquo;
              </div>
            )}
 
            {!loading &&
              suggestions.map((cat, idx) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`dropdown-item d-flex align-items-center gap-2 ${
                    highlightIdx === idx ? "active" : ""
                  }`}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  onClick={() => handleSelect(cat)}
                >
                  <i className="bi bi-tag text-secondary" />
                  <span>{cat.name}</span>
                  {cat.description && (
                    <small className="text-muted ms-auto text-truncate" style={{ maxWidth: 180 }}>
                      {cat.description}
                    </small>
                  )}
                </button>
              ))}
 
            {/* Always show "Create new" option */}
            <div className="dropdown-divider my-1" />
            <button
              type="button"
              className={`dropdown-item d-flex align-items-center gap-2 text-success fw-semibold ${
                highlightIdx === suggestions.length ? "active" : ""
              }`}
              onMouseEnter={() => setHighlightIdx(suggestions.length)}
              onClick={openCreateModal}
            >
              <i className="bi bi-plus-circle-fill" />
              {query.trim()
                ? `Create new category "${query.trim()}"`
                : "Create a new category"}
            </button>
          </div>
        )}
      </div>
 
  
 <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle-fill text-success me-2" />
                  Create New Category
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
 
              <div className="modal-body">
                {createError && (
                  <div className="alert alert-danger py-2 small">{createError}</div>
                )}
 
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Category Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Network Issues"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    autoFocus
                  />
                </div>
 
                <div className="mb-2">
                  <label className="form-label fw-semibold">
                    Description{" "}
                    <span className="text-muted fw-normal">(optional)</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Brief description of this category…"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                  />
                </div>
              </div>
 
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={handleCreateCategory}
                  disabled={creating || !newCatName.trim()}
                >
                  {creating && (
                    <span className="spinner-border spinner-border-sm" />
                  )}
                  {creating ? "Creating…" : "Create & Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
 