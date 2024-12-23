use rusqlite::{params, Result};
use serde::Serialize; 
use crate::db::connection::get_connection;

#[derive(Serialize)] // This allows Rust to convert the struct into a JSON object
pub struct Creator {
    id: i32,
    name: String,
    homepage: String,
}

#[tauri::command]
pub fn create_creator(name: String, homepage: String) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO creators (name, homepage) VALUES (?1, ?2)",
        params![name, homepage],
    ).map_err(|e| e.to_string())?;
    Ok("Creator added successfully".to_string())
}

#[tauri::command]
pub fn read_creators() -> Result<Vec<Creator>, String> {
    let conn = get_connection().map_err(|e| {
        println!("Connection error: {}", e);
        e.to_string()
    })?;
    
    let mut stmt = conn.prepare("SELECT id, name, homepage FROM creators").map_err(|e| {
        println!("Prepare error: {}", e);
        e.to_string()
    })?;
    
    let creators = stmt.query_map([], |row| {
        Ok(Creator {
            id: row.get(0)?,
            name: row.get(1)?,
            homepage: row.get(2)?,
        })
    })
    .map_err(|e| {
        println!("Query error: {}", e);
        e.to_string()
    })?
    .filter_map(|row| row.ok())
    .collect();
    
    println!("Successfully read creators");
    Ok(creators)
}

#[tauri::command]
pub fn update_creator(id: i32, name: String, homepage: String) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE creators SET name = ?1, homepage = ?2 WHERE id = ?3",
        params![name, homepage, id],
    ).map_err(|e| e.to_string())?;
    Ok("Creator updated successfully".to_string())
}

#[tauri::command]
pub fn delete_creator(id: i32) -> Result<String, String> {
    println!("Delete creator called with id: {}", id);
    
    let conn = get_connection().map_err(|e| {
        println!("Connection error: {}", e);
        e.to_string()
    })?;
    
    let result = conn.execute(
        "DELETE FROM creators WHERE id = ?1",
        params![id],
    );
    
    match result {
        Ok(rows) => {
            println!("Deleted {} rows", rows);
            Ok(format!("Successfully deleted {} rows", rows))
        }
        Err(e) => {
            println!("Delete error: {}", e);
            Err(e.to_string())
        }
    }
}