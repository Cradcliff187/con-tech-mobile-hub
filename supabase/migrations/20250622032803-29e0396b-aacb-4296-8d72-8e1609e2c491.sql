
-- Safety and Budget Sample Data for Testing
-- This file creates realistic sample data for the new safety and budget tracking tables

-- First, let's get the existing project ID for reference
-- Project: "AKC Simple Build" (ID: 05e5869c-f2ed-476b-a2c7-3fc700fad2e6)
-- Budget: $10,000, Start: 2025-06-19

-- Safety Incidents (1-2 per project, varied severity and dates)
INSERT INTO public.safety_incidents (project_id, incident_date, severity, description, reported_by, status, corrective_actions)
VALUES 
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', '2025-06-15', 'minor', 'Equipment malfunction - nail gun misfired causing minor delay. No injuries reported.', NULL, 'resolved', 'Equipment inspected and repaired. Additional safety briefing conducted.'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', '2025-06-08', 'moderate', 'Slip hazard identified due to water accumulation near work area during concrete pour.', NULL, 'resolved', 'Drainage improved, warning signs posted, non-slip mats installed.');

-- Safety Compliance (85-98% rates for different compliance types)
INSERT INTO public.safety_compliance (project_id, compliance_type, compliance_rate, last_audit_date, next_audit_date, notes)
VALUES 
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'general', 92, '2025-06-10', '2025-07-10', 'Overall safety compliance good. Minor improvements needed in housekeeping.'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'ppe', 89, '2025-06-10', '2025-07-10', 'Hard hat and safety vest compliance excellent. Need improvement in safety glasses usage.'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'training', 95, '2025-06-05', '2025-07-05', 'All crew members completed required safety training. One pending certification.'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'equipment', 87, '2025-06-12', '2025-07-12', 'Equipment inspections up to date. Two items require minor maintenance.'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'documentation', 94, '2025-06-08', '2025-07-08', 'Safety documentation well maintained. Update emergency contact forms.');

-- Safety Toolbox Talks (8-12 completed per month)
INSERT INTO public.safety_toolbox_talks (project_id, completed_count, total_required, month, year, topic, attendance_count)
VALUES 
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 8, 10, 6, 2025, 'Heat Safety and Hydration', 12),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 10, 10, 5, 2025, 'Fall Protection Systems', 12),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 9, 10, 4, 2025, 'Electrical Safety Basics', 11),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 12, 12, 3, 2025, 'Tool Safety and Maintenance', 12);

-- Budget Tracking (Project showing healthy spending pattern)
INSERT INTO public.budget_tracking (project_id, spent_amount, committed_amount, projected_total, variance_amount, variance_percentage, notes)
VALUES 
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 7500.00, 1800.00, 9800.00, 200.00, 2.0, 'Project tracking under budget. Good cost control on materials and labor.');

-- Budget Line Items (Realistic construction spending patterns)
INSERT INTO public.budget_line_items (project_id, category, description, amount, date, status, vendor, invoice_number)
VALUES 
  -- Labor expenses (35% of budget)
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'labor', 'Foundation excavation and prep work', 1200.00, '2025-06-20', 'paid', 'AKC Construction Crew', 'PAY-001'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'labor', 'Concrete pouring and finishing', 1500.00, '2025-06-21', 'paid', 'AKC Construction Crew', 'PAY-002'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'labor', 'Framing and structural work', 800.00, '2025-06-22', 'approved', 'AKC Construction Crew', 'PAY-003'),
  
  -- Materials expenses (28% of budget)
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'materials', 'Concrete and rebar delivery', 950.00, '2025-06-19', 'paid', 'Austin Ready Mix', 'INV-2025-1847'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'materials', 'Lumber package delivery', 1200.00, '2025-06-20', 'paid', 'Hill Country Lumber', 'INV-89234'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'materials', 'Roofing materials', 650.00, '2025-06-22', 'approved', 'Austin Building Supply', 'INV-4729'),
  
  -- Equipment rental (12% of budget)
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'equipment', 'Excavator rental - 3 days', 450.00, '2025-06-19', 'paid', 'Austin Equipment Rental', 'RENT-8847'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'equipment', 'Concrete mixer rental', 180.00, '2025-06-21', 'paid', 'Texas Tool Rental', 'RENT-5503'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'equipment', 'Scaffolding rental - weekly', 370.00, '2025-06-22', 'pending', 'Safe-T Scaffolding', 'RENT-9921'),
  
  -- Subcontractor work (15% of budget)
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'subcontractor', 'Electrical rough-in work', 800.00, '2025-06-21', 'approved', 'Sparks Electric LLC', 'SUB-2025-034'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'subcontractor', 'Plumbing rough-in work', 700.00, '2025-06-22', 'pending', 'Austin Plumbing Pro', 'SUB-1156'),
  
  -- Permits and fees (3% of budget)
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'permits', 'Building permit application', 200.00, '2025-06-18', 'paid', 'City of Austin', 'PERMIT-2025-8834'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'permits', 'Electrical permit fee', 100.00, '2025-06-20', 'paid', 'City of Austin', 'PERMIT-2025-8891'),
  
  -- Overhead expenses (7% of budget)
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'overhead', 'Project insurance premium', 300.00, '2025-06-19', 'paid', 'Texas Builders Insurance', 'INS-2025-4472'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'overhead', 'Site utilities and temporary power', 150.00, '2025-06-20', 'paid', 'Austin Energy', 'UTIL-847291'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'overhead', 'Safety equipment and supplies', 125.00, '2025-06-21', 'approved', 'Safety First Supply', 'SAF-9384'),
  ('05e5869c-f2ed-476b-a2c7-3fc700fad2e6', 'overhead', 'Waste disposal and cleanup', 125.00, '2025-06-22', 'pending', 'Austin Waste Management', 'WM-7765');
