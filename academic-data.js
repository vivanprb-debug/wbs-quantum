const lesson = (subject, teacher, room, type = 'lesson') => Object.freeze({ subject, teacher, room, type });
const freezeWeek = (week) => Object.freeze(Object.fromEntries(Object.entries(week).map(([day, periods]) => [day, Object.freeze(periods.map(Object.freeze))])));
const freezeBlocks = blocks => Object.freeze(blocks.map(Object.freeze));
const peDays = Object.freeze({ A: Object.freeze([3, 4]), B: Object.freeze([2, 3]) });

// ---------------------------------------------------------------------------
// Fionan — exact supplied 2026–2027 timetable.
// ---------------------------------------------------------------------------
const fionanWeekA = freezeWeek({
  1: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('Technology / DT', 'Mr Milne', 'AD4'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Science (Biology)', 'Miss Bermingham', 'S3', 'science'), lesson('English', 'Mrs Eye', 'E4'), lesson('Geography', 'Mr Knox', 'H6')],
  2: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('History', 'Mr Elston', 'H10'), lesson('German', 'Miss Campbell', 'L3'), lesson('Maths', 'Dr Smith', 'M7'), lesson('RE', 'Mr Fryer', 'M7'), lesson('Computing', 'Mr Brown', 'CR2')],
  3: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('English', 'Mrs Eye', 'E4'), lesson('French', 'Miss Lowry', 'L6'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('Science (Chemistry)', 'Miss Perry', 'S12', 'science'), lesson('Art', 'Ms Mitchell', 'AD2')],
  4: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('English', 'Mrs Eye', 'E4'), lesson('PSHE', 'Ms Afford', 'H6'), lesson('Music', 'Mr Holloway', 'MU2'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('Maths', 'Dr Smith', 'M7')],
  5: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('German', 'Miss Campbell', 'L3'), lesson('Technology / DT', 'Mr Milne', 'AD4'), lesson('Science (Physics)', 'Mr King', 'S10', 'science'), lesson('Maths', 'Dr Smith', 'M7'), lesson('English', 'Mrs Eye', 'E4')]
});
const fionanWeekB = freezeWeek({
  1: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('Science (Biology)', 'Miss Bermingham', 'S3', 'science'), lesson('German', 'Miss Campbell', 'L3'), lesson('English', 'Mrs Eye', 'E4'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Geography', 'Mr Knox', 'H6')],
  2: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('French', 'Miss Lowry', 'L6'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Technology / DT', 'Mr Milne', 'AD4'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('History', 'Mr Elston', 'H10')],
  3: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('Geography', 'Mr Knox', 'H6'), lesson('Science (Chemistry)', 'Miss Perry', 'S12', 'science'), lesson('Music', 'Mr Holloway', 'MU2'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('English', 'Mrs Eye', 'E4')],
  4: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('Computing', 'Mr Brown', 'CR2'), lesson('RE', 'Mr Fryer', 'M7'), lesson('French', 'Miss Lowry', 'L6'), lesson('Science (Physics)', 'Mr King', 'S10', 'science'), lesson('History', 'Mr Elston', 'H10')],
  5: [lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'), lesson('Science (Biology)', 'Miss Bermingham', 'S3', 'science'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Art', 'Ms Mitchell', 'AD2'), lesson('English', 'Mrs Eye', 'E4'), lesson('PSHE', 'Ms Afford', 'H6')]
});
const fionanScienceRotation = Object.freeze([
  Object.freeze({ week: 'A', day: 1, period: 3, subject: 'Biology', teacher: 'Miss Bermingham', room: 'S3' }),
  Object.freeze({ week: 'A', day: 3, period: 4, subject: 'Chemistry', teacher: 'Miss Perry', room: 'S12' }),
  Object.freeze({ week: 'A', day: 5, period: 3, subject: 'Physics', teacher: 'Mr King', room: 'S10' }),
  Object.freeze({ week: 'B', day: 1, period: 1, subject: 'Biology', teacher: 'Miss Bermingham', room: 'S3' }),
  Object.freeze({ week: 'B', day: 3, period: 2, subject: 'Chemistry', teacher: 'Miss Perry', room: 'S12' }),
  Object.freeze({ week: 'B', day: 4, period: 4, subject: 'Physics', teacher: 'Mr King', room: 'S10' }),
  Object.freeze({ week: 'B', day: 5, period: 1, subject: 'Biology', teacher: 'Miss Bermingham', room: 'S3' })
]);
const fionanPeRotation = freezeBlocks([
  { wc: '2026-08-31', a: 'Rugby', b: 'Football' },
  { wc: '2026-10-05', a: 'X-Country', b: 'Basketball' },
  { wc: '2026-11-16', a: 'HRF', b: 'Swimming' },
  { wc: '2027-01-04', a: 'Badminton', b: 'Hockey' },
  { wc: '2027-02-01', a: 'Table Tennis', b: 'Sport Education' },
  { wc: '2027-03-08', a: 'Personal Survival' },
  { wc: '2027-04-19', a: 'Athletics', b: 'Cricket' },
  { wc: '2027-05-17', b: 'Volleyball' },
  { wc: '2027-06-21', b: 'Tennis' }
]);

