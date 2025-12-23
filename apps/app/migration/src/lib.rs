#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;
mod m20220101_000001_users;

mod m20251222_171735_passkeys;
mod m20251222_235121_genres;
mod m20251222_235300_locations;
mod m20251222_235408_items;
mod m20251223_012420_add_name_to_passkeys;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_users::Migration),
            Box::new(m20251222_171735_passkeys::Migration),
            Box::new(m20251222_235121_genres::Migration),
            Box::new(m20251222_235300_locations::Migration),
            Box::new(m20251222_235408_items::Migration),
            Box::new(m20251223_012420_add_name_to_passkeys::Migration),
            // inject-above (do not remove this comment)
        ]
    }
}