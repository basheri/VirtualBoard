// Database types will be generated from Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          strategy: 'GROWTH' | 'SAFETY' | 'BALANCED';
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string | null;
          strategy: 'GROWTH' | 'SAFETY' | 'BALANCED';
          user_id: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          strategy?: 'GROWTH' | 'SAFETY' | 'BALANCED';
          updated_at?: string;
        };
      };
      meetings: {
        Row: {
          id: string;
          title: string;
          strategy: 'GROWTH' | 'SAFETY' | 'BALANCED';
          status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
          project_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          strategy: 'GROWTH' | 'SAFETY' | 'BALANCED';
          status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
          project_id: string;
        };
        Update: {
          title?: string;
          strategy?: 'GROWTH' | 'SAFETY' | 'BALANCED';
          status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          content: string;
          sender_role: 'USER' | 'AGENT';
          sender_name: string;
          sender_agent_id: string | null;
          meeting_id: string;
          created_at: string;
        };
        Insert: {
          content: string;
          sender_role: 'USER' | 'AGENT';
          sender_name: string;
          sender_agent_id?: string | null;
          meeting_id: string;
        };
        Update: {
          content?: string;
          sender_role?: 'USER' | 'AGENT';
          sender_name?: string;
          sender_agent_id?: string | null;
        };
      };
      meeting_agents: {
        Row: {
          meeting_id: string;
          agent_id: string;
          created_at: string;
        };
        Insert: {
          meeting_id: string;
          agent_id: string;
        };
        Update: {};
      };
      documents: {
        Row: {
          id: string;
          title: string;
          content: string;
          file_type: 'pdf' | 'txt' | 'docx';
          file_size: number;
          project_id: string;
          embedding_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          content: string;
          file_type: 'pdf' | 'txt' | 'docx';
          file_size: number;
          project_id: string;
          embedding_id?: string | null;
        };
        Update: {
          title?: string;
          content?: string;
          file_type?: 'pdf' | 'txt' | 'docx';
          file_size?: number;
          embedding_id?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}