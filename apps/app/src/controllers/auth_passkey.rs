#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use webauthn_rs::prelude::*;
use crate::models::{passkeys, users};
use sea_orm::{ActiveModelTrait, ActiveValue, ModelTrait};
use base64::Engine;
use axum::http::HeaderMap;

#[derive(Serialize)]
pub struct PasskeyResponse {
    pub id: i32,
    pub name: String,
    pub created_at: String,
    pub last_used_at: String,
}

impl From<passkeys::Model> for PasskeyResponse {
    fn from(model: passkeys::Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
            created_at: model.created_at.to_rfc3339(),
            last_used_at: model.updated_at.to_rfc3339(),
        }
    }
}

fn parse_user_agent(user_agent: &str) -> String {
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

fn get_webauthn() -> Result<Webauthn> {
    let rp_id = "localhost";
    let rp_origin = Url::parse("http://localhost:3000").map_err(|_e| Error::InternalServerError)?; 
    let builder = WebauthnBuilder::new(rp_id, &rp_origin).map_err(|_e| Error::InternalServerError)?;
    builder.build().map_err(|_| Error::InternalServerError)
}

#[debug_handler]
pub async fn register_start(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let user = crate::models::users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let webauthn = get_webauthn()?;
    let (challenge, state) = webauthn
        .start_passkey_registration(
            user.pid,
            &user.email,
            &user.name,
            None,
        )
        .map_err(|e| {
            tracing::error!("Start passkey registration failed: {:?}", e);
            Error::InternalServerError
        })?;

    let state_str = serde_json::to_string(&state).map_err(|_| Error::InternalServerError)?;
    let encoded_state = base64::engine::general_purpose::STANDARD.encode(state_str);

    format::json(RegisterStartResponseWithState {
        challenge,
        state: encoded_state,
    })
}

#[debug_handler]
pub async fn register_finish(
    auth: auth::JWT,
    headers: HeaderMap,
    State(ctx): State<AppContext>,
    Json(params): Json<RegisterFinishArgs>,
) -> Result<Response> {
    let webauthn = get_webauthn()?;
    
    let decoded_state = base64::engine::general_purpose::STANDARD.decode(&params.state).map_err(|_| Error::BadRequest("Invalid state".into()))?;
    let state: PasskeyRegistration = serde_json::from_slice(&decoded_state).map_err(|_| Error::BadRequest("Invalid state structure".into()))?;

    let passkey = webauthn.finish_passkey_registration(&params.register, &state).map_err(|e| {
        tracing::error!("Finish passkey registration failed: {:?}", e);
        Error::BadRequest("Registration failed".into())
    })?;

    let user_valid = crate::models::users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    
    let user_agent = headers
        .get("user-agent")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("Unknown");
    
    let device_name = parse_user_agent(user_agent);

    let act = passkeys::ActiveModel {
        user_id: ActiveValue::Set(user_valid.id),
        credential_id: ActiveValue::Set(passkey.cred_id().to_vec()),
        public_key: ActiveValue::Set(vec![]), // Dummy value until we find correct field
        sign_count: ActiveValue::Set(0), // Dummy value
        credential_params: ActiveValue::Set(serde_json::to_string(&passkey).unwrap_or_default()),
        name: ActiveValue::Set(device_name),
        ..Default::default()
    };
    act.insert(&ctx.db).await?;

    format::empty()
}


// Re-defining start response to include state
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

// Overwrite register_start to return state
#[debug_handler]
pub async fn register_start_impl(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let user = crate::models::users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let webauthn = get_webauthn()?;
    let (challenge, state) = webauthn
        .start_passkey_registration(
            user.pid,
            &user.email,
            &user.name,
            None,
        )
        .map_err(|e| {
             tracing::error!("Start passkey opt registration failed: {:?}", e);
             Error::InternalServerError
        })?;

    let state_str = serde_json::to_string(&state).map_err(|_| Error::InternalServerError)?;
    let encoded_state = base64::engine::general_purpose::STANDARD.encode(state_str);

    format::json(RegisterStartResponseWithState {
        challenge,
        state: encoded_state,
    })
}

#[derive(Serialize, Deserialize)]
pub struct LoginStartRequest {
    pub email: String,
}

#[debug_handler]
pub async fn login_start(
    State(ctx): State<AppContext>,
    Json(params): Json<LoginStartRequest>,
) -> Result<Response> {
    let user = match crate::models::users::Model::find_by_email(&ctx.db, &params.email).await {
        Ok(user) => user,
        Err(_) => return Err(Error::NotFound),
    };

    let passkeys = user.find_related(passkeys::Entity).all(&ctx.db).await?;
    
    // If no passkeys found for user, we cannot proceed with non-resident key flow
    if passkeys.is_empty() {
        return Err(Error::BadRequest("No passkeys registered for this user".into()));
    }

    let webauthn = get_webauthn()?;
    
    let some_passkeys: Vec<Passkey> = passkeys.iter().filter_map(|p| {
        // Deserialize credential_params which stores the Passkey struct
        serde_json::from_str(&p.credential_params).ok()
    }).collect();

    // Double check if we successfully deserialized any
    if some_passkeys.is_empty() {
         return Err(Error::BadRequest("No valid passkeys found".into()));
    }

    let (challenge, state) = webauthn.start_passkey_authentication(&some_passkeys).map_err(|e| {
        tracing::error!("Start passkey auth failed: {:?}", e);
        Error::InternalServerError
    })?;

    let state_str = serde_json::to_string(&state).map_err(|_| Error::InternalServerError)?;
    let encoded_state = base64::engine::general_purpose::STANDARD.encode(state_str);

    format::json(LoginStartResponseWithState { 
        challenge, 
        state: encoded_state,
    })
}

#[derive(Serialize, Deserialize)]
pub struct AuthFinishArgs {
    pub state: String,
    pub login: PublicKeyCredential,
}

use crate::views::auth::LoginResponse;

#[debug_handler]
pub async fn login_finish(
    State(ctx): State<AppContext>,
    Json(params): Json<AuthFinishArgs>,
) -> Result<Response> {
    let webauthn = get_webauthn()?;
    let decoded_state = base64::engine::general_purpose::STANDARD.decode(&params.state).map_err(|_| Error::BadRequest("Invalid state".into()))?;
    let state: PasskeyAuthentication = serde_json::from_slice(&decoded_state).map_err(|_| Error::BadRequest("Invalid state structure".into()))?;

    let auth_result = webauthn.finish_passkey_authentication(&params.login, &state).map_err(|e| {
        tracing::error!("Finish passkey authentication failed: {:?}", e);
        Error::BadRequest("Authentication failed".into())
    })?;
    
    // Update sign_count and find user
    let passkey = passkeys::Entity::find()
        .filter(passkeys::Column::CredentialId.eq(auth_result.cred_id().to_vec()))
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::Unauthorized("Passkey not found".into()))?;

    // Update counter
    let mut active_passkey: passkeys::ActiveModel = passkey.clone().into();
    active_passkey.sign_count = ActiveValue::Set(auth_result.counter() as i32);
    active_passkey.update(&ctx.db).await?;

    // Find user
    let user = crate::models::users::Entity::find_by_id(passkey.user_id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::Unauthorized("User not found".into()))?;

    // Generate Token
    let jwt_secret = ctx.config.get_jwt_config()?;
    let token = user
        .generate_jwt(&jwt_secret.secret, jwt_secret.expiration)
        .map_err(|_| Error::Unauthorized("Failed to generate token".into()))?;

    format::json(LoginResponse::new(&user, &token, true))
}