// ---------------------------------------------------------------------------
// Vivan — retained from the original app's default 2026–2027 schedule.
// ---------------------------------------------------------------------------
const vivanWeekA = freezeWeek({
  1: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Biology', 'Miss Brown', 'S4', 'science'), lesson('English', 'Mr Reid', 'E8'), lesson('Geography', 'Mrs Woodcock', 'H1')],
  2: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Art', 'Mrs Hickey', 'AD3'), lesson('German', 'Miss Campbell', 'L3'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Music', 'Mr Holloway', 'MU2'), lesson('RE', 'Mr Fryer', 'M3')],
  3: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('English', 'Mr Reid', 'E8'), lesson('French', 'Miss Lowry', 'L6'), lesson('PE', 'Mr Landa', 'PE Area', 'pe'), lesson('Physics', 'Mr Foster', 'S11', 'science'), lesson('Computing', 'Mr Eyre', 'CR1')],
  4: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('English', 'Mr Reid', 'E8'), lesson('PSHE', 'Mr Taylor', 'E6'), lesson('History', 'Mrs Hester', 'H9'), lesson('PE', 'Mr Landa', 'PE Area', 'pe'), lesson('Maths', 'Dr Smith', 'M7')],
  5: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('German', 'Miss Campbell', 'L3'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('Chemistry', 'Mr Higgs', 'S9', 'science'), lesson('Maths', 'Dr Smith', 'M7'), lesson('English', 'Mr Reid', 'E8')]
});
const vivanWeekB = freezeWeek({
  1: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Biology', 'Miss Brown', 'S4', 'science'), lesson('German', 'Miss Campbell', 'L3'), lesson('English', 'Mr Reid', 'E8'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Geography', 'Mrs Woodcock', 'H1')],
  2: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('French', 'Miss Lowry', 'L6'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('PE', 'Mr Landa', 'PE Area', 'pe'), lesson('RE', 'Mr Fryer', 'M3')],
  3: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Computing', 'Mr Eyre', 'CR1'), lesson('Physics', 'Mr Foster', 'S11', 'science'), lesson('History', 'Mrs Hester', 'H9'), lesson('PE', 'Mr Landa', 'PE Area', 'pe'), lesson('English', 'Mr Reid', 'E8')],
  4: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Art', 'Mrs Hickey', 'AD3'), lesson('History', 'Mrs Hester', 'H9'), lesson('French', 'Miss Lowry', 'L6'), lesson('Chemistry', 'Mr Higgs', 'S9', 'science'), lesson('Music', 'Mr Holloway', 'MU2')],
  5: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Chemistry', 'Mr Higgs', 'S9', 'science'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Geography', 'Mrs Woodcock', 'H1'), lesson('English', 'Mr Reid', 'E8'), lesson('PSHE', 'Mr Taylor', 'E5')]
});
const vivanPeRotation = freezeBlocks([
  { wc: '2026-08-31', a: 'Badminton', b: 'Basketball' },
  { wc: '2026-10-05', a: 'HRF', b: 'Swimming' },
  { wc: '2026-11-16', a: 'Rugby', b: 'Football' },
  { wc: '2027-01-04', a: 'Hockey', b: 'X-Country' },
  { wc: '2027-02-01', a: 'Personal Survival', b: 'Sport Education' },
  { wc: '2027-03-08', a: 'Table Tennis', b: 'Sport Education' },
  { wc: '2027-04-19', a: 'Athletics', b: 'Tennis' },
  { wc: '2027-05-17', a: 'Athletics', b: 'Volleyball' },
  { wc: '2027-06-21', a: 'Athletics', b: 'Tennis' }
]);

