
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
         m.create_table(
            Table::create()
                .table(Passkeys::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(Passkeys::Id)
                        .integer()
                        .not_null()
                        .auto_increment()
                        .primary_key(),
                )
                .col(ColumnDef::new(Passkeys::UserId).integer().not_null())
                .col(ColumnDef::new(Passkeys::CredentialId).binary().not_null())
                .col(ColumnDef::new(Passkeys::PublicKey).binary().not_null())
                .col(ColumnDef::new(Passkeys::SignCount).integer().not_null())
                .col(ColumnDef::new(Passkeys::CredentialParams).text().not_null())
                .col(
                    ColumnDef::new(Passkeys::CreatedAt)
                        .timestamp_with_time_zone()
                        .not_null()
                        .default(Expr::current_timestamp()),
                )
                .col(
                    ColumnDef::new(Passkeys::UpdatedAt)
                        .timestamp_with_time_zone()
                        .not_null()
                        .default(Expr::current_timestamp()),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("fk_passkeys_users")
                        .from(Passkeys::Table, Passkeys::UserId)
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.drop_table(Table::drop().table(Passkeys::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Passkeys {
    Table,
    Id,
    UserId,
    CredentialId,
    PublicKey,
    SignCount,
    CredentialParams,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}

