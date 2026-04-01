import { useState } from "react";
import { Contact } from "../../../../shared/Contact";
import { Button, TextField } from "@mui/material";
import "./NewContactForm.css";

interface NewContactFormProps {
  setContacts: (contacts: Array<Contact>)=> void,
  contacts: Array<Contact>
}

export default function NewContactForm({setContacts, contacts}: NewContactFormProps ) {
  const BASE_URL = "http://localhost:3001";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [company, setCompany] = useState("");



  function clearAllStates(){
    setName("");
    setEmail("")
    setPhone("")
    setState("")
    setCompany("")
  }

  async function saveContactData(contact: Contact) {
    await fetch(`${BASE_URL}/contacts`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    }).then(()=>{
      setContacts([...contacts, contact])
      clearAllStates()
    }).catch(err=>{
      console.error("Unable to add contact due to: ", err.message)
    });
  }


  return (
    <>
      <form onSubmit={async (event) => {
        event.preventDefault();

        console.info(event.target);
        const contact: Contact = {
          name: name,
          email: email,
          phone: phone,
          state: state,
          company: company
        };
        await saveContactData(contact);
      }}>
        <section>
          <TextField variant="filled" id="name-text-field" name="name" label="Name" value={name} onChange={(evt) => {
            setName(evt.target.value);
          }} />
        </section>
        <section>
          <TextField variant="filled" id="email-text-field" name="email" label="Email" value={email} onChange={(evt) => {
            setEmail(evt.target.value);

          }} />
        </section>
        <section>
          <TextField variant="filled" id="phone-text-field" name="phone" label="Phone" value={phone} onChange={(evt) => {
            setPhone(evt.target.value);

          }} />
        </section>
        <section>
          <TextField variant="filled" id="state-text-field" name="state" label="State" value={state} onChange={(evt) => {
            setState(evt.target.value);

          }} />
        </section>
        <section>
          <TextField variant="filled" id="company-text-field" name="company" label="Company" value={company} onChange={(evt) => {
            setCompany(evt.target.value);

          }} />
        </section>
        <Button variant="contained" type="submit">Add Contact</Button>
      </form>
    </>
  );
}
