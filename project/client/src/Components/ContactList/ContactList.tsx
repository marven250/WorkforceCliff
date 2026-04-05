import "./ContactList.css";
import { Contact } from "../../../../shared/Contact";
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

interface ContactListProps {
  contacts: Array<Contact>;
}

export default function ContactList({ contacts }: ContactListProps) {
  return (
    <Grid item xs={12} md={5} width="80vw">
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          Contacts
        </Typography>
        <List>
          {contacts.map((contact: Contact) => (
            <ListItem sx={{ textAlign: "center" }} key={contact.email} divider>
              <ListItemText primary={contact.name} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Grid>
  );
}