#[debug_handler]
pub async fn list(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let user = crate::models::users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let passkeys = user.find_related(passkeys::Entity).all(&ctx.db).await?;
    tracing::info!("User {} has {} passkeys", user.email, passkeys.len());
    let response: Vec<PasskeyResponse> = passkeys.into_iter().map(PasskeyResponse::from).collect();
    format::json(response)
}


#[debug_handler]
pub async fn delete_passkey(
    auth: auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let passkey = passkeys::Entity::find_by_id(id)
        .filter(passkeys::Column::UserId.eq(user.id))
        .one(&ctx.db)
        .await?;

    if let Some(pk) = passkey {
        pk.delete(&ctx.db).await?;
        format::empty()
    } else {
        Err(Error::NotFound)
    }
}

#[derive(Serialize, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub name: Option<String>,
}

#[debug_handler]
pub async fn register(
    State(ctx): State<AppContext>,
    Json(params): Json<RegisterRequest>,
) -> Result<Response> {
    use crate::models::_entities::users as users_entity;
    use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
    
    // Check if user already exists
    let existing = users_entity::Entity::find()
        .filter(users_entity::Column::Email.eq(&params.email))
        .one(&ctx.db)
        .await?;
    
    if existing.is_some() {
        return Err(Error::BadRequest("Email already registered. Please login instead.".into()));
    }
    
    // Create new user
    let user = users::ActiveModel {
        pid: ActiveValue::Set(Uuid::new_v4()),
        email: ActiveValue::Set(params.email.clone()),
        name: ActiveValue::Set(params.name.unwrap_or_else(|| {
            params.email.split('@').next().unwrap_or("User").to_string()
        })),
        password: ActiveValue::Set("".to_string()), // No password for Passkey-only users
        api_key: ActiveValue::Set(Uuid::new_v4().to_string()),
        ..Default::default()
    };
    
    let user = user.insert(&ctx.db).await?;
    
    // Generate JWT
    let jwt_secret = ctx.config.get_jwt_config()?;
    let token = user
        .generate_jwt(&jwt_secret.secret, jwt_secret.expiration)
        .map_err(|_| Error::InternalServerError)?;
    
    format::json(LoginResponse::new(&user, &token, false))
}


pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/auth/passkeys")
        .add("/register/start", post(register_start_impl))
        .add("/register/finish", post(register_finish))
        .add("/login/start", post(login_start))
        .add("/login/finish", post(login_finish))
        .add("/", get(list))
        .add("/{id}", delete(delete_passkey))
}

// Separate route function for user registration (outside passkeys prefix)
pub fn auth_routes() -> Routes {
    Routes::new()
        .prefix("api/auth")
        .add("/register", post(register))
}
