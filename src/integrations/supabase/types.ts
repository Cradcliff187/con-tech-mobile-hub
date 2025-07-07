export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          bid_amount: number
          bid_number: string
          competitor_count: number | null
          created_at: string
          created_by: string | null
          decision_date: string | null
          estimate_id: string | null
          estimated_competition_range_high: number | null
          estimated_competition_range_low: number | null
          id: string
          notes: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["bid_status"]
          submission_date: string | null
          updated_at: string
          win_loss_reason: string | null
          win_probability: number | null
        }
        Insert: {
          bid_amount: number
          bid_number: string
          competitor_count?: number | null
          created_at?: string
          created_by?: string | null
          decision_date?: string | null
          estimate_id?: string | null
          estimated_competition_range_high?: number | null
          estimated_competition_range_low?: number | null
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          submission_date?: string | null
          updated_at?: string
          win_loss_reason?: string | null
          win_probability?: number | null
        }
        Update: {
          bid_amount?: number
          bid_number?: string
          competitor_count?: number | null
          created_at?: string
          created_by?: string | null
          decision_date?: string | null
          estimate_id?: string | null
          estimated_competition_range_high?: number | null
          estimated_competition_range_low?: number | null
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          submission_date?: string | null
          updated_at?: string
          win_loss_reason?: string | null
          win_probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_line_items: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          id: string
          invoice_number: string | null
          project_id: string
          status: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          date: string
          description: string
          id?: string
          invoice_number?: string | null
          project_id: string
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          invoice_number?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_line_items_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_line_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_line_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_line_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_tracking: {
        Row: {
          committed_amount: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          notes: string | null
          project_id: string
          projected_total: number | null
          spent_amount: number | null
          updated_by: string | null
          variance_amount: number | null
          variance_percentage: number | null
        }
        Insert: {
          committed_amount?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          notes?: string | null
          project_id: string
          projected_total?: number | null
          spent_amount?: number | null
          updated_by?: string | null
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Update: {
          committed_amount?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          notes?: string | null
          project_id?: string
          projected_total?: number | null
          spent_amount?: number | null
          updated_by?: string | null
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_tracking_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      change_order_documents: {
        Row: {
          change_order_id: string
          document_id: string
          id: string
          relationship_type: string
          uploaded_at: string
        }
        Insert: {
          change_order_id: string
          document_id: string
          id?: string
          relationship_type?: string
          uploaded_at?: string
        }
        Update: {
          change_order_id?: string
          document_id?: string
          id?: string
          relationship_type?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_order_documents_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_order_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          cost_impact: number | null
          created_at: string
          description: string | null
          id: string
          priority: string
          project_id: string
          reason_for_change: string | null
          requested_by: string
          schedule_impact_days: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          cost_impact?: number | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          project_id: string
          reason_for_change?: string | null
          requested_by: string
          schedule_impact_days?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          cost_impact?: number | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          project_id?: string
          reason_for_change?: string | null
          requested_by?: string
          schedule_impact_days?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_interactions: {
        Row: {
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          interaction_date: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          notes: string | null
          outcome: string | null
          stakeholder_id: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          interaction_date?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          notes?: string | null
          outcome?: string | null
          stakeholder_id: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          interaction_date?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          notes?: string | null
          outcome?: string | null
          stakeholder_id?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_interactions_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          project_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          assigned_operator_id: string | null
          created_at: string | null
          id: string
          maintenance_due: string | null
          name: string
          operator_id: string | null
          project_id: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          utilization_rate: number | null
        }
        Insert: {
          assigned_operator_id?: string | null
          created_at?: string | null
          id?: string
          maintenance_due?: string | null
          name: string
          operator_id?: string | null
          project_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          utilization_rate?: number | null
        }
        Update: {
          assigned_operator_id?: string | null
          created_at?: string | null
          id?: string
          maintenance_due?: string | null
          name?: string
          operator_id?: string | null
          project_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          utilization_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assigned_operator_id_fkey"
            columns: ["assigned_operator_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_allocations: {
        Row: {
          allocated_by: string | null
          created_at: string
          end_date: string
          equipment_id: string
          id: string
          notes: string | null
          operator_id: string | null
          operator_type: string | null
          project_id: string
          start_date: string
          task_id: string | null
          updated_at: string
        }
        Insert: {
          allocated_by?: string | null
          created_at?: string
          end_date: string
          equipment_id: string
          id?: string
          notes?: string | null
          operator_id?: string | null
          operator_type?: string | null
          project_id: string
          start_date: string
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          allocated_by?: string | null
          created_at?: string
          end_date?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          operator_id?: string | null
          operator_type?: string | null
          project_id?: string
          start_date?: string
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_allocations_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_allocations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assignment_history: {
        Row: {
          assigned_by: string | null
          assigned_operator_id: string | null
          created_at: string
          end_date: string | null
          equipment_id: string
          id: string
          notes: string | null
          operator_id: string | null
          project_id: string | null
          start_date: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_operator_id?: string | null
          created_at?: string
          end_date?: string | null
          equipment_id: string
          id?: string
          notes?: string | null
          operator_id?: string | null
          project_id?: string | null
          start_date: string
        }
        Update: {
          assigned_by?: string | null
          assigned_operator_id?: string | null
          created_at?: string
          end_date?: string | null
          equipment_id?: string
          id?: string
          notes?: string | null
          operator_id?: string | null
          project_id?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assignment_history_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignment_history_assigned_operator_id_fkey"
            columns: ["assigned_operator_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignment_history_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignment_history_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignment_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignment_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_service_documents: {
        Row: {
          document_id: string
          equipment_id: string
          id: string
          notes: string | null
          service_date: string
          service_type: string
          uploaded_at: string
        }
        Insert: {
          document_id: string
          equipment_id: string
          id?: string
          notes?: string | null
          service_date: string
          service_type?: string
          uploaded_at?: string
        }
        Update: {
          document_id?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          service_date?: string
          service_type?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_service_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_service_documents_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          equipment_cost: number | null
          estimate_number: string
          id: string
          labor_cost: number | null
          markup_percentage: number | null
          material_cost: number | null
          notes: string | null
          project_id: string | null
          responded_date: string | null
          sent_date: string | null
          stakeholder_id: string
          status: Database["public"]["Enums"]["estimate_status"]
          terms_and_conditions: string | null
          title: string
          updated_at: string
          valid_until: string | null
          viewed_date: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          equipment_cost?: number | null
          estimate_number: string
          id?: string
          labor_cost?: number | null
          markup_percentage?: number | null
          material_cost?: number | null
          notes?: string | null
          project_id?: string | null
          responded_date?: string | null
          sent_date?: string | null
          stakeholder_id: string
          status?: Database["public"]["Enums"]["estimate_status"]
          terms_and_conditions?: string | null
          title: string
          updated_at?: string
          valid_until?: string | null
          viewed_date?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          equipment_cost?: number | null
          estimate_number?: string
          id?: string
          labor_cost?: number | null
          markup_percentage?: number | null
          material_cost?: number | null
          notes?: string | null
          project_id?: string | null
          responded_date?: string | null
          sent_date?: string | null
          stakeholder_id?: string
          status?: Database["public"]["Enums"]["estimate_status"]
          terms_and_conditions?: string | null
          title?: string
          updated_at?: string
          valid_until?: string | null
          viewed_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_history: {
        Row: {
          action_type: string
          created_at: string | null
          description: string
          details: Json | null
          equipment_id: string
          id: string
          maintenance_task_id: string | null
          performed_by: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description: string
          details?: Json | null
          equipment_id: string
          id?: string
          maintenance_task_id?: string | null
          performed_by?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string
          details?: Json | null
          equipment_id?: string
          id?: string
          maintenance_task_id?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_history_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_history_maintenance_task_id_fkey"
            columns: ["maintenance_task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          auto_assign_to_stakeholder_id: string | null
          checklist_template: Json | null
          created_at: string | null
          description: string | null
          equipment_id: string
          estimated_hours: number | null
          frequency_type: string
          frequency_value: number
          id: string
          is_active: boolean | null
          last_generated_date: string | null
          next_due_date: string | null
          schedule_name: string
          task_type: string
          updated_at: string | null
        }
        Insert: {
          auto_assign_to_stakeholder_id?: string | null
          checklist_template?: Json | null
          created_at?: string | null
          description?: string | null
          equipment_id: string
          estimated_hours?: number | null
          frequency_type: string
          frequency_value?: number
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          next_due_date?: string | null
          schedule_name: string
          task_type?: string
          updated_at?: string | null
        }
        Update: {
          auto_assign_to_stakeholder_id?: string | null
          checklist_template?: Json | null
          created_at?: string | null
          description?: string | null
          equipment_id?: string
          estimated_hours?: number | null
          frequency_type?: string
          frequency_value?: number
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          next_due_date?: string | null
          schedule_name?: string
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_auto_assign_to_stakeholder_id_fkey"
            columns: ["auto_assign_to_stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedules_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to_stakeholder_id: string | null
          assigned_to_user_id: string | null
          checklist_items: Json | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          equipment_id: string
          estimated_hours: number | null
          id: string
          notes: string | null
          priority: string
          scheduled_date: string
          status: string
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to_stakeholder_id?: string | null
          assigned_to_user_id?: string | null
          checklist_items?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          equipment_id: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          scheduled_date: string
          status?: string
          task_type?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to_stakeholder_id?: string | null
          assigned_to_user_id?: string | null
          checklist_items?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          equipment_id?: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          scheduled_date?: string
          status?: string
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_assigned_to_stakeholder_id_fkey"
            columns: ["assigned_to_stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          project_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          project_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          project_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_log: {
        Row: {
          created_at: string | null
          data_snapshot: Json | null
          id: string
          issue_description: string
          operation: string
          source_id: string | null
          source_table: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          created_at?: string | null
          data_snapshot?: Json | null
          id?: string
          issue_description: string
          operation: string
          source_id?: string | null
          source_table: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          created_at?: string | null
          data_snapshot?: Json | null
          id?: string
          issue_description?: string
          operation?: string
          source_id?: string | null
          source_table?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          auto_approved: boolean | null
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          invited_by: string | null
          is_company_user: boolean | null
          last_login: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          account_status?: string | null
          auto_approved?: boolean | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          invited_by?: string | null
          is_company_user?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          account_status?: string | null
          auto_approved?: boolean | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          is_company_user?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stakeholders: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          role: string
          stakeholder_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          role: string
          stakeholder_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          role?: string
          stakeholder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stakeholders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stakeholders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stakeholders_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      project_status_transitions: {
        Row: {
          created_at: string
          description: string | null
          from_status: Database["public"]["Enums"]["project_lifecycle_status"]
          id: string
          is_active: boolean | null
          min_progress_threshold: number | null
          required_conditions: Json | null
          requires_approval: boolean | null
          to_status: Database["public"]["Enums"]["project_lifecycle_status"]
          transition_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          from_status: Database["public"]["Enums"]["project_lifecycle_status"]
          id?: string
          is_active?: boolean | null
          min_progress_threshold?: number | null
          required_conditions?: Json | null
          requires_approval?: boolean | null
          to_status: Database["public"]["Enums"]["project_lifecycle_status"]
          transition_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          from_status?: Database["public"]["Enums"]["project_lifecycle_status"]
          id?: string
          is_active?: boolean | null
          min_progress_threshold?: number | null
          required_conditions?: Json | null
          requires_approval?: boolean | null
          to_status?: Database["public"]["Enums"]["project_lifecycle_status"]
          transition_name?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          city: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          lifecycle_status:
            | Database["public"]["Enums"]["lifecycle_status"]
            | null
          location: string | null
          name: string
          phase: string | null
          progress: number | null
          project_manager_id: string | null
          spent: number | null
          start_date: string | null
          state: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          street_address: string | null
          unified_lifecycle_status:
            | Database["public"]["Enums"]["project_lifecycle_status"]
            | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          budget?: number | null
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lifecycle_status?:
            | Database["public"]["Enums"]["lifecycle_status"]
            | null
          location?: string | null
          name: string
          phase?: string | null
          progress?: number | null
          project_manager_id?: string | null
          spent?: number | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          street_address?: string | null
          unified_lifecycle_status?:
            | Database["public"]["Enums"]["project_lifecycle_status"]
            | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          budget?: number | null
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lifecycle_status?:
            | Database["public"]["Enums"]["lifecycle_status"]
            | null
          location?: string | null
          name?: string
          phase?: string | null
          progress?: number | null
          project_manager_id?: string | null
          spent?: number | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          street_address?: string | null
          unified_lifecycle_status?:
            | Database["public"]["Enums"]["project_lifecycle_status"]
            | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_allocations: {
        Row: {
          allocation_type: string | null
          created_at: string | null
          id: string
          project_id: string | null
          team_name: string
          total_budget: number | null
          total_used: number | null
          updated_at: string | null
          week_start_date: string
        }
        Insert: {
          allocation_type?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          team_name: string
          total_budget?: number | null
          total_used?: number | null
          updated_at?: string | null
          week_start_date: string
        }
        Update: {
          allocation_type?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          team_name?: string
          total_budget?: number | null
          total_used?: number | null
          updated_at?: string | null
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      rfi_documents: {
        Row: {
          document_id: string
          id: string
          rfi_id: string
          uploaded_at: string
        }
        Insert: {
          document_id: string
          id?: string
          rfi_id: string
          uploaded_at?: string
        }
        Update: {
          document_id?: string
          id?: string
          rfi_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfi_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfi_documents_rfi_id_fkey"
            columns: ["rfi_id"]
            isOneToOne: false
            referencedRelation: "rfis"
            referencedColumns: ["id"]
          },
        ]
      }
      rfis: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string
          submitted_by: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          submitted_by: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          submitted_by?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfis_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_compliance: {
        Row: {
          auditor_id: string | null
          compliance_rate: number
          compliance_type: string
          created_at: string | null
          id: string
          last_audit_date: string | null
          next_audit_date: string | null
          notes: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          auditor_id?: string | null
          compliance_rate: number
          compliance_type: string
          created_at?: string | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          auditor_id?: string | null
          compliance_rate?: number
          compliance_type?: string
          created_at?: string | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_compliance_auditor_id_fkey"
            columns: ["auditor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_compliance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_compliance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incident_photos: {
        Row: {
          alt_text: string | null
          display_order: number | null
          document_id: string
          id: string
          safety_incident_id: string
          uploaded_at: string
        }
        Insert: {
          alt_text?: string | null
          display_order?: number | null
          document_id: string
          id?: string
          safety_incident_id: string
          uploaded_at?: string
        }
        Update: {
          alt_text?: string | null
          display_order?: number | null
          document_id?: string
          id?: string
          safety_incident_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_incident_photos_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_incident_photos_safety_incident_id_fkey"
            columns: ["safety_incident_id"]
            isOneToOne: false
            referencedRelation: "safety_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents: {
        Row: {
          corrective_actions: string | null
          created_at: string | null
          description: string
          id: string
          incident_date: string
          project_id: string
          reported_by: string | null
          severity: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          corrective_actions?: string | null
          created_at?: string | null
          description: string
          id?: string
          incident_date: string
          project_id: string
          reported_by?: string | null
          severity: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          corrective_actions?: string | null
          created_at?: string | null
          description?: string
          id?: string
          incident_date?: string
          project_id?: string
          reported_by?: string | null
          severity?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_incidents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_incidents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_toolbox_talks: {
        Row: {
          attendance_count: number | null
          completed_count: number | null
          conducted_by: string | null
          created_at: string | null
          id: string
          month: number
          project_id: string
          topic: string | null
          total_required: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          attendance_count?: number | null
          completed_count?: number | null
          conducted_by?: string | null
          created_at?: string | null
          id?: string
          month: number
          project_id: string
          topic?: string | null
          total_required?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          attendance_count?: number | null
          completed_count?: number | null
          conducted_by?: string | null
          created_at?: string | null
          id?: string
          month?: number
          project_id?: string
          topic?: string | null
          total_required?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "safety_toolbox_talks_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_toolbox_talks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_toolbox_talks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_assignments: {
        Row: {
          created_at: string | null
          daily_hours: Json | null
          end_date: string | null
          equipment_id: string | null
          hourly_rate: number | null
          id: string
          notes: string | null
          project_id: string | null
          role: string | null
          stakeholder_id: string
          start_date: string | null
          status: string | null
          task_id: string | null
          total_cost: number | null
          total_hours: number | null
          updated_at: string | null
          week_start_date: string | null
        }
        Insert: {
          created_at?: string | null
          daily_hours?: Json | null
          end_date?: string | null
          equipment_id?: string | null
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          project_id?: string | null
          role?: string | null
          stakeholder_id: string
          start_date?: string | null
          status?: string | null
          task_id?: string | null
          total_cost?: number | null
          total_hours?: number | null
          updated_at?: string | null
          week_start_date?: string | null
        }
        Update: {
          created_at?: string | null
          daily_hours?: Json | null
          end_date?: string | null
          equipment_id?: string | null
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          project_id?: string | null
          role?: string | null
          stakeholder_id?: string
          start_date?: string | null
          status?: string | null
          task_id?: string | null
          total_cost?: number | null
          total_hours?: number | null
          updated_at?: string | null
          week_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_assignments_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_availability: {
        Row: {
          created_at: string | null
          date: string
          hours_available: number | null
          id: string
          is_available: boolean | null
          notes: string | null
          stakeholder_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          hours_available?: number | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          stakeholder_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          hours_available?: number | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          stakeholder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_availability_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_certifications: {
        Row: {
          certification_name: string
          certification_number: string | null
          created_at: string | null
          equipment_type: string
          expiry_date: string | null
          id: string
          is_active: boolean | null
          issued_date: string | null
          issuing_authority: string | null
          stakeholder_id: string
        }
        Insert: {
          certification_name: string
          certification_number?: string | null
          created_at?: string | null
          equipment_type: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issued_date?: string | null
          issuing_authority?: string | null
          stakeholder_id: string
        }
        Update: {
          certification_name?: string
          certification_number?: string | null
          created_at?: string | null
          equipment_type?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issued_date?: string | null
          issuing_authority?: string | null
          stakeholder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_certifications_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_performance: {
        Row: {
          assignment_id: string | null
          completed_tasks: number | null
          created_at: string | null
          evaluation_date: string | null
          evaluator_id: string | null
          feedback: string | null
          id: string
          project_id: string | null
          quality_score: number | null
          rating: number | null
          safety_score: number | null
          stakeholder_id: string
          timeliness_score: number | null
          total_hours: number | null
        }
        Insert: {
          assignment_id?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          evaluation_date?: string | null
          evaluator_id?: string | null
          feedback?: string | null
          id?: string
          project_id?: string | null
          quality_score?: number | null
          rating?: number | null
          safety_score?: number | null
          stakeholder_id: string
          timeliness_score?: number | null
          total_hours?: number | null
        }
        Update: {
          assignment_id?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          evaluation_date?: string | null
          evaluator_id?: string | null
          feedback?: string | null
          id?: string
          project_id?: string | null
          quality_score?: number | null
          rating?: number | null
          safety_score?: number | null
          stakeholder_id?: string
          timeliness_score?: number | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_performance_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "stakeholder_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_performance_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_performance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_performance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_performance_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          contact_person: string | null
          conversion_probability: number | null
          created_at: string | null
          crew_size: number | null
          customer_lifetime_value: number | null
          email: string | null
          first_contact_date: string | null
          id: string
          insurance_expiry: string | null
          last_contact_date: string | null
          lead_score: number | null
          lead_source: string | null
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          license_number: string | null
          next_followup_date: string | null
          notes: string | null
          phone: string | null
          profile_id: string | null
          rating: number | null
          specialties: string[] | null
          stakeholder_type: Database["public"]["Enums"]["stakeholder_type"]
          state: string | null
          status: Database["public"]["Enums"]["stakeholder_status"] | null
          street_address: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          conversion_probability?: number | null
          created_at?: string | null
          crew_size?: number | null
          customer_lifetime_value?: number | null
          email?: string | null
          first_contact_date?: string | null
          id?: string
          insurance_expiry?: string | null
          last_contact_date?: string | null
          lead_score?: number | null
          lead_source?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          license_number?: string | null
          next_followup_date?: string | null
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          rating?: number | null
          specialties?: string[] | null
          stakeholder_type: Database["public"]["Enums"]["stakeholder_type"]
          state?: string | null
          status?: Database["public"]["Enums"]["stakeholder_status"] | null
          street_address?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          conversion_probability?: number | null
          created_at?: string | null
          crew_size?: number | null
          customer_lifetime_value?: number | null
          email?: string | null
          first_contact_date?: string | null
          id?: string
          insurance_expiry?: string | null
          last_contact_date?: string | null
          lead_score?: number | null
          lead_source?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          license_number?: string | null
          next_followup_date?: string | null
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          rating?: number | null
          specialties?: string[] | null
          stakeholder_type?: Database["public"]["Enums"]["stakeholder_type"]
          state?: string | null
          status?: Database["public"]["Enums"]["stakeholder_status"] | null
          street_address?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string | null
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string | null
          depends_on_task_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_id: string
          id: string
          relationship_type: string
          task_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_id: string
          id?: string
          relationship_type?: string
          task_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          id?: string
          relationship_type?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_stakeholder_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_role: string | null
          created_at: string
          id: string
          stakeholder_id: string
          status: string
          task_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_role?: string | null
          created_at?: string
          id?: string
          stakeholder_id: string
          status?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_role?: string | null
          created_at?: string
          id?: string
          stakeholder_id?: string
          status?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_stakeholder_assignments_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_stakeholder_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_updates: {
        Row: {
          author_id: string | null
          author_name: string | null
          created_at: string | null
          id: string
          message: string
          task_id: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          created_at?: string | null
          id?: string
          message: string
          task_id?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          created_at?: string | null
          id?: string
          message?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_updates_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_stakeholder_id: string | null
          assignee_id: string | null
          category: string | null
          converted_from_task_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          inspection_status: string | null
          matches_skills: boolean | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          progress: number | null
          project_id: string
          punch_list_category: string | null
          required_skills: string[] | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_stakeholder_id?: string | null
          assignee_id?: string | null
          category?: string | null
          converted_from_task_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          inspection_status?: string | null
          matches_skills?: boolean | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress?: number | null
          project_id: string
          punch_list_category?: string | null
          required_skills?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_stakeholder_id?: string | null
          assignee_id?: string | null
          category?: string | null
          converted_from_task_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          inspection_status?: string | null
          matches_skills?: boolean | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress?: number | null
          project_id?: string
          punch_list_category?: string | null
          required_skills?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_stakeholder_id_fkey"
            columns: ["assigned_stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_converted_from_task_id_fkey"
            columns: ["converted_from_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          allocation_id: string | null
          availability: number | null
          cost_per_hour: number | null
          created_at: string | null
          date: string | null
          hours_allocated: number | null
          hours_used: number | null
          id: string
          name: string
          role: string
          tasks: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          allocation_id?: string | null
          availability?: number | null
          cost_per_hour?: number | null
          created_at?: string | null
          date?: string | null
          hours_allocated?: number | null
          hours_used?: number | null
          id?: string
          name: string
          role: string
          tasks?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          allocation_id?: string | null
          availability?: number | null
          cost_per_hour?: number | null
          created_at?: string | null
          date?: string | null
          hours_allocated?: number | null
          hours_used?: number | null
          id?: string
          name?: string
          role?: string
          tasks?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "resource_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members_backup: {
        Row: {
          allocation_id: string | null
          availability: number | null
          cost_per_hour: number | null
          created_at: string | null
          date: string | null
          hours_allocated: number | null
          hours_used: number | null
          id: string | null
          name: string | null
          role: string | null
          tasks: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          allocation_id?: string | null
          availability?: number | null
          cost_per_hour?: number | null
          created_at?: string | null
          date?: string | null
          hours_allocated?: number | null
          hours_used?: number | null
          id?: string | null
          name?: string | null
          role?: string | null
          tasks?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          allocation_id?: string | null
          availability?: number | null
          cost_per_hour?: number | null
          created_at?: string | null
          date?: string | null
          hours_allocated?: number | null
          hours_used?: number | null
          id?: string | null
          name?: string | null
          role?: string | null
          tasks?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          project_id: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_logs: {
        Row: {
          city: string
          created_at: string
          id: string
          precipitation: number
          temperature: number
          wind_speed: number
          work_safe: boolean
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          precipitation: number
          temperature: number
          wind_speed: number
          work_safe: boolean
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          precipitation?: number
          temperature?: number
          wind_speed?: number
          work_safe?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      migration_summary: {
        Row: {
          count: number | null
          latest_occurrence: string | null
          operation: string | null
        }
        Relationships: []
      }
      project_labor_costs: {
        Row: {
          assignment_count: number | null
          avg_hourly_rate: number | null
          earliest_start_date: string | null
          latest_end_date: string | null
          project_id: string | null
          project_name: string | null
          stakeholder_type:
            | Database["public"]["Enums"]["stakeholder_type"]
            | null
          total_cost: number | null
          total_hours: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_legacy_status"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_legacy_status: {
        Row: {
          budget: number | null
          city: string | null
          client_id: string | null
          computed_phase: string | null
          computed_status: Database["public"]["Enums"]["project_status"] | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string | null
          lifecycle_status:
            | Database["public"]["Enums"]["lifecycle_status"]
            | null
          location: string | null
          name: string | null
          phase: string | null
          progress: number | null
          project_manager_id: string | null
          spent: number | null
          start_date: string | null
          state: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          street_address: string | null
          unified_lifecycle_status:
            | Database["public"]["Enums"]["project_lifecycle_status"]
            | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          budget?: number | null
          city?: string | null
          client_id?: string | null
          computed_phase?: never
          computed_status?: never
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          lifecycle_status?:
            | Database["public"]["Enums"]["lifecycle_status"]
            | null
          location?: string | null
          name?: string | null
          phase?: string | null
          progress?: number | null
          project_manager_id?: string | null
          spent?: number | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          street_address?: string | null
          unified_lifecycle_status?:
            | Database["public"]["Enums"]["project_lifecycle_status"]
            | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          budget?: number | null
          city?: string | null
          client_id?: string | null
          computed_phase?: never
          computed_status?: never
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          lifecycle_status?:
            | Database["public"]["Enums"]["lifecycle_status"]
            | null
          location?: string | null
          name?: string | null
          phase?: string | null
          progress?: number | null
          project_manager_id?: string | null
          spent?: number | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          street_address?: string | null
          unified_lifecycle_status?:
            | Database["public"]["Enums"]["project_lifecycle_status"]
            | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_budget_variance: {
        Args: { p_project_id: string }
        Returns: {
          variance_amount: number
          variance_percentage: number
        }[]
      }
      calculate_days_without_incident: {
        Args: { p_project_id: string }
        Returns: number
      }
      calculate_employee_utilization: {
        Args: {
          target_stakeholder_id?: string
          start_date?: string
          end_date?: string
        }
        Returns: {
          stakeholder_id: string
          stakeholder_name: string
          date_period: string
          total_allocated_hours: number
          max_available_hours: number
          utilization_percentage: number
          is_overallocated: boolean
          conflict_details: Json
          project_assignments: Json
        }[]
      }
      check_equipment_availability: {
        Args: {
          p_equipment_id: string
          p_start_date: string
          p_end_date: string
          p_exclude_allocation_id?: string
        }
        Returns: boolean
      }
      check_resource_conflicts: {
        Args: { p_user_id: string; p_date: string; p_hours?: number }
        Returns: {
          conflict_type: string
          conflicting_allocation_id: string
          conflicting_team_name: string
          allocated_hours: number
          available_hours: number
        }[]
      }
      convert_estimate_to_project: {
        Args: { p_estimate_id: string; p_project_name?: string }
        Returns: string
      }
      create_daily_cost_snapshot: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_bid_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_estimate_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          role: Database["public"]["Enums"]["user_role"]
          invited_by: string
          project_id: string
          invitation_token: string
          expires_at: string
          accepted_at: string
          created_at: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_approved_company_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_company_domain: {
        Args: { email: string }
        Returns: boolean
      }
      is_project_manager_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_overdue_maintenance_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      migrate_team_members_to_stakeholder_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_processed: number
          successful_migrations: number
          stakeholders_created: number
          errors_logged: number
        }[]
      }
      migrate_to_lifecycle_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      migrate_to_unified_lifecycle_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rollback_unified_lifecycle_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_project_labor_costs: {
        Args: { target_project_id: string }
        Returns: undefined
      }
      user_can_access_project: {
        Args: { project_id: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { user_id: string; required_permission: string }
        Returns: boolean
      }
      validate_project_status_consistency: {
        Args: Record<PropertyKey, never>
        Returns: {
          project_id: string
          project_name: string
          current_status: string
          current_phase: string
          lifecycle_status: string
          suggested_lifecycle_status: string
        }[]
      }
      validate_project_status_transition: {
        Args: {
          project_id: string
          new_status: Database["public"]["Enums"]["project_lifecycle_status"]
        }
        Returns: {
          is_valid: boolean
          error_message: string
          required_conditions: Json
        }[]
      }
      verify_unified_lifecycle_migration: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_projects: number
          migrated_projects: number
          migration_complete: boolean
          status_distribution: Json
        }[]
      }
    }
    Enums: {
      bid_status:
        | "pending"
        | "submitted"
        | "accepted"
        | "declined"
        | "withdrawn"
      estimate_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "declined"
        | "expired"
      interaction_type:
        | "call"
        | "email"
        | "meeting"
        | "site_visit"
        | "proposal"
        | "follow_up"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal_sent"
        | "negotiating"
        | "won"
        | "lost"
      lifecycle_status:
        | "pre_planning"
        | "planning_active"
        | "construction_active"
        | "construction_hold"
        | "punch_list_phase"
        | "project_closeout"
        | "project_completed"
        | "project_cancelled"
      project_lifecycle_status:
        | "pre_construction"
        | "mobilization"
        | "construction"
        | "punch_list"
        | "final_inspection"
        | "closeout"
        | "warranty"
        | "on_hold"
        | "cancelled"
      project_status:
        | "planning"
        | "active"
        | "on-hold"
        | "completed"
        | "cancelled"
      stakeholder_status: "active" | "inactive" | "pending" | "suspended"
      stakeholder_type: "subcontractor" | "employee" | "vendor" | "client"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status: "not-started" | "in-progress" | "completed" | "blocked"
      user_role:
        | "admin"
        | "project_manager"
        | "site_supervisor"
        | "worker"
        | "client"
        | "stakeholder"
        | "vendor"
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
      bid_status: ["pending", "submitted", "accepted", "declined", "withdrawn"],
      estimate_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "declined",
        "expired",
      ],
      interaction_type: [
        "call",
        "email",
        "meeting",
        "site_visit",
        "proposal",
        "follow_up",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal_sent",
        "negotiating",
        "won",
        "lost",
      ],
      lifecycle_status: [
        "pre_planning",
        "planning_active",
        "construction_active",
        "construction_hold",
        "punch_list_phase",
        "project_closeout",
        "project_completed",
        "project_cancelled",
      ],
      project_lifecycle_status: [
        "pre_construction",
        "mobilization",
        "construction",
        "punch_list",
        "final_inspection",
        "closeout",
        "warranty",
        "on_hold",
        "cancelled",
      ],
      project_status: [
        "planning",
        "active",
        "on-hold",
        "completed",
        "cancelled",
      ],
      stakeholder_status: ["active", "inactive", "pending", "suspended"],
      stakeholder_type: ["subcontractor", "employee", "vendor", "client"],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: ["not-started", "in-progress", "completed", "blocked"],
      user_role: [
        "admin",
        "project_manager",
        "site_supervisor",
        "worker",
        "client",
        "stakeholder",
        "vendor",
      ],
    },
  },
} as const
