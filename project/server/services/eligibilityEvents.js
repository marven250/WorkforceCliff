"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmployerEligibilitySseClient = addEmployerEligibilitySseClient;
exports.addLearnerEligibilitySseClient = addLearnerEligibilitySseClient;
exports.publishEligibilityEvent = publishEligibilityEvent;
exports.publishEligibilityPing = publishEligibilityPing;
let nextClientId = 1;
const byOrganizationId = new Map();
const byLearnerAccountId = new Map();
function sseWrite(res, payload) {
    res.write(payload);
}
function pushClient(map, key, client) {
    const arr = map.get(key);
    if (arr)
        arr.push(client);
    else
        map.set(key, [client]);
}
function removeClient(map, key, clientId) {
    const arr = map.get(key);
    if (!arr)
        return;
    const i = arr.findIndex((c) => c.id === clientId);
    if (i >= 0)
        arr.splice(i, 1);
    if (arr.length === 0)
        map.delete(key);
}
function addEmployerEligibilitySseClient(res, organizationId) {
    const clientId = nextClientId++;
    const client = { id: clientId, res };
    pushClient(byOrganizationId, organizationId, client);
    sseWrite(res, `: connected\n\n`);
    return () => removeClient(byOrganizationId, organizationId, clientId);
}
function addLearnerEligibilitySseClient(res, learnerAccountId) {
    const clientId = nextClientId++;
    const client = { id: clientId, res };
    pushClient(byLearnerAccountId, learnerAccountId, client);
    sseWrite(res, `: connected\n\n`);
    return () => removeClient(byLearnerAccountId, learnerAccountId, clientId);
}
function notifyClients(clients, msg) {
    if (!(clients === null || clients === void 0 ? void 0 : clients.length))
        return;
    for (const c of clients) {
        try {
            sseWrite(c.res, msg);
        }
        catch (_a) {
            // best-effort
        }
    }
}
function publishEligibilityEvent(evt) {
    const data = JSON.stringify(evt);
    const msg = `event: eligibility_changed\ndata: ${data}\n\n`;
    notifyClients(byOrganizationId.get(evt.organizationId), msg);
    notifyClients(byLearnerAccountId.get(evt.learnerAccountId), msg);
}
function publishEligibilityPing() {
    const msg = `: ping\n\n`;
    for (const clients of byOrganizationId.values())
        notifyClients(clients, msg);
    for (const clients of byLearnerAccountId.values())
        notifyClients(clients, msg);
}
