-- 001_exercises.sql
-- Seed data: starter exercise library
-- These are common gym exercises to populate the app for development

INSERT INTO exercises (name, category, muscle_group, description) VALUES
-- Chest
('Barbell Bench Press', 'Strength', 'Chest', 'Flat bench barbell press'),
('Incline Dumbbell Press', 'Strength', 'Chest', 'Incline bench dumbbell press at 30-45 degrees'),
('Cable Fly', 'Strength', 'Chest', 'Standing cable chest fly'),
('Push-Up', 'Bodyweight', 'Chest', 'Standard push-up'),

-- Back
('Deadlift', 'Strength', 'Back', 'Conventional deadlift from the floor'),
('Barbell Row', 'Strength', 'Back', 'Bent-over barbell row'),
('Pull-Up', 'Bodyweight', 'Back', 'Overhand grip pull-up'),
('Lat Pulldown', 'Machine', 'Back', 'Cable lat pulldown'),
('Seated Cable Row', 'Machine', 'Back', 'Seated cable row with V-bar'),

-- Legs
('Barbell Squat', 'Strength', 'Legs', 'Back squat with barbell'),
('Romanian Deadlift', 'Strength', 'Legs', 'Stiff-legged barbell deadlift'),
('Leg Press', 'Machine', 'Legs', '45-degree leg press'),
('Leg Curl', 'Machine', 'Legs', 'Lying or seated leg curl'),
('Leg Extension', 'Machine', 'Legs', 'Seated leg extension'),
('Walking Lunge', 'Strength', 'Legs', 'Dumbbell walking lunges'),

-- Shoulders
('Overhead Press', 'Strength', 'Shoulders', 'Standing barbell overhead press'),
('Lateral Raise', 'Strength', 'Shoulders', 'Standing dumbbell lateral raise'),
('Face Pull', 'Strength', 'Shoulders', 'Cable face pull for rear delts'),

-- Arms
('Barbell Curl', 'Strength', 'Arms', 'Standing barbell bicep curl'),
('Dumbbell Curl', 'Strength', 'Arms', 'Standing dumbbell curl'),
('Tricep Pushdown', 'Machine', 'Arms', 'Cable tricep pushdown'),
('Skull Crusher', 'Strength', 'Arms', 'Lying EZ-bar tricep extension'),

-- Core
('Plank', 'Bodyweight', 'Core', 'Front plank hold'),
('Hanging Leg Raise', 'Bodyweight', 'Core', 'Hanging straight or bent leg raise'),
('Cable Crunch', 'Machine', 'Core', 'Kneeling cable crunch');