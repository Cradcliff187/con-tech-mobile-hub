export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "equipment_allocations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "project_stakeholders_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
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
        ]
      }
      stakeholder_assignments: {
        Row: {
          created_at: string | null
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
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
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
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
          updated_at?: string | null
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
          created_at: string | null
          crew_size: number | null
          email: string | null
          id: string
          insurance_expiry: string | null
          license_number: string | null
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
          created_at?: string | null
          crew_size?: number | null
          email?: string | null
          id?: string
          insurance_expiry?: string | null
          license_number?: string | null
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
          created_at?: string | null
          crew_size?: number | null
          email?: string | null
          id?: string
          insurance_expiry?: string | null
          license_number?: string | null
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
        ]
      }
      weather_data: {
        Row: {
          condition: string | null
          created_at: string | null
          forecast: Json | null
          humidity: number | null
          id: string
          last_updated: string | null
          location: string
          temperature: number | null
          wind_speed: number | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          forecast?: Json | null
          humidity?: number | null
          id?: string
          last_updated?: string | null
          location: string
          temperature?: number | null
          wind_speed?: number | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          forecast?: Json | null
          humidity?: number | null
          id?: string
          last_updated?: string | null
          location?: string
          temperature?: number | null
          wind_speed?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      user_can_access_project: {
        Args: { project_id: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { user_id: string; required_permission: string }
        Returns: boolean
      }
    }
    Enums: {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
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
