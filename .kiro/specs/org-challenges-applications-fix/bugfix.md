# Bugfix Requirements Document

## Introduction

Three related bugs are present in the Talent Community platform. Bug 1 prevents any new user from registering because the client sends the name field as `name` while the server expects `fullName`, resulting in a 400 validation error. Bug 2 causes the Organization Challenges page to return a 500 Internal Server Error because the Express route for `GET /my` is declared after the parameterized route `GET /:id`, so Express matches the literal string "my" as a MongoDB ObjectId and throws a CastError. Bug 3 is a downstream consequence of Bug 2: the Organization Applications page fetches `/challenges/my` first, and when that request fails the page errors out before applications are ever loaded.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user submits the registration form THEN the system sends `name` in the request body instead of `fullName`, causing the server to return a 400 error "Full name, email, password, and role are required"

1.2 WHEN an authenticated organization user navigates to the Challenges page THEN the system routes `GET /challenges/my` to the `getPublicChallengeById` handler because `/:id` is declared first, resulting in a 500 Internal Server Error with "Invalid MongoDB ObjectId"

1.3 WHEN an authenticated organization user navigates to the Applications page THEN the system fails to load applications because the prerequisite `GET /challenges/my` request returns a 500 error and the page exits early

### Expected Behavior (Correct)

2.1 WHEN a user submits the registration form THEN the system SHALL send `fullName` in the request body so the server validates it successfully and creates the account

2.2 WHEN an authenticated organization user navigates to the Challenges page THEN the system SHALL route `GET /challenges/my` to the `getMyChallengesHandler` and return the organization's own challenges

2.3 WHEN an authenticated organization user navigates to the Applications page THEN the system SHALL successfully fetch the organization's challenges and subsequently load all associated applications

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user requests `GET /challenges/:id` with a valid MongoDB ObjectId THEN the system SHALL CONTINUE TO route the request to `getPublicChallengeHandler` and return the correct challenge document

3.2 WHEN a user requests `GET /challenges` THEN the system SHALL CONTINUE TO return the public list of all challenges via `browseChallengesHandler`

3.3 WHEN a registered user submits the login form THEN the system SHALL CONTINUE TO authenticate successfully without any changes to the login flow

3.4 WHEN an organization user creates, updates, or changes the status of a challenge THEN the system SHALL CONTINUE TO handle those requests correctly via the existing `POST /challenges`, `PATCH /challenges/:id`, and `PATCH /challenges/:id/status` routes
