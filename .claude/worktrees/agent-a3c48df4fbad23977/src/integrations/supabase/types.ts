export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      board_departments: {
        Row: {
          acronym: string
          created_at: string
          id: string
          is_active: boolean
          member_id: string
          name_en: string | null
          name_pt: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          acronym: string
          created_at?: string
          id?: string
          is_active?: boolean
          member_id: string
          name_en?: string | null
          name_pt: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          acronym?: string
          created_at?: string
          id?: string
          is_active?: boolean
          member_id?: string
          name_en?: string | null
          name_pt?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_departments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "board_members"
            referencedColumns: ["id"]
          },
        ]
      }
      board_members: {
        Row: {
          bio_en: string | null
          bio_pt: string | null
          created_at: string
          email: string | null
          full_name: string
          group_key: string
          id: string
          is_active: boolean
          message_en: string | null
          message_pt: string | null
          office_location: string | null
          phone: string | null
          photo_url: string | null
          role_en: string | null
          role_pt: string | null
          slug: string
          sort_order: number
          title_en: string | null
          title_pt: string
          updated_at: string
        }
        Insert: {
          bio_en?: string | null
          bio_pt?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          group_key?: string
          id?: string
          is_active?: boolean
          message_en?: string | null
          message_pt?: string | null
          office_location?: string | null
          phone?: string | null
          photo_url?: string | null
          role_en?: string | null
          role_pt?: string | null
          slug: string
          sort_order?: number
          title_en?: string | null
          title_pt: string
          updated_at?: string
        }
        Update: {
          bio_en?: string | null
          bio_pt?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          group_key?: string
          id?: string
          is_active?: boolean
          message_en?: string | null
          message_pt?: string | null
          office_location?: string | null
          phone?: string | null
          photo_url?: string | null
          role_en?: string | null
          role_pt?: string | null
          slug?: string
          sort_order?: number
          title_en?: string | null
          title_pt?: string
          updated_at?: string
        }
        Relationships: []
      }
      board_sub_departments: {
        Row: {
          created_at: string
          department_id: string
          id: string
          name_en: string | null
          name_pt: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          name_en?: string | null
          name_pt: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          name_en?: string | null
          name_pt?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_sub_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "board_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          id: string
          meta_description: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_pages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_active: boolean
          language: string
          page_key: string
          section_key: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string
          page_key: string
          section_key: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string
          page_key?: string
          section_key?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      expressions_of_interest: {
        Row: {
          blocks_of_interest: string[] | null
          company_name: string
          contact_person: string
          country: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          notes: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          blocks_of_interest?: string[] | null
          company_name: string
          contact_person: string
          country?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          blocks_of_interest?: string[] | null
          company_name?: string
          contact_person?: string
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expressions_of_interest_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer_en: string | null
          answer_pt: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          question_en: string | null
          question_pt: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer_en?: string | null
          answer_pt: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question_en?: string | null
          question_pt: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer_en?: string | null
          answer_pt?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question_en?: string | null
          question_pt?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      history_events: {
        Row: {
          created_at: string
          description_en: string | null
          description_pt: string | null
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          title_en: string | null
          title_pt: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title_en?: string | null
          title_pt: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title_en?: string | null
          title_pt?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      investor_documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          document_name: string
          file_size_bytes: number | null
          file_url: string
          id: string
          is_public: boolean | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          document_name: string
          file_size_bytes?: number | null
          file_url: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          document_name?: string
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      investor_registrations: {
        Row: {
          company_name: string
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sector: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_name: string
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sector?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sector?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          document_url: string | null
          id: string
          is_active: boolean | null
          language: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          event_date: string | null
          external_url: string | null
          file_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          media_type: string
          sort_order: number
          source: string | null
          title: string
          title_en: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          event_date?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          media_type?: string
          sort_order?: number
          source?: string | null
          title: string
          title_en?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          event_date?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          media_type?: string
          sort_order?: number
          source?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string
          description_en: string | null
          description_pt: string | null
          icon: string | null
          id: string
          is_visible: boolean
          label_en: string | null
          label_pt: string
          menu_group: string
          open_in_new_tab: boolean
          parent_id: string | null
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          label_en?: string | null
          label_pt: string
          menu_group?: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          label_en?: string | null
          label_pt?: string
          menu_group?: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          content_en: string | null
          created_at: string
          excerpt: string | null
          excerpt_en: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          content_en?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_en?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          content_en?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_en?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      page_banners: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          overlay_opacity: number | null
          page_key: string
          subtitle_en: string | null
          subtitle_pt: string | null
          title_en: string | null
          title_pt: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          overlay_opacity?: number | null
          page_key: string
          subtitle_en?: string | null
          subtitle_pt?: string | null
          title_en?: string | null
          title_pt?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          overlay_opacity?: number | null
          page_key?: string
          subtitle_en?: string | null
          subtitle_pt?: string | null
          title_en?: string | null
          title_pt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      petroleum_blocks: {
        Row: {
          active_wells: number | null
          area_km2: number | null
          basin: string | null
          block_name: string
          consortium: Json | null
          coordinates: Json | null
          created_at: string
          depth_category: string | null
          description: string | null
          discovery_year: number | null
          estimated_reserves_mmboe: number | null
          fpso_name: string | null
          geological_formation: string | null
          geological_notes: string | null
          id: string
          license_end: string | null
          license_start: string | null
          offer_type: string
          operator: string | null
          reservoir_type: string | null
          status: string | null
          total_wells: number | null
          updated_at: string
          water_depth_m: number | null
        }
        Insert: {
          active_wells?: number | null
          area_km2?: number | null
          basin?: string | null
          block_name: string
          consortium?: Json | null
          coordinates?: Json | null
          created_at?: string
          depth_category?: string | null
          description?: string | null
          discovery_year?: number | null
          estimated_reserves_mmboe?: number | null
          fpso_name?: string | null
          geological_formation?: string | null
          geological_notes?: string | null
          id?: string
          license_end?: string | null
          license_start?: string | null
          offer_type?: string
          operator?: string | null
          reservoir_type?: string | null
          status?: string | null
          total_wells?: number | null
          updated_at?: string
          water_depth_m?: number | null
        }
        Update: {
          active_wells?: number | null
          area_km2?: number | null
          basin?: string | null
          block_name?: string
          consortium?: Json | null
          coordinates?: Json | null
          created_at?: string
          depth_category?: string | null
          description?: string | null
          discovery_year?: number | null
          estimated_reserves_mmboe?: number | null
          fpso_name?: string | null
          geological_formation?: string | null
          geological_notes?: string | null
          id?: string
          license_end?: string | null
          license_start?: string | null
          offer_type?: string
          operator?: string | null
          reservoir_type?: string | null
          status?: string | null
          total_wells?: number | null
          updated_at?: string
          water_depth_m?: number | null
        }
        Relationships: []
      }
      production_statistics: {
        Row: {
          block_id: string | null
          created_at: string
          gas_production_mmscfd: number | null
          id: string
          month: number | null
          notes: string | null
          oil_production_bpd: number | null
          updated_at: string
          year: number
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          gas_production_mmscfd?: number | null
          id?: string
          month?: number | null
          notes?: string | null
          oil_production_bpd?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          block_id?: string | null
          created_at?: string
          gas_production_mmscfd?: number | null
          id?: string
          month?: number | null
          notes?: string | null
          oil_production_bpd?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_statistics_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "petroleum_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"] | null
          email: string
          full_name: string
          id: string
          onboarding_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email: string
          full_name: string
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email?: string
          full_name?: string
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_content: { Args: { _user_id: string }; Returns: boolean }
      can_manage_investors: { Args: { _user_id: string }; Returns: boolean }
      can_manage_operations: { Args: { _user_id: string }; Returns: boolean }
      has_backoffice_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor_comunicacao"
        | "editor_tecnico"
        | "gestor_investidores"
        | "viewer"
        | "investor"
      department:
        | "administracao"
        | "comunicacao"
        | "tecnico"
        | "investimentos"
        | "ti"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "editor_comunicacao",
        "editor_tecnico",
        "gestor_investidores",
        "viewer",
        "investor",
      ],
      department: [
        "administracao",
        "comunicacao",
        "tecnico",
        "investimentos",
        "ti",
      ],
    },
  },
} as const
