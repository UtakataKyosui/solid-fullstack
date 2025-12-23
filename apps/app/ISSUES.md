# Known Issues

## Bug: Passkey List Not Displaying
- **Status**: Open
- **Date**: 2025-12-23
- **Description**: After successfully registering a new Passkey, the list of registered passkeys is not updating or displaying in the Security section of the Dashboard. The section displays "No passkeys registered".
- **Steps to Reproduce**:
  1. Login to the application.
  2. Navigate to Dashboard.
  3. Click "Register New Passkey".
  4. Complete the WebAuthn registration flow.
  5. Observation: The UI does not show the newly added passkey in the list.
- **Current Investigation Status**:
  - Backend API `/api/auth/passkeys/` is implemented.
  - Frontend is calling the API.
  - Database seems to have the record (registration succeeds).
  - Backend routing issue was fixed (panic on duplicate route), but list is still empty or not returning data as expected.
  - Logging indicates successful fetching but potentially empty data or frontend not reacting.
- **Possible Causes**:
  - `user.find_related(passkeys::Entity)` might not be working as expected in Loco/SeaORM.
  - Frontend state update timing issue (though `fetchPasskeys` is called on success).
  - Serialization/Mapping issue in `PasskeyResponse`.
