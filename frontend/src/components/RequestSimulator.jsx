import React, { useState } from 'react';
import { 
  Play, 
  Zap, 
  ShieldAlert, 
  Lock, 
  Send, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle,
  Info,
  Clock,
  UserCheck
} from 'lucide-react';
import { 
  runNormalRequestScenario, 
  runUnauthorizedAdminScenario, 
  runAuthorizedAdminScenario,
  runFailedLoginScenario, 
  runRateLimitScenario,
  executeApiRequest 
} from '../services/api';

export const RequestSimulator = ({ onRequestComplete }) => {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/products');
  const [headerKey, setHeaderKey] = useState('');
  const [headerVal, setHeaderVal] = useState('');
  const [requestBody, setRequestBody] = useState('{\n  "username": "admin",\n  "password": "wrong_password"\n}');
  
  const [loading, setLoading] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [lastResponse, setLastResponse] = useState(null);

  const handleRunScenario = async (name, scenarioFn) => {
    setLoading(true);
    setScenarioName(name);
    try {
      const res = await scenarioFn();
      setLastResponse(res);
      if (onRequestComplete) onRequestComplete();
    } catch (err) {
      console.error('Scenario error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setScenarioName('Custom API Request');

    const headers = {};
    if (headerKey.trim() && headerVal.trim()) {
      headers[headerKey.trim()] = headerVal.trim();
    }

    let parsedBody = null;
    if (['POST', 'PUT'].includes(method) && requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch {
        parsedBody = requestBody;
      }
    }

    try {
      const res = await executeApiRequest(method, endpoint, headers, parsedBody);
      setLastResponse(res);
      if (onRequestComplete) onRequestComplete();
    } catch (err) {
      console.error('Custom request error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract risk details from response payload
  const getSecurityResult = () => {
    if (!lastResponse) return null;
    const { status, duration, data } = lastResponse;

    let riskScore = 0;
    let riskLevel = 'LOW';
    let securityStatus = 'ALLOWED';
    let reasons = [];

    if (status === 403) {
      securityStatus = 'BLOCKED';
      riskScore = data.riskScore || 75;
      riskLevel = data.riskLevel || 'HIGH';
      reasons = data.reasons || ['High risk rule violation policy triggered'];
    } else if (status === 401) {
      riskScore = data.riskScore || 35;
      riskLevel = riskScore >= 61 ? 'HIGH' : (riskScore >= 31 ? 'MEDIUM' : 'LOW');
      securityStatus = riskScore >= 61 ? 'BLOCKED' : (riskScore >= 31 ? 'FLAGGED' : 'ALLOWED');
      reasons = data.reasons || ['Authentication failure recorded for client IP'];
    } else {
      riskScore = data.meta?.riskScore || 0;
      riskLevel = data.meta?.riskLevel || 'LOW';
      securityStatus = 'ALLOWED';
      reasons = data.reasons || ['Normal request pattern conforming to baseline behavior'];
    }

    return {
      status,
      duration,
      securityStatus,
      riskScore,
      riskLevel,
      reasons,
      responseData: data
    };
  };

  const secRes = getSecurityResult();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      
      {/* LEFT PANEL: DEMO SCENARIOS & CUSTOM API RUNNER */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        
        {/* Scenario Presets Card */}
        <div className="cyber-card">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">One-Click Security Demo Scenarios</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Click any demo scenario button below to send live API requests through the Express security middleware.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Scenario 1: Normal Products Request */}
            <button
              onClick={() => handleRunScenario('Normal Product Request', runNormalRequestScenario)}
              disabled={loading}
              className="scenario-btn group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Normal Products
                </span>
                <span className="badge badge-low">LOW RISK</span>
              </div>
              <span className="text-[11px] text-gray-300 font-mono">GET /api/products</span>
              <span className="text-[10px] text-gray-400 mt-1">Status: ALLOWED (Score ~0)</span>
            </button>

            {/* Scenario 2: Normal Users Request */}
            <button
              onClick={() => handleRunScenario('Normal Users Request', () => executeApiRequest('GET', '/users'))}
              disabled={loading}
              className="scenario-btn group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Normal Users
                </span>
                <span className="badge badge-low">LOW RISK</span>
              </div>
              <span className="text-[11px] text-gray-300 font-mono">GET /api/users</span>
              <span className="text-[10px] text-gray-400 mt-1">Status: ALLOWED (Score ~0)</span>
            </button>

            {/* Scenario 3: Repeated Login Attempts */}
            <button
              onClick={() => handleRunScenario('Repeated Failed Logins', runFailedLoginScenario)}
              disabled={loading}
              className="scenario-btn danger group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Repeated Failed Logins
                </span>
                <span className="badge badge-high">HIGH RISK</span>
              </div>
              <span className="text-[11px] text-gray-300 font-mono">POST /api/login (Repeated)</span>
              <span className="text-[10px] text-gray-400 mt-1">Status: FLAGGED ➔ BLOCKED (Score ~75)</span>
            </button>

            {/* Scenario 4: Unauthorized Admin */}
            <button
              onClick={() => handleRunScenario('Unauthorized /admin Access', runUnauthorizedAdminScenario)}
              disabled={loading}
              className="scenario-btn warning group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> Unauthorized /admin
                </span>
                <span className="badge badge-high">HIGH RISK</span>
              </div>
              <span className="text-[11px] text-gray-300 font-mono">GET /api/admin (No Token)</span>
              <span className="text-[10px] text-gray-400 mt-1">Status: BLOCKED (Score 65)</span>
            </button>

          </div>
        </div>

        {/* Custom Request Form Card */}
        <div className="cyber-card">
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Custom API Test Console</h3>
          </div>

          <form onSubmit={handleCustomSend} className="space-y-3">
            
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 sm:col-span-3">
                <label className="text-[11px] text-gray-400 mb-1 block">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg text-xs px-2.5 py-2 text-white font-mono focus:border-cyan-400 outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>

              <div className="col-span-8 sm:col-span-9">
                <label className="text-[11px] text-gray-400 mb-1 block">Endpoint Path</label>
                <select
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg text-xs px-2.5 py-2 text-white font-mono focus:border-cyan-400 outline-none"
                >
                  <option value="/products">/api/products (Public Products)</option>
                  <option value="/users">/api/users (Users Directory)</option>
                  <option value="/login">/api/login (User Auth Endpoint)</option>
                  <option value="/admin">/api/admin (Protected Admin Area)</option>
                </select>
              </div>
            </div>

            {/* Custom Header Input */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Header Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. x-admin-token"
                  value={headerKey}
                  onChange={(e) => setHeaderKey(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg text-xs px-2.5 py-2 text-white font-mono focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Header Value</label>
                <input
                  type="text"
                  placeholder="e.g. secret-admin-key"
                  value={headerVal}
                  onChange={(e) => setHeaderVal(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg text-xs px-2.5 py-2 text-white font-mono focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            {/* Request Body (for POST) */}
            {method === 'POST' && (
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">JSON Request Body</label>
                <textarea
                  rows={3}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg text-xs p-2 text-cyan-300 font-mono focus:border-cyan-400 outline-none resize-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 text-xs tracking-wider"
            >
              {loading ? (
                <span>Evaluating Rule Engine Security...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Send Test Request</span>
                </>
              )}
            </button>

          </form>
        </div>

      </div>

      {/* RIGHT PANEL: LIVE SECURITY INSPECTOR & SCORE BREAKDOWN */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="cyber-card h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Live Request Inspector</h3>
              </div>
              {scenarioName && (
                <span className="text-[11px] text-gray-300 bg-gray-800 px-2 py-0.5 rounded font-mono border border-gray-700">
                  {scenarioName}
                </span>
              )}
            </div>

            {secRes ? (
              <div className="space-y-4">
                
                {/* Status & Decision Result Header */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/90 border border-gray-800">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Security Action</span>
                    <span className={`text-lg font-extrabold tracking-wide ${
                      secRes.securityStatus === 'BLOCKED' ? 'text-rose-500' : 
                      secRes.securityStatus === 'FLAGGED' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {secRes.securityStatus}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">HTTP Status</span>
                    <span className={`text-base font-mono font-bold ${
                      secRes.status >= 400 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {secRes.status || '403'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Latency</span>
                    <span className="text-xs font-mono text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" /> {secRes.duration}ms
                    </span>
                  </div>
                </div>

                {/* Risk Score Progress Bar Meter */}
                <div className="p-3.5 rounded-lg bg-gray-900/60 border border-gray-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-gray-300">Rule-Based Risk Score</span>
                    <span className="text-xs font-bold font-mono text-white">
                      {secRes.riskScore} <span className="text-gray-500 font-normal">/ 100</span>
                    </span>
                  </div>
                  
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        secRes.riskScore >= 61 ? 'bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                        secRes.riskScore >= 31 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                        'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.max(secRes.riskScore, 5)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                    <span>0 (Low)</span>
                    <span>30 (Allow)</span>
                    <span>60 (Flag)</span>
                    <span>100 (Block)</span>
                  </div>
                </div>

                {/* Triggered Rules & Reasons */}
                <div>
                  <span className="text-xs font-semibold text-gray-300 block mb-2">Triggered Rule Reasons</span>
                  <ul className="space-y-1.5">
                    {secRes.reasons.map((r, i) => (
                      <li key={i} className="text-xs text-gray-300 bg-gray-900/80 p-2 rounded border border-gray-800 flex items-start gap-2">
                        {secRes.riskScore >= 61 ? (
                          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        ) : secRes.riskScore >= 31 ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Raw API Response Snippet */}
                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-1">API Response JSON</span>
                  <pre className="text-[11px] p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-cyan-300 font-mono overflow-x-auto max-h-36">
                    {JSON.stringify(secRes.responseData, null, 2)}
                  </pre>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                <Info className="w-10 h-10 mb-2 stroke-[1.5] text-gray-600" />
                <p className="text-sm font-medium text-gray-400">No request sent yet</p>
                <p className="text-xs mt-1">Select a demo scenario on the left to see live rule evaluation.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
            <span>Middleware Overhead: &lt; 2ms</span>
            <span className="text-cyan-400 font-mono">Engine: Rule-Based Classifier</span>
          </div>

        </div>
      </div>

    </div>
  );
};
