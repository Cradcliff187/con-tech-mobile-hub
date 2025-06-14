
-- Create enum types for better data consistency
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on-hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('not-started', 'in-progress', 'completed', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE user_role AS ENUM ('admin', 'project_manager', 'site_supervisor', 'worker', 'client');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'worker',
  phone TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status project_status DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  location TEXT,
  client_id UUID REFERENCES public.profiles(id),
  project_manager_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'not-started',
  priority task_priority DEFAULT 'medium',
  start_date DATE,
  due_date DATE,
  assignee_id UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_hours INTEGER,
  actual_hours INTEGER,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task dependencies table
CREATE TABLE public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  category TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for communication
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment/Resources table
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'available',
  project_id UUID REFERENCES public.projects(id),
  operator_id UUID REFERENCES public.profiles(id),
  maintenance_due DATE,
  utilization_rate INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log for tracking changes
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Users can view projects they're involved in" ON public.projects FOR SELECT 
USING (
  client_id = auth.uid() OR 
  project_manager_id = auth.uid() OR 
  id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
);
CREATE POLICY "Project managers can update their projects" ON public.projects FOR UPDATE 
USING (project_manager_id = auth.uid());
CREATE POLICY "Project managers can create projects" ON public.projects FOR INSERT 
WITH CHECK (project_manager_id = auth.uid());

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in their projects" ON public.tasks FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE 
    client_id = auth.uid() OR 
    project_manager_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
  )
);
CREATE POLICY "Users can update tasks assigned to them or they manage" ON public.tasks FOR UPDATE 
USING (
  assignee_id = auth.uid() OR 
  project_id IN (SELECT id FROM public.projects WHERE project_manager_id = auth.uid())
);
CREATE POLICY "Project managers can create tasks" ON public.tasks FOR INSERT 
WITH CHECK (
  project_id IN (SELECT id FROM public.projects WHERE project_manager_id = auth.uid())
);

-- RLS Policies for other tables (similar pattern)
CREATE POLICY "Users can view task dependencies in their projects" ON public.task_dependencies FOR SELECT 
USING (
  task_id IN (
    SELECT id FROM public.tasks WHERE project_id IN (
      SELECT id FROM public.projects WHERE 
      client_id = auth.uid() OR 
      project_manager_id = auth.uid() OR 
      id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can view documents in their projects" ON public.documents FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE 
    client_id = auth.uid() OR 
    project_manager_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
  )
);

CREATE POLICY "Users can view messages in their projects" ON public.messages FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE 
    client_id = auth.uid() OR 
    project_manager_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their projects" ON public.messages FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  project_id IN (
    SELECT id FROM public.projects WHERE 
    client_id = auth.uid() OR 
    project_manager_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
  )
);

CREATE POLICY "Users can view equipment in their projects" ON public.equipment FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE 
    client_id = auth.uid() OR 
    project_manager_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
  )
);

CREATE POLICY "Users can view activity log in their projects" ON public.activity_log FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE 
    client_id = auth.uid() OR 
    project_manager_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
  )
);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
