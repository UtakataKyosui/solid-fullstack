use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(m, "items",
            &[
            
            ("id", ColType::PkAuto),
            
            ("name", ColType::String),
            ("description", ColType::StringNull),
            ],
            &[
            ("genre", ""),
            ("location", ""),
            ("user", ""),
            ]
        ).await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "items").await
    }
}