// ---------------------------------------------------------------------------
// Shriyan — exact retained schedule from the original app.
// ---------------------------------------------------------------------------
const shriyanWeekA = freezeWeek({
  1: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Biology', 'Miss Brown', 'S4', 'science'), lesson('English', 'Miss Davies', 'E5'), lesson('Geography', 'Mrs Woodcock', 'H1')],
  2: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Art', 'Mrs Hickey', 'AD3'), lesson('French', 'Miss Williams', 'L1'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Music', 'Mr Holloway', 'MU2'), lesson('RE', 'Mr Fryer', 'M3')],
  3: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('English', 'Miss Davies', 'E5'), lesson('French', 'Miss Williams', 'L1'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('Chemistry', 'Mr Higgs', 'S9', 'science'), lesson('Computing', 'Mr Eyre', 'CR1')],
  4: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('English', 'Miss Davies', 'E5'), lesson('PSHE', 'Mr Taylor', 'E6'), lesson('History', 'Mrs Hester', 'H9'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('Maths', 'Dr Smith', 'M7')],
  5: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Spanish', 'Miss Gamero', 'L7'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('Physics', 'Mr Foster', 'S13', 'science'), lesson('Maths', 'Dr Smith', 'M7'), lesson('English', 'Miss Davies', 'E5')]
});
const shriyanWeekB = freezeWeek({
  1: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Biology', 'Miss Brown', 'S4', 'science'), lesson('Spanish', 'Miss Gamero', 'L4'), lesson('English', 'Miss Davies', 'E5'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Geography', 'Mrs Woodcock', 'H1')],
  2: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Spanish', 'Miss Gamero', 'L4'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('RE', 'Mr Fryer', 'M3')],
  3: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Computing', 'Mr Eyre', 'CR1'), lesson('Chemistry', 'Mr Higgs', 'S9', 'science'), lesson('History', 'Mrs Hester', 'H9'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('English', 'Miss Davies', 'E5')],
  4: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Art', 'Mrs Hickey', 'AD3'), lesson('History', 'Mrs Hester', 'H9'), lesson('French', 'Miss Williams', 'L1'), lesson('Physics', 'Mr Foster', 'S13', 'science'), lesson('Music', 'Mr Holloway', 'MU2')],
  5: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Biology', 'Miss Brown', 'S4', 'science'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Geography', 'Mrs Woodcock', 'H1'), lesson('English', 'Miss Davies', 'E5'), lesson('PSHE', 'Mr Taylor', 'E5')]
});
const shriyanPeRotation = freezeBlocks([
  { wc: '2026-08-31', a: 'Rugby', b: 'Football' },
  { wc: '2026-10-05', a: 'X-Country', b: 'Basketball' },
  { wc: '2026-11-16', a: 'HRF', b: 'Swimming' },
  { wc: '2027-01-04', a: 'Badminton', b: 'Hockey' },
  { wc: '2027-02-01', a: 'Table Tennis', b: 'Sport Education' },
  { wc: '2027-03-08', a: 'Personal Survival' },
  { wc: '2027-04-19', a: 'Athletics', b: 'Cricket' },
  { wc: '2027-05-17', b: 'Volleyball' }
]);

