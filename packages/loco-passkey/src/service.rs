//! generate command:
//! `cargo loco generate scaffold passkeys user_id:references credential_id:binary public_key:binary sign_count:int credential_params:text name:string`
use webauthn_rs::prelude::*;
use base64::Engine;
use crate::types::*;
use uuid::Uuid;
use anyhow::Result;

pub struct PasskeyService {
    webauthn: Webauthn,
}

impl PasskeyService {
    pub fn new(rp_id: &str, rp_origin: &str) -> Result<Self> {
        let rp_origin_url = Url::parse(rp_origin).map_err(|e| anyhow::anyhow!(e))?;
        let builder = WebauthnBuilder::new(rp_id, &rp_origin_url).map_err(|e| anyhow::anyhow!(e))?;
        let webauthn = builder
            .rp_name(rp_id)
            .build()
            .map_err(|e| anyhow::anyhow!(e))?;
        
        Ok(Self { webauthn })
    }

    pub fn start_registration(
        &self,
        user_pid: Uuid,
        user_email: &str,
        user_name: &str,
    ) -> Result<(CreationChallengeResponse, PasskeyRegistration)> {
        self.webauthn.start_passkey_registration(
            user_pid,
            user_email,
            user_name,
            None,
        )
        .map_err(|e| anyhow::anyhow!(e))
    }

    /// Starts registration and returns a response structure containing the base64 encoded state.
    pub fn start_registration_with_state(
        &self,
        user_pid: Uuid,
        user_email: &str,
        user_name: &str,
    ) -> Result<RegisterStartResponseWithState> {
        let (challenge, state) = self.start_registration(user_pid, user_email, user_name)?;
        let state_str = serde_json::to_string(&state).map_err(|e| anyhow::anyhow!(e))?;
        let encoded_state = base64::engine::general_purpose::STANDARD.encode(state_str);
        
        Ok(RegisterStartResponseWithState {
            challenge,
            state: encoded_state,
        })
    }

    pub fn finish_registration(
        &self,
        state: &PasskeyRegistration,
        register: &RegisterPublicKeyCredential,
    ) -> Result<Passkey> {
        self.webauthn.finish_passkey_registration(register, state)
            .map_err(|e| anyhow::anyhow!(e))
    }

    /// Finishes registration using a base64 encoded state string.
    pub fn finish_registration_with_state(
        &self,
        state_str: &str,
        register: &RegisterPublicKeyCredential,
    ) -> Result<Passkey> {
        let decoded_state = base64::engine::general_purpose::STANDARD.decode(state_str)
            .map_err(|e| anyhow::anyhow!("Failed to decode state: {}", e))?;
        let state: PasskeyRegistration = serde_json::from_slice(&decoded_state)
            .map_err(|e| anyhow::anyhow!("Failed to deserialize state: {}", e))?;
        
        self.finish_registration(&state, register)
    }

    pub fn start_authentication(
        &self,
        passkeys: &[Passkey],
    ) -> Result<(RequestChallengeResponse, PasskeyAuthentication)> {
        self.webauthn.start_passkey_authentication(passkeys)
            .map_err(|e| anyhow::anyhow!(e))
    }

    /// Starts authentication and returns a response structure containing the base64 encoded state.
    pub fn start_authentication_with_state(
         &self,
         passkeys: &[Passkey],
    ) -> Result<LoginStartResponseWithState> {
        let (challenge, state) = self.start_authentication(passkeys)?;
        let state_str = serde_json::to_string(&state).map_err(|e| anyhow::anyhow!(e))?;
        let encoded_state = base64::engine::general_purpose::STANDARD.encode(state_str);

        Ok(LoginStartResponseWithState {
            challenge,
            state: encoded_state,
        })
    }

    pub fn finish_authentication(
        &self,
        state: &PasskeyAuthentication,
        login: &PublicKeyCredential,
    ) -> Result<AuthenticationResult> {
        self.webauthn.finish_passkey_authentication(login, state).map_err(|e| anyhow::anyhow!(e))
    }

    /// Finishes authentication using a base64 encoded state string.
    pub fn finish_authentication_with_state(
        &self,
        state_str: &str,
        login: &PublicKeyCredential,
    ) -> Result<AuthenticationResult> {
        let decoded_state = base64::engine::general_purpose::STANDARD.decode(state_str)
            .map_err(|e| anyhow::anyhow!("Failed to decode state: {}", e))?;
        let state: PasskeyAuthentication = serde_json::from_slice(&decoded_state)
            .map_err(|e| anyhow::anyhow!("Failed to deserialize state: {}", e))?;
        
        self.finish_authentication(&state, login)
    }

    /// Parses a list of JSON strings (credential params) into Passkey objects.
    pub fn parse_passkeys(credential_params_list: &[String]) -> Vec<Passkey> {
        credential_params_list
            .iter()
            .filter_map(|json| serde_json::from_str(json).ok())
            .collect()
    }
}

pub fn parse_user_agent(user_agent: &str) -> String {
    let ua = user_agent.to_lowercase();
    if ua.contains("windows") {
        if ua.contains("chrome") { "Chrome on Windows".to_string() }
        else if ua.contains("firefox") { "Firefox on Windows".to_string() }
        else { "Windows Device".to_string() }
    } else if ua.contains("mac os") || ua.contains("macintosh") {
         if ua.contains("chrome") { "Chrome on macOS".to_string() }
         else if ua.contains("safari") { "Safari on macOS".to_string() }
         else if ua.contains("firefox") { "Firefox on macOS".to_string() }
         else { "Mac Device".to_string() }
    } else if ua.contains("android") {
        "Android Device".to_string()
    } else if ua.contains("iphone") || ua.contains("ipad") {
        "iOS Device".to_string()
    } else if ua.contains("linux") {
        "Linux Device".to_string()
    } else {
        "Unknown Device".to_string()
    }
}
