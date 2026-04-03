import './ContactList.css';
import { Contact } from "../../../../shared/Contact";
import { List, ListItem, ListItemText } from "@mui/material";


interface ContactListProps {
  contacts: Array<Contact>
}

export default function ContactList({contacts}: ContactListProps) {
  

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

