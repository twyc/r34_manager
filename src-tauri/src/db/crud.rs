use rusqlite::{params, Result};
use serde::Serialize; 
use crate::db::connection::get_connection;

#[derive(Serialize)] 
pub struct Creator {
    id: i32,
    name: String,
    homepage: String,
    rate: i32,
}

#[derive(Serialize)]
pub struct BlacklistedCreator {
    id: i32,
    creator_id: i32,
    reason: String,
    date: String,
}

#[derive(Serialize)]
pub struct InterestingLink {
    pub id: i32,
    pub url: String,
    pub source: Option<String>,
    pub downloaded: bool,
    pub date: Option<String>,
}

#[tauri::command]
pub fn create_creator(name: String, homepage: String, rate: i32) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO creators (name, homepage, rate) VALUES (?1, ?2, ?3)",
        params![name, homepage, rate],
    )
    .map_err(|e| e.to_string())?;
    Ok("Creator added successfully".to_string())
}


#[tauri::command]
pub fn read_creators() -> Result<Vec<Creator>, String> {
    let conn = get_connection().map_err(|e| {
        println!("Connection error: {}", e);
        e.to_string()
    })?;
    
    let mut stmt = conn.prepare("SELECT id, name, homepage, rate FROM creators").map_err(|e| {
        println!("Prepare error: {}", e);
        e.to_string()
    })?;
    
    let creators = stmt.query_map([], |row| {
        Ok(Creator {
            id: row.get(0)?,
            name: row.get(1)?,
            homepage: row.get(2)?,
            rate: row.get(3)?,
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
pub fn update_creator(id: i32, name: String, homepage: String, rate: i32) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE creators SET name = ?1, homepage = ?2, rate = ?3 WHERE id = ?4",
        params![name, homepage, rate, id],
    )
    .map_err(|e| e.to_string())?;
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

    conn.execute("DELETE FROM sqlite_sequence WHERE name = 'creators'", [])
        .map_err(|e| e.to_string())?;

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

    conn.execute("DELETE FROM sqlite_sequence WHERE name = 'blacklisted_creators'", [])
        .map_err(|e| e.to_string())?;
    Ok("Blacklisted creator deleted successfully".to_string())
}

#[tauri::command]
pub fn create_interesting_link(
    url: String, 
    source: Option<String>, 
    downloaded: bool, 
    date: Option<String>
) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO interesting_links (url, source, downloaded, date) VALUES (?1, ?2, ?3, ?4)",
        params![url, source, downloaded, date],
    )
    .map_err(|e| e.to_string())?;
    Ok("Interesting link added successfully".to_string())
}

#[tauri::command]
pub fn read_interesting_links() -> Result<Vec<InterestingLink>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, url, source, downloaded, date FROM interesting_links")
        .map_err(|e| e.to_string())?;

    let interesting_links = stmt
        .query_map([], |row| {
            Ok(InterestingLink {
                id: row.get(0)?,
                url: row.get(1)?,
                source: row.get(2)?,
                downloaded: row.get(3)?,
                date: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|row| row.ok())
        .collect();

    Ok(interesting_links)
}

#[tauri::command]
pub fn update_interesting_link(
    id: i32, 
    url: String, 
    source: Option<String>, 
    downloaded: bool, 
    date: Option<String>
) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE interesting_links SET url = ?1, source = ?2, downloaded = ?3, date = ?4 WHERE id = ?5",
        params![url, source, downloaded, date, id],
    )
    .map_err(|e| e.to_string())?;
    Ok("Interesting link updated successfully".to_string())
}

#[tauri::command]
pub fn delete_interesting_link(id: i32) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM interesting_links WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM sqlite_sequence WHERE name = 'interesting_links'", [])
        .map_err(|e| e.to_string())?;
    Ok("Interesting link deleted successfully".to_string())
}