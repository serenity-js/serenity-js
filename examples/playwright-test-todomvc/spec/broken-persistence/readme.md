# Persistence API Migration

Covers the migration from the legacy persistence format to the new API contract.
The backend team has updated the localStorage schema from `{ id, name, completed }`
to `{ id, title, done, lastModified }`. These tests verify the application works
correctly with the new data shape.