// ---------------------------------------------------------------------------
// Ryan — exact retained 2026–2027 schedule from the original app.
// ---------------------------------------------------------------------------
const ryanWeekA = freezeWeek({
  1: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Physics', 'Mr King', 'S10', 'science'), lesson('English', 'Miss Davies', 'E5'), lesson('Geography', 'Mrs Woodcock', 'H1')],
  2: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Art', 'Mrs Hickey', 'AD3'), lesson('German', 'Miss Campbell', 'L3'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Music', 'Mr Holloway', 'MU2'), lesson('RE', 'Mr Fryer', 'M3')],
  3: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('English', 'Miss Davies', 'E5'), lesson('French', 'Miss Lowry', 'L6'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('Biology', 'Miss Bermingham', 'S3', 'science'), lesson('Computing', 'Mr Eyre', 'CR1')],
  4: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('English', 'Miss Davies', 'E5'), lesson('PSHE', 'Mr Taylor', 'E6'), lesson('History', 'Mrs Hester', 'H9'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('Maths', 'Dr Smith', 'M7')],
  5: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('German', 'Miss Campbell', 'L3'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('Chemistry', 'Mrs Perry', 'S12', 'science'), lesson('Maths', 'Dr Smith', 'M7'), lesson('English', 'Miss Davies', 'E5')]
});
const ryanWeekB = freezeWeek({
  1: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Physics', 'Mr King', 'S10', 'science'), lesson('German', 'Miss Campbell', 'L3'), lesson('English', 'Miss Davies', 'E5'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Geography', 'Mrs Woodcock', 'H1')],
  2: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('French', 'Miss Lowry', 'L6'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('RE', 'Mr Fryer', 'M3')],
  3: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Computing', 'Mr Eyre', 'CR1'), lesson('Biology', 'Miss Bermingham', 'S3', 'science'), lesson('History', 'Mrs Hester', 'H9'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('English', 'Miss Davies', 'E5')],
  4: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Art', 'Mrs Hickey', 'AD3'), lesson('History', 'Mrs Hester', 'H9'), lesson('French', 'Miss Lowry', 'L6'), lesson('Chemistry', 'Mrs Perry', 'S12', 'science'), lesson('Music', 'Mr Holloway', 'MU2')],
  5: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Chemistry', 'Mrs Perry', 'S12', 'science'), lesson('Maths', 'Dr Smith', 'M7'), lesson('Geography', 'Mrs Woodcock', 'H1'), lesson('English', 'Miss Davies', 'E5'), lesson('PSHE', 'Mr Taylor', 'E5')]
});
const ryanPeRotation = freezeBlocks([
  { wc: '2026-08-31', a: 'Rugby', b: 'Football', kit: 'Boots' },
  { wc: '2026-10-05', a: 'Cross Country', b: 'Basketball', kit: 'Outdoor Kit' },
  { wc: '2026-11-16', a: 'HRF', b: 'Swimming', kit: 'Swim Gear' },
  { wc: '2027-01-04', a: 'Badminton', b: 'Hockey', kit: 'Shin Guards' },
  { wc: '2027-02-01', a: 'Table Tennis', b: 'Sport Education', kit: 'Indoor Kit' },
  { wc: '2027-03-08', a: 'Personal Survival', b: 'Sport Education', kit: 'Swim Kit' },
  { wc: '2027-04-19', a: 'Athletics', b: 'Cricket', kit: 'Whites' },
  { wc: '2027-05-17', a: 'Athletics', b: 'Volleyball', kit: 'Outdoor Kit' },
  { wc: '2027-06-21', a: 'Athletics', b: 'Tennis', kit: 'Outdoor Kit' }
]);

