import './ContactList.css'
import { useState, useEffect } from "react";
import { Contact } from "../../models/Contact";
import { List, ListItem, ListItemText } from "@mui/material";

export default function ContactList() {
  const BASE_URL = "http://localhost:3001";

  const [contacts, setContacts] = useState([]);

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
      <List>
        {contacts.map((contact: Contact) => (
          <>
            <ListItem key={contact.email}>
              <ListItemText primary={contact.name} />
            </ListItem>
          </>
        ))}
      </List >
    </>
  );
}

