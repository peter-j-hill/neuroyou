-- Protocols build, Phase 1c: seed the four protocols, the Neutralize modules 0 to 6, and
-- placeholder lessons taken from the design canvas (protocols-handoff/design-canvas/Main.dc.html).
--
-- EVERYTHING IS A DRAFT. Titles are placeholders until Peter confirms them (plan Q8) and can be
-- edited later (admin, Phase 7). No lecture or lesson text is written here. Statuses are 'draft'
-- so nothing is visible until it is deliberately published; the protocols stay 'draft' until the
-- offer page and checkout exist (Phase 2) and are switched to live / waitlist at launch.
--
-- Idempotent: modules and lessons are only inserted if the protocol has none yet.

insert into public.protocols (slug, title, tagline, sort_order, status) values
  ('neutralize',        'Neutralize',         'Work directly with the structure of emotion.', 1, 'draft'),
  ('neurogoal',         'NeuroGoal',          'Align intention and attention on an outcome.',  2, 'draft'),
  ('realitydistortion', 'Reality Distortion', 'Explore every layer of consciousness.',         3, 'draft'),
  ('neurofinity',       'NeuroFinity',        'Transcendent states, made systematic.',         4, 'draft')
on conflict (slug) do nothing;

-- Each protocol requires the one before it.
update public.protocols p
set prerequisite_protocol_id = pre.id
from public.protocols pre
where p.prerequisite_protocol_id is null
  and (p.slug, pre.slug) in (
    ('neurogoal', 'neutralize'),
    ('realitydistortion', 'neurogoal'),
    ('neurofinity', 'realitydistortion'));

-- Neutralize modules. Unlock rule: opens once the module numbered unlock_after is finished.
-- Module 5 after Module 3 is an ASSUMPTION awaiting Peter's confirmation (design doc, item 6).
insert into public.protocol_modules (protocol_id, ordinal, slug, title, unlock_after_ordinal, status)
select p.id, v.ordinal, v.slug, v.title, v.unlock_after, 'draft'
from public.protocols p,
  (values
    (0, 'before-you-begin',         'Before you begin',         null::int),
    (1, 'why-emotion-blocks-action', 'Why emotion blocks action', 0),
    (2, 'the-insight',              'The insight',              1),
    (3, 'the-protocol',             'The protocol',             2),
    (4, 'practice',                 'Practice',                 3),
    (5, 'when-it-does-not-shift',   'When it does not shift',   3),
    (6, 'advanced-practice',        'Advanced practice',        5)
  ) as v(ordinal, slug, title, unlock_after)
where p.slug = 'neutralize'
  and not exists (select 1 from public.protocol_modules m where m.protocol_id = p.id);

-- Placeholder lessons (draft). Practice rooms are open-ended, so they are not "required".
insert into public.protocol_lessons
  (protocol_id, module_id, ordinal, slug, kind, title, duration_min, required, config, status)
select m.protocol_id, m.id, v.ordinal, v.slug, v.kind, v.title, v.duration_min, v.required, v.config::jsonb, 'draft'
from public.protocol_modules m
join public.protocols p on p.id = m.protocol_id and p.slug = 'neutralize'
join (values
  (0, 0, 'welcome-from-peter',                'video',          'Welcome from Peter',                                        null::int, true,  '{}'),
  (0, 1, 'what-this-is-and-is-not',           'reading',        'What this is, and is not',                                  null,      true,  '{}'),
  (0, 2, 'is-now-a-good-time',                'check_in',       'Is now a good time?',                                       null,      true,  '{}'),
  (1, 0, 'lecture-1-the-starting-point',      'video',          'Lecture 1: The starting point',                             null,      true,  '{}'),
  (1, 1, 'goal-action-block',                 'explorer',       'Goal → action → block',                                     null,      true,  '{"explorer":"goal-action-block"}'),
  (1, 2, 'where-do-you-get-stuck',            'journal_prompt', 'Where do you get stuck?',                                   null,      true,  '{}'),
  (2, 0, 'lecture-2-levels-of-consciousness', 'video',          'Lecture 2: Levels of consciousness',                        null,      true,  '{}'),
  (2, 1, 'imagining-neurons',                 'try_it',         'Imagining neurons',                                         2,         true,  '{}'),
  (2, 2, 'brain-imagination',                 'try_it',         'Brain imagination',                                         2,         true,  '{}'),
  (2, 3, 'meaning-vs-structure',              'explorer',       'Meaning vs structure',                                      5,         true,  '{"explorer":"meaning-vs-structure"}'),
  (2, 4, 'synaptic-pruning',                  'reading',        'Synaptic pruning, in plain words',                          6,         true,  '{}'),
  (3, 0, 'focus-preparation-what-to-expect',  'reading',        'Focus, preparation, what to expect',                        null,      true,  '{}'),
  (3, 1, 'the-seven-steps',                   'audio',          'Guided practice: the seven steps',                          null,      true,  '{}'),
  (3, 2, 'debrief-what-each-step-did',        'video',          'Debrief: what each step did',                               null,      true,  '{}'),
  (4, 0, 'practice-room',                     'practice',       'Practice room',                                             null,      false, '{"room":"emotions"}'),
  (5, 0, 'i-dont-want-to-feel-this',          'reading',        '“I don’t want to feel this”',                               null,      true,  '{}'),
  (5, 1, 'layered-emotions',                  'explorer',       'Layered emotions',                                          null,      true,  '{"explorer":"layers"}'),
  (6, 0, 'lecture-3-beyond-emotion',          'video',          'Lecture 3: Beyond emotion: can a thought be neutralized?',  null,      true,  '{}'),
  (6, 1, 'advanced-practice-room',            'practice',       'Advanced practice room',                                    null,      false, '{"room":"advanced"}'),
  (6, 2, 'why-the-abstract-senses-wait',      'care_note',      'Why the abstract senses wait for NeuroFinity',              null,      true,  '{}')
) as v(module_ordinal, ordinal, slug, kind, title, duration_min, required, config)
  on v.module_ordinal = m.ordinal
where not exists (select 1 from public.protocol_lessons l where l.protocol_id = p.id);
