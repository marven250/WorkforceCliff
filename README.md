# Project Description

## Task 1

Our website has a contact form, but we realized we were missing some fields.

Please add the following fields so that they are collected from the user and also make sure to include them in the email sent to the marketing team:

- Phone number
- State (US only)
- Company

## Task 2

Our university catalog page shows a list of all the education providers in our system with a link to "Check eligibility"

This link redirects the user to the eligibility form.

As part of a new business initiative we are going to allow education providers to integrate
with us in a way that allows users to directly access their portals rather than using the eligibility form.

Update the university catalog page so if the elected university is in the new integration program, the user is redirected to their portal.

## Finished the task
Once you are done with your changes, you have to create a git bundle and send it back to us.
To create a bundle run from the root of the assessment:
```bash
git bundle create <your-name>.bundle --all
```

Make sure you included all your commits in the `main` branch and updated any instructions on how to start the project.

## FAQ

### I have questions about some of the requirements

If you need more detail in some requirements, you can make assumptions to unblock you from implementing the feature.
But make sure you add documentation on the assumptions you made, feel free to add those in the form of Q&A in the readme.



### Project updates/documentation

- Must run 'npm run dev' in the project's root directory to start both backend and frontend simultaneously

### Project Questions/Assumptions

- How to define eligibility

I architected the backend around 4 tables: users, providers, provider_integrations, and eligibility_submissions.

The Provider-integrations table is essentially an extension of the providers table that houses all of the different integrations that the provider wants to support. There is one to many relationship between the providers table and the provider-integrations table

The eligibility_submissions table is where the key table in the architecture that will house the logic for determining a user's eligibility
The eligibity_submissions table is a middle table between the users and providers tables, creating a many to many relationship between them

Currently the user of id 1 is hard coded to be the currently logged in user. Authentication/authorization can be implemented at a later time