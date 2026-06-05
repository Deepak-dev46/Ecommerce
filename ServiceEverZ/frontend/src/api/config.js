export const SERVICE_URLS = {
  MASTER:     'http://localhost:8081',   // master-data-service  → port 8081
  TICKET:     'http://localhost:8082',   // ticket-service       → port 8082
  APPROVAL:   'http://localhost:8083',   // approval-service     → port 8083
  ASSIGNMENT: 'http://localhost:8084',   // assignment-service   → port 8084
  MAIL:       'http://localhost:8085',   // mail-service         → port 8085
  SLA:        'http://localhost:8086',   // sla-service          → port 8086
  INCIDENT:   'http://localhost:8088'
};



// Generic fetch wrapper — matches original frontend pattern
export async function apiFetch(base, path, options = {}) {
  const { method = 'GET', body, params } = options;

  let url = `${base}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    );
    if ([...qs].length) url += '?' + qs.toString();
  }

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json.data !== undefined ? json.data : json;
}
