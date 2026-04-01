import './Contact.css'
import { Typography } from "@mui/material";
import ContactList from "../ContactList/ContactList";
import NewContactForm from "../NewContactForm/NewContactForm";

export default function Contacts() {
  return (
    <>
      <main>
        <section>
          <Typography className="page-header" variant="h4" component="h2">All Contacts</Typography>
          <ContactList />
        </section>
        <section>
          <Typography className="page-header" variant="h4" component="h2">New Contact Form</Typography>
          <NewContactForm />
        </section>
      </main>
    </>
  );
}
