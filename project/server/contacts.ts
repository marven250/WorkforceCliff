import Handlebars from "handlebars";
import {Contact} from "../shared/Contact"

const TEMPLATE = `
<h1>New Customer Added</h1>
<p>A new customer has registered for the app with the following contact information:</p>
<ul>
  <li>Name: {{name}}</li>
  <li>Email: {{email}}</li>
  <li>Phone: {{phone}}</li>
  <li>State: {{state}}</li>
  <li>Company: {{company}}</li>
</ul>
`;


const contacts: Array<Contact> = [
  {
    name: "Alice",
    email: "alice@example.com",
    phone: "N/A",
    state: "N/A",
    company: "N/A"
  },
  {
    name: "Bob",
    email: "bob@example.com",
    phone: "N/A",
    state: "N/A",
    company: "N/A"
  },
];

export function getAllContacts(): Array<Contact> {
  return contacts;
}

export function addNewContact(contact: Contact): Contact {
  contacts.push(contact);
  notifyContactAdded(contact);
  return contact;
}

function notifyContactAdded(contact: Contact) {
  const template = Handlebars.compile(TEMPLATE);
  const emailMessage = template(contact);
  sendMail(emailMessage);
}

function sendMail(message: string) {
  // NOTE: pretend that this function actually sends an email to marketing
  console.info(`Sending Email to Marketing:\n${message}`);
}

