#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use crate::models::{passkeys, users};
use sea_orm::{ActiveValue, ModelTrait, QueryFilter, ColumnTrait, EntityTrait};
use axum::http::HeaderMap;

use loco_passkey::{
    PasskeyService,
    types::*,
    service::parse_user_agent
};
use serde::Serialize;

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

fn get_service() -> Result<PasskeyService> {
    PasskeyService::new("localhost", "http://localhost:3300") // TODO: Configから取得
        .map_err(|e| {
            tracing::error!("Service config error: {:?}", e);
            Error::InternalServerError
        })
}

#[debug_handler]
pub async fn register_start(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let service = get_service()?;

    // 新しいAPI: One-liner
    let response = service.start_registration_with_state(user.pid, &user.email, &user.name)
        .map_err(|e| {
            tracing::error!("Start passkey registration failed: {:?}", e);
            Error::InternalServerError
        })?;

    format::json(response)
}

#[debug_handler]
pub async fn register_finish(
    auth: auth::JWT,
    headers: HeaderMap,
    State(ctx): State<AppContext>,
    Json(params): Json<RegisterFinishArgs>,
) -> Result<Response> {
    let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let service = get_service()?;
    
    // 新しいAPI: Stateデコードも隠蔽
    let passkey = service.finish_registration_with_state(
        &params.state,
        &params.register,
    ).map_err(|e| {
        tracing::error!("Finish passkey registration failed: {:?}", e);
        Error::BadRequest("Registration failed".into())
    })?;

    let user_agent = headers
        .get("user-agent")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("Unknown");
    let device_name = parse_user_agent(user_agent);

    let act = passkeys::ActiveModel {
        user_id: ActiveValue::Set(user.id),
        credential_id: ActiveValue::Set(passkey.cred_id().to_vec()),
        public_key: ActiveValue::Set(vec![]),
        sign_count: ActiveValue::Set(0),
        credential_params: ActiveValue::Set(serde_json::to_string(&passkey).unwrap_or_default()),
        name: ActiveValue::Set(device_name),
        ..Default::default()
    };
    act.insert(&ctx.db).await?;

    format::empty()
}

#[debug_handler]
pub async fn register_start_impl(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
     register_start(auth, State(ctx)).await
}

#[debug_handler]
pub async fn login_start(
    State(ctx): State<AppContext>,
    Json(params): Json<LoginStartRequest>,
) -> Result<Response> {
    let user = match users::Model::find_by_email(&ctx.db, &params.email).await {
        Ok(user) => user,
        Err(_) => return Err(Error::NotFound),
    };

    let user_passkeys = user.find_related(passkeys::Entity).all(&ctx.db).await?;

    if user_passkeys.is_empty() {
        return Err(Error::BadRequest("No passkeys registered for this user".into()));
    }

    // 新しいAPI: パース処理の隠蔽
    let credential_params_list: Vec<String> = user_passkeys.iter().map(|p| p.credential_params.clone()).collect();
    let some_passkeys = PasskeyService::parse_passkeys(&credential_params_list);

    if some_passkeys.is_empty() {
         return Err(Error::BadRequest("No valid passkeys found".into()));
    }

    let service = get_service()?;
    
    // 新しいAPI: One-liner
    let response = service.start_authentication_with_state(&some_passkeys)
        .map_err(|e| {
             tracing::error!("Start passkey auth failed: {:?}", e);
             Error::InternalServerError
        })?;

    format::json(response)
}

use crate::views::auth::LoginResponse;

#[debug_handler]
pub async fn login_finish(
    State(ctx): State<AppContext>,
    Json(params): Json<AuthFinishArgs>,
) -> Result<Response> {
    let service = get_service()?;

    // 新しいAPI: Stateデコードも隠蔽
    let auth_result = service.finish_authentication_with_state(
        &params.state,
        &params.login
    ).map_err(|e| {
        tracing::error!("Finish passkey authentication failed: {:?}", e);
        Error::BadRequest("Authentication failed".into())
    })?;

    let passkey = passkeys::Entity::find()
        .filter(passkeys::Column::CredentialId.eq(auth_result.cred_id().to_vec()))
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::Unauthorized("Passkey not found".into()))?;

    let mut active_passkey: passkeys::ActiveModel = passkey.clone().into();
    active_passkey.sign_count = ActiveValue::Set(auth_result.counter() as i32);
    active_passkey.update(&ctx.db).await?;

    let user = users::Entity::find_by_id(passkey.user_id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::Unauthorized("User not found".into()))?;

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
    let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let user_passkeys = user.find_related(passkeys::Entity).all(&ctx.db).await?;
        
    tracing::info!("User {} has {} passkeys", user.email, user_passkeys.len());
    let response: Vec<PasskeyResponse> = user_passkeys.into_iter().map(PasskeyResponse::from).collect();
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

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/auth/passkeys")
        .add("/register/start", post(register_start))
        .add("/register/finish", post(register_finish))
        .add("/login/start", post(login_start))
        .add("/login/finish", post(login_finish))
        .add("/", get(list))
        .add("/{id}", delete(delete_passkey))
}
