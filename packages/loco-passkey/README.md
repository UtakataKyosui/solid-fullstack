# Loco Passkey

A pure Rust helper library for implementing Passkey (WebAuthn) authentication in [Loco.rs](https://loco.rs/) applications.

This crate provides a high-level API wrapper around [webauthn-rs](https://github.com/kanidm/webauthn-rs), handling the complexities of the WebAuthn ceremony (registration and authentication flows) while remaining database-agnostic.

## Features

- **Database Agnostic**: Does not depend on any specific ORM or database schema. You handle the storage.
- **High-Level API**: Provides helper methods that handle `base64` encoding/decoding and `JSON` serialization of the WebAuthn state, simplifying controller logic.
- **Pure Rust**: Built for the Rust ecosystem.

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
loco-passkey = { path = "../../packages/loco-passkey" } # Adjust path as needed
```

## Usage

### 1. Initialize Service

```rust
use loco_passkey::PasskeyService;

let service = PasskeyService::new("localhost", "http://localhost:3000")?;
```

### 2. Registration Flow

```rust
// Start Registration
let response = service.start_registration_with_state(user_uuid, "user@example.com", "User Name")?;
// Returns a JSON-serializable response containing the challenge and encoded state.

// Finish Registration
let passkey = service.finish_registration_with_state(&state_str, &register_response)?;
// Returns a Passkey object. You are responsible for saving this to your database.
```

### 3. Authentication Flow

```rust
// Start Authentication
// You need to fetch existing passkeys from your DB and convert them to `Vec<Passkey>`
let passkeys = PasskeyService::parse_passkeys(&json_list); 
let response = service.start_authentication_with_state(&passkeys)?;

// Finish Authentication
let result = service.finish_authentication_with_state(&state_str, &login_response)?;
// Returns authentication result. You should update the sign_count in your DB.
```

## Model Reference

While this library is DB-agnostic, here is a recommended model schema for Loco (SeaORM) users:

```bash
cargo loco generate scaffold passkeys user_id:references credential_id:binary public_key:binary sign_count:int credential_params:text name:string
```
