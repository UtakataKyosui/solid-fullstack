use app::{models::users, views::auth::LoginResponse};
use axum::http::{HeaderName, HeaderValue};
use loco_rs::{app::AppContext, TestServer};
use uuid::Uuid;

const USER_PASSWORD: &str = "1234";

pub struct LoggedInUser {
    pub user: users::Model,
    pub token: String,
}

pub async fn init_user_login(request: &TestServer, ctx: &AppContext) -> LoggedInUser {
    let random_email = format!("test_{}@loco.com", Uuid::new_v4());

    let register_payload = serde_json::json!({
        "name": "loco",
        "email": random_email,
        "password": USER_PASSWORD
    });

    //Creating a new user
    let res = request
        .post("/api/auth/register")
        .json(&register_payload)
        .await;
    
    if res.status_code() != 200 {
        panic!("Register failed: {}", res.text());
    }

    let user = users::Model::find_by_email(&ctx.db, &random_email)
        .await
        .expect("User should exist after registration");

    let verify_payload = serde_json::json!({
        "token": user.email_verification_token,
    });

    request.post("/api/auth/verify").json(&verify_payload).await;

    let response = request
        .post("/api/auth/login")
        .json(&serde_json::json!({
            "email": random_email,
            "password": USER_PASSWORD
        }))
        .await;

    let login_response: LoginResponse = serde_json::from_str(&response.text()).unwrap();

    LoggedInUser {
        user: users::Model::find_by_email(&ctx.db, &random_email)
            .await
            .unwrap(),
        token: login_response.token,
    }
}

pub fn auth_header(token: &str) -> (HeaderName, HeaderValue) {
    let auth_header_value = HeaderValue::from_str(&format!("Bearer {}", &token)).unwrap();

    (HeaderName::from_static("authorization"), auth_header_value)
}
