use serde::{Deserialize, Serialize};
use webauthn_rs::prelude::*;
use uuid::Uuid;

// PasskeyResponse removed as it depends on entity model

#[derive(Serialize, Deserialize)]
pub struct RegisterStartResponse {
    pub challenge: CreationChallengeResponse,
}

#[derive(Serialize, Deserialize)]
pub struct RegisterFinishArgs {
    pub state: String,
    pub register: RegisterPublicKeyCredential,
}

#[derive(Serialize, Deserialize)]
pub struct LoginStartResponse {
    pub challenge: RequestChallengeResponse,
}

#[derive(Serialize, Deserialize)]
pub struct LoginFinishRequest {
    pub challenge_id: Uuid,
    pub login: PublicKeyCredential,
}

#[derive(Serialize, Deserialize)]
pub struct RegisterStartResponseWithState {
    pub challenge: CreationChallengeResponse,
    pub state: String,
}

#[derive(Serialize, Deserialize)]
pub struct LoginStartResponseWithState {
    pub challenge: RequestChallengeResponse,
    pub state: String,
}

#[derive(Serialize, Deserialize)]
pub struct LoginStartRequest {
    pub email: String,
}

#[derive(Serialize, Deserialize)]
pub struct AuthFinishArgs {
    pub state: String,
    pub login: PublicKeyCredential,
}
