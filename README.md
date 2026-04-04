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

- What does being elligible actually mean? Is it based on university location and user location?
- Is elligibility based on a user being added to a certain 'group' decided by their employer. If this is the case, a 'group' field of type string can be added to the user model, and a field 'groups' of type string[] can be added to the provider model. The logic to determine elligibility would check if the 'group' string contained by the currently logged in user exists in the provider string[]. If it exists, then they're elligible. 

- Currently for my solution, I have hard coded boolean values for whether a user is 'elligible' for a particular provider. If they're elligible, they get redirected directly to the provider's portal, else they get some feedback that lets them know that they're inelligible.

- I have successfully met the requirements for this assessment I believe, but there's still a ton more work that can be done to further improve the app and handle different edge cases, such as making sure that the user can only input valid data. UX/UI experience can be improved in many ways, maybe providing a drop down list of all usa states as opposed to an open text box, etc. 