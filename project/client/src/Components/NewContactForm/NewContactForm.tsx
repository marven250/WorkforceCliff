import { useState } from "react";
import { Contact } from "../../../../shared/Contact";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { validatePhoneNumberLength } from "libphonenumber-js";
import { formatPhoneNumber } from "../../utils/utils";
import { usStates } from "../../constants/states";
import "./NewContactForm.css";
import { createContact } from "../../services/api";

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
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[a-z ,.'-]+$/i;
  const phoneRegex = /^\d+$/;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [company, setCompany] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [stateError, setStateError] = useState(false);
  const [companyError, setCompanyError] = useState(false);

  function clearForm() {
    setName("");
    setEmail("");
    setPhone("");
    setState("");
    setCompany("");
  }

  function clearErrors() {
    setNameError(false);
    setEmailError(false);
    setPhoneError(false);
    setStateError(false);
    setCompanyError(false);
  }

  async function saveContactData(contact: Contact) {
    createContact(contact)
      .then(() => {
        setContacts([...contacts, contact]);
        clearForm();
        alert("You've successfully added a contact!");
      })
      .catch((err) => {
        console.error("Unable to add contact due to: ", err.message);
      });
  }

  return (
    <>
      <FormControl sx={{ ml: 4 }}
        onSubmit={async (event) => {
          event.preventDefault();

          if (name.length < 3 || !nameRegex.test(name)) {
            setNameError(true);
            return;
          }

          if (email.length < 8 || !emailRegex.test(email)) {
            setNameError(false);
            setEmailError(true);
            return;
          }

          if (!validatePhoneNumberLength(phone) || !phoneRegex.test(phone)) {
            setEmailError(false);
            setPhoneError(true);
            return;
          }

          if (!state) {
            setPhoneError(false);
            setStateError(true);
            return;
          }

          if (company.length < 3) {
            setStateError(false);
            setCompanyError(true);
            return;
          }

          const contact: Contact = {
            name: name,
            email: email,
            phone: formatPhoneNumber(phone) || phone,
            state: state,
            company: company,
          };

          clearErrors();

          await saveContactData(contact);
        }}
      >
        <section>
          <TextField
            variant="filled"
            id="name-text-field"
            name="name"
            error={nameError}
            helperText={nameError ? "Invalid format" : ""}
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
        <section>
          <FormControl
            error={stateError}
            sx={{ width: { xs: "100%" } }}
          >
            <InputLabel id="state-select-label">State</InputLabel>
            <Select
              labelId="state-select-label"
              variant="filled"
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
        </section>
        <section>
          <TextField
            variant="filled"
            id="company-text-field"
            name="company"
            label="Company"
            value={company}
            error={companyError}
            helperText={companyError ? "Invalid format" : ""}
            onChange={(evt) => {
              setCompany(evt.target.value);
            }}
          />
        </section>
        <Stack alignItems="center">
          <Button variant="contained" type="submit">
            Add Contact
          </Button>
        </Stack>
      </FormControl>
    </>
  );
}
