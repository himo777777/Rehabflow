-- ============================================================================
-- CLINICAL DECISION SUPPORT TABLES
-- ============================================================================
-- Database schema for AI-powered clinical decision support system
-- Tracks decisions, interventions, and audit logs

-- ============================================================================
-- CLINICAL DECISIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cds_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Decision details
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    category TEXT NOT NULL CHECK (category IN (
        'safety', 'pain_management', 'exercise_modification',
        'progression', 'adherence', 'psychological', 'referral', 'monitoring'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT,

    -- AI metadata
    ai_confidence DECIMAL(3,2) DEFAULT 0.85,
    ai_model_version TEXT DEFAULT 'v1.0',
    requires_immediate_action BOOLEAN DEFAULT FALSE,

    -- Clinical guideline reference
    guideline_id TEXT,
    guideline_name TEXT,
    guideline_source TEXT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'acknowledged', 'acted_upon', 'dismissed', 'expired'
    )),
    expires_at TIMESTAMPTZ,

    -- Signals that triggered this decision (JSONB)
    signals JSONB DEFAULT '[]'::jsonb,

    -- Recommended actions (JSONB)
    recommended_actions JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id),
    acted_upon_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    dismissed_by UUID REFERENCES users(id),
    dismiss_reason TEXT
);

-- Indexes for common queries
CREATE INDEX idx_cds_decisions_patient ON cds_decisions(patient_id);
CREATE INDEX idx_cds_decisions_provider ON cds_decisions(provider_id);
CREATE INDEX idx_cds_decisions_status ON cds_decisions(status);
CREATE INDEX idx_cds_decisions_priority ON cds_decisions(priority);
CREATE INDEX idx_cds_decisions_category ON cds_decisions(category);
CREATE INDEX idx_cds_decisions_created ON cds_decisions(created_at DESC);
CREATE INDEX idx_cds_decisions_active_critical ON cds_decisions(priority, status)
    WHERE status = 'active' AND priority IN ('critical', 'high');

-- ============================================================================
-- INTERVENTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cds_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES cds_decisions(id) ON DELETE CASCADE,
    recommendation_id TEXT NOT NULL,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Intervention details
    type TEXT NOT NULL CHECK (type IN (
        'contact_patient', 'modify_program', 'escalate',
        'monitor', 'refer', 'educate'
    )),
    title TEXT NOT NULL,
    description TEXT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'deferred', 'cancelled'
    )),

    -- Notes and outcome
    notes TEXT,
    outcome TEXT,
    outcome_rating INTEGER CHECK (outcome_rating BETWEEN 1 AND 5),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    deferred_until TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT
);

-- Indexes
CREATE INDEX idx_cds_interventions_decision ON cds_interventions(decision_id);
CREATE INDEX idx_cds_interventions_patient ON cds_interventions(patient_id);
CREATE INDEX idx_cds_interventions_provider ON cds_interventions(provider_id);
CREATE INDEX idx_cds_interventions_status ON cds_interventions(status);
CREATE INDEX idx_cds_interventions_created ON cds_interventions(created_at DESC);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cds_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What was affected
    entity_type TEXT NOT NULL CHECK (entity_type IN ('decision', 'intervention', 'guideline')),
    entity_id UUID NOT NULL,

    -- Who performed the action
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role TEXT,

    -- Action details
    action TEXT NOT NULL CHECK (action IN (
        'created', 'viewed', 'acknowledged', 'dismissed',
        'started', 'completed', 'deferred', 'cancelled',
        'modified', 'escalated'
    )),
    action_details JSONB,

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cds_audit_entity ON cds_audit_log(entity_type, entity_id);
CREATE INDEX idx_cds_audit_user ON cds_audit_log(user_id);
CREATE INDEX idx_cds_audit_action ON cds_audit_log(action);
CREATE INDEX idx_cds_audit_created ON cds_audit_log(created_at DESC);

-- ============================================================================
-- CLINICAL GUIDELINES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cds_guidelines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    condition TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    evidence_level TEXT NOT NULL CHECK (evidence_level IN (
        'Strong', 'Moderate', 'Weak', 'Expert Opinion'
    )),

    -- Metadata
    version TEXT DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id)
);

