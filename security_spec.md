# Security Specification - Tahwelat

## Data Invariants
1. All data (transactions, accounts, categories) must belong to a valid user.
2. Users can only access (read/write) their own data.
3. Transaction amount must be a positive number (except for logic adjustment if needed, but usually positive stored with type).
4. `userId` in any document must match the authenticated user's `uid`.
5. Timestamps (`createdAt`, `updatedAt`, `timestamp`) must be valid formats.

## The Dirty Dozen Payloads
1. Attempt to create a transaction for another user (`userId` mismatch).
2. Attempt to read another user's transaction.
3. Attempt to update another user's account balance.
4. Attempt to delete another user's category.
5. Create a transaction with a negative amount (if enforced).
6. Create a transaction without a `type`.
7. Update `userId` of a transaction (immutability check).
8. Create a user profile with `role: 'admin'` (if admin exists).
9. Inject 1MB string into `description`.
10. Update `createdAt` after initial creation.
11. List all transactions without a `where` clause on `userId`.
12. Create a transaction with a future timestamp (if restricted, though usually allowed for backlog).

## Rules Logic
- `isValidUser(data)`: Checks keys and types for user profile.
- `isValidTransaction(data)`: Checks keys, types, and userId.
- `isValidAccount(data)`: Checks keys, types, and userId.
- `isOwner(userId)`: `request.auth.uid == userId`.
