
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Passkeys::Table)
                .add_column(
                    ColumnDef::new(Passkeys::Name)
                        .string()
                        .not_null()
                        .default("Unknown Device".to_string()),
                )
                .to_owned(),
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Passkeys::Table)
                .drop_column(Passkeys::Name)
                .to_owned(),
        )
        .await
    }
}

#[derive(DeriveIden)]
enum Passkeys {
    Table,
    Name,
}
