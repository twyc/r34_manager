use rusqlite::{params, Result};
use serde::Serialize; 
use crate::db::connection::get_connection;

#[derive(Serialize)] // This allows Rust to convert the struct into a JSON object
pub struct Creator {
    id: i32,
    name: String,
    homepage: String,
}

#[derive(Serialize)]
pub struct BlacklistedCreator {
    id: i32,
    creator_id: i32,
    reason: String,
    date: String,
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

#[tauri::command]
pub fn create_blacklisted_creator(creator_id: i32, reason: String, date: String) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO blacklisted_creators (creator_id, reason, date) VALUES (?1, ?2, ?3)",
        params![creator_id, reason, date],
    )
    .map_err(|e| e.to_string())?;
    Ok("Blacklisted creator added successfully".to_string())
}

#[tauri::command]
pub fn read_blacklisted_creators() -> Result<Vec<BlacklistedCreator>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, creator_id, reason, date FROM blacklisted_creators")
        .map_err(|e| e.to_string())?;

    let blacklisted_creators = stmt
        .query_map([], |row| {
            Ok(BlacklistedCreator {
                id: row.get(0)?,
                creator_id: row.get(1)?,
                reason: row.get(2)?,
                date: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|row| row.ok())
        .collect();

    Ok(blacklisted_creators)
}

#[tauri::command]
pub fn update_blacklisted_creator(id: i32, creator_id: i32, reason: String, date: String) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE blacklisted_creators SET creator_id = ?1, reason = ?2, date = ?3 WHERE id = ?4",
        params![creator_id, reason, date, id],
    )
    .map_err(|e| e.to_string())?;
    Ok("Blacklisted creator updated successfully".to_string())
}

#[tauri::command]
pub fn delete_blacklisted_creator(id: i32) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM blacklisted_creators WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;
    Ok("Blacklisted creator deleted successfully".to_string())
}
