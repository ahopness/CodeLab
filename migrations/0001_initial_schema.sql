-- Esquema Relacional para o Cloudflare D1 (SQLite) - CodeLab

-- 1. Tabela de Usuários (Alunos e Professores/Monitores)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('aluno', 'professor')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Tabela de Magic Links para Autenticação sem Senhas
CREATE TABLE IF NOT EXISTS magic_links (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Tabela de Sessões Ativas (Cookie HttpOnly)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Tabela de Turmas (Criadas por Professores)
CREATE TABLE IF NOT EXISTS classrooms (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    header_image TEXT,
    pin TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Tabela de Matrículas dos Alunos nas Turmas
CREATE TABLE IF NOT EXISTS classroom_enrollments (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(classroom_id, student_id)
);

-- 6. Tabela de Listas de Exercícios
CREATE TABLE IF NOT EXISTS exercise_lists (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. Tabela de Exercícios
CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL REFERENCES exercise_lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    initial_code TEXT,
    test_input TEXT,
    expected_output TEXT NOT NULL,
    video_link TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Tabela de Submissões de Código pelos Alunos
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    stdin TEXT,
    stdout TEXT,
    status TEXT NOT NULL CHECK (status IN ('correct', 'wrong_answer', 'error')),
    submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. Tabela de Feedbacks enviados pelo Professor
CREATE TABLE IF NOT EXISTS feedbacks (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback_text TEXT NOT NULL,
    sent_to_email TEXT NOT NULL,
    sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_hash ON magic_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_classrooms_pin ON classrooms(pin);
CREATE INDEX IF NOT EXISTS idx_classroom_enrollments_student ON classroom_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_exercise_lists_classroom ON exercise_lists(classroom_id);
CREATE INDEX IF NOT EXISTS idx_exercises_list ON exercises(list_id);
CREATE INDEX IF NOT EXISTS idx_submissions_exercise ON submissions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
