"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInquirySseClient = addInquirySseClient;
exports.publishInquiryEvent = publishInquiryEvent;
exports.publishInquiryPing = publishInquiryPing;
let nextClientId = 1;
const clients = new Map();
function sseWrite(res, payload) {
    res.write(payload);
}
function addInquirySseClient(res) {
    const clientId = nextClientId++;
    clients.set(clientId, { id: clientId, res });
    // Initial comment to establish the stream.
    sseWrite(res, `: connected\n\n`);
    return {
        clientId,
        remove: () => {
            clients.delete(clientId);
        },
    };
}
function publishInquiryEvent(evt) {
    const data = JSON.stringify(evt);
    const msg = `event: inquiry_changed\ndata: ${data}\n\n`;
    for (const c of clients.values()) {
        try {
            sseWrite(c.res, msg);
        }
        catch (_a) {
            // Connection likely closed; best-effort cleanup.
            clients.delete(c.id);
        }
    }
}
function publishInquiryPing() {
    const msg = `: ping\n\n`;
    for (const c of clients.values()) {
        try {
            sseWrite(c.res, msg);
        }
        catch (_a) {
            clients.delete(c.id);
        }
    }
}
