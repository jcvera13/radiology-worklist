-- Radiology Orchestration System Database Schema
-- Authoritative source of truth for historical data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== RADIOLOGISTS TABLE ====================
CREATE TABLE radiologists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    subspecialties TEXT[] NOT NULL DEFAULT '{}',
    max_rvu_per_shift DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    status VARCHAR(50) NOT NULL DEFAULT 'offline',
    current_shift_rvu DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== EXAMS TABLE ====================
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accession_number VARCHAR(100) UNIQUE NOT NULL,
    cpt_code VARCHAR(10) NOT NULL,
    rvu_value DECIMAL(10,2) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'routine',
    subspecialty VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES radiologists(id) ON DELETE SET NULL,
    locked_by UUID REFERENCES radiologists(id) ON DELETE SET NULL,
    locked_at TIMESTAMP,
    completed_at TIMESTAMP,
    patient_mrn VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ASSIGNMENTS TABLE ====================
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    radiologist_id UUID NOT NULL REFERENCES radiologists(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'assigned',
    assignment_type VARCHAR(50) NOT NULL DEFAULT 'automatic',
    rvu_at_assignment DECIMAL(10,2)
);

-- ==================== SHIFTS TABLE ====================
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    radiologist_id UUID NOT NULL REFERENCES radiologists(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_rvu DECIMAL(10,2) DEFAULT 0.00,
    exam_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== AUDIT LOGS TABLE ====================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor VARCHAR(255) NOT NULL,
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    context TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== CPT CODE MAPPING TABLE ====================
CREATE TABLE cpt_codes (
    code VARCHAR(10) PRIMARY KEY,
    description TEXT NOT NULL,
    rvu_value DECIMAL(10,2) NOT NULL,
    subspecialty VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES FOR PERFORMANCE ====================
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_assigned_to ON exams(assigned_to);
CREATE INDEX idx_exams_accession ON exams(accession_number);
CREATE INDEX idx_exams_created_at ON exams(created_at DESC);
CREATE INDEX idx_assignments_exam ON assignments(exam_id);
CREATE INDEX idx_assignments_radiologist ON assignments(radiologist_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_shifts_radiologist ON shifts(radiologist_id);

-- ==================== SEED DATA ====================

-- Insert CPT codes with RVU values
INSERT INTO cpt_codes (code, description, rvu_value, subspecialty) VALUES
('71045', 'Chest X-ray, single view', 0.78, 'Chest'),
('71046', 'Chest X-ray, 2 views', 0.89, 'Chest'),
('74177', 'CT Abdomen and Pelvis with contrast', 2.15, 'Body'),
('70450', 'CT Head without contrast', 1.89, 'Neuro'),
('72148', 'MRI Lumbar Spine without contrast', 2.44, 'MSK'),
('73721', 'MRI Knee without contrast', 1.67, 'MSK'),
('74183', 'MRI Abdomen with contrast', 2.89, 'Body'),
('70553', 'MRI Brain with and without contrast', 3.12, 'Neuro'),
('73218', 'MRI Upper Extremity', 2.21, 'MSK'),
('71250', 'CT Chest with contrast', 2.01, 'Chest');

-- Insert sample radiologists
INSERT INTO radiologists (id, name, email, subspecialties, max_rvu_per_shift, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Dr. Sarah Smith', 'sarah.smith@hospital.com', ARRAY['Chest', 'General'], 50.00, 'available'),
('22222222-2222-2222-2222-222222222222', 'Dr. John Johnson', 'john.johnson@hospital.com', ARRAY['Neuro', 'General'], 45.00, 'available'),
('33333333-3333-3333-3333-333333333333', 'Dr. Emily Williams', 'emily.williams@hospital.com', ARRAY['MSK', 'Body', 'General'], 55.00, 'available'),
('44444444-4444-4444-4444-444444444444', 'Dr. Michael Brown', 'michael.brown@hospital.com', ARRAY['Body', 'General'], 50.00, 'available'),
('55555555-5555-5555-5555-555555555555', 'Dr. Lisa Davis', 'lisa.davis@hospital.com', ARRAY['Chest', 'Neuro'], 48.00, 'available');

-- Insert sample shifts (current day)
INSERT INTO shifts (radiologist_id, start_time, end_time) VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 hours'),
('22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 hours'),
('33333333-3333-3333-3333-333333333333', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 hours'),
('44444444-4444-4444-4444-444444444444', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 hours'),
('55555555-5555-5555-5555-555555555555', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 hours');

-- ==================== FUNCTIONS & TRIGGERS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_radiologists_updated_at BEFORE UPDATE ON radiologists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log exam status changes
CREATE OR REPLACE FUNCTION log_exam_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO audit_logs (actor, action, resource_type, resource_id, context)
        VALUES (
            'SYSTEM',
            'STATUS_CHANGE',
            'exam',
            NEW.id,
            format('Status changed from %s to %s', OLD.status, NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_exam_status AFTER UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION log_exam_status_change();

-- ==================== VIEWS FOR REPORTING ====================

-- View: Current radiologist workload
CREATE VIEW radiologist_workload AS
SELECT 
    r.id,
    r.name,
    r.status,
    r.max_rvu_per_shift,
    COALESCE(SUM(e.rvu_value), 0) as current_shift_rvu,
    COUNT(e.id) FILTER (WHERE e.status = 'assigned') as assigned_count,
    COUNT(e.id) FILTER (WHERE e.status = 'locked') as locked_count,
    COUNT(e.id) FILTER (WHERE e.status = 'completed') as completed_count
FROM radiologists r
LEFT JOIN exams e ON e.assigned_to = r.id 
    AND e.created_at > CURRENT_DATE
GROUP BY r.id, r.name, r.status, r.max_rvu_per_shift;

-- View: Pending exams summary
CREATE VIEW pending_exams_summary AS
SELECT 
    subspecialty,
    priority,
    COUNT(*) as exam_count,
    SUM(rvu_value) as total_rvu
FROM exams
WHERE status = 'pending'
GROUP BY subspecialty, priority
ORDER BY priority, subspecialty;

-- ==================== GRANTS (for application user) ====================
-- In production, create a specific application user with limited permissions
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO radiology_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO radiology_app;
