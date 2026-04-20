import type { Response } from "express";

export type InquiryEventKind = "employer" | "education_provider";
export type InquiryEventAction = "created" | "claimed" | "completed";

export type InquiryEvent = {
  kind: InquiryEventKind;
  action: InquiryEventAction;
  id: number;
};

type Client = {
  id: number;
  res: Response;
};

let nextClientId = 1;
const clients = new Map<number, Client>();

function sseWrite(res: Response, payload: string) {
  res.write(payload);
}

export function addInquirySseClient(res: Response): { clientId: number; remove: () => void } {
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

export function publishInquiryEvent(evt: InquiryEvent) {
  const data = JSON.stringify(evt);
  const msg = `event: inquiry_changed\ndata: ${data}\n\n`;
  for (const c of clients.values()) {
    try {
      sseWrite(c.res, msg);
    } catch {
      // Connection likely closed; best-effort cleanup.
      clients.delete(c.id);
    }
  }
}

export function publishInquiryPing() {
  const msg = `: ping\n\n`;
  for (const c of clients.values()) {
    try {
      sseWrite(c.res, msg);
    } catch {
      clients.delete(c.id);
    }
  }
}

