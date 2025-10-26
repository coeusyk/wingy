"""Database manager for user sessions, threads, and messages."""

import sqlite3
import uuid
from pathlib import Path
from typing import List, Dict, Optional, Any
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)

# Database path
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
SESSIONS_DB_PATH = DATA_DIR / "wingy.db"


class SessionsDatabase:
    """Manager for users, threads, and messages database operations."""
    
    def __init__(self, db_path: Path = SESSIONS_DB_PATH):
        """Initialize database connection and create tables if needed."""
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Create tables if they don't exist."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    preferences TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Threads table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS threads (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """)
            
            # Messages table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    thread_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (thread_id) REFERENCES threads (id) ON DELETE CASCADE
                )
            """)
            
            # Create indexes for faster queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_threads_user_id 
                ON threads (user_id)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_messages_thread_id 
                ON messages (thread_id)
            """)
            
            conn.commit()
            logger.info("Sessions database initialized successfully")
    
    # User operations
    def create_user(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a new user.
        
        Args:
            user_id: Optional user ID, will generate UUID if not provided
            
        Returns:
            Dictionary with user information
        """
        if not user_id:
            user_id = str(uuid.uuid4())
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (id, preferences) VALUES (?, ?)",
                (user_id, json.dumps({}))
            )
            conn.commit()
        
        logger.info(f"Created user: {user_id}")
        return {"id": user_id, "preferences": {}}
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID.
        
        Args:
            user_id: User identifier
            
        Returns:
            User data or None if not found
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, preferences, created_at FROM users WHERE id = ?",
                (user_id,)
            )
            row = cursor.fetchone()
            if row:
                return {
                    "id": row["id"],
                    "preferences": json.loads(row["preferences"]) if row["preferences"] else {},
                    "created_at": row["created_at"]
                }
            return None
    
    def update_user_preferences(self, user_id: str, preferences: Dict) -> bool:
        """Update user preferences.
        
        Args:
            user_id: User identifier
            preferences: Preferences dictionary
            
        Returns:
            True if successful
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET preferences = ? WHERE id = ?",
                (json.dumps(preferences), user_id)
            )
            conn.commit()
            success = cursor.rowcount > 0
        
        if success:
            logger.info(f"Updated preferences for user: {user_id}")
        return success
    
    # Thread operations
    def create_thread(
        self,
        user_id: str,
        title: Optional[str] = None,
        thread_id: Optional[str] = None
    ) -> Dict[str, str]:
        """Create a new chat thread.
        
        Args:
            user_id: User identifier
            title: Thread title (auto-generated if not provided)
            thread_id: Optional thread ID (will generate UUID if not provided)
            
        Returns:
            Dictionary with thread information
        """
        if not thread_id:
            thread_id = str(uuid.uuid4())
        
        if not title:
            title = f"Chat - {datetime.utcnow().strftime('%b %d, %I:%M %p')}"
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO threads (id, user_id, title, created_at, updated_at) 
                   VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
                (thread_id, user_id, title)
            )
            conn.commit()
        
        logger.info(f"Created thread: {thread_id} for user: {user_id}")
        return {
            "id": thread_id,
            "user_id": user_id,
            "title": title,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    
    def get_user_threads(self, user_id: str) -> List[Dict[str, str]]:
        """Get all threads for a user.
        
        Args:
            user_id: User identifier
            
        Returns:
            List of thread dictionaries
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                """SELECT id, user_id, title, created_at, updated_at 
                   FROM threads 
                   WHERE user_id = ? 
                   ORDER BY updated_at DESC""",
                (user_id,)
            )
            return [dict(row) for row in cursor.fetchall()]
    
    def get_thread(self, thread_id: str) -> Optional[Dict[str, str]]:
        """Get thread by ID.
        
        Args:
            thread_id: Thread identifier
            
        Returns:
            Thread data or None if not found
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, user_id, title, created_at, updated_at FROM threads WHERE id = ?",
                (thread_id,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def update_thread_title(self, thread_id: str, title: str) -> bool:
        """Update thread title.
        
        Args:
            thread_id: Thread identifier
            title: New title
            
        Returns:
            True if successful
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE threads SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (title, thread_id)
            )
            conn.commit()
            success = cursor.rowcount > 0
        
        if success:
            logger.info(f"Updated thread title: {thread_id}")
        return success
    
    def delete_thread(self, thread_id: str) -> bool:
        """Delete a thread and all its messages.
        
        Args:
            thread_id: Thread identifier
            
        Returns:
            True if successful
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM threads WHERE id = ?", (thread_id,))
            conn.commit()
            success = cursor.rowcount > 0
        
        if success:
            logger.info(f"Deleted thread: {thread_id}")
        return success
    
    def update_thread_timestamp(self, thread_id: str) -> None:
        """Update thread's updated_at timestamp.
        
        Args:
            thread_id: Thread identifier
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (thread_id,)
            )
            conn.commit()
    
    # Message operations
    def add_message(
        self,
        thread_id: str,
        role: str,
        content: str,
        message_id: Optional[str] = None
    ) -> Dict[str, str]:
        """Add a message to a thread.
        
        Args:
            thread_id: Thread identifier
            role: Message role (user or assistant)
            content: Message content
            message_id: Optional message ID (will generate UUID if not provided)
            
        Returns:
            Dictionary with message information
        """
        if not message_id:
            message_id = str(uuid.uuid4())
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO messages (id, thread_id, role, content, created_at) 
                   VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (message_id, thread_id, role, content)
            )
            conn.commit()
        
        # Update thread timestamp
        self.update_thread_timestamp(thread_id)
        
        logger.debug(f"Added message to thread: {thread_id}")
        return {
            "id": message_id,
            "thread_id": thread_id,
            "role": role,
            "content": content,
            "created_at": datetime.utcnow().isoformat()
        }
    
    def get_thread_messages(self, thread_id: str, limit: Optional[int] = None) -> List[Dict[str, str]]:
        """Get all messages in a thread.
        
        Args:
            thread_id: Thread identifier
            limit: Optional maximum number of messages to return
            
        Returns:
            List of message dictionaries
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = """SELECT id, thread_id, role, content, created_at 
                       FROM messages 
                       WHERE thread_id = ? 
                       ORDER BY created_at ASC"""
            
            if limit:
                query += f" LIMIT {limit}"
            
            cursor.execute(query, (thread_id,))
            return [dict(row) for row in cursor.fetchall()]
    
    def clear_thread_messages(self, thread_id: str) -> bool:
        """Clear all messages in a thread.
        
        Args:
            thread_id: Thread identifier
            
        Returns:
            True if successful
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages WHERE thread_id = ?", (thread_id,))
            conn.commit()
            success = cursor.rowcount > 0
        
        if success:
            logger.info(f"Cleared messages for thread: {thread_id}")
        return success


# Global database instance
_db_instance = None


def get_db() -> SessionsDatabase:
    """Get the global database instance."""
    global _db_instance
    if _db_instance is None:
        _db_instance = SessionsDatabase()
    return _db_instance
