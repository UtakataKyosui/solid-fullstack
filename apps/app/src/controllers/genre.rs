#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

    use crate::models::{
        _entities::genres::{ActiveModel, Entity, Model, Column},
        // users,  // TODO: Re-enable when authentication is restored
    };
    
    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct Params {
        pub name: String,
        pub color: String,
    }
    
    impl Params {
        fn update(&self, item: &mut ActiveModel) {
            item.name = Set(self.name.clone());
            item.color = Set(self.color.clone());
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
    pub async fn list(/* auth: auth::JWT, */ State(ctx): State<AppContext>) -> Result<Response> {
        // TODO: Re-enable authentication
        let user_id = 1; // Temporary test user
        format::json(Entity::find().filter(Column::UserId.eq(user_id)).all(&ctx.db).await?)
    }
    
    #[debug_handler]
    pub async fn add(/* auth: auth::JWT, */ State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
        // TODO: Re-enable authentication
        let user_id = 1; // Temporary test user
        let mut item = ActiveModel {
            user_id: Set(user_id),
           ..Default::default()
        };
        params.update(&mut item);
        let item = item.insert(&ctx.db).await?;
        format::json(item)
    }
    
    #[debug_handler]
    pub async fn update(
        // auth: auth::JWT,
        Path(id): Path<i32>,
        State(ctx): State<AppContext>,
        Json(params): Json<Params>,
    ) -> Result<Response> {
        // TODO: Re-enable authentication
        let user_id = 1; // Temporary test user
        let mut item = load_item(&ctx, id, user_id).await?.into_active_model();
        params.update(&mut item);
        let item = item.update(&ctx.db).await?;
        format::json(item)
    }
    
    #[debug_handler]
    pub async fn remove(/* auth: auth::JWT, */ Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
        // TODO: Re-enable authentication
        let user_id = 1; // Temporary test user
        load_item(&ctx, id, user_id).await?.delete(&ctx.db).await?;
        format::empty()
    }
    
    #[debug_handler]
    pub async fn get_one(/* auth: auth::JWT, */ Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
        // TODO: Re-enable authentication
        let user_id = 1; // Temporary test user
        format::json(load_item(&ctx, id, user_id).await?)
    }
    
    pub fn routes() -> Routes {
        Routes::new()
            .prefix("api/genres")
            .add("/", get(list))
            .add("/", post(add))
            .add("/{id}", get(get_one))
            .add("/{id}", delete(remove))
            .add("/{id}", put(update))
            .add("/{id}", patch(update))
    }
