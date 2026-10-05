const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetch logs and statistics from backend
 */
export const fetchLogsAndStats = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/logs`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch logs:', err);
    return { success: false, stats: { total: 0, allowed: 0, flagged: 0, blocked: 0, avgRiskScore: 0 }, logs: [] };
  }
};

/**
 * Reset security logs & rate limiters
 */
export const resetSecurityLogs = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/logs`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    console.error('Failed to reset logs:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Send custom API test request
 */
export const executeApiRequest = async (method, endpoint, headers = {}, body = null) => {
  try {
    const options = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const startTime = performance.now();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const duration = Math.round(performance.now() - startTime);

    let data;
    try {
      data = await res.json();
    } catch {
      data = { text: await res.text() };
    }

    return {
      status: res.status,
      ok: res.ok,
      duration,
      data
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      duration: 0,
      data: { error: 'Network Error', message: err.message }
    };
  }
};

/**
 * PRESET DEMO SCENARIO RUNNERS
 */

// 1. Normal Request (GET /api/products)
export const runNormalRequestScenario = async () => {
  return await executeApiRequest('GET', '/products');
};

// 2. Unauthorized Admin Access (GET /api/admin without valid token)
export const runUnauthorizedAdminScenario = async () => {
  return await executeApiRequest('GET', '/admin');
};

// 3. Authorized Admin Access (GET /api/admin with valid token)
export const runAuthorizedAdminScenario = async () => {
  return await executeApiRequest('GET', '/admin', { 'x-admin-token': 'secret-admin-key' });
};

// 4. Repeated Failed Login Attack (POST /api/login with invalid credentials 3 times)
export const runFailedLoginScenario = async () => {
  // Execute 3 rapid failed login attempts to trigger brute force detection
  let lastRes = null;
  for (let i = 1; i <= 3; i++) {
    lastRes = await executeApiRequest('POST', '/login', {}, { username: 'admin', password: `wrong_pass_${i}` });
  }
  return lastRes;
};

// 5. Rate Limit Burst / DDoS Simulation (12 rapid GET requests in ~500ms)
export const runRateLimitScenario = async (progressCb) => {
  const requests = [];
  for (let i = 1; i <= 12; i++) {
    requests.push(executeApiRequest('GET', '/users'));
  }
  const results = await Promise.all(requests);
  // Return the last response (which will be blocked with 403 status)
  return results[results.length - 1];
};
