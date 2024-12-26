use rusqlite::{params, Result};
use serde::Serialize; 
use crate::db::connection::get_connection;
use regex::Regex;
use url::Url;

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
    name: String,
}

#[derive(Serialize)]
pub struct InterestingLink {
    pub id: i32,
    pub url: String,
    pub source: String,
    pub downloaded: bool,
    pub date: Option<String>,
}

fn sanitize_input(input: &str) -> Option<String> {
    let re = Regex::new(r"^[a-zA-Z0-9\s]*$").unwrap(); 
    if re.is_match(input) {
        Some(input.to_string())
    } else {
        None
    }
}

fn sanitize_urls(homepage: &str) -> Option<String> {
    if Url::parse(homepage).is_ok() {
        Some(homepage.to_string())
    } else {
        None
    }
}

#[tauri::command]
pub fn create_creator(name: String, homepage: String, rate: i32) -> Result<String, String> {
    let safe_name = sanitize_input(&name).ok_or("Invalid name input")?;
    let safe_homepage = sanitize_urls(&homepage).ok_or("Invalid homepage input")?;
    let safe_rate = if rate >= 0 && rate <= 10 { rate } else { return Err("Rate must be between 0 and 10".to_string()); };

    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO creators (name, homepage, rate) VALUES (?1, ?2, ?3)",
        params![safe_name, safe_homepage, safe_rate],
    ).map_err(|e| format!("Database error: {}", e))?;
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
    if id <= 0 {
        return Err("Invalid ID".to_string());
    }
    let safe_name = sanitize_input(&name).ok_or("Invalid name input")?;
    let safe_homepage = sanitize_urls(&homepage).ok_or("Invalid homepage input")?;
    let safe_rate = if rate >= 0 && rate <= 10 { rate } else { return Err("Rate must be between 0 and 10".to_string()); };

    let conn = get_connection().map_err(|e| e.to_string())?;
    let rows_affected = conn.execute(
        "UPDATE creators SET name = ?1, homepage = ?2, rate = ?3 WHERE id = ?4",
        params![safe_name, safe_homepage, safe_rate, id],
    ).map_err(|e| format!("Database error: {}", e))?;

    if rows_affected == 0 {
        return Err("No creator found with the specified ID".to_string());
    }

    Ok("Creator updated successfully".to_string())
}

#[tauri::command]
pub fn delete_creator(id: i32) -> Result<String, String> {
    if id <= 0 {
        return Err("Invalid ID".to_string());
    }

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
pub fn create_blacklisted_creator(
    creator_id: i32,
    reason: String,
    date: String,
) -> Result<String, String> {
    println!("create_blacklisted_creator called with creator_id: {}, reason: {}, date: {}", creator_id, reason, date);

    let safe_reason = sanitize_input(&reason).ok_or("Invalid reason input")?;

    let conn = get_connection().map_err(|e| {
        println!("Connection error: {}", e);
        e.to_string()
    })?;

    let creator_exists: bool = conn
        .prepare("SELECT EXISTS(SELECT 1 FROM creators WHERE id = ?1)")
        .map_err(|e| {
            println!("Prepare error for creator existence check: {}", e);
            e.to_string()
        })?
        .query_row(params![creator_id], |row| row.get(0))
        .map_err(|e| {
            println!("Query error for creator existence check: {}", e);
            e.to_string()
        })?;
    println!("Creator existence check result: {}", creator_exists);

    if !creator_exists {
        println!("Invalid creator ID: {}", creator_id);
        return Err("Invalid creator ID".to_string());
    }

    conn.execute(
        "INSERT INTO blacklisted_creators (creator_id, reason, date) VALUES (?1, ?2, ?3)",
        params![creator_id, safe_reason, date],
    )
    .map_err(|e| {
        println!("Insert error: {}", e);
        e.to_string()
    })?;

    println!("Blacklisted creator added successfully");
    Ok("Blacklisted creator added successfully".to_string())
}

#[tauri::command]
pub fn read_blacklisted_creators() -> Result<Vec<BlacklistedCreator>, String> {
    let conn = get_connection().map_err(|e| {
        println!("Connection error: {}", e);
        e.to_string()
    })?;

    let mut stmt = conn.prepare(
        "SELECT bc.id, bc.creator_id, bc.reason, bc.date, c.name 
         FROM blacklisted_creators bc join creators c on bc.creator_id = c.id",
    ).map_err(|e| {
        println!("Prepare error: {}", e);
        e.to_string()
    })?;

    let blacklisted_creators = stmt
        .query_map([], |row| {
            Ok(BlacklistedCreator {
                id: row.get(0)?,
                creator_id: row.get(1)?,
                reason: row.get(2)?,
                date: row.get(3)?, 
                name: row.get(4)?,
            })
        })
        .map_err(|e| {
            println!("Query error: {}", e);
            e.to_string()
        })?
        .filter_map(|row| row.ok())
        .collect::<Vec<_>>();

    println!("Successfully read blacklisted creators");
    Ok(blacklisted_creators)
}

#[tauri::command]
pub fn update_blacklisted_creator(id: i32, creator_id: i32, reason: String, date: String) -> Result<String, String> {
    let safe_id = if id > 0 { id } else { 0 };
    let safe_creator_id = if creator_id > 0 { creator_id } else { 0 };
    let safe_reason = sanitize_input(&reason);
    let safe_date = sanitize_input(&date);

    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE blacklisted_creators SET creator_id = ?1, reason = ?2, date = ?3 WHERE id = ?4",
        params![safe_creator_id, safe_reason, safe_date, safe_id],
    )
    .map_err(|e| e.to_string())?;
    Ok("Blacklisted creator updated successfully".to_string())
}