-- ============================================================================
-- DECISION SIGNAL HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS cds_signal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Signal details
    source TEXT NOT NULL CHECK (source IN (
        'risk_stratification', 'pain_alert', 'red_flag',
        'pain_prediction', 'adherence', 'movement_quality'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    value DECIMAL(10,2),
    message TEXT NOT NULL,
    data JSONB,

    -- Whether a decision was generated
    decision_generated BOOLEAN DEFAULT FALSE,
    decision_id UUID REFERENCES cds_decisions(id),

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cds_signals_patient ON cds_signal_history(patient_id);
CREATE INDEX idx_cds_signals_source ON cds_signal_history(source);
CREATE INDEX idx_cds_signals_severity ON cds_signal_history(severity);
CREATE INDEX idx_cds_signals_created ON cds_signal_history(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE cds_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cds_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cds_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cds_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE cds_signal_history ENABLE ROW LEVEL SECURITY;

-- Policies for decisions
CREATE POLICY "Providers can view their patients decisions" ON cds_decisions
    FOR SELECT USING (
        provider_id = auth.uid() OR
        patient_id IN (
            SELECT user_id FROM programs WHERE provider_id = auth.uid()
        )
    );

CREATE POLICY "Providers can create decisions" ON cds_decisions
    FOR INSERT WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their decisions" ON cds_decisions
    FOR UPDATE USING (provider_id = auth.uid());

-- Policies for interventions
CREATE POLICY "Providers can view their interventions" ON cds_interventions
    FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Providers can create interventions" ON cds_interventions
    FOR INSERT WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their interventions" ON cds_interventions
    FOR UPDATE USING (provider_id = auth.uid());

-- Policies for audit log (read-only for providers)
CREATE POLICY "Providers can view audit log" ON cds_audit_log
    FOR SELECT USING (
        user_id = auth.uid() OR
        entity_id IN (
            SELECT id FROM cds_decisions WHERE provider_id = auth.uid()
        )
    );

-- Policies for guidelines (everyone can read)
CREATE POLICY "Anyone can view active guidelines" ON cds_guidelines
    FOR SELECT USING (is_active = TRUE);

-- Policies for signal history
CREATE POLICY "Providers can view patient signals" ON cds_signal_history
    FOR SELECT USING (
        patient_id IN (
            SELECT user_id FROM programs WHERE provider_id = auth.uid()
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_cds_audit(
    p_entity_type TEXT,
    p_entity_id UUID,
    p_action TEXT,
    p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO cds_audit_log (entity_type, entity_id, user_id, action, action_details)
    VALUES (p_entity_type, p_entity_id, auth.uid(), p_action, p_details)
    RETURNING id INTO v_audit_id;

    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get provider dashboard stats
CREATE OR REPLACE FUNCTION get_cds_dashboard_stats(p_provider_id UUID)
RETURNS TABLE (
    total_active INTEGER,
    critical_count INTEGER,
    high_count INTEGER,
    pending_interventions INTEGER,
    completed_today INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE d.status = 'active')::INTEGER as total_active,
        COUNT(*) FILTER (WHERE d.status = 'active' AND d.priority = 'critical')::INTEGER as critical_count,
        COUNT(*) FILTER (WHERE d.status = 'active' AND d.priority = 'high')::INTEGER as high_count,
        (SELECT COUNT(*) FROM cds_interventions i
         WHERE i.provider_id = p_provider_id AND i.status IN ('pending', 'in_progress'))::INTEGER as pending_interventions,
        (SELECT COUNT(*) FROM cds_interventions i
         WHERE i.provider_id = p_provider_id
         AND i.status = 'completed'
         AND i.completed_at >= CURRENT_DATE)::INTEGER as completed_today
    FROM cds_decisions d
    WHERE d.provider_id = p_provider_id
    OR d.patient_id IN (
        SELECT user_id FROM programs WHERE provider_id = p_provider_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire old decisions
CREATE OR REPLACE FUNCTION expire_old_decisions() RETURNS void AS $$
BEGIN
    UPDATE cds_decisions
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to log decision status changes
CREATE OR REPLACE FUNCTION log_decision_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM log_cds_audit(
            'decision',
            NEW.id,
            CASE NEW.status
                WHEN 'acknowledged' THEN 'acknowledged'
                WHEN 'acted_upon' THEN 'started'
                WHEN 'dismissed' THEN 'dismissed'
                ELSE 'modified'
            END,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decision_status_change
    AFTER UPDATE ON cds_decisions
    FOR EACH ROW
    EXECUTE FUNCTION log_decision_status_change();

-- Trigger to log intervention status changes
CREATE OR REPLACE FUNCTION log_intervention_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM log_cds_audit(
            'intervention',
            NEW.id,
            NEW.status,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'outcome', NEW.outcome
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_intervention_status_change
    AFTER UPDATE ON cds_interventions
    FOR EACH ROW
    EXECUTE FUNCTION log_intervention_status_change();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for active critical decisions
CREATE OR REPLACE VIEW v_critical_decisions AS
SELECT
    d.*,
    u.name as patient_name,
    p.diagnosis,
    p.current_phase,
    p.total_phases
FROM cds_decisions d
JOIN users u ON d.patient_id = u.id
LEFT JOIN programs p ON p.user_id = d.patient_id
WHERE d.status = 'active'
AND d.priority IN ('critical', 'high')
ORDER BY
    CASE d.priority WHEN 'critical' THEN 0 ELSE 1 END,
    d.created_at DESC;

-- View for provider intervention summary
CREATE OR REPLACE VIEW v_provider_intervention_summary AS
SELECT
    provider_id,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'deferred') as deferred,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
    COUNT(*) as total,
    AVG(outcome_rating) FILTER (WHERE outcome_rating IS NOT NULL) as avg_outcome_rating
FROM cds_interventions
GROUP BY provider_id;

-- ============================================================================
-- SEED CLINICAL GUIDELINES
-- ============================================================================

INSERT INTO cds_guidelines (id, name, source, condition, recommendation, evidence_level) VALUES
('acl-progression', 'ACL Reconstruction Rehabilitation Progression', 'AAOS Clinical Practice Guidelines 2024', 'ACL Reconstruction', 'Progress to phase 2 when: ROM 0-120°, minimal effusion, good quadriceps control', 'Strong'),
('lbp-yellow-flags', 'Low Back Pain Yellow Flags', 'Socialstyrelsen Nationella Riktlinjer', 'Low Back Pain', 'Screen for yellow flags: catastrophizing, fear-avoidance, depression. Consider CBT referral if present.', 'Strong'),
('shoulder-pain-escalation', 'Shoulder Pain Escalation Criteria', 'Swedish Shoulder Network Guidelines', 'Rotator Cuff', 'Refer for imaging if: night pain >2 weeks, no improvement after 6 weeks conservative care, suspected full-thickness tear', 'Moderate'),
('chronic-pain-multimodal', 'Chronic Pain Multimodal Approach', 'SBU Systematisk Litteraturöversikt', 'Chronic Pain', 'For pain >12 weeks: combine exercise therapy, patient education, and psychological support. Consider pain specialist referral.', 'Strong'),
('post-op-infection-signs', 'Post-Operative Infection Warning Signs', 'Svensk Ortopedisk Förening', 'Post-Operative', 'Monitor for: increasing pain after initial improvement, warmth, redness spreading >2cm from incision, fever >38.5°C, purulent discharge', 'Strong'),
('adherence-intervention', 'Low Adherence Intervention Protocol', 'Physical Therapy Best Practice', 'General', 'For adherence <50%: 1) Identify barriers, 2) Simplify program, 3) Increase contact frequency, 4) Consider motivational interviewing', 'Moderate'),
('pain-spike-protocol', 'Pain Spike Management Protocol', 'RehabFlow Clinical Protocol', 'General', 'For pain increase >2 points: 1) Reduce exercise intensity 25%, 2) Contact within 24h, 3) Review for red flags, 4) Consider activity modification', 'Expert Opinion'),
('kinesiophobia-screening', 'Fear-Avoidance Screening', 'Tampa Scale Clinical Application', 'Musculoskeletal', 'TSK-11 score >27: High kinesiophobia. Implement graded exposure, pain neuroscience education. Consider psychology referral.', 'Strong')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    recommendation = EXCLUDED.recommendation,
    last_updated = NOW();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE cds_decisions IS 'AI-generated clinical decisions requiring provider action';
COMMENT ON TABLE cds_interventions IS 'Provider actions taken in response to clinical decisions';
COMMENT ON TABLE cds_audit_log IS 'Audit trail for all CDS actions for compliance';
COMMENT ON TABLE cds_guidelines IS 'Evidence-based clinical guidelines referenced by decisions';
COMMENT ON TABLE cds_signal_history IS 'Historical record of clinical signals for analysis';
