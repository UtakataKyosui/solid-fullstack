use serde::{Deserialize, Serialize};

use crate::models::_entities::users;

#[derive(Debug, Deserialize, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub pid: String,
    pub name: String,
    pub email: String,
    pub is_verified: bool,
    pub has_passkey: bool,
}

impl LoginResponse {
    #[must_use]
    pub fn new(user: &users::Model, token: &String, has_passkey: bool) -> Self {
        Self {
            token: token.to_string(),
            pid: user.pid.to_string(),
            name: user.name.clone(),
            email: user.email.clone(),
            is_verified: user.email_verified_at.is_some(),
            has_passkey,
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CurrentResponse {
    pub pid: String,
    pub name: String,
    pub email: String,
    pub has_passkey: bool,
}

impl CurrentResponse {
    #[must_use]
    pub fn new(user: &users::Model, has_passkey: bool) -> Self {
        Self {
            pid: user.pid.to_string(),
            name: user.name.clone(),
            email: user.email.clone(),
            has_passkey,
        }
    }
}
