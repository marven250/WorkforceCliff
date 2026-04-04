import "./Contact.css";
import { Typography } from "@mui/material";
import ContactList from "../ContactList/ContactList";
import NewContactForm from "../NewContactForm/NewContactForm";
import { useState, useEffect } from "react";
import { Contact } from "../../../../shared/Contact";

export default function Contacts() {
  const BASE_URL = "http://localhost:3001";

  const [contacts, setContacts] = useState<Array<Contact>>([]);

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(`${BASE_URL}/contacts`);
      const data = await response.json();
      setContacts(data);
    };

    loadData();
  }, []);

  return (
    <>
      <main>
        <section>
          <Typography className="page-header" variant="h4" component="h2">
            All Contacts
          </Typography>
          <ContactList contacts={contacts} />
        </section>
        <section>
          <Typography className="page-header" variant="h4" component="h2">
            New Contact Form
          </Typography>
          <NewContactForm contacts={contacts} setContacts={setContacts} />
        </section>
      </main>
    </>
  );
}
