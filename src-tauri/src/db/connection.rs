use rusqlite::{Connection, Result};
use dirs::home_dir;

pub fn get_db_path() -> String {
  let home_path = home_dir().expect("Failed to get home directory");
  home_path.join(".foxfaps/database.db").to_str().unwrap().to_string()
}
const DB_PASSWORD: &str = "password";

/// Initializes the SQLite database, creates the required tables.
pub fn initialize_database() -> Result<()> {
  let conn = Connection::open(get_db_path())?;

  // Set the password for the database
  conn.execute_batch(&format!("PRAGMA key = '{}';", DB_PASSWORD))?;
  
  conn.execute_batch(
 "-- Table: creators
        CREATE TABLE IF NOT EXISTS creators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            homepage TEXT
        );

        -- Table: price_history
        CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creator_id INTEGER NOT NULL,
            price REAL NOT NULL,
            date TEXT NOT NULL, 
            FOREIGN KEY (creator_id) REFERENCES creators(id)
        );

        -- Table: link_history
        CREATE TABLE IF NOT EXISTS link_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            source TEXT,
            downloaded BOOLEAN NOT NULL DEFAULT 0, 
            date TEXT NOT NULL
        );

        -- Table: interesting_links
        CREATE TABLE IF NOT EXISTS interesting_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            source TEXT,
            downloaded BOOLEAN NOT NULL DEFAULT 0, 
            date TEXT NOT NULL
        );

        -- Table: blacklisted_creators
        CREATE TABLE IF NOT EXISTS blacklisted_creators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creator_id INTEGER NOT NULL,
            reason TEXT,
            date TEXT NOT NULL, 
            FOREIGN KEY (creator_id) REFERENCES creators(id)
        );
        "
      )?;
  Ok(())
}

/// Returns a connection to the SQLite database
// In connection.rs
pub fn get_connection() -> Result<Connection> {
  let db_path = get_db_path();
  println!("Attempting to connect to database at: {}", db_path); // Add this
  
  // Check if file exists
  if !std::path::Path::new(&db_path).exists() {
      println!("Database file does not exist!"); // Add this
      initialize_database()?;
  }
  
  let conn = Connection::open(&db_path)?;
  conn.execute_batch(&format!("PRAGMA key = '{}';", DB_PASSWORD))?;
  Ok(conn)
}
