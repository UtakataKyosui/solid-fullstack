#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

    use crate::models::{
        _entities::locations::{ActiveModel, Entity, Model, Column},
        users,
    };
    
    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct Params {
        pub name: String,
        pub description: Option<String>,
        pub genre_id: i32,
    }
    
    impl Params {
        fn update(&self, item: &mut ActiveModel) {
            item.name = Set(self.name.clone());
            item.description = Set(self.description.clone());
            item.genre_id = Set(self.genre_id);
        }
    }
    
    async fn load_item(ctx: &AppContext, id: i32, user_id: i32) -> Result<Model> {
        let item = Entity::find_by_id(id)
            .filter(Column::UserId.eq(user_id))
            .one(&ctx.db)
            .await?;
        item.ok_or_else(|| Error::NotFound)
    }
    
    #[debug_handler]
    pub async fn list(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
        let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
        format::json(Entity::find().filter(Column::UserId.eq(user.id)).all(&ctx.db).await?)
    }
    
    #[debug_handler]
    pub async fn add(auth: auth::JWT, State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
        let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
        let mut item = ActiveModel {
            user_id: Set(user.id),
            ..Default::default()
        };
        params.update(&mut item);
        let item = item.insert(&ctx.db).await?;
        format::json(item)
    }
    
    #[debug_handler]
    pub async fn update(
        auth: auth::JWT,
        Path(id): Path<i32>,
        State(ctx): State<AppContext>,
        Json(params): Json<Params>,
    ) -> Result<Response> {
        let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
        let item = load_item(&ctx, id, user.id).await?;
        let mut item = item.into_active_model();
        params.update(&mut item);
        let item = item.update(&ctx.db).await?;
        format::json(item)
    }
    
    #[debug_handler]
    pub async fn remove(auth: auth::JWT, Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
        let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
        load_item(&ctx, id, user.id).await?.delete(&ctx.db).await?;
        format::empty()
    }
    
    #[debug_handler]
    pub async fn get_one(auth: auth::JWT, Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
        let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
        format::json(load_item(&ctx, id, user.id).await?)
    }
    
    pub fn routes() -> Routes {
        Routes::new()
            .prefix("api/locations/")
            .add("/", get(list))
            .add("/", post(add))
            .add("{id}", get(get_one))
            .add("{id}", delete(remove))
            .add("{id}", put(update))
            .add("{id}", patch(update))
    }
