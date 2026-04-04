import { useState } from "react";
import { Contact } from "../../../../shared/Contact";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { validatePhoneNumberLength } from "libphonenumber-js";
import { formatPhoneNumber } from "../../utils/utils";
import { usStates } from "../../constants/states";
import "./NewContactForm.css";

interface NewContactFormProps {
  setContacts: (contacts: Array<Contact>) => void;
  contacts: Array<Contact>;
}

interface state {
  name: string;
  code: string;
}

export default function NewContactForm({
  setContacts,
  contacts,
}: NewContactFormProps) {
  const BASE_URL = "http://localhost:3001";
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\d+$/;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [state, setState] = useState("");
  const [company, setCompany] = useState("");

  function clearForm() {
    setName("");
    setEmail("");
    setPhone("");
    setState("");
    setCompany("");
  }

  function clearErrors() {
    setPhoneError(false);
    setEmailError(false);
  }

  async function saveContactData(contact: Contact) {
    await fetch(`${BASE_URL}/contacts`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    })
      .then(() => {
        setContacts([...contacts, contact]);
        clearForm();
      })
      .catch((err) => {
        console.error("Unable to add contact due to: ", err.message);
      });
  }

  return (
    <>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!validatePhoneNumberLength(phone) || !phoneRegex.test(phone)) {
            setPhoneError(true);
            return;
          }

          if (!emailRegex.test(email)) {
            setEmailError(true);
            return;
          }

          if (name && state && company) {
            const contact: Contact = {
              name: name,
              email: email,
              phone: formatPhoneNumber(phone) || phone,
              state: state,
              company: company,
            };

            clearErrors();

            await saveContactData(contact);
          } else {
            alert("All fields are required to successfully submit the form");
          }
        }}
      >
        <section>
          <TextField
            variant="filled"
            id="name-text-field"
            name="name"
            label="Name"
            value={name}
            onChange={(evt) => {
              setName(evt.target.value);
            }}
          />
        </section>
        <section>
          <TextField
            variant="filled"
            id="email-text-field"
            name="email"
            label="Email"
            value={email}
            error={emailError}
            helperText={emailError ? "Invalid format" : ""}
            onChange={(evt) => {
              setEmail(evt.target.value);
            }}
          />
        </section>
        <section>
          <TextField
            variant="filled"
            id="phone-text-field"
            name="phone"
            label="Phone"
            value={phone}
            error={phoneError}
            helperText={phoneError ? "Invalid format" : ""}
            onChange={(evt) => {
              setPhone(evt.target.value);
            }}
          />
        </section>
        <FormControl sx={{ width: { xs: "100%", md: "40%" } }}>
          <InputLabel id="state-select-label">State</InputLabel>
          <Select
            labelId="state-select-label"
            id="state-select"
            value={state}
            label="State"
            onChange={(evt) => setState(evt.target.value)}
          >
            {usStates.map((option: state) => (
              <MenuItem key={option.code} value={option.code}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <section>
          <TextField
            variant="filled"
            id="company-text-field"
            name="company"
            label="Company"
            value={company}
            onChange={(evt) => {
              setCompany(evt.target.value);
            }}
          />
        </section>
        <Button variant="contained" type="submit">
          Add Contact
        </Button>
      </form>
    </>
  );
}
