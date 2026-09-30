-- Deduplica registros mantendo apenas a submissão mais recente por estudante e exercício
DELETE FROM submissions 
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY student_id, exercise_id ORDER BY submitted_at DESC) as rn
        FROM submissions
    ) WHERE rn = 1
);

-- Garante que cada estudante possua no máximo uma submissão por exercício
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_student_exercise ON submissions(student_id, exercise_id);
