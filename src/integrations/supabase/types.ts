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
      bank_accounts: {
        Row: {
          account_number_last4: string | null
          account_type: string | null
          bank: string | null
          created_at: string
          currency: string
          current_balance: number
          id: string
          ifsc: string | null
          is_active: boolean
          name: string
          opening_balance: number
          source: string
          source_ref: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number_last4?: string | null
          account_type?: string | null
          bank?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          ifsc?: string | null
          is_active?: boolean
          name: string
          opening_balance?: number
          source?: string
          source_ref?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number_last4?: string | null
          account_type?: string | null
          bank?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          ifsc?: string | null
          is_active?: boolean
          name?: string
          opening_balance?: number
          source?: string
          source_ref?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          balance: number
          bill_date: string
          bill_number: string | null
          category: string | null
          created_at: string
          currency: string
          document_id: string | null
          due_date: string | null
          gst_amount: number
          gst_rate: number | null
          id: string
          line_items: Json | null
          meta: Json | null
          source: string
          source_ref: string | null
          status: string
          subtotal: number
          tds_amount: number
          total: number
          updated_at: string
          user_id: string
          vendor_gstin: string | null
          vendor_name: string
        }
        Insert: {
          balance: number
          bill_date: string
          bill_number?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          document_id?: string | null
          due_date?: string | null
          gst_amount?: number
          gst_rate?: number | null
          id?: string
          line_items?: Json | null
          meta?: Json | null
          source?: string
          source_ref?: string | null
          status?: string
          subtotal?: number
          tds_amount?: number
          total: number
          updated_at?: string
          user_id: string
          vendor_gstin?: string | null
          vendor_name: string
        }
        Update: {
          balance?: number
          bill_date?: string
          bill_number?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          document_id?: string | null
          due_date?: string | null
          gst_amount?: number
          gst_rate?: number | null
          id?: string
          line_items?: Json | null
          meta?: Json | null
          source?: string
          source_ref?: string | null
          status?: string
          subtotal?: number
          tds_amount?: number
          total?: number
          updated_at?: string
          user_id?: string
          vendor_gstin?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profile: {
        Row: {
          base_currency: string | null
          cin: string | null
          created_at: string
          entity_type: string | null
          fiscal_year_start: number | null
          gstin: string | null
          headcount: number | null
          incorporation_date: string | null
          legal_name: string | null
          pan: string | null
          registrations: Json | null
          state: string | null
          turnover_band: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_currency?: string | null
          cin?: string | null
          created_at?: string
          entity_type?: string | null
          fiscal_year_start?: number | null
          gstin?: string | null
          headcount?: number | null
          incorporation_date?: string | null
          legal_name?: string | null
          pan?: string | null
          registrations?: Json | null
          state?: string | null
          turnover_band?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_currency?: string | null
          cin?: string | null
          created_at?: string
          entity_type?: string | null
          fiscal_year_start?: number | null
          gstin?: string | null
          headcount?: number | null
          incorporation_date?: string | null
          legal_name?: string | null
          pan?: string | null
          registrations?: Json | null
          state?: string | null
          turnover_band?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      compliance_tasks: {
        Row: {
          acknowledgement: string | null
          authority: string | null
          category: string
          created_at: string
          description: string | null
          document_id: string | null
          due_date: string
          filed_on: string | null
          id: string
          meta: Json | null
          penalty_info: string | null
          period: string | null
          rule_code: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledgement?: string | null
          authority?: string | null
          category: string
          created_at?: string
          description?: string | null
          document_id?: string | null
          due_date: string
          filed_on?: string | null
          id?: string
          meta?: Json | null
          penalty_info?: string | null
          period?: string | null
          rule_code: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledgement?: string | null
          authority?: string | null
          category?: string
          created_at?: string
          description?: string | null
          document_id?: string | null
          due_date?: string
          filed_on?: string | null
          id?: string
          meta?: Json | null
          penalty_info?: string | null
          period?: string | null
          rule_code?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_tasks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          filename: string
          id: string
          kind: string
          mime_type: string | null
          notes: string | null
          size_bytes: number | null
          source: string
          source_ref: string | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          kind: string
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          source?: string
          source_ref?: string | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          kind?: string
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          source?: string
          source_ref?: string | null
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          bank_account: string | null
          bank_ifsc: string | null
          bank_name: string | null
          created_at: string
          ctc: number
          doj: string | null
          email: string | null
          emp_code: string
          id: string
          name: string
          pan: string | null
          role: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          created_at?: string
          ctc?: number
          doj?: string | null
          email?: string | null
          emp_code: string
          id?: string
          name: string
          pan?: string | null
          role?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          created_at?: string
          ctc?: number
          doj?: string | null
          email?: string | null
          emp_code?: string
          id?: string
          name?: string
          pan?: string | null
          role?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string
          currency: string
          expense_date: string
          gmail_message_id: string | null
          id: string
          notes: string | null
          snippet: string | null
          source: string
          status: string
          subject: string | null
          updated_at: string
          user_id: string
          vendor: string
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string
          currency?: string
          expense_date?: string
          gmail_message_id?: string | null
          id?: string
          notes?: string | null
          snippet?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id: string
          vendor: string
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string
          currency?: string
          expense_date?: string
          gmail_message_id?: string | null
          id?: string
          notes?: string | null
          snippet?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string
        }
        Relationships: []
      }
      extraction_jobs: {
        Row: {
          created_at: string
          document_id: string | null
          error: string | null
          finished_at: string | null
          id: string
          kind: string
          model: string | null
          result: Json | null
          rows_extracted: number | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          kind: string
          model?: string | null
          result?: Json | null
          rows_extracted?: number | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          model?: string | null
          result?: Json | null
          rows_extracted?: number | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extraction_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance: number
          created_at: string
          currency: string
          customer_gstin: string | null
          customer_name: string
          document_id: string | null
          due_date: string | null
          gst_amount: number
          gst_rate: number | null
          id: string
          invoice_date: string
          invoice_number: string
          irn: string | null
          is_export: boolean
          line_items: Json | null
          meta: Json | null
          source: string
          source_ref: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance: number
          created_at?: string
          currency?: string
          customer_gstin?: string | null
          customer_name: string
          document_id?: string | null
          due_date?: string | null
          gst_amount?: number
          gst_rate?: number | null
          id?: string
          invoice_date: string
          invoice_number: string
          irn?: string | null
          is_export?: boolean
          line_items?: Json | null
          meta?: Json | null
          source?: string
          source_ref?: string | null
          status?: string
          subtotal?: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          customer_gstin?: string | null
          customer_name?: string
          document_id?: string | null
          due_date?: string | null
          gst_amount?: number
          gst_rate?: number | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          irn?: string | null
          is_export?: boolean
          line_items?: Json | null
          meta?: Json | null
          source?: string
          source_ref?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_snapshots: {
        Row: {
          computed_at: string
          id: string
          metrics: Json
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          computed_at?: string
          id?: string
          metrics: Json
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          computed_at?: string
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          ai_confidence: number | null
          amount: number
          bank_account_id: string | null
          category: string | null
          counterparty: string | null
          created_at: string
          currency: string
          description: string
          direction: string
          document_id: string | null
          gst_amount: number | null
          gst_rate: number | null
          id: string
          matched_bill_id: string | null
          matched_invoice_id: string | null
          meta: Json | null
          source: string
          source_ref: string | null
          status: string
          subcategory: string | null
          txn_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          amount: number
          bank_account_id?: string | null
          category?: string | null
          counterparty?: string | null
          created_at?: string
          currency?: string
          description: string
          direction: string
          document_id?: string | null
          gst_amount?: number | null
          gst_rate?: number | null
          id?: string
          matched_bill_id?: string | null
          matched_invoice_id?: string | null
          meta?: Json | null
          source?: string
          source_ref?: string | null
          status?: string
          subcategory?: string | null
          txn_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          amount?: number
          bank_account_id?: string | null
          category?: string | null
          counterparty?: string | null
          created_at?: string
          currency?: string
          description?: string
          direction?: string
          document_id?: string | null
          gst_amount?: number | null
          gst_rate?: number | null
          id?: string
          matched_bill_id?: string | null
          matched_invoice_id?: string | null
          meta?: Json | null
          source?: string
          source_ref?: string | null
          status?: string
          subcategory?: string | null
          txn_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_documents: {
        Row: {
          ai_confidence: number | null
          ai_summary: string | null
          category: string | null
          created_at: string
          doc_type: string | null
          extracted: Json | null
          file_name: string
          id: string
          mime_type: string | null
          s3_key: string
          size_bytes: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_summary?: string | null
          category?: string | null
          created_at?: string
          doc_type?: string | null
          extracted?: Json | null
          file_name: string
          id?: string
          mime_type?: string | null
          s3_key: string
          size_bytes?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_summary?: string | null
          category?: string | null
          created_at?: string
          doc_type?: string | null
          extracted?: Json | null
          file_name?: string
          id?: string
          mime_type?: string | null
          s3_key?: string
          size_bytes?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      zoho_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          organization_id: string | null
          organization_name: string | null
          refresh_token: string
          region: string
          scope: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          organization_id?: string | null
          organization_name?: string | null
          refresh_token: string
          region?: string
          scope?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          organization_id?: string | null
          organization_name?: string | null
          refresh_token?: string
          region?: string
          scope?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      zoho_invoices: {
        Row: {
          balance: number | null
          created_at: string
          currency: string | null
          customer_name: string | null
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          raw: Json | null
          status: string | null
          total: number | null
          updated_at: string
          user_id: string
          zoho_invoice_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          currency?: string | null
          customer_name?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          raw?: Json | null
          status?: string | null
          total?: number | null
          updated_at?: string
          user_id: string
          zoho_invoice_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          currency?: string | null
          customer_name?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          raw?: Json | null
          status?: string | null
          total?: number | null
          updated_at?: string
          user_id?: string
          zoho_invoice_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
