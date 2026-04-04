import { Provider } from "../../../shared/Provider";
import { Contact } from "../../../shared/Contact";

const BASE_URL = "http://localhost:3001";



export async function fetchContacts():Promise<Array<Contact>>{
    const response = await fetch(`${BASE_URL}/contacts`);
    const data = await response.json();
    return data;
}

export async function fetchProviders():Promise<Array<Provider>>{
    const response = await fetch(`${BASE_URL}/providers`);
    const data = await response.json();
    return data;
}


export async function createContact(contact: Contact):Promise<Contact>{
    const response = await fetch(`${BASE_URL}/contacts`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    })
    const data = await response.json()
    return data;
}