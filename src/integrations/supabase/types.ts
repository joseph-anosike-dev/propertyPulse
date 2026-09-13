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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          budget_range: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          payment_structure: string
          phone: string
          pipeline_status: Database["public"]["Enums"]["lead_pipeline_status"]
          property_id: string
          purpose: string
          referral_data: Json
          source: string | null
          timeline: string
          whatsapp_status: string
        }
        Insert: {
          budget_range: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          payment_structure: string
          phone: string
          pipeline_status?: Database["public"]["Enums"]["lead_pipeline_status"]
          property_id: string
          purpose: string
          referral_data?: Json
          source?: string | null
          timeline: string
          whatsapp_status?: string
        }
        Update: {
          budget_range?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          payment_structure?: string
          phone?: string
          pipeline_status?: Database["public"]["Enums"]["lead_pipeline_status"]
          property_id?: string
          purpose?: string
          referral_data?: Json
          source?: string | null
          timeline?: string
          whatsapp_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          agent_name: string
          agent_whatsapp: string
          area_sqm: number
          bathrooms: number
          bedrooms: number
          city: string
          created_at: string
          description: string
          highlights: string[]
          id: string
          is_published: boolean
          media: Json
          neighborhood: string
          parking: number
          price_ngn: number
          slug: string
          state: string
          status: Database["public"]["Enums"]["property_status"]
          title: string
          title_document: string
          updated_at: string
        }
        Insert: {
          agent_name?: string
          agent_whatsapp: string
          area_sqm: number
          bathrooms: number
          bedrooms: number
          city: string
          created_at?: string
          description: string
          highlights?: string[]
          id?: string
          is_published?: boolean
          media?: Json
          neighborhood: string
          parking?: number
          price_ngn: number
          slug: string
          state: string
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          title_document: string
          updated_at?: string
        }
        Update: {
          agent_name?: string
          agent_whatsapp?: string
          area_sqm?: number
          bathrooms?: number
          bedrooms?: number
          city?: string
          created_at?: string
          description?: string
          highlights?: string[]
          id?: string
          is_published?: boolean
          media?: Json
          neighborhood?: string
          parking?: number
          price_ngn?: number
          slug?: string
          state?: string
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          title_document?: string
          updated_at?: string
        }
        Relationships: []
      }
      viewings: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          mode: string
          preferred_date: string
          preferred_time: string
          property_id: string
          status: Database["public"]["Enums"]["lead_pipeline_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          mode?: string
          preferred_date: string
          preferred_time: string
          property_id: string
          status?: Database["public"]["Enums"]["lead_pipeline_status"]
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          mode?: string
          preferred_date?: string
          preferred_time?: string
          property_id?: string
          status?: Database["public"]["Enums"]["lead_pipeline_status"]
        }
        Relationships: [
          {
            foreignKeyName: "viewings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lead_pipeline_status:
        | "new"
        | "qualified"
        | "viewing_scheduled"
        | "completed"
        | "offer_made"
        | "closed"
      property_status: "available" | "under_offer" | "sold"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      lead_pipeline_status: [
        "new",
        "qualified",
        "viewing_scheduled",
        "completed",
        "offer_made",
        "closed",
      ],
      property_status: ["available", "under_offer", "sold"],
    },
  },
} as const