#[tauri::command]
pub fn delete_blacklisted_creator(id: i32) -> Result<String, String> {
    if id <= 0 {
        return Err("Invalid ID".to_string());
    }

    let conn = get_connection().map_err(|e| e.to_string())?;
    let rows_affected = conn.execute(
        "DELETE FROM blacklisted_creators WHERE id = ?1",
        params![id],
    ).map_err(|e| format!("Database error: {}", e))?;

    conn.execute("DELETE FROM sqlite_sequence WHERE name = 'blacklisted_creators'", [])
        .map_err(|e| e.to_string())?;

    if rows_affected == 0 {
        return Err("No blacklisted creator found with the specified ID".to_string());
    }

    Ok(format!("Successfully deleted {} rows", rows_affected))
}

#[tauri::command]
pub fn create_interesting_link(
    url: String,
    source: String,
    downloaded: bool,
    date: Option<String>,
) -> Result<String, String> {
    let safe_url = sanitize_urls(&url).ok_or("Invalid URL input")?;
    let safe_source = sanitize_input(&source);

    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO interesting_links (url, source, downloaded, date) VALUES (?1, ?2, ?3, ?4)",
        params![safe_url, safe_source, downloaded, date],
    ).map_err(|e| format!("Insert error: {}", e))?;

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
    source: String, 
    downloaded: bool, 
    date: Option<String>
) -> Result<String, String> {
    if id <= 0 {
        return Err("Invalid ID".to_string());
    }

    let safe_url = sanitize_urls(&url);
    let safe_source =  sanitize_input(&source);

    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE interesting_links SET url = ?1, source = ?2, downloaded = ?3, date = ?4 WHERE id = ?5",
        params![safe_url, safe_source, downloaded, date, id],
    )
    .map_err(|e| e.to_string())?;
    Ok("Interesting link updated successfully".to_string())
}


#[tauri::command]
pub fn delete_interesting_link(id: i32) -> Result<String, String> {
    if id <= 0 {
        return Err("Invalid ID".to_string());
    }

    let conn = get_connection().map_err(|e| e.to_string())?;
    let rows_affected = conn.execute(
        "DELETE FROM interesting_links WHERE id = ?1",
        params![id],
    ).map_err(|e| format!("Database error: {}", e))?;

    conn.execute("DELETE FROM sqlite_sequence WHERE name = 'interesting_links'", [])
        .map_err(|e| e.to_string())?;

    if rows_affected == 0 {
        return Err("No interesting link found with the specified ID".to_string());
    }

    Ok(format!("Successfully deleted {} rows", rows_affected))
}
