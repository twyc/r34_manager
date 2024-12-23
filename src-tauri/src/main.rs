use tauri::{generate_context, Builder};
mod db;

use db::connection::initialize_database;
use db::crud::{create_creator, read_creators, update_creator, delete_creator};


fn main() {
    println!("Starting application");
    
    // Test each command is registered
    let commands = vec!["create_creator", "read_creators", "update_creator", "delete_creator"];
    println!("Registered commands: {:?}", commands);
    
    if let Err(e) = initialize_database() {
        eprintln!("Error initializing database: {}", e);
        return;
    }
    println!("Database initialized successfully");

    Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_creator,
            read_creators,
            update_creator,
            delete_creator
        ])
        .setup(|_app| {
            println!("Tauri app setup complete");
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running Tauri application");
}