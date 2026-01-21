export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          strategy: 'GROWTH' | 'SAFETY' | 'BALANCED'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          strategy: 'GROWTH' | 'SAFETY' | 'BALANCED'
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          strategy?: 'GROWTH' | 'SAFETY' | 'BALANCED'
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      meetings: {
        Row: {
          id: string
          title: string
          strategy: 'GROWTH' | 'SAFETY' | 'BALANCED'
          status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
          project_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          strategy: 'GROWTH' | 'SAFETY' | 'BALANCED'
          status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
          project_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          strategy?: 'GROWTH' | 'SAFETY' | 'BALANCED'
          status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
          project_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          content: string
          sender_role: 'USER' | 'AGENT'
          sender_name: string
          sender_agent_id: string | null
          meeting_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          sender_role: 'USER' | 'AGENT'
          sender_name: string
          sender_agent_id?: string | null
          meeting_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          sender_role?: 'USER' | 'AGENT'
          sender_name?: string
          sender_agent_id?: string | null
          meeting_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_meeting_id_fkey"
            columns: ["meeting_id"]
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          }
        ]
      }
      meeting_agents: {
        Row: {
          meeting_id: string
          agent_id: string
          created_at: string
        }
        Insert: {
          meeting_id: string
          agent_id: string
          created_at?: string
        }
        Update: {
          meeting_id?: string
          agent_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_agents_meeting_id_fkey"
            columns: ["meeting_id"]
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          }
        ]
      }
      meeting_memories: {
        Row: {
          id: string
          meeting_id: string
          project_id: string
          summary: string
          decision: string | null
          embedding: string
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          project_id: string
          summary: string
          decision?: string | null
          embedding: string
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          project_id?: string
          summary?: string
          decision?: string | null
          embedding?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_memories_meeting_id_fkey"
            columns: ["meeting_id"]
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_memories_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          title: string
          content: string
          file_type: 'pdf' | 'txt' | 'docx'
          file_size: number
          project_id: string
          embedding_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          file_type: 'pdf' | 'txt' | 'docx'
          file_size: number
          project_id: string
          embedding_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          file_type?: 'pdf' | 'txt' | 'docx'
          file_size?: number
          project_id?: string
          embedding_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      document_embeddings: {
        Row: {
          id: string
          document_id: string
          project_id: string
          content: string
          embedding: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          project_id: string
          content: string
          embedding: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          project_id?: string
          content?: string
          embedding?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_embeddings_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_embeddings_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_documents_by_embedding: {
        Args: {
          project_id: string
          query_embedding: string
          similarity_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          content: string
          similarity: number
        }[]
      }
      search_memories_by_embedding: {
        Args: {
          project_id: string
          query_embedding: string
          similarity_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          summary: string
          decision: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}