import { Provider } from "../../../shared/Provider";
import { Contact } from "../../../shared/Contact";

const BASE_URL = "http://localhost:3001";

export async function fetchContacts(): Promise<Array<Contact>> {
  const response = await fetch(`${BASE_URL}/contacts`);
  const contactsData = await response.json();
  return contactsData;
}

export async function fetchProviders(userId: string): Promise<Array<Provider>> {
  const response = await fetch(`${BASE_URL}/providers/${userId}`);
  const providersData = await response.json();
  return providersData;
}

export async function createContact(contact: Contact): Promise<Contact> {
  const response = await fetch(`${BASE_URL}/contacts`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });
  const contactData = await response.json();
  return contactData;
}