// ---------------------------------------------------------------------------
// Freddie — exact retained timetable from the original app.
// ---------------------------------------------------------------------------
const freddieWeekA = freezeWeek({
  1: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('Maths', 'Mrs Bethell', 'M8'), lesson('Science (Biology)', 'Miss Brown', 'S4', 'science'), lesson('English', 'Miss Davies', 'E5'), lesson('Geography', 'Mrs Woodcock', 'H1')],
  2: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Art', 'Mrs Hickey', 'AD3'), lesson('French', 'Miss Williams', 'L1'), lesson('Maths', 'Mrs Bethell', 'M8'), lesson('Music', 'Mr Holloway', 'MU2'), lesson('RE', 'Mr Fryer', 'M3')],
  3: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('English', 'Miss Davies', 'E5'), lesson('French', 'Miss Williams', 'L1'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('Science (Chemistry)', 'Mr Higgs', 'S9', 'science'), lesson('Computing', 'Mr Eyre', 'CR1')],
  4: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('English', 'Miss Davies', 'E5'), lesson('PSHE', 'Mr Taylor', 'E6'), lesson('History', 'Mrs Hester', 'H9'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('Maths', 'Mrs Bethell', 'M8')],
  5: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Spanish', 'Miss Gamero', 'L4'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('Science (Physics)', 'Mr Foster', 'S13', 'science'), lesson('Maths', 'Mrs Bethell', 'M8'), lesson('English', 'Miss Davies', 'E5')]
});
const freddieWeekB = freezeWeek({
  1: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Science (Biology)', 'Miss Brown', 'S4', 'science'), lesson('Spanish', 'Miss Gamero', 'L4'), lesson('English', 'Miss Davies', 'E5'), lesson('Maths', 'Mrs Bethell', 'M8'), lesson('Geography', 'Mrs Woodcock', 'H1')],
  2: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Spanish', 'Miss Gamero', 'L4'), lesson('Maths', 'Mrs Bethell', 'M8'), lesson('Technology', 'Mr Milne', 'AD4'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('RE', 'Mr Fryer', 'M3')],
  3: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Computing', 'Mr Eyre', 'CR1'), lesson('Science (Chemistry)', 'Mr Higgs', 'S9', 'science'), lesson('History', 'Mrs Hester', 'H9'), lesson('PE', 'Mr Clibbens', 'PE Area', 'pe'), lesson('English', 'Miss Davies', 'E5')],
  4: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Art', 'Mrs Hickey', 'AD3'), lesson('History', 'Mrs Hester', 'H9'), lesson('French', 'Miss Williams', 'L1'), lesson('Science (Physics)', 'Mr Foster', 'S13', 'science'), lesson('Music', 'Mr Holloway', 'MU2')],
  5: [lesson('Form / Registration', 'Form', 'S6', 'registration'), lesson('Science (Biology)', 'Miss Brown', 'S4', 'science'), lesson('Maths', 'Mrs Bethell', 'M8'), lesson('Geography', 'Mrs Woodcock', 'H1'), lesson('English', 'Miss Davies', 'E5'), lesson('PSHE', 'Mr Taylor', 'E5')]
});
const freddiePeRotation = freezeBlocks([
  { wc: '2026-08-31', a: 'Rugby', b: 'Football' },
  { wc: '2026-10-05', a: 'X-Country', b: 'Basketball' },
  { wc: '2026-11-16', a: 'HRF', b: 'Swimming' },
  { wc: '2027-01-04', a: 'Badminton', b: 'Hockey' },
  { wc: '2027-02-01', a: 'Table Tennis', b: 'Sport Education' },
  { wc: '2027-03-08', a: 'Personal Survival' },
  { wc: '2027-04-19', a: 'Athletics', b: 'Cricket' },
  { wc: '2027-05-17', b: 'Volleyball' }
]);

const profiles = {
  'lMJrosbRgtVXmuRz7gZUxAlBMn53': {
    profileId: 'lMJrosbRgtVXmuRz7gZUxAlBMn53', name: 'Vivan', registration: lesson('Form / Registration', 'Form', 'S6', 'registration'),
    weekA: vivanWeekA, weekB: vivanWeekB, peDays, peRotation: vivanPeRotation
  },
  'o2Nv7qVfIoY5olElothK3YQnbGB2': {
    profileId: 'o2Nv7qVfIoY5olElothK3YQnbGB2', name: 'Shriyan', registration: lesson('Form / Registration', 'Form', 'S6', 'registration'),
    weekA: shriyanWeekA, weekB: shriyanWeekB, peDays, peRotation: shriyanPeRotation
  },
  'Nx8kPsp1NKhdJSio2PpRYDIvit22': {
    profileId: 'Nx8kPsp1NKhdJSio2PpRYDIvit22', name: 'Ryan', registration: lesson('Form / Registration', 'Form', 'S6', 'registration'),
    weekA: ryanWeekA, weekB: ryanWeekB, peDays, peRotation: ryanPeRotation
  },
  'YAF3QAxWhJRzFDvqDSBSp1xUHxH3': {
    profileId: 'YAF3QAxWhJRzFDvqDSBSp1xUHxH3', name: 'Freddie', registration: lesson('Form / Registration', 'Form', 'S6', 'registration'),
    weekA: freddieWeekA, weekB: freddieWeekB, peDays, peRotation: freddiePeRotation
  },
  'q5LP7Hr7EUX8CNbgNxcPrHY67it1': {
    profileId: 'q5LP7Hr7EUX8CNbgNxcPrHY67it1', name: 'Fionan', registration: lesson('Form / Registration', 'Miss McAllister', 'H6', 'registration'),
    weekA: fionanWeekA, weekB: fionanWeekB, peDays, peRotation: fionanPeRotation, scienceRotation: fionanScienceRotation
  }
};

export const ACADEMIC_PROFILES = Object.freeze(Object.fromEntries(
  Object.entries(profiles).map(([id, profile]) => [id, Object.freeze(profile)])
));

export function getAcademicProfile(profileId) {
  return profileId ? ACADEMIC_PROFILES[profileId] || null : null;
}

export function listAcademicProfiles() {
  return Object.freeze(Object.values(ACADEMIC_PROFILES));
}
