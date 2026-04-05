import "./Contact.css";
import { Box, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { Contact } from "../../../../shared/Contact";
import { fetchContacts } from "../../services/api";
import ContactList from "../ContactList/ContactList";
import NewContactForm from "../NewContactForm/NewContactForm";

export default function Contacts() {
  const [contacts, setContacts] = useState<Array<Contact>>([]);

  useEffect(() => {
    const loadData = async () => {
      const contactsData = await fetchContacts();
      setContacts(contactsData);
    };

    loadData();
  }, []);

  return (
    <>
      <main>
        <Box sx={{ flexGrow: 1, p: 4 }}>
          <Grid container spacing={4} marginTop={6}>
            <ContactList contacts={contacts} />

            <NewContactForm contacts={contacts} setContacts={setContacts} />
          </Grid>
        </Box>
      </main>
    </>
  );
}
