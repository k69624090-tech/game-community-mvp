export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          role: "user" | "admin";
          email: string;
          avatar_url: string | null;
          bio: string | null;
          favorite_games: string[] | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string;
          role?: "user" | "admin";
          email: string;
          avatar_url?: string | null;
          bio?: string | null;
          favorite_games?: string[] | null;
          created_at?: string;
        };
        Update: {
          username?: string;
          role?: "user" | "admin";
          email?: string;
          avatar_url?: string | null;
          bio?: string | null;
          favorite_games?: string[] | null;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          cover_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
          cover_image_url?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          game_id: string | null;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id?: string | null;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          game_id?: string | null;
          name?: string;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          category_id: string;
          title: string | null;
          body: string;
          spoiler_flag: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          category_id: string;
          title?: string | null;
          body: string;
          spoiler_flag?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string | null;
          body?: string;
          category_id?: string;
          spoiler_flag?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          body?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          type: string;
          created_at?: string;
        };
        Update: {
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      reports: {
        Row: {
          id: string;
          target_type: "post" | "comment" | "user";
          target_id: string;
          user_id: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_type: "post" | "comment" | "user";
          target_id: string;
          user_id: string;
          reason: string;
          created_at?: string;
        };
        Update: {
          reason?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
