// platform/scripts/platform-fixtures.mjs
var teachers = Object.freeze([
  Object.freeze({
    id: "teacher-preview-1",
    email: "teacher.preview@example.test",
    password: "BOB-Preview-001",
    displayName: "Preview Teacher"
  })
]);
var classes = Object.freeze([
  Object.freeze({
    id: "class-preview-1",
    code: "STEM-101",
    displayName: "Preview STEM Class",
    periodLabel: "Period 2",
    grade: 5,
    teacherId: "teacher-preview-1"
  }),
  Object.freeze({ id: "class-preview-2", code: "STEM-202", displayName: "Engineering Lab", periodLabel: "Period 4", grade: 5, teacherId: "teacher-preview-1" }),
  Object.freeze({ id: "class-preview-3", code: "STEM-303", displayName: "Innovation Studio", periodLabel: "Period 6", grade: 5, teacherId: "teacher-preview-1" })
]);
var students = Object.freeze([
  Object.freeze({ id: "student-preview-1", classId: "class-preview-1", displayName: "Ada Rivera", identifier: "1842" }),
  Object.freeze({ id: "student-preview-2", classId: "class-preview-1", displayName: "Mateo Chen", identifier: "2753" }),
  Object.freeze({ id: "student-preview-3", classId: "class-preview-1", displayName: "Jordan Brooks", identifier: "3964" })
]);
function normalize(value) {
  return String(value ?? "").trim();
}
var DEVELOPMENT_FIXTURE_NOTICE = "Development preview only. These fictional records do not provide production security.";
var DEVELOPMENT_FIXTURE_ACCESS = Object.freeze({
  teacherEmail: teachers[0].email,
  teacherPassword: teachers[0].password,
  classCode: classes[0].code
});
function validateTeacherCredentials(email, password) {
  const normalizedEmail = normalize(email).toLowerCase();
  const normalizedPassword = normalize(password);
  return teachers.find(
    (teacher) => teacher.email.toLowerCase() === normalizedEmail && teacher.password === normalizedPassword
  ) ?? null;
}
function findClassByCode(code) {
  const normalizedCode = normalize(code).toUpperCase();
  return classes.find((classRecord) => classRecord.code === normalizedCode) ?? null;
}
function getClassById(classId) {
  return classes.find((classRecord) => classRecord.id === classId) ?? null;
}
function getClassForTeacher(teacherId) {
  return classes.find((classRecord) => classRecord.teacherId === teacherId) ?? null;
}
function getClassesForTeacher(teacherId) {
  return classes.filter((classRecord) => classRecord.teacherId === teacherId);
}
function getTeacherById(teacherId) {
  return teachers.find((teacher) => teacher.id === teacherId) ?? null;
}
function getStudentById(studentId) {
  return students.find((student) => student.id === studentId) ?? null;
}
function getRosterForClass(classId) {
  return students.filter((student) => student.classId === classId);
}
function validateStudentIdentifier(classId, studentId, identifier) {
  const normalizedIdentifier = normalize(identifier);
  return students.find(
    (student) => student.classId === classId && student.id === studentId && student.identifier === normalizedIdentifier
  ) ?? null;
}
function getDevelopmentIdentifier(studentId) {
  return getStudentById(studentId)?.identifier ?? "";
}

// platform/scripts/platform-session.mjs
var PLATFORM_SESSION_KEY = "thinkamigbob.pb001.entry-state.v1";
var PLATFORM_ROLES = Object.freeze({
  TEACHER: "teacher",
  STUDENT: "student"
});
var EMPTY_STATE = Object.freeze({
  version: 1,
  role: null,
  teacherId: null,
  classId: null,
  studentId: null,
  pendingClassId: null,
  pendingStudentId: null
});
function cleanId(value) {
  return typeof value === "string" && value.length <= 100 ? value : null;
}
function sanitizeState(value) {
  if (!value || typeof value !== "object" || value.version !== 1) return { ...EMPTY_STATE };
  const role = Object.values(PLATFORM_ROLES).includes(value.role) ? value.role : null;
  return {
    version: 1,
    role,
    teacherId: role === PLATFORM_ROLES.TEACHER ? cleanId(value.teacherId) : null,
    classId: role === PLATFORM_ROLES.STUDENT ? cleanId(value.classId) : null,
    studentId: role === PLATFORM_ROLES.STUDENT ? cleanId(value.studentId) : null,
    pendingClassId: role ? null : cleanId(value.pendingClassId),
    pendingStudentId: role ? null : cleanId(value.pendingStudentId)
  };
}
function createSessionStore(storage) {
  let memoryState = { ...EMPTY_STATE };
  function read() {
    try {
      const raw = storage?.getItem(PLATFORM_SESSION_KEY);
      if (raw) return sanitizeState(JSON.parse(raw));
    } catch {
    }
    return sanitizeState(memoryState);
  }
  function write(nextState) {
    const cleanState = sanitizeState(nextState);
    memoryState = cleanState;
    try {
      storage?.setItem(PLATFORM_SESSION_KEY, JSON.stringify(cleanState));
    } catch {
    }
    return cleanState;
  }
  return Object.freeze({
    read,
    beginStudentEntry(classId) {
      return write({ ...EMPTY_STATE, pendingClassId: cleanId(classId) });
    },
    selectStudent(studentId) {
      const current = read();
      if (!current.pendingClassId) return current;
      return write({ ...current, pendingStudentId: cleanId(studentId) });
    },
    signInTeacher(teacherId) {
      return write({ ...EMPTY_STATE, role: PLATFORM_ROLES.TEACHER, teacherId: cleanId(teacherId) });
    },
    signInStudent(classId, studentId) {
      return write({
        ...EMPTY_STATE,
        role: PLATFORM_ROLES.STUDENT,
        classId: cleanId(classId),
        studentId: cleanId(studentId)
      });
    },
    signOut() {
      memoryState = { ...EMPTY_STATE };
      try {
        storage?.removeItem(PLATFORM_SESSION_KEY);
      } catch {
      }
      return { ...EMPTY_STATE };
    }
  });
}

// platform/scripts/cursive-strokes.mjs
var customLetters = {
  a: {
    paths: [
      { d: "M 9.0039 2.9991 C 8.2089 1.4091 7.8711 0.4659 6.0039 -0.0009 C 0.5166 -1.3727 -2.6187 7.5935 3.0039 8.9991 C 5.6538 9.6616 7.1841 8.1853 8.0039 5.9991 C 8.7539 3.9991 9.7539 0.2491 10.0039 -0.0009 C 10.2539 -0.2509 9.2539 2.9991 9.0039 4.9991 C 8.8263 6.4198 8.7357 9.7552 11.0039 8.9991 C 13.5611 8.1467 14.5827 6.1309 16.0039 3.9991" }
    ]
  },
  b: {
    paths: [
      { d: "M 14 4 C 12.6883 4.6558 11.5342 5.5114 10 5 C 8.483 4.4943 6.2253 0.1861 8.2477 0.1861 C 10.0633 0.1861 9.0922 2.5315 7.5327 4.6805 C 5.9689 6.8354 3.8124 8.7942 2.5407 8.992 C -0.0933 9.4016 0.9082 2.9916 1 1.798 C 1.2427 -1.3572 0.862 -12.202 6 -12.202 C 8.4714 -12.202 6.3998 -7.2016 6 -6.202 C 4.5767 -2.6439 2.1153 0.625 0 3.798" }
    ]
  },
  c: {
    paths: [
      { d: "M 7 1.9986 C 7 1.7486 7.25 1.4986 7 0.9986 C 4.7595 -3.4824 -2.6729 4.3257 1 7.9986 C 3.2512 10.2498 7.0176 8.981 9 6.9986 C 10.25 5.7486 10.5 4.7486 11 3.9986" }
    ]
  },
  d: {
    paths: [
      { d: "M 9 2.9825 C 7.9678 0.918 6.4434 -0.6284 4 -0.0175 C -1.6406 1.3926 -0.3435 11.4113 5 8.9825 C 10.5 6.4825 12.3186 -6.9733 14 -12.0175" },
      { d: "M 14 -12.0175 C 14.5 -13.5175 11.75 -3.7675 10.5 0.4825" },
      { d: "M 10.8838 -0.8583 C 10.1991 1.4695 6.8527 7.4088 10 8.9825 C 12.5144 10.2397 15.0502 5.4072 16 3.9825" }
    ]
  },
  e: {
    paths: [
      { d: "M 1 7 C 2.8515 6.0743 4.4647 5.141 5 3 C 5.679 0.2838 3.1044 -1.1044 1 1 C -0.673 2.6729 -0.6662 6.3338 1 8 C 4.4052 11.4052 8.1801 6.7299 10 4" }
    ]
  },
  f: {
    paths: [
      { d: "M 0 4 C 3.1472 0.066 6.9758 -3.879 8 -9 C 8.8504 -13.2521 4.8057 -11.6855 4 -9 C 2.2947 -3.3156 1.0947 2.4143 -1 8 C -2.5 12 -3 12.5 -4 15 C -4.4002 16.0006 -6.4727 21 -4 21 C 0.5634 21 -0.6931 10.7725 0 8 C 0.5 6 0.25 8.75 1 9 C 4.2993 10.0998 6.5041 6.2439 8 4" }
    ]
  },
  g: {
    paths: [
      { d: "M 9 3 C 7.4291 -0.1419 3.0973 -1.1459 1 2 C -2.0686 6.6029 2.8988 10.7342 7 8 C 7.75 7.5 7.75 7.25 8 7" },
      { d: "M 8 7 C 8.75 5 10 0 10 0" },
      { d: "M 10 0 C 8.9369 5.3156 6.2026 20.3955 1.9875 20.9539 C -1.3584 21.3972 -0.8492 17.7379 0.3283 15.3652 C 2.4303 11.1302 8.8308 9.8665 11.9765 7.2451 C 13.5347 5.9466 14.25 4.75 15 4" }
    ]
  },
  h: {
    paths: [
      { d: "M 0 4 C 0.5 3.25 0.75 3 2 1 C 2.6014 0.0377 10.5999 -12 6 -12 C 2.8115 -12 2.4422 -7.2109 2 -5 C 1.5 -2.5 1.5 -2.5 1 1 C 0.5 4.5 0.25 7 0 9" },
      { d: "M 0 9 C -0.25 11 -0.25 9.75 0 9 Z" },
      { d: "M 0 8.9999 C 0.25 8.2499 0.5 7.2499 1 5.9999 C 1.6941 4.2646 2.6744 2.3255 4 0.9999 C 4.9852 0.0147 6.6474 -0.4509 8 -0.0001 C 9.3237 0.4412 9.233 1.835 9 2.9999 C 8.666 4.67 7.3333 5.9999 8 7.9999 C 8.3018 8.9054 9.4082 9.8752 10.5341 9.6294 C 13.3199 9.0212 14.0878 6.3773 15 3.9999" }
    ]
  },
  i: {
    paths: [
      { d: "M 0 4 C 0.5 3 2.1263 -0.4838 2 0 C 1.334 2.5499 -0.9031 5.4005 0 8.1097 C 0.3018 9.0151 1.3897 9.2642 2.2294 8.9843 C 4.7764 8.1353 5.5954 6.1069 7 4" },
      { d: "", dot: { cx: 3.9, cy: -4.8, r: 1.6 } }
    ]
  },
  j: {
    paths: [
      { d: "M 0 4 C 0.4175 2.7301 2.1782 -1.0951 2.1782 -1.0951 C 2.1782 4.3228 -2.421 17.5904 -4.9256 20.0949 C -8.242 23.4113 -9.3306 17.5343 -7.7792 15.2073 C -6.2279 12.8802 -2.9875 11.5915 -0.7665 10.2589 C 2.2997 8.4191 4.4712 6.5288 7 4" },
      { d: "", dot: { cx: 3.9, cy: -5.1, r: 1.6 } }
    ]
  },
  k: {
    paths: [
      { d: "M 0 4 C 2.6686 -0.0029 6.0314 -4.157 7 -9 C 7.1804 -9.902 7.3939 -12 6 -12 C 1.7542 -12 1.455 -2.1847 1 1 C 0.5 4.5 0.25 7 0 9" },
      { d: "M 0 9 C -0.25 11 -0.25 9.75 0 9 Z" },
      { d: "M 0 9 C 1.0582 5.8254 3.1962 -1.6013 8 0 C 9.0987 0.3662 9.6671 1.9993 9 3 C 7.9652 4.5522 5.5691 4 4 4" },
      { d: "M 4 4 C 3.5 3.75 3.25 4 4 4 Z" },
      { d: "M 4 4 C 4.5 4.25 5.25 4 6 5 C 6.9578 6.2771 6.4222 8.2111 8 9 C 10.5526 10.2763 12.931 5.6035 14 4" }
    ]
  },
  l: {
    paths: [
      { d: "M 0 4 C 2.1153 0.827 4.5767 -2.4419 6 -6 C 6.3998 -6.9996 8.4714 -12 6 -12 C 0.862 -12 1.2427 -1.1552 1 2 C 0.9082 3.1936 -0.0933 9.6036 2.5407 9.194 C 4.4865 8.8914 7.5818 5.5097 8 4" }
    ]
  },
  m: {
    paths: [
      { d: "M 0 4 C 0.9939 2.5091 1.8774 0 4 0 C 6.705 0 3.3549 7.9353 3 9" },
      { d: "M 3 9 C 3 9 3.5 7.25 4 6" },
      { d: "M 4 6 C 5.0651 3.3372 7.3954 -1.2015 11 0 C 13.7167 0.9056 10.6429 7.0714 10 9" },
      { d: "M 10 9 C 10 9 10.5 7.25 11 6" },
      { d: "M 11 6 C 11.9826 3.5434 13.2786 0.6803 16 0 C 18.3824 -0.5956 19.4268 0.8658 19 3 C 18.6327 4.8364 16.6202 7.8101 19 9 C 21.5526 10.2763 23.931 5.6035 25 4" }
    ]
  },
  n: {
    paths: [
      { d: "M 0 4 C 0.9939 2.5091 1.8774 0 4 0 C 6.705 0 3.3549 7.9353 3 9" },
      { d: "M 3 9 C 3 9 3.5 7.25 4 6" },
      { d: "M 4 6 C 4.9826 3.5434 6.2786 0.6803 9 0 C 11.3824 -0.5956 12.4268 0.8658 12 3 C 11.6327 4.8364 9.6202 7.8101 12 9 C 14.5143 10.2571 17.0502 5.4247 18 4" }
    ]
  },
  o: {
    paths: [
      { d: "M 6.1786 0.2242 C -2.4358 -2.9299 -2.2245 11.7285 6.1786 8.8452 C 10.8917 7.228 10.0536 2.7604 6.5038 0.3938" },
      { d: "M 4.8615 0.4579 C 3.5824 7.1609 10.6724 7.7432 13.9656 3.9828" }
    ]
  },
  p: {
    paths: [
      { d: "M 0 4 C 0.5 3.25 1.3654 2.0149 2 0.7025 C 3.9433 -3.3162 2.9453 0.029 2 3 C 0.25 8.5 -2.5 16.5 -4 21" },
      { d: "M -4 21 C -4 21 0.25 8 2 3" },
      { d: "M 2 3 C 3.7902 -2.1147 11.4067 -0.1266 10.1803 4.7789 C 9.6451 6.9199 8.8334 8.6391 5.1046 9.2304" },
      { d: "M 7.5193 8.8362 C 3.5934 10.0682 1.6879 8.1956 0.9159 7.5878" },
      { d: "M 1.1623 7.6699 C 4.1026 10.6103 9.589 9.099 12 7 C 13.2074 5.9489 14.25 4.75 15 4" }
    ]
  },
  q: {
    paths: [
      { d: "M 9 3 C 6.8578 -1.2843 1.0871 -0.3486 0 4 C -0.7651 7.0604 2.0402 9.74 5 9 C 6 8.75 6.5 8.25 7 8" },
      { d: "M 7 8 C 8.25 5.75 9.5 1.25 10 0" },
      { d: "M 10 0 C 10.5 -1.25 9.75 1 9 3 C 8.25 5 8.25 5 7 8 C 5.6466 11.2481 3.5423 14.5696 2.8484 18.039 C 2.391 20.3261 4.3643 22.0221 6.3261 20.1792 C 9.9839 16.743 4.3948 11.0653 8.3771 8.6759 C 9.6271 7.9259 10.9195 8.2911 12.4195 7.0411 C 13.9195 5.7911 14.3813 5.2279 15 4" }
    ]
  },
  r: {
    paths: [
      { d: "M 0 3.8999 C 0.3758 3.3362 3 -1.1001 3 -1.1001 C 3 -1.1001 2.3641 0.2923 3.1141 0.7923 C 3.8641 1.2923 5.1138 0.2678 6.1311 0.8963 C 9.3978 2.9146 3 6.8885 6.5955 8.9657 C 8.9999 10.3548 11.8533 8.3815 13 3.8999" }
    ]
  },
  s: {
    paths: [
      { d: "M 0 4 C 0.5 3.25 1.25 2.25 2 1 C 2.75 -0.25 2.75 -1 3 -1 C 3.25 -1 2.5 -0.25 3 1 C 3.7156 2.789 8.7113 4.2604 6.4492 7.3234 C 5.9137 8.0485 4.3082 8.9242 3.8082 9.1742" },
      { d: "M 4.0344 9.2262 C 2.6036 9.3038 0.602 9.0242 -0.1107 8.0167" },
      { d: "M -0.1244 8.0162 C 1.1793 9.5485 4.2533 9.2911 6 9 C 8.5592 8.5735 9.7011 5.9482 11 4" }
    ]
  },
  t: {
    paths: [
      { d: "M 0 4.5 C 2.1153 1.327 4.5767 -2.4419 6 -6 C 6.3998 -6.9996 8.4714 -12 6 -12 C 0.862 -12 1.2427 -1.1552 1 2 C 0.9082 3.1936 -0.0933 9.6036 2.5407 9.194 C 4.4865 8.8914 7.5 5.5748 8.5 4.0374" },
      {
        d: "M -2 -0.9626 L 7 -0.9626",
        drawWeight: 16
      }
    ]
  },
  u: {
    paths: [
      { d: "M 0 4 C 0.5 3 2 -0.5 2 0 C 2 0.5 0.5 4 0 6 C -0.5 8 -0.25 7.25 0 8 C 0.25 8.75 0.25 8.75 1 9 C 1.75 9.25 2 9.25 3 9 C 4 8.75 4 8.75 5 8 C 6 7.25 6 7.25 7 6 C 8 4.75 8.5 3.75 9 3" },
      { d: "M 9 3 C 9.75 1.5 10.25 -0.75 10 0" },
      { d: "M 10 0 C 9.75 0.75 8.5 4 8 6 C 7.5 8 7.75 7.25 8 8 C 8.25 8.75 8.5 8.75 9 9 C 9.5 9.25 9.25 9.25 10 9 C 10.75 8.75 11.25 8.5 12 8 C 12.75 7.5 12.25 8 13 7 C 13.75 6 14.5 4.75 15 4" },
      { d: "M -0.7776 5.1197 C 1.2292 1.8587 2 0 2 0 C 2 0 -2.9329 10.4837 3 9.0004 C 5.9454 8.264 7.5236 5.7749 8.9482 2.9835" },
      { d: "M 8.8231 3.3683 C 9.5739 1.7225 10.0936 -0.1545 10.0936 -0.1545" },
      { d: "M 10 0 C 9.75 0.75 8.5 4 8 6 C 7.1902 9.2391 9.9293 9.4788 11.8228 8.2532 C 13.2415 7.3349 14.0887 5.367 15 4" }
    ]
  },
  v: {
    paths: [
      { d: "M -0.3577 4.3386 C 1.3136 1.7883 1.75 -0.25 2 0 C 2.25 0.25 1.25 3 1 5 C 0.8731 6.0151 0.683 7.7297 1.3136 8.5776 C 2.2528 9.8403 3.7215 8.9009 4.7028 8.2947 C 7.2263 6.7357 9 3.6926 9 0" },
      { d: "M 9 0 C 9 -0.75 8.75 -1 9 0 Z" },
      { d: "M 9 0 C 9.5081 2.0322 9.6621 5.1039 11.5908 5.4833 C 12.92 5.7448 14.0407 4.7604 15 4" }
    ]
  },
  w: {
    paths: [
      { d: "M 3 0 C 0.9283 2.0717 -2.5959 10.399 3 9 C 4.7651 8.5587 5.7661 7.2339 7 6" },
      { d: "M 7 6 C 7.9611 3.0045 9 0 9 0" },
      { d: "M 9 0 C 8.3322 2.5233 4.3776 10.4056 10 9 C 14.364 7.909 15 3.7507 15 0" },
      { d: "M 15 0 C 15.3743 4.4165 16.9665 6.0168 21 4" }
    ]
  },
  x: {
    paths: [
      { d: "M 0 4 C 9.6288 -10.4432 4.5331 21.2004 16 4" },
      { d: "M 16 4 C 14.8812 2.7639 14.0373 1.9578 13 1" },
      { d: "M 13 1 C 6.9768 -5.0232 7.0352 14.0352 1 8" }
    ]
  },
  y: {
    paths: [
      { d: "M -0.0076 4.0471 C 1.3036 1.1422 2 -0.5 2 0 C 2 1.9551 -2.4373 7.8542 1 9 C 4.7309 10.2436 7.3793 5.4311 9 3" },
      { d: "M 8.0829 4.7682 C 9.683 1.2884 10.1696 -0.597 10.4551 -1.3918" },
      { d: "M 10 0 C 8.1916 5.4251 6.2222 21 1 21 C -1.3622 21 -0.616 17.1305 1 15 C 3.9312 11.1356 8.6824 10.3502 12.2149 7.4064 C 13.7149 6.1564 14.4431 4.9188 15 4" }
    ]
  },
  z: {
    paths: [
      { d: "M 0.0028 4 C 0.5028 3.25 1.0028 2 2.0028 1 C 3.9214 -0.9186 6.7854 -0.4348 8.0028 1.9999 C 9.8073 5.609 4.522 8.663 1.6491 8.9876 C 4.6582 9.4799 5.3256 12.0727 5.088 14.83 C 4.3389 23.5221 -3.3746 21.566 1.0028 15 C 2.7773 12.3381 5.7478 10.6898 8.4577 8.8827 C 9.3519 8.2865 10.2177 7.6729 11.0028 7 C 12.7528 5.5 13.2528 4.75 14.0028 4" }
    ]
  }
};

// platform/scripts/lesson-timer.mjs
var LESSON_TIMER_SESSION_KEY = "thinkamigbob.pb002b.lesson-timer.v1";
var LESSON_TIMER_STATES = Object.freeze({
  READY: "Ready",
  RUNNING: "Running",
  PAUSED: "Paused",
  COMPLETE: "Complete"
});
var DEFAULT_LESSON_MINUTES = 45;
var MIN_LESSON_MINUTES = 1;
var MAX_LESSON_MINUTES = 240;
var LESSON_TIMER_ADJUSTMENT_SECONDS = 60;
var MAX_LESSON_SECONDS = MAX_LESSON_MINUTES * 60;
function createReadyState(durationSeconds = DEFAULT_LESSON_MINUTES * 60) {
  return {
    version: 1,
    status: LESSON_TIMER_STATES.READY,
    durationSeconds,
    remainingSeconds: durationSeconds,
    endsAt: null
  };
}
function validSeconds(value) {
  return Number.isInteger(value) && value >= 0 && value <= MAX_LESSON_SECONDS;
}
function sanitizeState2(value) {
  if (!value || typeof value !== "object" || value.version !== 1) return createReadyState();
  const durationSeconds = validSeconds(value.durationSeconds) && value.durationSeconds > 0 ? value.durationSeconds : DEFAULT_LESSON_MINUTES * 60;
  const remainingSeconds = validSeconds(value.remainingSeconds) ? value.remainingSeconds : durationSeconds;
  if (value.status === LESSON_TIMER_STATES.RUNNING) {
    if (!Number.isFinite(value.endsAt)) return createReadyState(durationSeconds);
    return {
      version: 1,
      status: LESSON_TIMER_STATES.RUNNING,
      durationSeconds,
      remainingSeconds,
      endsAt: value.endsAt
    };
  }
  if (value.status === LESSON_TIMER_STATES.PAUSED && remainingSeconds > 0) {
    return {
      version: 1,
      status: LESSON_TIMER_STATES.PAUSED,
      durationSeconds,
      remainingSeconds,
      endsAt: null
    };
  }
  if (value.status === LESSON_TIMER_STATES.COMPLETE || remainingSeconds === 0) {
    return {
      version: 1,
      status: LESSON_TIMER_STATES.COMPLETE,
      durationSeconds,
      remainingSeconds: 0,
      endsAt: null
    };
  }
  return createReadyState(durationSeconds);
}
function formatLessonTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remainder = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
function createLessonTimer({ storage, now = () => Date.now() } = {}) {
  let memoryState = createReadyState();
  function persist(nextState) {
    const cleanState = sanitizeState2(nextState);
    memoryState = cleanState;
    try {
      storage?.setItem(LESSON_TIMER_SESSION_KEY, JSON.stringify(cleanState));
    } catch {
    }
    return { ...cleanState };
  }
  function storedState() {
    try {
      const raw = storage?.getItem(LESSON_TIMER_SESSION_KEY);
      if (raw) return sanitizeState2(JSON.parse(raw));
    } catch {
    }
    return sanitizeState2(memoryState);
  }
  function read() {
    const current = storedState();
    if (current.status !== LESSON_TIMER_STATES.RUNNING || current.endsAt === null) return current;
    const remainingSeconds = Math.max(0, Math.ceil((current.endsAt - now()) / 1e3));
    if (remainingSeconds > MAX_LESSON_SECONDS) {
      return persist(createReadyState(current.durationSeconds));
    }
    if (remainingSeconds === 0) {
      return persist({
        ...current,
        status: LESSON_TIMER_STATES.COMPLETE,
        remainingSeconds: 0,
        endsAt: null
      });
    }
    return { ...current, remainingSeconds };
  }
  return Object.freeze({
    read,
    setDuration(minutes) {
      const numericMinutes = Number(minutes);
      if (!Number.isInteger(numericMinutes) || numericMinutes < MIN_LESSON_MINUTES || numericMinutes > MAX_LESSON_MINUTES) {
        return { ok: false, state: read() };
      }
      const durationSeconds = numericMinutes * 60;
      return { ok: true, state: persist(createReadyState(durationSeconds)) };
    },
    start() {
      const current = read();
      if (current.status !== LESSON_TIMER_STATES.READY || current.remainingSeconds <= 0) return current;
      return persist({ ...current, status: LESSON_TIMER_STATES.RUNNING, endsAt: now() + current.remainingSeconds * 1e3 });
    },
    startScheduled(durationMinutes, remainingSeconds) {
      const duration = Number(durationMinutes);
      const remaining = Number(remainingSeconds);
      if (!Number.isInteger(duration) || duration < MIN_LESSON_MINUTES || duration > MAX_LESSON_MINUTES || !Number.isInteger(remaining) || remaining <= 0 || remaining > duration * 60) return { ok: false, state: read() };
      const state = persist({
        version: 1,
        status: LESSON_TIMER_STATES.RUNNING,
        durationSeconds: duration * 60,
        remainingSeconds: remaining,
        endsAt: now() + remaining * 1e3
      });
      return { ok: true, state };
    },
    pause() {
      const current = read();
      if (current.status !== LESSON_TIMER_STATES.RUNNING) return current;
      return persist({ ...current, status: LESSON_TIMER_STATES.PAUSED, endsAt: null });
    },
    resume() {
      const current = read();
      if (current.status !== LESSON_TIMER_STATES.PAUSED || current.remainingSeconds <= 0) return current;
      return persist({ ...current, status: LESSON_TIMER_STATES.RUNNING, endsAt: now() + current.remainingSeconds * 1e3 });
    },
    addMinute() {
      const current = read();
      const adjustable = current.status === LESSON_TIMER_STATES.RUNNING || current.status === LESSON_TIMER_STATES.PAUSED;
      if (!adjustable || current.remainingSeconds > MAX_LESSON_SECONDS - LESSON_TIMER_ADJUSTMENT_SECONDS) return current;
      return persist({
        ...current,
        remainingSeconds: current.remainingSeconds + LESSON_TIMER_ADJUSTMENT_SECONDS,
        endsAt: current.status === LESSON_TIMER_STATES.RUNNING ? current.endsAt + LESSON_TIMER_ADJUSTMENT_SECONDS * 1e3 : null
      });
    },
    subtractMinute() {
      const current = read();
      const adjustable = current.status === LESSON_TIMER_STATES.RUNNING || current.status === LESSON_TIMER_STATES.PAUSED;
      if (!adjustable) return current;
      if (current.remainingSeconds <= LESSON_TIMER_ADJUSTMENT_SECONDS) {
        return persist({
          ...current,
          status: LESSON_TIMER_STATES.COMPLETE,
          remainingSeconds: 0,
          endsAt: null
        });
      }
      return persist({
        ...current,
        remainingSeconds: current.remainingSeconds - LESSON_TIMER_ADJUSTMENT_SECONDS,
        endsAt: current.status === LESSON_TIMER_STATES.RUNNING ? current.endsAt - LESSON_TIMER_ADJUSTMENT_SECONDS * 1e3 : null
      });
    },
    reset() {
      const current = read();
      return persist(createReadyState(current.durationSeconds));
    },
    end() {
      const current = read();
      if (current.status === LESSON_TIMER_STATES.COMPLETE) return current;
      return persist({ ...current, status: LESSON_TIMER_STATES.COMPLETE, remainingSeconds: 0, endsAt: null });
    },
    clear() {
      memoryState = createReadyState();
      try {
        storage?.removeItem(LESSON_TIMER_SESSION_KEY);
      } catch {
      }
      return { ...memoryState };
    }
  });
}

// platform/scripts/class-timer-schedule.mjs
var CLASS_TIMER_SCHEDULE_KEY = "thinkamigbob.class-timer-schedule.v1";
var CLASS_TIMER_OCCURRENCE_KEY = "thinkamigbob.class-timer-schedule-occurrence.v1";
var CLASS_TIMER_TODAY_KEY = "thinkamigbob.class-timer-today.v1";
var WEEKDAYS = Object.freeze(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
var TIMER_SOUND_OPTIONS = Object.freeze(["None", "Bird Chirping", "Cardinal", "Guitar Loop \u2014 Time Ending", "Choir \u2014 Heavenly Transition", "Drum Loop", "Trap Loop Drums", "Soft Piano", "Custom Upload"]);
var DEFAULT_SCHEDULE = Object.freeze({
  enabled: false,
  weekdays: [...WEEKDAYS],
  startTime: "08:00",
  durationMinutes: 45,
  timeZone: "America/New_York",
  yellowSound: "Bird Chirping",
  redSound: "Cardinal",
  endSound: "Choir \u2014 Heavenly Transition",
  pomodoroEnabled: false,
  phases: [
    { key: "starter", name: "Start of Class", startMinute: 0, color: "purple" },
    { key: "main", name: "Main Activity", startMinute: 5, color: "green" },
    { key: "warning", name: "Five Minute Warning", startMinute: 35, color: "yellow" },
    { key: "ending", name: "Clean Up / Exit Activity", startMinute: 40, color: "red" }
  ]
});
function validTimeZone(value) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
function sanitize(value) {
  if (!value || typeof value !== "object") return { ...DEFAULT_SCHEDULE, weekdays: [...WEEKDAYS], phases: DEFAULT_SCHEDULE.phases.map((phase) => ({ ...phase })) };
  const weekdays = Array.isArray(value.weekdays) ? WEEKDAYS.filter((day) => value.weekdays.includes(day)) : [];
  const startTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(value.startTime) ? value.startTime : DEFAULT_SCHEDULE.startTime;
  const durationMinutes = Number.isInteger(Number(value.durationMinutes)) && Number(value.durationMinutes) >= 1 && Number(value.durationMinutes) <= 240 ? Number(value.durationMinutes) : DEFAULT_SCHEDULE.durationMinutes;
  const timeZone = validTimeZone(value.timeZone) ? value.timeZone : DEFAULT_SCHEDULE.timeZone;
  const sound = (field) => TIMER_SOUND_OPTIONS.includes(value[field]) ? value[field] : DEFAULT_SCHEDULE[field];
  const customAudio = (field) => typeof value[field] === "string" && /^data:audio\/[a-z0-9.+-]+;base64,/i.test(value[field]) && value[field].length <= 11e5 ? value[field] : "";
  const originalPhases = Array.isArray(value.phases) ? value.phases : [];
  const suppliedPhases = originalPhases.length === 3 ? [originalPhases[0], originalPhases[1], { name: "Five Minute Warning", startMinute: Number(originalPhases[2]?.startMinute) - 5 }, originalPhases[2]] : originalPhases;
  const phases = DEFAULT_SCHEDULE.phases.map((fallback, index) => {
    const supplied = suppliedPhases[index] ?? {};
    const name = String(supplied.name ?? fallback.name).trim().slice(0, 40) || fallback.name;
    const startMinute = Number.isInteger(Number(supplied.startMinute)) ? Number(supplied.startMinute) : fallback.startMinute;
    return { ...fallback, name, startMinute };
  });
  const pomodoroEnabled = value.pomodoroEnabled === true;
  const safePhases = pomodoroEnabled && !validPhases({ pomodoroEnabled, phases }, durationMinutes) ? recommendedTimerPhases(durationMinutes, phases.map((phase) => phase.name)) : phases;
  return { enabled: value.enabled === true, weekdays, startTime, durationMinutes, timeZone, yellowSound: sound("yellowSound"), redSound: sound("redSound"), endSound: sound("endSound"), yellowCustomAudio: customAudio("yellowCustomAudio"), redCustomAudio: customAudio("redCustomAudio"), endCustomAudio: customAudio("endCustomAudio"), pomodoroEnabled, phases: safePhases };
}
function validPhases(value, durationMinutes) {
  if (!value?.pomodoroEnabled) return true;
  if (!Array.isArray(value.phases) || value.phases.length !== 4) return false;
  const starts = value.phases.map((phase) => Number(phase.startMinute));
  return starts.every((start) => Number.isInteger(start) && start >= 0 && start < durationMinutes) && starts[0] === 0 && starts[0] < starts[1] && starts[1] < starts[2] && starts[2] < starts[3];
}
function recommendedTimerPhases(durationMinutes, names = DEFAULT_SCHEDULE.phases.map((phase) => phase.name)) {
  const duration = Math.max(16, Math.min(240, Number(durationMinutes) || DEFAULT_SCHEDULE.durationMinutes));
  return DEFAULT_SCHEDULE.phases.map((phase, index) => ({
    ...phase,
    name: String(names[index] ?? phase.name),
    startMinute: [0, 5, duration - 10, duration - 5][index]
  }));
}
function zonedParts(now, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(now).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return parts;
}
function evaluateTimerPhases(schedule, elapsedSeconds) {
  const clean2 = sanitize(schedule);
  if (!clean2.pomodoroEnabled) return { phase: null, fiveMinuteWarning: false, elapsedPercent: 0, mainStartPercent: 0, warningStartPercent: 0, redStartPercent: 0 };
  const durationSeconds = clean2.durationMinutes * 60;
  const boundedElapsed = Math.min(durationSeconds, Math.max(0, Number(elapsedSeconds) || 0));
  const elapsedMinutes = boundedElapsed / 60;
  const phase = [...clean2.phases].reverse().find((candidate) => elapsedMinutes >= candidate.startMinute) ?? clean2.phases[0];
  return {
    phase,
    elapsedPercent: Math.min(100, Math.max(0, boundedElapsed / durationSeconds * 100)),
    mainStartPercent: clean2.phases[1].startMinute / clean2.durationMinutes * 100,
    warningStartPercent: clean2.phases[2].startMinute / clean2.durationMinutes * 100,
    redStartPercent: clean2.phases[3].startMinute / clean2.durationMinutes * 100,
    fiveMinuteWarning: phase.key === "warning"
  };
}
function evaluateClassTimerSchedule(schedule, now = /* @__PURE__ */ new Date()) {
  const clean2 = sanitize(schedule);
  if (!clean2.enabled || clean2.weekdays.length === 0) return { active: false, reason: "disabled" };
  const parts = zonedParts(now, clean2.timeZone);
  if (!clean2.weekdays.includes(parts.weekday)) return { active: false, reason: "not-scheduled-today" };
  const [startHour, startMinute] = clean2.startTime.split(":").map(Number);
  const currentSeconds = Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second);
  const startSeconds = startHour * 3600 + startMinute * 60;
  const elapsedSeconds = currentSeconds - startSeconds;
  const durationSeconds = clean2.durationMinutes * 60;
  if (elapsedSeconds < 0) return { active: false, reason: "not-started" };
  if (elapsedSeconds >= durationSeconds) return { active: false, reason: "finished" };
  const phaseState = evaluateTimerPhases(clean2, elapsedSeconds);
  return {
    active: true,
    durationMinutes: clean2.durationMinutes,
    remainingSeconds: durationSeconds - elapsedSeconds,
    occurrence: `${parts.year}-${parts.month}-${parts.day}T${clean2.startTime}@${clean2.timeZone}`,
    weekday: parts.weekday,
    ...phaseState
  };
}
function createClassTimerSchedule({ storage, sessionStorage, now = () => /* @__PURE__ */ new Date() } = {}) {
  function read() {
    try {
      const raw = storage?.getItem(CLASS_TIMER_SCHEDULE_KEY);
      return raw ? sanitize(JSON.parse(raw)) : sanitize(DEFAULT_SCHEDULE);
    } catch {
      return sanitize(DEFAULT_SCHEDULE);
    }
  }
  function todayKey(schedule = read()) {
    const parts = zonedParts(now(), schedule.timeZone);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  function readTodayOverride() {
    try {
      const raw = sessionStorage?.getItem(CLASS_TIMER_TODAY_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      return saved.date === todayKey(saved.schedule) ? sanitize(saved.schedule) : null;
    } catch {
      return null;
    }
  }
  function readEffective() {
    return readTodayOverride() ?? read();
  }
  return Object.freeze({
    read,
    readEffective,
    readTodayOverride,
    saveTodayOverride(value) {
      const next = sanitize({ ...read(), ...value });
      if (!validPhases(next, next.durationMinutes)) return { ok: false, reason: "invalid-phases" };
      try {
        sessionStorage?.setItem(CLASS_TIMER_TODAY_KEY, JSON.stringify({ date: todayKey(next), schedule: next }));
      } catch {
        return { ok: false, reason: "storage-error" };
      }
      try {
        sessionStorage?.removeItem(CLASS_TIMER_OCCURRENCE_KEY);
      } catch {
      }
      return { ok: true, schedule: next };
    },
    save(value) {
      const next = sanitize(value);
      if (value?.enabled && next.weekdays.length === 0) return { ok: false, reason: "weekdays-required", schedule: read() };
      if (value?.enabled && !validTimeZone(value.timeZone)) return { ok: false, reason: "invalid-time-zone", schedule: read() };
      if (!validPhases(value, next.durationMinutes)) return { ok: false, reason: "invalid-phases", schedule: read() };
      try {
        storage?.setItem(CLASS_TIMER_SCHEDULE_KEY, JSON.stringify(next));
      } catch {
        return { ok: false, reason: "storage-error", schedule: read() };
      }
      try {
        sessionStorage?.removeItem(CLASS_TIMER_TODAY_KEY);
      } catch {
      }
      try {
        sessionStorage?.removeItem(CLASS_TIMER_OCCURRENCE_KEY);
      } catch {
      }
      return { ok: true, schedule: next };
    },
    activeOccurrence() {
      return evaluateClassTimerSchedule(readEffective(), now());
    },
    wasApplied(occurrence) {
      try {
        return sessionStorage?.getItem(CLASS_TIMER_OCCURRENCE_KEY) === occurrence;
      } catch {
        return false;
      }
    },
    markApplied(occurrence) {
      try {
        sessionStorage?.setItem(CLASS_TIMER_OCCURRENCE_KEY, occurrence);
      } catch {
      }
    }
  });
}
function createBrowserClassTimerSchedule(windowRef) {
  let durableStorage;
  let occurrenceStorage;
  try {
    durableStorage = windowRef?.localStorage;
  } catch {
    durableStorage = void 0;
  }
  try {
    occurrenceStorage = windowRef?.sessionStorage;
  } catch {
    occurrenceStorage = void 0;
  }
  return createClassTimerSchedule({ storage: durableStorage, sessionStorage: occurrenceStorage });
}

// platform/scripts/teacher-memo.mjs
var TEACHER_MEMO_SESSION_KEY = "thinkamigbob.pb002d.teacher-memo.v1";
var TEACHER_MEMO_MAX_CHARACTERS = 240;
var TEACHER_MEMO_COLORS = Object.freeze(["white", "yellow", "light-blue", "green", "pink"]);
var TEACHER_MEMO_SIZES = Object.freeze(["large", "extra-large", "huge"]);
var TEACHER_MEMO_STYLES = Object.freeze(["regular", "bold", "underline", "bold-underline"]);
function emptyState() {
  return { version: 3, text: "", color: "white", size: "extra-large", style: "bold", segments: [], image: "" };
}
function sanitizeSegments(value, fallback) {
  if (!Array.isArray(value)) return fallback.text ? [{ text: fallback.text, color: fallback.color, size: fallback.size, style: fallback.style }] : [];
  const segments = value.slice(0, 100).map((segment) => ({
    text: String(segment?.text ?? ""),
    color: TEACHER_MEMO_COLORS.includes(segment?.color) ? segment.color : fallback.color,
    size: TEACHER_MEMO_SIZES.includes(segment?.size) ? segment.size : fallback.size,
    style: TEACHER_MEMO_STYLES.includes(segment?.style) ? segment.style : fallback.style
  })).filter((segment) => segment.text);
  return segments.map((segment) => ({ ...segment, text: segment.text.slice(0, TEACHER_MEMO_MAX_CHARACTERS) }));
}
function sanitizeState3(value) {
  if (!value || typeof value !== "object" || ![1, 2, 3].includes(value.version) || typeof value.text !== "string") return emptyState();
  const text = value.text.trim();
  if (!text || text.length > TEACHER_MEMO_MAX_CHARACTERS) return emptyState();
  const base = {
    version: 3,
    text,
    color: TEACHER_MEMO_COLORS.includes(value.color) ? value.color : "white",
    size: TEACHER_MEMO_SIZES.includes(value.size) ? value.size : "extra-large",
    style: TEACHER_MEMO_STYLES.includes(value.style) ? value.style : "bold"
  };
  const segments = sanitizeSegments(value.segments, base);
  if (segments.map((segment) => segment.text).join("").trim() !== text) base.segments = [{ text, color: base.color, size: base.size, style: base.style }];
  else base.segments = segments;
  base.image = String(value.image ?? "").startsWith("data:image/") && String(value.image).length <= 7e5 ? String(value.image) : "";
  return base;
}
function createTeacherMemoStore({ storage } = {}) {
  let memoryState = emptyState();
  function persist(state) {
    const cleanState = sanitizeState3(state);
    memoryState = cleanState;
    try {
      storage?.setItem(TEACHER_MEMO_SESSION_KEY, JSON.stringify(cleanState));
    } catch {
    }
    return { ...cleanState };
  }
  function read() {
    try {
      const raw = storage?.getItem(TEACHER_MEMO_SESSION_KEY);
      if (raw) return sanitizeState3(JSON.parse(raw));
    } catch {
    }
    return sanitizeState3(memoryState);
  }
  return Object.freeze({
    read,
    save(value, formatting = {}) {
      if (typeof value !== "string") {
        return { ok: false, reason: "invalid", state: read() };
      }
      const text = value.trim();
      if (!text) return { ok: false, reason: "empty", state: read() };
      if (text.length > TEACHER_MEMO_MAX_CHARACTERS) {
        return { ok: false, reason: "too-long", state: read() };
      }
      return { ok: true, reason: null, state: persist({
        version: 3,
        text,
        color: formatting.color,
        size: formatting.size,
        style: formatting.style,
        segments: formatting.segments,
        image: formatting.image
      }) };
    },
    clear() {
      memoryState = emptyState();
      try {
        storage?.removeItem(TEACHER_MEMO_SESSION_KEY);
      } catch {
      }
      return { ...memoryState };
    }
  });
}

// platform/scripts/student-display-mode.mjs
var STUDENT_DISPLAY_MODE_SESSION_KEY = "thinkamigbob.pb002e.student-display-mode.v1";
var STUDENT_DISPLAY_MODES = Object.freeze({
  COMBINED: "combined",
  MESSAGE: "message",
  TIMER: "timer"
});
var VALID_MODES = new Set(Object.values(STUDENT_DISPLAY_MODES));
function defaultMode(hasMemo) {
  return hasMemo ? STUDENT_DISPLAY_MODES.COMBINED : STUDENT_DISPLAY_MODES.TIMER;
}
function validStoredMode(value) {
  return value && value.version === 1 && VALID_MODES.has(value.mode) ? value.mode : null;
}
function createStudentDisplayModeStore({ storage } = {}) {
  let memoryMode = null;
  function persist(mode) {
    memoryMode = mode;
    try {
      storage?.setItem(
        STUDENT_DISPLAY_MODE_SESSION_KEY,
        JSON.stringify({ version: 1, mode })
      );
    } catch {
    }
    return mode;
  }
  function read({ hasMemo = false } = {}) {
    let mode = null;
    try {
      const raw = storage?.getItem(STUDENT_DISPLAY_MODE_SESSION_KEY);
      if (raw) mode = validStoredMode(JSON.parse(raw));
    } catch {
    }
    if (!mode && VALID_MODES.has(memoryMode)) mode = memoryMode;
    if (!mode) return defaultMode(hasMemo);
    if (mode === STUDENT_DISPLAY_MODES.MESSAGE && !hasMemo) {
      return persist(STUDENT_DISPLAY_MODES.TIMER);
    }
    return mode;
  }
  return Object.freeze({
    read,
    select(mode, { hasMemo = false } = {}) {
      if (!VALID_MODES.has(mode)) return { ok: false, mode: read({ hasMemo }) };
      if (mode === STUDENT_DISPLAY_MODES.MESSAGE && !hasMemo) {
        return { ok: false, mode: read({ hasMemo }) };
      }
      return { ok: true, mode: persist(mode) };
    },
    clear() {
      memoryMode = null;
      try {
        storage?.removeItem(STUDENT_DISPLAY_MODE_SESSION_KEY);
      } catch {
      }
    }
  });
}

// platform/scripts/todays-mission.mjs
var TODAYS_MISSION_SESSION_KEY = "thinkamigbob.pb002i.todays-mission.v1";
var TODAYS_MISSION_TITLE_MAX_CHARACTERS = 80;
var TODAYS_MISSION_FOCUS_MAX_CHARACTERS = 180;
var TODAYS_MISSION_AVAILABILITY = Object.freeze({
  AVAILABLE: "available",
  NOT_PART: "not-part"
});
var VALID_AVAILABILITY = new Set(Object.values(TODAYS_MISSION_AVAILABILITY));
function emptyState2() {
  return { version: 1, title: "", focus: "", builder: "", workshop: "" };
}
function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}
function sanitizeState4(value) {
  if (!value || typeof value !== "object" || value.version !== 1) return emptyState2();
  const title = normalizeText(value.title);
  const focus = normalizeText(value.focus);
  if (!title || title.length > TODAYS_MISSION_TITLE_MAX_CHARACTERS || !focus || focus.length > TODAYS_MISSION_FOCUS_MAX_CHARACTERS || !VALID_AVAILABILITY.has(value.builder) || !VALID_AVAILABILITY.has(value.workshop)) return emptyState2();
  return { version: 1, title, focus, builder: value.builder, workshop: value.workshop };
}
function createTodaysMissionStore({ storage } = {}) {
  let memoryState = emptyState2();
  function read() {
    try {
      const raw = storage?.getItem(TODAYS_MISSION_SESSION_KEY);
      if (raw) return sanitizeState4(JSON.parse(raw));
    } catch {
    }
    return sanitizeState4(memoryState);
  }
  function persist(value) {
    const state = sanitizeState4(value);
    memoryState = state;
    try {
      storage?.setItem(TODAYS_MISSION_SESSION_KEY, JSON.stringify(state));
    } catch {
    }
    return { ...state };
  }
  return Object.freeze({
    read,
    save({ title, focus, builder, workshop } = {}) {
      const current = read();
      const cleanTitle = normalizeText(title);
      const cleanFocus = normalizeText(focus);
      if (!cleanTitle) return { ok: false, reason: "missing-title", state: current };
      if (cleanTitle.length > TODAYS_MISSION_TITLE_MAX_CHARACTERS) {
        return { ok: false, reason: "title-too-long", state: current };
      }
      if (!cleanFocus) return { ok: false, reason: "missing-focus", state: current };
      if (cleanFocus.length > TODAYS_MISSION_FOCUS_MAX_CHARACTERS) {
        return { ok: false, reason: "focus-too-long", state: current };
      }
      if (!VALID_AVAILABILITY.has(builder)) {
        return { ok: false, reason: "missing-builder", state: current };
      }
      if (!VALID_AVAILABILITY.has(workshop)) {
        return { ok: false, reason: "missing-workshop", state: current };
      }
      return {
        ok: true,
        reason: null,
        state: persist({ version: 1, title: cleanTitle, focus: cleanFocus, builder, workshop })
      };
    },
    clear() {
      memoryState = emptyState2();
      try {
        storage?.removeItem(TODAYS_MISSION_SESSION_KEY);
      } catch {
      }
      return { ...memoryState };
    }
  });
}

// platform/scripts/pb-002j-classwide-client.mjs
var DEFAULT_PORT = 8783;
function createPB002JClasswideClient({ windowRef = window, fetchImpl = windowRef.fetch.bind(windowRef), port = DEFAULT_PORT } = {}) {
  const baseUrl = `${windowRef.location.protocol}//${windowRef.location.hostname}:${port}/api/pb-002j/v1`;
  let teacherKey = "";
  let revision = 0;
  let classContextId = "";
  async function request(path, options = {}) {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      ...options
    });
    const body = await response.json().catch(() => ({ error: "invalid-service-response" }));
    if (!response.ok) throw Object.assign(new Error(body.error ?? "prototype-service-error"), { status: response.status, body });
    if (Number.isInteger(body.revision)) revision = body.revision;
    return body;
  }
  return Object.freeze({
    health: async () => {
      const result = await request("/health");
      classContextId = result.classContextId ?? "";
      return result;
    },
    projection: () => request("/projection"),
    connectTeacher: async (key) => {
      teacherKey = String(key ?? "").trim();
      if (!teacherKey) throw new Error("teacher-key-required");
      return request("/catalog", { headers: { Authorization: `Bearer ${teacherKey}` } });
    },
    configure: (configuration) => request("/configuration", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${teacherKey}`,
        "Content-Type": "application/json",
        "If-Match": String(revision),
        "X-PB-002J-Request-Id": crypto.randomUUID()
      },
      body: JSON.stringify(configuration)
    }),
    withdraw: () => request("/withdrawals", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${teacherKey}`,
        "Content-Type": "application/json",
        "If-Match": String(revision),
        "X-PB-002J-Request-Id": crypto.randomUUID()
      },
      body: JSON.stringify({ activityId: "pb002j-am-g05-005", activityVersion: 2 })
    }),
    clearTeacherKey() {
      teacherKey = "";
    },
    getRevision: () => revision,
    getClassContextId: () => classContextId
  });
}

// platform/scripts/pb-002j-classwide-contract.mjs
var PB002J_ACTIVITY_ID = "pb002j-am-g05-005";
var PB002J_ACTIVITY_VERSION = 2;
var PB002J_DIRECTIONS_URL = "https://docs.google.com/presentation/d/1GzkVODaIdAweiSCuFxJC3NOAQEE8GmwdMO7z05Inx64/edit?usp=drivesdk";
var PB002J_ALLOWED_HEADERS = Object.freeze([
  "Authorization",
  "Content-Type",
  "If-Match",
  "X-PB-002J-Request-Id"
]);
var PB002J_WEEK_ID = "week-1";
var PB002J_GOAL_ID = "pb002j-goal-g05-001";
var PB002J_AVAILABILITY_MODES = Object.freeze(["student-choice", "specific-activity"]);

// platform/scripts/pb-002j-classwide-controller.mjs
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function errorMessage(error) {
  const messages = {
    "teacher-key-required": "Enter the temporary teacher key shown when the classroom service started.",
    "invalid-week-selection": "Select Week 1 before saving class availability.",
    "invalid-goal-selection": "Select Goal 1 before saving class availability.",
    "invalid-availability-mode": "Choose whether students may choose or the teacher assigns the activity.",
    "invalid-specific-activity": "Choose Design a Space Bedroom for this class.",
    "stale-revision": "The class configuration changed. Review the current state and try again."
  };
  return messages[error?.message] ?? "The classroom prototype service is unavailable. No activity was made available.";
}
function createPB002JClasswideController({ client }) {
  let state = { service: "checking", catalog: null, projection: null, message: "", error: "" };
  let mountedRoot = null;
  let mountedRole = null;
  function renderTeacher() {
    const target = mountedRoot?.querySelector("[data-pb002j-teacher]");
    if (!target) return;
    const projection = state.projection;
    const active = projection?.status === "ready" ? projection.primaryStartChoices[0] : null;
    if (state.service !== "ready") {
      target.innerHTML = `<p class="platform-student-empty-state">Class-wide activity service unavailable.</p><p>Start the approved memory-only classroom service to configure this prototype.</p>`;
      return;
    }
    if (!state.catalog) {
      target.innerHTML = `
        <form data-form="pb002j-teacher-connect" class="platform-pb002j-form">
          <label for="pb002j-teacher-key">Temporary teacher key</label>
          <input id="pb002j-teacher-key" name="teacherKey" type="password" autocomplete="off" required>
          <button type="submit">Connect Class Activity Controls</button>
          <p class="platform-pb002j-help">The key stays only in this page and is cleared on sign-out or reload.</p>
          <p class="platform-error" role="alert" data-pb002j-error>${escapeHtml(state.error)}</p>
        </form>`;
      return;
    }
    target.innerHTML = `
      <form data-form="pb002j-configuration" class="platform-pb002j-form" novalidate>
        <div class="platform-pb002j-activity-summary">
          <p class="platform-command-label">Grade 5 \u2022 Goal 1: Build a Shelter</p>
          <h4>Design a Space Bedroom</h4>
          <a href="${PB002J_DIRECTIONS_URL}" target="_blank" rel="noopener noreferrer">Review approved Activity Directions</a>
        </div>
        <fieldset><legend>Week or weeks</legend>
          <label><input type="checkbox" name="weekIds" value="${PB002J_WEEK_ID}"${active ? " checked" : ""}> Week 1</label>
        </fieldset>
        <fieldset><legend>Goal or goals</legend>
          <label><input type="checkbox" name="goalIds" value="${PB002J_GOAL_ID}"${active ? " checked" : ""}> Goal 1: Build a Shelter</label>
        </fieldset>
        <fieldset><legend>Activity choice for this class</legend>
          <label><input type="radio" name="availabilityMode" value="student-choice"${active?.availabilityMode === "student-choice" ? " checked" : ""}> Students may choose an activity</label>
          <label><input type="radio" name="availabilityMode" value="specific-activity"${active?.availabilityMode === "specific-activity" ? " checked" : ""}> Assign a specific activity</label>
        </fieldset>
        <label for="pb002j-specific-activity">Specific activity</label>
        <select id="pb002j-specific-activity" name="selectedActivityId">
          <option value="">Choose an activity when assigning one</option>
          <option value="${PB002J_ACTIVITY_ID}"${active?.availabilityMode === "specific-activity" ? " selected" : ""}>Design a Space Bedroom</option>
        </select>
        <p class="platform-pb002j-help">This prototype currently contains one approved activity. More teacher-approved activities will appear as their catalog records are ready.</p>
        <div class="platform-pb002j-unavailable" aria-label="Activity tool availability">
          <strong>Builder: Unavailable for this activity</strong>
          <strong>Workshop: Unavailable for this activity</strong>
        </div>
        <button type="submit">Save Class Availability</button>
        ${active ? '<button type="button" data-action="pb002j-withdraw">Remove Class Availability</button>' : ""}
        <p class="platform-error" role="alert" data-pb002j-error>${escapeHtml(state.error)}</p>
        <p role="status" aria-live="polite">${escapeHtml(state.message || (active ? "This activity is available to the class for this service session." : "No PB-002J activity is currently available."))}</p>
      </form>`;
  }
  function renderStudent() {
    const goal = mountedRoot?.querySelector("[data-pb002j-current-goal]");
    const choices = mountedRoot?.querySelector("[data-pb002j-available-missions]");
    if (!goal || !choices) return;
    if (state.service !== "ready") {
      goal.innerHTML = '<p class="platform-student-empty-state">Current Goal is temporarily unavailable.</p><p>No activity will be shown until the classroom service is ready.</p>';
      choices.innerHTML = '<p class="platform-student-empty-state">Available Missions cannot be checked right now.</p><p>Ask your teacher before starting a new activity.</p>';
      return;
    }
    const choice = state.projection?.status === "ready" ? state.projection.primaryStartChoices[0] : null;
    if (!choice) {
      goal.innerHTML = '<p class="platform-student-empty-state">No current goal is available yet.</p><p>Your teacher has not made a prototype activity available.</p>';
      choices.innerHTML = '<p class="platform-student-empty-state">No new missions are available right now.</p><p>Only teacher-confirmed activities appear here.</p>';
      return;
    }
    goal.innerHTML = `<p class="platform-student-goal-name">YOUR MISSION: ${escapeHtml(choice.goal.title)}</p><p>${escapeHtml(choice.title)}</p>`;
    choices.innerHTML = `
      <article class="platform-pb002j-student-choice">
        <p class="platform-mission-choice-label">Grade ${choice.grade} \u2022 ${escapeHtml(choice.goal.title)}</p>
        <h4>${escapeHtml(choice.title)}</h4>
        <p>${choice.availabilityMode === "specific-activity" ? "Your teacher selected this activity for the class." : "Choose from the activities your teacher made available."}</p>
        <a class="platform-button platform-button-primary" href="${escapeHtml(choice.directionsUrl)}" target="_blank" rel="noopener noreferrer">Open Activity Directions</a>
        <p><strong>Builder and Workshop are not available for this activity.</strong></p>
        <p>Add evidence to your Student Engineering Notebook / Evidence Portfolio at the location your teacher identifies.</p>
      </article>`;
  }
  function renderMounted() {
    if (mountedRole === "teacher") renderTeacher();
    if (mountedRole === "student") renderStudent();
  }
  async function refreshProjection() {
    try {
      await client.health();
      state = { ...state, service: "ready", projection: await client.projection(), error: "" };
    } catch (error) {
      state = { ...state, service: "unavailable", projection: null, error: errorMessage(error) };
    }
    renderMounted();
  }
  return Object.freeze({
    mount(root2, role) {
      mountedRoot = root2;
      mountedRole = role;
      renderMounted();
      void refreshProjection();
    },
    async handleSubmit(form) {
      const data = new FormData(form);
      try {
        if (form.dataset.form === "pb002j-teacher-connect") {
          const result = await client.connectTeacher(data.get("teacherKey"));
          state = { ...state, catalog: result.catalog, error: "", message: "Teacher controls connected." };
        } else if (form.dataset.form === "pb002j-configuration") {
          const result = await client.configure({
            classContextId: client.getClassContextId(),
            activityId: PB002J_ACTIVITY_ID,
            activityVersion: PB002J_ACTIVITY_VERSION,
            weekIds: data.getAll("weekIds"),
            goalIds: data.getAll("goalIds"),
            availabilityMode: data.get("availabilityMode"),
            selectedActivityId: data.get("selectedActivityId") || null,
            directionsUrl: PB002J_DIRECTIONS_URL,
            evidenceDestination: "Student Engineering Notebook / Evidence Portfolio",
            builderAvailable: false,
            workshopAvailable: false
          });
          state = { ...state, projection: result.projection, error: "", message: "Design a Space Bedroom is now available to this class." };
        }
      } catch (error) {
        state = { ...state, error: errorMessage(error), message: "" };
      }
      renderMounted();
    },
    async handleWithdraw() {
      try {
        const result = await client.withdraw();
        state = { ...state, projection: result.projection, error: "", message: "Class availability removed. Student Start choices are now empty." };
      } catch (error) {
        state = { ...state, error: errorMessage(error), message: "" };
      }
      renderMounted();
    },
    signOut() {
      client.clearTeacherKey();
      state = { service: "checking", catalog: null, projection: null, message: "", error: "" };
    }
  });
}

// platform/scripts/evidence-foundation.mjs
var EVIDENCE_TYPES = Object.freeze({
  PHOTO: "Photo",
  SCREENSHOT: "Screenshot",
  VIDEO: "Video",
  REFLECTION: "Reflection",
  MORE: "More Evidence"
});
var PILOT_ACTIVITY = "Design a Bridge That Holds Weight";
var PILOT_EVIDENCE = Object.freeze([
  { id: "pilot-3", type: "Reflection", title: "What changed after testing", activity: PILOT_ACTIVITY, time: "Today, 10:42 AM", detail: "I added triangle braces because the middle bent during our first test." },
  { id: "pilot-2", type: "Photo", title: "Second bridge test", activity: PILOT_ACTIVITY, time: "Today, 10:31 AM", detail: "Fictional pilot photo \xB7 1 image" },
  { id: "pilot-1", type: "Screenshot", title: "First bridge plan", activity: PILOT_ACTIVITY, time: "Yesterday, 2:18 PM", detail: "Fictional pilot screenshot \xB7 1 image" }
]);
var PILOT_TEACHER_EVIDENCE = Object.freeze([
  { id: "teacher-pilot-1", student: "Avery M.", type: "Photo", title: "Bridge load test", activity: PILOT_ACTIVITY, time: "Today, 10:48 AM", detail: "Fictional preview: the bridge is shown holding eight classroom weights." },
  { id: "teacher-pilot-2", student: "Jordan R.", type: "Reflection", title: "Why I changed the supports", activity: PILOT_ACTIVITY, time: "Today, 10:42 AM", detail: "I made the base wider after the first test tipped to one side." },
  { id: "teacher-pilot-3", student: "Mia S.", type: "Screenshot", title: "Revised bridge plan", activity: PILOT_ACTIVITY, time: "Today, 10:35 AM", detail: "Fictional preview: a labeled plan with two added triangle braces." },
  { id: "teacher-pilot-4", student: "Noah T.", type: "Video", title: "Second test", activity: PILOT_ACTIVITY, time: "Today, 10:29 AM", detail: "Fictional preview: a 12-second video placeholder describing the second test." }
]);
function createEvidenceFoundation({ storage } = {}) {
  const key = "thinkamigbob.evidence-foundation.v1";
  let sessionItems = [];
  function readSaved() {
    if (!storage) return sessionItems;
    try {
      const value = JSON.parse(storage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }
  function writeSaved(items) {
    sessionItems = items;
    if (!storage) return true;
    try {
      storage.setItem(key, JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  }
  return Object.freeze({
    timeline() {
      return [...readSaved(), ...PILOT_EVIDENCE];
    },
    save({ type, title, activity, detail }) {
      if (!Object.values(EVIDENCE_TYPES).includes(type) || !String(detail || "").trim()) {
        return { ok: false, reason: "missing-evidence" };
      }
      const next = [{
        id: `session-${Date.now()}`,
        type,
        title: String(title || type).trim(),
        activity: String(activity || PILOT_ACTIVITY).trim(),
        time: "Saved just now",
        detail: String(detail).trim()
      }, ...readSaved()];
      return writeSaved(next) ? { ok: true, item: next[0] } : { ok: false, reason: "storage-unavailable" };
    }
  });
}

// platform/scripts/evidence-drive-setup.mjs
var DRIVE_SETUP_STATUS = Object.freeze({
  NOT_CONFIGURED: "not-configured",
  PREPARED: "prepared"
});
var PILOT_DRIVE_DESTINATION = Object.freeze({
  folderId: "1LEb7tIqisBKNEvtLhGGRpW3PKB8OIY74",
  folderUrl: "https://drive.google.com/drive/folders/1LEb7tIqisBKNEvtLhGGRpW3PKB8OIY74",
  folderName: "THINKamigBOB Student Evidence Pilot",
  accountLabel: "teacheropolis@gmail.com",
  uploadEndpoint: "https://script.google.com/macros/s/AKfycbyKaeDz1c4xGSItQ-kHZpqqVe3dCinC7_1Jn88GQSJcoFybCv3vGHGti7F-HRrgdfntcw/exec",
  status: "PERSISTENT_FICTIONAL_REVIEW_VALIDATED"
});
var STORAGE_KEY = "thinkamigbob.evidence-drive-setup.v1";
function createEvidenceDriveSetup({ storage } = {}) {
  function empty3() {
    return { status: DRIVE_SETUP_STATUS.NOT_CONFIGURED, folderName: PILOT_DRIVE_DESTINATION.folderName };
  }
  function read() {
    if (!storage) return empty3();
    try {
      const value = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
      if (value?.status !== DRIVE_SETUP_STATUS.PREPARED || typeof value.folderName !== "string") return empty3();
      return { status: value.status, folderName: value.folderName };
    } catch {
      return empty3();
    }
  }
  function prepare({ folderName, privacyConfirmed }) {
    const normalized = String(folderName || "").trim();
    if (normalized.length < 3 || normalized.length > 80) return { ok: false, reason: "invalid-folder-name" };
    if (!privacyConfirmed) return { ok: false, reason: "privacy-confirmation-required" };
    const value = { status: DRIVE_SETUP_STATUS.PREPARED, folderName: normalized };
    if (!storage) return { ok: true, value };
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(value));
      return { ok: true, value };
    } catch {
      return { ok: false, reason: "storage-unavailable" };
    }
  }
  return Object.freeze({ read, prepare });
}

// platform/scripts/evidence-upload-client.mjs
function createEvidenceUploadClient({ brokerOrigin, fetchImpl = globalThis.fetch } = {}) {
  if (!brokerOrigin || typeof fetchImpl !== "function") throw new Error("broker-origin-and-fetch-required");
  return Object.freeze({
    async publishLaunch({ teacherKey, activity }) {
      if (!teacherKey || !String(activity || "").trim()) return { ok: false, reason: "teacher-key-and-activity-required" };
      return requestJson(fetchImpl, `${brokerOrigin}/api/evidence/v1/launch`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Evidence-Teacher-Key": teacherKey },
        body: JSON.stringify({ activity })
      });
    },
    async currentLaunch() {
      return requestJson(fetchImpl, `${brokerOrigin}/api/evidence/v1/launch`, { method: "GET" });
    },
    async requestTicket({ launchId, studentId }) {
      if (!launchId || !studentId) return { ok: false, reason: "launch-and-student-required" };
      return requestJson(fetchImpl, `${brokerOrigin}/api/evidence/v1/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ launchId, studentId })
      });
    },
    async listEvidence({ teacherKey }) {
      if (!teacherKey) return { ok: false, reason: "teacher-key-required" };
      return requestJson(fetchImpl, `${brokerOrigin}/api/evidence/v1/evidence`, { method: "GET", headers: { "X-Evidence-Teacher-Key": teacherKey } });
    },
    async loadEvidencePreview({ teacherKey, evidenceId }) {
      if (!teacherKey || !evidenceId) return { ok: false, reason: "teacher-key-and-evidence-required" };
      try {
        const response = await fetchImpl(`${brokerOrigin}/api/evidence/v1/evidence/${encodeURIComponent(evidenceId)}/content`, { headers: { "X-Evidence-Teacher-Key": teacherKey } });
        if (!response.ok) return { ok: false, reason: "preview-unavailable" };
        return { ok: true, blob: await response.blob() };
      } catch {
        return { ok: false, reason: "broker-unavailable" };
      }
    },
    async uploadImage({ ticket, file, fileName, evidenceType = "Photo" }) {
      if (!ticket || !file || !file.type?.startsWith("image/")) return { ok: false, reason: "valid-image-and-ticket-required" };
      try {
        const response = await fetchImpl(`${brokerOrigin}/api/evidence/v1/uploads`, {
          method: "POST",
          headers: { Authorization: `Bearer ${ticket}`, "Content-Type": file.type, "X-Evidence-Filename": fileName || file.name || "evidence-image", "X-Evidence-Type": evidenceType },
          body: file
        });
        const result = await response.json();
        return response.ok && result.ok ? result : { ok: false, reason: result.error || "upload-failed" };
      } catch {
        return { ok: false, reason: "broker-unavailable" };
      }
    }
  });
}
async function requestJson(fetchImpl, url, options) {
  try {
    const response = await fetchImpl(url, options);
    const result = await response.json();
    return response.ok && result.ok ? result : { ok: false, reason: result.error || "pilot-service-request-failed" };
  } catch {
    return { ok: false, reason: "broker-unavailable" };
  }
}

// platform/scripts/evidence-governance.mjs
var EVIDENCE_GOVERNANCE_STATUS = Object.freeze({ DRAFT_REQUIRED: "DRAFT_REQUIRED", DRAFT_SAVED: "DRAFT_SAVED" });
var EVIDENCE_GOVERNANCE_OPTIONS = Object.freeze({
  retention: Object.freeze(["School policy required", "End of school year", "30 days after course ends"]),
  deletionAuthority: Object.freeze(["Administrator approval required", "Teacher request plus administrator approval"]),
  recovery: Object.freeze(["Move to recoverable trash before permanent deletion"]),
  exportRule: Object.freeze(["Teacher export offered before deletion"])
});
function createEvidenceGovernanceDraft({ storage } = {}) {
  const key = "thinkamigbob.evidence-governance-draft.v1";
  const empty3 = { status: EVIDENCE_GOVERNANCE_STATUS.DRAFT_REQUIRED, retention: "", deletionAuthority: "", recovery: "", exportRule: "" };
  let memory = { ...empty3 };
  function read() {
    try {
      const value = JSON.parse(storage?.getItem(key) || "null");
      if (value?.version === 1 && value.status === EVIDENCE_GOVERNANCE_STATUS.DRAFT_SAVED) return { ...value };
    } catch {
    }
    return { ...memory };
  }
  return Object.freeze({
    read,
    save(value = {}) {
      for (const field of Object.keys(EVIDENCE_GOVERNANCE_OPTIONS)) {
        if (!EVIDENCE_GOVERNANCE_OPTIONS[field].includes(value[field])) return { ok: false, reason: `invalid-${field}` };
      }
      const draft = { version: 1, status: EVIDENCE_GOVERNANCE_STATUS.DRAFT_SAVED, retention: value.retention, deletionAuthority: value.deletionAuthority, recovery: value.recovery, exportRule: value.exportRule };
      memory = draft;
      try {
        storage?.setItem(key, JSON.stringify(draft));
      } catch {
        return { ok: false, reason: "storage-unavailable" };
      }
      return { ok: true, value: { ...draft } };
    }
  });
}

// platform/scripts/evidence-governance-simulation.mjs
var GOVERNANCE_SIMULATION_STATUS = Object.freeze({
  EMPTY: "EMPTY",
  PENDING_ADMIN: "PENDING_ADMIN",
  APPROVED_FOR_TRASH: "APPROVED_FOR_TRASH",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED"
});
var STORAGE_KEY2 = "thinkamigbob.evidence-governance-simulation.v1";
var FINAL_STATUSES = /* @__PURE__ */ new Set([
  GOVERNANCE_SIMULATION_STATUS.APPROVED_FOR_TRASH,
  GOVERNANCE_SIMULATION_STATUS.REJECTED,
  GOVERNANCE_SIMULATION_STATUS.CANCELED
]);
function clean(value, maximum = 240) {
  return String(value || "").trim().slice(0, maximum);
}
function emptyState3() {
  return { version: 1, status: GOVERNANCE_SIMULATION_STATUS.EMPTY, request: null, audit: [] };
}
function createEvidenceGovernanceSimulation({ storage, now = () => (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  let memory = emptyState3();
  function persist(state) {
    memory = state;
    try {
      storage?.setItem(STORAGE_KEY2, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }
  function read() {
    try {
      const value = JSON.parse(storage?.getItem(STORAGE_KEY2) || "null");
      if (value?.version === 1 && Array.isArray(value.audit)) return structuredClone(value);
    } catch {
    }
    return structuredClone(memory);
  }
  function event(action, detail) {
    return { action, detail, at: now() };
  }
  return Object.freeze({
    read,
    submit({ evidenceId, evidenceLabel, reason, exportOffered } = {}) {
      const current = read();
      if (current.status === GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN) return { ok: false, reason: "request-pending" };
      if (!clean(evidenceId) || !clean(evidenceLabel)) return { ok: false, reason: "evidence-required" };
      if (!clean(reason)) return { ok: false, reason: "reason-required" };
      if (exportOffered !== true) return { ok: false, reason: "export-required" };
      const request = { id: `simulation-${Date.now()}`, evidenceId: clean(evidenceId), evidenceLabel: clean(evidenceLabel), reason: clean(reason), exportOffered: true };
      const state = { version: 1, status: GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN, request, audit: [...current.audit, event("REQUEST_SUBMITTED", "Teacher requested administrator review; export was offered.")] };
      if (!persist(state)) return { ok: false, reason: "storage-unavailable" };
      return { ok: true, value: read() };
    },
    decide({ decision, reviewer, note } = {}) {
      const current = read();
      if (current.status !== GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN) return { ok: false, reason: "no-pending-request" };
      if (!clean(reviewer)) return { ok: false, reason: "reviewer-required" };
      if (!clean(note)) return { ok: false, reason: "note-required" };
      if (!["approve", "reject"].includes(decision)) return { ok: false, reason: "decision-required" };
      const approved = decision === "approve";
      const state = {
        ...current,
        status: approved ? GOVERNANCE_SIMULATION_STATUS.APPROVED_FOR_TRASH : GOVERNANCE_SIMULATION_STATUS.REJECTED,
        request: { ...current.request, reviewer: clean(reviewer, 80), reviewNote: clean(note) },
        audit: [...current.audit, event(approved ? "ADMIN_APPROVED" : "ADMIN_REJECTED", approved ? "Approved for a recoverable-trash simulation only." : "Request rejected; evidence remains unchanged.")]
      };
      if (!persist(state)) return { ok: false, reason: "storage-unavailable" };
      return { ok: true, value: read() };
    },
    cancel() {
      const current = read();
      if (current.status !== GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN) return { ok: false, reason: "no-pending-request" };
      const state = { ...current, status: GOVERNANCE_SIMULATION_STATUS.CANCELED, audit: [...current.audit, event("REQUEST_CANCELED", "Teacher canceled the request; evidence remains unchanged.")] };
      if (!persist(state)) return { ok: false, reason: "storage-unavailable" };
      return { ok: true, value: read() };
    },
    reset() {
      const current = read();
      if (!FINAL_STATUSES.has(current.status)) return { ok: false, reason: "simulation-not-finished" };
      const state = { ...emptyState3(), audit: [...current.audit, event("SIMULATION_RESET", "Ready for another fictional governance request.")] };
      if (!persist(state)) return { ok: false, reason: "storage-unavailable" };
      return { ok: true, value: read() };
    }
  });
}

// platform/scripts/evidence-google-connection-preview.mjs
var GOOGLE_CONNECTION_PREVIEW_STATUS = Object.freeze({
  NOT_CONNECTED: "NOT_CONNECTED",
  CONSENT_PREVIEW: "CONSENT_PREVIEW",
  CONNECTED_PREVIEW: "CONNECTED_PREVIEW"
});
var GOOGLE_DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";
var STORAGE_KEY3 = "thinkamigbob.google-connection-preview.v1";
function createGoogleConnectionPreview({ storage } = {}) {
  let memory = { version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.NOT_CONNECTED };
  function read() {
    try {
      const value = JSON.parse(storage?.getItem(STORAGE_KEY3) || "null");
      if (value?.version === 1 && Object.values(GOOGLE_CONNECTION_PREVIEW_STATUS).includes(value.status)) return { ...value };
    } catch {
    }
    return { ...memory };
  }
  function save(value) {
    memory = value;
    try {
      storage?.setItem(STORAGE_KEY3, JSON.stringify(value));
      return { ok: true, value: { ...value } };
    } catch {
      return { ok: false, reason: "storage-unavailable" };
    }
  }
  return Object.freeze({
    read,
    begin() {
      if (read().status !== GOOGLE_CONNECTION_PREVIEW_STATUS.NOT_CONNECTED) return { ok: false, reason: "already-started" };
      return save({ version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.CONSENT_PREVIEW });
    },
    connect({ teacherConfirmed, studentBoundaryConfirmed } = {}) {
      if (read().status !== GOOGLE_CONNECTION_PREVIEW_STATUS.CONSENT_PREVIEW) return { ok: false, reason: "consent-not-open" };
      if (!teacherConfirmed) return { ok: false, reason: "teacher-confirmation-required" };
      if (!studentBoundaryConfirmed) return { ok: false, reason: "student-boundary-required" };
      return save({ version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.CONNECTED_PREVIEW, scope: GOOGLE_DRIVE_FILE_SCOPE, folderName: "THINKamigBOB Student Evidence" });
    },
    cancel() {
      if (read().status !== GOOGLE_CONNECTION_PREVIEW_STATUS.CONSENT_PREVIEW) return { ok: false, reason: "consent-not-open" };
      return save({ version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.NOT_CONNECTED });
    },
    disconnect() {
      if (read().status !== GOOGLE_CONNECTION_PREVIEW_STATUS.CONNECTED_PREVIEW) return { ok: false, reason: "not-connected" };
      return save({ version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.NOT_CONNECTED });
    }
  });
}

// platform/scripts/evidence-google-oauth-readiness.mjs
var GOOGLE_OAUTH_ENDPOINTS = Object.freeze({
  status: "/api/evidence/google/v1/status",
  start: "/api/evidence/google/v1/connect/start",
  callback: "/api/evidence/google/v1/connect/callback",
  disconnect: "/api/evidence/google/v1/connect/disconnect"
});
var GOOGLE_OAUTH_REQUIRED_SCOPE = "https://www.googleapis.com/auth/drive.file";
var GOOGLE_OAUTH_GATES = Object.freeze([
  Object.freeze({ id: "public-origin", label: "Published HTTPS platform domain" }),
  Object.freeze({ id: "oauth-client", label: "Production Google OAuth client" }),
  Object.freeze({ id: "server-secret", label: "Client secret stored only on the server" }),
  Object.freeze({ id: "token-vault", label: "Encrypted teacher token storage" }),
  Object.freeze({ id: "verified-brand", label: "Verified domain, privacy policy, and OAuth brand" }),
  Object.freeze({ id: "revoke-flow", label: "Teacher disconnect and token revocation" }),
  Object.freeze({ id: "monitoring", label: "Connection monitoring and guided reconnect" })
]);
function isHttpsOrigin(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
}
function assessGoogleOAuthReadiness(configuration = {}) {
  const ready = /* @__PURE__ */ new Set();
  if (isHttpsOrigin(configuration.publicOrigin)) ready.add("public-origin");
  if (configuration.oauthClientConfigured === true) ready.add("oauth-client");
  if (configuration.serverSecretConfigured === true) ready.add("server-secret");
  if (configuration.encryptedTokenVaultConfigured === true) ready.add("token-vault");
  if (configuration.verifiedBrandConfigured === true) ready.add("verified-brand");
  if (configuration.revocationConfigured === true) ready.add("revoke-flow");
  if (configuration.monitoringConfigured === true) ready.add("monitoring");
  const gates = GOOGLE_OAUTH_GATES.map((gate) => ({ ...gate, ready: ready.has(gate.id) }));
  return Object.freeze({
    productionReady: gates.every((gate) => gate.ready),
    readyCount: ready.size,
    totalCount: gates.length,
    scope: GOOGLE_OAUTH_REQUIRED_SCOPE,
    gates
  });
}

// platform/scripts/platform-production-identity.mjs
var LOCAL_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1"]);
function parseStudentLabels(value) {
  const labels = String(value ?? "").split(/\r?\n/).map((label) => label.trim()).filter(Boolean);
  if (labels.length < 1 || labels.length > 40) return { ok: false, reason: "student-count" };
  if (labels.some((label) => label.length > 80)) return { ok: false, reason: "student-label-too-long" };
  const normalized = labels.map((label) => label.toLocaleLowerCase());
  if (new Set(normalized).size !== normalized.length) return { ok: false, reason: "duplicate-student-label" };
  return { ok: true, labels };
}
function productionIdentityConfiguration({ documentRef = document, locationRef = window.location } = {}) {
  const requested = documentRef.querySelector('meta[name="thinkamigbob-production-identity"]')?.content === "enabled";
  const studentRequested = documentRef.querySelector('meta[name="thinkamigbob-student-access"]')?.content === "enabled";
  const clientId = documentRef.querySelector('meta[name="thinkamigbob-google-signin-client-id"]')?.content?.trim() || "";
  const securePublicHost = locationRef.protocol === "https:" && !LOCAL_HOSTS.has(locationRef.hostname);
  const enabled = requested && securePublicHost;
  return Object.freeze({ enabled, studentEnabled: enabled && studentRequested, clientId, googleEnabled: enabled && Boolean(clientId) });
}
function createProductionIdentityClient({ fetchImpl = globalThis.fetch, enabled = false, origin = globalThis.location?.origin } = {}) {
  async function request(path, options = {}) {
    if (!enabled) return { ok: false, reason: "setup-required" };
    try {
      const response = await fetchImpl(`${origin}${path}`, { credentials: "same-origin", ...options });
      const value = await response.json();
      return response.ok ? { ok: true, value } : { ok: false, reason: value.error || value.status || "request-failed", status: response.status };
    } catch {
      return { ok: false, reason: "service-unavailable" };
    }
  }
  return Object.freeze({
    studentEntry({ classCode, studentCode }) {
      return request("/api/auth/v1/student", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ classCode, studentCode }) });
    },
    createClassroom({ name, studentLabels }) {
      return request("/api/classrooms/v1", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, studentLabels }) });
    },
    listClassrooms() {
      return request("/api/classrooms/v1");
    },
    session() {
      return request("/api/auth/v1/session");
    },
    signOut() {
      return request("/api/auth/v1/signout", { method: "POST" });
    }
  });
}

// platform/scripts/classroom-lesson-client.mjs
async function requestJson2(fetchImpl, url, options = {}) {
  const response = await fetchImpl(url, { credentials: "include", cache: "no-store", ...options });
  let payload = {};
  try {
    payload = await response.json();
  } catch {
  }
  if (!response.ok) return { ok: false, status: response.status, error: payload.error || "classroom-service-unavailable" };
  return { ok: true, status: response.status, ...payload };
}
function createClassroomLessonClient({ serviceOrigin = "", fetchImpl = fetch } = {}) {
  const endpoint = `${String(serviceOrigin).replace(/\/$/, "")}/api/classrooms/v1/lesson-steps`;
  return Object.freeze({
    saveStep({ classId, step }) {
      return requestJson2(fetchImpl, endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ classId, step })
      });
    },
    teacherSteps(classId) {
      return requestJson2(fetchImpl, `${endpoint}?classId=${encodeURIComponent(classId)}`);
    },
    studentSteps() {
      return requestJson2(fetchImpl, endpoint);
    }
  });
}

// platform/scripts/namebob-generator.mjs
var BOB_FORMS = Object.freeze([
  "Bob",
  "Bobarella",
  "Bobzilla",
  "Bobbio",
  "Bobinator",
  "Bobtastic",
  "Bobaroo",
  "Bobster",
  "Bobonaut",
  "Bobasaurus",
  "Bobnado",
  "Bobomatic",
  "Bobmeister",
  "Bobkins",
  "Bobbity",
  "Bobble",
  "Bobadillo",
  "Bobapalooza",
  "Bobiverse",
  "Bobventure",
  "Bobberino",
  "Bobbo",
  "Bobbles",
  "Bobalicious",
  "Bobarooza",
  "Bobmobile",
  "Bobrocket",
  "Bobwhiz",
  "Boboodle",
  "Boborama",
  "Bobificent",
  "Bobmazing",
  "Bobbot",
  "Bobarooey",
  "Bobdoodle",
  "Bobkaboom",
  "Bobquake",
  "Bobstorm",
  "Bobshine",
  "Bobwizard",
  "Bobgadget",
  "Bobspark",
  "Bobzoom",
  "Bobwhirl",
  "Bobtopia",
  "Bobcraft",
  "Bobbolt",
  "Bobberry"
]);
var RHYMING_BOB_FORMS = Object.freeze({
  savannah: Object.freeze(["Bobanana", "Bob Cabana", "BananaBob"]),
  lydia: Object.freeze(["Bobbedia", "Giddy-a-Bob", "Bobblydia"]),
  miley: Object.freeze(["SmileyBob", "WileyBob", "Bob Smiley"]),
  siamara: Object.freeze(["Bob Tiara", "Bob-a-Rama", "TiaraBob"]),
  mariela: Object.freeze(["Bobarella", "Bob Umbrella", "MarshmallowBobella"]),
  faith: Object.freeze(["Bob-the-Eighth", "Great-Faith-Bob", "Bob of Great Faith"])
});
function cleanName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").replace(/[^\p{L}'’-]/gu, "").slice(0, 24);
}
function firstNameFromRosterLine(value) {
  const line = String(value || "").trim();
  if (!line) return "";
  const commaParts = line.split(",").map((part) => part.trim()).filter(Boolean);
  const likelyFirst = commaParts.length > 1 ? commaParts[1] : line.split(/\t|\s+/)[0];
  const name = cleanName(String(likelyFirst || "").split(/\s+/)[0]);
  return name ? name.charAt(0).toLocaleUpperCase() + name.slice(1).toLocaleLowerCase() : "";
}
function stableNumber(value) {
  return [...String(value)].reduce((total, character) => total * 31 + character.codePointAt(0) >>> 0, 7);
}
function boundedLabel(value) {
  return String(value).replace(/\s+/g, " ").trim().slice(0, 40).trim();
}
function bobLastName(value) {
  return String(value || "").trim().split(/\s+/).at(-1).toLocaleLowerCase();
}
function labelContainsName(label, firstName) {
  const wanted = firstName.toLocaleLowerCase();
  return cleanName(String(label || "").split(/\s+/)[0]).toLocaleLowerCase() === wanted;
}
function rhymingBobForms(firstName) {
  const exact = RHYMING_BOB_FORMS[firstName.toLocaleLowerCase()] || [];
  const lower = firstName.toLocaleLowerCase();
  const soundBased = lower.endsWith("y") || lower.endsWith("ie") ? ["SillyBob", "SmileyBob", "WigglyBob"] : lower.endsWith("a") ? ["Bob-a-Rama", "Bob Cabana", "Bobanana"] : lower.endsWith("an") ? ["Bob-the-Can-Do-Man", "Bob Fan", "Bob-a-Plan"] : lower.endsWith("er") ? ["SuperBob", "BuilderBob", "WhirringBob"] : ["Bobble-Doodle", "Bob Kaboom", "Bobbity-Bop"];
  return [.../* @__PURE__ */ new Set([...exact, ...soundBased, ...BOB_FORMS])];
}
function generateNameBobs(value, { usedLabels = [], usedBobLastNames = [] } = {}) {
  const lines = Array.isArray(value) ? value : String(value || "").split(/\r?\n/);
  const firstNames = lines.map(firstNameFromRosterLine).filter(Boolean);
  const used = new Set(usedLabels.map((label) => String(label).trim().toLocaleLowerCase()).filter(Boolean));
  const bobLastNames = new Set(usedBobLastNames.map(bobLastName).filter(Boolean));
  const labels = [];
  for (const [index, firstName] of firstNames.entries()) {
    const seed = stableNumber(`${firstName}-${index}`);
    const forms = rhymingBobForms(firstName);
    let label = "";
    for (let attempt = 0; attempt < forms.length && !label; attempt += 1) {
      const formIndex = attempt < 3 ? attempt : (seed + attempt) % forms.length;
      const candidate = boundedLabel(`${firstName} ${forms[formIndex]}`);
      if (!used.has(candidate.toLocaleLowerCase()) && !bobLastNames.has(bobLastName(candidate))) label = candidate;
    }
    if (!label) {
      let number = 3;
      label = boundedLabel(`${firstName} Bob2`);
      while (used.has(label.toLocaleLowerCase()) || bobLastNames.has(bobLastName(label))) label = boundedLabel(`${firstName} Bob${number++}`);
    }
    used.add(label.toLocaleLowerCase());
    bobLastNames.add(bobLastName(label));
    labels.push(label);
  }
  return Object.freeze({ labels: Object.freeze(labels), sourceCount: lines.filter((line) => String(line).trim()).length });
}
function retryNameBob(firstNameValue, currentLabels, { usedLabels = [] } = {}) {
  const firstName = firstNameFromRosterLine(firstNameValue);
  const labels = Array.from(currentLabels || [], (label) => String(label).trim()).filter(Boolean);
  if (!firstName) return Object.freeze({ ok: false, reason: "student-name-required", labels: Object.freeze(labels) });
  const index = labels.findIndex((label) => labelContainsName(label, firstName));
  if (index < 0) return Object.freeze({ ok: false, reason: "student-not-found", labels: Object.freeze(labels) });
  const otherLabels = labels.filter((_, labelIndex) => labelIndex !== index);
  const generated = generateNameBobs(firstName, { usedLabels: [...usedLabels, ...labels], usedBobLastNames: otherLabels });
  if (!generated.labels[0]) return Object.freeze({ ok: false, reason: "retry-unavailable", labels: Object.freeze(labels) });
  const retried = [...labels];
  retried[index] = generated.labels[0];
  return Object.freeze({ ok: true, firstName, label: retried[index], labels: Object.freeze(retried) });
}
function joinedNames(names) {
  if (names.length < 2) return names[0] || "the Bob crew";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}
function generateClassNameBobLimerick(currentLabels) {
  const labels = Array.from(currentLabels || [], (label) => boundedLabel(label)).filter(Boolean).slice(0, 40);
  if (!labels.length) return Object.freeze({ ok: false, reason: "class-names-required", limerick: "", labels: Object.freeze([]) });
  const stanzas = [];
  const middleAdventures = Object.freeze([
    Object.freeze(["A gear gave a glittery POP!", "They tightened one bolt at the top,"]),
    Object.freeze(["Their rocket spun twice in the air,", "Then landed on Bob's rolling chair,"]),
    Object.freeze(["A robot cried, \u201CBEEPITY-BOP!\u201D", "And danced with a mop till it dropped,"]),
    Object.freeze(["Their bridge did a wibble-wobble,", "They fixed it with one clever bobble,"]),
    Object.freeze(["A windmill went WHOOSH through the room,", "Then powered a bright paper moon,"]),
    Object.freeze(["Their marble raced under a bell,", "Then rang it and hollered, \u201CAll well!\u201D"])
  ]);
  const totalStanzas = Math.ceil(labels.length / 4);
  for (let index = 0; index < labels.length; index += 4) {
    const stanzaIndex = Math.floor(index / 4);
    const crew = labels.slice(index, index + 4);
    const lead = crew[0];
    const helpers = joinedNames(crew.slice(1));
    const middle = middleAdventures[(stableNumber(labels.join("|")) + stanzaIndex) % middleAdventures.length];
    const opening = stanzaIndex === 0 ? `In THINKamigBOB's workshop, ${lead} led the way,` : `Then ${lead} brought a bright plan into play,`;
    const partners = `${helpers} joined the invention that day.`;
    const ending = stanzaIndex === totalStanzas - 1 ? "Together they cheered, \u201CWe improved it\u2014hooray!\u201D" : "They learned, made it better, then cleared the way.";
    stanzas.push([opening, partners, ...middle, ending].join("\n"));
  }
  return Object.freeze({ ok: true, labels: Object.freeze(labels), limerick: stanzas.join("\n\n") });
}
var STUDENT_LIMERICK_DETAILS = Object.freeze(["copper", "clockwork", "glowing", "whirling"]);
var STUDENT_LIMERICKS = Object.freeze([
  (name, detail) => `${name} arrived with a plan,
For a ${detail} mechanical fan.
It rattled\u2014ker-pop!
But they would not stop,
Till it hummed just as smooth as it can!`,
  (name, detail) => `${name} painted a rocket bright blue,
With a ${detail} gold engine or two.
It looped through the air,
Singed Bob's hat and hair,
Then landed precisely on cue!`,
  (name, detail) => `${name} built a robot named Bop,
For the ${detail} invention shop.
It danced with a mop,
Did a flip and a hop,
Then bowed when the music went \u201CSTOP!\u201D`,
  (name, detail) => `${name} raised a bridge over town,
With ${detail} gears spinning around.
A toy truck rolled through,
And a rubber duck too,
While not one strong beam tumbled down!`,
  (name, detail) => `${name} launched a kite in the night,
With a ${detail} tail shining bright.
It tugged at the string,
Made the weather vane sing,
Then sailed like a starship in flight!`,
  (name, detail) => `${name} made a boat that could float,
With a ${detail} propeller and coat.
It splashed past a frog,
Then outraced a log,
And parked by the drawbridge's moat!`,
  (name, detail) => `${name} designed a tall crane,
With a ${detail} hook and a chain.
It lifted a chair,
Spun it twice through the air,
Then set it down softly again!`,
  (name, detail) => `${name} invented a wheel,
Made of ${detail} springs and blue steel.
It rolled up a wall,
Bounced over a ball,
Then stopped for a grand big reveal!`,
  (name, detail) => `${name} built a tower with power,
And a ${detail} clock counting each hour.
It chimed with a BONG,
Played a Bob-themed song,
Then sprinkled the room with a flower!`,
  (name, detail) => `${name} mapped a marvelous maze,
Full of ${detail} tunnels and ways.
A marble zipped right,
Found the finish by night,
And left the whole workshop amazed!`
]);
function generateStudentNameBobLimerick(nameValue, variantIndex = null) {
  const label = boundedLabel(nameValue);
  if (!label || !/bob/i.test(label)) return Object.freeze({ ok: false, reason: "namebob-required", label: "", limerick: "" });
  const index = Number.isSafeInteger(variantIndex) && variantIndex >= 0 ? variantIndex : stableNumber(label);
  const template = STUDENT_LIMERICKS[index % STUDENT_LIMERICKS.length];
  const detail = STUDENT_LIMERICK_DETAILS[Math.floor(index / STUDENT_LIMERICKS.length) % STUDENT_LIMERICK_DETAILS.length];
  return Object.freeze({ ok: true, label, limerick: template(label, detail) });
}
function generateAllNameBobLimericks(currentLabels) {
  const classResult = generateClassNameBobLimerick(currentLabels);
  if (!classResult.ok) return Object.freeze({ ...classResult, studentLimericks: Object.freeze([]) });
  const studentLimericks = classResult.labels.map((label, index) => generateStudentNameBobLimerick(label, index)).filter((result) => result.ok);
  return Object.freeze({ ...classResult, studentLimericks: Object.freeze(studentLimericks) });
}

// platform/scripts/message-library.mjs
var MESSAGE_LIBRARY_KEY = "thinkamigbob.message-library.v1";
var MESSAGE_LIBRARY_LIMIT = 20;
var empty = () => ({ version: 1, messages: [], assignments: {} });
var cleanText = (value, limit) => String(value ?? "").trim().slice(0, limit);
function sanitize2(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.messages)) return empty();
  const messages = value.messages.slice(0, MESSAGE_LIBRARY_LIMIT).map((item) => ({
    id: cleanText(item.id, 80),
    title: cleanText(item.title, 60),
    text: cleanText(item.text, 240),
    color: cleanText(item.color, 20),
    size: cleanText(item.size, 20),
    style: cleanText(item.style, 30),
    segments: Array.isArray(item.segments) ? item.segments.slice(0, 100).map((segment) => ({ text: cleanText(segment.text, 240), color: cleanText(segment.color, 20), size: cleanText(segment.size, 20), style: cleanText(segment.style, 30) })).filter((segment) => segment.text) : [],
    image: String(item.image ?? "").startsWith("data:image/") ? String(item.image) : ""
  })).filter((item) => item.id && item.title && item.text);
  const ids = new Set(messages.map((item) => item.id));
  const assignments = Object.fromEntries(Object.entries(value.assignments ?? {}).filter(([key, id]) => /^[A-Za-z0-9_-]+\|(Monday|Tuesday|Wednesday|Thursday|Friday)$/.test(key) && ids.has(id)));
  return { version: 1, messages, assignments };
}
function createMessageLibrary({ storage, now = () => Date.now() } = {}) {
  const read = () => {
    try {
      return sanitize2(JSON.parse(storage?.getItem(MESSAGE_LIBRARY_KEY) || "null"));
    } catch {
      return empty();
    }
  };
  const write = (state) => {
    const clean2 = sanitize2(state);
    storage?.setItem(MESSAGE_LIBRARY_KEY, JSON.stringify(clean2));
    return clean2;
  };
  return Object.freeze({
    read,
    save(message) {
      const state = read();
      if (!String(message?.title ?? "").trim() || !String(message?.text ?? "").trim()) return { ok: false, reason: "required" };
      if (state.messages.length >= MESSAGE_LIBRARY_LIMIT) return { ok: false, reason: "limit" };
      const id = `message-${now()}-${state.messages.length + 1}`;
      const next = write({ ...state, messages: [{ id, ...message }, ...state.messages] });
      return { ok: true, message: next.messages.find((item) => item.id === id), state: next };
    },
    remove(id) {
      const state = read();
      return write({ ...state, messages: state.messages.filter((item) => item.id !== id), assignments: Object.fromEntries(Object.entries(state.assignments).filter(([, value]) => value !== id)) });
    },
    assign(classId, weekday, messageId) {
      const state = read();
      const key = `${classId}|${weekday}`;
      const assignments = { ...state.assignments };
      if (messageId && state.messages.some((item) => item.id === messageId)) assignments[key] = messageId;
      else delete assignments[key];
      return write({ ...state, assignments });
    },
    assigned(classId, weekday) {
      const state = read();
      return state.messages.find((item) => item.id === state.assignments[`${classId}|${weekday}`]) ?? null;
    }
  });
}
function createBrowserMessageLibrary(windowRef) {
  let storage;
  try {
    storage = windowRef?.localStorage;
  } catch {
    storage = void 0;
  }
  return createMessageLibrary({ storage });
}

// platform/scripts/class-setup-profiles.mjs
var CLASS_SETUP_PROFILES_KEY = "thinkamigbob.class-setup-profiles.v1";
var empty2 = (firstClassId = "") => ({ version: 1, currentClassId: firstClassId, profiles: {} });
function createClassSetupProfiles({ storage, classIds = [] } = {}) {
  const allowed = new Set(classIds);
  const read = () => {
    try {
      const value = JSON.parse(storage?.getItem(CLASS_SETUP_PROFILES_KEY) || "null");
      if (!value || value.version !== 1) return empty2(classIds[0]);
      const currentClassId = allowed.has(value.currentClassId) ? value.currentClassId : classIds[0] ?? "";
      const profiles = Object.fromEntries(Object.entries(value.profiles ?? {}).filter(([id]) => allowed.has(id)));
      return { version: 1, currentClassId, profiles };
    } catch {
      return empty2(classIds[0]);
    }
  };
  const write = (state) => {
    storage?.setItem(CLASS_SETUP_PROFILES_KEY, JSON.stringify(state));
    return state;
  };
  return Object.freeze({
    read,
    select(classId) {
      const state = read();
      return allowed.has(classId) ? write({ ...state, currentClassId: classId }) : state;
    },
    save(classId, profile) {
      const state = read();
      if (!allowed.has(classId)) return state;
      return write({ ...state, profiles: { ...state.profiles, [classId]: profile } });
    },
    profile(classId) {
      return read().profiles[classId] ?? null;
    },
    copy(sourceId, targetIds, components) {
      const state = read();
      const source = state.profiles[sourceId];
      if (!source) return state;
      const profiles = { ...state.profiles };
      targetIds.filter((id) => allowed.has(id) && id !== sourceId).forEach((id) => {
        const current = profiles[id] ?? {};
        profiles[id] = { ...current, ...components.timer ? { schedule: source.schedule } : {}, ...components.memo ? { memo: source.memo } : {} };
      });
      return write({ ...state, profiles });
    }
  });
}
function createBrowserClassSetupProfiles(windowRef, classIds) {
  let storage;
  try {
    storage = windowRef?.localStorage;
  } catch {
    storage = void 0;
  }
  return createClassSetupProfiles({ storage, classIds });
}

// platform/scripts/class-resource-sharing.mjs?v=preview-20261004-7
var CLASS_RESOURCE_STORAGE_KEY = "thinkamigbob.class-resource-sharing.v1";
var RESOURCE_TYPES = Object.freeze(["Mission Activity", "Side Path", "Webpage", "Builder", "Workshop"]);
var RESOURCE_RELEASES = Object.freeze(["manual", "class-start", "purple", "green", "yellow", "red"]);
function emptyState4() {
  return { classes: {} };
}
function normalizeResource(value = {}) {
  return {
    title: String(value.title ?? "").trim().slice(0, 80),
    type: value.type === "Activity" ? "Mission Activity" : RESOURCE_TYPES.includes(value.type) ? value.type : "Mission Activity",
    url: String(value.url ?? "").trim().slice(0, 1e3),
    release: RESOURCE_RELEASES.includes(value.release) ? value.release : "manual"
  };
}
function safeUrl(value) {
  return /^(https?:\/\/|\.\.?\/|\/)/i.test(value) && !/[\u0000-\u001f]/.test(value);
}
function normalizeAudienceRow(row = {}, fallbackResources = [], fallbackSlots = 4, index = 0) {
  const audienceType = ["whole-class", "students", "teacher-group", "random-group"].includes(row.audienceType) ? row.audienceType : "whole-class";
  const audienceIds = Array.isArray(row.audienceIds) ? row.audienceIds.map(String) : [];
  const resources = Array.isArray(row.resources) ? row.resources : fallbackResources;
  return {
    id: String(row.id || (index === 0 ? "whole-class" : `audience-${index + 1}`)),
    audienceType,
    audienceIds,
    audienceLabel: String(row.audienceLabel || (audienceType === "whole-class" ? "Whole class" : "Select students or a group")),
    slotCount: Math.max(4, Number(row.slotCount) || fallbackSlots || 4, resources.length),
    resources
  };
}
function createClassResourceSharing({ storage, now = () => Date.now() }) {
  const read = () => {
    try {
      return { ...emptyState4(), ...JSON.parse(storage.getItem(CLASS_RESOURCE_STORAGE_KEY) || "{}") };
    } catch {
      return emptyState4();
    }
  };
  const write = (state) => storage.setItem(CLASS_RESOURCE_STORAGE_KEY, JSON.stringify(state));
  const classState = (classId) => {
    const stored = read().classes[classId] ?? {};
    const activeResources = Array.isArray(stored.activeResources) ? stored.activeResources : stored.active ? [stored.active] : [];
    const slotCount = Math.max(4, Number(stored.slotCount) || 4, activeResources.length);
    const audienceRows = Array.isArray(stored.audienceRows) && stored.audienceRows.length ? stored.audienceRows.map((row, index) => normalizeAudienceRow(row, index === 0 ? activeResources : [], slotCount, index)) : [normalizeAudienceRow({}, activeResources, slotCount, 0)];
    const primary = audienceRows[0];
    return { prepared: null, saved: [], history: [], savedGroupSets: [], ...stored, assignmentMode: stored.assignmentMode || primary.audienceType, exceptionsEnabled: Boolean(stored.exceptionsEnabled), audienceRows, slotCount: primary.slotCount, activeResources: primary.resources, active: primary.resources[0] ?? null };
  };
  const update = (classId, patch) => {
    const state = read();
    state.classes[classId] = { ...classState(classId), ...patch };
    write(state);
    return state.classes[classId];
  };
  const prepare = (classId, input) => {
    const resource = { ...normalizeResource(input), id: String(input?.id || `resource-${now()}`) };
    if (!classId || !resource.title || !resource.url || !safeUrl(resource.url)) return { ok: false, reason: "missing-resource" };
    const current = classState(classId);
    const saved = [resource, ...current.saved.filter((item) => item.id !== resource.id)].slice(0, 12);
    update(classId, { prepared: resource, saved });
    return { ok: true, resource };
  };
  const updateAudienceRows = (classId, audienceRows, extra = {}) => {
    const primary = audienceRows[0] ?? normalizeAudienceRow();
    return update(classId, { ...extra, audienceRows, slotCount: primary.slotCount, activeResources: primary.resources, active: primary.resources[0] ?? null });
  };
  const pushResource = (classId, resource, slot = "auto", rowId = "whole-class") => {
    const current = classState(classId);
    if (!resource) return { ok: false, reason: "missing-resource" };
    const rowIndex = Math.max(0, current.audienceRows.findIndex((row2) => row2.id === rowId));
    const row = current.audienceRows[rowIndex];
    const activeResources = [...row.resources];
    let index = slot === "auto" ? activeResources.length : Number(slot);
    if (!Number.isInteger(index) || index < 0 || index >= row.slotCount) index = activeResources.length;
    if (index >= row.slotCount) return { ok: false, reason: "tray-full" };
    const active = { ...resource, sharedAt: now() };
    activeResources[index] = active;
    const compact = activeResources.filter(Boolean);
    const audienceRows = current.audienceRows.map((item, itemIndex) => itemIndex === rowIndex ? { ...item, resources: compact } : item);
    updateAudienceRows(classId, audienceRows, { history: [active, ...current.history].slice(0, 20) });
    return { ok: true, resource: active };
  };
  const push = (classId, slot = "auto", rowId = "whole-class") => pushResource(classId, classState(classId).prepared, slot, rowId);
  const pushSaved = (classId, resourceId, slot = "auto", rowId = "whole-class") => pushResource(classId, classState(classId).saved.find((item) => item.id === resourceId), slot, rowId);
  const replaceActive = (classId, resources = []) => {
    const normalized = resources.map((resource, index) => ({ ...normalizeResource(resource), id: String(resource?.id || `resource-${now()}-${index}`), sharedAt: resource?.sharedAt || now() }));
    if (!classId || normalized.some((resource) => !resource.title || !safeUrl(resource.url))) return { ok: false, reason: "missing-resource" };
    const current = classState(classId);
    const audienceRows = current.audienceRows.map((row, index) => index === 0 ? { ...row, slotCount: Math.max(row.slotCount, normalized.length), resources: normalized } : row);
    updateAudienceRows(classId, audienceRows, { history: [...normalized, ...current.history].slice(0, 20) });
    return { ok: true, resources: normalized };
  };
  const addSlot = (classId, rowId = "whole-class") => {
    if (!classId) return { ok: false, reason: "missing-class" };
    const current = classState(classId);
    const rowIndex = Math.max(0, current.audienceRows.findIndex((row) => row.id === rowId));
    const slotCount = current.audienceRows[rowIndex].slotCount + 1;
    const audienceRows = current.audienceRows.map((row, index) => index === rowIndex ? { ...row, slotCount } : row);
    updateAudienceRows(classId, audienceRows);
    return { ok: true, slotCount };
  };
  const removeSlot = (classId, rowId = "whole-class") => {
    if (!classId) return { ok: false, reason: "missing-class" };
    const current = classState(classId);
    const rowIndex = Math.max(0, current.audienceRows.findIndex((row2) => row2.id === rowId));
    const row = current.audienceRows[rowIndex];
    if (row.slotCount <= 1) return { ok: false, reason: "last-slot" };
    if (row.resources.length >= row.slotCount) return { ok: false, reason: "slot-in-use" };
    const slotCount = row.slotCount - 1;
    const audienceRows = current.audienceRows.map((item, index) => index === rowIndex ? { ...item, slotCount } : item);
    updateAudienceRows(classId, audienceRows);
    return { ok: true, slotCount };
  };
  const stop = (classId, index = null, rowId = "whole-class") => {
    const current = classState(classId);
    const rowIndex = Math.max(0, current.audienceRows.findIndex((row) => row.id === rowId));
    const resources = index === null ? [] : current.audienceRows[rowIndex].resources.filter((_, itemIndex) => itemIndex !== Number(index));
    const audienceRows = current.audienceRows.map((row, itemIndex) => itemIndex === rowIndex ? { ...row, resources } : row);
    return updateAudienceRows(classId, audienceRows);
  };
  const addAudienceRow = (classId) => {
    const current = classState(classId);
    const row = normalizeAudienceRow({ id: `audience-${now()}`, audienceType: "students", audienceLabel: "Select students" }, [], 4, current.audienceRows.length);
    updateAudienceRows(classId, [...current.audienceRows, row]);
    return row;
  };
  const removeAudienceRow = (classId, rowId) => {
    const current = classState(classId);
    if (rowId === "whole-class") return { ok: false, reason: "whole-class" };
    return updateAudienceRows(classId, current.audienceRows.filter((row) => row.id !== rowId));
  };
  const updateAudience = (classId, rowId, patch = {}) => {
    const current = classState(classId);
    const audienceRows = current.audienceRows.map((row) => row.id === rowId ? normalizeAudienceRow({ ...row, ...patch }, [], row.slotCount) : row);
    return updateAudienceRows(classId, audienceRows);
  };
  const configureAssignment = (classId, assignmentMode, exceptionsEnabled = false) => {
    const allowed = ["whole-class", "students", "teacher-group", "random-group"];
    const mode = allowed.includes(assignmentMode) ? assignmentMode : "whole-class";
    const current = classState(classId);
    const primary = normalizeAudienceRow({
      ...current.audienceRows[0],
      id: "whole-class",
      audienceType: mode,
      audienceIds: mode === "whole-class" ? [] : current.assignmentMode === mode ? current.audienceRows[0].audienceIds : [],
      audienceLabel: mode === "whole-class" ? "Whole class" : mode === "students" ? "Selected students" : mode === "teacher-group" ? "Group 1" : "Random Group 1"
    }, current.audienceRows[0]?.resources || [], current.audienceRows[0]?.slotCount || 4, 0);
    const exceptionRows = exceptionsEnabled ? current.audienceRows.slice(1) : [];
    return updateAudienceRows(classId, [primary, ...exceptionRows], { assignmentMode: mode, exceptionsEnabled: Boolean(exceptionsEnabled) });
  };
  const setGroupRows = (classId, groups = [], audienceType = "teacher-group") => {
    const current = classState(classId);
    const nonGroups = current.audienceRows.filter((row) => !["teacher-group", "random-group"].includes(row.audienceType));
    const rows = groups.map((group, index) => normalizeAudienceRow({
      id: group.id || `group-${now()}-${index}`,
      audienceType,
      audienceIds: group.audienceIds,
      audienceLabel: group.name || `Group ${index + 1}`,
      resources: group.resources || [],
      slotCount: group.slotCount || 4
    }, [], 4, nonGroups.length + index));
    return updateAudienceRows(classId, [...nonGroups, ...rows]);
  };
  const saveGroupSet = (classId, name) => {
    const current = classState(classId);
    const cleanName2 = String(name || "").trim().slice(0, 60);
    if (!cleanName2) return { ok: false, reason: "missing-name" };
    const groups = current.audienceRows.filter((row) => ["teacher-group", "random-group"].includes(row.audienceType)).map((row) => ({ name: row.audienceLabel, audienceIds: [...row.audienceIds] }));
    if (!groups.length) return { ok: false, reason: "missing-groups" };
    const preset = { id: `group-set-${now()}`, name: cleanName2, groups };
    const savedGroupSets = [preset, ...current.savedGroupSets.filter((item) => item.name !== cleanName2)].slice(0, 20);
    update(classId, { savedGroupSets });
    return { ok: true, preset };
  };
  const applyGroupSet = (classId, presetId) => {
    const current = classState(classId);
    const preset = current.savedGroupSets.find((item) => item.id === presetId);
    if (!preset) return { ok: false, reason: "missing-preset" };
    setGroupRows(classId, preset.groups, "teacher-group");
    return { ok: true, preset };
  };
  const resourcesForStudent = (classId, studentId) => classState(classId).audienceRows.filter((row) => row.audienceType === "whole-class" || row.audienceIds.includes(String(studentId))).flatMap((row) => row.resources);
  const copyPlan = (sourceClassId, targetClassId) => {
    const source = classState(sourceClassId);
    return updateAudienceRows(targetClassId, structuredClone(source.audienceRows));
  };
  const removeSaved = (classId, resourceId) => {
    const current = classState(classId);
    return update(classId, { saved: current.saved.filter((item) => item.id !== resourceId), prepared: current.prepared?.id === resourceId ? null : current.prepared });
  };
  const release = (classId, trigger) => {
    const current = classState(classId);
    if (!current.prepared || current.activeResources.some((item) => item.id === current.prepared.id) || current.prepared.release !== trigger) return { ok: false, reason: "not-due" };
    return push(classId);
  };
  return { read: classState, prepare, push, pushSaved, replaceActive, addSlot, removeSlot, stop, removeSaved, release, addAudienceRow, removeAudienceRow, updateAudience, configureAssignment, setGroupRows, saveGroupSet, applyGroupSet, resourcesForStudent, copyPlan };
}

// platform/scripts/activity-directions.mjs?v=preview-20261016-2
var ACTIVITY_DIRECTIONS_STORAGE_KEY = "thinkamigbob.activity-directions.v1";
var DIRECTION_MEDIA_TYPES = Object.freeze(["none", "image", "google-slides", "youtube", "pdf", "webpage", "builder", "mission-activity", "side-path"]);
function emptyState5() {
  return { classes: {} };
}
function cleanText2(value, limit) {
  return String(value ?? "").trim().slice(0, limit);
}
function safeUrl2(value) {
  if (!value || /[\u0000-\u001f]/.test(value)) return !value;
  return /^https:\/\//i.test(value) || /^(?:\.\.\/|\.\/|\/)[^/]/.test(value);
}
function normalizeResource2(value = {}) {
  const mediaType = DIRECTION_MEDIA_TYPES.includes(value.mediaType) && value.mediaType !== "none" ? value.mediaType : "webpage";
  return { title: cleanText2(value.title, 100), mediaType, url: cleanText2(value.url, 1500) };
}
function normalizeCard(value = {}) {
  const mediaType = DIRECTION_MEDIA_TYPES.includes(value.mediaType) ? value.mediaType : "none";
  const legacyResources = mediaType !== "none" && value.url ? [{ mediaType, url: value.url }] : [];
  const resources = (Array.isArray(value.resources) ? value.resources : legacyResources).map(normalizeResource2).filter((item) => item.url);
  return {
    id: cleanText2(value.id, 100),
    title: cleanText2(value.title, 100),
    directions: cleanText2(value.directions, 2e3),
    mediaType,
    url: cleanText2(value.url, 1500),
    resources,
    status: value.status === "released" ? "released" : "draft",
    createdAt: Number(value.createdAt) || 0,
    updatedAt: Number(value.updatedAt) || 0,
    releasedAt: Number(value.releasedAt) || null
  };
}
function createActivityDirections({ storage, now = () => Date.now() }) {
  const readAll = () => {
    try {
      return { ...emptyState5(), ...JSON.parse(storage.getItem(ACTIVITY_DIRECTIONS_STORAGE_KEY) || "{}") };
    } catch {
      return emptyState5();
    }
  };
  const writeAll = (state) => storage.setItem(ACTIVITY_DIRECTIONS_STORAGE_KEY, JSON.stringify(state));
  const read = (classId) => {
    const stored = readAll().classes[classId] ?? {};
    return { title: cleanText2(stored.title || "Today\u2019s Activity", 100), cards: Array.isArray(stored.cards) ? stored.cards.map(normalizeCard) : [] };
  };
  const write = (classId, value) => {
    const state = readAll();
    state.classes[classId] = { title: cleanText2(value.title || "Today\u2019s Activity", 100), cards: value.cards.map(normalizeCard) };
    writeAll(state);
    return read(classId);
  };
  const setTitle = (classId, title) => write(classId, { ...read(classId), title });
  const replaceCards = (classId, cards) => write(classId, { ...read(classId), cards: Array.isArray(cards) ? cards : [] });
  const saveCard = (classId, input = {}) => {
    const current = read(classId);
    const card = normalizeCard({ ...input, id: input.id || `direction-${now()}`, createdAt: input.createdAt || now(), updatedAt: now() });
    if (!classId || !card.title || !card.directions) return { ok: false, reason: "missing-directions" };
    if (card.resources.some((item) => !safeUrl2(item.url))) return { ok: false, reason: "missing-media" };
    const index = current.cards.findIndex((item) => item.id === card.id);
    const cards = [...current.cards];
    if (index >= 0) cards[index] = { ...cards[index], ...card, status: cards[index].status, releasedAt: cards[index].releasedAt };
    else cards.push(card);
    write(classId, { ...current, cards });
    return { ok: true, card };
  };
  const changeStatus = (classId, cardId, status) => {
    const current = read(classId), index = current.cards.findIndex((item) => item.id === cardId);
    if (index < 0) return { ok: false, reason: "missing-card" };
    const cards = current.cards.map((item, itemIndex) => itemIndex === index ? { ...item, status, updatedAt: now(), releasedAt: status === "released" ? now() : null } : item);
    write(classId, { ...current, cards });
    return { ok: true, card: cards[index] };
  };
  const release = (classId, cardId) => changeStatus(classId, cardId, "released");
  const withdraw = (classId, cardId) => changeStatus(classId, cardId, "draft");
  const duplicate = (classId, cardId) => {
    const current = read(classId), index = current.cards.findIndex((item) => item.id === cardId);
    if (index < 0) return { ok: false, reason: "missing-card" };
    const source = current.cards[index], copy = { ...source, id: `direction-${now()}`, title: `${source.title} copy`.slice(0, 100), status: "draft", createdAt: now(), updatedAt: now(), releasedAt: null };
    const cards = [...current.cards];
    cards.splice(index + 1, 0, copy);
    write(classId, { ...current, cards });
    return { ok: true, card: copy };
  };
  const move = (classId, cardId, offset) => {
    const current = read(classId), index = current.cards.findIndex((item) => item.id === cardId), target = index + Number(offset);
    if (index < 0 || target < 0 || target >= current.cards.length) return { ok: false, reason: "edge" };
    const cards = [...current.cards];
    [cards[index], cards[target]] = [cards[target], cards[index]];
    write(classId, { ...current, cards });
    return { ok: true };
  };
  const remove = (classId, cardId) => {
    const current = read(classId);
    write(classId, { ...current, cards: current.cards.filter((item) => item.id !== cardId) });
    return { ok: true };
  };
  const releasedForStudents = (classId) => read(classId).cards.filter((item) => item.status === "released");
  return Object.freeze({ read, setTitle, replaceCards, saveCard, release, withdraw, duplicate, move, remove, releasedForStudents });
}

// platform/scripts/weekly-reflections.mjs
var WEEKLY_REFLECTION_STORAGE_KEY = "thinkamigbob.weekly-reflections.v1";
var CAPTAINS_LOG_PRESET_PROMPTS = Object.freeze([
  { id: "week-1-ask", week: 1, label: "Ask", prompt: "What did you notice or wonder today?" },
  { id: "week-2-make", week: 2, label: "Make", prompt: "What did you make, build, or try today?" },
  { id: "week-3-improve", week: 3, label: "Improve", prompt: "What did you test or change today?" },
  { id: "week-4-grow", week: 4, label: "Grow", prompt: "What did you learn from today\u2019s work?" },
  { id: "week-5-evidence", week: 5, label: "Evidence", prompt: "What evidence shows your idea is working?" },
  { id: "week-6-explain", week: 6, label: "Explain", prompt: "What challenge did you solve, and how?" },
  { id: "week-7-next", week: 7, label: "Next Step", prompt: "What are you proud of, and what will you try next?" }
]);
var CAPTAINS_LOG_SCHEDULE_OPTIONS = Object.freeze(["Today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
var REFLECTION_PROGRESS_OPTIONS = Object.freeze(["\u{1F331} Started", "\u{1F9EA} Testing", "\u{1F527} Improving", "\u{1F3C6} Complete"]);
var REFLECTION_IMPROVEMENT_OPTIONS = Object.freeze(["Yes", "Not Yet"]);
var REFLECTION_BADGE_OPTIONS = Object.freeze([
  "\u{1F3D7} Builder \u2013 I built, tested, or improved a design.",
  "\u{1F9E0} Scientist \u2013 I collected data, researched, or investigated.",
  "\u{1F3A8} Creator \u2013 I designed, communicated, or created media.",
  "\u{1F4BB} Technology \u2013 I used coding, robotics, or technology tools."
]);
var REFLECTION_HELP_OPTIONS = Object.freeze([
  "\u{1F60A} No, I'm doing fine.",
  "\u{1F914} Maybe a little help. I'll let you know.",
  "\u{1F198} Yes, I need help.",
  "\u{1F6A8} I'm stuck and need teacher support."
]);
var REFLECTION_HELP_OTHER_OPTIONS = Object.freeze(["Yes", "Maybe", "Not Yet"]);
var REFLECTION_ACTIVITY_RATING_OPTIONS = Object.freeze([
  "5 = Awesome \u{1F929}",
  "4 = Good \u{1F60A}",
  "3 = Okay \u{1F610}",
  "2 = Difficult \u{1F615}",
  "1 = Frustrating \u{1F62B}"
]);
function normalizeResponse(value) {
  if (typeof value === "string") return value.trim().length >= 10 && value.trim().length <= 500 ? { reflection: value.trim() } : null;
  if (!value || typeof value !== "object") return null;
  const activity = String(value.activity ?? "").trim();
  const explanation = String(value.explanation ?? "").trim();
  const valid = activity.length > 0 && activity.length <= 120 && explanation.length >= 10 && explanation.length <= 500 && REFLECTION_PROGRESS_OPTIONS.includes(value.progress) && REFLECTION_IMPROVEMENT_OPTIONS.includes(value.improved) && REFLECTION_BADGE_OPTIONS.includes(value.badge) && REFLECTION_HELP_OPTIONS.includes(value.help) && REFLECTION_HELP_OTHER_OPTIONS.includes(value.helpOther) && REFLECTION_ACTIVITY_RATING_OPTIONS.includes(value.rating);
  return valid ? { activity, progress: value.progress, explanation, improved: value.improved, badge: value.badge, help: value.help, helpOther: value.helpOther, rating: value.rating } : null;
}
function weekKey(date = /* @__PURE__ */ new Date()) {
  const value = new Date(date);
  const day = (value.getDay() + 6) % 7;
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() - day);
  return value.toISOString().slice(0, 10);
}
function reflectionActivityWindowStart(date = /* @__PURE__ */ new Date()) {
  const value = new Date(date);
  const day = (value.getDay() + 6) % 7;
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() - day - 3);
  return value.getTime();
}
function createWeeklyReflections({ storage, now = () => /* @__PURE__ */ new Date() }) {
  const readAll = () => {
    try {
      return JSON.parse(storage.getItem(WEEKLY_REFLECTION_STORAGE_KEY) || "{}") || {};
    } catch {
      return {};
    }
  };
  const write = (value) => storage.setItem(WEEKLY_REFLECTION_STORAGE_KEY, JSON.stringify(value));
  const classWeek = (classId) => `${classId}|${weekKey(now())}`;
  const requirement = (classId) => Math.max(0, Math.min(5, Number(readAll().requirements?.[classWeek(classId)] ?? 1)));
  const setRequirement = (classId, count) => {
    const required = Number(count);
    if (!classId || !Number.isInteger(required) || required < 0 || required > 5) return { ok: false };
    const all = readAll();
    all.requirements = { ...all.requirements ?? {}, [classWeek(classId)]: required };
    write(all);
    return { ok: true, required };
  };
  const captainLogPlan = (classId) => {
    const saved = readAll().captainLogPlans?.[classId];
    const fallback = CAPTAINS_LOG_PRESET_PROMPTS[0];
    return saved && typeof saved.prompt === "string" ? saved : { prompt: fallback.prompt, promptId: fallback.id, week: 1, schedule: "Today", required: requirement(classId), updatedAt: null };
  };
  const captainLogAvailableToday = (classId) => {
    const schedule = captainLogPlan(classId).schedule;
    return schedule === "Today" || schedule === new Date(now()).toLocaleDateString("en-US", { weekday: "long" });
  };
  const saveCaptainLogPlan = (classId, value) => {
    const prompt = String(value?.prompt ?? "").trim();
    const week = Number(value?.week), required = Number(value?.required), schedule = String(value?.schedule ?? "");
    if (!classId || prompt.length < 5 || prompt.length > 240 || !Number.isInteger(week) || week < 1 || week > 7 || !CAPTAINS_LOG_SCHEDULE_OPTIONS.includes(schedule) || !Number.isInteger(required) || required < 0 || required > 5) return { ok: false };
    const all = readAll();
    const plan = { prompt, promptId: String(value?.promptId ?? "custom"), week, schedule, required, updatedAt: new Date(now()).toISOString() };
    all.captainLogPlans = { ...all.captainLogPlans ?? {}, [classId]: plan };
    all.requirements = { ...all.requirements ?? {}, [classWeek(classId)]: required };
    write(all);
    return { ok: true, plan };
  };
  const captainLogLibrary = () => (readAll().captainLogLibrary ?? []).filter((item) => item && typeof item.prompt === "string");
  const saveCaptainLogPrompt = (prompt) => {
    const clean2 = String(prompt ?? "").trim();
    if (clean2.length < 5 || clean2.length > 240) return { ok: false };
    const all = readAll(), existing = captainLogLibrary();
    const duplicate = existing.find((item2) => item2.prompt.toLowerCase() === clean2.toLowerCase());
    if (duplicate) return { ok: true, item: duplicate, duplicate: true };
    const item = { id: `captains-log-${new Date(now()).getTime()}`, prompt: clean2 };
    all.captainLogLibrary = [item, ...existing].slice(0, 30);
    write(all);
    return { ok: true, item, duplicate: false };
  };
  const deleteCaptainLogPrompt = (id) => {
    const all = readAll(), before = captainLogLibrary();
    all.captainLogLibrary = before.filter((item) => item.id !== id);
    write(all);
    return { ok: all.captainLogLibrary.length !== before.length };
  };
  const responses = (classId, studentId) => readAll().responses?.[`${classWeek(classId)}|${studentId}`] ?? [];
  const recordActivity = (classId, title) => {
    const cleanTitle = String(title ?? "").trim().slice(0, 120);
    if (!classId || !cleanTitle) return { ok: false };
    const all = readAll();
    const current = all.activities?.[classId] ?? [];
    const entry = { title: cleanTitle, sharedAt: new Date(now()).getTime() };
    all.activities = { ...all.activities ?? {}, [classId]: [entry, ...current].slice(0, 100) };
    write(all);
    return { ok: true, activity: entry };
  };
  const activities = (classId) => {
    const start = reflectionActivityWindowStart(now());
    const currentTime = new Date(now()).getTime();
    const recent = (readAll().activities?.[classId] ?? []).filter((entry) => entry && typeof entry.title === "string" && Number.isFinite(entry.sharedAt) && entry.sharedAt >= start && entry.sharedAt <= currentTime);
    return [...new Map(recent.map((entry) => [entry.title.toLowerCase(), entry])).values()];
  };
  const status = (classId, studentId) => {
    const required = requirement(classId);
    const completed = responses(classId, studentId).length;
    const remaining = Math.max(0, required - completed);
    return { required, completed, remaining, state: remaining === 0 ? "complete" : remaining === 1 ? "one" : "multiple" };
  };
  const submit = (classId, studentId, value) => {
    const response = normalizeResponse(value);
    const current = status(classId, studentId);
    if (!classId || !studentId || !response || current.remaining === 0) return { ok: false };
    const all = readAll();
    const key = `${classWeek(classId)}|${studentId}`;
    const list = all.responses?.[key] ?? [];
    all.responses = { ...all.responses ?? {}, [key]: [...list, { ...response, submittedAt: new Date(now()).toISOString() }] };
    write(all);
    return { ok: true, status: status(classId, studentId) };
  };
  return { requirement, setRequirement, captainLogPlan, captainLogAvailableToday, saveCaptainLogPlan, captainLogLibrary, saveCaptainLogPrompt, deleteCaptainLogPrompt, activities, recordActivity, responses, status, submit };
}

// platform/scripts/automatic-visuals.mjs
var AUTOMATIC_VISUAL_CATALOG = Object.freeze([
  { file: "../assets/images/start mission button.png", name: "start mission button", tags: ["mission", "start", "activity"] },
  { file: "../assets/images/builder-header.png", name: "builder header", tags: ["builder", "build", "design", "create"] },
  { file: "../assets/images/builder-robot.png", name: "builder robot", tags: ["builder", "robot", "prototype"] },
  { file: "../assets/images/workshop/workshop-room-background.png", name: "workshop room", tags: ["workshop", "tools", "make"] },
  { file: "../assets/images/sky-banner-rocket.png", name: "sky banner rocket", tags: ["space", "rocket", "sky", "bedroom"] },
  { file: "../assets/images/desk.png", name: "design desk", tags: ["plan", "directions", "page", "webpage"] },
  { file: "../assets/images/workshop/production/engineering-smart-board/engineering-smart-board-production-v2-extended.png", name: "engineering smart board", tags: ["learn", "reflection", "evidence", "explain"] },
  { file: "../assets/images/characters/thinker-bob-master.png", name: "Thinker BOB", tags: ["help", "focus", "side", "path"] }
]);
function words(value) {
  return String(value ?? "").toLowerCase().replace(/\.[a-z0-9]+$/i, "").split(/[^a-z0-9]+/).filter((word) => word.length > 2);
}
function altFromName(name) {
  return `${name.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())} visual support`;
}
function matchAutomaticVisual({ title = "", detail = "", type = "" } = {}) {
  const query = new Set(words(`${title} ${detail}`));
  let best = null;
  for (const item2 of AUTOMATIC_VISUAL_CATALOG) {
    const matches = [.../* @__PURE__ */ new Set([...words(item2.name), ...item2.tags])].filter((word) => query.has(word)).length;
    if (matches > 0 && (!best || matches > best.matches)) best = { item: item2, matches };
  }
  const fallbackTag = String(type).toLowerCase();
  const item = best?.item ?? AUTOMATIC_VISUAL_CATALOG.find((entry) => entry.tags.includes(fallbackTag)) ?? AUTOMATIC_VISUAL_CATALOG[0];
  return { src: item.file, alt: altFromName(item.name), matched: Boolean(best) };
}

// platform/scripts/voice-meter.mjs?v=preview-20261004-1
var VOICE_METER_STORAGE_KEY = "thinkamigbob.voice-meter.v1";
var VOICE_METER_LEVELS = Object.freeze([
  { key: "silent", label: "Silent work", icon: "\u{1F92B}", target: 12 },
  { key: "whisper", label: "Whisper voices", icon: "\u{1F5E3}\uFE0F", target: 28 },
  { key: "partner", label: "Partner voices", icon: "\u{1F465}", target: 48 },
  { key: "team", label: "Team discussion", icon: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}", target: 68 }
]);
function createVoiceMeterStore({ storage } = {}) {
  const readState = () => {
    try {
      const value = JSON.parse(storage?.getItem(VOICE_METER_STORAGE_KEY) || "null");
      return { level: value?.level, sensitivity: Math.max(50, Math.min(150, Number(value?.sensitivity) || 100)) };
    } catch {
      return { level: null, sensitivity: 100 };
    }
  };
  const read = () => {
    const key = readState().level;
    return VOICE_METER_LEVELS.find((item) => item.key === key) ?? VOICE_METER_LEVELS[2];
  };
  const setLevel = (key) => {
    const level = VOICE_METER_LEVELS.find((item) => item.key === key);
    if (!level) return { ok: false, level: read() };
    try {
      storage?.setItem(VOICE_METER_STORAGE_KEY, JSON.stringify({ ...readState(), level: level.key }));
    } catch {
    }
    return { ok: true, level };
  };
  const readSensitivity = () => readState().sensitivity;
  const setSensitivity = (value) => {
    const sensitivity = Math.max(50, Math.min(150, Math.round(Number(value) || 100)));
    try {
      storage?.setItem(VOICE_METER_STORAGE_KEY, JSON.stringify({ ...readState(), level: read().key, sensitivity }));
    } catch {
    }
    return sensitivity;
  };
  return Object.freeze({ read, setLevel, readSensitivity, setSensitivity });
}
function voiceMeterState(value, target) {
  const level = Math.max(0, Math.min(100, Number(value) || 0));
  const ceiling = Math.max(0, Math.min(100, Number(target) || 0));
  if (level <= ceiling) return "green";
  if (level <= ceiling + 14) return "yellow";
  return "red";
}
function rmsToVoiceLevel(samples) {
  if (!samples?.length) return 0;
  const rms = Math.sqrt(samples.reduce((sum, sample) => {
    const centered = (sample - 128) / 128;
    return sum + centered * centered;
  }, 0) / samples.length);
  return Math.max(0, Math.min(100, Math.round(rms * 230)));
}

// platform/scripts/whiteboard-objects.mjs
var WHITEBOARD_OBJECT_TYPES = Object.freeze(["path", "line", "dimension", "rectangle", "ellipse", "triangle", "diamond", "pentagon", "hexagon", "star", "arrow", "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere", "shape-fragment", "text", "image", "youtube"]);
function createWhiteboardObject(type, values = {}) {
  if (!WHITEBOARD_OBJECT_TYPES.includes(type)) return null;
  return { id: globalThis.crypto?.randomUUID?.() ?? `object-${Date.now()}-${Math.random().toString(16).slice(2)}`, type, ...values };
}
function objectBounds(object) {
  if (!object) return null;
  if (object.type === "path") {
    const xs = object.points.map((point) => point.x), ys = object.points.map((point) => point.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(12, Math.max(...xs) - Math.min(...xs)), height: Math.max(12, Math.max(...ys) - Math.min(...ys)) };
  }
  if (object.type === "dimension") {
    const angle = Math.atan2(object.height ?? 0, object.width ?? 0);
    const offset = Number(object.annotationOffset ?? 18);
    const offsetX = -Math.sin(angle) * offset, offsetY = Math.cos(angle) * offset;
    const labelX = object.x + (object.width ?? 0) / 2 + offsetX, labelY = object.y + (object.height ?? 0) / 2 + offsetY;
    const xs = [object.x, object.x + (object.width ?? 0), object.x + offsetX, object.x + (object.width ?? 0) + offsetX, labelX - 120, labelX + 120];
    const ys = [object.y, object.y + (object.height ?? 0), object.y + offsetY, object.y + (object.height ?? 0) + offsetY, labelY - 28, labelY + 28];
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(12, Math.max(...xs) - Math.min(...xs)), height: Math.max(12, Math.max(...ys) - Math.min(...ys)) };
  }
  return { x: Math.min(object.x, object.x + (object.width ?? 0)), y: Math.min(object.y, object.y + (object.height ?? 0)), width: Math.max(12, Math.abs(object.width ?? 0)), height: Math.max(12, Math.abs(object.height ?? 0)) };
}
function hitTestObjects(objects, point) {
  return [...objects].reverse().find((object) => {
    const bounds = objectBounds(object);
    const padding = 10;
    return point.x >= bounds.x - padding && point.x <= bounds.x + bounds.width + padding && point.y >= bounds.y - padding && point.y <= bounds.y + bounds.height + padding;
  }) ?? null;
}
function moveWhiteboardObject(object, dx, dy) {
  if (object.type === "path") return { ...object, points: object.points.map((point) => ({ x: point.x + dx, y: point.y + dy })) };
  return { ...object, x: object.x + dx, y: object.y + dy };
}
function resizeWhiteboardObject(object, width, height) {
  if (object.type === "path") {
    const bounds = objectBounds(object), sx = Math.max(12, width) / bounds.width, sy = Math.max(12, height) / bounds.height;
    return { ...object, points: object.points.map((point) => ({ x: bounds.x + (point.x - bounds.x) * sx, y: bounds.y + (point.y - bounds.y) * sy })) };
  }
  return { ...object, width: Math.max(12, width), height: Math.max(12, height) };
}
function duplicateWhiteboardObject(object, offset = 24) {
  const copy = structuredClone(object);
  copy.id = globalThis.crypto?.randomUUID?.() ?? `object-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return moveWhiteboardObject(copy, offset, offset);
}

// platform/scripts/platform-app.mjs
var ROUTES = Object.freeze({
  WELCOME: "/welcome",
  PREVIEW_TEACHER: "/preview/teacher",
  PREVIEW_CLASSROOM_DEMO: "/preview/classroom-demo",
  PREVIEW_STUDENT: "/preview/student",
  TEACHER_LOGIN: "/teacher/login",
  TEACHER_CREATE: "/teacher/create",
  TEACHER_RECOVERY: "/teacher/recovery",
  TEACHER_DASHBOARD: "/teacher/dashboard",
  TEACHER_CLASSES: "/teacher/classes",
  STUDENT_ENTRY: "/student/entry",
  STUDENT_ROSTER: "/student/roster",
  STUDENT_IDENTIFIER: "/student/identifier",
  STUDENT_DASHBOARD: "/student/dashboard"
});
var root = document.querySelector("#platform-root");
var STUDENT_NAMEPLATE_STORAGE_KEY = "thinkamigbob.student-nameplate.v1";
var STUDENT_NAMEPLATE_FONTS = Object.freeze(["slab", "classic", "cursive", "playful"]);
var STUDENT_NAMEPLATE_BACKGROUNDS = Object.freeze(["cream", "brass", "blue", "green", "parchment"]);
var BIRD_CHIRPING_SOUND_URL = new URL("./assets/sounds/bird-chirping-loswin23.mp3", window.location.href).href;
var GUITAR_LOOP_SOUND_URL = new URL("./assets/sounds/guitar-loop-time-ending-idoberg.mp3", window.location.href).href;
var CHOIR_TRANSITION_SOUND_URL = new URL("./assets/sounds/choir-heavenly-transition-floraphonic.mp3", window.location.href).href;
var DRUM_LOOP_SOUND_URL = new URL("./assets/sounds/drum-loop-kamhunt.mp3", window.location.href).href;
var TRAP_LOOP_DRUMS_SOUND_URL = new URL("./assets/sounds/trap-loop-drums-kamhunt.mp3", window.location.href).href;
var SOFT_PIANO_SOUND_URL = new URL("./assets/sounds/soft-piano-royalty-free-music.mp3", window.location.href).href;
var CARDINAL_SOUND_URL = new URL("./assets/sounds/cardinal-freesound-community.mp3", window.location.href).href;
var session = createSessionStore(window.sessionStorage);
var lessonTimer = createLessonTimer({ storage: window.sessionStorage });
var classTimerSchedule = createBrowserClassTimerSchedule(window);
var teacherMemo = createTeacherMemoStore({ storage: window.sessionStorage });
var messageLibrary = createBrowserMessageLibrary(window);
var pilotTeacherClasses = getClassesForTeacher("teacher-preview-1");
var classSetupProfiles = createBrowserClassSetupProfiles(window, pilotTeacherClasses.map((item) => item.id));
var classResourceSharing = createClassResourceSharing({ storage: window.localStorage });
var activityDirections = createActivityDirections({ storage: window.localStorage });
var weeklyReflections = createWeeklyReflections({ storage: window.localStorage });
var voiceMeter = createVoiceMeterStore({ storage: window.sessionStorage });
var todaysMission = createTodaysMissionStore({ storage: window.sessionStorage });
var studentDisplayMode = createStudentDisplayModeStore({ storage: window.sessionStorage });
var pb002jClasswide = createPB002JClasswideController({ client: createPB002JClasswideClient({ windowRef: window }) });
var evidenceFoundation = createEvidenceFoundation({ storage: window.sessionStorage });
var evidenceDriveSetup = createEvidenceDriveSetup({ storage: window.sessionStorage });
var evidenceUploadClient = createEvidenceUploadClient({ brokerOrigin: window.location.port === "8784" ? window.location.origin : "http://127.0.0.1:8784" });
var evidenceGovernance = createEvidenceGovernanceDraft({ storage: window.sessionStorage });
var evidenceGovernanceSimulation = createEvidenceGovernanceSimulation({ storage: window.sessionStorage });
var googleConnectionPreview = createGoogleConnectionPreview({ storage: window.sessionStorage });
var productionIdentityConfig = productionIdentityConfiguration();
var productionIdentity = createProductionIdentityClient({ enabled: productionIdentityConfig.enabled, origin: window.location.origin });
var classroomLesson = createClassroomLessonClient({ serviceOrigin: window.location.origin });
var classroomLessonServiceNotice = "";
var productionStudentClassLabels = [];
var productionStudentDisplayLabel = "";
var PRODUCTION_CURRENT_CLASS_KEY = "thinkamigbob.production.current-class.v1";
var productionTeacherClasses = [];
function productionClassRecord(classroom = {}) {
  const id = String(classroom.id || classroom.classId || "");
  const name = String(classroom.name || "Classroom");
  return { ...classroom, id, displayName: name, periodLabel: "", teacherId: session.read().teacherId };
}
function setProductionTeacherClasses(classrooms = [], preferredClassId = "") {
  productionTeacherClasses = classrooms.map(productionClassRecord).filter((item) => item.id);
  const saved = preferredClassId || window.sessionStorage.getItem(PRODUCTION_CURRENT_CLASS_KEY) || "";
  const selected = productionTeacherClasses.some((item) => item.id === saved) ? saved : productionTeacherClasses[0]?.id || "";
  if (selected) window.sessionStorage.setItem(PRODUCTION_CURRENT_CLASS_KEY, selected);
}
function lessonResourceForService(resource = {}, fallbackTitle = "Lesson resource") {
  const mediaType = String(resource.mediaType || "webpage");
  const type = mediaType === "image" ? "image" : mediaType === "youtube" ? "video" : "link";
  let url = String(resource.url || "").trim();
  try {
    url = new URL(url, window.location.href).href;
  } catch {
  }
  return { type, label: String(resource.title || fallbackTitle).trim().slice(0, 100), url };
}
function lessonResourceFromService(resource = {}) {
  const url = String(resource.url || "");
  const mediaType = resource.type === "image" ? "image" : resource.type === "video" && /(?:youtube\.com|youtu\.be)/i.test(url) ? "youtube" : "webpage";
  return { mediaType, title: String(resource.label || ""), url };
}
function lessonStepForService(card, order = 0) {
  return {
    id: card.id,
    title: card.title,
    directions: card.directions,
    resources: (card.resources || []).map((resource) => lessonResourceForService(resource, card.title)),
    status: card.status === "released" ? "released" : "draft",
    order
  };
}
function lessonStepFromService(step = {}) {
  return {
    id: step.id,
    title: step.title,
    directions: step.directions,
    resources: (step.resources || []).map(lessonResourceFromService),
    status: step.status === "released" ? "released" : "draft",
    createdAt: Number(step.updatedAt) || Date.now(),
    updatedAt: Number(step.updatedAt) || Date.now(),
    releasedAt: Number(step.releasedAt) || null
  };
}
async function saveLessonStepToService(classId, card) {
  if (!productionIdentityConfig.enabled || !classId || !card) return { ok: true, localPreview: true };
  const cards = activityDirections.read(classId).cards;
  const order = Math.max(0, cards.findIndex((item) => item.id === card.id));
  const result = await classroomLesson.saveStep({ classId, step: lessonStepForService(card, order) });
  classroomLessonServiceNotice = result.ok ? "Saved securely for this class." : "Saved in this browser, but the classroom service could not be reached.";
  return result;
}
async function loadLessonStepsFromService(state = session.read()) {
  if (!productionIdentityConfig.enabled) return { ok: true, localPreview: true };
  const classId = state.role === PLATFORM_ROLES.STUDENT ? state.classId : currentTeacherClass(state.teacherId)?.id;
  if (!classId) return { ok: false, error: "class-not-selected" };
  const result = state.role === PLATFORM_ROLES.STUDENT ? await classroomLesson.studentSteps() : await classroomLesson.teacherSteps(classId);
  if (!result.ok) {
    classroomLessonServiceNotice = "The secure classroom service is temporarily unavailable.";
    return result;
  }
  const steps = Array.isArray(result.steps) ? result.steps : [];
  if (state.role === PLATFORM_ROLES.STUDENT) productionStudentClassLabels = Array.isArray(result.studentLabels) ? result.studentLabels : [];
  if (state.role === PLATFORM_ROLES.STUDENT) productionStudentDisplayLabel = String(result.studentLabel || "").trim();
  activityDirections.replaceCards(classId, steps.map(lessonStepFromService));
  classroomLessonServiceNotice = state.role === PLATFORM_ROLES.STUDENT ? "Teacher directions loaded." : "Lesson steps loaded securely.";
  return result;
}
var oneTimeClassroomCodes = null;
var evidenceDraft = null;
var evidenceNotice = "";
var teacherEvidenceFilter = "All";
var teacherEvidenceSelection = PILOT_TEACHER_EVIDENCE[0]?.id ?? "";
var evidenceTeacherRuntimeKey = "";
var teacherLiveEvidence = [];
var teacherLiveEvidenceSelection = "";
var teacherLiveEvidencePreviewUrl = "";
var teacherLiveEvidenceNotice = "No live fictional submissions loaded yet.";
var teacherLiveEvidenceFilters = { studentId: "All", activity: "All", evidenceType: "All" };
var MISSIONS_FIRST_REMINDER = "Missions First! Read your directions before opening Builder or Workshop.";
var MISSION_FOCUS_OPTIONS = Object.freeze([
  "Learn what today's mission is asking us to do.",
  "Build, test, and make one thoughtful improvement.",
  "Use evidence to explain what worked and what changed.",
  "Work together, solve problems, and share our thinking.",
  "Reflect on what we learned and what we would try next."
]);
var LESSON_TIMER_DISPLAY_SESSION_KEY = "thinkamigbob.pb002b.lesson-timer-display.v1";
var CLASSROOM_DEMO_SESSION_KEY = "thinkamigbob.classroom-demo.v1";
var PRESENTATION_TIMER_VIEW_KEY = "thinkamigbob.presentation-timer-view.v1";
var STUDENT_DISPLAY_VOICE_METER_SESSION_KEY = "thinkamigbob.student-display.voice-meter.v1";
var WHITEBOARD_SESSION_KEY = "thinkamigbob.classroom-whiteboard.v1";
var WHITEBOARD_OBJECT_SESSION_KEY = "thinkamigbob.classroom-whiteboard-objects.v1";
var WHITEBOARD_PAGES_SESSION_KEY = "thinkamigbob.classroom-whiteboard-pages.v1";
var WHITEBOARD_VIEW_SESSION_KEY = "thinkamigbob.classroom-whiteboard-view.v1";
var WHITEBOARD_LIBRARY_KEY = "thinkamigbob.classroom-whiteboard-library.v1";
var WHITEBOARD_BOB_MEASUREMENT_COACH_KEY = "thinkamigbob.whiteboard-bob-measurement-coach.v1";
var TEACHER_ASSIGNED_RESEARCH_KEY = "thinkamigbob.teacher-assigned-research.v1";
var TEACHER_RESEARCH_LINK_BANK_KEY = "thinkamigbob.teacher-research-link-bank.v1";
var DO_NOW_POSTS_KEY = "thinkamigbob.do-now-posts.v1";
var DO_NOW_LIVE_KEY = "thinkamigbob.do-now-live.v1";
var CLASSROOM_BOB_DISPLAY_KEY = "thinkamigbob.classroom-bob-display.v1";
var CLASSROOM_BOB_DAILY_MENU_KEY = "thinkamigbob.classroom-bob-daily-menu.v1";
var CLASSROOM_BOB_UNLOCK_KEY = "thinkamigbob.classroom-bob-unlocks.v1";
var CLASSROOM_BOB_DAILY_KEY = "thinkamigbob.classroom-bob-daily.v1";
var BOB_POSE_COUNT = 200;
var VOICE_METER_HISTORY_KEY = "thinkamigbob.voice-meter-history.v1";
var VOICE_METER_ACTIVITY_KEY = "thinkamigbob.voice-meter-activity.v1";
var VOICE_METER_STAR_GOAL_KEY = "thinkamigbob.voice-meter-star-goal.v1";
var VOICE_METER_WEEKLY_STAR_GOAL_KEY = "thinkamigbob.voice-meter-weekly-star-goal.v1";
var VOICE_METER_DISPLAY_MODE_KEY = "thinkamigbob.voice-meter-display-mode.v1";
var VOICE_METER_ACTIVITIES = Object.freeze([
  { key: "teacher-led", label: "Teacher-led instruction", icon: "\u{1F469}\u200D\u{1F3EB}", target: 58 },
  { key: "independent", label: "Independent seat work", icon: "\u{1F92B}", target: 22 },
  { key: "collaborative", label: "Collaborative activity", icon: "\u{1F465}", target: 68 }
]);
var WHITEBOARD_EMOJI_STAMPS = Object.freeze([
  { category: "Faces and feelings", emojis: [["\u{1F600}", "Grinning"], ["\u{1F603}", "Happy"], ["\u{1F60A}", "Smiling"], ["\u{1F602}", "Laughing"], ["\u{1F929}", "Excited"], ["\u{1F973}", "Celebrating"], ["\u{1F60D}", "Love it"], ["\u{1F914}", "Thinking"], ["\u{1F9D0}", "Investigating"], ["\u{1F62E}", "Surprised"], ["\u{1F60E}", "Confident"], ["\u{1F605}", "Phew"], ["\u{1F615}", "Confused"], ["\u{1F622}", "Sad"], ["\u{1F634}", "Tired"], ["\u{1F92F}", "Mind blown"]] },
  { category: "Hands and people", emojis: [["\u{1F44D}", "Thumbs up"], ["\u{1F44E}", "Thumbs down"], ["\u{1F44F}", "Applause"], ["\u{1F64C}", "Celebrate"], ["\u270B", "Raised hand"], ["\u{1F44B}", "Wave"], ["\u{1F91D}", "Teamwork"], ["\u{1F4AA}", "Strong"], ["\u{1F64F}", "Thank you"], ["\u{1F440}", "Look"], ["\u{1F9E0}", "Brain"], ["\u{1F5E3}\uFE0F", "Speaking"], ["\u{1F469}\u200D\u{1F52C}", "Scientist"], ["\u{1F468}\u200D\u{1F52C}", "Scientist"], ["\u{1F469}\u200D\u{1F3ED}", "Builder"], ["\u{1F468}\u200D\u{1F3ED}", "Builder"]] },
  { category: "STEM and school", emojis: [["\u{1F52C}", "Microscope"], ["\u{1F52D}", "Telescope"], ["\u{1F9EA}", "Test tube"], ["\u{1F9EB}", "Petri dish"], ["\u2697\uFE0F", "Lab flask"], ["\u{1F9EC}", "DNA"], ["\u{1F9F2}", "Magnet"], ["\u2699\uFE0F", "Gear"], ["\u{1F6E0}\uFE0F", "Tools"], ["\u{1F527}", "Wrench"], ["\u{1F529}", "Bolt"], ["\u{1F4D0}", "Triangle ruler"], ["\u{1F4CF}", "Ruler"], ["\u270F\uFE0F", "Pencil"], ["\u{1F4DA}", "Books"], ["\u{1F4A1}", "Idea"], ["\u{1F916}", "Robot"], ["\u{1F680}", "Rocket"], ["\u{1F6F0}\uFE0F", "Satellite"], ["\u{1F4BB}", "Computer"]] },
  { category: "Nature and weather", emojis: [["\u2600\uFE0F", "Sun"], ["\u{1F324}\uFE0F", "Partly cloudy"], ["\u{1F327}\uFE0F", "Rain"], ["\u26C8\uFE0F", "Storm"], ["\u2744\uFE0F", "Snow"], ["\u{1F308}", "Rainbow"], ["\u{1F525}", "Fire"], ["\u{1F4A7}", "Water"], ["\u{1F30A}", "Wave"], ["\u{1F331}", "Seedling"], ["\u{1F333}", "Tree"], ["\u{1F33B}", "Sunflower"], ["\u{1F30E}", "Earth"], ["\u{1F319}", "Moon"], ["\u2B50", "Star"]] },
  { category: "Animals", emojis: [["\u{1F436}", "Dog"], ["\u{1F431}", "Cat"], ["\u{1F42D}", "Mouse"], ["\u{1F430}", "Rabbit"], ["\u{1F98A}", "Fox"], ["\u{1F43B}", "Bear"], ["\u{1F43C}", "Panda"], ["\u{1F981}", "Lion"], ["\u{1F438}", "Frog"], ["\u{1F435}", "Monkey"], ["\u{1F414}", "Chicken"], ["\u{1F427}", "Penguin"], ["\u{1F989}", "Owl"], ["\u{1F98B}", "Butterfly"], ["\u{1F41D}", "Bee"], ["\u{1F422}", "Turtle"], ["\u{1F419}", "Octopus"], ["\u{1F420}", "Fish"]] },
  { category: "Food and objects", emojis: [["\u{1F34E}", "Apple"], ["\u{1F355}", "Pizza"], ["\u{1F36A}", "Cookie"], ["\u{1F9C1}", "Cupcake"], ["\u{1F964}", "Drink"], ["\u26BD", "Soccer ball"], ["\u{1F3C0}", "Basketball"], ["\u{1F3A8}", "Art"], ["\u{1F3B5}", "Music"], ["\u{1F3B2}", "Game die"], ["\u{1F9E9}", "Puzzle"], ["\u{1F3AF}", "Target"], ["\u{1F3C6}", "Trophy"], ["\u{1F381}", "Gift"], ["\u23F0", "Clock"], ["\u{1F514}", "Bell"]] },
  { category: "Marks and symbols", emojis: [["\u2705", "Complete"], ["\u274C", "Incorrect"], ["\u2B50", "Star"], ["\u2764\uFE0F", "Heart"], ["\u{1F49B}", "Yellow heart"], ["\u{1F49A}", "Green heart"], ["\u{1F499}", "Blue heart"], ["\u{1F49C}", "Purple heart"], ["\u2757", "Important"], ["\u2753", "Question"], ["\u27A1\uFE0F", "Right arrow"], ["\u2B05\uFE0F", "Left arrow"], ["\u2B06\uFE0F", "Up arrow"], ["\u2B07\uFE0F", "Down arrow"], ["\u2795", "Plus"], ["\u2796", "Minus"], ["\u{1F4AF}", "One hundred"], ["\u2728", "Sparkles"]] }
]);
var knownRoutes = new Set(Object.values(ROUTES));
var lessonTimerPresentationInterval = null;
var lessonTimerDisplayTrigger = null;
var activitySideTimer = { durationSeconds: 300, remainingSeconds: 300, status: "ready", endsAt: 0 };
var stopwatchSeconds = 0;
var stopwatchInterval = null;
var namePickerRemovedStudentIds = /* @__PURE__ */ new Set();
var namePickerRotation = 0;
var smartboardDrag = null;
var lastTimerPhaseKey = null;
var lastTimerStatus = null;
var studentTimerPopout = null;
var classroomPresentationWindow = null;
var classroomCompanionWindow = null;
var doNowDraft = null;
var smartboardToolPopouts = /* @__PURE__ */ new Map();
var memoFormatRevision = Date.now();
var memoSelectionRange = null;
var memoTypingFormat = null;
var pendingScrollTarget = "";
var pendingOpenClassResourceEditor = false;
var reflectionRecognition = null;
var voiceMeterAudioContext = null;
var voiceMeterStream = null;
var voiceMeterAnimationFrame = null;
var voiceMeterDisplayTrigger = null;
var voiceMeterUsage = null;
var voiceBobState = "green";
var voiceBobStateChangedAt = 0;
var floatingBobCornerIndex = 0;
var floatingBobIdleSet = 1;
var floatingBobRoamingInterval = null;
var floatingBobGreenSince = Date.now();
var floatingBobPoseBag = [];
var floatingBobLastPose = -1;
var floatingBobUnlockMessageUntil = 0;
var floatingBobUnlockMessage = "";
var teacherComparisonClassId = "";
var whiteboardDisplayTrigger = null;
var whiteboardUndoStack = [];
var whiteboardRedoStack = [];
var whiteboardDrawing = null;
var whiteboardObjects = [];
var whiteboardPages = [];
var whiteboardCurrentPageIndex = 0;
var whiteboardPageDock = "left";
var whiteboardSelectedObjectId = "";
var whiteboardClipboard = null;
var whiteboardGridUnit = "plain";
var whiteboardBackground = { type: "white", color1: "#ffffff", color2: "#d8edf5", imageSrc: "", element: null };
var whiteboardRulerUnit = "none";
var whiteboardZoom = 100;
var whiteboardRuler = { x: 40, y: 420, length: 600, angle: 0, sides: "both" };
var whiteboardPendingDimension = null;
var whiteboardDrawingTitle = "Workshop Drawing";
var whiteboardControlsDock = "top";
var whiteboardControlsHidden = false;
var whiteboardLassoPoints = [];
var whiteboardLassoBounds = null;
var whiteboardSelectionDownload = "";
var whiteboardContextPoint = null;
var whiteboardDeleteNextObject = false;
var pixelStudio = { size: 16, bits: 4, frames: [], sourceFrames: [], frameIndex: 0, pixels: [], drawing: false, palette: [] };
var pixelStudioPreviewTimer = null;
function lessonTimerDisplayIsStoredOpen() {
  try {
    return window.sessionStorage.getItem(LESSON_TIMER_DISPLAY_SESSION_KEY) === "open";
  } catch {
    return false;
  }
}
function classroomDemoModeIsEnabled() {
  try {
    return window.sessionStorage.getItem(CLASSROOM_DEMO_SESSION_KEY) === "enabled";
  } catch {
    return false;
  }
}
function setClassroomDemoMode(enabled) {
  try {
    if (enabled) window.sessionStorage.setItem(CLASSROOM_DEMO_SESSION_KEY, "enabled");
    else window.sessionStorage.removeItem(CLASSROOM_DEMO_SESSION_KEY);
  } catch {
  }
}
function seedClassroomDemo() {
  const classId = "class-preview-1";
  const now = Date.now();
  classSetupProfiles.select(classId);
  todaysMission.save({
    title: "Build and Test a Weight-Bearing Bridge",
    focus: "Use evidence from testing to strengthen one part of your bridge design.",
    builder: TODAYS_MISSION_AVAILABILITY.AVAILABLE,
    workshop: TODAYS_MISSION_AVAILABILITY.AVAILABLE
  });
  teacherMemo.save("Welcome engineers! Review your team plan, test carefully, and record one improvement before cleanup.", { color: "light-blue", size: "extra-large", style: "bold" });
  classResourceSharing.replaceActive(classId, [
    { id: "demo-mission-bridge", type: "Mission Activity", title: "Bridge Strength Challenge", url: "https://example.test/bridge-strength", release: "class-start" },
    { id: "demo-builder", type: "Builder", title: "Digital Bridge Builder", url: "https://example.test/bridge-builder", release: "green" },
    { id: "demo-side-path", type: "Side Path", title: "Why Triangles Make Structures Strong", url: "https://example.test/triangle-structures", release: "manual" },
    { id: "demo-reflection", type: "Webpage", title: "Bridge Test Reflection", url: "https://example.test/bridge-reflection", release: "red" }
  ]);
  const schedule = classTimerSchedule.read();
  classTimerSchedule.save({ ...schedule, enabled: false, durationMinutes: 52, pomodoroEnabled: true, phases: recommendedTimerPhases(52) });
  lessonTimer.startScheduled(52, 31 * 60 + 24);
  classSetupProfiles.save(classId, { schedule: classTimerSchedule.read(), memo: teacherMemo.read(), mission: todaysMission.read(), readiness: { mission: "new", timer: "saved", safeguards: "saved" } });
  const whiteboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><rect width="100%" height="100%" fill="#f9fcfd"/><path d="M0 54H960M0 108H960M0 162H960M0 216H960M0 270H960M0 324H960M0 378H960M0 432H960M0 486H960M96 0V540M192 0V540M288 0V540M384 0V540M480 0V540M576 0V540M672 0V540M768 0V540M864 0V540" stroke="#d8e7ec"/><text x="40" y="55" font-family="Arial" font-size="30" font-weight="700" fill="#123346">Bridge Test: Team Design Review</text><path d="M160 390L300 230L440 390L580 230L720 390M160 390H720" fill="none" stroke="#16698e" stroke-width="14" stroke-linejoin="round"/><path d="M135 410H745" stroke="#2d7d5b" stroke-width="12"/><text x="235" y="465" font-family="Arial" font-size="24" fill="#2d7d5b">Add triangle braces before the second test</text></svg>`;
  const boardImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(whiteboardSvg)}`;
  writeWhiteboardLibrary([{ id: "demo-whiteboard", title: "Bridge Test Review", classId, scheduleType: "none", day: "", date: "", studentDisplay: true, gridUnit: "cm", rulerUnit: "metric", image: boardImage, displayImage: boardImage, objects: [], savedAt: now - 18 * 60 * 1e3 }, ...readWhiteboardLibrary().filter((board) => board.id !== "demo-whiteboard")]);
  const voiceHistory = [
    { classId, usedAt: now - 24 * 60 * 60 * 1e3, activityMode: "collaborative", durationSeconds: 2380, detectedSeconds: { "teacher-led": 720, independent: 510, collaborative: 1150 }, goalSeconds: 2380, loudSeconds: 265, average: 43, peak: 76 },
    { classId, usedAt: now - 3 * 24 * 60 * 60 * 1e3, activityMode: "teacher-led", durationSeconds: 2250, detectedSeconds: { "teacher-led": 1080, independent: 390, collaborative: 780 }, goalSeconds: 2250, loudSeconds: 510, average: 51, peak: 84 },
    { classId: "class-preview-2", usedAt: now - 24 * 60 * 60 * 1e3, activityMode: "collaborative", durationSeconds: 2310, detectedSeconds: { "teacher-led": 600, independent: 330, collaborative: 1380 }, goalSeconds: 2310, loudSeconds: 620, average: 58, peak: 89 }
  ];
  try {
    window.localStorage.setItem(VOICE_METER_HISTORY_KEY, JSON.stringify(voiceHistory));
  } catch {
  }
}
function storeLessonTimerDisplayOpen(isOpen) {
  try {
    if (isOpen) {
      window.sessionStorage.setItem(LESSON_TIMER_DISPLAY_SESSION_KEY, "open");
    } else {
      window.sessionStorage.removeItem(LESSON_TIMER_DISPLAY_SESSION_KEY);
    }
  } catch {
  }
}
function studentDisplayVoiceMeterIsEnabled() {
  try {
    return window.sessionStorage.getItem(STUDENT_DISPLAY_VOICE_METER_SESSION_KEY) === "enabled";
  } catch {
    return false;
  }
}
function storeStudentDisplayVoiceMeterEnabled(isEnabled) {
  try {
    if (isEnabled) window.sessionStorage.setItem(STUDENT_DISPLAY_VOICE_METER_SESSION_KEY, "enabled");
    else window.sessionStorage.removeItem(STUDENT_DISPLAY_VOICE_METER_SESSION_KEY);
  } catch {
  }
}
function readWhiteboardLibrary() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WHITEBOARD_LIBRARY_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((board) => board?.id && board?.title && board?.image).slice(0, 12) : [];
  } catch {
    return [];
  }
}
function writeWhiteboardLibrary(boards) {
  try {
    window.localStorage.setItem(WHITEBOARD_LIBRARY_KEY, JSON.stringify(boards.slice(0, 12)));
    return true;
  } catch {
    return false;
  }
}
function readVoiceMeterHistory() {
  try {
    const value = JSON.parse(window.localStorage.getItem(VOICE_METER_HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, 100) : [];
  } catch {
    return [];
  }
}
function readVoiceMeterActivity() {
  try {
    const key = window.localStorage.getItem(VOICE_METER_ACTIVITY_KEY);
    return VOICE_METER_ACTIVITIES.find((item) => item.key === key) ?? VOICE_METER_ACTIVITIES[0];
  } catch {
    return VOICE_METER_ACTIVITIES[0];
  }
}
function readVoiceMeterStarGoal() {
  try {
    return Math.max(50, Math.min(100, Number(window.localStorage.getItem(VOICE_METER_STAR_GOAL_KEY)) || 80));
  } catch {
    return 80;
  }
}
function readVoiceMeterWeeklyStarGoal() {
  try {
    return Math.max(1, Math.min(5, Number(window.localStorage.getItem(VOICE_METER_WEEKLY_STAR_GOAL_KEY)) || 3));
  } catch {
    return 3;
  }
}
function readVoiceMeterDisplayMode() {
  try {
    return window.localStorage.getItem(VOICE_METER_DISPLAY_MODE_KEY) === "prediction" ? "prediction" : "basic";
  } catch {
    return "basic";
  }
}
function predictedLearningType(level) {
  if (level <= 22) return { icon: "\u{1F92B}", label: "Independent work pattern" };
  if (level <= 58) return { icon: "\u{1F469}\u200D\u{1F3EB}", label: "Likely one-speaker instruction" };
  return { icon: "\u{1F465}", label: "Collaborative sound pattern" };
}
function soundGoalPercentage(items) {
  const total = items.reduce((sum, item) => sum + (Number(item.goalSeconds) || Number(item.durationSeconds) || 0), 0);
  const loud = items.reduce((sum, item) => sum + (Number(item.loudSeconds) || 0), 0);
  return total ? Math.max(0, Math.min(100, Math.round((total - loud) / total * 100))) : null;
}
function startOfLocalWeek(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  return date.getTime();
}
function voiceActivityMinutes(history, classId) {
  const totals = { "teacher-led": 0, independent: 0, collaborative: 0 };
  history.filter((item) => item.classId === classId).forEach((item) => {
    const detected = item.detectedSeconds;
    if (detected && typeof detected === "object") Object.keys(totals).forEach((key) => {
      totals[key] += Number(detected[key]) || 0;
    });
    else if (item.activityMode && Object.hasOwn(totals, item.activityMode)) totals[item.activityMode] += Number(item.durationSeconds) || 0;
  });
  return totals;
}
function voiceActivitySummary(history, classId, { editable = true } = {}) {
  const classHistory = history.filter((item) => item.classId === classId);
  const totals = voiceActivityMinutes(history, classId);
  const latest = classHistory[0];
  const starGoal = readVoiceMeterStarGoal();
  const weeklyStarGoal = readVoiceMeterWeeklyStarGoal();
  const today = Date.now();
  const thisWeekStart = startOfLocalWeek(today);
  const lastWeekStart = thisWeekStart - 7 * 24 * 60 * 60 * 1e3;
  const thisWeek = classHistory.filter((item) => Number(item.usedAt) >= thisWeekStart);
  const lastWeek = classHistory.filter((item) => Number(item.usedAt) >= lastWeekStart && Number(item.usedAt) < thisWeekStart);
  const latestDateKey = latest ? new Date(latest.usedAt).toLocaleDateString() : "";
  const latestDay = latest ? classHistory.filter((item) => new Date(item.usedAt).toLocaleDateString() === latestDateKey) : [];
  const lastUsedPercentage = soundGoalPercentage(latestDay);
  const thisWeekPercentage = soundGoalPercentage(thisWeek);
  const lastWeekPercentage = soundGoalPercentage(lastWeek);
  const weeklyDifference = thisWeekPercentage != null && lastWeekPercentage != null ? thisWeekPercentage - lastWeekPercentage : null;
  const days = /* @__PURE__ */ new Map();
  thisWeek.forEach((item) => {
    const key = new Date(item.usedAt).toLocaleDateString();
    days.set(key, [...days.get(key) || [], item]);
  });
  const earnedWeekdays = new Set([...days.values()].filter((items) => (soundGoalPercentage(items) ?? 0) >= starGoal).map((items) => (new Date(items[0].usedAt).getDay() + 6) % 7).filter((index) => index < 5));
  const stars = earnedWeekdays.size;
  const goalAchieved = lastUsedPercentage != null && lastUsedPercentage >= starGoal;
  const minutes = (seconds) => seconds ? `${Math.max(1, Math.round(seconds / 60))} min` : "0 min";
  const resultLabel = lastUsedPercentage >= 90 ? "Excellent sound balance" : goalAchieved ? "Sound goal achieved" : lastUsedPercentage >= 65 ? "Almost there" : "Try adjusting the goal or microphone sensitivity";
  const comparison = weeklyDifference == null ? "A comparison will appear after both weeks have data." : weeklyDifference >= 0 ? `This week is ${weeklyDifference}% higher than last week \u{1F389}` : `This week is ${Math.abs(weeklyDifference)}% below last week. Let\u2019s try for one more star tomorrow.`;
  const weekdayStars = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => `<span data-earned="${earnedWeekdays.has(index)}"><b>${earnedWeekdays.has(index) ? "\u2605" : "\u2606"}</b><small>${day}</small></span>`).join("");
  const activityDetails = `<details class="platform-voice-activity-details"><summary>Activity minutes and sound patterns</summary><div class="platform-voice-history-summary"><div><span>\u{1F469}\u200D\u{1F3EB}</span><strong>${minutes(totals["teacher-led"])}</strong><small>Likely teacher-led</small></div><div><span>\u{1F92B}</span><strong>${minutes(totals.independent)}</strong><small>Independent</small></div><div><span>\u{1F465}</span><strong>${minutes(totals.collaborative)}</strong><small>Collaborative</small></div></div><p>The meter estimates sound patterns; it does not identify individual speakers.</p></details>`;
  if (!latest) return `<p>No voice-meter sessions have been saved yet.</p>${activityDetails}`;
  return `<section class="platform-voice-motivation"><div class="platform-voice-today-result" data-result="${goalAchieved ? "achieved" : "progress"}"><small>Last monitored \xB7 ${escapeHtml2(latestDateKey)}</small><strong>${lastUsedPercentage}%</strong><span>${goalAchieved ? "\u{1F642}" : "\u{1F331}"} ${resultLabel}</span></div><div class="platform-voice-weekly-progress"><div><strong>${stars} of ${weeklyStarGoal} goal days</strong><small>This week \xB7 ${thisWeekPercentage == null ? "No data" : `${thisWeekPercentage}% within goal`}</small></div><div class="platform-voice-weekday-stars" aria-label="${stars} daily sound-goal stars this week">${weekdayStars}</div><p>${comparison}</p></div></section>${activityDetails}${editable ? `<details class="platform-voice-goal-settings"><summary>Adjust Sound Goals</summary><label>Award a daily star at <input type="number" min="50" max="100" step="1" value="${starGoal}" data-voice-star-goal>% within goal</label><label>Weekly goal <input type="number" min="1" max="5" step="1" value="${weeklyStarGoal}" data-voice-weekly-star-goal> successful days</label><p>Activity thresholds are selected automatically. Microphone sensitivity remains available in the Voice Meter.</p></details>` : ""}`;
}
function recordVoiceMeterUse() {
  if (!voiceMeterUsage?.count) {
    voiceMeterUsage = null;
    return;
  }
  const state = session.read();
  const classId = currentTeacherClass(state.teacherId)?.id;
  if (!classId) {
    voiceMeterUsage = null;
    return;
  }
  const history = readVoiceMeterHistory();
  history.unshift({ classId, usedAt: Date.now(), activityMode: voiceMeterUsage.activityMode, durationSeconds: Math.max(1, Math.round((Date.now() - voiceMeterUsage.startedAt) / 1e3)), detectedSeconds: voiceMeterUsage.detectedSeconds, goalSeconds: Math.round(voiceMeterUsage.goalMilliseconds / 1e3), loudSeconds: Math.round(voiceMeterUsage.loudMilliseconds / 1e3), average: Math.round(voiceMeterUsage.total / voiceMeterUsage.count), peak: voiceMeterUsage.peak });
  try {
    window.localStorage.setItem(VOICE_METER_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  } catch {
  }
  voiceMeterUsage = null;
}
function beginVoiceMeterUsage(activity = readVoiceMeterActivity()) {
  const now = Date.now();
  voiceMeterUsage = { startedAt: now, lastSampleAt: now, previousLevel: 0, activityMode: activity.key, target: activity.target, total: 0, count: 0, peak: 0, goalMilliseconds: 0, loudMilliseconds: 0, detectedSeconds: { "teacher-led": 0, independent: 0, collaborative: 0 } };
}
function segmentActiveVoiceMeter(activity) {
  if (!voiceMeterStream) return;
  recordVoiceMeterUse();
  beginVoiceMeterUsage(activity);
}
function readClassroomBobDisplay() {
  try {
    const setting = { placement: "move", earnMinutes: 5, dailyUnlockLimit: 6, ...JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DISPLAY_KEY) || "{}"), enabled: readClassroomBobDailyMenu().enabled };
    setting.earnMinutes = Math.min(30, Math.max(1, Number(setting.earnMinutes) || 5));
    setting.dailyUnlockLimit = Math.min(10, Math.max(1, Number(setting.dailyUnlockLimit) || 6));
    return setting;
  } catch {
    return { enabled: false, placement: "move", earnMinutes: 5, dailyUnlockLimit: 6 };
  }
}
function readClassroomBobDailyMenu() {
  const classId = currentDoNowClassId(), today = localBobRewardDate();
  try {
    const all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DAILY_MENU_KEY) || "{}");
    const saved = all[classId];
    return saved?.date === today ? { enabled: Boolean(saved.enabled), menuHidden: Boolean(saved.menuHidden) } : { enabled: false, menuHidden: true };
  } catch {
    return { enabled: false, menuHidden: true };
  }
}
function writeClassroomBobDailyMenu(state) {
  const classId = currentDoNowClassId();
  let all = {};
  try {
    all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DAILY_MENU_KEY) || "{}");
  } catch {
  }
  all[classId] = { date: localBobRewardDate(), enabled: Boolean(state.enabled), menuHidden: Boolean(state.menuHidden) };
  window.localStorage.setItem(CLASSROOM_BOB_DAILY_MENU_KEY, JSON.stringify(all));
}
function readClassroomBobUnlocks() {
  const classId = currentDoNowClassId();
  try {
    const all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_UNLOCK_KEY) || "{}");
    return Math.min(BOB_POSE_COUNT, Math.max(2, Number(all[classId]) || 2));
  } catch {
    return 2;
  }
}
function writeClassroomBobUnlocks(count) {
  const classId = currentDoNowClassId();
  let all = {};
  try {
    all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_UNLOCK_KEY) || "{}");
  } catch {
  }
  all[classId] = Math.min(BOB_POSE_COUNT, Math.max(2, count));
  window.localStorage.setItem(CLASSROOM_BOB_UNLOCK_KEY, JSON.stringify(all));
}
function localBobRewardDate() {
  const now = /* @__PURE__ */ new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function readClassroomBobDailyProgress() {
  const classId = currentDoNowClassId(), today = localBobRewardDate();
  try {
    const all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DAILY_KEY) || "{}");
    const saved = all[classId];
    return saved?.date === today ? { date: today, earned: Math.max(0, Number(saved.earned) || 0) } : { date: today, earned: 0 };
  } catch {
    return { date: today, earned: 0 };
  }
}
function writeClassroomBobDailyProgress(progress) {
  const classId = currentDoNowClassId();
  let all = {};
  try {
    all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DAILY_KEY) || "{}");
  } catch {
  }
  all[classId] = { date: localBobRewardDate(), earned: Math.max(0, Number(progress.earned) || 0) };
  window.localStorage.setItem(CLASSROOM_BOB_DAILY_KEY, JSON.stringify(all));
}
function updateBobRewardOutputs() {
  const setting = readClassroomBobDisplay(), progress = readClassroomBobDailyProgress();
  document.querySelectorAll("[data-bob-unlock-count]").forEach((output) => {
    output.textContent = String(readClassroomBobUnlocks());
  });
  document.querySelectorAll("[data-bob-daily-earned]").forEach((output) => {
    output.textContent = String(Math.min(progress.earned, setting.dailyUnlockLimit));
  });
  document.querySelectorAll("[data-bob-daily-limit-output]").forEach((output) => {
    output.textContent = String(setting.dailyUnlockLimit);
  });
}
function shuffledBobPoses(count) {
  const values = Array.from({ length: count }, (_, index) => index);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [values[index], values[target]] = [values[target], values[index]];
  }
  if (values.length > 1 && values[0] === floatingBobLastPose) [values[0], values[1]] = [values[1], values[0]];
  return values;
}
function nextUnlockedBobPose() {
  const unlocked = readClassroomBobUnlocks();
  floatingBobPoseBag = floatingBobPoseBag.filter((pose2) => pose2 < unlocked && pose2 !== floatingBobLastPose);
  if (!floatingBobPoseBag.length) floatingBobPoseBag = shuffledBobPoses(unlocked);
  const pose = floatingBobPoseBag.shift() ?? 0;
  floatingBobLastPose = pose;
  return pose;
}
function applyUnlockedBobPose(bobs, requestedPose = null) {
  const pose = requestedPose ?? nextUnlockedBobPose(), sheet = Math.floor(pose / 25) + 1, cell = pose % 25;
  const column = cell % 5, row = Math.floor(cell / 5);
  const imageUrl = new URL(`../../assets/images/characters/bob-unlocks-${String(sheet).padStart(2, "0")}.webp?v=232`, import.meta.url).href;
  bobs.forEach((bob) => {
    bob.classList.add("is-unlocked-pose");
    bob.style.setProperty("--bob-pose-sheet", `url("${imageUrl}")`);
    bob.style.setProperty("--bob-pose-x", `${column * 25}%`);
    bob.style.setProperty("--bob-pose-y", `${row * 25}%`);
  });
}
function updateBobUnlockProgress(meterState) {
  const now = Date.now();
  if (meterState !== "green") {
    floatingBobGreenSince = now;
    return;
  }
  const setting = readClassroomBobDisplay(), current = readClassroomBobUnlocks(), progress = readClassroomBobDailyProgress(), dailyLimit = Math.min(10, Math.max(1, Number(setting.dailyUnlockLimit) || 6)), required = Math.max(1, Number(setting.earnMinutes) || 5) * 6e4;
  if (progress.earned >= dailyLimit) {
    floatingBobGreenSince = now;
    return;
  }
  if (current >= BOB_POSE_COUNT || now - floatingBobGreenSince < required) return;
  writeClassroomBobUnlocks(current + 1);
  writeClassroomBobDailyProgress({ earned: progress.earned + 1 });
  floatingBobGreenSince = now;
  floatingBobPoseBag.push(current);
  floatingBobUnlockMessage = progress.earned + 1 >= dailyLimit ? `New Bob pose unlocked! Today\u2019s goal is complete: ${dailyLimit} of ${dailyLimit}.` : `New Bob pose unlocked! ${current + 1} of ${BOB_POSE_COUNT}.`;
  floatingBobUnlockMessageUntil = now + 6e3;
  updateBobRewardOutputs();
}
function scheduleNextBobMove() {
  if (floatingBobRoamingInterval !== null) window.clearTimeout(floatingBobRoamingInterval);
  const delay = Math.max(6e3, 28e3 - readClassroomBobUnlocks() * 110);
  floatingBobRoamingInterval = window.setTimeout(() => {
    relocateFloatingBob();
    scheduleNextBobMove();
  }, delay);
}
function classroomBobCorners(placement = readClassroomBobDisplay().placement) {
  if (placement === "top") return ["top-left", "top-right"];
  if (placement === "bottom") return ["bottom-left", "bottom-right"];
  return ["bottom-right", "top-left"];
}
function applyClassroomBobDisplay() {
  const setting = readClassroomBobDisplay();
  const corners = classroomBobCorners(setting.placement);
  floatingBobCornerIndex %= corners.length;
  const activeBobs = [];
  for (const documentRef of [document, classroomPresentationWindow?.document].filter(Boolean)) {
    documentRef.querySelectorAll(".platform-floating-voice-bob").forEach((bob) => {
      bob.hidden = !setting.enabled;
      bob.dataset.corner = corners[floatingBobCornerIndex];
      if (setting.enabled && bob.dataset.meterState === "green") activeBobs.push(bob);
    });
  }
  if (activeBobs.length) applyUnlockedBobPose(activeBobs);
}
function installClassroomDisplayChoices() {
  const tools = document.querySelector(".platform-live-lesson-tools");
  if (!tools) return;
  const thisScreen = tools.querySelector('[data-action="open-timer-display"]');
  const separateScreen = tools.querySelector('[data-action="open-classroom-presentation-window"]');
  if (thisScreen) thisScreen.textContent = "Present on This Screen";
  if (separateScreen) separateScreen.textContent = "Open Separate Classroom Screen";
  if (!tools.querySelector(".platform-classroom-bob-controls")) {
    const setting = readClassroomBobDisplay();
    const dailyMenu = readClassroomBobDailyMenu();
    const daily = readClassroomBobDailyProgress();
    tools.querySelector("#classroom-display-help")?.insertAdjacentHTML("beforebegin", `<fieldset class="platform-classroom-bob-controls" data-menu-hidden="${dailyMenu.menuHidden}"><legend>Bob on the classroom display</legend><label class="platform-classroom-bob-toggle"><input type="checkbox" data-classroom-bob-enabled${setting.enabled ? " checked" : ""}> Show Bob</label><label class="platform-classroom-bob-hide-menu"><input type="checkbox" data-classroom-bob-menu-hidden> <span data-classroom-bob-menu-label>${dailyMenu.menuHidden ? "Show menu" : "Hide menu"}</span></label><div class="platform-classroom-bob-settings"><label>Movement<select data-classroom-bob-placement><option value="move"${setting.placement === "move" ? " selected" : ""}>Bottom to top corner</option><option value="top"${setting.placement === "top" ? " selected" : ""}>Top corners only</option><option value="bottom"${setting.placement === "bottom" ? " selected" : ""}>Bottom corners only</option></select></label><label>Earn pose every <input type="number" min="1" max="30" value="${Number(setting.earnMinutes) || 5}" data-classroom-bob-earn-minutes> min</label><label>Daily limit <input type="number" min="1" max="10" value="${Math.min(10, Math.max(1, Number(setting.dailyUnlockLimit) || 6))}" data-classroom-bob-daily-limit></label><p><strong>Today: <output data-bob-daily-earned>${Math.min(daily.earned, setting.dailyUnlockLimit)}</output>/<output data-bob-daily-limit-output>${setting.dailyUnlockLimit}</output></strong></p><p><strong><output data-bob-unlock-count>${readClassroomBobUnlocks()}</output>/${BOB_POSE_COUNT}</strong> unlocked</p></div></fieldset>`);
  }
}
function readDoNowPosts() {
  try {
    return JSON.parse(window.localStorage.getItem(DO_NOW_POSTS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeDoNowPosts(posts) {
  window.localStorage.setItem(DO_NOW_POSTS_KEY, JSON.stringify(posts.slice(0, 40)));
}
function blankDoNowPost(classId = "") {
  return {
    id: `do-now-${Date.now()}`,
    classId,
    classIds: classId ? [classId] : [],
    title: "Today\u2019s Do Now",
    schedule: "class-start",
    weekday: (/* @__PURE__ */ new Date()).getDay(),
    date: "",
    animation: "top-left",
    backgroundType: "gradient",
    background1: "#fff4cf",
    background2: "#dceff4",
    image: "",
    boxes: [
      { id: "box-1", text: "Welcome! Read the prompt and get started.", color: "#12384d", size: 42, font: "Arial", bold: true, italic: false, underline: false, backgroundType: "gradient", background1: "#ffffff", background2: "#fff4cf" },
      { id: "box-2", text: "Write or sketch your first idea.", color: "#176b55", size: 30, font: "Verdana", bold: false, italic: false, underline: false, backgroundType: "solid", background1: "#ffffff", background2: "#ffffff" }
    ],
    savedAt: Date.now(),
    live: false
  };
}
function currentDoNowClassId() {
  const state = session.read();
  return currentTeacherClass(state.teacherId)?.id || state.classId || "class-preview-1";
}
function doNowCardMarkup(box, index, animation = "top-left") {
  const background = box.backgroundType === "gradient" ? `linear-gradient(135deg, ${box.background1}, ${box.background2})` : box.background1;
  return `<article class="platform-do-now-card" data-do-now-animation="${escapeHtml2(animation)}" style="--do-now-index:${index};--do-now-card-background:${escapeHtml2(background)};--do-now-text:${escapeHtml2(box.color)};--do-now-size:${Number(box.size)}px;--do-now-font:${escapeHtml2(box.font)};--do-now-weight:${box.bold ? "700" : "400"};--do-now-style:${box.italic ? "italic" : "normal"};--do-now-decoration:${box.underline ? "underline" : "none"}">${escapeHtml2(box.text).replaceAll("\n", "<br>")}</article>`;
}
function doNowPresentationMarkup(post, { controls = true } = {}) {
  const background = post.backgroundType === "gradient" ? `linear-gradient(135deg, ${post.background1}, ${post.background2})` : post.background1;
  return `<section class="platform-do-now-presentation" data-do-now-presentation style="--do-now-background:${escapeHtml2(background)}" role="dialog" aria-label="Do Now Post"><header><p>DO NOW</p><h2>${escapeHtml2(post.title)}</h2>${controls ? `<div><button type="button" data-action="edit-do-now">Edit</button><button type="button" data-action="hide-do-now">Hide</button></div>` : ""}</header><div class="platform-do-now-stage">${post.boxes.map((box, index) => doNowCardMarkup(box, index, post.animation || "top-left")).join("")}${post.image ? `<img src="${escapeHtml2(post.image)}" alt="Do Now visual">` : ""}</div></section>`;
}
function readLiveDoNow() {
  try {
    return JSON.parse(window.sessionStorage.getItem(DO_NOW_LIVE_KEY) || "null");
  } catch {
    return null;
  }
}
function syncDoNowPresentation(post = readLiveDoNow()) {
  for (const documentRef of [document, classroomPresentationWindow?.document].filter(Boolean)) {
    documentRef.querySelectorAll("#platform-student-timer-display > [data-do-now-presentation], #platform-second-window-display > [data-do-now-presentation], body > [data-do-now-presentation]").forEach((node) => node.remove());
    if (!post) continue;
    const host = documentRef.querySelector("#platform-student-timer-display") || documentRef.body;
    host.insertAdjacentHTML("beforeend", doNowPresentationMarkup(post, { controls: documentRef === document }));
    if (host.hidden) host.hidden = false;
  }
}
function showDoNow(post) {
  const live = { ...post, live: true };
  window.sessionStorage.setItem(DO_NOW_LIVE_KEY, JSON.stringify(live));
  syncDoNowPresentation(live);
}
function scheduledDoNowForClass(classId) {
  const now = /* @__PURE__ */ new Date();
  return readDoNowPosts().filter((post) => (post.classIds || [post.classId]).includes(classId) && post.schedule !== "manual").find((post) => post.schedule === "class-start" || post.schedule === "weekday" && Number(post.weekday) === now.getDay() || post.schedule === "date" && post.date === now.toISOString().slice(0, 10)) || null;
}
function doNowEditorMarkup(post) {
  post.classIds = post.classIds?.length ? post.classIds : [post.classId || currentDoNowClassId()];
  const state = session.read();
  const teacherClasses = getClassesForTeacher(state.teacherId);
  const classes2 = teacherClasses.length ? teacherClasses : [{ id: currentDoNowClassId(), periodLabel: "Current class", displayName: "Current class" }];
  const posts = readDoNowPosts().filter((item) => (item.classIds || [item.classId]).includes(currentDoNowClassId()));
  const classChoices = classes2.map((item) => `<label><input type="checkbox" data-do-now-class value="${escapeHtml2(item.id)}"${post.classIds.includes(item.id) ? " checked" : ""}> ${escapeHtml2(item.periodLabel)} \u2014 ${escapeHtml2(item.displayName)}</label>`).join("");
  const boxEditors = post.boxes.map((box, index) => `<fieldset class="platform-do-now-box-editor" data-do-now-box="${index}"><legend>Text box ${index + 1}</legend><textarea rows="3" data-do-now-field="text">${escapeHtml2(box.text)}</textarea><div class="platform-do-now-format-row"><label>Text color<input type="color" data-do-now-field="color" value="${escapeHtml2(box.color)}"></label><label>Size<input type="range" min="18" max="72" data-do-now-field="size" value="${Number(box.size)}"><output>${Number(box.size)} px</output></label><label>Font<select data-do-now-field="font">${["Arial", "Verdana", "Courier New", "Comic Sans MS"].map((font) => `<option${font === box.font ? " selected" : ""}>${font}</option>`).join("")}</select></label><button type="button" data-action="do-now-toggle-format" data-format="bold" aria-pressed="${box.bold}"><b>B</b></button><button type="button" data-action="do-now-toggle-format" data-format="italic" aria-pressed="${box.italic}"><i>I</i></button><button type="button" data-action="do-now-toggle-format" data-format="underline" aria-pressed="${box.underline}"><u>U</u></button></div><div class="platform-do-now-format-row"><label>Text box background<select data-do-now-field="backgroundType"><option value="solid"${box.backgroundType === "solid" ? " selected" : ""}>Solid color</option><option value="gradient"${box.backgroundType === "gradient" ? " selected" : ""}>Gradient</option></select></label><label>Color 1<input type="color" data-do-now-field="background1" value="${box.background1}"></label><label>Color 2<input type="color" data-do-now-field="background2" value="${box.background2}"></label><button type="button" data-action="remove-do-now-box"${post.boxes.length < 2 ? " disabled" : ""}>Remove</button></div></fieldset>`).join("");
  return `<div class="platform-do-now-editor" data-do-now-editor role="dialog" aria-modal="true" aria-labelledby="do-now-editor-title"><div class="platform-do-now-editor-panel"><header><div><p class="platform-command-label">Start-of-class display</p><h2 id="do-now-editor-title">Do Now Post</h2></div><button type="button" data-action="close-do-now-editor">\xD7</button></header><div class="platform-do-now-editor-grid"><section class="platform-do-now-controls"><label>Post title<input data-do-now-root-field="title" value="${escapeHtml2(post.title)}"></label><fieldset class="platform-do-now-class-list"><legend>Use this post in</legend>${classChoices}</fieldset><label>Animation<select data-do-now-root-field="animation"><option value="top-left"${(post.animation || "top-left") === "top-left" ? " selected" : ""}>Top to bottom and left to right</option><option value="bottom-right"${post.animation === "bottom-right" ? " selected" : ""}>Bottom to top and right to left</option><option value="fade"${post.animation === "fade" ? " selected" : ""}>Fade only</option><option value="none"${post.animation === "none" ? " selected" : ""}>No animation</option></select></label><div class="platform-do-now-format-row"><label>Post background<select data-do-now-root-field="backgroundType"><option value="solid"${post.backgroundType === "solid" ? " selected" : ""}>Solid color</option><option value="gradient"${post.backgroundType === "gradient" ? " selected" : ""}>Gradient</option></select></label><label>Color 1<input type="color" data-do-now-root-field="background1" value="${post.background1}"></label><label>Color 2<input type="color" data-do-now-root-field="background2" value="${post.background2}"></label></div>${boxEditors}<button type="button" data-action="add-do-now-box">+ Add Text Box</button><div class="platform-do-now-image-drop" tabindex="0">Paste an image here (Ctrl/Command + V), or <label>choose an image<input type="file" accept="image/*" data-do-now-image hidden></label>${post.image ? `<img src="${escapeHtml2(post.image)}" alt="Pasted Do Now visual"><button type="button" data-action="remove-do-now-image">Remove image</button>` : ""}</div><fieldset><legend>When should it appear?</legend><label><input type="radio" name="doNowSchedule" value="class-start"${post.schedule === "class-start" ? " checked" : ""}> At the beginning of every class</label><label><input type="radio" name="doNowSchedule" value="weekday"${post.schedule === "weekday" ? " checked" : ""}> On weekday <select data-do-now-root-field="weekday">${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => `<option value="${index}"${Number(post.weekday) === index ? " selected" : ""}>${day}</option>`).join("")}</select></label><label><input type="radio" name="doNowSchedule" value="date"${post.schedule === "date" ? " checked" : ""}> On date <input type="date" data-do-now-root-field="date" value="${post.date || ""}"></label><label><input type="radio" name="doNowSchedule" value="manual"${post.schedule === "manual" ? " checked" : ""}> Show only when I choose</label></fieldset><div class="platform-do-now-actions"><button type="button" data-action="save-do-now">Save Post</button><button type="button" data-action="show-do-now">Save & Show Now</button><button type="button" data-action="copy-do-now">Copy Post</button><button type="button" data-action="hide-do-now">Hide from Class</button></div><label>Saved posts<select data-do-now-saved><option value="">Choose a saved post</option>${posts.map((item) => `<option value="${item.id}"${item.id === post.id ? " selected" : ""}>${escapeHtml2(item.title)}</option>`).join("")}</select></label><button type="button" data-action="load-do-now">Open Saved Post</button><button type="button" data-action="delete-do-now">Delete Saved Post</button><p data-do-now-status role="status">Changes appear in the preview immediately.</p></section><section class="platform-do-now-preview"><h3>Live preview</h3>${doNowPresentationMarkup(post, { controls: false })}</section></div></div></div>`;
}
function openDoNowEditor(post = null) {
  doNowDraft = structuredClone(post || blankDoNowPost(currentDoNowClassId()));
  if (doNowDraft.animation === "bottom-right") doNowDraft.animation = "top-left";
  document.querySelector("[data-do-now-editor]")?.remove();
  root.insertAdjacentHTML("beforeend", doNowEditorMarkup(doNowDraft));
  document.querySelector('[data-do-now-root-field="animation"] option[value="bottom-right"]')?.remove();
}
function updateDoNowDraftFromEditor(editor) {
  if (!doNowDraft || !editor) return;
  editor.querySelectorAll("[data-do-now-root-field]").forEach((field) => {
    doNowDraft[field.dataset.doNowRootField] = field.type === "range" ? Number(field.value) : field.value;
  });
  doNowDraft.schedule = editor.querySelector('[name="doNowSchedule"]:checked')?.value || "manual";
  doNowDraft.classIds = [...editor.querySelectorAll("[data-do-now-class]:checked")].map((input) => input.value);
  editor.querySelectorAll("[data-do-now-box]").forEach((fieldset) => {
    const box = doNowDraft.boxes[Number(fieldset.dataset.doNowBox)];
    fieldset.querySelectorAll("[data-do-now-field]").forEach((field) => {
      box[field.dataset.doNowField] = field.type === "range" ? Number(field.value) : field.value;
    });
  });
  const preview = editor.querySelector(".platform-do-now-preview");
  if (preview) preview.innerHTML = `<h3>Live preview</h3>${doNowPresentationMarkup(doNowDraft, { controls: false })}`;
  if (readLiveDoNow()) showDoNow(doNowDraft);
}
function saveDoNowDraft(show = false) {
  const editor = document.querySelector("[data-do-now-editor]");
  updateDoNowDraftFromEditor(editor);
  if (!doNowDraft.classIds?.length) {
    const status2 = editor?.querySelector("[data-do-now-status]");
    if (status2) status2.textContent = "Choose at least one class for this post.";
    return;
  }
  doNowDraft.classId = doNowDraft.classIds[0];
  doNowDraft.savedAt = Date.now();
  const posts = readDoNowPosts().filter((item) => item.id !== doNowDraft.id);
  posts.unshift(structuredClone(doNowDraft));
  writeDoNowPosts(posts);
  if (show) showDoNow(doNowDraft);
  const status = editor?.querySelector("[data-do-now-status]");
  if (status) status.textContent = show ? "Saved and showing on the classroom display now." : "Do Now Post saved for this class.";
}
function currentClassPlanMarkup(classId, teacherId) {
  const resourceState = classResourceSharing.read(classId);
  const resources = resourceState.audienceRows.flatMap((row) => row.resources).filter(Boolean);
  const uniqueResources = [...new Map(resources.map((item) => [item.id || `${item.type}-${item.title}`, item])).values()];
  const access = [...new Set(uniqueResources.map((item) => item.type))];
  const effectiveTimerSchedule = classTimerSchedule.readEffective();
  const timer = currentScheduledLessonTimerState();
  const memo = teacherMemo.read();
  const latestBoard = readWhiteboardLibrary().filter((board) => board.classId === classId || board.classId === "all").sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))[0];
  const voiceActivity = readVoiceMeterActivity();
  const voiceDisplayMode = readVoiceMeterDisplayMode();
  const voiceIsOn = Boolean(voiceMeterStream);
  const liveVoiceBody = `<div class="platform-current-plan-live-voice" data-voice-display-mode="${voiceDisplayMode}"><div class="platform-live-voice-heading"><strong data-voice-prediction>${predictedLearningType(0).icon} ${predictedLearningType(0).label}</strong><small>Goal: ${escapeHtml2(voiceActivity.label)}</small></div><p class="platform-live-voice-status" data-live-voice-status data-state="${voiceIsOn ? "on" : "off"}"><span aria-hidden="true"></span> Voice Meter is ${voiceIsOn ? "on and listening" : "off"}</p><div class="platform-voice-meter" data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%; --voice-threshold: ${voiceActivity.target}%"><div class="platform-voice-meter-scale" aria-hidden="true"><span>Ready</span><span>Close</span><span>Too loud</span></div><div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span><i class="platform-voice-threshold-marker" title="Expected threshold"></i></div><p><strong data-voice-meter-output>0</strong><span aria-hidden="true"> / 100</span></p></div><label>Meter view<select data-voice-meter-display-mode><option value="basic"${voiceDisplayMode === "basic" ? " selected" : ""}>Basic volume</option><option value="prediction"${voiceDisplayMode === "prediction" ? " selected" : ""}>Predicted learning type + threshold</option></select></label><div class="platform-live-voice-actions"><button type="button" data-action="voice-meter-start"${voiceIsOn ? " disabled" : ""}>Turn Voice Meter On</button><button type="button" data-action="voice-meter-stop"${voiceIsOn ? "" : " disabled"}>Turn Off</button><button type="button" data-action="open-voice-meter-display">Open Class View</button></div></div>`;
  const presentationToolControls = `<details class="platform-more-classroom-tools platform-more-classroom-tools-standalone"><summary>More Classroom Tools</summary><div class="platform-live-lesson-tools" aria-labelledby="live-lesson-tools-title"><p class="platform-command-label" id="live-lesson-tools-title">Additional tools</p><div class="platform-live-lesson-tool-buttons"><button type="button" data-action="open-timer-display">Present on This Screen</button><button type="button" data-action="open-amig-anchor-chart">AMIG Anchor Chart</button><button type="button" data-action="open-do-now-editor">Do Now Post</button><button type="button" data-action="open-name-picker-display">Name Picker</button><button type="button" data-action="open-timer-popout">Floating Timer</button></div><p id="classroom-display-help" class="platform-live-lesson-tool-help">Classroom Display opens a separate student-facing window for a projector or smartboard.</p><p data-classroom-window-status role="status"></p></div></details>`;
  const timerVisual = effectiveTimerSchedule.pomodoroEnabled ? presentationTimerVisualState(timer) : currentTimerVisualState(timer);
  const timerPhase = timerVisual.active ? timerVisual.phase : null;
  const timerBody = `<div class="platform-current-plan-timer-widget" data-class-timer-kind="${effectiveTimerSchedule.pomodoroEnabled ? "pomodoro" : "standard"}"><div class="platform-current-plan-timer-wheel" data-timer-ring data-active-phases="${timerPhase ? "true" : "false"}" style="${timerRingStyle(timerVisual)}"><output data-timer-remaining data-timer-phase-color="${timerPhase?.color ?? "default"}">${formatLessonTime(timer.remainingSeconds)}</output></div><div class="platform-current-plan-timer-details"><strong data-timer-phase-name>${escapeHtml2(timerPhase?.name ?? "Class Timer")}</strong><span data-current-plan-timer>${escapeHtml2(timer.status)} \xB7 ${formatLessonTime(timer.remainingSeconds)}</span><small data-current-plan-timer-mode>${effectiveTimerSchedule.pomodoroEnabled ? "Class Pomodoro Timer \xB7 phases are active." : "Standard class timer."}</small></div><div class="platform-current-plan-timer-controls" aria-label="Live timer controls"><button type="button" data-action="timer-subtract-minute">\u2212 1 min</button><button type="button" data-action="timer-add-minute">+ 1 min</button><button type="button" data-action="timer-start-or-resume">Start</button><button type="button" data-action="timer-pause">Pause</button><button type="button" data-action="timer-end">End</button><button type="button" data-action="timer-reset">Reset</button></div></div>`;
  const card = (key, title, body, className = "", actionLabel = "Edit", live = false, editAction = "open-current-plan-editor") => `<article class="${className}" data-plan-card="${key}"${live ? ` data-live="true"` : ""}><button type="button" class="platform-current-plan-card-title" data-action="${editAction}" data-current-plan-editor="${key}">${title}<span aria-hidden="true">${actionLabel} \u203A</span></button>${body}</article>`;
  const lessonDetails = `<details class="platform-current-plan-details"><summary>View Lesson Details and Live Status</summary><div class="platform-current-plan-grid">${card("activities", "Assigned activities", `<p class="platform-current-plan-status">${uniqueResources.length ? uniqueResources.map((item) => escapeHtml2(item.title)).join(" \u2022 ") : "Not set"}</p>`, "platform-current-plan-textured", "Edit", uniqueResources.length > 0)}${card("access", "Students can work in", `<p class="platform-current-plan-status">${access.length ? access.map(escapeHtml2).join(" \u2022 ") : "Not set"}</p>`, "platform-current-plan-textured", "Edit", access.length > 0)}${card("message", "Current message", `<p class="platform-current-plan-status">${memo.text ? escapeHtml2(memo.text) : "Not set"}</p>`, "platform-current-plan-textured", "Edit", Boolean(memo.text))}${card("whiteboard", "Latest whiteboard", `${latestBoard ? `<img src="${escapeHtml2(latestBoard.displayImage || latestBoard.image)}" alt="Thumbnail of ${escapeHtml2(latestBoard.title)}"><p>${escapeHtml2(latestBoard.title)} \xB7 ${new Date(latestBoard.savedAt).toLocaleDateString()}</p>` : `<p>No saved whiteboard history yet.</p>`}`, "platform-current-plan-whiteboard platform-current-plan-textured")}${card("voice", "Live Voice Meter", liveVoiceBody, "platform-current-plan-live-voice-card", "History", voiceIsOn)}</div></details>`;
  return `<div id="teacher-live-lesson-dashboard" class="platform-current-class-plan-stack"><section class="platform-current-class-plan platform-current-class-plan-compact" aria-label="Run today\u2019s class controls">${lessonDetails}${presentationToolControls}<div class="platform-current-plan-featured">${card("timer", "Today\u2019s Class Timer", timerBody, "platform-current-plan-timer-card", "Edit Schedule", timer.status === LESSON_TIMER_STATES.RUNNING || timer.status === LESSON_TIMER_STATES.PAUSED, "open-class-schedule-quick")}</div><div class="platform-current-plan-modal" data-current-plan-modal data-current-class-id="${escapeHtml2(classId)}" data-current-teacher-id="${escapeHtml2(teacherId)}" hidden><div class="platform-current-plan-modal-backdrop" data-action="close-current-plan-editor"></div><section role="dialog" aria-modal="true" aria-labelledby="current-plan-editor-title"><header><h3 id="current-plan-editor-title">Quick edit</h3><button type="button" data-action="close-current-plan-editor" aria-label="Close quick editor">\xD7</button></header><div data-current-plan-editor-content></div><button class="platform-return-current-plan" type="button" data-action="return-current-plan">Return to Today\u2019s Class Plan</button></section></div></section></div>`;
}
function currentClassPlanEditorMarkup(category, classId, teacherId) {
  const resourceState = classResourceSharing.read(classId);
  const resourceEntries = resourceState.audienceRows.flatMap((row) => row.resources.map((resource, index) => resource ? { resource, row, index } : null).filter(Boolean));
  const memo = teacherMemo.read();
  const timer = lessonTimer.read();
  const boards = readWhiteboardLibrary().filter((board) => board.classId === classId || board.classId === "all").sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0));
  const history = readVoiceMeterHistory();
  const classes2 = getClassesForTeacher(teacherId);
  if (category === "activities") return `<p>Uncheck an activity to remove it from the live student tray.</p><div class="platform-current-plan-editor-list">${resourceEntries.length ? resourceEntries.map(({ resource, row, index }) => `<label><input type="checkbox" data-current-plan-resource-toggle data-resource-row-id="${escapeHtml2(row.id)}" data-resource-index="${index}" checked><span><strong>${escapeHtml2(resource.title)}</strong><small>${escapeHtml2(resource.type)} \xB7 ${escapeHtml2(row.audienceType === "whole-class" ? "Whole class" : row.audienceLabel || "Selected students")}</small></span></label>`).join("") : `<p>No activities are currently assigned.</p>`}</div><button type="button" data-action="current-plan-open-resources">Add or reorganize activities</button>`;
  if (category === "access") return `<p>Student access is created automatically from the resources you assign.</p><div class="platform-current-plan-editor-list">${resourceEntries.length ? resourceEntries.map(({ resource, row }) => `<p><strong>${escapeHtml2(resource.type)}</strong><br>${escapeHtml2(resource.title)} \xB7 ${escapeHtml2(row.audienceType === "whole-class" ? "Whole class" : row.audienceLabel || "Selected students")}</p>`).join("") : `<p>No student resources are live.</p>`}</div><button type="button" data-action="current-plan-open-resources">Change resource access</button>`;
  if (category === "message") return `<label class="platform-current-plan-message">Message shown to students<textarea maxlength="${TEACHER_MEMO_MAX_CHARACTERS}" data-current-plan-message>${escapeHtml2(memo.text)}</textarea></label><div class="platform-current-plan-editor-actions"><button type="button" data-action="save-current-plan-message">Save Message</button><button type="button" data-action="clear-current-plan-message">Clear Message</button><button type="button" data-action="open-message-board-quick">Formatting and saved messages</button></div><p data-current-plan-editor-status role="status"></p>`;
  if (category === "timer") return `<p class="platform-current-plan-timer-large" data-current-plan-timer>${escapeHtml2(timer.status)} \xB7 ${formatLessonTime(timer.remainingSeconds)}</p><div class="platform-current-plan-editor-actions"><button type="button" data-action="timer-start">Start</button><button type="button" data-action="timer-pause">Pause</button><button type="button" data-action="timer-resume">Resume</button><button type="button" data-action="timer-subtract-minute">\u2212 1 minute</button><button type="button" data-action="timer-add-minute">+ 1 minute</button><button type="button" data-action="timer-reset">Reset</button></div><button type="button" data-action="open-today-timer-tools">Open full timer settings</button>`;
  if (category === "whiteboard") return `${boards[0] ? `<img class="platform-current-plan-editor-board" src="${escapeHtml2(boards[0].displayImage || boards[0].image)}" alt="Latest saved whiteboard"><p><strong>${escapeHtml2(boards[0].title)}</strong> \xB7 saved ${new Date(boards[0].savedAt).toLocaleString()}</p>` : `<p>No saved whiteboard is available yet.</p>`}<button type="button" data-action="open-whiteboard">Open Whiteboard</button>`;
  const classHistory = history.filter((item) => item.classId === classId).slice(0, 5);
  return `<p>The meter estimates classroom sound patterns only. It cannot identify a speaker and never records audio.</p>${voiceActivitySummary(history, classId)}<div class="platform-current-plan-editor-list">${classHistory.length ? classHistory.map((item) => `<p><strong>${new Date(item.usedAt).toLocaleDateString()}</strong><br>${escapeHtml2(VOICE_METER_ACTIVITIES.find((activity) => activity.key === item.activityMode)?.label || "Classroom sound session")} \xB7 ${Math.ceil(item.durationSeconds / 60)} min \xB7 ${(soundGoalPercentage([item]) ?? 0) >= readVoiceMeterStarGoal() ? "\u{1F642} Goal achieved" : "Louder than expected"}</p>`).join("") : `<p>No voice-meter sessions have been saved yet.</p>`}</div><label>Compare with another class<select data-class-plan-comparison><option value="">Choose a class</option>${classes2.filter((item) => item.id !== classId).map((item) => `<option value="${escapeHtml2(item.id)}">${escapeHtml2(item.periodLabel)} \u2014 ${escapeHtml2(item.displayName)}</option>`).join("")}</select></label>`;
}
function refreshCurrentClassPlan() {
  const current = document.querySelector(".platform-current-class-plan-stack");
  const state = session.read();
  const classId = currentTeacherClass(state.teacherId)?.id;
  if (current && classId) current.outerHTML = currentClassPlanMarkup(classId, state.teacherId);
}
function closeCurrentClassPlanEditor() {
  const modal = document.querySelector("[data-current-plan-modal]");
  if (modal) modal.hidden = true;
}
function whiteboardScheduleLabel(board) {
  if (board.scheduleType === "date" && board.date) {
    const [year, month, day] = board.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? board.date : date.toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" });
  }
  if (board.scheduleType === "weekly" && board.day && board.day !== "any") return `Every ${board.day}`;
  return "No schedule";
}
function scheduledWhiteboardFor(classId, occurrence, now = /* @__PURE__ */ new Date()) {
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return readWhiteboardLibrary().find((board) => board.studentDisplay === true && (board.classId === "all" || board.classId === classId) && (board.scheduleType === "weekly" && board.day === occurrence.weekday || board.scheduleType === "date" && board.date === localDate)) ?? null;
}
function currentRoute() {
  return window.location.hash.replace(/^#/, "").replace(/\/$/, "") || ROUTES.WELCOME;
}
function navigate(route, { replace = false } = {}) {
  const nextHash = `#${route}`;
  if (replace) {
    window.location.replace(nextHash);
  } else if (window.location.hash === nextHash) {
    render();
  } else {
    window.location.hash = route;
  }
}
function guardRoute(route, state) {
  const isTeacherRoute = route.startsWith("/teacher/");
  const isStudentRoute = route.startsWith("/student/");
  if (state.role === PLATFORM_ROLES.TEACHER && isStudentRoute) return ROUTES.TEACHER_DASHBOARD;
  if (state.role === PLATFORM_ROLES.STUDENT && isTeacherRoute) return ROUTES.STUDENT_DASHBOARD;
  if (route === ROUTES.TEACHER_DASHBOARD && state.role !== PLATFORM_ROLES.TEACHER) return ROUTES.TEACHER_LOGIN;
  if (route === ROUTES.TEACHER_CLASSES && state.role !== PLATFORM_ROLES.TEACHER) return ROUTES.TEACHER_LOGIN;
  if (route === ROUTES.STUDENT_DASHBOARD && state.role !== PLATFORM_ROLES.STUDENT) return ROUTES.STUDENT_ENTRY;
  if (route === ROUTES.STUDENT_ROSTER && !state.pendingClassId) return ROUTES.STUDENT_ENTRY;
  if (route === ROUTES.STUDENT_IDENTIFIER && (!state.pendingClassId || !state.pendingStudentId)) {
    return state.pendingClassId ? ROUTES.STUDENT_ROSTER : ROUTES.STUDENT_ENTRY;
  }
  return route;
}
function escapeHtml2(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function readTeacherAssignedResearch(classId) {
  try {
    const all = JSON.parse(window.localStorage.getItem(TEACHER_ASSIGNED_RESEARCH_KEY) || "{}");
    const saved = all[classId] || {};
    return { topic: String(saved.topic || ""), links: Array.isArray(saved.links) ? saved.links.slice(0, 6) : [] };
  } catch {
    return { topic: "", links: [] };
  }
}
function writeTeacherAssignedResearch(classId, research) {
  const all = (() => {
    try {
      return JSON.parse(window.localStorage.getItem(TEACHER_ASSIGNED_RESEARCH_KEY) || "{}");
    } catch {
      return {};
    }
  })();
  all[classId] = research;
  window.localStorage.setItem(TEACHER_ASSIGNED_RESEARCH_KEY, JSON.stringify(all));
}
function teacherAssignedResearchLinksText(research) {
  return research.links.map((link) => `${link.title} | ${link.url}`).join("\n");
}
function parseTeacherAssignedResearchLinks(value) {
  const links = [];
  for (const line of String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 6)) {
    const separator = line.indexOf("|"), title = separator >= 0 ? line.slice(0, separator).trim() : "Approved research resource", rawUrl = (separator >= 0 ? line.slice(separator + 1) : line).trim();
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== "https:") throw new Error();
      links.push({ title: title.slice(0, 80) || "Approved research resource", url: url.href });
    } catch {
      return { ok: false, reason: `Check this link: ${rawUrl}` };
    }
  }
  return { ok: true, links };
}
function readTeacherResearchLinkBank() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(TEACHER_RESEARCH_LINK_BANK_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((group) => group?.id && group?.title && Array.isArray(group.links)).slice(0, 24) : [];
  } catch {
    return [];
  }
}
function writeTeacherResearchLinkBank(groups) {
  window.localStorage.setItem(TEACHER_RESEARCH_LINK_BANK_KEY, JSON.stringify(groups.slice(0, 24)));
}
function teacherResearchLinkBankMarkup(groups, assignedResearch) {
  if (!groups.length) return `<p class="platform-research-bank-empty">No saved link groups yet. Create one below for a topic you expect to use again.</p>`;
  return groups.map((group) => {
    const isAssigned = group.title === assignedResearch.topic && group.links.length === assignedResearch.links.length && group.links.every((link, index) => link.url === assignedResearch.links[index]?.url);
    return `<article class="platform-research-bank-card">
      <div><h4>${escapeHtml2(group.title)}</h4>${group.topic ? `<p>${escapeHtml2(group.topic)}</p>` : ""}<small>${group.links.length} approved link${group.links.length === 1 ? "" : "s"}</small></div>
      <ul>${group.links.map((link) => `<li><a href="${escapeHtml2(link.url)}" target="_blank" rel="noopener">${escapeHtml2(link.title)}</a></li>`).join("")}</ul>
      <div class="platform-actions"><button type="button" data-action="assign-research-bank-group" data-research-group-id="${escapeHtml2(group.id)}"${isAssigned ? " disabled" : ""}>${isAssigned ? "Assigned to This Class" : "Assign to This Class"}</button><button type="button" data-action="delete-research-bank-group" data-research-group-id="${escapeHtml2(group.id)}">Delete Group</button></div>
    </article>`;
  }).join("");
}
function memoSegmentsMarkup(state) {
  const segments = state.segments?.length ? state.segments : [{ text: state.text, color: state.color, size: state.size, style: state.style }];
  return segments.map((segment) => `<span data-memo-color="${segment.color}" data-memo-size="${segment.size}" data-memo-style="${segment.style}">${escapeHtml2(segment.text)}</span>`).join("");
}
function currentEvidenceActivity() {
  return todaysMission.read().title || PILOT_ACTIVITY;
}
function currentTeacherClass(teacherId) {
  if (productionIdentityConfig.enabled && productionTeacherClasses.length) {
    const selected2 = window.sessionStorage.getItem(PRODUCTION_CURRENT_CLASS_KEY);
    return productionTeacherClasses.find((item) => item.id === selected2) ?? productionTeacherClasses[0];
  }
  const classes2 = getClassesForTeacher(teacherId);
  const selected = classSetupProfiles.read().currentClassId;
  return classes2.find((item) => item.id === selected) ?? classes2[0] ?? getClassForTeacher(teacherId);
}
function preserveCurrentClassSetup(classId) {
  if (!classId) return;
  const current = classSetupProfiles.profile(classId) ?? {};
  classSetupProfiles.save(classId, { ...current, schedule: classTimerSchedule.read(), memo: teacherMemo.read(), mission: todaysMission.read() });
}
function classReadiness(classId) {
  return { mission: "previous", timer: "saved", safeguards: "saved", ...classSetupProfiles.profile(classId)?.readiness ?? {} };
}
function automaticGoalsForClass(classId) {
  const classRecord = getClassById(classId);
  const resources = classResourceSharing.read(classId).audienceRows.flatMap((row) => row.resources);
  const goals = [];
  if (resources.some((item) => /design a space bedroom/i.test(item?.title))) goals.push("Build a Shelter");
  resources.forEach((item) => {
    if (item?.title && !/design a space bedroom/i.test(item.title)) goals.push(`Complete and reflect on ${item.title}`);
  });
  if (!goals.length && Number(classRecord?.grade || 5) === 5) goals.push("Build a Shelter");
  return [...new Set(goals)].slice(0, 6);
}
function iCanGoal(goal) {
  const text = String(goal || "").trim().replace(/[.]+$/, "");
  if (!text) return "";
  if (/^I can\b/i.test(text)) return `${text}.`;
  return `I can ${text.charAt(0).toLowerCase()}${text.slice(1)}.`;
}
function suggestedClassTimeline(classId) {
  const profile = classSetupProfiles.profile(classId) ?? {};
  const duration = Math.max(15, Number(profile.schedule?.durationMinutes || classTimerSchedule.read().durationMinutes) || 45);
  const launch = Math.max(3, Math.round(duration * 0.15));
  const reflect = Math.max(5, Math.round(duration * 0.2));
  const work = Math.max(5, duration - launch - reflect);
  return `${launch} min launch \xB7 ${work} min work time \xB7 ${reflect} min reflection`;
}
function todaysGoalInputsMarkup(classId) {
  const profile = classSetupProfiles.profile(classId) ?? {};
  const automatic = automaticGoalsForClass(classId);
  const goals = (profile.todayGoalsMode === "custom" ? profile.todayGoals ?? [] : automatic).map(iCanGoal).filter(Boolean);
  return `<div class="platform-quick-goals" data-quick-goals data-goals-mode="${profile.todayGoalsMode === "custom" ? "custom" : "automatic"}"><div><h4>Today\u2019s \u201CI Can\u201D Goals</h4><p>${profile.todayGoalsMode === "custom" ? "Teacher-edited student goals" : "Suggested automatically from the class grade, mission goal, and selected activities"}</p><p class="platform-quick-goals-timeline"><strong>Suggested timeline:</strong> ${escapeHtml2(suggestedClassTimeline(classId))}</p></div><div data-quick-goal-list>${goals.length ? goals.map((goal, index) => `<label>I Can Goal ${index + 1}<span><input name="todayGoal" maxlength="90" value="${escapeHtml2(goal)}"><button type="button" data-action="delete-quick-goal" aria-label="Delete I Can goal ${index + 1}">Delete</button></span></label>`).join("") : `<p data-no-quick-goals>No goal is currently assigned.</p>`}</div><button type="button" data-action="add-quick-goal">+ Add an I Can Goal</button></div>`;
}
function blankClassSchedule() {
  return { enabled: false, weekdays: [...WEEKDAYS], startTime: "08:00", durationMinutes: 45, timeZone: "America/New_York", yellowSound: "Bird Chirping", redSound: "Cardinal", endSound: "Choir \u2014 Heavenly Transition", pomodoroEnabled: false, phases: recommendedTimerPhases(45) };
}
function activateClassSetup(classId) {
  const profile = classSetupProfiles.profile(classId);
  classTimerSchedule.save(profile?.schedule ?? blankClassSchedule());
  if (profile?.memo?.text) teacherMemo.save(profile.memo.text, profile.memo);
  else teacherMemo.clear();
  if (profile?.mission?.title) todaysMission.save(profile.mission);
  else todaysMission.clear();
  if (!profile) preserveCurrentClassSetup(classId);
}
function ensureClassSetupProfile(classId) {
  if (classId && !classSetupProfiles.profile(classId)) preserveCurrentClassSetup(classId);
}
var TEACHER_WEBPAGE_CATALOG = Object.freeze([
  { category: "Missions", title: "STEM Missions Home", detail: "Main starting page for the STEM Missions website.", url: "https://sites.google.com/ravennaschools.us/steminbobwarts/home-start" },
  { category: "Grade Hubs", title: "Grade 3/4 Mission Hub", detail: "Activity library page for Grade 3 and Grade 4 classes.", url: "https://sites.google.com/ravennaschools.us/steminbobwarts/grade-34" },
  { category: "Grade Hubs", title: "Grade 5/6 Mission Hub", detail: "Activity library page for Grade 5 and Grade 6 classes.", url: "https://sites.google.com/ravennaschools.us/steminbobwarts/grade-5" },
  { category: "Tools", title: "STEM Builder", detail: "Open the THINKamigBOB design-and-build workspace.", url: "../index.html" }
]);
function classSetupSharingMarkup(teacherId, location) {
  const classes2 = getClassesForTeacher(teacherId);
  const current = currentTeacherClass(teacherId);
  return `<section class="platform-class-setup-sharing${location === "manage" ? " platform-manage-step" : ""}" data-class-sharing-location="${location}"${location === "manage" ? ' data-manage-step="3"' : ""} aria-labelledby="class-sharing-${location}">
    ${location === "manage" ? `<div class="platform-manage-step-heading"><span aria-hidden="true">3</span><div>` : ""}<p class="platform-command-label">Reuse classroom settings</p>
    <h3 id="class-sharing-${location}">Share Classroom Setup</h3>
    ${location === "manage" ? `<p>Save time by copying only the settings you choose.</p></div></div>` : ""}
    <label>Current class<select data-current-teacher-class>${classes2.map((item) => `<option value="${item.id}"${item.id === current?.id ? " selected" : ""}>${escapeHtml2(item.periodLabel)} \u2014 ${escapeHtml2(item.displayName)}</option>`).join("")}</select></label>
    <fieldset><legend>Apply to</legend>${classes2.filter((item) => item.id !== current?.id).map((item) => `<label><input type="checkbox" data-class-setup-target value="${item.id}"> ${escapeHtml2(item.periodLabel)} \u2014 ${escapeHtml2(item.displayName)}</label>`).join("")}<label><input type="checkbox" data-class-setup-all> All other classes</label></fieldset>
    <fieldset><legend>Copy only</legend><label><input type="checkbox" data-class-setup-component="timer" checked> Timer schedule, Pomodoro phases, and sounds</label><label><input type="checkbox" data-class-setup-component="memo" checked> Teacher Memo and presentation formatting</label><label><input type="checkbox" data-class-setup-component="resources" checked> Today\u2019s resource slots and audiences</label><label><input type="checkbox" data-class-setup-component="reflection" checked> What I Learned Today Requirement</label></fieldset>
    <button type="button" data-action="apply-class-setup">Apply Selected Setup</button>
    <p data-class-setup-status role="status" aria-live="polite">Nothing is copied until you confirm.</p>
    ${location === "manage" ? `<a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">\u2190 Back to Today</a>` : ""}
  </section>`;
}
function classResourceTeacherMarkup(classId) {
  const state = classResourceSharing.read(classId);
  const roster = getRosterForClass(classId);
  const prepared = state.prepared ?? { title: "", type: "Mission Activity", url: "", release: "manual" };
  const pickerOpen = ["Mission Activity", "Side Path", "Webpage"].includes(prepared.type);
  const releaseLabels = { manual: "Push manually", "class-start": "At class start", purple: "Blue starter phase", green: "Green main activity", yellow: "Gold five-minute warning", red: "Red cleanup or exit" };
  const groupRows = state.audienceRows.filter((row) => ["teacher-group", "random-group"].includes(row.audienceType));
  const groupedStudentIds = new Set(groupRows.flatMap((row) => row.audienceIds));
  const groupStudentList = (row, assignedOnly = false) => roster.filter((student) => !assignedOnly || row.audienceIds.includes(student.id)).map((student) => `<label class="platform-group-student${row.audienceIds.includes(student.id) ? " is-assigned" : ""}" draggable="true" data-group-student-id="${escapeHtml2(student.id)}"><input type="checkbox" data-resource-audience-student data-resource-row-id="${escapeHtml2(row.id)}" value="${escapeHtml2(student.id)}"${row.audienceIds.includes(student.id) ? " checked" : ""}> ${escapeHtml2(student.displayName)}</label>`).join("");
  const audienceRows = state.audienceRows.map((row, rowIndex) => {
    const selectedNames = roster.filter((student) => row.audienceIds.includes(student.id)).map((student) => student.displayName);
    const audienceSummary = row.audienceType === "whole-class" ? "Whole class" : selectedNames.length ? selectedNames.join(", ") : "Choose students";
    const slots = `<div class="platform-class-resource-tray" aria-label="Activity slots for ${escapeHtml2(audienceSummary)}">${Array.from({ length: row.slotCount }, (_, index) => {
      const item = row.resources[index];
      const lastEmpty = !item && index === row.slotCount - 1;
      return `<article><button class="platform-resource-slot-button" type="button" data-action="edit-resource-slot" data-resource-row-id="${escapeHtml2(row.id)}" data-resource-slot-index="${index}"><span class="platform-command-label">Slot ${index + 1}</span>${item ? `<strong>${escapeHtml2(item.title)}</strong><small>${escapeHtml2(item.type)}</small>` : `<strong>Choose a resource</strong><small>Click this slot to add one</small>`}</button>${item ? `<label class="platform-active-resource-choice"><input type="checkbox" data-active-resource-toggle data-resource-row-id="${escapeHtml2(row.id)}" data-resource-index="${index}" checked> Show to ${escapeHtml2(audienceSummary)}</label>` : ""}${lastEmpty && row.slotCount > 4 ? `<button type="button" data-action="remove-resource-slot" data-resource-row-id="${escapeHtml2(row.id)}">Delete Empty Slot</button>` : ""}</article>`;
    }).join("")}</div>`;
    const groupName = ["teacher-group", "random-group"].includes(row.audienceType) ? `<label class="platform-group-name">Group name<input data-resource-group-name data-resource-row-id="${escapeHtml2(row.id)}" value="${escapeHtml2(row.audienceLabel)}" placeholder="Example: Blue Team"></label>` : "";
    const picker = row.audienceType === "whole-class" ? "" : row.audienceType === "students" ? `<fieldset class="platform-resource-student-picker"><legend>Choose individual students</legend>${groupStudentList(row)}</fieldset>` : `<fieldset class="platform-resource-student-picker platform-group-dropzone${row.audienceType === "random-group" ? " is-random-group" : ""}" data-group-drop-row-id="${escapeHtml2(row.id)}"><legend>${row.audienceType === "random-group" ? `Students randomly assigned to ${escapeHtml2(row.audienceLabel)}` : `Choose students for ${escapeHtml2(row.audienceLabel)}`}</legend><p>${row.audienceType === "random-group" ? "Only this group\u2019s assigned students appear here. Drag students between group rows to adjust the random result." : "The full class roster appears here. Click names to add them, or drag a student here from another group."}</p>${groupStudentList(row, row.audienceType === "random-group")}</fieldset>`;
    const assignmentControl = rowIndex === 0 ? `<p class="platform-primary-assignment-label"><strong>Main assignment:</strong> ${escapeHtml2(row.audienceType === "whole-class" ? "Whole class" : row.audienceType === "students" ? "Individual students" : row.audienceType === "teacher-group" ? "Teacher-chosen groups" : "Random groups")}</p>` : `<label>Exception assignment method<select data-resource-audience-type data-resource-row-id="${escapeHtml2(row.id)}"><option value="whole-class"${row.audienceType === "whole-class" ? " selected" : ""}>Whole class</option><option value="students"${row.audienceType === "students" ? " selected" : ""}>Individual students</option><option value="teacher-group"${row.audienceType === "teacher-group" ? " selected" : ""}>Teacher-chosen group</option><option value="random-group"${row.audienceType === "random-group" ? " selected" : ""}>Random group</option></select></label>`;
    return `<section class="platform-resource-audience-row${row.audienceType === "random-group" ? " platform-random-group-row" : ""}" data-resource-audience-row="${escapeHtml2(row.id)}"><div class="platform-resource-audience-heading"><div><p class="platform-command-label">${rowIndex === 0 ? "Main resource assignment" : row.audienceType === "random-group" ? "Randomly created exception group" : `Different assignment ${rowIndex}`}</p><h4>${escapeHtml2(row.audienceType === "whole-class" ? "Whole class" : row.audienceLabel || audienceSummary)}</h4>${row.audienceType !== "whole-class" ? `<p>${escapeHtml2(selectedNames.length ? selectedNames.join(", ") : "No students selected yet")}</p>` : ""}</div>${rowIndex ? `<button type="button" data-action="remove-resource-audience" data-resource-row-id="${escapeHtml2(row.id)}">Remove This Assignment</button>` : ""}</div>${assignmentControl}${groupName}${picker}${slots}<button class="platform-add-resource-slot" type="button" data-action="add-resource-slot" data-resource-row-id="${escapeHtml2(row.id)}">+ Add an Additional Slot</button></section>`;
  }).join("");
  const usesGroups = ["teacher-group", "random-group"].includes(state.assignmentMode) || groupRows.length > 0;
  const groupTools = usesGroups ? `<section class="platform-resource-group-builder"><p class="platform-command-label">Group setup</p><h4>Create or Reuse Groups</h4><p>This area creates group rows. Student membership and resources are managed in the rows below.</p><div class="platform-random-group-controls"><label>Students per random group<input type="number" min="1" max="${Math.max(1, roster.length)}" value="3" data-random-group-size></label><button type="button" data-action="build-random-groups">Create Random Groups</button><button type="button" data-action="add-teacher-group">+ Create a Teacher-Chosen Group</button></div>${groupRows.length ? `<div class="platform-unassigned-students" data-group-drop-row-id="unassigned"><strong>Not assigned to a group</strong>${roster.filter((student) => !groupedStudentIds.has(student.id)).map((student) => `<span draggable="true" data-group-student-id="${escapeHtml2(student.id)}">${escapeHtml2(student.displayName)}</span>`).join("") || `<span>Everyone is assigned.</span>`}</div>` : ""}<div class="platform-group-preset-controls"><label>Name these group settings<input data-group-set-name maxlength="60" placeholder="Example: Workshop Teams"></label><button type="button" data-action="save-group-set">Save Group Settings</button>${state.savedGroupSets.length ? `<label>Reuse past group settings<select data-saved-group-set><option value="">Choose saved groups</option>${state.savedGroupSets.map((set) => `<option value="${escapeHtml2(set.id)}">${escapeHtml2(set.name)}</option>`).join("")}</select></label><button type="button" data-action="apply-group-set">Use Saved Groups</button>` : ""}</div></section>` : "";
  const assignmentChooser = `<section class="platform-resource-assignment-chooser"><h4>How do you want today\u2019s resources assigned?</h4><label>Main assignment method<select data-resource-plan-mode><option value="whole-class"${state.assignmentMode === "whole-class" ? " selected" : ""}>Whole class</option><option value="students"${state.assignmentMode === "students" ? " selected" : ""}>Individual students</option><option value="teacher-group"${state.assignmentMode === "teacher-group" ? " selected" : ""}>Teacher-chosen groups</option><option value="random-group"${state.assignmentMode === "random-group" ? " selected" : ""}>Random groups</option></select></label><label>Will any students need resources assigned a different way?<select data-resource-exceptions-enabled><option value="no"${state.exceptionsEnabled ? "" : " selected"}>No</option><option value="yes"${state.exceptionsEnabled ? " selected" : ""}>Yes</option></select></label>${state.exceptionsEnabled ? `<div class="platform-resource-exception-controls"><label>Different assignment method<select data-resource-exception-type>${[["whole-class", "Whole class"], ["students", "Individual students"], ["teacher-group", "Teacher-chosen group"], ["random-group", "Random group"]].filter(([value]) => value !== state.assignmentMode).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label><button type="button" data-action="add-resource-exception">+ Add Different Assignment</button></div>` : ""}</section>`;
  return `<section id="teacher-todays-resources" class="platform-command-card platform-class-resource-sharing platform-visual-zone platform-zone-create" data-class-resource-teacher aria-labelledby="class-resource-title">
    <p class="platform-command-label">Prepare and assign</p>
    <h2 id="class-resource-title">Today\u2019s Resources</h2>
    ${assignmentChooser}
    ${groupTools}
    ${audienceRows}
    <a class="platform-button platform-button-secondary" href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-sharing">Share Resource Settings With Other Classes</a>
    <details class="platform-class-resource-editor">
      <summary hidden>Choose a resource</summary>
      <h4>Choose a Resource for the Selected Slot</h4>
      <p>Select a catalog activity or add another resource. Saving updates the slot you clicked.</p>
    <form data-form="class-resource" novalidate>
      <input type="hidden" name="rowId" value="whole-class"><input type="hidden" name="slot" value="0">
      <label>Resource type<select name="type" data-class-resource-type>${RESOURCE_TYPES.map((type) => `<option${prepared.type === type ? " selected" : ""}>${type}</option>`).join("")}</select></label>
      <section class="platform-resource-picker" data-resource-picker data-picker-mode="${prepared.type === "Side Path" ? "side-path" : "mission"}"${pickerOpen ? "" : " hidden"} aria-label="Activity library">
        <div data-resource-picker-mission${prepared.type === "Mission Activity" ? "" : " hidden"}>
          <p class="platform-command-label">Mission Activity library</p><h4>Choose a grade and weekly goal</h4>
          <div class="platform-resource-grade-row" aria-label="Grade level"><button type="button" disabled>Grade 3 \xB7 catalog pending</button><button type="button" disabled>Grade 4 \xB7 catalog pending</button><button type="button" aria-pressed="true">Grade 5</button></div>
          <div class="platform-resource-browser-list" aria-label="Grade 5 weekly goals">
            <article class="platform-resource-browser-item" tabindex="0"><strong>Weekly Goal: Build a Shelter</strong><span>Hover or focus to see activities</span>
              <div class="platform-resource-browser-children"><button type="button" data-action="select-catalog-resource" data-resource-type="Mission Activity" data-resource-title="Design a Space Bedroom" data-resource-url="https://docs.google.com/presentation/d/1GzkVODaIdAweiSCuFxJC3NOAQEE8GmwdMO7z05Inx64/edit?usp=drivesdk"><strong>Design a Space Bedroom</strong><span>Hover for the quick preparation view</span><span class="platform-resource-activity-detail"><b>Goal:</b> Design a usable shelter space.<br><b>Materials:</b> basic design supplies; paper planning or a teacher-approved model.</span></button></div>
            </article>
          </div>
        </div>
        <div data-resource-picker-side-path${prepared.type === "Side Path" ? "" : " hidden"}>
          <p class="platform-command-label">Side Path library</p><h4>Choose a Side Path</h4><p>Hover or keyboard-focus a path to preview its verified activities.</p>
          <div class="platform-resource-browser-list">${["Create", "Design", "Build", "Think", "Code"].map((topic) => `<article class="platform-resource-browser-item" tabindex="0"><strong>${topic}</strong><span>Hover or focus to view activities</span><div class="platform-resource-browser-children"><p>No verified ${topic} activities have been imported yet.</p></div></article>`).join("")}</div>
        </div>
        <div data-resource-picker-webpage${prepared.type === "Webpage" ? "" : " hidden"}>
          <p class="platform-command-label">Teacher webpage library</p><h4>Choose the pages students may use</h4><p>Search or filter this private teacher list. Students see only the pages you select.</p>
          <div class="platform-resource-webpage-tools">
            <label>Find a page<input type="search" data-webpage-search placeholder="Search page names"></label>
            <label>Page group<select data-webpage-category><option value="all">All page groups</option>${[...new Set(TEACHER_WEBPAGE_CATALOG.map((page) => page.category))].map((category) => `<option value="${escapeHtml2(category.toLowerCase())}">${escapeHtml2(category)}</option>`).join("")}</select></label>
          </div>
          <div class="platform-resource-webpage-list">
            ${TEACHER_WEBPAGE_CATALOG.map((page, index) => `<article data-webpage-catalog-item data-webpage-category-value="${escapeHtml2(page.category.toLowerCase())}" data-webpage-search-value="${escapeHtml2(`${page.title} ${page.category} ${page.detail}`.toLowerCase())}"><label><input type="checkbox" data-webpage-selection value="${index}"${state.activeResources.some((resource) => resource.type === "Webpage" && resource.url === page.url) ? " checked" : ""}><span><small>${escapeHtml2(page.category)}</small><strong>${escapeHtml2(page.title)}</strong><span>${escapeHtml2(page.detail)}</span></span></label></article>`).join("")}
          </div>
          <p data-webpage-empty hidden>No pages match that search. You can add the page address below.</p>
          <div class="platform-resource-webpage-actions"><button type="button" data-action="show-selected-webpages">Show Selected Pages to Students</button><button type="button" data-action="use-custom-webpage">Add Another Webpage</button></div>
          <p class="platform-resource-webpage-note">For another page from your website, choose <b>Add Another Webpage</b>, then enter its name and address in the fields below.</p>
        </div>
      </section>
      <details class="platform-custom-resource-fields" data-custom-resource-fields><summary>Add a resource that is not listed</summary>
        <label>Student-facing title<input name="title" maxlength="80" value="${escapeHtml2(prepared.title)}" placeholder="Example: Bridge Design Builder"></label>
        <label>Resource address<input name="url" type="url" value="${escapeHtml2(prepared.url)}" placeholder="https://\u2026 or platform path"></label>
        <p>The address is needed only for a custom page. Catalog pages already have their addresses saved.</p>
      </details>
      <label>Release<select name="release">${RESOURCE_RELEASES.map((release) => `<option value="${release}"${prepared.release === release ? " selected" : ""}>${releaseLabels[release]}</option>`).join("")}</select></label>
      <div class="platform-class-resource-actions"><button type="button" data-action="prepare-class-resource">Save for Later</button><button type="button" data-action="push-class-resource">Show on Student Page</button></div>
      <p data-class-resource-status role="status">${state.audienceRows.some((row) => row.resources.length) ? "Resource assignments are ready. Click any slot to add or change its resource." : state.prepared ? `Ready: ${escapeHtml2(prepared.title)} \xB7 ${escapeHtml2(releaseLabels[prepared.release])}` : "Click a slot above to begin."}</p>
    </form>
    <details class="platform-class-resource-saved"><summary>Saved for Later (${state.saved.length})</summary><div>${state.saved.length ? state.saved.map((item) => `<article><span><strong>${escapeHtml2(item.title)}</strong><small>${escapeHtml2(item.type)}</small></span><button type="button" data-action="push-saved-resource" data-resource-id="${escapeHtml2(item.id)}">Show Next</button><button type="button" data-action="remove-saved-resource" data-resource-id="${escapeHtml2(item.id)}">Remove</button></article>`).join("") : `<p>No saved activities yet.</p>`}</div></details>
    </details>
    <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today\u2019s Class Plan</button>
  </section>`;
}
function directionResourceMarkup(resource, title) {
  if (resource.mediaType === "image") return `<img class="platform-direction-image" src="${escapeHtml2(resource.url)}" alt="Visual for ${escapeHtml2(title)}">`;
  if (resource.mediaType === "google-slides") {
    const previewUrl = resource.url.replace(/\/edit(?:\?.*)?$/i, "/preview").replace(/\/view(?:\?.*)?$/i, "/preview");
    return `<iframe class="platform-direction-embed" src="${escapeHtml2(previewUrl)}" title="${escapeHtml2(title)} slides" loading="lazy" allowfullscreen></iframe>`;
  }
  if (resource.mediaType === "youtube") {
    const match = resource.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{6,})/i);
    if (match) return `<iframe class="platform-direction-embed" src="https://www.youtube-nocookie.com/embed/${escapeHtml2(match[1])}" title="${escapeHtml2(title)} video" loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }
  const fallbackLabels = { pdf: "PDF", youtube: "video", builder: "Builder", "mission-activity": "mission activity", "side-path": "Side Path", webpage: "webpage" };
  return `<a class="platform-button platform-button-secondary" href="${escapeHtml2(resource.url)}" target="_blank" rel="noopener noreferrer">Open ${escapeHtml2(resource.title || fallbackLabels[resource.mediaType] || "resource")}</a>`;
}
function directionMediaMarkup(card) {
  const resources = card.resources?.length ? card.resources : card.url && card.mediaType !== "none" ? [{ mediaType: card.mediaType, url: card.url }] : [];
  return resources.length ? `<div class="platform-direction-resources">${resources.map((resource) => directionResourceMarkup(resource, card.title)).join("")}</div>` : "";
}
function directionResourceEditorRow(resource = { mediaType: "image", url: "" }) {
  const labels = { image: "Image", "google-slides": "Google Slides", youtube: "YouTube video", pdf: "PDF", webpage: "Webpage", builder: "STEM Builder", "mission-activity": "Mission Activity", "side-path": "Side Path" };
  return `<div class="platform-direction-resource-row"><label>Type<select name="resourceType">${Object.entries(labels).map(([value, label]) => `<option value="${value}"${resource.mediaType === value ? " selected" : ""}>${label}</option>`).join("")}</select></label><label>Student-facing title<input name="resourceTitle" maxlength="100" placeholder="Example: Bridge design slides" value="${escapeHtml2(resource.title || "")}"></label><label>Link or platform address<input name="resourceUrl" type="text" placeholder="https://\u2026 or ../index.html" value="${escapeHtml2(resource.url || "")}"></label><div class="platform-direction-actions"><button type="button" data-action="move-direction-resource" data-offset="-1" aria-label="Move resource up">\u2191</button><button type="button" data-action="move-direction-resource" data-offset="1" aria-label="Move resource down">\u2193</button><button type="button" data-action="remove-direction-resource">Remove</button></div></div>`;
}
function activityDirectionsTeacherMarkup(classId) {
  const state = activityDirections.read(classId);
  const cards = state.cards.map((card, index) => `<article class="platform-direction-card" data-direction-card-id="${escapeHtml2(card.id)}" data-status="${card.status}">
    <div><span class="platform-direction-number">${index + 1}</span><span class="platform-direction-status">${card.status === "released" ? "Visible to students" : "Draft \u2014 teacher only"}</span></div>
    <h4>${escapeHtml2(card.title)}</h4><p>${escapeHtml2(card.directions)}</p>${directionMediaMarkup(card)}
    <div class="platform-direction-actions"><button type="button" data-action="edit-direction-card" data-direction-id="${escapeHtml2(card.id)}">Edit</button>${card.status === "released" ? `<button type="button" data-action="withdraw-direction-card" data-direction-id="${escapeHtml2(card.id)}">Withdraw</button>` : `<button type="button" data-action="release-direction-card" data-direction-id="${escapeHtml2(card.id)}">Release</button>`}<details class="platform-direction-more"><summary>More</summary><div><button type="button" data-action="duplicate-direction-card" data-direction-id="${escapeHtml2(card.id)}">Duplicate</button><button type="button" data-action="move-direction-card" data-direction-id="${escapeHtml2(card.id)}" data-direction-offset="-1"${index === 0 ? " disabled" : ""}>Move Up</button><button type="button" data-action="move-direction-card" data-direction-id="${escapeHtml2(card.id)}" data-direction-offset="1"${index === state.cards.length - 1 ? " disabled" : ""}>Move Down</button><button type="button" data-action="remove-direction-card" data-direction-id="${escapeHtml2(card.id)}">Delete</button></div></details></div>
  </article>`).join("");
  return `<section class="platform-command-card platform-activity-directions platform-visual-zone platform-zone-create" data-activity-directions-teacher aria-labelledby="activity-directions-title">
    <p class="platform-command-label">Directions, activities, and resources together</p><h2 id="activity-directions-title">Lesson Steps</h2>
    <p>Add each step as the lesson develops, then attach everything students need directly to that step. Draft steps stay private until you release them.</p>
    <label class="platform-activity-title">Activity title<input data-activity-directions-title maxlength="100" value="${escapeHtml2(state.title)}"></label>
    <div class="platform-direction-list">${cards || `<p class="platform-student-empty-state">No direction cards yet. Add the first card below.</p>`}</div>
    <details class="platform-direction-editor"><summary>Add or Edit a Lesson Step</summary>
      <form data-form="activity-direction" novalidate><input type="hidden" name="id">
        <label>Card title<input name="title" maxlength="100" placeholder="Example: Step 1 \u2014 Investigate" required></label>
        <label>Directions<textarea name="directions" maxlength="2000" rows="4" placeholder="Tell students exactly what to do next." required></textarea></label>
        <fieldset class="platform-direction-resource-editor"><legend>Activities and resources for this step</legend><p>Attach slides, images, video, webpages, Builder, a mission activity, or a Side Path. Students will find each item directly under these directions.</p><div data-direction-resource-list></div><button type="button" data-action="add-direction-resource">+ Add an Activity or Resource</button></fieldset>
        <label>Student visibility<select name="visibility"><option value="draft">Keep private draft</option><option value="released">Show to students</option></select></label>
        <div class="platform-direction-actions"><button type="button" data-action="save-direction-card">Save Lesson Step</button><button type="reset" data-action="cancel-direction-edit">Clear</button></div>
        <p data-activity-direction-status role="status">${escapeHtml2(classroomLessonServiceNotice || "Choose whether students can see this step, then save it.")}</p>
      </form>
    </details>
  </section>`;
}
function activityDirectionsStudentMarkup(classId) {
  const state = activityDirections.read(classId), cards = activityDirections.releasedForStudents(classId);
  return `<section class="platform-activity-directions platform-activity-directions-student platform-student-zone platform-student-zone-now" aria-labelledby="student-directions-title">
    <p class="platform-student-section-label">Teacher directions</p><h2 id="student-directions-title">${escapeHtml2(state.title)}</h2>
    ${cards.length ? `<ol class="platform-student-direction-list">${cards.map((card) => `<li><h3>${escapeHtml2(card.title)}</h3><p>${escapeHtml2(card.directions)}</p>${directionMediaMarkup(card)}</li>`).join("")}</ol>` : `<p class="platform-student-empty-state">Your teacher has not released any directions yet.</p>`}
  </section>`;
}
function assignedResearchTeacherMarkup(assignedResearch, researchLinkBank, className) {
  return `<section class="platform-assigned-research platform-assigned-research-teacher" aria-labelledby="assigned-research-teacher-title">
    <div><p class="platform-command-label">Approved research step</p><h3 id="assigned-research-teacher-title">Approved Research</h3><p>Add a topic and trusted links to today\u2019s lesson. Students never receive an open Google search box.</p></div>
    <form data-form="teacher-assigned-research" novalidate>
      <label>Research topic<input name="topic" maxlength="140" value="${escapeHtml2(assignedResearch.topic)}" placeholder="Example: how bridges support weight for kids"></label>
      <button type="button" data-action="preview-assigned-google-search">Preview This Topic in Google</button>
      <label>Approved links\u2014one per line<textarea name="links" rows="5" placeholder="Bridge article | https://example.org/bridge-article">${escapeHtml2(teacherAssignedResearchLinksText(assignedResearch))}</textarea><small>Use: Resource title | https://website-address</small></label>
      <div class="platform-actions"><button type="submit">Add to Today\u2019s Lesson</button><button type="button" data-action="clear-assigned-research">Remove from Lesson</button></div>
      <p data-assigned-research-status role="status">${assignedResearch.links.length ? `${assignedResearch.links.length} approved link${assignedResearch.links.length === 1 ? "" : "s"} included for ${escapeHtml2(className)}.` : "No approved research links are included in today\u2019s lesson."}</p>
    </form>
    <details class="platform-research-link-bank"><summary>Open Approved Link Bank</summary><div><p class="platform-command-label">Reusable teacher library</p><h4 id="research-link-bank-title">Approved Link Bank</h4><p>Reuse a trusted group of links in this lesson.</p></div><div class="platform-research-bank-grid">${teacherResearchLinkBankMarkup(researchLinkBank, assignedResearch)}</div><details class="platform-research-bank-create"><summary>Create a New Link Group</summary><form data-form="teacher-research-link-bank" novalidate><label>Group title<input name="title" maxlength="80" placeholder="Example: Bridges and Structures" required></label><label>Topic or description<input name="topic" maxlength="140" placeholder="Example: How bridges support weight"></label><label>Approved links\u2014one per line<textarea name="links" rows="5" placeholder="Bridge article | https://example.org/bridge-article" required></textarea><small>Use: Resource title | https://website-address</small></label><div class="platform-actions"><button type="submit">Save Group to Link Bank</button></div><p data-research-bank-status role="status">You can save up to 24 groups in this browser.</p></form></details></details>
  </section>`;
}
function todaysLessonTeacherMarkup(classId, assignedResearch, researchLinkBank, className) {
  const state = activityDirections.read(classId), resources = state.cards.flatMap((card) => card.resources || []).length;
  return `<section class="platform-todays-lesson platform-visual-zone platform-zone-create" aria-labelledby="todays-lesson-title"><header class="platform-todays-lesson-heading"><p class="platform-command-label">Build and release as students learn</p><h2 id="todays-lesson-title">Today\u2019s Lesson</h2><p>${state.cards.length} lesson step${state.cards.length === 1 ? "" : "s"} \xB7 ${resources} attached activit${resources === 1 ? "y or resource" : "ies and resources"} \xB7 ${assignedResearch.links.length} approved research link${assignedResearch.links.length === 1 ? "" : "s"}</p><div class="platform-todays-lesson-actions"><button type="button" data-action="add-lesson-step">+ Add Lesson Step</button><a class="platform-button platform-button-secondary" href="#${ROUTES.PREVIEW_STUDENT}" target="_blank" rel="noopener">Preview as Student</a></div></header><div class="platform-todays-lesson-sections"><details data-lesson-builder="steps" open><summary>Lesson Steps, Activities, and Resources</summary>${activityDirectionsTeacherMarkup(classId)}</details><details data-lesson-builder="research"><summary>Approved Research</summary>${assignedResearchTeacherMarkup(assignedResearch, researchLinkBank, className)}</details></div></section>`;
}
function readStudentNameplate(studentId) {
  const fallback = { font: "slab", background: "cream", color: "#173247" };
  try {
    const all = JSON.parse(window.localStorage.getItem(STUDENT_NAMEPLATE_STORAGE_KEY) || "{}");
    const saved = all[studentId] || {};
    return {
      font: STUDENT_NAMEPLATE_FONTS.includes(saved.font) ? saved.font : fallback.font,
      background: STUDENT_NAMEPLATE_BACKGROUNDS.includes(saved.background) ? saved.background : fallback.background,
      color: /^#[0-9a-f]{6}$/i.test(saved.color) ? saved.color : fallback.color
    };
  } catch {
    return fallback;
  }
}
function writeStudentNameplate(studentId, preferences) {
  try {
    const all = JSON.parse(window.localStorage.getItem(STUDENT_NAMEPLATE_STORAGE_KEY) || "{}");
    all[studentId] = preferences;
    window.localStorage.setItem(STUDENT_NAMEPLATE_STORAGE_KEY, JSON.stringify(all));
  } catch {
  }
}
function studentNameplateMarkup(studentId, studentName, className, rawStudentName) {
  const preferences = readStudentNameplate(studentId);
  const selected = (value, current) => value === current ? " selected" : "";
  const classLabels = productionStudentClassLabels.length ? productionStudentClassLabels : [];
  const rosterIndex = classLabels.findIndex((label) => label === rawStudentName);
  const limerick = generateStudentNameBobLimerick(rawStudentName, rosterIndex >= 0 ? rosterIndex : null);
  const limerickMarkup = limerick.ok ? `<p class="platform-student-nameplate-limerick">${escapeHtml2(limerick.limerick).replaceAll("\n", "<br>")}</p>` : "";
  return `<section class="platform-student-orientation platform-student-nameplate-bg-${preferences.background} platform-student-nameplate-font-${preferences.font}" style="--student-name-color:${preferences.color}" data-student-nameplate data-student-id="${escapeHtml2(studentId)}" aria-labelledby="student-orientation-title"><h2 id="student-orientation-title">${studentName}</h2><p class="platform-student-class">${className}</p>${limerickMarkup}<details class="platform-student-nameplate-customizer"><summary>Customize my nameplate</summary><div><label>Fancy text<select data-student-nameplate-control="font"><option value="slab" style="font-family:'Roboto Slab',Rockwell,Georgia,serif"${selected("slab", preferences.font)}>Inventor</option><option value="classic" style="font-family:Georgia,'Times New Roman',serif;font-style:italic"${selected("classic", preferences.font)}>Classic</option><option value="cursive" style="font-family:'School Cursive',cursive"${selected("cursive", preferences.font)}>Cursive</option><option value="playful" style="font-family:'Comic Sans MS','Comic Sans',cursive"${selected("playful", preferences.font)}>Playful</option></select></label><label>Background<select data-student-nameplate-control="background"><option value="cream"${selected("cream", preferences.background)}>Cream</option><option value="brass"${selected("brass", preferences.background)}>Brass</option><option value="blue"${selected("blue", preferences.background)}>Blue Steel</option><option value="green"${selected("green", preferences.background)}>Workshop Green</option><option value="parchment"${selected("parchment", preferences.background)}>Old Map</option></select></label><label>Name color<input type="color" value="${preferences.color}" data-student-nameplate-control="color"></label></div><p>Changes save automatically.</p></details></section>`;
}
function studentClassLimerickMarkup(classId) {
  const fixtureLabels = getRosterForClass(classId).map((student) => student.displayName);
  const labels = productionStudentClassLabels.length ? productionStudentClassLabels : fixtureLabels;
  const result = generateClassNameBobLimerick(labels);
  if (!result.ok) return "";
  return `<details class="platform-student-class-limerick"><summary>\u{1F3A9} Our Class Limerick</summary><div><p>${escapeHtml2(result.limerick).replaceAll("\n", "<br>")}</p><button class="platform-student-listen-button" type="button" data-action="read-student-section" aria-pressed="false">Listen</button></div></details>`;
}
function todaysLessonStudentMarkup(classId, studentId, assignedResearch) {
  const releasedSidePath = activityDirections.releasedForStudents(classId).flatMap((card) => card.resources ?? []).find((resource) => resource.mediaType === "side-path" && resource.url);
  const assignedSidePath = classResourceSharing.resourcesForStudent(classId, studentId).find((resource) => resource.type === "Side Path" && resource.url);
  const currentSidePath = releasedSidePath ?? assignedSidePath;
  const sidePathType = currentSidePath?.title || currentSidePath?.type || "Teacher choice";
  const sidePathLaunch = currentSidePath ? `<a class="platform-school-start-launch-link platform-school-start-launch-link-side-path" href="${escapeHtml2(currentSidePath.url)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">SP</span><strong>SIDE PATH</strong><small>${escapeHtml2(sidePathType)}</small></a>` : `<button class="platform-school-start-launch-link platform-school-start-launch-link-side-path is-unavailable" type="button" disabled aria-label="Side Path locked"><span aria-hidden="true">SP</span><strong>SIDE PATH</strong><small>\u{1F512} Locked</small></button>`;
  const researchMarkup = assignedResearch.topic || assignedResearch.links.length ? `<section class="platform-assigned-research platform-assigned-research-student" aria-labelledby="assigned-research-student-title"><p class="platform-student-section-label">Teacher links</p><h3 id="assigned-research-student-title">Research</h3>${assignedResearch.topic ? `<p>${escapeHtml2(assignedResearch.topic)}</p>` : ""}${assignedResearch.links.length ? `<div class="platform-assigned-research-links">${assignedResearch.links.map((link) => `<button type="button" data-action="open-assigned-research" data-research-url="${escapeHtml2(link.url)}">${escapeHtml2(link.title)}</button>`).join("")}</div>` : ""}</section>` : "";
  return `<section class="platform-todays-lesson-student platform-student-zone platform-student-zone-now platform-student-trail-stop platform-student-trail-stop-right" id="student-todays-activities" aria-labelledby="student-todays-lesson-title"><div class="platform-student-step-heading"><img src="./assets/images/student-path/inventors-workshop-brass-badge.png" alt=""><div class="platform-student-step-title"><p class="platform-student-section-label">Step 2</p><h2 id="student-todays-lesson-title">Inventor\u2019s Workshop</h2></div></div><p>Follow the mission orders. Use the machines you need.</p>${activityDirectionsStudentMarkup(classId)}<section class="platform-school-start-launcher platform-school-start-launcher-inline" aria-labelledby="school-start-launcher-title"><h3 id="school-start-launcher-title">Auxiliary Machines</h3><p class="platform-school-start-launcher-subheading">Extra Activities</p><div class="platform-school-start-launch-grid">${sidePathLaunch}<a class="platform-school-start-launch-link platform-school-start-launch-link-builder" href="../index.html" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">SB</span><strong>STEM BUILDER</strong><small>Build</small></a><a class="platform-school-start-launch-link platform-school-start-launch-link-workshop" href="http://192.168.1.252:8000" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">SW</span><strong>STEM WORKSHOP</strong><small>Open</small></a></div><button class="platform-student-listen-button" type="button" data-action="read-student-launches" data-side-path-assigned="${currentSidePath ? "true" : "false"}" aria-pressed="false">Listen</button></section>${researchMarkup}</section>`;
}
function studentReflectionMarkup(reflectionStatus, teacherActivities, reflectionOptions, classId) {
  if (!reflectionStatus.required || !weeklyReflections.captainLogAvailableToday(classId)) return "";
  const due = new Date(reflectionActivityWindowStart(/* @__PURE__ */ new Date()) + 6 * 24 * 60 * 60 * 1e3);
  const dueLabel = due.toLocaleDateString(void 0, { weekday: "long", month: "short", day: "numeric" });
  const plan = weeklyReflections.captainLogPlan(classId);
  return `<section class="platform-student-reflection platform-student-reflection-inline platform-student-zone platform-student-zone-review platform-student-trail-stop platform-student-trail-stop-right" data-reflection-state="${reflectionStatus.state}" aria-labelledby="reflection-check-title"><p class="platform-student-section-label">Step 4</p><div class="platform-student-step-heading"><img src="./assets/images/student-path/captains-log-brass-badge.png" alt=""><h2 id="reflection-check-title">Captain\u2019s Log</h2></div><p class="platform-student-status" data-weekly-reflection-status>${reflectionStatus.remaining === 0 ? `Done! ${reflectionStatus.completed} finished this week.` : `Exit ticket \xB7 ${escapeHtml2(plan.schedule)} \xB7 Due ${escapeHtml2(dueLabel)}.`}</p>${reflectionStatus.remaining === 0 ? "" : `<details class="platform-student-reflection-form"><summary>Open Captain\u2019s Log</summary><form data-form="weekly-reflection" novalidate><p class="platform-captains-log-prompt"><strong>${escapeHtml2(plan.prompt)}</strong></p><label for="weekly-reflection-activity">Activity Worked On Today</label><select id="weekly-reflection-activity" name="activityChoice" required><option value="">Choose an activity</option>${teacherActivities.map((activity) => `<option value="${escapeHtml2(activity)}">${escapeHtml2(activity)}</option>`).join("")}<option value="__other__">Other activity \u2014 type my own</option></select><label data-reflection-other-activity hidden>Type the activity name<input name="activityOther" maxlength="120"></label><label for="weekly-reflection-progress">Mission Progress</label><select id="weekly-reflection-progress" name="progress" required>${reflectionOptions(REFLECTION_PROGRESS_OPTIONS)}</select><label for="weekly-reflection-response">Your answer</label><textarea id="weekly-reflection-response" name="explanation" minlength="10" maxlength="500" required></textarea><button class="platform-reflection-speech-button" type="button" data-action="reflection-dictate" aria-pressed="false">Speak Answer</button><button class="platform-reflection-speech-stop" type="button" data-action="reflection-dictate-stop" hidden>Stop Speaking</button><p class="platform-reflection-speech-status" data-reflection-speech-status role="status">Type or speak.</p><label>Did you improve your idea?<select name="improved" required>${reflectionOptions(REFLECTION_IMPROVEMENT_OPTIONS)}</select></label><label>Badge<select name="badge" required>${reflectionOptions(REFLECTION_BADGE_OPTIONS)}</select></label><label>Need help next class?<select name="help" required>${reflectionOptions(REFLECTION_HELP_OPTIONS)}</select></label><label>Could you help someone?<select name="helpOther" required>${reflectionOptions(REFLECTION_HELP_OTHER_OPTIONS)}</select></label><label>How did it go?<select name="rating" required>${reflectionOptions(REFLECTION_ACTIVITY_RATING_OPTIONS)}</select></label><button type="submit">Finish Log</button><p class="platform-error" data-weekly-reflection-error role="alert" hidden></p></form></details>`}</section>`;
}
function captainsLogPlannerMarkup(classId) {
  const plan = weeklyReflections.captainLogPlan(classId), library = weeklyReflections.captainLogLibrary();
  const choices = [...CAPTAINS_LOG_PRESET_PROMPTS.map((item) => ({ ...item, group: `Week ${item.week}` })), ...library.map((item) => ({ ...item, week: plan.week, label: "Saved", group: "My Library" }))];
  const selectedId = choices.some((item) => item.id === plan.promptId) ? plan.promptId : "custom";
  return `<section class="platform-command-card platform-captains-log-planner" aria-labelledby="captains-log-planner-title"><p class="platform-command-label">Exit ticket</p><h3 id="captains-log-planner-title">Plan the Captain\u2019s Log</h3><p>Choose the short writing prompt students will answer at the end of class.</p><form data-form="captains-log-plan" novalidate><label>Prompt<select name="promptId"><option value="custom"${selectedId === "custom" ? " selected" : ""}>Create a new prompt</option>${choices.map((item) => `<option value="${escapeHtml2(item.id)}"${selectedId === item.id ? " selected" : ""}>${escapeHtml2(item.group)} \xB7 ${escapeHtml2(item.label)} \u2014 ${escapeHtml2(item.prompt)}</option>`).join("")}</select></label><label>Prompt text<textarea name="prompt" minlength="5" maxlength="240" required>${escapeHtml2(plan.prompt)}</textarea></label><div class="platform-captains-log-schedule"><label>Plan week<select name="week">${CAPTAINS_LOG_PRESET_PROMPTS.map((item) => `<option value="${item.week}"${plan.week === item.week ? " selected" : ""}>Week ${item.week}</option>`).join("")}</select></label><label>Show to students<select name="schedule">${CAPTAINS_LOG_SCHEDULE_OPTIONS.map((item) => `<option${plan.schedule === item ? " selected" : ""}>${item}</option>`).join("")}</select></label><label>Logs this week<select name="required">${[0, 1, 2, 3, 4, 5].map((count) => `<option value="${count}"${plan.required === count ? " selected" : ""}>${count}</option>`).join("")}</select></label></div><label class="platform-captains-log-library-choice"><input type="checkbox" name="saveToLibrary"> Save this prompt to My Library</label><button type="submit">Save Captain\u2019s Log Plan</button><p data-captains-log-status role="status">Current: Week ${plan.week} \xB7 ${escapeHtml2(plan.schedule)} \xB7 ${plan.required} log${plan.required === 1 ? "" : "s"} this week.</p></form>${library.length ? `<details class="platform-captains-log-library"><summary>My Prompt Library (${library.length})</summary>${library.map((item) => `<div><span>${escapeHtml2(item.prompt)}</span><button type="button" data-action="delete-captains-log-prompt" data-prompt-id="${escapeHtml2(item.id)}">Delete</button></div>`).join("")}</details>` : ""}</section>`;
}
function weeklyReflectionTeacherMarkup(classId) {
  const required = weeklyReflections.requirement(classId);
  return `<section class="platform-classroom-setup platform-weekly-reflection-setup" aria-labelledby="weekly-reflection-setup-title">
    <p class="platform-command-label">Weekly reflection</p>
    <h3 id="weekly-reflection-setup-title">What I Learned Today Requirement</h3>
    <p>Choose how many reflections each student should complete during the current Monday\u2013Sunday week.</p>
    <form data-form="weekly-reflection-requirement" novalidate>
      <label>Responses required this week<select name="required">${[0, 1, 2, 3, 4, 5].map((count) => `<option value="${count}"${required === count ? " selected" : ""}>${count}</option>`).join("")}</select></label>
      <button type="submit">Save Weekly Requirement</button>
      <p data-weekly-reflection-teacher-status role="status">Current requirement: ${required} response${required === 1 ? "" : "s"} per student this week.</p>
    </form>
  </section>`;
}
function evidenceCaptureMarkup() {
  const activity = escapeHtml2(currentEvidenceActivity());
  const items = evidenceFoundation.timeline();
  const draft = evidenceDraft;
  const inputAccept = draft?.type === EVIDENCE_TYPES.VIDEO ? "video/*" : draft?.type === EVIDENCE_TYPES.MORE ? "*/*" : "image/*";
  const needsFile = draft && draft.type !== EVIDENCE_TYPES.REFLECTION;
  return `
    <div class="platform-evidence-workspace">
      <div class="platform-evidence-context"><span>Current activity</span><strong>${activity}</strong><small>Added automatically to new evidence</small></div>
      <div class="platform-evidence-actions" aria-label="Add evidence">
        ${["Photo", "Screenshot", "Video", "Reflection", "More Evidence"].map((type) => `<button type="button" data-action="evidence-start" data-evidence-type="${type}">${type}</button>`).join("")}
        <button class="platform-button platform-button-secondary" type="button" data-action="evidence-open-log">Open Evidence Log</button>
      </div>
      ${draft ? `<section class="platform-evidence-capture" aria-labelledby="evidence-capture-title">
        <p class="platform-stem-work-label">Capture</p><h4 id="evidence-capture-title">Add ${escapeHtml2(draft.type)}</h4>
        ${needsFile ? `<label class="platform-evidence-file">Choose ${draft.type.toLowerCase()}<input data-evidence-file type="file" accept="${inputAccept}" ${draft.type === EVIDENCE_TYPES.PHOTO ? 'capture="environment"' : ""}></label>` : `<label for="evidence-reflection">What did you try, notice, or change?</label><textarea id="evidence-reflection" data-evidence-reflection maxlength="600" rows="4">${escapeHtml2(draft.detail || "")}</textarea>`}
        <div class="platform-evidence-preview" data-evidence-preview>
          ${draft.previewUrl ? draft.type === EVIDENCE_TYPES.VIDEO ? `<video src="${draft.previewUrl}" controls></video>` : draft.type === EVIDENCE_TYPES.MORE ? `<p><strong>${escapeHtml2(draft.fileName)}</strong><br>${escapeHtml2(draft.detail)}</p>` : `<img src="${draft.previewUrl}" alt="Preview of evidence ready to save">` : `<p>${draft.detail ? escapeHtml2(draft.detail) : "Your preview will appear here before anything is saved."}</p>`}
        </div>
        <div class="platform-actions"><button class="platform-button platform-button-primary" type="button" data-action="evidence-save">Save Evidence</button>${draft.hasSelection ? `<button class="platform-button platform-button-secondary" type="button" data-action="evidence-retake">Retake</button>` : ""}<button class="platform-button platform-button-secondary" type="button" data-action="evidence-cancel">Cancel</button></div>
        <p class="platform-error" data-evidence-error role="alert" hidden></p>
      </section>` : ""}
      <p class="platform-evidence-notice" role="status" aria-live="polite">${escapeHtml2(evidenceNotice)}</p>
      <section class="platform-evidence-log" id="student-evidence-log" aria-labelledby="evidence-log-title">
        <div><p class="platform-stem-work-label">Fictional pilot data</p><h4 id="evidence-log-title">Evidence Timeline</h4></div>
        <ol>${items.map((item) => `<li><span class="platform-evidence-type">${escapeHtml2(item.type)}</span><div><strong>${escapeHtml2(item.title)}</strong><p>${escapeHtml2(item.activity)} \xB7 ${escapeHtml2(item.time)}</p><small>${escapeHtml2(item.detail)}</small></div></li>`).join("")}</ol>
      </section>
      <p class="platform-evidence-boundary">Fictional pilot only. Photo and Screenshot use the teacher-owned Drive when the local pilot service is running; all other evidence remains in this browser session.</p>
    </div>`;
}
function teacherEvidenceReviewMarkup() {
  const visible = teacherEvidenceFilter === "All" ? PILOT_TEACHER_EVIDENCE : PILOT_TEACHER_EVIDENCE.filter((item) => item.type === teacherEvidenceFilter);
  const selected = PILOT_TEACHER_EVIDENCE.find((item) => item.id === teacherEvidenceSelection);
  return `
    <div class="platform-teacher-evidence-review" data-teacher-evidence-review>
      <div class="platform-teacher-evidence-heading">
        <div><p class="platform-command-label">Fictional classroom preview</p><h3 id="teacher-evidence-review-title">Student Evidence</h3></div>
        <label>Show evidence type
          <select data-teacher-evidence-filter>
            ${["All", ...Object.values(EVIDENCE_TYPES)].map((type) => `<option value="${type}"${teacherEvidenceFilter === type ? " selected" : ""}>${type}</option>`).join("")}
          </select>
        </label>
      </div>
      <p>Browse sample evidence without assigning grades, leaving comments, or recording whether a teacher viewed it.</p>
      <div class="platform-teacher-evidence-layout">
        <ul class="platform-teacher-evidence-list" aria-label="Fictional student evidence">
          ${visible.length ? visible.map((item) => `<li><button type="button" data-action="teacher-evidence-open" data-evidence-id="${item.id}" aria-pressed="${item.id === teacherEvidenceSelection}"><span>${escapeHtml2(item.student)} \xB7 ${escapeHtml2(item.type)}</span><strong>${escapeHtml2(item.title)}</strong><small>${escapeHtml2(item.time)}</small></button></li>`).join("") : "<li><p>No fictional evidence matches this filter.</p></li>"}
        </ul>
        <section class="platform-teacher-evidence-detail" aria-labelledby="teacher-evidence-detail-title" tabindex="-1">
          ${selected ? `<p class="platform-evidence-type">${escapeHtml2(selected.type)}</p><h4 id="teacher-evidence-detail-title">${escapeHtml2(selected.title)}</h4><p><strong>${escapeHtml2(selected.student)}</strong> \xB7 ${escapeHtml2(selected.activity)}</p><div class="platform-teacher-evidence-artifact" aria-label="Fictional evidence preview">${escapeHtml2(selected.detail)}</div><small>${escapeHtml2(selected.time)}</small>` : `<h4 id="teacher-evidence-detail-title">Choose fictional evidence</h4><p>Select an item to preview it.</p>`}
        </section>
      </div>
      <p class="platform-evidence-boundary">Preview only. No real student accounts, files, Google Drive, grades, comments, automated messages, or teacher-review history are connected.</p>
    </div>`;
}
function teacherLiveEvidenceMarkup() {
  const choices = (field) => ["All", ...new Set(teacherLiveEvidence.map((item) => item[field]).filter(Boolean))];
  const visible = teacherLiveEvidence.filter((item) => Object.entries(teacherLiveEvidenceFilters).every(([field, value]) => value === "All" || item[field] === value));
  const selected = visible.find((item) => item.id === teacherLiveEvidenceSelection);
  const displayType = (item) => item.evidenceType || "Photo";
  const savedLabel = (item) => item.savedAt ? new Date(item.savedAt).toLocaleString() : "Saved in pilot Drive";
  return `<div class="platform-live-evidence" data-live-evidence-inbox>
    <div class="platform-actions"><button class="platform-button platform-button-secondary" type="button" data-action="evidence-teacher-refresh">Refresh Live Evidence</button></div>
    <p role="status" aria-live="polite">${escapeHtml2(teacherLiveEvidenceNotice)}</p>
    ${teacherLiveEvidence.length ? `<div class="platform-live-evidence-filters" aria-label="Filter persistent fictional evidence">
      ${[["studentId", "Student"], ["activity", "Activity"], ["evidenceType", "Evidence type"]].map(([field, label]) => `<label>${label}<select data-live-evidence-filter="${field}">${choices(field).map((value) => `<option value="${escapeHtml2(value)}"${teacherLiveEvidenceFilters[field] === value ? " selected" : ""}>${escapeHtml2(value)}</option>`).join("")}</select></label>`).join("")}
    </div><div class="platform-teacher-evidence-layout"><ul class="platform-teacher-evidence-list" aria-label="Persistent fictional evidence">
      ${visible.length ? visible.map((item) => `<li><button type="button" data-action="evidence-teacher-live-open" data-evidence-id="${escapeHtml2(item.id)}" aria-pressed="${item.id === teacherLiveEvidenceSelection}"><span>${escapeHtml2(item.studentId)} \xB7 ${escapeHtml2(displayType(item))}</span><strong>${escapeHtml2(displayType(item))} evidence</strong><small>${escapeHtml2(item.activity)} \xB7 ${escapeHtml2(savedLabel(item))}</small></button></li>`).join("") : "<li>No evidence matches these filters.</li>"}
    </ul><section class="platform-teacher-evidence-detail" aria-label="Live fictional evidence preview">
      ${selected ? `<p class="platform-evidence-type">Live Drive pilot</p><h4>${escapeHtml2(displayType(selected))} evidence</h4><p>${escapeHtml2(selected.studentId)} \xB7 ${escapeHtml2(selected.activity)} \xB7 ${escapeHtml2(savedLabel(selected))}</p><small class="platform-live-evidence-filename">Drive file: ${escapeHtml2(selected.name)}</small>${teacherLiveEvidencePreviewUrl ? `<img class="platform-live-evidence-preview" src="${teacherLiveEvidencePreviewUrl}" alt="Fictional student visual evidence preview" tabindex="-1">` : `<p>Choose this item to load its protected visual preview.</p>`}` : `<p>Select a live submission to preview it.</p>`}
    </section></div>` : ""}
  </div>`;
}
function governanceSimulationMarkup({ policyReady }) {
  const state = evidenceGovernanceSimulation.read();
  const selected = teacherLiveEvidence.find((item) => item.id === teacherLiveEvidenceSelection) || PILOT_TEACHER_EVIDENCE.find((item) => item.id === teacherEvidenceSelection) || PILOT_TEACHER_EVIDENCE[0];
  const evidenceId = selected?.id || "fictional-evidence-preview";
  const evidenceLabel = selected?.name || selected?.title || "Fictional visual evidence";
  const pending = state.status === GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN;
  const finished = [GOVERNANCE_SIMULATION_STATUS.APPROVED_FOR_TRASH, GOVERNANCE_SIMULATION_STATUS.REJECTED, GOVERNANCE_SIMULATION_STATUS.CANCELED].includes(state.status);
  const statusMessages = {
    [GOVERNANCE_SIMULATION_STATUS.EMPTY]: policyReady ? "Ready to simulate a teacher request. No Drive file will change." : "Save the governance draft before starting a simulation.",
    [GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN]: "Pending fictional administrator review. The evidence remains unchanged.",
    [GOVERNANCE_SIMULATION_STATUS.APPROVED_FOR_TRASH]: "Approved for recoverable-trash simulation. No Drive file was moved or deleted.",
    [GOVERNANCE_SIMULATION_STATUS.REJECTED]: "Request rejected. The evidence remains unchanged.",
    [GOVERNANCE_SIMULATION_STATUS.CANCELED]: "Request canceled. The evidence remains unchanged."
  };
  return `<div data-governance-simulation>
    <p class="platform-command-label">Fictional approval workflow \xB7 no Drive changes</p>
    <h3 id="governance-simulation-title">Governance Enforcement Simulation</h3>
    <p>Practice the lowest-support approval path before production: teacher request, administrator decision, recoverable trash, and an audit history.</p>
    <p class="platform-governance-selected"><strong>Selected fictional evidence:</strong> ${escapeHtml2(evidenceLabel)}</p>
    ${state.status === GOVERNANCE_SIMULATION_STATUS.EMPTY ? `<form data-form="governance-simulation-request" novalidate>
      <input type="hidden" name="evidenceId" value="${escapeHtml2(evidenceId)}"><input type="hidden" name="evidenceLabel" value="${escapeHtml2(evidenceLabel)}">
      <label>Reason for the request<textarea name="reason" maxlength="240" required placeholder="Example: Course ended and the approved retention period has passed"></textarea></label>
      <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="exportOffered" value="yes" required><span>Confirm that a teacher export was offered before this request.</span></label>
      <button type="submit"${policyReady ? "" : " disabled"}>Submit Fictional Request</button>
    </form>` : ""}
    ${pending ? `<form data-form="governance-simulation-decision" novalidate>
      <label>Fictional reviewer label<input name="reviewer" maxlength="80" placeholder="Example: District administrator" required></label>
      <label>Decision note<textarea name="note" maxlength="240" required></textarea></label>
      <div class="platform-actions"><button type="submit" name="decision" value="approve">Approve Recoverable Trash</button><button type="submit" name="decision" value="reject">Reject Request</button><button type="button" data-action="governance-simulation-cancel">Cancel Request</button></div>
    </form>` : ""}
    ${finished ? `<button type="button" data-action="governance-simulation-reset">Start Another Simulation</button>` : ""}
    <p class="platform-error" data-governance-simulation-error role="alert" hidden></p>
    <p class="platform-evidence-governance-status" data-state="${pending ? "pending" : finished ? "saved" : "draft-required"}" data-governance-simulation-status role="status" aria-live="polite">${statusMessages[state.status]}</p>
    <h4>Simulation audit history</h4>
    ${state.audit.length ? `<ol class="platform-governance-audit">${state.audit.map((item) => `<li><strong>${escapeHtml2(item.action.replaceAll("_", " "))}</strong><span>${escapeHtml2(item.detail)}</span><small>${escapeHtml2(new Date(item.at).toLocaleString())}</small></li>`).join("")}</ol>` : "<p>No simulated governance events yet.</p>"}
    <p class="platform-evidence-boundary"><strong>Production boundary:</strong> this workflow never deletes, trashes, moves, or exports a real Google Drive file.</p>
  </div>`;
}
function googleConnectionPreviewMarkup() {
  const state = googleConnectionPreview.read();
  const productionReadiness = assessGoogleOAuthReadiness();
  const consentOpen = state.status === GOOGLE_CONNECTION_PREVIEW_STATUS.CONSENT_PREVIEW;
  const connected = state.status === GOOGLE_CONNECTION_PREVIEW_STATUS.CONNECTED_PREVIEW;
  return `<div data-google-connection-preview>
    <p class="platform-command-label">Production experience preview \xB7 teacher only</p>
    <h3 id="google-connection-preview-title">Connect Teacher Google Drive</h3>
    <p>This is the intended low-support subscription flow. It demonstrates what teachers will see after production OAuth is configured.</p>
    <div class="platform-google-connection-summary">
      <p><strong>Teacher:</strong> Signs in and approves once</p>
      <p><strong>Students:</strong> No Google sign-in or Drive permission</p>
      <p><strong>Access:</strong> Only files created or selected through THINKamigBOB</p>
    </div>
    ${!consentOpen && !connected ? `<button type="button" data-action="google-connection-preview-begin">Preview Connect Google Drive</button>` : ""}
    ${consentOpen ? `<form data-form="google-connection-preview" novalidate>
      <div class="platform-google-consent-preview" role="group" aria-labelledby="google-consent-preview-title">
        <h4 id="google-consent-preview-title">Permission preview</h4>
        <p>THINKamigBOB would request permission to create and manage only its own evidence files\u2014not view the teacher\u2019s entire Drive.</p>
        <code>${GOOGLE_DRIVE_FILE_SCOPE}</code>
      </div>
      <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="teacherConfirmed" value="yes"> I understand that the teacher\u2014not students\u2014authorizes this connection.</label>
      <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="studentBoundaryConfirmed" value="yes"> Students will join THINKamigBOB without Google accounts or Drive permissions.</label>
      <div class="platform-actions"><button type="submit">Simulate Teacher Approval</button><button type="button" data-action="google-connection-preview-cancel">Cancel</button></div>
    </form>` : ""}
    ${connected ? `<div class="platform-google-connected-preview"><strong>Connection preview complete</strong><p>Future folder: ${escapeHtml2(state.folderName)}</p><p>Narrow permission: <code>drive.file</code></p><button type="button" data-action="google-connection-preview-disconnect">Disconnect Preview</button></div>` : ""}
    <p class="platform-error" data-google-connection-preview-error role="alert" hidden></p>
    <p class="platform-evidence-drive-status" data-state="${connected ? "prepared" : "not-configured"}" role="status" aria-live="polite">${connected ? "Preview connected for this browser session. No Google account or Drive data was accessed." : consentOpen ? "Review the narrow teacher permission and student boundary." : "Not connected. Production Google OAuth credentials have not been configured."}</p>
    <details class="platform-google-oauth-readiness">
      <summary>Production connection readiness: ${productionReadiness.readyCount}/${productionReadiness.totalCount} gates complete</summary>
      <ul>${productionReadiness.gates.map((gate) => `<li data-state="${gate.ready ? "ready" : "pending"}"><span aria-hidden="true">${gate.ready ? "\u2713" : "\u25CB"}</span>${escapeHtml2(gate.label)}</li>`).join("")}</ul>
      <p>The production service will use server endpoints for status, connection, callback, and disconnect. OAuth secrets and teacher refresh tokens must never enter browser code.</p>
      <small>Connection start: <code>${GOOGLE_OAUTH_ENDPOINTS.start}</code></small>
    </details>
    <p class="platform-evidence-boundary">Preview only. No OAuth token, Google identity, school account, or Drive file is created or stored.</p>
  </div>`;
}
function shell(content, { title, eyebrow = "Platform Foundation", subtitle = "", headingAction = "", signedIn = false, teacherContext = null } = {}) {
  document.title = `${title} | THINKamigBOB`;
  const activeTeacherRoute = currentRoute();
  return `
    <header class="platform-header">
      <a class="platform-brand" href="#${ROUTES.WELCOME}" aria-label="THINKamigBOB Platform home">
        <span class="platform-brand-mark" aria-hidden="true">BOB</span>
        <span class="platform-brand-copy">
          <strong>THINKamigBOB</strong>
          <small>STEM Learning Platform</small>
          ${teacherContext ? `<span class="platform-amig-meaning" aria-label="AMIG means Ask, Make, Improve, Grow"><b>AMIG</b><span>Ask <i aria-hidden="true">\u2022</i> Make <i aria-hidden="true">\u2022</i> Improve <i aria-hidden="true">\u2022</i> Grow</span></span>` : ""}
        </span>
      </a>
      ${teacherContext ? `
        <nav class="platform-teacher-menu" aria-label="Teacher tools">
          <details class="platform-teacher-menu-category${activeTeacherRoute === ROUTES.TEACHER_DASHBOARD ? " is-active" : ""}"><summary>Today</summary><div class="platform-teacher-menu-panel"><strong class="platform-teacher-menu-heading">Teacher Command Center</strong><a href="#${ROUTES.TEACHER_DASHBOARD}">Run Today\u2019s Class</a><a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-todays-resources">Today\u2019s Resources</a><a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-live-lesson-dashboard">Live Lesson Dashboard</a></div></details>
          <details class="platform-teacher-menu-category${activeTeacherRoute === ROUTES.TEACHER_CLASSES ? " is-active" : ""}"><summary>Classes</summary><div class="platform-teacher-menu-panel"><strong class="platform-teacher-menu-heading">Manage Classes</strong><a href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-schedule">Class Schedule</a><a href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-sharing">Share Setup &amp; Messages</a><a href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-create-classroom">Create Classroom &amp; Add Students</a><a href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-setup-tools">Connections &amp; Safeguards</a></div></details>
          <details class="platform-teacher-menu-category"><summary>Evidence</summary><div class="platform-teacher-menu-panel"><a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-evidence-tools">Student Evidence</a></div></details>
          <details class="platform-teacher-menu-category"><summary>Account</summary><div class="platform-teacher-menu-panel"><button type="button" data-action="reserved-nav" data-label="Settings">Settings</button><button type="button" data-action="sign-out">Sign Out</button></div></details>
        </nav>
      ` : signedIn ? '<button class="platform-button platform-button-quiet" type="button" data-action="sign-out">Sign out</button>' : ""}
    </header>
    ${teacherContext ? `<aside class="platform-teacher-context" aria-label="Current teacher and class"><span><small>Teacher</small><strong>${escapeHtml2(teacherContext.teacherName)}</strong></span><span><small>Current class</small><strong>${escapeHtml2(teacherContext.className)}</strong></span><span><small>Current period</small><strong>${escapeHtml2(teacherContext.periodLabel)}</strong></span></aside>` : ""}
    <main id="platform-main" class="platform-main" tabindex="-1">
      <div class="platform-page-heading">
        <p class="platform-eyebrow">${escapeHtml2(eyebrow)}</p>
        <h1>${escapeHtml2(title)}</h1>
        ${subtitle || headingAction ? `<div class="platform-page-heading-bottom">
          ${subtitle ? `<p class="platform-page-subtitle">${escapeHtml2(subtitle)}</p>` : ""}
          ${headingAction}
        </div>` : ""}
      </div>
      ${content}
    </main>
    <footer class="platform-footer">PB-001 development preview \u2022 Production accounts and persistent identity are not yet connected.</footer>
  `;
}
function fixtureNotice(details = "") {
  return `
    <aside class="platform-dev-notice" aria-label="Development fixture notice">
      <strong>Development preview</strong>
      <p>${escapeHtml2(DEVELOPMENT_FIXTURE_NOTICE)}</p>
      ${details}
    </aside>
  `;
}
function welcomeView() {
  return shell(`
    <section class="platform-hero">
      <p class="platform-lead">A clear starting point for teachers and students.</p>
      <div class="platform-entry-grid">
        <article class="platform-entry-card">
          <span class="platform-card-icon" aria-hidden="true">T</span>
          <h2>Teachers</h2>
          <p>Open the development login or review the future account-creation path.</p>
          <div class="platform-actions">
            <a class="platform-button platform-button-primary" href="#${ROUTES.PREVIEW_TEACHER}">Open Teacher Preview \u2014 No Sign-In</a>
            <a class="platform-button platform-button-primary" href="#${ROUTES.TEACHER_LOGIN}">Teacher Login</a>
            <a class="platform-button platform-button-secondary" href="#${ROUTES.TEACHER_CREATE}">Create Teacher Account</a>
          </div>
        </article>
        <article class="platform-entry-card">
          <span class="platform-card-icon" aria-hidden="true">S</span>
          <h2>Students</h2>
          <p>Enter with a class code, select your roster name, and use your private identifier.</p>
          <div class="platform-actions"><a class="platform-button platform-button-primary" href="#${ROUTES.PREVIEW_STUDENT}">Open Student Preview \u2014 No Codes</a><a class="platform-button platform-button-secondary" href="#${ROUTES.STUDENT_ENTRY}">Student Entry</a></div>
        </article>
      </div>
    </section>
  `, { title: "Welcome" });
}
function teacherLoginView() {
  const access = `<details><summary>Show development test access</summary><dl><dt>Email</dt><dd><code>${escapeHtml2(DEVELOPMENT_FIXTURE_ACCESS.teacherEmail)}</code></dd><dt>Password</dt><dd><code>${escapeHtml2(DEVELOPMENT_FIXTURE_ACCESS.teacherPassword)}</code></dd></dl></details>`;
  return shell(`
    <div class="platform-form-layout">
      <section class="platform-panel platform-production-entry" aria-labelledby="teacher-production-entry-title">
        <p class="platform-context-label">Production sign-in foundation</p>
        <h2 id="teacher-production-entry-title">Continue with Google</h2>
        <p>Teachers will sign in with Google. Drive access is requested separately only when a teacher chooses to connect Evidence.</p>
        <div data-production-google-signin></div>
        ${productionIdentityConfig.googleEnabled ? "" : '<button class="platform-button platform-button-primary" type="button" disabled aria-describedby="teacher-production-entry-status">Continue with Google</button>'}
        <p id="teacher-production-entry-status" class="platform-entry-status">${productionIdentityConfig.googleEnabled ? "Ready for secure Google sign-in." : "Setup required. No Google sign-in request will run in this local pilot."}</p>
      </section>
      <form class="platform-panel platform-form" data-form="teacher-login" novalidate>
        <p class="platform-context-label">Local fictional pilot</p>
        <a class="platform-button platform-button-primary platform-preview-entry-button" href="#${ROUTES.PREVIEW_TEACHER}">Open Teacher Preview \u2014 No Sign-In</a>
        <p class="platform-entry-status">Uses fictional local preview data only. No Google account or password is needed.</p>
        <hr>
        <div class="platform-field">
          <label for="teacher-email">Email</label>
          <input id="teacher-email" name="email" type="email" autocomplete="username" required>
        </div>
        <div class="platform-field">
          <label for="teacher-password">Password</label>
          <input id="teacher-password" name="password" type="password" autocomplete="current-password" required>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit">Continue to Teacher Dashboard</button>
        <div class="platform-text-links">
          <a href="#${ROUTES.TEACHER_RECOVERY}">Forgot password?</a>
          <a href="#${ROUTES.WELCOME}">Back to Welcome</a>
        </div>
      </form>
      ${fixtureNotice(access)}
    </div>
  `, { title: "Teacher Login", eyebrow: "Teacher entry" });
}
function teacherCreateView() {
  return shell(`
    <section class="platform-panel platform-shell-message">
      <h2>Teacher account creation is reserved</h2>
      <p>Production registration requires an approved authentication service. No account will be created in PB-001.</p>
      <div class="platform-actions">
        <a class="platform-button platform-button-primary" href="#${ROUTES.TEACHER_LOGIN}">Go to Teacher Login</a>
        <a class="platform-button platform-button-secondary" href="#${ROUTES.WELCOME}">Back to Welcome</a>
      </div>
    </section>
  `, { title: "Create Teacher Account", eyebrow: "Future account service" });
}
function teacherRecoveryView() {
  return shell(`
    <section class="platform-panel platform-shell-message">
      <h2>Password recovery is reserved</h2>
      <p>Email verification and password recovery require an approved authentication service. No recovery message will be sent in PB-001.</p>
      <div class="platform-actions">
        <a class="platform-button platform-button-primary" href="#${ROUTES.TEACHER_LOGIN}">Return to Teacher Login</a>
        <a class="platform-button platform-button-secondary" href="#${ROUTES.WELCOME}">Back to Welcome</a>
      </div>
    </section>
  `, { title: "Password Recovery", eyebrow: "Future account service" });
}
function studentEntryView() {
  const access = `<details><summary>Show development class code</summary><p><code>${escapeHtml2(DEVELOPMENT_FIXTURE_ACCESS.classCode)}</code></p></details>`;
  return shell(`
    <div class="platform-form-layout">
      <form class="platform-panel platform-production-entry" data-form="production-student-entry" aria-labelledby="student-production-entry-title" novalidate>
        <p class="platform-context-label">Production classroom entry foundation</p>
        <h2 id="student-production-entry-title">Enter your classroom</h2>
        <p>Students will use a class code and their individual student code. Students will not sign in to Google.</p>
        <div class="platform-field">
          <label for="production-class-code">Class Code</label>
          <input id="production-class-code" name="classCode" type="text"${productionIdentityConfig.studentEnabled ? "" : " disabled"} autocomplete="off" autocapitalize="characters" placeholder="Provided by teacher" required>
        </div>
        <div class="platform-field">
          <label for="production-student-code">Student Code</label>
          <input id="production-student-code" name="studentCode" type="password"${productionIdentityConfig.studentEnabled ? "" : " disabled"} autocomplete="off" placeholder="Private student code" required>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit"${productionIdentityConfig.studentEnabled ? "" : " disabled"}>Open Student Dashboard</button>
        <p class="platform-entry-status">${productionIdentityConfig.studentEnabled ? "Ready for your teacher-provided codes." : "Student sign-in is not open yet. Continue with the fictional pilot entry beside this preview."}</p>
      </form>
      <form class="platform-panel platform-form" data-form="student-entry" novalidate>
        <p class="platform-context-label">Local fictional pilot</p>
        <button class="platform-button platform-button-primary platform-preview-entry-button" type="button" data-action="open-student-preview">Open Student Preview \u2014 No Codes</button>
        <p class="platform-entry-status">Opens the fictional Ada Rivera preview in Preview STEM Class.</p>
        <hr>
        <p>Ask your teacher for your class code.</p>
        <div class="platform-field">
          <label for="class-code">Class Code</label>
          <input id="class-code" name="classCode" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" maxlength="24" required>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit">Find My Class</button>
        <a class="platform-back-link" href="#${ROUTES.WELCOME}">Back to Welcome</a>
      </form>
      ${fixtureNotice(access)}
    </div>
  `, { title: "Student Entry", eyebrow: "Step 1 of 3" });
}
function classroomSetupMarkup() {
  const classroom = oneTimeClassroomCodes;
  return `<section id="teacher-create-classroom" class="platform-command-card platform-classroom-setup platform-manage-step" aria-labelledby="classroom-setup-title" data-classroom-setup data-manage-step="1">
    <div class="platform-manage-step-heading"><span aria-hidden="true">1</span><div><p class="platform-command-label">Start here</p><h3 id="classroom-setup-title">Create a Class &amp; Add Students</h3><p>Give the class a name, then type or paste one student name per line.</p></div></div>
    <form data-form="production-classroom-setup" novalidate>
      <label for="production-classroom-name">Class name</label>
      <input id="production-classroom-name" name="name" maxlength="100"${productionIdentityConfig.enabled ? "" : " disabled"} required placeholder="Example: STEM Lab \u2014 Period 2">
      <label for="production-student-labels">Student Names <small>1\u201340; one per line</small></label>
      <textarea id="production-student-labels" name="studentLabels" rows="7"${productionIdentityConfig.enabled ? "" : " disabled"} required placeholder="Ava&#10;Liam&#10;Mia"></textarea>
      <small class="platform-field-help">These names appear on student sign-in and each student\u2019s home page.</small>
      <details class="platform-optional-class-tools">
        <summary><span>\u{1F3A9} Optional: Make Funny NameBobs &amp; Limericks</span><small>Open only if you want playful student names.</small></summary>
        <div>
          <div class="platform-namebob-actions"><button type="button" data-action="generate-namebobs"${productionIdentityConfig.enabled ? "" : " disabled"}>Generate Funny NameBobs</button><span>The generated list stays editable.</span></div>
          <div class="platform-namebob-retry">
            <label for="production-namebob-retry">Try a different NameBob <small>Enter one student's first name</small></label>
            <div><input id="production-namebob-retry" name="retryName" maxlength="24"${productionIdentityConfig.enabled ? "" : " disabled"} placeholder="Example: Ava"><button type="button" data-action="retry-namebob"${productionIdentityConfig.enabled ? "" : " disabled"}>Retry This Name</button></div>
          </div>
          <p class="platform-namebob-help">Each label keeps the student's first name and adds a funny rhyming Bob name, such as Savannah Bobanana, Miley SmileyBob, or Mariela Bobarella. Every student in the class gets a different Bob name.</p>
          <div class="platform-namebob-retry platform-namebob-limerick">
            <label>Make funny limericks <small>Creates one for the whole class and one for every student</small></label>
            <div><button type="button" data-action="generate-class-namebob-limerick"${productionIdentityConfig.enabled ? "" : " disabled"}>Make Class + Student Limericks</button></div>
            <blockquote data-namebob-limerick-output hidden></blockquote>
          </div>
        </div>
      </details>
      <p class="platform-entry-status" data-namebob-status role="status" aria-live="polite">Paste a class list, then generate NameBobs\u2014or enter your own labels.</p>
      <button class="platform-manage-primary-action" type="submit"${productionIdentityConfig.enabled ? "" : " disabled"}>Create Class &amp; Student Codes</button>
      <p class="platform-error" data-error role="alert" hidden></p>
      <p class="platform-entry-status" role="status" aria-live="polite">${productionIdentityConfig.enabled ? "Ready. Codes will be shown once after the class is created." : "Setup preview only. Production identity stays off on localhost and no classroom will be created."}</p>
    </form>
    ${classroom ? `<section class="platform-code-sheet" aria-labelledby="classroom-code-sheet-title">
      <p class="platform-code-warning">Print this sheet now. Student codes are shown once and are not saved in the browser.</p>
      <h4 id="classroom-code-sheet-title">${escapeHtml2(classroom.name)}</h4>
      <p class="platform-class-code"><span>Class code</span><strong>${escapeHtml2(classroom.classCode)}</strong></p>
      <table><thead><tr><th>Student</th><th>Private student code</th></tr></thead><tbody>${classroom.students.map((student) => `<tr><td>${escapeHtml2(student.displayLabel)}</td><td><code>${escapeHtml2(student.studentCode)}</code></td></tr>`).join("")}</tbody></table>
      <div class="platform-actions platform-code-sheet-actions"><button type="button" data-action="print-classroom-codes">Print Code Sheet</button><button type="button" data-action="close-classroom-codes">Close &amp; Hide Codes</button></div>
    </section>` : ""}
    <a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">\u2190 Back to Today</a>
  </section>`;
}
function studentRosterView(state) {
  const classRecord = getClassById(state.pendingClassId);
  const roster = classRecord ? getRosterForClass(classRecord.id) : [];
  const rosterButtons = roster.map((student) => `
    <button class="platform-roster-button" type="button" data-action="select-student" data-student-id="${escapeHtml2(student.id)}">
      ${escapeHtml2(student.displayName)}
    </button>
  `).join("");
  return shell(`
    <section class="platform-panel">
      <p class="platform-context-label">${escapeHtml2(classRecord?.displayName ?? "Preview class")}</p>
      <h2>Select your name</h2>
      <p>Choose only your own roster name.</p>
      <div class="platform-roster-grid">${rosterButtons}</div>
      <a class="platform-back-link" href="#${ROUTES.STUDENT_ENTRY}">Use a different class code</a>
    </section>
  `, { title: "Roster Selection", eyebrow: "Step 2 of 3" });
}
function studentIdentifierView(state) {
  const student = getStudentById(state.pendingStudentId);
  const identifier = getDevelopmentIdentifier(state.pendingStudentId);
  const access = `<details><summary>Show this fictional student\u2019s test identifier</summary><p><code>${escapeHtml2(identifier)}</code></p></details>`;
  return shell(`
    <div class="platform-form-layout">
      <form class="platform-panel platform-form" data-form="student-identifier" novalidate>
        <p class="platform-context-label">Selected student</p>
        <h2>${escapeHtml2(student?.displayName ?? "Student")}</h2>
        <div class="platform-field">
          <label for="private-identifier">Private Identifier</label>
          <input id="private-identifier" name="identifier" type="password" inputmode="numeric" autocomplete="off" maxlength="20" required aria-describedby="identifier-help">
          <small id="identifier-help">Enter the private identifier provided by your teacher.</small>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit">Open Student Dashboard</button>
        <a class="platform-back-link" href="#${ROUTES.STUDENT_ROSTER}">Choose a different name</a>
      </form>
      ${fixtureNotice(access)}
    </div>
  `, { title: "Private Identifier", eyebrow: "Step 3 of 3" });
}
function teacherSetupMarkup() {
  const driveSetupState = evidenceDriveSetup.read();
  const driveSetupPrepared = driveSetupState.status === DRIVE_SETUP_STATUS.PREPARED;
  const governanceState = evidenceGovernance.read();
  const governanceSaved = governanceState.status === EVIDENCE_GOVERNANCE_STATUS.DRAFT_SAVED;
  const governanceOptions = (field, placeholder) => `<option value="">${placeholder}</option>${EVIDENCE_GOVERNANCE_OPTIONS[field].map((value) => `<option value="${escapeHtml2(value)}"${governanceState[field] === value ? " selected" : ""}>${escapeHtml2(value)}</option>`).join("")}`;
  return `
    <section class="platform-command-card platform-evidence-drive-setup" aria-labelledby="evidence-drive-setup-title">
      <p class="platform-command-label">Drive readiness \xB7 fictional pilot</p>
      <h3 id="evidence-drive-setup-title">Pilot Drive Connection</h3>
      <p>The fictional Apps Script pilot is connected. This form prepares a future production school connection; it does not authorize a real teacher account.</p>
      <dl class="platform-evidence-drive-destination">
        <div><dt>Pilot folder</dt><dd><a href="${PILOT_DRIVE_DESTINATION.folderUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml2(PILOT_DRIVE_DESTINATION.folderName)}</a></dd></div>
        <div><dt>Account</dt><dd>${escapeHtml2(PILOT_DRIVE_DESTINATION.accountLabel)}</dd></div>
        <div><dt>Connection</dt><dd>Persistent fictional review validated</dd></div>
      </dl>
      <form data-form="evidence-drive-setup" novalidate>
        <label for="evidence-drive-folder-name">Teacher-owned destination folder name</label>
        <input id="evidence-drive-folder-name" name="folderName" maxlength="80" value="${escapeHtml2(driveSetupState.folderName)}" required>
        <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="privacyConfirmed" value="yes"${driveSetupPrepared ? " checked" : ""}> Keep student uploads private to authorized classroom staff; students must never browse other students\u2019 files.</label>
        <button type="submit">Prepare Future School Connection</button>
        <p class="platform-error" data-evidence-drive-error role="alert" hidden></p>
        <p class="platform-evidence-drive-status" data-evidence-drive-status data-state="${driveSetupPrepared ? "prepared" : "not-configured"}" role="status" aria-live="polite">${driveSetupPrepared ? `Future setup prepared for \u201C${escapeHtml2(driveSetupState.folderName)}.\u201D Production administrator OAuth is still required.` : "Fictional pilot connected. Production school Google OAuth is not configured."}</p>
      </form>
      <ul class="platform-evidence-drive-gates" aria-label="Requirements before real uploads">
        <li>Teacher-authorized Apps Script pilot endpoint is deployed</li>
        <li>Active upload secret remains outside student-facing source code</li>
        <li>Server-side upload broker so student devices receive no teacher credentials</li>
        <li>Retention, deletion, audit, and recovery rules</li>
      </ul>
    </section>
    <section class="platform-command-card platform-google-connection-preview" aria-labelledby="google-connection-preview-title">
      ${googleConnectionPreviewMarkup()}
    </section>
    <section class="platform-command-card platform-evidence-governance" aria-labelledby="evidence-governance-title">
      <p class="platform-command-label">Evidence governance \xB7 policy foundation</p>
      <h3 id="evidence-governance-title">Evidence Governance Draft</h3>
      <p>Document proposed safeguards before any real account connection. This draft does not delete, move, export, or change any Drive file.</p>
      <form data-form="evidence-governance" novalidate>
        <label>Retention rule<select name="retention" required>${governanceOptions("retention", "Choose a retention rule")}</select></label>
        <label>Deletion authority<select name="deletionAuthority" required>${governanceOptions("deletionAuthority", "Choose who may approve deletion")}</select></label>
        <label>Recovery safeguard<select name="recovery" required>${governanceOptions("recovery", "Choose a recovery safeguard")}</select></label>
        <label>Export safeguard<select name="exportRule" required>${governanceOptions("exportRule", "Choose an export safeguard")}</select></label>
        <button type="submit">Save Governance Draft</button>
        <p class="platform-error" data-evidence-governance-error role="alert" hidden></p>
        <p class="platform-evidence-governance-status" data-evidence-governance-status data-state="${governanceSaved ? "saved" : "draft-required"}" role="status" aria-live="polite">${governanceSaved ? "Governance draft saved for this browser session. It is not an enforced policy." : "Draft required. School and legal approval are still required before real evidence use."}</p>
      </form>
    </section>
    <section class="platform-command-card platform-governance-simulation" aria-labelledby="governance-simulation-title">
      ${governanceSimulationMarkup({ policyReady: governanceSaved })}
    </section>`;
}
function classTimerScheduleMarkup(classId = "class-preview-1", { showBackToToday = true } = {}) {
  const schedule = classTimerSchedule.read();
  const library = messageLibrary.read();
  const timeZones = ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"];
  const soundOptions = (selected) => TIMER_SOUND_OPTIONS.map((sound) => `<option value="${sound}"${selected === sound ? " selected" : ""}>${sound}</option>`).join("");
  return `<section id="teacher-class-schedule" class="platform-classroom-setup platform-class-timer-schedule platform-manage-step" aria-labelledby="class-timer-schedule-title" data-manage-step="2">
    <div class="platform-manage-step-heading"><span aria-hidden="true">2</span><div><p class="platform-command-label">Set it once</p><h3 id="class-timer-schedule-title">Class Schedule</h3><p>Choose when this class meets. Detailed timer options are available below.</p></div></div>
    <form data-form="class-timer-schedule" novalidate>
      <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="enabled" value="yes"${schedule.enabled ? " checked" : ""}> Automatically run the timer on scheduled school days.</label>
      <fieldset><legend>Weekdays</legend>${WEEKDAYS.map((day) => `<label><input type="checkbox" name="weekdays" value="${day}"${schedule.weekdays.includes(day) ? " checked" : ""}> ${day}</label>`).join("")}</fieldset>
      <label>Class start time<input type="time" name="startTime" value="${schedule.startTime}" required></label>
      <label>Class duration in minutes<input type="number" name="durationMinutes" min="${MIN_LESSON_MINUTES}" max="${MAX_LESSON_MINUTES}" step="1" value="${schedule.durationMinutes}" required></label>
      <label>Time zone<select name="timeZone">${timeZones.map((zone) => `<option value="${zone}"${schedule.timeZone === zone ? " selected" : ""}>${zone.replaceAll("_", " ")}</option>`).join("")}</select></label>
      <details class="platform-optional-class-tools platform-schedule-options">
        <summary><span>Optional Timer &amp; Message Settings</span><small>Pomodoro stages, sounds, and scheduled messages</small></summary>
        <div>
      <div class="platform-pomodoro-choice">
        <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="pomodoroEnabled" value="yes"${schedule.pomodoroEnabled ? " checked" : ""}> <strong>Use a color-coded Pomodoro class timer</strong></label>
        <p>Break the class into four visible stages: <strong>Blue</strong> for the opening, <strong>green</strong> for work time, <strong>gold</strong> for the warning, and <strong>red</strong> for wrap-up. The colors and stage names appear on the Teacher Command Center, floating timer, and Classroom Display.</p>
      </div>
      <fieldset class="platform-class-timer-phases"><legend>Pomodoro stages and start times</legend>
        ${schedule.phases.map((phase, index) => `<div data-phase-color="${phase.color}"><span>${phase.color === "purple" ? "blue" : phase.color === "yellow" ? "gold" : phase.color}</span><label>Phase name<input name="phaseName" maxlength="40" value="${escapeHtml2(phase.name)}" required></label><label>Starts at minute<input type="number" name="phaseStart" data-phase-start="${phase.key}" min="0" max="${Math.max(0, schedule.durationMinutes - 1)}" step="1" value="${phase.startMinute}"${index === 0 ? " readonly" : ""} required></label></div>`).join("")}
      </fieldset>
      <button class="platform-button platform-button-secondary" type="button" data-action="timer-recommend-phases">Use Recommended Phase Times</button>
      <fieldset class="platform-timer-sound-settings"><legend>Timer sounds</legend>
        <div><label>When yellow begins<select name="yellowSound">${soundOptions(schedule.yellowSound)}</select><input type="file" name="yellowSoundFile" accept="audio/*" aria-label="Upload a custom yellow phase sound"><small>${schedule.yellowCustomAudio ? "Custom sound saved in this browser." : "Optional custom audio, 750 KB maximum."}</small></label><button type="button" data-action="timer-test-sound" data-sound-field="yellowSound">Test</button></div>
        <div><label>When red begins<select name="redSound">${soundOptions(schedule.redSound)}</select><input type="file" name="redSoundFile" accept="audio/*" aria-label="Upload a custom red phase sound"><small>${schedule.redCustomAudio ? "Custom sound saved in this browser." : "Optional custom audio, 750 KB maximum."}</small></label><button type="button" data-action="timer-test-sound" data-sound-field="redSound">Test</button></div>
        <div><label>When the timer ends<select name="endSound">${soundOptions(schedule.endSound)}</select><input type="file" name="endSoundFile" accept="audio/*" aria-label="Upload a custom timer completion sound"><small>${schedule.endCustomAudio ? "Custom sound saved in this browser." : "Optional custom audio, 750 KB maximum."}</small></label><button type="button" data-action="timer-test-sound" data-sound-field="endSound">Test</button></div>
      </fieldset>
      <fieldset id="teacher-shared-message-library" class="platform-message-schedule"><legend>Shared Message Library</legend>
        <p>Create reusable messages, then choose which message starts with this class timer on each weekday.</p>
        <section class="platform-class-message-creator" aria-labelledby="class-message-creator-title">
          <h4 id="class-message-creator-title">Create and Save a Message</h4>
          <p>Messages saved here also appear in the Today-page Saved Message Library.</p>
          <label>Message title<input type="text" maxlength="60" data-class-message-title placeholder="Example: Monday warm-up"></label>
          <label>Message text<textarea maxlength="240" data-class-message-text placeholder="Type the message students should see."></textarea></label>
          <div class="platform-class-message-formatting">
            <label>Text color<select data-class-message-color>${TEACHER_MEMO_COLORS.map((value) => `<option value="${value}">${value.replaceAll("-", " ")}</option>`).join("")}</select></label>
            <label>Text size<select data-class-message-size>${TEACHER_MEMO_SIZES.map((value) => `<option value="${value}"${value === "extra-large" ? " selected" : ""}>${value.replaceAll("-", " ")}</option>`).join("")}</select></label>
            <label>Text style<select data-class-message-style>${TEACHER_MEMO_STYLES.map((value) => `<option value="${value}"${value === "bold" ? " selected" : ""}>${value.replaceAll("-", " + ")}</option>`).join("")}</select></label>
          </div>
          <button type="button" data-action="save-class-message">Save Message to Shared Library</button>
          <p data-class-message-status role="status" aria-live="polite">${library.messages.length} shared message${library.messages.length === 1 ? "" : "s"} available.</p>
        </section>
        <details class="platform-class-message-library"><summary>View Shared Message Library (${library.messages.length})</summary><div>${library.messages.length ? library.messages.map((message) => `<article><span><strong>${escapeHtml2(message.title)}</strong><small>${escapeHtml2(message.text)}</small></span><button type="button" data-action="delete-saved-message" data-message-id="${message.id}">Delete</button></article>`).join("") : `<p>No saved messages yet. Create one above or on the Today page.</p>`}</div></details>
        ${WEEKDAYS.map((day) => `<label>${day}<select data-message-assignment="${day}"><option value="">No automatic message</option>${library.messages.map((message) => `<option value="${message.id}"${library.assignments[`${classId}|${day}`] === message.id ? " selected" : ""}>${escapeHtml2(message.title)}</option>`).join("")}</select></label>`).join("")}
        <button type="button" data-action="save-message-assignments" data-class-id="${escapeHtml2(classId)}">Save Message Schedule</button>
      </fieldset>
        </div>
      </details>
      <button type="submit">Save Class Schedule</button>
      ${showBackToToday ? `<a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">\u2190 Back to Today</a>` : ""}
      <p class="platform-error" data-class-timer-schedule-error role="alert" hidden></p>
      <p class="platform-evidence-drive-status" data-class-timer-schedule-status role="status" aria-live="polite">${schedule.enabled ? `Scheduled for ${schedule.weekdays.join(", ")} at ${schedule.startTime} for ${schedule.durationMinutes} minutes.` : "Automatic timer is off. Manual timer controls remain available."}</p>
    </form>
  </section>`;
}
function saveQuickClassTimerSchedule(form) {
  if (!form) return { ok: false };
  const data = new FormData(form);
  const existing = classTimerSchedule.read();
  const phaseNames = data.getAll("phaseName");
  const phaseStarts = data.getAll("phaseStart");
  const result = classTimerSchedule.save({
    ...existing,
    enabled: data.get("enabled") === "yes",
    weekdays: data.getAll("weekdays"),
    startTime: String(data.get("startTime") ?? existing.startTime),
    durationMinutes: Number(data.get("durationMinutes")),
    timeZone: String(data.get("timeZone") ?? existing.timeZone),
    yellowSound: String(data.get("yellowSound") ?? existing.yellowSound),
    redSound: String(data.get("redSound") ?? existing.redSound),
    endSound: String(data.get("endSound") ?? existing.endSound),
    pomodoroEnabled: data.get("pomodoroEnabled") === "yes",
    phases: existing.phases.map((phase, index) => ({ ...phase, name: String(phaseNames[index] ?? phase.name), startMinute: Number(phaseStarts[index] ?? phase.startMinute) }))
  });
  const status = form.querySelector("[data-class-timer-schedule-status]");
  const error = form.querySelector("[data-class-timer-schedule-error]");
  if (result.ok) {
    preserveCurrentClassSetup(currentTeacherClass(session.read().teacherId)?.id);
    if (status) status.textContent = `${result.schedule.pomodoroEnabled ? "Pomodoro timer" : "Standard timer"} saved automatically at ${result.schedule.durationMinutes} minutes.`;
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  } else if (error) {
    error.textContent = result.reason === "invalid-phases" ? "Choose increasing Pomodoro phase times that occur before the class ends." : "Finish this schedule setting to save it.";
    error.hidden = false;
  }
  return result;
}
function applyScheduledClassTimer(classId = "class-preview-1") {
  const occurrence = classTimerSchedule.activeOccurrence();
  if (!occurrence.active || classTimerSchedule.wasApplied(occurrence.occurrence)) return occurrence;
  const current = lessonTimer.read();
  if (current.status === LESSON_TIMER_STATES.RUNNING || current.status === LESSON_TIMER_STATES.PAUSED) {
    classTimerSchedule.markApplied(occurrence.occurrence);
    return { ...occurrence, active: false, reason: "manual-timer-active" };
  }
  const result = lessonTimer.startScheduled(occurrence.durationMinutes, occurrence.remainingSeconds);
  if (result.ok) {
    const assigned = messageLibrary.assigned(classId, occurrence.weekday);
    if (assigned) teacherMemo.save(assigned.text, assigned);
    const board = scheduledWhiteboardFor(classId, occurrence);
    if (board?.displayImage || board?.image) {
      const memo = teacherMemo.read();
      teacherMemo.save(memo.text || board.title, { ...memo, image: board.displayImage || board.image });
    }
    classTimerSchedule.markApplied(occurrence.occurrence);
  }
  return occurrence;
}
function currentScheduledLessonTimerState() {
  const schedule = classTimerSchedule.readEffective();
  let state = lessonTimer.read();
  if (state.status === LESSON_TIMER_STATES.READY && state.durationSeconds !== schedule.durationMinutes * 60) {
    lessonTimer.setDuration(schedule.durationMinutes);
    state = lessonTimer.read();
  }
  return state;
}
function timerRingStyle(scheduleState) {
  if (!scheduleState?.active || !scheduleState.phase) return "--timer-elapsed:0%;--timer-main-start:20%;--timer-warning-start:70%;--timer-red-start:80%;";
  return `--timer-elapsed:${scheduleState.elapsedPercent}%;--timer-main-start:${scheduleState.mainStartPercent}%;--timer-warning-start:${scheduleState.warningStartPercent}%;--timer-red-start:${scheduleState.redStartPercent}%;`;
}
function presentationTimerViewMode() {
  if (classTimerSchedule.readEffective().pomodoroEnabled) return "pomodoro";
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  try {
    const stored = JSON.parse(window.localStorage.getItem(PRESENTATION_TIMER_VIEW_KEY) ?? "null");
    if (stored?.date === today && ["regular", "pomodoro"].includes(stored.mode)) return stored.mode;
  } catch {
  }
  return classTimerSchedule.readEffective().pomodoroEnabled ? "pomodoro" : "regular";
}
function setPresentationTimerViewMode(mode) {
  if (!["regular", "pomodoro"].includes(mode)) return;
  if (classTimerSchedule.readEffective().pomodoroEnabled && mode !== "pomodoro") return;
  try {
    window.localStorage.setItem(PRESENTATION_TIMER_VIEW_KEY, JSON.stringify({ date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), mode }));
  } catch {
  }
  syncLessonTimerPresentation();
}
function presentationTimerVisualState(timerState) {
  if (presentationTimerViewMode() === "regular") return { active: false, phase: null, fiveMinuteWarning: false, elapsedPercent: 0, mainStartPercent: 20, warningStartPercent: 70, redStartPercent: 80 };
  const schedule = { ...classTimerSchedule.readEffective(), pomodoroEnabled: true };
  const phaseState = evaluateTimerPhases(schedule, Math.max(0, timerState.durationSeconds - timerState.remainingSeconds));
  return { ...phaseState, active: true, manual: true };
}
function syncPresentationTimerViewControls(documentRef = document) {
  const mode = presentationTimerViewMode();
  const visual = presentationTimerVisualState(lessonTimer.read());
  documentRef.querySelectorAll("[data-timer-view-mode]").forEach((button) => {
    const selected = button.dataset.timerViewMode === mode;
    button.setAttribute("aria-pressed", String(selected));
  });
  documentRef.querySelectorAll('[data-smartboard-tool="timer"]').forEach((tool) => {
    tool.dataset.timerView = mode;
    tool.style.setProperty("--timer-elapsed", `${visual.elapsedPercent ?? 0}%`);
    tool.style.setProperty("--timer-main-start", `${visual.mainStartPercent ?? 20}%`);
    tool.style.setProperty("--timer-warning-start", `${visual.warningStartPercent ?? 70}%`);
    tool.style.setProperty("--timer-red-start", `${visual.redStartPercent ?? 80}%`);
  });
  documentRef.querySelectorAll("[data-timer-view-status]").forEach((status) => {
    status.textContent = mode === "pomodoro" ? "Showing today\u2019s Pomodoro wheel." : "Showing today\u2019s solid-color timer.";
  });
}
function currentTimerVisualState(timerState, scheduledState = classTimerSchedule.activeOccurrence()) {
  if (scheduledState.active) return scheduledState;
  if (timerState.status !== LESSON_TIMER_STATES.RUNNING && timerState.status !== LESSON_TIMER_STATES.PAUSED) return scheduledState;
  const phaseState = evaluateTimerPhases(classTimerSchedule.readEffective(), timerState.durationSeconds - timerState.remainingSeconds);
  return phaseState.phase ? { ...phaseState, active: true, manual: true } : scheduledState;
}
function smartboardToolSwitcherMarkup() {
  return "";
}
function currentActivitySideTimer() {
  if (activitySideTimer.status === "running") {
    activitySideTimer.remainingSeconds = Math.max(0, Math.ceil((activitySideTimer.endsAt - Date.now()) / 1e3));
    if (activitySideTimer.remainingSeconds === 0) activitySideTimer.status = "complete";
  }
  return activitySideTimer;
}
function syncActivitySideTimerPresentation() {
  const timer = currentActivitySideTimer();
  for (const documentRef of [document, classroomPresentationWindow?.document].filter(Boolean)) {
    documentRef.querySelectorAll("[data-activity-side-timer-output]").forEach((output) => {
      output.textContent = formatLessonTime(timer.remainingSeconds);
    });
    documentRef.querySelectorAll("[data-activity-side-timer-status]").forEach((status) => {
      status.textContent = timer.status === "complete" ? "Time is up" : timer.status === "running" ? "Activity timer running" : timer.status === "paused" ? "Activity timer paused" : "Ready for a class activity";
    });
    documentRef.querySelectorAll('[data-action="activity-side-timer-start"]').forEach((button) => {
      button.disabled = timer.status === "running";
    });
    documentRef.querySelectorAll('[data-action="activity-side-timer-pause"]').forEach((button) => {
      button.disabled = timer.status !== "running";
    });
  }
}
function handleActivitySideTimerAction(action) {
  const name = action.dataset.action;
  if (!name?.startsWith("activity-side-timer-")) return false;
  const timer = currentActivitySideTimer();
  if (name === "activity-side-timer-set") {
    const minutes = Math.max(1, Math.min(60, Number(action.dataset.activityMinutes || action.closest("[data-smartboard-tool]")?.querySelector("[data-activity-side-timer-minutes]")?.value || 5)));
    activitySideTimer = { durationSeconds: minutes * 60, remainingSeconds: minutes * 60, status: "ready", endsAt: 0 };
  }
  if (name === "activity-side-timer-start") {
    activitySideTimer.status = "running";
    activitySideTimer.endsAt = Date.now() + Math.max(1, timer.remainingSeconds) * 1e3;
  }
  if (name === "activity-side-timer-pause" && timer.status === "running") {
    currentActivitySideTimer();
    activitySideTimer.status = "paused";
    activitySideTimer.endsAt = 0;
  }
  if (name === "activity-side-timer-reset") activitySideTimer = { ...activitySideTimer, remainingSeconds: activitySideTimer.durationSeconds, status: "ready", endsAt: 0 };
  syncActivitySideTimerPresentation();
  return true;
}
function namePickerMarkup(roster) {
  const students2 = roster.map((student) => `<li data-name-picker-student="${escapeHtml2(student.id)}"><span>${escapeHtml2(student.displayName)}</span><button type="button" data-action="name-picker-toggle-student" data-student-id="${escapeHtml2(student.id)}">Remove</button></li>`).join("");
  return `<aside class="platform-smartboard-tool platform-name-picker-tool" data-smartboard-tool="names" hidden style="left: 24%; top: 8%; width: min(28rem, 82vw);"><header data-smartboard-drag-handle><strong>Name Picker</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Name Picker">\xD7</button></header><div class="platform-name-picker-wheel-wrap"><div class="platform-name-picker-pointer" aria-hidden="true"></div><div class="platform-name-picker-wheel" data-name-picker-wheel style="--name-picker-rotation: 0deg"><output data-name-picker-result>Ready</output></div></div><p data-name-picker-count>${roster.length} students on the wheel</p><div class="platform-name-picker-actions"><button type="button" data-action="name-picker-spin">Spin the Wheel</button><button type="button" data-action="name-picker-readd-all">Re-add Everyone</button></div><label class="platform-name-picker-auto-remove"><input type="checkbox" data-name-picker-auto-remove> Remove the selected student after each spin</label><details><summary>Remove or re-add students</summary><ul class="platform-name-picker-roster">${students2}</ul></details><p data-name-picker-status role="status">All students are available.</p>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Name Picker"></span></aside>`;
}
function updateNamePickerView(documentRef = document) {
  documentRef.querySelectorAll('[data-smartboard-tool="names"]').forEach((tool) => {
    const rows = [...tool.querySelectorAll("[data-name-picker-student]")];
    const available = rows.filter((row) => !namePickerRemovedStudentIds.has(row.dataset.namePickerStudent));
    rows.forEach((row) => {
      const removed = namePickerRemovedStudentIds.has(row.dataset.namePickerStudent);
      row.dataset.removed = String(removed);
      const button = row.querySelector('[data-action="name-picker-toggle-student"]');
      if (button) button.textContent = removed ? "Re-add" : "Remove";
    });
    const count = tool.querySelector("[data-name-picker-count]");
    if (count) count.textContent = `${available.length} ${available.length === 1 ? "student" : "students"} on the wheel`;
    const spin = tool.querySelector('[data-action="name-picker-spin"]');
    if (spin) spin.disabled = available.length === 0;
    const wheel = tool.querySelector("[data-name-picker-wheel]");
    if (wheel) wheel.dataset.availableCount = String(available.length);
  });
}
function syncNamePickerViews() {
  updateNamePickerView(document);
  if (classroomPresentationWindow && !classroomPresentationWindow.closed) updateNamePickerView(classroomPresentationWindow.document);
}
function handleNamePickerAction(action, documentRef = document) {
  if (!action?.dataset.action?.startsWith("name-picker-")) return false;
  const tool = action.closest('[data-smartboard-tool="names"]');
  if (!tool) return true;
  if (action.dataset.action === "name-picker-toggle-student") {
    const id = action.dataset.studentId;
    if (namePickerRemovedStudentIds.has(id)) namePickerRemovedStudentIds.delete(id);
    else namePickerRemovedStudentIds.add(id);
    tool.querySelector("[data-name-picker-status]").textContent = namePickerRemovedStudentIds.has(id) ? "Student removed from the wheel." : "Student re-added to the wheel.";
    syncNamePickerViews();
  }
  if (action.dataset.action === "name-picker-readd-all") {
    namePickerRemovedStudentIds.clear();
    tool.querySelector("[data-name-picker-status]").textContent = "Everyone has been re-added.";
    syncNamePickerViews();
  }
  if (action.dataset.action === "name-picker-spin") {
    const available = [...tool.querySelectorAll("[data-name-picker-student]")].filter((row) => !namePickerRemovedStudentIds.has(row.dataset.namePickerStudent));
    if (!available.length) return true;
    const selected = available[Math.floor(Math.random() * available.length)];
    const name = selected.querySelector("span")?.textContent || "Selected student";
    const wheel = tool.querySelector("[data-name-picker-wheel]");
    namePickerRotation += 1440 + Math.floor(Math.random() * 360);
    if (wheel) {
      wheel.style.setProperty("--name-picker-rotation", `${namePickerRotation}deg`);
      wheel.dataset.spinning = "true";
    }
    action.disabled = true;
    tool.querySelector("[data-name-picker-status]").textContent = "The wheel is spinning\u2026";
    documentRef.defaultView?.setTimeout(() => {
      if (wheel) wheel.dataset.spinning = "false";
      const output = tool.querySelector("[data-name-picker-result]");
      if (output) output.textContent = name;
      tool.querySelector("[data-name-picker-status]").textContent = `${name} was selected.`;
      if (tool.querySelector("[data-name-picker-auto-remove]")?.checked) namePickerRemovedStudentIds.add(selected.dataset.namePickerStudent);
      syncNamePickerViews();
    }, 1050);
  }
  return true;
}
function teacherDashboardView(state) {
  const teacher = getTeacherById(state.teacherId);
  const classRecord = currentTeacherClass(state.teacherId);
  const classRoster = classRecord ? getRosterForClass(classRecord.id) : [];
  ensureClassSetupProfile(classRecord?.id);
  const teacherName = teacher?.displayName ?? (productionIdentityConfig.enabled ? "Signed-in Teacher" : "Preview Teacher");
  const className = classRecord?.displayName ?? "Class not selected";
  const periodLabel = classRecord?.periodLabel ?? "Period not selected";
  const previewIgnoresScheduleClock = state.teacherId === "teacher-preview-1" && !classroomDemoModeIsEnabled();
  const scheduledTimer = previewIgnoresScheduleClock ? { active: false, reason: "teacher-preview" } : applyScheduledClassTimer(classRecord?.id);
  const effectiveTimerSchedule = classTimerSchedule.readEffective();
  const storedTimerState = lessonTimer.read();
  if (previewIgnoresScheduleClock && storedTimerState.status !== LESSON_TIMER_STATES.RUNNING && storedTimerState.status !== LESSON_TIMER_STATES.PAUSED && storedTimerState.durationSeconds !== effectiveTimerSchedule.durationMinutes * 60) lessonTimer.setDuration(effectiveTimerSchedule.durationMinutes);
  const timerState = lessonTimer.read();
  const timerVisualState = effectiveTimerSchedule.pomodoroEnabled ? presentationTimerVisualState(timerState) : currentTimerVisualState(timerState, scheduledTimer);
  const timerMinutes = Math.max(1, Math.round(timerState.durationSeconds / 60));
  const memoState = teacherMemo.read();
  const savedMessages = messageLibrary.read().messages;
  const memoText = escapeHtml2(memoState.text);
  const hasMemo = Boolean(memoState.text);
  const missionState = todaysMission.read();
  const hasMission = Boolean(missionState.title);
  const missionVisual = matchAutomaticVisual({ title: missionState.title, detail: missionState.focus, type: "Mission" });
  const hasMessageContent = hasMemo || hasMission;
  const selectedDisplayMode = studentDisplayMode.read({ hasMemo: hasMessageContent });
  const showStudentTimer = selectedDisplayMode !== STUDENT_DISPLAY_MODES.MESSAGE;
  const showStudentMemo = hasMemo && selectedDisplayMode !== STUDENT_DISPLAY_MODES.TIMER;
  const showStudentMission = hasMission && selectedDisplayMode !== STUDENT_DISPLAY_MODES.TIMER;
  const showStudentMessage = showStudentMission || showStudentMemo;
  const studentDisplayClass = showStudentTimer && showStudentMessage ? "platform-student-display-combined" : showStudentMessage ? "platform-student-display-message-only" : "platform-student-display-timer-only";
  const builderAvailable = missionState.builder === TODAYS_MISSION_AVAILABILITY.AVAILABLE;
  const workshopAvailable = missionState.workshop === TODAYS_MISSION_AVAILABILITY.AVAILABLE;
  const readiness = classReadiness(classRecord?.id);
  const planReady = hasMission || readiness.mission === "none";
  const timerReady = readiness.timer !== "off";
  const selectedVoiceLevel = voiceMeter.read();
  const selectedVoiceActivity = readVoiceMeterActivity();
  const selectedVoiceSensitivity = voiceMeter.readSensitivity();
  const savedWhiteboards = readWhiteboardLibrary();
  const floatingWhiteboard = savedWhiteboards[0];
  const assignedResearch = readTeacherAssignedResearch(classRecord?.id);
  const researchLinkBank = readTeacherResearchLinkBank();
  return shell(`
    <div class="platform-command-layout platform-command-layout-no-sidebar">
      ${classroomDemoModeIsEnabled() ? `<aside class="platform-classroom-demo-banner"><div><p class="platform-command-label">Populated mock view</p><strong>Fictional classroom-use data is active</strong><span>Explore the dashboard as if this class has been using the platform.</span></div><a class="platform-button platform-button-secondary" href="#${ROUTES.PREVIEW_TEACHER}">Return to Regular Preview</a></aside>` : ""}
      <section class="platform-today-board" aria-label="Today">
        <section class="platform-teacher-overview platform-visual-zone platform-zone-today" aria-labelledby="teacher-overview-title">
          <div>
            <p class="platform-command-label">Teacher workspace</p>
            <h2 id="teacher-overview-title">Run today\u2019s class</h2>
            <p>Plan the mission, manage the room, and review student evidence from one place.</p>
          </div>
          <div class="platform-teacher-overview-status platform-run-class-actions" aria-label="Run class actions">
            <div class="platform-lesson-readiness-items">
              <button class="platform-set-todays-plan" type="button" data-action="open-class-readiness" data-readiness-focus="mission"><i aria-hidden="true">${planReady ? "\u2713" : "!"}</i> ${planReady ? `Review Today\u2019s Plan${classSetupProfiles.profile(classRecord?.id)?.planningWindow?.label ? ` \xB7 ${escapeHtml2(classSetupProfiles.profile(classRecord?.id).planningWindow.label)}` : ""}` : "Set Today\u2019s Plan"}</button>
            </div>
            <button class="platform-start-classroom-display" type="button" data-action="open-classroom-presentation-window" aria-describedby="classroom-display-help">Start Classroom Display</button>
            <a class="platform-button platform-button-secondary platform-preview-student-view" href="#${ROUTES.PREVIEW_STUDENT}" target="_blank" rel="noopener">Preview Student View \u2014 No Code</a>
          </div>
          <form class="platform-class-readiness-panel" data-form="class-readiness" hidden>
            <div class="platform-class-readiness-heading"><div><p class="platform-command-label">Quick class setup</p><h3>Settings for ${escapeHtml2(className)}</h3><p>These choices stay with this class when you move to another period and return later.</p></div><button type="button" data-action="close-class-readiness">Minimize Quick Setup</button></div>
            <label>Today\u2019s plan<select name="mission" data-readiness-setting="mission"><option value="previous"${readiness.mission === "previous" ? " selected" : ""}>Continue current settings</option><option value="new"${readiness.mission === "new" ? " selected" : ""}>Start a new mission</option><option value="none"${readiness.mission === "none" ? " selected" : ""}>No mission needed today</option></select></label>
            <fieldset class="platform-planning-range"><legend>How long should this plan be used?</legend><label><input type="radio" name="planningRange" value="today" checked> Today only</label><label><input type="radio" name="planningRange" value="week"> This school week (5 days)</label><label><input type="radio" name="planningRange" value="seven-weeks"> Seven school weeks (35 days)</label><p>You can change any day later. Activities and directions may still be added as students learn.</p></fieldset>
            ${todaysGoalInputsMarkup(classRecord?.id)}
            <div class="platform-actions"><button type="button" data-action="save-class-readiness" aria-label="Save Today\u2019s Plan Setting">Apply Today\u2019s Plan</button><button type="button" data-action="close-class-readiness">Minimize</button></div>
            <div class="platform-todays-mission-confirmation" data-readiness-no-mission-confirmation hidden role="dialog" aria-modal="true" aria-labelledby="readiness-no-mission-title"><div class="platform-todays-mission-confirmation-panel"><h4 id="readiness-no-mission-title">Remove today\u2019s mission?</h4><p>The selected mission is <strong data-readiness-current-mission>${escapeHtml2(missionState.title || "No mission selected")}</strong>. Are you sure you want no mission for this class today?</p><div class="platform-todays-mission-confirmation-actions"><button type="button" data-action="keep-readiness-mission">Keep Selected Mission</button><button type="button" data-action="confirm-readiness-no-mission">Use No Mission Today</button></div></div></div>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today\u2019s Class Plan</button>
          </form>
          <section class="platform-message-board-quick-panel" data-message-board-quick-panel hidden>
            <div class="platform-message-board-quick-heading"><div><p class="platform-command-label">Quick class communication</p><h3>Message Board for ${escapeHtml2(className)}</h3></div><button type="button" data-action="close-message-board-quick">Close Message Board</button></div>
            <div data-message-board-quick-host></div>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today\u2019s Class Plan</button>
          </section>
          <section class="platform-message-board-quick-panel" data-class-schedule-quick-panel hidden>
            <div class="platform-message-board-quick-heading"><div><p class="platform-command-label">Quick class setup</p><h3>Schedule for ${escapeHtml2(className)}</h3></div><button type="button" data-action="close-class-schedule-quick">Close Class Schedule</button></div>
            <div data-class-schedule-quick-host></div>
            <a class="platform-button platform-button-secondary" href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-sharing">Choose What to Share With Other Classes</a>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today\u2019s Class Plan</button>
          </section>
          ${currentClassPlanMarkup(classRecord?.id, state.teacherId)}
        </section>
        ${captainsLogPlannerMarkup(classRecord?.id)}
        <div data-class-schedule-storage hidden>${classTimerScheduleMarkup(classRecord?.id, { showBackToToday: false })}</div>
        <div class="platform-today-primary-grid" id="teacher-today-tools">
          <div class="platform-workspace-heading" id="teacher-classroom-tools" hidden>
            <p class="platform-command-label">Today\u2019s classroom</p>
            <h2>Presentation Tools</h2>
            <div class="platform-workspace-heading-action-row">
              <p>These are the controls you are most likely to use during class.</p>
              <div class="platform-workspace-heading-actions">
                <button type="button" data-action="open-message-board-quick">Quick Message Board</button>
                <button type="button" data-action="open-whiteboard">Open Whiteboard</button>
                <button type="button" data-action="open-classroom-presentation-window">Open Separate Classroom Screen</button>
              </div>
              <p data-classroom-window-status role="status"></p>
            </div>
          </div>
          ${todaysLessonTeacherMarkup(classRecord?.id, assignedResearch, researchLinkBank, className)}
          <section id="teacher-timer-card" class="platform-command-card platform-command-card-timer" hidden>
            <p class="platform-command-label">Class timing</p>
            <h3>Today\u2019s Class Timer</h3>
            <p class="platform-current-timer-phase">Current phase: <strong data-timer-phase-name>${escapeHtml2(timerVisualState.phase?.name ?? "Today's Engineering Time")}</strong></p>
            <p class="platform-class-timer-auto-status">${scheduledTimer.active ? "Running from today\u2019s saved class schedule." : "Manual controls are ready; an active saved schedule will start automatically."}</p>
            <p class="platform-timer-warning" data-timer-warning role="status" aria-live="polite"${timerVisualState.fiveMinuteWarning ? "" : " hidden"}>Five minutes until cleanup or the ending activity.</p>
            <div class="platform-lesson-timer" aria-label="Lesson Timer">
              <output class="platform-timer-remaining" data-timer-remaining data-timer-phase-color="${timerVisualState.phase?.color ?? "default"}" aria-live="off">${formatLessonTime(timerState.remainingSeconds)}</output>
              <p class="platform-timer-state">Timer state: <strong data-timer-state>${escapeHtml2(timerState.status)}</strong></p>
              <div class="platform-timer-controls" aria-label="Teacher Lesson Timer controls">
                <button type="button" data-action="timer-start">Start</button>
                <button type="button" data-action="timer-pause">Pause</button>
                <button type="button" data-action="timer-resume">Resume</button>
                <button type="button" data-action="timer-reset">Reset</button>
                <button type="button" data-action="timer-end">End</button>
              </div>
              <div class="platform-timer-adjustments" aria-label="Teacher Timer Adjustment controls">
                <button type="button" data-action="timer-subtract-minute">Subtract 1 minute</button>
                <button type="button" data-action="timer-add-minute">Add 1 minute</button>
              </div>
              <details class="platform-alternate-timers">
                <summary>Start a Different Timer</summary>
                <p>Open one choice below. Starting it will replace the current class countdown.</p>
                <details name="teacher-quick-timer"><summary>Instant Timer</summary><div>${[1, 3, 5, 10, 15].map((minutes) => `<button type="button" data-action="instant-timer" data-instant-minutes="${minutes}">${minutes} min</button>`).join("")}</div></details>
                <details name="teacher-quick-timer"><summary>Stopwatch</summary><output data-stopwatch-output>${formatLessonTime(stopwatchSeconds)}</output><div><button type="button" data-action="stopwatch-start">Start</button><button type="button" data-action="stopwatch-pause">Pause</button><button type="button" data-action="stopwatch-reset">Reset</button></div></details>
                <details name="teacher-quick-timer"><summary>Custom Countdown</summary><form class="platform-timer-duration" data-form="lesson-timer-duration" novalidate><label for="lesson-duration">Minutes</label><div><input id="lesson-duration" name="duration" type="number" inputmode="numeric" min="${MIN_LESSON_MINUTES}" max="${MAX_LESSON_MINUTES}" step="1" value="${timerMinutes}" data-timer-duration><button type="submit" data-timer-set>Set Countdown</button></div><p class="platform-error platform-timer-error" data-timer-error role="alert" hidden></p></form><button type="button" data-action="timer-start">Start Countdown</button></details>
              </details>
              <details class="platform-timer-display-settings">
                <summary>Display and Settings</summary>
              <div class="platform-timer-schedule-links">
                <a class="platform-button platform-button-secondary" href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-schedule">Change Schedule \u2014 Pomodoro intervals and timer sounds</a>
                <details>
                  <summary>Change for Today</summary>
                  <form data-form="timer-today-override" novalidate>
                    <label>Today\u2019s duration<input type="number" name="durationMinutes" min="16" max="${MAX_LESSON_MINUTES}" value="${effectiveTimerSchedule.durationMinutes}" required></label>
                    ${effectiveTimerSchedule.phases.slice(1).map((phase) => `<label>${escapeHtml2(phase.name)} starts at minute<input type="number" name="phaseStart" min="1" max="${effectiveTimerSchedule.durationMinutes - 1}" value="${phase.startMinute}" required></label>`).join("")}
                    <button type="submit">Apply for Today Only</button>
                    <p class="platform-error" data-timer-today-error role="alert" hidden></p>
                  </form>
                </details>
              </div>
              <div class="platform-timer-display-actions" aria-labelledby="timer-display-actions-title">
                <h4 id="timer-display-actions-title">Show students the timer</h4>
                <p>Open a compact timer window to place beside lesson materials or on a second display.</p>
                <button type="button" data-action="open-timer-popout">Open Separate Student Timer Window</button>
                <details>
                  <summary>Full-screen Presentation</summary>
                  <p class="platform-student-display-guidance">Show the timer, message, or both. Add the Voice Meter when needed. Each tool can also be opened as a movable window from the vertical tool rail.</p>
                  <div class="platform-student-display-mode-controls" role="group" aria-label="Student Display content">
                    <button type="button" data-action="select-presentation-mode" data-presentation-mode="${STUDENT_DISPLAY_MODES.COMBINED}" aria-pressed="${selectedDisplayMode === STUDENT_DISPLAY_MODES.COMBINED}">Timer + Message</button>
                    <button type="button" data-action="select-presentation-mode" data-presentation-mode="${STUDENT_DISPLAY_MODES.MESSAGE}" aria-pressed="${selectedDisplayMode === STUDENT_DISPLAY_MODES.MESSAGE}"${hasMessageContent ? "" : " disabled"}>Message only</button>
                    <button type="button" data-action="select-presentation-mode" data-presentation-mode="${STUDENT_DISPLAY_MODES.TIMER}" aria-pressed="${selectedDisplayMode === STUDENT_DISPLAY_MODES.TIMER}">Timer only</button>
                  </div>
                  <label class="platform-student-display-addon"><input type="checkbox" data-student-display-voice-meter${studentDisplayVoiceMeterIsEnabled() ? " checked" : ""}> Add the live Voice Meter to this display</label>
                  <p class="platform-student-display-addon-note">The browser will request microphone access when the display opens. Audio is analyzed live and is never recorded.</p>
                  <button class="platform-student-display-button" type="button" data-action="open-timer-display">Open Full-Screen Student Display</button>
                  <button type="button" data-action="open-voice-meter-display">Voice Meter Only \u2014 Full Screen</button>
                </details>
              </div>
              </details>
              <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today\u2019s Class Plan</button>
            </div>
          </section>
          <section class="platform-command-card platform-command-card-voice-meter" aria-labelledby="voice-meter-title" hidden>
            <p class="platform-command-label">Classroom sound</p>
            <h3 id="voice-meter-title">Classroom Voice Meter</h3>
            <label for="voice-meter-activity">Classroom activity</label>
            <select id="voice-meter-activity" data-voice-meter-activity>
              ${VOICE_METER_ACTIVITIES.map((activity) => `<option value="${activity.key}"${selectedVoiceActivity.key === activity.key ? " selected" : ""}>${activity.icon} ${activity.label}</option>`).join("")}
            </select>
            <p class="platform-voice-meter-guidance">Teacher-led mode estimates one sustained dominant voice. It cannot identify the teacher or save anyone\u2019s voice.</p>
            <label for="voice-meter-target">Expected voice level</label>
            <select id="voice-meter-target" data-voice-meter-target>
              ${VOICE_METER_LEVELS.map((level) => `<option value="${level.key}"${selectedVoiceLevel.key === level.key ? " selected" : ""}>${level.icon} ${level.label}</option>`).join("")}
            </select>
            <label class="platform-voice-sensitivity" for="voice-meter-sensitivity">Microphone sensitivity <output data-voice-sensitivity-value>${selectedVoiceSensitivity}%</output><input id="voice-meter-sensitivity" type="range" min="50" max="150" step="5" value="${selectedVoiceSensitivity}" data-voice-sensitivity><span><small>Less reactive</small><small>More reactive</small></span></label>
            <div class="platform-voice-meter" data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%">
              <div class="platform-voice-meter-scale" aria-hidden="true"><span>Ready</span><span>Close</span><span>Too loud</span></div>
              <div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span></div>
              <p><strong data-voice-meter-output>0</strong><span aria-hidden="true"> / 100</span></p>
            </div>
            <div class="platform-voice-meter-actions">
              <button type="button" data-action="voice-meter-start">Start Voice Meter</button>
              <button type="button" data-action="voice-meter-stop" disabled>Stop Voice Meter</button>
              <button type="button" data-action="open-voice-meter-display">Open Large Class Voice Meter</button>
            </div>
            <p data-voice-meter-status role="status">Choose the expected level, then start the meter.</p>
            <p class="platform-voice-meter-privacy">Audio is analyzed live in this browser and is never recorded or saved.</p>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today\u2019s Class Plan</button>
          </section>
          <div data-message-board-home hidden>
          <section id="teacher-message-board" class="platform-command-card platform-command-card-memo">
            <p class="platform-command-label">Class communication</p>
            <h3>Teacher Memo</h3>
            <form class="platform-teacher-memo-form" data-form="teacher-memo" novalidate>
              <label for="teacher-memo-editor">Class-wide message or agenda</label>
              <div class="platform-teacher-memo-toolbar" role="toolbar" aria-label="Format selected memo text">
                <select data-memo-format="color" aria-label="Selected text color">${TEACHER_MEMO_COLORS.map((value) => `<option value="${value}"${memoState.color === value ? " selected" : ""}>${value.replaceAll("-", " ")}</option>`).join("")}</select>
                <select data-memo-format="size" aria-label="Selected text size">${TEACHER_MEMO_SIZES.map((value) => `<option value="${value}"${memoState.size === value ? " selected" : ""}>${value.replaceAll("-", " ")}</option>`).join("")}</select>
                <select data-memo-format="style" aria-label="Selected text style">${TEACHER_MEMO_STYLES.map((value) => `<option value="${value}"${memoState.style === value ? " selected" : ""}>${value.replaceAll("-", " + ")}</option>`).join("")}</select>
                <button type="button" data-action="apply-memo-format">Apply to Selected Text</button>
              </div>
              <div id="teacher-memo-editor" class="platform-teacher-memo-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-describedby="teacher-memo-guidance teacher-memo-count" data-teacher-memo-editor>${memoSegmentsMarkup(memoState)}</div>
              <textarea name="memo" data-teacher-memo hidden>${memoText}</textarea>
              <div class="platform-teacher-memo-meta">
                <small id="teacher-memo-guidance">Plain text for the whole class.</small>
                <small id="teacher-memo-count"><span data-teacher-memo-count>${memoState.text.length}</span>/${TEACHER_MEMO_MAX_CHARACTERS}</small>
              </div>
              <label>Optional image<input type="file" accept="image/*" data-memo-image-file></label>
              <input type="hidden" name="memoImage" value="${escapeHtml2(memoState.image)}">
              <div class="platform-teacher-memo-actions">
                <button type="submit">Save Memo</button>
                <button type="button" data-action="clear-teacher-memo"${memoState.text ? "" : " disabled"}>Clear Memo</button>
              </div>
              <p class="platform-error platform-teacher-memo-error" data-teacher-memo-error role="alert" hidden></p>
              <p class="platform-teacher-memo-status" data-teacher-memo-status data-state="${memoState.text ? "saved" : "empty"}" role="status" aria-live="polite">${memoState.text ? "Saved for refresh and Student Display." : "No memo saved yet."}</p>
            </form>
            <div class="platform-teacher-memo-saved">
              <p class="platform-command-label">Current class message</p>
              <p data-teacher-memo-saved>${memoState.text ? memoSegmentsMarkup(memoState) : "No class message saved."}</p>
              ${memoState.image ? `<img class="platform-memo-image-preview" src="${escapeHtml2(memoState.image)}" alt="Teacher-added memo visual">` : ""}
            </div>
            <div class="platform-message-library" aria-labelledby="message-library-title">
              <h4 id="message-library-title">Saved Message Library</h4>
              <label>Message title<input type="text" maxlength="60" data-message-library-title placeholder="Example: Monday warm-up"></label>
              <button type="button" data-action="save-message-to-library"${hasMemo ? "" : " disabled"}>Save Current Message for Later</button>
              <p data-message-library-status role="status" aria-live="polite">${savedMessages.length} of 20 messages saved in this browser.</p>
              <div class="platform-message-library-list">${savedMessages.length ? savedMessages.map((message) => `<article><strong>${escapeHtml2(message.title)}</strong><p>${escapeHtml2(message.text)}</p><div><button type="button" data-action="use-saved-message" data-message-id="${message.id}">Use Today</button><button type="button" data-action="delete-saved-message" data-message-id="${message.id}">Delete</button></div></article>`).join("") : "<p>No saved messages yet.</p>"}</div>
            </div>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today\u2019s Class Plan</button>
          </section>
          </div>
          <section id="teacher-evidence-tools" class="platform-optional-dashboard-section platform-visual-zone platform-zone-review" data-optional-dashboard-section hidden>
          <div class="platform-workspace-heading">
            <p class="platform-command-label">Student work</p>
            <h2>Launch and review evidence</h2>
            <p>Start an evidence activity, then review protected visual submissions.</p>
            <button type="button" data-action="close-optional-dashboard-section">Close Evidence Tools</button>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today\u2019s Class Plan</button>
          </div>
          <section id="teacher-evidence-launch" class="platform-command-card platform-evidence-launch-card" aria-labelledby="evidence-launch-title">
            <p class="platform-command-label">Evidence 2.0 pilot foundation</p>
            <h3 id="evidence-launch-title">Launch Evidence to Students</h3>
            <p>Publish <strong>${escapeHtml2(currentEvidenceActivity())}</strong> to the local fictional pilot. The runtime key authorizes this launch but is never saved by the browser.</p>
            <label for="evidence-teacher-runtime-key">Local pilot teacher key</label>
            <input id="evidence-teacher-runtime-key" type="password" autocomplete="off" data-evidence-teacher-key placeholder="Paste the memory-only key">
            <button type="button" data-action="evidence-teacher-launch">Launch Fictional Evidence Pilot</button>
            <p data-evidence-launch-status role="status" aria-live="polite">Start the local evidence pilot service, then launch. No real student accounts are connected.</p>
            <h4>Live Evidence Inbox</h4>
    <p>Refresh to retrieve protected fictional visual evidence from the configured teacher-owned Drive folder.</p>
            ${teacherLiveEvidenceMarkup()}
          </section>
          <section class="platform-command-card platform-teacher-evidence-card" aria-labelledby="teacher-evidence-review-title">
            ${teacherEvidenceReviewMarkup()}
          </section>
          </section>
        </div>
      </section>
    </div>
    <section id="platform-student-timer-display" class="platform-student-timer-display ${studentDisplayClass}" role="dialog" aria-modal="true" aria-labelledby="${showStudentTimer ? "student-timer-title" : "student-message-title"}" tabindex="-1" hidden>
      <p class="platform-student-display-brand">THINKamigBOB</p>
      <div class="platform-student-engineering-time" data-student-engineering-time${showStudentTimer ? "" : " hidden"}>
        <h2 id="student-timer-title" data-timer-phase-name>${escapeHtml2(timerVisualState.phase?.name ?? "Today's Engineering Time")}</h2>
        <div class="platform-student-round-timer" data-timer-ring data-active-phases="${timerVisualState.phase ? "true" : "false"}" style="${timerRingStyle(timerVisualState)}">
          <output data-timer-remaining data-timer-phase-color="${timerVisualState.phase?.color ?? "default"}">${formatLessonTime(timerState.remainingSeconds)}</output>
        </div>
        <p class="platform-timer-warning" data-timer-warning role="status" aria-live="polite"${timerVisualState.fiveMinuteWarning ? "" : " hidden"}>Five minutes until cleanup or the ending activity.</p>
      </div>
      <aside class="platform-student-voice-meter" data-student-voice-meter data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%" aria-label="Classroom voice level" hidden>
        <p>${selectedVoiceLevel.icon} ${escapeHtml2(selectedVoiceLevel.label)}</p>
        <div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span></div>
        <output data-voice-meter-output>0</output>
      </aside>
      <div class="platform-student-display-image-slot" data-student-image-slot hidden></div>
      <div class="platform-student-memo" data-student-memo data-memo-color="${memoState.color}" data-memo-size="${memoState.size}" data-memo-style="${memoState.style}"${showStudentMemo ? "" : " hidden"}>
        <h3 id="student-message-title">Class Message</h3>
        <p data-student-memo-text>${memoSegmentsMarkup(memoState)}</p>
        ${memoState.image ? `<img class="platform-student-memo-image" src="${escapeHtml2(memoState.image)}" alt="Teacher-added class message visual">` : ""}
      </div>
      <div class="platform-student-mission" data-student-mission${showStudentMission ? "" : " hidden"}>
        <h3 id="student-mission-title">Today's Mission</h3>
        <img class="platform-automatic-mission-visual" src="${escapeHtml2(missionVisual.src)}" alt="${escapeHtml2(missionVisual.alt)}">
        <h4 data-student-mission-title>${escapeHtml2(missionState.title)}</h4>
        <p data-student-mission-focus${missionState.focus === missionState.title ? " hidden" : ""}>${escapeHtml2(missionState.focus)}</p>
        <p data-student-mission-builder>Builder: ${builderAvailable ? "Available today" : "Not part of today's mission"}</p>
        <p data-student-mission-workshop>Workshop: ${workshopAvailable ? "Available today" : "Not part of today's mission"}</p>
        <p class="platform-missions-first-reminder">${MISSIONS_FIRST_REMINDER}</p>
      </div>
      <aside class="platform-smartboard-tool platform-amig-anchor-chart" data-smartboard-tool="amig" hidden style="left: 8%; top: 7%; width: min(58rem, 80vw);">
        <header data-smartboard-drag-handle><strong>AMIG \u2014 How We Learn in STEM</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close AMIG Anchor Chart">\xD7</button></header>
        <div class="platform-amig-anchor-intro"><b>AMIG</b><span>Ask <i aria-hidden="true">\u2022</i> Make <i aria-hidden="true">\u2022</i> Improve <i aria-hidden="true">\u2022</i> Grow</span></div>
        <div class="platform-amig-cycle" aria-label="AMIG learning cycle moves clockwise from Ask to Make to Improve to Grow">
          <span class="platform-amig-cycle-ring" aria-hidden="true"></span>
          <p class="platform-amig-cycle-center"><strong>STEM</strong><span>Learning Cycle</span></p>
          <ol class="platform-amig-anchor-steps">
            <li data-amig-step="ask"><b>A</b><div><h3>Ask</h3><p>Notice and wonder.</p></div></li>
            <li data-amig-step="make"><b>M</b><div><h3>Make</h3><p>Build and try.</p></div></li>
            <li data-amig-step="improve"><b>I</b><div><h3>Improve</h3><p>Test and make it better.</p></div></li>
            <li data-amig-step="grow"><b>G</b><div><h3>Grow</h3><p>Share and try again.</p></div></li>
          </ol>
        </div>
        <p class="platform-amig-anchor-reminder">Every try helps your ideas grow.</p>
        ${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize AMIG Anchor Chart"></span>
      </aside>
      <aside class="platform-smartboard-tool" data-smartboard-tool="timer" data-timer-view="${presentationTimerViewMode()}" hidden style="left: 3%; top: 12%;"><header data-smartboard-drag-handle><strong>Timer</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Timer tool">\xD7</button></header><div class="platform-timer-view-choice" role="group" aria-label="Timer face for today"><button type="button" data-action="timer-view-mode" data-timer-view-mode="regular" aria-pressed="${presentationTimerViewMode() === "regular"}">Solid Color</button><button type="button" data-action="timer-view-mode" data-timer-view-mode="pomodoro" aria-pressed="${presentationTimerViewMode() === "pomodoro"}">Pomodoro Wheel</button></div><small data-timer-view-status>${presentationTimerViewMode() === "pomodoro" ? "Showing today\u2019s Pomodoro wheel." : "Showing today\u2019s solid-color timer."}</small><div class="platform-floating-timer-face"><output class="platform-smartboard-timer" data-timer-remaining>${formatLessonTime(timerState.remainingSeconds)}</output></div><div class="platform-floating-timer-controls"><button type="button" data-action="timer-subtract-minute">\u2212 1 min</button><button type="button" data-action="timer-add-minute">+ 1 min</button><button type="button" data-action="timer-pause">Pause</button><button type="button" data-action="timer-end">Stop</button><button type="button" data-action="timer-start-or-resume">Start</button><button type="button" data-action="timer-reset">Reset</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Timer window"></span></aside>
      <aside class="platform-smartboard-tool platform-activity-side-timer" data-smartboard-tool="activity-timer" hidden style="right: 4%; top: 14%;"><header data-smartboard-drag-handle><strong>Activity Side Timer</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Activity Side Timer">\xD7</button></header><p class="platform-activity-side-timer-note">Independent timer \u2014 the class timer keeps running.</p><output data-activity-side-timer-output>${formatLessonTime(currentActivitySideTimer().remainingSeconds)}</output><p data-activity-side-timer-status>Ready for a class activity</p><div class="platform-activity-side-timer-presets"><button type="button" data-action="activity-side-timer-set" data-activity-minutes="1">1 min</button><button type="button" data-action="activity-side-timer-set" data-activity-minutes="3">3 min</button><button type="button" data-action="activity-side-timer-set" data-activity-minutes="5">5 min</button><button type="button" data-action="activity-side-timer-set" data-activity-minutes="10">10 min</button></div><label>Custom minutes<input type="number" min="1" max="60" value="5" data-activity-side-timer-minutes></label><button type="button" data-action="activity-side-timer-set">Set Custom Time</button><div class="platform-activity-side-timer-controls"><button type="button" data-action="activity-side-timer-start">Start</button><button type="button" data-action="activity-side-timer-pause" disabled>Pause</button><button type="button" data-action="activity-side-timer-reset">Reset</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Activity Side Timer"></span></aside>
      <aside class="platform-smartboard-tool" data-smartboard-tool="message" hidden style="right: 3%; top: 12%;"><header data-smartboard-drag-handle><strong>Quick Message</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Message tool">\xD7</button></header><div class="platform-smartboard-message" data-student-memo-text>${memoState.text ? memoSegmentsMarkup(memoState) : "No message is ready yet."}</div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Message window"></span></aside>
      <aside class="platform-smartboard-tool" data-smartboard-tool="stopwatch" hidden style="left: 35%; top: 18%;"><header data-smartboard-drag-handle><strong>Stopwatch</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Stopwatch tool">\xD7</button></header><output class="platform-smartboard-timer" data-stopwatch-output>${formatLessonTime(stopwatchSeconds)}</output><div><button type="button" data-action="stopwatch-start">Start</button><button type="button" data-action="stopwatch-pause">Pause</button><button type="button" data-action="stopwatch-reset">Reset</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Stopwatch window"></span></aside>
      <aside class="platform-smartboard-tool platform-smartboard-voice-tool" data-smartboard-tool="voice" hidden style="right: 16%; top: 18%;"><header data-smartboard-drag-handle><strong>Voice Meter</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Voice Meter tool">\xD7</button></header><label class="platform-smartboard-voice-choice">Choose the voice level<select data-voice-meter-target aria-label="Expected voice level on the classroom Voice Meter">${VOICE_METER_LEVELS.map((level) => `<option value="${level.key}"${selectedVoiceLevel.key === level.key ? " selected" : ""}>${level.icon} ${level.label}</option>`).join("")}</select></label><p data-large-voice-level-label>${selectedVoiceLevel.icon} ${escapeHtml2(selectedVoiceLevel.label)}</p><div class="platform-voice-meter" data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%"><div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span></div><output data-voice-meter-output>0</output></div><div><button type="button" data-action="voice-meter-start">Start</button><button type="button" data-action="voice-meter-stop" disabled>Pause</button><button type="button" data-action="open-voice-meter-display">Full Screen</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Voice Meter window"></span></aside>
      ${namePickerMarkup(classRoster)}
      <aside class="platform-smartboard-tool platform-floating-whiteboard" data-smartboard-tool="whiteboard" hidden style="left: 8%; top: 8%; width: min(46rem, 82vw); height: min(34rem, 72vh);"><header data-smartboard-drag-handle><strong>Whiteboard</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Whiteboard window">\xD7</button></header><div class="platform-floating-whiteboard-board">${floatingWhiteboard ? `<img src="${escapeHtml2(floatingWhiteboard.displayImage || floatingWhiteboard.image)}" alt="Latest whiteboard: ${escapeHtml2(floatingWhiteboard.title)}">` : `<p>Your whiteboard will appear here. Open the full board to draw.</p>`}</div><div class="platform-floating-whiteboard-functions"><button type="button" data-action="open-whiteboard">Open Full Whiteboard and Tools</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Whiteboard window"></span></aside>
      <details class="platform-smartboard-tool-tray" aria-label="Smartboard presentation tools"><summary>Tools</summary><div class="platform-smartboard-tool-options"><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="amig">AMIG Chart</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="timer">Class Timer</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="activity-timer">Activity Side Timer</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="stopwatch">Stopwatch</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="message">Message</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="voice">Voice Meter</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="names">Name Picker</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="whiteboard">Whiteboard</button><button type="button" class="platform-smartboard-reset-tools" data-action="reset-smartboard-tools">Reset Positions</button></div></details>
    </section>
    <aside class="platform-floating-voice-bob" data-voice-bob data-meter-state="green" data-corner="${classroomBobCorners()[floatingBobCornerIndex % classroomBobCorners().length]}" data-idle-set="${floatingBobIdleSet}" role="img" aria-label="Bob is calm and happy."${readClassroomBobDisplay().enabled ? "" : " hidden"}><span data-voice-bob-message>Bob is calm and happy.</span></aside>
    <section id="platform-large-voice-meter-display" class="platform-large-voice-meter-display" data-voice-display-mode="${readVoiceMeterDisplayMode()}" role="dialog" aria-modal="true" aria-labelledby="large-voice-meter-title" tabindex="-1" hidden>
      <p class="platform-student-display-brand">THINKamigBOB</p>
      <h2 id="large-voice-meter-title">Classroom Voice Meter</h2>
      <p class="platform-large-voice-target" data-large-voice-level-label>${selectedVoiceLevel.icon} ${escapeHtml2(selectedVoiceLevel.label)}</p>
      <p class="platform-large-voice-prediction" data-voice-prediction>\u{1F92B} Independent work pattern</p>
      <label class="platform-large-voice-selector">Meter view<select data-voice-meter-display-mode><option value="basic"${readVoiceMeterDisplayMode() === "basic" ? " selected" : ""}>Basic volume</option><option value="prediction"${readVoiceMeterDisplayMode() === "prediction" ? " selected" : ""}>Predicted learning type + threshold</option></select></label>
      <label class="platform-large-voice-selector">Change expected voice level
        <select data-voice-meter-target aria-label="Expected voice level on large display">
          ${VOICE_METER_LEVELS.map((level) => `<option value="${level.key}"${selectedVoiceLevel.key === level.key ? " selected" : ""}>${level.icon} ${level.label}</option>`).join("")}
        </select>
      </label>
      <label class="platform-large-voice-selector platform-voice-sensitivity">Microphone sensitivity <output data-voice-sensitivity-value>${selectedVoiceSensitivity}%</output><input type="range" min="50" max="150" step="5" value="${selectedVoiceSensitivity}" data-voice-sensitivity><span><small>Less reactive</small><small>More reactive</small></span></label>
      <div class="platform-large-voice-meter" data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%; --voice-threshold: ${selectedVoiceActivity.target}%">
        <div class="platform-large-voice-bob-panel"><div class="platform-large-voice-bob" data-voice-bob data-meter-state="green" role="img" aria-label="Bob is calm and happy."></div><strong data-voice-bob-message>Bob is calm and happy.</strong></div>
        <div class="platform-large-voice-reading"><div class="platform-large-voice-scale" aria-hidden="true"><span>Ready</span><span>Getting loud</span><span>Too loud</span></div><div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span><i class="platform-voice-threshold-marker" title="Expected threshold"></i></div><output data-voice-meter-output aria-label="Current classroom voice level">0</output></div>
      </div>
      <div class="platform-large-voice-controls" aria-label="Large Voice Meter controls">
        <button type="button" data-action="voice-meter-start">Start Voice Meter</button>
        <button type="button" data-action="voice-meter-stop" data-meter-stop-message="Voice Meter paused. Press Start Voice Meter to resume." disabled>Pause Voice Meter</button>
        <button type="button" data-action="close-voice-meter-display">Close Class Voice Meter</button>
      </div>
    </section>
    <section id="platform-classroom-whiteboard" class="platform-classroom-whiteboard" data-page-dock="left" role="dialog" aria-modal="true" aria-labelledby="classroom-whiteboard-title" tabindex="-1" hidden>
      <header class="platform-whiteboard-header">
        <div><p class="platform-command-label">Classroom tool</p><h2 id="classroom-whiteboard-title">Whiteboard</h2></div>
        <div class="platform-whiteboard-header-actions"><label>Menu position<select data-whiteboard-controls-dock><option value="top">Top</option><option value="left">Left side</option><option value="right">Right side</option><option value="bottom">Bottom</option></select></label><button type="button" data-action="whiteboard-toggle-controls" aria-expanded="true">Hide Board Menus</button><button type="button" data-action="whiteboard-present" title="Show full-screen on this teacher device">Present Board</button><button type="button" data-action="whiteboard-show-students" title="Send the current board to the separate classroom display">Show on Student Display</button><button type="button" data-action="close-whiteboard">Close Whiteboard</button></div>
      </header>
      <button class="platform-whiteboard-exit-presentation" type="button" data-action="whiteboard-exit-presentation" hidden>Exit Presentation</button>
      <label class="platform-whiteboard-page-dock-control">Pages<select data-whiteboard-page-dock aria-label="Page thumbnails position"><option value="left">Show left</option><option value="right">Show right</option><option value="hidden">Hide</option></select></label>
      <nav class="platform-whiteboard-quick-actions" aria-label="Whiteboard quick actions">
        <details class="platform-whiteboard-quick-menu" data-whiteboard-primary-tool="select"><summary><span aria-hidden="true">\u27A4</span><small>Select</small></summary><div data-whiteboard-select-panel>
          <button type="button" data-action="whiteboard-tool-select" data-whiteboard-quick-tool="select" aria-pressed="true">Select and move</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="lasso-select">Lasso parts to keep or remove</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">\u21B6</span><small>History</small></summary><div><button type="button" data-action="whiteboard-undo">Undo</button><button type="button" data-action="whiteboard-redo">Redo</button></div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">\u232B</span><small>Erase</small></summary><div>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="eraser">Eraser</button>
          <label>Eraser thickness<input type="range" data-whiteboard-eraser-size min="12" max="140" value="40"><output data-whiteboard-eraser-size-output>40</output></label>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="erase-object">Erase object</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span class="platform-whiteboard-color-chip" data-whiteboard-color-chip style="--whiteboard-selected-color:#12384d" aria-hidden="true"></span><small>Color</small></summary><div data-whiteboard-color-panel><button type="button" data-action="whiteboard-eyedropper">\u25C9 Eyedropper \u2014 match a screen color</button></div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">\u25A4</span><small>Background</small></summary><div class="platform-whiteboard-background-panel"><label>Background type<select data-whiteboard-background-type><option value="white">Plain white</option><option value="solid">Solid color</option><option value="gradient">Gradient</option><option value="image">Image</option></select></label><label>First color<input type="color" data-whiteboard-background-color-1 value="#ffffff"></label><label>Second gradient color<input type="color" data-whiteboard-background-color-2 value="#d8edf5"></label><label>Background image<input type="file" data-whiteboard-background-image accept="image/*"></label><button type="button" data-action="whiteboard-apply-background">Apply Background</button></div></details>
        <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="fill" title="Fill a closed shape with the selected color"><span class="platform-whiteboard-paint-can-icon" data-whiteboard-paint-can-icon style="--whiteboard-selected-color:#12384d" aria-hidden="true"><svg viewBox="0 0 28 24"><path class="platform-whiteboard-paint-can-body" d="M5 8h15l-2 12H7L5 8Z"/><path d="M4 7h17M7 8c0-7 11-7 11 0M20 12l4 4 2-2-4-4"/></svg></span><small>Paint Can</small></button>
        <details class="platform-whiteboard-quick-menu" data-whiteboard-primary-tool="pen"><summary><span aria-hidden="true">\u270E</span><small>Pen</small></summary><div data-whiteboard-pen-panel>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="pen">Pen</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="calligraphy">Calligraphy pen</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="brush">Brush strokes</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="highlighter">Highlighter</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">\u2571</span><small>Line</small></summary><div data-whiteboard-line-panel>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="line">Line</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="arrow">Arrow</button>
          <label>Line thickness<input type="range" data-whiteboard-line-size min="2" max="32" value="6"><output data-whiteboard-line-size-output>6</output></label>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">\u25A1\u25CB\u25B3</span><small>Shapes</small></summary><div data-whiteboard-shapes-panel>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="rectangle">Rectangle</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="ellipse">Circle or oval</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="triangle">Triangle</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="diamond">Diamond</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="pentagon">Pentagon</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="hexagon">Hexagon</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="star">Star</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">\u25C7</span><small>3D Shapes</small></summary><div>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="cube">Cube</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="rectangular-prism">Rectangular prism</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="triangular-prism">Triangular prism</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="hexagonal-prism">Hexagonal prism</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="cylinder">Cylinder</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="cone">Cone</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="pyramid">Pyramid</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="sphere">Sphere</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="hemisphere">Hemisphere</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="pull-3d">Make selected object 3D</button>
          <label>3D thickness<input type="range" data-whiteboard-3d-depth min="10" max="120" value="24"><output data-whiteboard-3d-depth-output>24</output></label>
          <fieldset class="platform-whiteboard-face-colors"><legend>3D face colors</legend><label>Front<input type="color" data-whiteboard-3d-front-color value="#287da0"></label><label>Side<input type="color" data-whiteboard-3d-side-color value="#f0a52b"></label><label>Top or back<input type="color" data-whiteboard-3d-top-color value="#55a875"></label></fieldset>
          <button type="button" data-action="whiteboard-apply-all-3d-face-colors">Apply all face colors</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu" data-whiteboard-primary-tool="text"><summary data-action="whiteboard-activate-text"><span aria-hidden="true">T</span><small>Text</small></summary><div data-whiteboard-text-panel><label>Font<select data-whiteboard-text-font><option value="Arial">Arial</option><option value="Verdana">Verdana</option><option value="Courier New">Courier</option><option value="Comic Sans MS">Comic Sans</option><option value="School Cursive">School Cursive</option></select></label><div class="platform-whiteboard-font-examples" aria-label="Font examples"><button type="button" data-action="whiteboard-choose-text-font" data-text-font="Arial" style="font-family:Arial">Arial \u2014 Aa Bb Cc</button><button type="button" data-action="whiteboard-choose-text-font" data-text-font="Verdana" style="font-family:Verdana">Verdana \u2014 Aa Bb Cc</button><button type="button" data-action="whiteboard-choose-text-font" data-text-font="Courier New" style="font-family:'Courier New'">Courier \u2014 Aa Bb Cc</button><button type="button" data-action="whiteboard-choose-text-font" data-text-font="Comic Sans MS" style="font-family:'Comic Sans MS'">Comic Sans \u2014 Aa Bb Cc</button><button type="button" data-action="whiteboard-choose-text-font" data-text-font="School Cursive" style="font-family:'School Cursive'">School Cursive \u2014 Aa Bb Cc</button></div><label>Font color<input type="color" data-whiteboard-text-color value="#12384d"></label><button type="button" data-action="whiteboard-format-text" data-text-command="bold" aria-pressed="false"><b>Bold</b> (Ctrl+B)</button><button type="button" data-action="whiteboard-format-text" data-text-command="italic" aria-pressed="false"><i>Italic</i> (Ctrl+I)</button><button type="button" data-action="whiteboard-format-text" data-text-command="underline" aria-pressed="false"><u>Underline</u> (Ctrl+U)</button></div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">\u263A</span><small>Emoji</small></summary><div data-whiteboard-emoji-panel></div></details>
        <details class="platform-whiteboard-quick-menu" data-whiteboard-measure-menu><summary><span aria-hidden="true">\u2194</span><small>Measure</small></summary><div data-whiteboard-measure-panel>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="laser-dimension">Laser measure \u2014 select 2 points</button>
        </div></details>
        <button type="button" data-action="whiteboard-keyboard-help" title="Show keyboard and Chromebook shortcuts"><span aria-hidden="true">?</span><small>Help</small></button>
        <details class="platform-whiteboard-quick-menu" data-whiteboard-more-menu><summary><span aria-hidden="true">\u2022\u2022\u2022</span><small>More</small></summary><div class="platform-whiteboard-more-panel" data-whiteboard-more-panel><button type="button" data-action="whiteboard-open-pixel-studio">\u25A6 Pixel Studio</button><button type="button" data-action="whiteboard-paste-system-image">Paste copied image</button><button type="button" data-action="whiteboard-remove-selection-background" title="Remove the background from the selected image">Remove Background</button></div></details>
      </nav>
      <div class="platform-whiteboard-controls" data-whiteboard-controls>
      <div class="platform-whiteboard-library" aria-label="Saved whiteboards">
        <label class="platform-whiteboard-library-primary">Board name<input type="text" data-whiteboard-title maxlength="60" placeholder="Example: Monday warm-up"></label>
        <label class="platform-whiteboard-library-primary">Class<select data-whiteboard-class><option value="all">All classes</option>${pilotTeacherClasses.map((item) => `<option value="${escapeHtml2(item.id)}"${item.id === classRecord?.id ? " selected" : ""}>${escapeHtml2(item.displayName)}</option>`).join("")}</select></label>
        <label class="platform-whiteboard-library-primary">Schedule<select data-whiteboard-schedule-type><option value="none">No schedule</option><option value="weekly">Repeats weekly</option><option value="date">Specific date</option></select></label>
        <label data-whiteboard-weekday-label hidden>Day<select data-whiteboard-day>${WEEKDAYS.map((day) => `<option value="${day}">${day}</option>`).join("")}</select></label>
        <label data-whiteboard-date-label hidden>Date<input type="date" data-whiteboard-date></label>
        <label class="platform-whiteboard-display-option"><input type="checkbox" data-whiteboard-student-display> Automatically show this board on the Student Display when its schedule begins</label>
        <button type="button" data-action="whiteboard-save-named">Save Board</button>
        <label class="platform-whiteboard-saved-list">Saved boards<select data-whiteboard-saved><option value="">Choose a saved board</option>${savedWhiteboards.map((board) => `<option value="${escapeHtml2(board.id)}">${escapeHtml2(board.title)} \xB7 ${escapeHtml2(whiteboardScheduleLabel(board))}${board.studentDisplay ? " \xB7 Student Display" : ""}</option>`).join("")}</select></label>
        <button type="button" data-action="whiteboard-load">Load</button>
        <button type="button" data-action="whiteboard-delete">Delete</button>
      </div>
      <div class="platform-whiteboard-toolbar" role="toolbar" aria-label="Whiteboard drawing tools">
        <label>Graph paper<select data-whiteboard-grid><option value="plain">Plain white</option><option value="inch">Inches</option><option value="cm">Centimeters</option><option value="mm">Millimeters</option></select></label>
        <label>Ruler<select data-whiteboard-ruler><option value="none">No ruler</option><option value="english">English ruler \u2014 inches</option><option value="metric">Metric ruler \u2014 centimeters</option></select></label>
        <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="ruler-adjust">Adjust Ruler \u2014 Move, rotate, or extend ruler</button>
        <label>Ruler markings<select data-whiteboard-ruler-sides><option value="both">Both sides</option><option value="top">One side</option></select></label>
        <label class="platform-whiteboard-compare-unit" data-whiteboard-compare-unit><span>\u201CThis is the same as\u2026\u201D unit</span><select data-whiteboard-dimension-compare disabled aria-label="Choose another unit for the selected measurement"><option value="mm">Millimeters</option><option value="cm">Centimeters</option><option value="m">Meters</option><option value="in">Inches</option><option value="ft">Feet</option><option value="yd">Yards</option></select></label>
        <label>Zoom<input type="range" data-whiteboard-zoom min="50" max="300" step="25" value="100"><output data-whiteboard-zoom-output>100%</output></label>
        <select data-whiteboard-tool hidden aria-hidden="true" tabindex="-1">
          ${["select", "lasso-select", "eraser", "erase-object", "fill", "pen", "calligraphy", "brush", "highlighter", "line", "arrow", "rectangle", "ellipse", "triangle", "diamond", "pentagon", "hexagon", "star", "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere", "pull-3d", "text", "emoji-stamp", "laser-dimension", "ruler-adjust"].map((tool) => `<option value="${tool}"${tool === "select" ? " selected" : ""}>${tool}</option>`).join("")}
        </select>
        <span class="platform-whiteboard-lasso-actions" data-whiteboard-lasso-actions hidden><strong>Selected image actions</strong><button type="button" data-action="whiteboard-download-selection">Download Selection PNG</button></span>
        <label>Color<input type="color" data-whiteboard-color value="#12384d"></label>
        <label data-whiteboard-emoji-label>Choose an emoji<select data-whiteboard-emoji aria-label="Choose an emoji stamp">${WHITEBOARD_EMOJI_STAMPS.map((group) => `<optgroup label="${escapeHtml2(group.category)}">${group.emojis.map(([emoji, name]) => `<option value="${emoji}">${emoji} ${escapeHtml2(name)}</option>`).join("")}</optgroup>`).join("")}</select></label>
        <label>Line size<input type="range" data-whiteboard-size min="2" max="32" value="6"><output data-whiteboard-size-output>6</output></label>
        <label>Text background<select data-whiteboard-text-background><option value="transparent">Transparent</option><option value="white">White</option><option value="black">Black</option><option value="highlight-yellow">Yellow highlighter</option><option value="highlight-green">Green highlighter</option><option value="highlight-pink">Pink highlighter</option><option value="highlight-blue">Blue highlighter</option></select></label>
        <label>Cursive writing lines<select data-whiteboard-cursive-lines><option value="none">No lines</option><option value="wide">Wide ruled</option><option value="practice">Handwriting practice \u2014 3 lines</option></select></label>
        <label>Cursive Coach<select data-whiteboard-cursive-coach><option value="off">Off</option><option value="letter">Model strokes after typing</option></select></label>
        <label class="platform-whiteboard-touch-practice-choice"><input type="checkbox" data-whiteboard-touch-practice> Let the student write this word by touch after typing</label>
        <label>Image<input type="file" data-whiteboard-image accept="image/*"></label>
        <span class="platform-whiteboard-youtube-control"><p>Find a video on YouTube, copy its link, then paste it here.</p><label>YouTube video link<input type="url" data-whiteboard-youtube-url placeholder="Paste a youtube.com or youtu.be link"></label><button type="button" data-action="whiteboard-paste-youtube">Paste Copied Link</button><button type="button" data-action="whiteboard-add-youtube">Add Video</button></span>
        <span class="platform-whiteboard-object-actions" role="group" aria-label="Selected object actions">
          <button type="button" data-action="whiteboard-copy">Copy</button><button type="button" data-action="whiteboard-paste">Paste</button><button type="button" data-action="whiteboard-duplicate">Duplicate</button><span class="platform-whiteboard-push-help-wrap"><button type="button" data-action="whiteboard-push-2d">Push Back to 2D</button><span class="platform-whiteboard-push-help" data-whiteboard-push-help role="status" hidden>Select the 3D shape, then use this button to return it to its original 2D shape.</span></span><button type="button" data-action="whiteboard-rotate-left">Rotate left</button><button type="button" data-action="whiteboard-rotate-right">Rotate right</button>
        </span>
        <button type="button" data-action="whiteboard-undo" disabled>Undo</button>
        <button type="button" data-action="whiteboard-redo" disabled>Redo</button>
        <button type="button" data-action="whiteboard-export">Export PNG</button>
        <button type="button" data-action="whiteboard-clear">Clear</button>
      </div>
      </div>
      <aside class="platform-whiteboard-pages" data-whiteboard-pages aria-label="Whiteboard pages"><div class="platform-whiteboard-page-heading"><button type="button" data-action="whiteboard-page-previous" title="Previous page">\u2039</button><span data-whiteboard-page-count>1 / 1</span><button type="button" data-action="whiteboard-page-next" title="Next page">\u203A</button></div><div data-whiteboard-page-tabs></div><button type="button" data-action="whiteboard-page-add">+ Add Page</button><button type="button" data-action="whiteboard-page-duplicate">Duplicate</button><button type="button" data-action="whiteboard-page-rename">Rename</button><span class="platform-whiteboard-page-rename" data-whiteboard-page-rename hidden><label>Page name<input type="text" data-whiteboard-page-name maxlength="40"></label><button type="button" data-action="whiteboard-page-rename-save">Save</button><button type="button" data-action="whiteboard-page-rename-cancel">Cancel</button></span><span class="platform-whiteboard-page-order"><button type="button" data-action="whiteboard-page-left" title="Move page left">\u2190 Move</button><button type="button" data-action="whiteboard-page-right" title="Move page right">Move \u2192</button></span><button type="button" data-action="whiteboard-page-delete">Delete Page</button></aside><div class="platform-whiteboard-surface"><canvas data-whiteboard-canvas tabindex="0" aria-label="Teacher classroom whiteboard drawing surface"></canvas></div>
      <p class="platform-whiteboard-status" data-whiteboard-status role="status" aria-live="polite">Drawings are saved in this browser session.</p>
      <div class="platform-whiteboard-context-menu" data-whiteboard-context-menu role="menu" hidden><button type="button" role="menuitem" data-action="whiteboard-copy-image">Copy Image</button><button type="button" role="menuitem" data-action="whiteboard-cut-image">Cut Image</button><button type="button" role="menuitem" data-action="whiteboard-paste-image">Paste Image</button><button type="button" role="menuitem" data-action="whiteboard-close-context-menu">Cancel</button></div>
      <aside class="platform-whiteboard-keyboard-help" data-whiteboard-keyboard-help role="dialog" aria-modal="true" aria-labelledby="whiteboard-keyboard-help-title" hidden>
        <div>
          <h3 id="whiteboard-keyboard-help-title">Whiteboard keyboard help</h3>
          <p>First click an object so its blue selection box and corner handles appear. Then use one of these commands.</p>
          <p><strong>Students:</strong> use the Chromebook <kbd>Ctrl</kbd> commands. <strong>Teachers:</strong> use <kbd>Ctrl</kbd> on Chromebook or Windows, or <kbd>Command</kbd> on Mac.</p>
          <dl>
            <div><dt>Copy</dt><dd><kbd>Ctrl</kbd> + <kbd>C</kbd> on student Chromebooks, teacher Chromebooks, or Windows<br><kbd>Command</kbd> + <kbd>C</kbd> on Mac</dd></div>
            <div><dt>Paste</dt><dd><kbd>Ctrl</kbd> + <kbd>V</kbd> or <kbd>Command</kbd> + <kbd>V</kbd></dd></div>
            <div><dt>Cut</dt><dd><kbd>Ctrl</kbd> + <kbd>X</kbd> or <kbd>Command</kbd> + <kbd>X</kbd></dd></div>
            <div><dt>Duplicate</dt><dd><kbd>Ctrl</kbd> + <kbd>D</kbd> or <kbd>Command</kbd> + <kbd>D</kbd></dd></div>
            <div><dt>Delete</dt><dd><kbd>Backspace</kbd> or <kbd>Delete</kbd></dd></div>
          </dl>
          <p>The Copy, Paste, Cut, Duplicate, Delete, Undo, and Redo buttons above the board do the same jobs without a keyboard.</p>
          <button type="button" data-action="whiteboard-close-keyboard-help">Close Help</button>
        </div>
      </aside>
      <aside class="platform-whiteboard-bob-coach" data-whiteboard-bob-coach data-state="intro" aria-live="polite" hidden>
        <img src="../assets/images/characters/thinker-bob-master.png" alt="Bob">
        <div class="platform-whiteboard-bob-coach-copy" data-whiteboard-bob-intro>
          <strong>Bob asks:</strong>
          <p>Do you want to compare this measurement to other measurements in the real world?</p>
          <div><button type="button" data-action="whiteboard-bob-directions">Yes\u2014show me how</button><button type="button" data-action="whiteboard-bob-collapse">Not right now</button></div>
        </div>
        <div class="platform-whiteboard-bob-coach-copy" data-whiteboard-bob-directions hidden>
          <strong>Compare measurements with Bob</strong>
          <ol><li>Select the red measurement line or its label.</li><li>Open the <strong class="platform-whiteboard-compare-name">\u201CThis is the same as\u2026\u201D unit</strong> menu above the board.</li><li>Choose millimeters, centimeters, meters, inches, feet, or yards.</li><li>The comparison beneath the measurement updates automatically.</li></ol>
          <button type="button" data-action="whiteboard-bob-collapse">Got it</button>
        </div>
        <button class="platform-whiteboard-bob-mini" type="button" data-action="whiteboard-bob-open" aria-label="Open Bob's measurement comparison directions"><img src="../assets/images/characters/thinker-bob-master.png" alt=""><span>Compare measurements</span></button>
      </aside>
      <div class="platform-whiteboard-clear-confirmation" data-whiteboard-clear-confirmation role="alertdialog" aria-modal="true" aria-labelledby="whiteboard-clear-title" hidden>
        <div><h3 id="whiteboard-clear-title">Clear the entire whiteboard?</h3><p>This removes the current browser-session board.</p><button type="button" data-action="whiteboard-keep">Keep Board</button><button type="button" data-action="whiteboard-confirm-clear">Clear Board</button></div>
      </div>
      <div class="platform-whiteboard-lasso-confirmation" data-whiteboard-lasso-confirmation role="dialog" aria-modal="true" aria-labelledby="whiteboard-lasso-title" hidden>
        <div><h3 id="whiteboard-lasso-title">What would you like to do with this cutout?</h3><p>Use the cutout as a separate image, delete it, or replace it with a surrounding color sampled by the eyedropper.</p><button type="button" data-action="whiteboard-lasso-cancel">Cancel</button><button type="button" data-action="whiteboard-lasso-delete">Delete Cutout</button><button type="button" data-action="whiteboard-lasso-fill">Replace Cutout with Matched Color</button><button type="button" data-action="whiteboard-lasso-use">Use Cutout Image</button></div>
      </div>
      <div class="platform-pixel-studio" data-pixel-studio role="dialog" aria-modal="true" aria-labelledby="pixel-studio-title" hidden>
        <div class="platform-pixel-studio-panel"><header><div><p class="platform-command-label">Whiteboard creative tool</p><h3 id="pixel-studio-title">Pixel Studio</h3><p>Draw a sprite, turn a selected image into pixels, practice color-bit coding, or animate frames.</p><p><strong>GIF from a website:</strong> copy the GIF or its image address, then press Ctrl+V or Command+V here. If the website blocks copying, download it and use Upload GIF.</p></div><button type="button" data-action="pixel-close" aria-label="Close Pixel Studio">\xD7</button></header>
          <nav class="platform-pixel-project-actions" aria-label="Pixel project file actions"><button type="button" data-action="pixel-new-project">New Pixel Project</button><button type="button" data-action="pixel-save-project">Save Project</button><label>Open Project<input type="file" data-pixel-project-file accept="application/json,.json"></label></nav>
          <div class="platform-pixel-status" role="status" aria-live="polite"><span data-pixel-status>Pixel Studio is ready.</span><a data-pixel-gif-fallback href="#" target="_blank" rel="noopener" hidden>Open the GIF address to download it</a></div>
          <div class="platform-pixel-levels" role="group" aria-label="Pixel Studio learning level"><button type="button" data-action="pixel-level" data-pixel-level="starter"><strong>Starter</strong><span>1-bit \xB7 8\xD78</span></button><button type="button" data-action="pixel-level" data-pixel-level="creator" aria-pressed="true"><strong>Creator</strong><span>4-bit \xB7 16\xD716</span></button><button type="button" data-action="pixel-level" data-pixel-level="advanced"><strong>Advanced</strong><span>8-bit \xB7 64\xD764</span></button><button type="button" data-action="pixel-level" data-pixel-level="full-color"><strong>Full Color</strong><span>24-bit \xB7 64\xD764</span></button></div>
          <div class="platform-pixel-studio-controls"><label>Exact grid size<select data-pixel-size><option value="8">8 \xD7 8</option><option value="16" selected>16 \xD7 16</option><option value="24">24 \xD7 24</option><option value="32">32 \xD7 32</option><option value="64">64 \xD7 64</option></select></label><label>Exact color mode<select data-pixel-bits><option value="1">1-bit \xB7 2 colors</option><option value="2">2-bit \xB7 4 colors</option><option value="4" selected>4-bit \xB7 16 colors</option><option value="8">8-bit \xB7 256 colors</option><option value="24">Full Color \xB7 millions of colors</option></select></label><label>Pixel color<input type="color" data-pixel-color value="#12384d"></label><output data-pixel-code>Color code: 0000</output><button type="button" data-action="pixel-eyedropper">Eyedropper</button><button type="button" data-action="pixel-random-palette">Random Color Palette</button><div class="platform-pixel-image-convert"><button type="button" data-action="pixel-from-image">Pixelate Selected Whiteboard Image</button><small>First close Pixel Studio, click a pasted or uploaded image on the whiteboard, then reopen Pixel Studio and choose this button.</small></div><label class="platform-pixel-gif-upload">Upload a GIF file<input type="file" data-pixel-gif accept="image/gif"></label><div class="platform-pixel-gif-address"><label>GIF web address<input type="url" data-pixel-gif-url placeholder="Paste the GIF image address here"></label><button type="button" data-action="pixel-load-gif-url">Open GIF Address</button></div><button type="button" data-action="pixel-paste-gif">Read GIF from Clipboard</button><label class="platform-pixel-advanced-import"><input type="checkbox" data-pixel-import-more> Import up to 48 GIF frames instead of the recommended 12 (may run more slowly)</label><button type="button" data-action="pixel-clear">Clear Current Frame</button></div><section class="platform-pixel-palette" aria-labelledby="pixel-palette-title"><div><h4 id="pixel-palette-title">Color-bit palette</h4><p data-pixel-palette-help>Select any color code to draw. Use its color box to change that color everywhere in the animation.</p></div><div data-pixel-palette></div></section>
          <div class="platform-pixel-photo-option"><button type="button" data-action="pixel-photo-open" aria-expanded="false">Create a Still Image from One GIF Frame</button><small>Optional\u2014the imported GIF remains a bit-based editable animation unless you choose this.</small></div><div class="platform-pixel-photo-tools" data-pixel-photo-tools hidden><div><h4>Optional still image</h4><p>Choose one frame under Animation frames, then select how that single frame should look.</p></div><label>Image treatment<select data-pixel-photo-treatment><option value="natural">Natural</option><option value="smooth">Smooth</option><option value="vivid">Vivid</option></select></label><button type="button" data-action="pixel-photo-board">Add This Frame as an Image</button><button type="button" data-action="pixel-photo-download">Download This Frame as PNG</button></div>
          <div class="platform-pixel-studio-workspace"><canvas data-pixel-canvas width="512" height="512" aria-label="Pixel drawing grid"></canvas><aside><h4>Animation frames</h4><div data-pixel-frames></div><button type="button" data-action="pixel-add-frame">+ Add Frame</button><button type="button" data-action="pixel-duplicate-frame">Duplicate Frame</button><button type="button" data-action="pixel-move-frame-left">Move Frame Earlier</button><button type="button" data-action="pixel-move-frame-right">Move Frame Later</button><button type="button" data-action="pixel-delete-frame">Delete Frame</button><label>Frame speed<input type="range" data-pixel-speed min="100" max="1200" step="100" value="400"><output data-pixel-speed-output>0.4 sec</output></label><canvas data-pixel-preview width="192" height="192" aria-label="Animated pixel preview"></canvas></aside></div>
          <footer><p data-pixel-export-note>PNG keeps all project colors. GIF supports no more than 256 colors per frame.</p><button type="button" data-action="pixel-add-board">Add Sprite to Whiteboard</button><button type="button" data-action="pixel-download-png">Download Full-Color PNG</button><button type="button" data-action="pixel-download-gif">Download Animated GIF</button><button type="button" data-action="pixel-close">Done</button></footer>
        </div>
      </div>
      <div class="platform-whiteboard-question" data-whiteboard-dimension-question role="dialog" aria-modal="true" aria-labelledby="whiteboard-dimension-question-title" hidden>
        <div><h3 id="whiteboard-dimension-question-title">Label this CAD measurement</h3><p>The two points are ready. Add the information students need.</p><p class="platform-whiteboard-measurement-tip" data-whiteboard-measurement-tip role="status" hidden></p>
          <label>What are you measuring?<select data-whiteboard-dimension-label><option value="Length">Length</option><option value="Width">Width</option><option value="Height">Height</option><option value="Diameter">Diameter</option><option value="Radius">Radius</option><option value="Spacing">Spacing</option><option value="custom">Add my own answer</option></select></label>
          <label data-whiteboard-dimension-custom-label hidden>Your label<input type="text" data-whiteboard-dimension-custom maxlength="50" placeholder="Example: Bridge span"></label>
          <label>Measurement unit<select data-whiteboard-dimension-unit><option value="in">Inches</option><option value="cm">Centimeters</option><option value="mm">Millimeters</option></select></label>
          <div><button type="button" data-action="whiteboard-dimension-cancel">Cancel</button><button type="button" data-action="whiteboard-dimension-save">Add CAD Dimension</button></div>
        </div>
      </div>
    </section>
  `, {
    title: "Teacher Command Center",
    eyebrow: "TODAY view",
    subtitle: "Class focus, organization, and readiness at a glance.",
    signedIn: true,
    teacherContext: { teacherName, className, periodLabel }
  });
}
function teacherClassesView(state) {
  const teacher = getTeacherById(state.teacherId);
  const classRecord = currentTeacherClass(state.teacherId);
  ensureClassSetupProfile(classRecord?.id);
  const teacherName = teacher?.displayName ?? (productionIdentityConfig.enabled ? "Signed-in Teacher" : "Preview Teacher");
  const className = classRecord?.displayName ?? "Class not selected";
  const periodLabel = classRecord?.periodLabel ?? "Period not selected";
  return shell(`
    <div class="platform-command-layout platform-command-layout-no-sidebar platform-class-management-layout">
      <main class="platform-class-management" aria-labelledby="class-management-title">
        <section class="platform-teacher-overview platform-class-management-intro platform-visual-zone platform-zone-settings">
          <div>
            <p class="platform-command-label">Teacher workspace</p>
            <h2 id="class-management-title">Manage Classes</h2>
            <p>Set up one class at a time. Follow the steps below; optional tools stay out of the way until you need them.</p>
          </div>
        </section>
        <nav class="platform-manage-class-flow" aria-label="Manage classes steps">
          <a href="#teacher-create-classroom"><span>1</span><strong>Class &amp; Students</strong><small>Create a roster</small></a>
          <a href="#teacher-class-schedule"><span>2</span><strong>Schedule &amp; Reflection</strong><small>Set times and weekly logs</small></a>
          <a href="#teacher-class-sharing"><span>3</span><strong>Reuse Setup</strong><small>Copy to other classes</small></a>
          <a href="#teacher-setup-tools"><span>4</span><strong>Connections</strong><small>Optional safeguards</small></a>
        </nav>
        ${classroomSetupMarkup()}
        ${classTimerScheduleMarkup(classRecord?.id)}
        <div class="platform-manage-reflection">${weeklyReflectionTeacherMarkup(classRecord?.id)}<a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">\u2190 Back to Today</a></div>
        <div id="teacher-class-sharing" tabindex="-1">${classSetupSharingMarkup(state.teacherId, "manage")}</div>
        <details class="platform-manage-advanced" id="teacher-setup-tools">
          <summary><span><b>4</b><strong>Connections &amp; Safeguards</strong></span><small>Optional school setup for Drive and evidence policies</small></summary>
          <div class="platform-today-primary-grid platform-class-management-setup">${teacherSetupMarkup()}</div>
          <a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">\u2190 Back to Today</a>
        </details>
      </main>
    </div>
  `, {
    title: "Manage Classes",
    eyebrow: "Teacher workspace",
    subtitle: "Classroom setup and student access.",
    signedIn: true,
    teacherContext: { teacherName, className, periodLabel }
  });
}
function studentTwoWeekCalendarMarkup() {
  const today = /* @__PURE__ */ new Date();
  today.setHours(12, 0, 0, 0);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - (today.getDay() + 6) % 7);
  const pastWeekStart = new Date(thisWeekStart);
  pastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const evidence = evidenceFoundation.timeline();
  const todayWork = evidence.filter((item) => /^(?:Today|Saved just now)/i.test(item.time));
  const yesterdayWork = evidence.filter((item) => /^Yesterday/i.test(item.time));
  const sameDay = (left, right) => left.toDateString() === right.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const calendarDays = [];
  const weekMarkup = (label, start) => `<div class="platform-student-calendar-week"><h3>${label}</h3><div class="platform-student-calendar-days">${Array.from({ length: 5 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const isToday = sameDay(date, today);
    const dayWork = isToday ? todayWork : sameDay(date, yesterday) ? yesterdayWork : [];
    const activities = [...new Set(dayWork.map((item) => item.activity).filter(Boolean))];
    const hasWork = activities.length > 0;
    const symbol = isToday ? "TODAY" : hasWork ? "SAVED" : "\u2014";
    const meaning = isToday ? hasWork ? "Today, work saved" : "Today" : hasWork ? "Work saved" : "No saved work";
    const dateLabel = date.toLocaleDateString(void 0, { weekday: "long", month: "long", day: "numeric" });
    const activityLabel = hasWork ? activities.join(", ") : "No saved work";
    calendarDays.push(`${dateLabel}. ${hasWork ? `Main activity: ${activityLabel}` : activityLabel}.`);
    return `<button class="platform-student-calendar-day${isToday ? " is-today" : ""}" type="button" data-action="open-student-calendar-day" data-calendar-date="${escapeHtml2(dateLabel)}" data-calendar-activity="${escapeHtml2(activityLabel)}" data-calendar-work="${hasWork}" data-calendar-today="${isToday}" data-calendar-url="#student-todays-activities" aria-label="${escapeHtml2(dateLabel)}: ${meaning}${hasWork ? `. Main activity: ${activityLabel}. Select to open activity choices.` : ""}"><strong>${escapeHtml2(date.toLocaleDateString(void 0, { weekday: "short" }))}</strong><span>${date.getDate()}</span><b aria-hidden="true">${symbol}</b></button>`;
  }).join("")}</div></div>`;
  const weeks = `${weekMarkup("Past Week", pastWeekStart)}${weekMarkup("This Week", thisWeekStart)}`;
  const defaultDate = new Date(today);
  if (today.getDay() === 0 || today.getDay() === 6) {
    defaultDate.setTime(thisWeekStart.getTime());
    defaultDate.setDate(thisWeekStart.getDate() + 4);
  }
  const defaultWork = sameDay(defaultDate, today) ? todayWork : sameDay(defaultDate, yesterday) ? yesterdayWork : [];
  const defaultActivity = defaultWork.map((item) => item.activity).find(Boolean) || "No saved work";
  const defaultSymbol = sameDay(defaultDate, today) ? "TODAY" : defaultWork.length ? "SAVED" : "\u2014";
  const defaultDateLabel = defaultDate.toLocaleDateString(void 0, { weekday: "long", month: "long", day: "numeric" });
  return `<section class="platform-student-calendar platform-student-zone platform-student-zone-history" aria-labelledby="student-calendar-title"><h2 id="student-calendar-title">Mission Ledger</h2><p class="platform-student-calendar-key"><span>Today</span><span>Saved</span><span>None</span></p><p class="platform-sr-only">${escapeHtml2(calendarDays.join(" "))}</p><div class="platform-student-calendar-weeks">${weeks}</div><div class="platform-student-calendar-detail" data-student-calendar-detail role="status"><strong>${defaultSymbol} ${escapeHtml2(defaultDateLabel)}</strong><span>${escapeHtml2(defaultActivity)}</span><a href="#student-todays-activities" data-student-calendar-activity-link${defaultActivity === "No saved work" ? " hidden" : ""}>Reopen Mission</a></div></section>`;
}
function studentDashboardView(state) {
  const student = getStudentById(state.studentId);
  const classRecord = getClassById(state.classId);
  const classResourceState = classResourceSharing.read(state.classId);
  const activeClassResources = classResourceState.activeResources;
  const assignedResearch = readTeacherAssignedResearch(state.classId);
  const reflectionStatus = weeklyReflections.status(state.classId, state.studentId);
  const activityWindowStart = reflectionActivityWindowStart(/* @__PURE__ */ new Date());
  const sharedResourceActivities = (classResourceState.history ?? []).filter((entry) => Number(entry.sharedAt) >= activityWindowStart && Number(entry.sharedAt) <= Date.now()).map((entry) => entry.title);
  const teacherActivities = [...new Set([
    ...weeklyReflections.activities(state.classId).map((entry) => entry.title),
    ...sharedResourceActivities,
    ...activeClassResources.map((resource) => resource.title),
    todaysMission.read().title
  ].filter(Boolean))];
  const reflectionOptions = (options) => `<option value="">Choose one</option>${options.map((option) => `<option value="${escapeHtml2(option)}">${escapeHtml2(option)}</option>`).join("")}`;
  const assignedReflection = studentReflectionMarkup(reflectionStatus, teacherActivities, reflectionOptions, state.classId);
  const finishMarkup = assignedReflection || `<section class="platform-student-finish platform-student-zone platform-student-zone-review platform-student-trail-stop platform-student-trail-stop-right" aria-labelledby="reflection-check-title"><p class="platform-student-section-label">Step 4</p><div class="platform-student-step-heading"><img src="./assets/images/student-path/captains-log-brass-badge.png" alt=""><h2 id="reflection-check-title">Captain\u2019s Log</h2></div><p>Mission complete for today!</p></section>`;
  const rawStudentName = productionStudentDisplayLabel || student?.displayName || "Student";
  const studentName = escapeHtml2(rawStudentName);
  const className = escapeHtml2(classRecord?.displayName ?? "Class not selected");
  return shell(`
    <div class="platform-student-home">
      ${state.studentId === "student-preview-1" ? `<aside class="platform-student-preview-banner"><div><strong>Student Preview \u2014 No Sign-In Code</strong><p>You are viewing fictional student Ada Rivera in Preview STEM Class. Work completed here is only preview data in this browser.</p></div><a class="platform-button platform-button-secondary" href="#${ROUTES.WELCOME}">Exit Student Preview</a></aside>` : ""}
      ${studentNameplateMarkup(state.studentId, studentName, className, rawStudentName)}
      ${studentClassLimerickMarkup(state.classId)}

      <section class="platform-student-quest-map" aria-labelledby="student-quest-map-title">
        <div class="platform-student-quest-map-heading">
          <h2 id="student-quest-map-title">Mission Route</h2>
          <p>Tap each step.</p>
        </div>
        <nav class="platform-student-quest-path" aria-label="Mission steps in order">
          <a class="platform-student-quest-stop is-current" href="#current-goal-title" data-action="open-student-quest-step" data-student-quest="look" aria-current="step"><span class="platform-student-quest-number">1</span><img class="platform-student-quest-icon" src="./assets/images/student-path/mission-briefing-brass-badge.png" alt=""><strong>Mission Briefing</strong><small data-student-quest-status>You are here</small></a>
          <a class="platform-student-quest-stop" href="#student-todays-activities" data-action="open-student-quest-step" data-student-quest="do"><span class="platform-student-quest-number">2</span><img class="platform-student-quest-icon" src="./assets/images/student-path/inventors-workshop-brass-badge.png" alt=""><strong>Inventor\u2019s Workshop</strong><small data-student-quest-status>Next</small></a>
          <a class="platform-student-quest-stop" href="#evidence-connections-title" data-action="open-student-quest-step" data-student-quest="show"><span class="platform-student-quest-number">3</span><img class="platform-student-quest-icon" src="./assets/images/student-path/evidence-vault-brass-badge.png" alt=""><strong>Evidence Vault</strong><small data-student-quest-status>Then</small></a>
          <a class="platform-student-quest-stop" href="#reflection-check-title" data-action="open-student-quest-step" data-student-quest="finish"><span class="platform-student-quest-number">4</span><img class="platform-student-quest-icon" src="./assets/images/student-path/captains-log-brass-badge.png" alt=""><strong>Captain\u2019s Log</strong><small data-student-quest-status>Last</small></a>
        </nav>
      </section>

      <section class="platform-student-goal platform-student-zone platform-student-zone-now platform-student-trail-stop platform-student-trail-stop-left" aria-labelledby="current-goal-title">
        <p class="platform-student-section-label">Step 1</p>
        <div class="platform-student-step-heading"><img src="./assets/images/student-path/mission-briefing-brass-badge.png" alt=""><h2 id="current-goal-title">Mission Briefing</h2></div>
        <div data-pb002j-current-goal>
          <p class="platform-student-empty-state">Checking your goal\u2026</p>
        </div>
      </section>

      <a class="platform-student-trail-arrow platform-student-trail-arrow-right" href="#student-todays-activities" aria-label="Go to step 2, Inventor\u2019s Workshop"><span>Next: Workshop</span><b aria-hidden="true">\u2198</b></a>

      ${todaysLessonStudentMarkup(state.classId, state.studentId, assignedResearch)}

      <a class="platform-student-trail-arrow platform-student-trail-arrow-left" href="#evidence-connections-title" aria-label="Go to step 3, Evidence Vault"><span>Next: Evidence Vault</span><b aria-hidden="true">\u2199</b></a>

      <section class="platform-student-show platform-student-zone platform-student-zone-tools platform-student-trail-stop platform-student-trail-stop-left" aria-labelledby="evidence-connections-title" data-evidence-foundation>
        <p class="platform-student-section-label">Step 3</p>
        <div class="platform-student-step-heading"><img src="./assets/images/student-path/evidence-vault-brass-badge.png" alt=""><h2 id="evidence-connections-title">Evidence Vault</h2></div>
        <p>Add evidence.</p>
        ${evidenceCaptureMarkup()}
      </section>

      <a class="platform-student-trail-arrow platform-student-trail-arrow-right" href="#reflection-check-title" aria-label="Go to step 4, Captain\u2019s Log"><span>Next: Captain\u2019s Log</span><b aria-hidden="true">\u2198</b></a>

      ${finishMarkup}

      <details class="platform-student-later">
        <summary>Archive Room</summary>
        <p>Calendar and saved work</p>
        ${studentTwoWeekCalendarMarkup()}
      <section class="platform-stem-work platform-student-zone platform-student-zone-work" aria-labelledby="stem-work-title">
        <div class="platform-student-section-heading">
          <p class="platform-student-section-label">Saved work</p>
          <h2 id="stem-work-title">My STEM Work</h2>
          <p>Open current or past work.</p>
        </div>
        <div class="platform-stem-work-layout">
          <section class="platform-stem-work-section platform-stem-work-current" aria-labelledby="current-work-title">
            <p class="platform-stem-work-label">Continue Current Work</p>
            <h3 id="current-work-title">Current Work</h3>
            <div class="platform-project-card-container" aria-labelledby="current-work-title">
              <p class="platform-student-empty-state">You do not have current work to continue yet.</p>
              <p>When a project is ready, you can return to it here.</p>
            </div>
          </section>
          <section class="platform-stem-work-history" aria-labelledby="work-history-title">
            <div class="platform-stem-work-history-heading">
              <p class="platform-stem-work-label">Your engineering journey</p>
              <h3 id="work-history-title">Look Back at Your Work</h3>
            </div>
            <div class="platform-stem-work-history-layout">
              <section class="platform-stem-work-section platform-stem-work-recent" aria-labelledby="recent-work-title">
                <p class="platform-stem-work-label">Recently active</p>
                <h4 id="recent-work-title">Recent Work</h4>
                <div class="platform-project-card-container" aria-labelledby="recent-work-title">
                  <p class="platform-student-empty-state">Your recent engineering work will appear here when it is available.</p>
                </div>
              </section>
              <section class="platform-stem-work-section platform-stem-work-previous" aria-labelledby="previous-work-title">
                <p class="platform-stem-work-label">Earlier projects</p>
                <h4 id="previous-work-title">Previous Work</h4>
                <div class="platform-project-card-container" aria-labelledby="previous-work-title">
                  <p class="platform-student-empty-state">Your earlier engineering work will appear here when it is available.</p>
                </div>
              </section>
            </div>
          </section>
        </div>
      </section>
      </details>
    </div>
  `, { title: "Student Home", eyebrow: "Student Dashboard", signedIn: true });
}
function viewForRoute(route, state) {
  switch (route) {
    case ROUTES.TEACHER_LOGIN:
      return teacherLoginView();
    case ROUTES.TEACHER_CREATE:
      return teacherCreateView();
    case ROUTES.TEACHER_RECOVERY:
      return teacherRecoveryView();
    case ROUTES.TEACHER_DASHBOARD:
      return teacherDashboardView(state);
    case ROUTES.TEACHER_CLASSES:
      return teacherClassesView(state);
    case ROUTES.STUDENT_ENTRY:
      return studentEntryView();
    case ROUTES.STUDENT_ROSTER:
      return studentRosterView(state);
    case ROUTES.STUDENT_IDENTIFIER:
      return studentIdentifierView(state);
    case ROUTES.STUDENT_DASHBOARD:
      return studentDashboardView(state);
    default:
      return welcomeView();
  }
}
function showFormError(form, message) {
  const error = form.querySelector("[data-error]");
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
  error.focus?.();
}
function playTimerSound(sound, customAudio = "") {
  if (!sound || sound === "None") return;
  if (sound === "Bird Chirping") {
    try {
      const player = new Audio(BIRD_CHIRPING_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch {
    }
    return;
  }
  if (sound === "Cardinal") {
    try {
      const player = new Audio(CARDINAL_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch {
    }
    return;
  }
  if (sound === "Guitar Loop \u2014 Time Ending") {
    try {
      const player = new Audio(GUITAR_LOOP_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch {
    }
    return;
  }
  if (sound === "Choir \u2014 Heavenly Transition") {
    try {
      const player = new Audio(CHOIR_TRANSITION_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch {
    }
    return;
  }
  if (sound === "Drum Loop") {
    try {
      const player = new Audio(DRUM_LOOP_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch {
    }
    return;
  }
  if (sound === "Trap Loop Drums") {
    try {
      const player = new Audio(TRAP_LOOP_DRUMS_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch {
    }
    return;
  }
  if (sound === "Soft Piano") {
    try {
      const player = new Audio(SOFT_PIANO_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch {
    }
    return;
  }
  if (sound === "Custom Upload" && customAudio) {
    try {
      const player = new Audio(customAudio);
      player.volume = 0.85;
      void player.play();
    } catch {
    }
    return;
  }
}
function openStudentTimerPopout() {
  if (studentTimerPopout && !studentTimerPopout.closed) {
    studentTimerPopout.focus();
    syncStudentTimerPopout();
    return;
  }
  studentTimerPopout = window.open("", "thinkamigbob-student-timer", "popup=yes,width=460,height=540,resizable=yes");
  if (!studentTimerPopout) return;
  studentTimerPopout.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Student Timer \xB7 THINKamigBOB</title><style>
    *{box-sizing:border-box}html{color-scheme:dark;background:#142936}body{min-height:100vh;margin:0;display:grid;place-items:center;padding:clamp(8px,2.5vmin,18px);color:#fff;background:radial-gradient(circle at 50% 40%,#1f5268 0,#142936 68%);font-family:Arial,sans-serif;text-align:center;overflow:hidden}
    main{display:grid;justify-items:center;gap:clamp(5px,2vmin,14px);width:100%}p,h1{margin:0}.brand{color:#b9dce8;font-size:clamp(.72rem,2vmin,.9rem);font-weight:800;letter-spacing:.08em}.phase{font-size:clamp(1rem,4.5vmin,2.2rem)}
    .ring{position:relative;display:grid;width:min(84vw,66vh);aspect-ratio:1;place-items:center;border-radius:50%;background:#24779a;box-shadow:0 1rem 3rem #0008}
    .ring[data-active-phases="true"]{background:conic-gradient(from -90deg,#454f55 0 var(--timer-elapsed),transparent var(--timer-elapsed) 100%),conic-gradient(from -90deg,#17698e 0 var(--timer-main-start),#2d7d5b var(--timer-main-start) var(--timer-warning-start),#d4a017 var(--timer-warning-start) var(--timer-red-start),#b94a45 var(--timer-red-start) 100%)}
    .ring:before{position:absolute;inset:12%;border:2px solid #ffffff40;border-radius:50%;background:#142936;content:""}.time{position:relative;z-index:1;color:#fff;font-size:clamp(3rem,14vmin,8rem);font-weight:800;font-variant-numeric:tabular-nums}.warning{padding:.5rem .7rem;border:2px solid #c28b12;border-radius:.55rem;background:#704500d1;font-size:clamp(.75rem,2.5vmin,1rem);font-weight:800}.warning[hidden]{display:none}.resize-hint{color:#b9dce8;font-size:clamp(.65rem,1.8vmin,.8rem);font-weight:700}
  </style></head><body><main><p class="brand">THINKamigBOB</p><h1 class="phase">Today's Engineering Time</h1><div class="ring" data-active-phases="false"><output class="time">00:00</output></div><p class="warning" hidden>Five minutes until cleanup or the ending activity.</p><p class="resize-hint">Drag any corner of this window to resize the timer.</p></main></body></html>`);
  studentTimerPopout.document.close();
  syncStudentTimerPopout();
}
function syncStudentTimerPopout() {
  if (!studentTimerPopout || studentTimerPopout.closed) return;
  const state = currentScheduledLessonTimerState();
  const scheduled = classTimerSchedule.readEffective().pomodoroEnabled ? presentationTimerVisualState(state) : currentTimerVisualState(state);
  const phase = scheduled.active ? scheduled.phase : null;
  const documentRef = studentTimerPopout.document;
  const phaseName = documentRef.querySelector(".phase");
  const time = documentRef.querySelector(".time");
  const warning = documentRef.querySelector(".warning");
  const ring = documentRef.querySelector(".ring");
  if (phaseName) phaseName.textContent = phase?.name ?? "Today's Engineering Time";
  if (time) time.textContent = formatLessonTime(state.remainingSeconds);
  if (warning) warning.hidden = !scheduled.fiveMinuteWarning;
  if (ring) {
    ring.dataset.activePhases = phase ? "true" : "false";
    ring.style.setProperty("--timer-elapsed", `${scheduled.elapsedPercent ?? 0}%`);
    ring.style.setProperty("--timer-main-start", `${scheduled.mainStartPercent ?? 20}%`);
    ring.style.setProperty("--timer-warning-start", `${scheduled.warningStartPercent ?? 70}%`);
    ring.style.setProperty("--timer-red-start", `${scheduled.redStartPercent ?? 80}%`);
  }
}
function syncClassroomPresentationWindow() {
  if (!classroomPresentationWindow || classroomPresentationWindow.closed) return;
  const documentRef = classroomPresentationWindow.document;
  const timer = currentScheduledLessonTimerState();
  const visual = presentationTimerVisualState(timer);
  documentRef.querySelectorAll("[data-timer-remaining]").forEach((output) => {
    output.textContent = formatLessonTime(timer.remainingSeconds);
  });
  documentRef.querySelectorAll("[data-timer-phase-name]").forEach((label) => {
    label.textContent = visual.phase?.name ?? "Today's Engineering Time";
  });
  documentRef.querySelectorAll("[data-timer-state]").forEach((label) => {
    label.textContent = timer.status;
  });
  documentRef.querySelectorAll("[data-timer-ring]").forEach((ring) => {
    ring.dataset.activePhases = visual.phase ? "true" : "false";
    ring.style.setProperty("--timer-elapsed", `${visual.elapsedPercent ?? 0}%`);
    ring.style.setProperty("--timer-main-start", `${visual.mainStartPercent ?? 20}%`);
    ring.style.setProperty("--timer-warning-start", `${visual.warningStartPercent ?? 70}%`);
    ring.style.setProperty("--timer-red-start", `${visual.redStartPercent ?? 80}%`);
  });
  documentRef.querySelectorAll("[data-timer-warning]").forEach((warning) => {
    warning.hidden = !visual.fiveMinuteWarning;
  });
  documentRef.querySelectorAll("[data-student-memo-text]").forEach((element) => {
    element.innerHTML = teacherMemo.read().text ? memoSegmentsMarkup(teacherMemo.read()) : "No message is ready yet.";
  });
  const memoState = teacherMemo.read();
  const selectedMode = studentDisplayMode.read({ hasMemo: Boolean(memoState.text || todaysMission.read().title) });
  const showTimer = selectedMode !== STUDENT_DISPLAY_MODES.MESSAGE;
  const showMemo = Boolean(memoState.text) && selectedMode !== STUDENT_DISPLAY_MODES.TIMER;
  const studentDisplay = documentRef.querySelector("#platform-second-window-display");
  const studentTimer = documentRef.querySelector("[data-student-engineering-time]");
  const studentMemo = documentRef.querySelector("[data-student-memo]");
  const imageSlot = documentRef.querySelector("[data-student-image-slot]");
  let studentImage = documentRef.querySelector(".platform-student-memo-image");
  if (memoState.image && !studentImage && studentMemo) {
    studentImage = documentRef.createElement("img");
    studentImage.className = "platform-student-memo-image";
    studentImage.alt = "Teacher whiteboard shared with students";
  }
  if (studentImage && memoState.image) studentImage.src = memoState.image;
  if (studentImage && !memoState.image) studentImage.remove();
  if (studentTimer) studentTimer.hidden = !showTimer;
  if (studentMemo) studentMemo.hidden = !showMemo;
  if (studentDisplay) {
    studentDisplay.classList.toggle("platform-student-display-combined", showTimer && showMemo);
    studentDisplay.classList.toggle("platform-student-display-message-only", !showTimer && showMemo);
    studentDisplay.classList.toggle("platform-student-display-timer-only", showTimer && !showMemo);
  }
  if (studentImage && studentMemo) {
    (showTimer && imageSlot ? imageSlot : studentMemo).append(studentImage);
    if (imageSlot) imageSlot.hidden = !showTimer;
  }
  const mission = todaysMission.read();
  documentRef.querySelectorAll("[data-student-mission-title]").forEach((element) => {
    element.textContent = mission.title;
  });
  documentRef.querySelectorAll("[data-student-mission-focus]").forEach((element) => {
    element.textContent = mission.focus;
  });
  const liveVoice = Number(document.querySelector("[data-voice-meter-output]")?.textContent ?? 0);
  const activity = readVoiceMeterActivity();
  const prediction = predictedLearningType(liveVoice);
  documentRef.querySelectorAll("[data-voice-meter]").forEach((meter) => {
    meter.style.setProperty("--voice-meter-level", `${liveVoice}%`);
    meter.style.setProperty("--voice-threshold", `${activity.target}%`);
    meter.dataset.meterState = voiceMeterState(liveVoice, activity.target);
    meter.querySelector("[data-voice-meter-output]")?.replaceChildren(String(liveVoice));
  });
  documentRef.querySelectorAll("[data-voice-prediction]").forEach((label) => {
    label.textContent = `${prediction.icon} ${prediction.label}`;
  });
  documentRef.querySelectorAll("[data-voice-display-mode]").forEach((element) => {
    element.dataset.voiceDisplayMode = readVoiceMeterDisplayMode();
  });
  syncPresentationTimerViewControls(documentRef);
}
function openClassroomPresentationWindow() {
  if (classroomPresentationWindow && !classroomPresentationWindow.closed) {
    classroomPresentationWindow.focus();
    syncClassroomPresentationWindow();
    return;
  }
  syncStudentDisplayPresentation();
  const source = document.querySelector("#platform-student-timer-display");
  if (!source) return;
  const classroomUrl = new URL(window.location.href);
  classroomUrl.searchParams.set("classroomDisplay", "1");
  classroomPresentationWindow = window.open(classroomUrl.href, "thinkamigbob-classroom-view");
  const status = document.querySelector("[data-classroom-window-status]");
  if (!classroomPresentationWindow) {
    if (status) status.textContent = "The Classroom Display was blocked. Allow new tabs for this platform, then try again.";
    return;
  }
  classroomPresentationWindow.addEventListener("load", () => syncClassroomPresentationWindow(), { once: true });
  if (status) status.textContent = "Classroom Display opened in a separate browser tab or window.";
  return;
  const clone = source.cloneNode(true);
  clone.hidden = false;
  clone.id = "platform-second-window-display";
  const stylesheetLinks = [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.href).filter(Boolean).map((href) => `<link rel="stylesheet" href="${escapeHtml2(href)}">`).join("");
  classroomPresentationWindow = window.open("", "thinkamigbob-classroom-view");
  if (!classroomPresentationWindow) {
    if (status) status.textContent = "The Classroom Display was blocked. Allow new tabs for this platform, then try again.";
    return;
  }
  classroomPresentationWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Classroom View \xB7 THINKamigBOB</title>${stylesheetLinks}<style>html,body{margin:0;min-height:100%;overflow:hidden}#platform-second-window-display{display:grid!important}</style></head><body class="platform-app"><details class="platform-classroom-window-controls" aria-label="Classroom Display window controls"><summary>Display</summary><div class="platform-classroom-window-options"><button type="button" data-action="fullscreen-classroom-display">Full Screen</button><details class="platform-classroom-split-control"><summary>Split Screen</summary><div><label>Webpage address<input type="url" data-classroom-companion-url inputmode="url" placeholder="Paste a webpage link"></label><button type="button" data-action="split-screen-classroom-display">Show Side by Side</button></div></details><span data-classroom-display-layout-status role="status"></span></div></details>${clone.outerHTML}</body></html>`);
  classroomPresentationWindow.document.close();
  const screenOptionsSummary = classroomPresentationWindow.document.querySelector(".platform-classroom-window-controls > summary");
  if (screenOptionsSummary) screenOptionsSummary.textContent = "Screen Options";
  const exitPresentationButton = classroomPresentationWindow.document.createElement("button");
  exitPresentationButton.type = "button";
  exitPresentationButton.className = "platform-classroom-exit-presentation";
  exitPresentationButton.dataset.action = "exit-classroom-fullscreen";
  exitPresentationButton.textContent = "Exit Full Screen";
  exitPresentationButton.hidden = true;
  classroomPresentationWindow.document.body.append(exitPresentationButton);
  installSmartboardToolGestures(classroomPresentationWindow.document);
  classroomPresentationWindow.document.addEventListener("change", (event) => {
    const voiceTarget = event.target.closest("[data-voice-meter-target]");
    if (!voiceTarget) return;
    const mainVoiceTarget = document.querySelector("[data-voice-meter-target]");
    if (!mainVoiceTarget) return;
    mainVoiceTarget.value = voiceTarget.value;
    mainVoiceTarget.dispatchEvent(new Event("change", { bubbles: true }));
    syncClassroomPresentationWindow();
  });
  classroomPresentationWindow.document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    if (handleNamePickerAction(action, classroomPresentationWindow.document)) return;
    if (handleActivitySideTimerAction(action)) return;
    if (action.dataset.action === "toggle-smartboard-tool") {
      const tool = classroomPresentationWindow.document.querySelector(`[data-smartboard-tool="${action.dataset.smartboardToolName}"]`);
      if (tool) {
        tool.hidden = !tool.hidden;
        if (!tool.hidden) {
          bringSmartboardToolForward(tool);
          keepSmartboardToolsOnScreen(classroomPresentationWindow.document);
        }
      }
    }
    if (action.dataset.action === "reset-smartboard-tools") resetSmartboardToolPositions(classroomPresentationWindow.document);
    if (action.dataset.action === "fullscreen-classroom-display") void toggleClassroomDisplayFullscreen(action);
    if (action.dataset.action === "exit-classroom-fullscreen") void exitClassroomDisplayFullscreen(action.ownerDocument);
    if (action.dataset.action === "split-screen-classroom-display") {
      if (classroomPresentationWindow.document.fullscreenElement) void classroomPresentationWindow.document.exitFullscreen();
      const layoutStatus = classroomPresentationWindow.document.querySelector("[data-classroom-display-layout-status]");
      const rawAddress = classroomPresentationWindow.document.querySelector("[data-classroom-companion-url]")?.value.trim() || "";
      let webpageUrl = "";
      try {
        const candidate = new URL(/^https?:\/\//i.test(rawAddress) ? rawAddress : `https://${rawAddress}`);
        if (!["http:", "https:"].includes(candidate.protocol)) throw new Error("Unsupported webpage address");
        webpageUrl = candidate.href;
      } catch {
        if (layoutStatus) layoutStatus.textContent = "Paste a complete webpage address first.";
        return;
      }
      if (classroomCompanionWindow && !classroomCompanionWindow.closed) classroomCompanionWindow.location.href = webpageUrl;
      else classroomCompanionWindow = classroomPresentationWindow.open(webpageUrl, "thinkamigbob-classroom-companion", "popup=yes,width=900,height=760,resizable=yes");
      if (!classroomCompanionWindow) {
        if (layoutStatus) layoutStatus.textContent = "The webpage window was blocked. Allow pop-ups, then try again.";
        return;
      }
      const displayScreen = classroomPresentationWindow.screen;
      const screenLeft = Number(displayScreen.availLeft || 0);
      const screenTop = Number(displayScreen.availTop || 0);
      const screenWidth = Number(displayScreen.availWidth || displayScreen.width || 1200);
      const screenHeight = Number(displayScreen.availHeight || displayScreen.height || 760);
      const halfWidth = Math.floor(screenWidth / 2);
      try {
        classroomPresentationWindow.moveTo(screenLeft, screenTop);
        classroomPresentationWindow.resizeTo(halfWidth, screenHeight);
        classroomCompanionWindow.moveTo(screenLeft + halfWidth, screenTop);
        classroomCompanionWindow.resizeTo(screenWidth - halfWidth, screenHeight);
        classroomCompanionWindow.focus();
        classroomPresentationWindow.focus();
        if (layoutStatus) layoutStatus.textContent = "Classroom Display and webpage are side by side.";
      } catch {
        if (layoutStatus) layoutStatus.textContent = "The webpage is open. Use the smartboard window controls to place both windows side by side.";
      }
    }
    if (action.dataset.action === "popout-smartboard-tool") openSmartboardToolPopout(action.closest("[data-smartboard-tool]"));
    if (action.dataset.action === "fullscreen-smartboard-tool") {
      const tool = action.closest("[data-smartboard-tool]");
      toggleSmartboardToolMaximized(tool);
    }
    if (action.dataset.action === "close-smartboard-tool") action.closest("[data-smartboard-tool]").hidden = true;
    if (action.dataset.action === "timer-start") lessonTimer.start();
    if (action.dataset.action === "timer-start-or-resume") lessonTimer.read().status === LESSON_TIMER_STATES.PAUSED ? lessonTimer.resume() : lessonTimer.start();
    if (action.dataset.action === "timer-pause") lessonTimer.pause();
    if (action.dataset.action === "timer-resume") lessonTimer.resume();
    if (action.dataset.action === "timer-end") lessonTimer.end();
    if (action.dataset.action === "timer-reset") lessonTimer.reset();
    if (action.dataset.action === "timer-subtract-minute") lessonTimer.subtractMinute();
    if (action.dataset.action === "timer-add-minute") lessonTimer.addMinute();
    if (action.dataset.action === "timer-view-mode") setPresentationTimerViewMode(action.dataset.timerViewMode);
    if (action.dataset.action === "stopwatch-start" && stopwatchInterval === null) stopwatchInterval = window.setInterval(() => {
      stopwatchSeconds += 1;
      document.querySelectorAll("[data-stopwatch-output]").forEach((output) => {
        output.textContent = formatLessonTime(stopwatchSeconds);
      });
      classroomPresentationWindow?.document.querySelectorAll("[data-stopwatch-output]").forEach((output) => {
        output.textContent = formatLessonTime(stopwatchSeconds);
      });
    }, 1e3);
    if (action.dataset.action === "stopwatch-pause" && stopwatchInterval !== null) {
      window.clearInterval(stopwatchInterval);
      stopwatchInterval = null;
    }
    if (action.dataset.action === "stopwatch-reset") {
      if (stopwatchInterval !== null) window.clearInterval(stopwatchInterval);
      stopwatchInterval = null;
      stopwatchSeconds = 0;
      classroomPresentationWindow.document.querySelectorAll("[data-stopwatch-output]").forEach((output) => {
        output.textContent = formatLessonTime(0);
      });
    }
    if (action.dataset.action === "voice-meter-start") void startVoiceMeter();
    if (action.dataset.action === "voice-meter-stop") stopVoiceMeter("Voice Meter paused.");
    if (action.dataset.action === "open-whiteboard") document.querySelector('[data-action="open-whiteboard"]')?.click();
    syncLessonTimerPresentation();
  });
  classroomPresentationWindow.document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    classroomPresentationWindow.close();
    classroomPresentationWindow = null;
    if (status) status.textContent = "Classroom Display closed.";
  });
  syncClassroomPresentationWindow();
  applyClassroomBobDisplay();
  const scheduledPost = scheduledDoNowForClass(currentDoNowClassId());
  if (scheduledPost) showDoNow(scheduledPost);
  else if (readLiveDoNow()) syncDoNowPresentation();
  classroomPresentationWindow.focus();
  if (status) status.textContent = "Classroom Display opened in a separate browser tab or window.";
}
function standaloneClassroomDisplayRequested() {
  return new URLSearchParams(window.location.search).get("classroomDisplay") === "1";
}
function enterStandaloneClassroomDisplayMode() {
  if (!standaloneClassroomDisplayRequested()) return;
  const display = document.querySelector("#platform-student-timer-display");
  if (!display) return;
  display.hidden = false;
  document.body.classList.add("platform-standalone-classroom-display");
  if (!document.querySelector(".platform-classroom-window-controls")) {
    const controls = document.createElement("div");
    controls.className = "platform-classroom-window-controls";
    controls.setAttribute("aria-label", "Classroom Display screen options");
    controls.innerHTML = '<strong>Screen Options</strong><button type="button" data-action="fullscreen-classroom-display">Full Screen</button><span data-classroom-display-layout-status role="status"></span>';
    controls.querySelector('[data-action="fullscreen-classroom-display"]').addEventListener("click", (event) => {
      event.stopPropagation();
      void toggleClassroomDisplayFullscreen(event.currentTarget);
    });
    root.append(controls);
  }
  if (!document.querySelector(".platform-classroom-exit-presentation")) {
    const exit = document.createElement("button");
    exit.type = "button";
    exit.className = "platform-classroom-exit-presentation";
    exit.dataset.action = "exit-classroom-fullscreen";
    exit.textContent = "Exit Full Screen";
    exit.hidden = true;
    exit.addEventListener("click", (event) => {
      event.stopPropagation();
      void exitClassroomDisplayFullscreen(event.currentTarget.ownerDocument);
    });
    root.append(exit);
  }
  installSmartboardToolPopoutButtons(document);
  syncLessonTimerPresentation();
}
function syncLessonTimerPresentation() {
  const state = currentScheduledLessonTimerState();
  const scheduled = classTimerSchedule.readEffective().pomodoroEnabled ? presentationTimerVisualState(state) : currentTimerVisualState(state);
  const phase = scheduled.active ? scheduled.phase : null;
  const presentationScheduled = presentationTimerVisualState(state);
  const presentationPhase = presentationScheduled.active ? presentationScheduled.phase : null;
  const appState = session.read();
  if (appState.role === PLATFORM_ROLES.TEACHER && state.status === LESSON_TIMER_STATES.RUNNING) {
    const classId = currentTeacherClass(appState.teacherId)?.id;
    const released = classId && (classResourceSharing.release(classId, "class-start").ok || phase?.color && classResourceSharing.release(classId, phase.color).ok);
    if (released) {
      const region = document.querySelector("[data-class-resource-teacher]");
      if (region) region.outerHTML = classResourceTeacherMarkup(classId);
    }
  }
  const sounds = classTimerSchedule.readEffective();
  const phaseKey = phase?.key ?? null;
  if (lastTimerPhaseKey !== null && phaseKey !== lastTimerPhaseKey) {
    if (phaseKey === "warning") playTimerSound(sounds.yellowSound, sounds.yellowCustomAudio);
    if (phaseKey === "ending") playTimerSound(sounds.redSound, sounds.redCustomAudio);
  }
  if (lastTimerStatus !== null && lastTimerStatus !== LESSON_TIMER_STATES.COMPLETE && state.status === LESSON_TIMER_STATES.COMPLETE) {
    playTimerSound(sounds.endSound, sounds.endCustomAudio);
  }
  lastTimerPhaseKey = phaseKey;
  lastTimerStatus = state.status;
  document.querySelectorAll("[data-timer-remaining]").forEach((element) => {
    element.textContent = formatLessonTime(state.remainingSeconds);
    element.dataset.timerPhaseColor = phase?.color ?? "default";
  });
  document.querySelectorAll("[data-timer-phase-name]").forEach((element) => {
    element.textContent = phase?.name ?? "Today's Engineering Time";
  });
  document.querySelectorAll("[data-timer-warning]").forEach((element) => {
    element.hidden = !scheduled.fiveMinuteWarning;
  });
  document.querySelectorAll("#platform-student-timer-display [data-timer-phase-name]").forEach((element) => {
    element.textContent = presentationPhase?.name ?? "Today's Engineering Time";
  });
  document.querySelectorAll("#platform-student-timer-display [data-timer-warning]").forEach((element) => {
    element.hidden = !presentationScheduled.fiveMinuteWarning;
  });
  document.querySelectorAll("#platform-student-timer-display [data-timer-remaining]").forEach((element) => {
    element.dataset.timerPhaseColor = presentationPhase?.color ?? "default";
  });
  document.querySelectorAll("[data-timer-ring]").forEach((element) => {
    element.dataset.activePhases = presentationPhase ? "true" : "false";
    element.style.setProperty("--timer-elapsed", `${presentationScheduled.elapsedPercent ?? 0}%`);
    element.style.setProperty("--timer-main-start", `${presentationScheduled.mainStartPercent ?? 20}%`);
    element.style.setProperty("--timer-warning-start", `${presentationScheduled.warningStartPercent ?? 70}%`);
    element.style.setProperty("--timer-red-start", `${presentationScheduled.redStartPercent ?? 80}%`);
  });
  document.querySelectorAll("[data-timer-state]").forEach((element) => {
    element.textContent = state.status;
  });
  document.querySelectorAll("[data-current-plan-timer]").forEach((element) => {
    element.textContent = `${state.status} \xB7 ${formatLessonTime(state.remainingSeconds)}`;
  });
  const controlRules = {
    "timer-start": state.status === LESSON_TIMER_STATES.READY,
    "timer-start-or-resume": state.status === LESSON_TIMER_STATES.READY || state.status === LESSON_TIMER_STATES.PAUSED,
    "timer-pause": state.status === LESSON_TIMER_STATES.RUNNING,
    "timer-resume": state.status === LESSON_TIMER_STATES.PAUSED,
    "timer-reset": state.status !== LESSON_TIMER_STATES.READY,
    "timer-end": state.status === LESSON_TIMER_STATES.RUNNING || state.status === LESSON_TIMER_STATES.PAUSED,
    "timer-subtract-minute": state.status === LESSON_TIMER_STATES.RUNNING || state.status === LESSON_TIMER_STATES.PAUSED,
    "timer-add-minute": (state.status === LESSON_TIMER_STATES.RUNNING || state.status === LESSON_TIMER_STATES.PAUSED) && state.remainingSeconds <= MAX_LESSON_MINUTES * 60 - 60
  };
  Object.entries(controlRules).forEach(([action, enabled]) => {
    document.querySelectorAll(`[data-action="${action}"]`).forEach((button) => {
      button.disabled = !enabled;
    });
    if (classroomPresentationWindow && !classroomPresentationWindow.closed) {
      classroomPresentationWindow.document.querySelectorAll(`[data-action="${action}"]`).forEach((button) => {
        button.disabled = !enabled;
      });
    }
  });
  const durationInput = document.querySelector("[data-timer-duration]");
  const durationButton = document.querySelector("[data-timer-set]");
  const durationLocked = state.status === LESSON_TIMER_STATES.RUNNING || state.status === LESSON_TIMER_STATES.PAUSED;
  if (durationInput) durationInput.disabled = durationLocked;
  if (durationButton) durationButton.disabled = durationLocked;
  syncPresentationTimerViewControls();
  syncStudentTimerPopout();
  syncClassroomPresentationWindow();
  syncActivitySideTimerPresentation();
}
function syncTeacherMemoPresentation() {
  const state = teacherMemo.read();
  const field = document.querySelector("[data-teacher-memo]");
  const count = document.querySelector("[data-teacher-memo-count]");
  const clearButton = document.querySelector('[data-action="clear-teacher-memo"]');
  const saved = document.querySelector("[data-teacher-memo-saved]");
  const editor = document.querySelector("[data-teacher-memo-editor]");
  if (field) field.value = state.text;
  if (editor) editor.innerHTML = memoSegmentsMarkup(state);
  if (count) count.textContent = String(state.text.length);
  if (clearButton) clearButton.disabled = !state.text;
  if (saved) saved.innerHTML = state.text ? memoSegmentsMarkup(state) : "No class message saved.";
  document.querySelectorAll("[data-student-memo-text]").forEach((element) => {
    element.innerHTML = state.text ? memoSegmentsMarkup(state) : "No message is ready yet.";
  });
  const studentMemo = document.querySelector("[data-student-memo]");
  let studentImage = document.querySelector(".platform-student-memo-image");
  if (state.image && !studentImage && studentMemo) {
    studentImage = document.createElement("img");
    studentImage.className = "platform-student-memo-image";
    studentImage.alt = "Teacher-added class message visual";
    studentMemo.append(studentImage);
  }
  if (studentImage && state.image) studentImage.src = state.image;
  if (studentImage && !state.image) studentImage.remove();
  document.querySelectorAll("[data-student-memo]").forEach((element) => {
    element.dataset.memoColor = state.color;
    element.dataset.memoSize = state.size;
    element.dataset.memoStyle = state.style;
  });
  syncStudentDisplayPresentation();
  refreshCurrentClassPlan();
}
function memoEditorSegments(editor) {
  const defaults = teacherMemo.read();
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  const segments = [];
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent ?? "";
    if (!text) continue;
    const format = { color: defaults.color, size: defaults.size, style: defaults.style };
    let winningPriority = -1;
    let ancestor = walker.currentNode.parentElement;
    while (ancestor && ancestor !== editor) {
      const priority = Number(ancestor.dataset.memoPriority ?? 0);
      if (priority >= winningPriority && ancestor.dataset.memoColor) {
        format.color = ancestor.dataset.memoColor;
        format.size = ancestor.dataset.memoSize ?? format.size;
        format.style = ancestor.dataset.memoStyle ?? format.style;
        winningPriority = priority;
      }
      ancestor = ancestor.parentElement;
    }
    const previous = segments.at(-1);
    if (previous && previous.color === format.color && previous.size === format.size && previous.style === format.style) previous.text += text;
    else segments.push({ text, ...format });
  }
  return segments;
}
function applyMemoFormatToSelection() {
  const editor = document.querySelector("[data-teacher-memo-editor]");
  const selection = window.getSelection();
  if (!editor) return false;
  const liveRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
  const range = liveRange && !selection.isCollapsed && editor.contains(liveRange.commonAncestorContainer) ? liveRange : memoSelectionRange?.cloneRange();
  if (!range || range.collapsed) return false;
  if (!editor.contains(range.commonAncestorContainer)) return false;
  const wrapper = document.createElement("span");
  wrapper.dataset.memoColor = document.querySelector('[data-memo-format="color"]')?.value ?? "white";
  wrapper.dataset.memoSize = document.querySelector('[data-memo-format="size"]')?.value ?? "extra-large";
  wrapper.dataset.memoStyle = document.querySelector('[data-memo-format="style"]')?.value ?? "bold";
  memoFormatRevision += 1;
  wrapper.dataset.memoPriority = String(memoFormatRevision);
  wrapper.append(range.extractContents());
  range.insertNode(wrapper);
  selection.removeAllRanges();
  memoSelectionRange = null;
  const hidden = document.querySelector("[data-teacher-memo]");
  if (hidden) hidden.value = editor.innerText.slice(0, TEACHER_MEMO_MAX_CHARACTERS);
  return true;
}
function missionAvailabilityText(value) {
  return value === TODAYS_MISSION_AVAILABILITY.AVAILABLE ? "Available today" : "Not part of today's mission";
}
function syncTodaysMissionPresentation() {
  const state = todaysMission.read();
  const hasMission = Boolean(state.title);
  const clearButton = document.querySelector('[data-action="clear-todays-mission"]');
  const saved = document.querySelector("[data-todays-mission-saved]");
  const values = {
    "[data-todays-mission-saved-title]": state.title,
    "[data-todays-mission-saved-focus]": state.focus,
    "[data-todays-mission-saved-builder]": `Builder: ${missionAvailabilityText(state.builder)}`,
    "[data-todays-mission-saved-workshop]": `Workshop: ${missionAvailabilityText(state.workshop)}`,
    "[data-student-mission-title]": state.title,
    "[data-student-mission-focus]": state.focus,
    "[data-student-mission-builder]": `Builder: ${missionAvailabilityText(state.builder)}`,
    "[data-student-mission-workshop]": `Workshop: ${missionAvailabilityText(state.workshop)}`
  };
  if (clearButton) clearButton.disabled = !hasMission;
  if (saved) saved.hidden = !hasMission;
  Object.entries(values).forEach(([selector, text]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = hasMission ? text : "";
  });
  const studentFocus = document.querySelector("[data-student-mission-focus]");
  if (studentFocus) studentFocus.hidden = !hasMission || state.focus === state.title;
  syncStudentDisplayPresentation();
}
function syncStudentDisplayPresentation() {
  const hasMemo = Boolean(teacherMemo.read().text);
  const hasMission = Boolean(todaysMission.read().title);
  const hasMessageContent = hasMemo || hasMission;
  const selectedMode = studentDisplayMode.read({ hasMemo: hasMessageContent });
  const showTimer = selectedMode !== STUDENT_DISPLAY_MODES.MESSAGE;
  const showMemo = hasMemo && selectedMode !== STUDENT_DISPLAY_MODES.TIMER;
  const showMission = hasMission && selectedMode !== STUDENT_DISPLAY_MODES.TIMER;
  const showMessage = showMemo || showMission;
  const display = document.querySelector("#platform-student-timer-display");
  const timer = document.querySelector("[data-student-engineering-time]");
  const memo = document.querySelector("[data-student-memo]");
  const mission = document.querySelector("[data-student-mission]");
  const imageSlot = document.querySelector("[data-student-image-slot]");
  const studentImage = display?.querySelector(".platform-student-memo-image");
  if (timer) timer.hidden = !showTimer;
  if (memo) memo.hidden = !showMemo;
  if (mission) mission.hidden = !showMission;
  if (display) {
    display.classList.toggle("platform-student-display-combined", showTimer && showMessage);
    display.classList.toggle("platform-student-display-message-only", !showTimer && showMessage);
    display.classList.toggle("platform-student-display-timer-only", showTimer && !showMessage);
    display.setAttribute("aria-labelledby", showTimer ? "student-timer-title" : showMission ? "student-mission-title" : "student-message-title");
    const combined = showTimer && showMessage;
    if (studentImage && imageSlot && memo) {
      (combined ? imageSlot : memo).append(studentImage);
      imageSlot.hidden = !combined;
    } else if (imageSlot) {
      imageSlot.hidden = true;
    }
  }
  document.querySelectorAll("[data-presentation-mode]").forEach((control) => {
    control.setAttribute("aria-pressed", String(control.dataset.presentationMode === selectedMode));
    if (control.dataset.presentationMode === STUDENT_DISPLAY_MODES.MESSAGE) {
      control.disabled = !hasMessageContent;
    }
  });
  window.requestAnimationFrame(fitStudentMemoPresentation);
}
function fitStudentMemoPresentation() {
  const display = document.querySelector("#platform-student-timer-display:not([hidden])");
  const memo = display?.querySelector("[data-student-memo]:not([hidden])");
  const text = memo?.querySelector("[data-student-memo-text]");
  const image = memo?.querySelector(".platform-student-memo-image");
  if (!display || !memo || !text) return;
  const combined = display.classList.contains("platform-student-display-combined");
  memo.style.maxHeight = combined ? "38vh" : "78vh";
  if (image) image.style.maxHeight = combined ? "16vh" : "38vh";
  const textLength = text.textContent?.length ?? 0;
  let fontSize = Math.min(combined ? window.innerHeight * 0.055 : window.innerHeight * 0.11, combined ? 48 : 112);
  if (textLength > 120) fontSize *= 0.62;
  else if (textLength > 70) fontSize *= 0.76;
  text.style.fontSize = `${Math.max(20, fontSize)}px`;
  for (let attempts = 0; attempts < 24 && memo.scrollHeight > memo.clientHeight; attempts += 1) {
    fontSize -= 2;
    text.style.fontSize = `${Math.max(18, fontSize)}px`;
  }
}
function manageLessonTimerPresentation(route) {
  if (lessonTimerPresentationInterval !== null) {
    window.clearInterval(lessonTimerPresentationInterval);
    lessonTimerPresentationInterval = null;
  }
  if (route !== ROUTES.TEACHER_DASHBOARD) return;
  syncLessonTimerPresentation();
  lessonTimerPresentationInterval = window.setInterval(syncLessonTimerPresentation, 250);
}
function restoreLessonTimerDisplay(route, state) {
  const isAuthorizedTeacherDashboard = route === ROUTES.TEACHER_DASHBOARD && state.role === PLATFORM_ROLES.TEACHER;
  if (!isAuthorizedTeacherDashboard) {
    if (state.role !== PLATFORM_ROLES.TEACHER) storeLessonTimerDisplayOpen(false);
    return false;
  }
  if (!lessonTimerDisplayIsStoredOpen()) return false;
  const display = document.querySelector("#platform-student-timer-display");
  if (!display) return false;
  display.hidden = false;
  return true;
}
function readTimerAudioFile(file) {
  if (!file || !file.size) return Promise.resolve("");
  if (!String(file.type).startsWith("audio/")) return Promise.reject(new Error("audio-type"));
  if (file.size > 750 * 1024) return Promise.reject(new Error("audio-size"));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")), { once: true });
    reader.addEventListener("error", () => reject(new Error("audio-read")), { once: true });
    reader.readAsDataURL(file);
  });
}
async function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  if (form.dataset.form === "teacher-research-link-bank") {
    const title = String(data.get("title") || "").trim(), topic = String(data.get("topic") || "").trim(), parsed = parseTeacherAssignedResearchLinks(data.get("links")), status = form.querySelector("[data-research-bank-status]");
    if (!title) {
      if (status) status.textContent = "Enter a title for this link group.";
      return;
    }
    if (!parsed.ok) {
      if (status) status.textContent = `${parsed.reason}. Use a complete secure address beginning with https://.`;
      return;
    }
    if (!parsed.links.length) {
      if (status) status.textContent = "Add at least one approved link to this group.";
      return;
    }
    const groups = readTeacherResearchLinkBank();
    if (groups.length >= 24) {
      if (status) status.textContent = "The link bank is full. Delete an older group before adding another.";
      return;
    }
    groups.unshift({ id: `research-${Date.now()}`, title: title.slice(0, 80), topic: topic.slice(0, 140), links: parsed.links });
    writeTeacherResearchLinkBank(groups);
    render();
    return;
  }
  if (form.dataset.form === "teacher-assigned-research") {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id, topic = String(data.get("topic") || "").trim(), parsed = parseTeacherAssignedResearchLinks(data.get("links")), status = form.querySelector("[data-assigned-research-status]");
    if (!classId || !topic) {
      if (status) status.textContent = "Enter a research topic before saving.";
      return;
    }
    if (!parsed.ok) {
      if (status) status.textContent = `${parsed.reason}. Use a complete secure address beginning with https://.`;
      return;
    }
    if (!parsed.links.length) {
      if (status) status.textContent = "Add at least one approved link before saving.";
      return;
    }
    writeTeacherAssignedResearch(classId, { topic: topic.slice(0, 140), links: parsed.links });
    if (status) status.textContent = `${parsed.links.length} approved link${parsed.links.length === 1 ? "" : "s"} saved in this browser for the current class.`;
    return;
  }
  if (form.dataset.form === "weekly-reflection-requirement") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const result = weeklyReflections.setRequirement(classId, Number(data.get("required")));
    const status = form.querySelector("[data-weekly-reflection-teacher-status]");
    if (status) status.textContent = result.ok ? `Saved: ${result.required} response${result.required === 1 ? "" : "s"} required this week.` : "Choose a requirement from 0 to 5.";
    return;
  }
  if (form.dataset.form === "captains-log-plan") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const promptId = String(data.get("promptId") || "custom");
    const selected = [...CAPTAINS_LOG_PRESET_PROMPTS, ...weeklyReflections.captainLogLibrary()].find((item) => item.id === promptId);
    const prompt = promptId === "custom" ? String(data.get("prompt") || "").trim() : String(selected?.prompt || data.get("prompt") || "").trim();
    const result = weeklyReflections.saveCaptainLogPlan(classId, { promptId, prompt, week: Number(data.get("week")), schedule: data.get("schedule"), required: Number(data.get("required")) });
    if (result.ok && data.get("saveToLibrary") === "on") weeklyReflections.saveCaptainLogPrompt(prompt);
    const status = form.querySelector("[data-captains-log-status]");
    if (status) status.textContent = result.ok ? `Saved: Week ${result.plan.week} \xB7 ${result.plan.schedule} \xB7 ${result.plan.required} log${result.plan.required === 1 ? "" : "s"} this week.` : "Add a prompt and choose a week, day, and number of logs.";
    if (result.ok) render();
    return;
  }
  if (form.dataset.form === "weekly-reflection") {
    const state = session.read();
    const activityChoice = String(data.get("activityChoice") ?? "");
    const result = weeklyReflections.submit(state.classId, state.studentId, {
      activity: activityChoice === "__other__" ? data.get("activityOther") : activityChoice,
      progress: data.get("progress"),
      explanation: data.get("explanation"),
      improved: data.get("improved"),
      badge: data.get("badge"),
      help: data.get("help"),
      helpOther: data.get("helpOther"),
      rating: data.get("rating")
    });
    if (!result.ok) {
      const error = form.querySelector("[data-weekly-reflection-error]");
      if (error) {
        error.hidden = false;
        error.textContent = "Choose an answer for every question and explain your learning with at least 10 characters.";
      }
      return;
    }
    render();
    return;
  }
  if (form.dataset.form === "production-student-entry") {
    void submitProductionStudentEntry(form, data);
    return;
  }
  if (form.dataset.form === "production-classroom-setup") {
    void submitProductionClassroom(form, data);
    return;
  }
  if (form.dataset.form === "evidence-governance") {
    const result = evidenceGovernance.save({ retention: data.get("retention"), deletionAuthority: data.get("deletionAuthority"), recovery: data.get("recovery"), exportRule: data.get("exportRule") });
    const error = form.querySelector("[data-evidence-governance-error]");
    const status = form.querySelector("[data-evidence-governance-status]");
    if (!result.ok) {
      if (status) status.textContent = "";
      if (error) {
        error.hidden = false;
        error.textContent = result.reason === "storage-unavailable" ? "The draft could not be saved in this browser." : "Choose every governance safeguard before saving the draft.";
      }
      return;
    }
    if (error) {
      error.hidden = true;
      error.textContent = "";
    }
    if (status) {
      status.dataset.state = "saved";
      status.textContent = "Governance draft saved for this browser session. It is not an enforced policy.";
    }
    renderGovernanceSimulation();
    return;
  }
  if (form.dataset.form === "governance-simulation-request") {
    const result = evidenceGovernanceSimulation.submit({ evidenceId: data.get("evidenceId"), evidenceLabel: data.get("evidenceLabel"), reason: data.get("reason"), exportOffered: data.get("exportOffered") === "yes" });
    if (!result.ok) {
      const error = document.querySelector("[data-governance-simulation-error]");
      if (error) {
        error.hidden = false;
        error.textContent = result.reason === "export-required" ? "Confirm that an export was offered before submitting." : result.reason === "reason-required" ? "Add a reason for the request." : "The fictional request could not be saved in this browser.";
      }
      return;
    }
    renderGovernanceSimulation();
    return;
  }
  if (form.dataset.form === "governance-simulation-decision") {
    const result = evidenceGovernanceSimulation.decide({ decision: data.get("decision"), reviewer: data.get("reviewer"), note: data.get("note") });
    if (!result.ok) {
      const error = document.querySelector("[data-governance-simulation-error]");
      if (error) {
        error.hidden = false;
        error.textContent = result.reason === "reviewer-required" ? "Add a fictional reviewer label." : result.reason === "note-required" ? "Add a decision note." : "Choose Approve or Reject to complete the simulation.";
      }
      return;
    }
    renderGovernanceSimulation();
    return;
  }
  if (form.dataset.form === "google-connection-preview") {
    const result = googleConnectionPreview.connect({ teacherConfirmed: data.get("teacherConfirmed") === "yes", studentBoundaryConfirmed: data.get("studentBoundaryConfirmed") === "yes" });
    if (!result.ok) {
      const error = document.querySelector("[data-google-connection-preview-error]");
      if (error) {
        error.hidden = false;
        error.textContent = result.reason === "teacher-confirmation-required" ? "Confirm that the teacher authorizes the connection." : "Confirm that students will not use Google accounts or Drive permissions.";
      }
      return;
    }
    renderGoogleConnectionPreview();
    return;
  }
  if (form.dataset.form === "evidence-drive-setup") {
    const result = evidenceDriveSetup.prepare({ folderName: data.get("folderName"), privacyConfirmed: data.get("privacyConfirmed") === "yes" });
    const error = form.querySelector("[data-evidence-drive-error]");
    const status = form.querySelector("[data-evidence-drive-status]");
    if (!result.ok) {
      if (error) {
        error.hidden = false;
        error.textContent = result.reason === "privacy-confirmation-required" ? "Confirm the classroom privacy boundary before preparing the connection." : result.reason === "storage-unavailable" ? "Setup could not be saved in this browser." : "Enter a folder name from 3 to 80 characters.";
      }
      return;
    }
    if (error) {
      error.hidden = true;
      error.textContent = "";
    }
    if (status) {
      status.dataset.state = "prepared";
      status.textContent = `Future setup prepared for \u201C${result.value.folderName}.\u201D Production administrator OAuth is still required.`;
    }
    return;
  }
  if (form.dataset.form === "pb002j-teacher-connect" || form.dataset.form === "pb002j-configuration") {
    void pb002jClasswide.handleSubmit(form);
    return;
  }
  if (form.dataset.form === "teacher-login") {
    const teacher = validateTeacherCredentials(data.get("email"), data.get("password"));
    if (!teacher) return showFormError(form, "The email or password is not valid for this development preview.");
    session.signInTeacher(teacher.id);
    return navigate(ROUTES.TEACHER_DASHBOARD);
  }
  if (form.dataset.form === "student-entry") {
    const classCode = String(data.get("classCode") ?? "").trim();
    if (!classCode) return showFormError(form, "Enter your class code to continue.");
    const classRecord = findClassByCode(classCode);
    if (!classRecord) return showFormError(form, "That class code could not be found. Check the code and try again.");
    session.beginStudentEntry(classRecord.id);
    return navigate(ROUTES.STUDENT_ROSTER);
  }
  if (form.dataset.form === "student-identifier") {
    const state = session.read();
    const identifier = String(data.get("identifier") ?? "").trim();
    if (!identifier) return showFormError(form, "Enter your private identifier to continue.");
    const student = validateStudentIdentifier(state.pendingClassId, state.pendingStudentId, identifier);
    if (!student) return showFormError(form, "That private identifier is not valid. Check it and try again.");
    session.signInStudent(state.pendingClassId, student.id);
    return navigate(ROUTES.STUDENT_DASHBOARD);
  }
  if (form.dataset.form === "lesson-timer-duration") {
    const result = lessonTimer.setDuration(data.get("duration"));
    const error = form.querySelector("[data-timer-error]");
    if (!result.ok) {
      if (error) {
        error.textContent = `Enter a whole number from ${MIN_LESSON_MINUTES} to ${MAX_LESSON_MINUTES} minutes.`;
        error.hidden = false;
      }
      return;
    }
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    syncLessonTimerPresentation();
  }
  if (form.dataset.form === "class-timer-schedule") {
    const phaseNames = data.getAll("phaseName");
    const phaseStarts = data.getAll("phaseStart");
    const existingSchedule = classTimerSchedule.read();
    let customAudio;
    try {
      customAudio = {
        yellowCustomAudio: await readTimerAudioFile(data.get("yellowSoundFile")) || existingSchedule.yellowCustomAudio,
        redCustomAudio: await readTimerAudioFile(data.get("redSoundFile")) || existingSchedule.redCustomAudio,
        endCustomAudio: await readTimerAudioFile(data.get("endSoundFile")) || existingSchedule.endCustomAudio
      };
    } catch (error2) {
      const message = error2.message === "audio-size" ? "Keep each custom sound at 750 KB or smaller." : "Choose a valid audio file for each custom sound.";
      const output = form.querySelector("[data-class-timer-schedule-error]");
      if (output) {
        output.textContent = message;
        output.hidden = false;
      }
      return;
    }
    const selectedSounds = [String(data.get("yellowSound")), String(data.get("redSound")), String(data.get("endSound"))];
    if (selectedSounds.some((sound, index) => sound === "Custom Upload" && !Object.values(customAudio)[index])) {
      const output = form.querySelector("[data-class-timer-schedule-error]");
      if (output) {
        output.textContent = "Upload an audio file before choosing Custom Upload.";
        output.hidden = false;
      }
      return;
    }
    const result = classTimerSchedule.save({
      enabled: data.get("enabled") === "yes",
      weekdays: data.getAll("weekdays"),
      startTime: String(data.get("startTime") ?? ""),
      durationMinutes: Number(data.get("durationMinutes")),
      timeZone: String(data.get("timeZone") ?? ""),
      yellowSound: String(data.get("yellowSound") ?? "None"),
      redSound: String(data.get("redSound") ?? "None"),
      endSound: String(data.get("endSound") ?? "None"),
      ...customAudio,
      pomodoroEnabled: data.get("pomodoroEnabled") === "yes",
      phases: [
        { name: phaseNames[0], startMinute: Number(phaseStarts[0]) },
        { name: phaseNames[1], startMinute: Number(phaseStarts[1]) },
        { name: phaseNames[2], startMinute: Number(phaseStarts[2]) },
        { name: phaseNames[3], startMinute: Number(phaseStarts[3]) }
      ]
    });
    const error = form.querySelector("[data-class-timer-schedule-error]");
    if (!result.ok) {
      if (error) {
        error.textContent = result.reason === "weekdays-required" ? "Choose at least one weekday when automatic timing is on." : result.reason === "invalid-time-zone" ? "Choose a valid time zone." : result.reason === "invalid-phases" ? "Use minute 0 for blue, choose green before the final five-minute gold warning, and start red before class ends." : "The schedule could not be saved.";
        error.hidden = false;
      }
      return;
    }
    const activeSchedule = classTimerSchedule.activeOccurrence();
    const previewIgnoresScheduleClock = session.read().teacherId === "teacher-preview-1" && !classroomDemoModeIsEnabled();
    if (activeSchedule.active && !previewIgnoresScheduleClock) {
      const timerResult = lessonTimer.startScheduled(activeSchedule.durationMinutes, activeSchedule.remainingSeconds);
      if (timerResult.ok) classTimerSchedule.markApplied(activeSchedule.occurrence);
    } else {
      lessonTimer.setDuration(result.schedule.durationMinutes);
    }
    preserveCurrentClassSetup(currentTeacherClass(session.read().teacherId)?.id);
    syncLessonTimerPresentation();
    return render();
  }
  if (form.dataset.form === "timer-today-override") {
    const durationMinutes = Number(data.get("durationMinutes"));
    const starts = data.getAll("phaseStart").map(Number);
    const base = classTimerSchedule.readEffective();
    const phases = base.phases.map((phase, index) => ({ ...phase, startMinute: index === 0 ? 0 : starts[index - 1] }));
    const result = classTimerSchedule.saveTodayOverride({ durationMinutes, phases, pomodoroEnabled: true });
    const error = form.querySelector("[data-timer-today-error]");
    if (!result.ok) {
      if (error) {
        error.textContent = "Use increasing phase start minutes that occur before today\u2019s timer ends.";
        error.hidden = false;
      }
      return;
    }
    const active = classTimerSchedule.activeOccurrence();
    const current = lessonTimer.read();
    if (active.active) lessonTimer.startScheduled(active.durationMinutes, active.remainingSeconds);
    else if (current.status === LESSON_TIMER_STATES.RUNNING || current.status === LESSON_TIMER_STATES.PAUSED) {
      const elapsed = current.durationSeconds - current.remainingSeconds;
      lessonTimer.startScheduled(durationMinutes, Math.max(1, durationMinutes * 60 - elapsed));
    } else lessonTimer.setDuration(durationMinutes);
    return render();
  }
  if (form.dataset.form === "teacher-memo") {
    const editor = form.querySelector("[data-teacher-memo-editor]");
    const text = editor?.innerText.slice(0, TEACHER_MEMO_MAX_CHARACTERS) ?? data.get("memo");
    const result = teacherMemo.save(text, {
      segments: editor ? memoEditorSegments(editor) : void 0,
      image: data.get("memoImage")
    });
    const error = form.querySelector("[data-teacher-memo-error]");
    const status = form.querySelector("[data-teacher-memo-status]");
    if (!result.ok) {
      if (status) status.textContent = "";
      if (error) {
        error.textContent = result.reason === "too-long" ? `Keep the class message to ${TEACHER_MEMO_MAX_CHARACTERS} characters or fewer.` : "Enter a class message before saving.";
        error.hidden = false;
      }
      return;
    }
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    syncTeacherMemoPresentation();
    if (status) {
      status.dataset.state = "saved";
      status.textContent = "Saved for refresh and Student Display.";
    }
  }
  if (form.dataset.form === "todays-mission") {
    const goal = String(data.get("title") ?? "").trim();
    const result = todaysMission.save({
      title: goal,
      focus: goal,
      builder: form.elements.builder.checked ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART,
      workshop: form.elements.workshop.checked ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART
    });
    const error = form.querySelector("[data-todays-mission-error]");
    const status = form.querySelector("[data-todays-mission-status]");
    const messages = {
      "missing-title": "Enter a mission title before saving.",
      "title-too-long": "Keep the mission title to 80 characters or fewer.",
      "missing-focus": "Enter a short classroom focus before saving.",
      "focus-too-long": "Keep the classroom focus to 180 characters or fewer.",
      "missing-builder": "Choose whether Builder is part of today's mission.",
      "missing-workshop": "Choose whether Workshop is part of today's mission."
    };
    if (!result.ok) {
      if (status) status.textContent = "";
      if (error) {
        error.textContent = messages[result.reason] ?? "Today's Mission could not be saved.";
        error.hidden = false;
      }
      return;
    }
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    if (classId) weeklyReflections.recordActivity(classId, result.state.title);
    syncTodaysMissionPresentation();
    if (status) {
      status.dataset.state = "saved";
      status.textContent = "Today\u2019s Plan is saved for this class and Student Display.";
    }
  }
}
async function submitProductionStudentEntry(form, data) {
  const classCode = String(data.get("classCode") || "").trim();
  const studentCode = String(data.get("studentCode") || "").trim();
  if (!classCode || !studentCode) return showFormError(form, "Enter both codes to continue.");
  const result = await productionIdentity.studentEntry({ classCode, studentCode });
  if (!result.ok) return showFormError(form, result.reason === "classroom-entry-not-recognized" ? "Those classroom codes were not recognized." : "Classroom entry is unavailable. Ask your teacher for help.");
  window.location.assign(result.value.redirect);
}
async function submitProductionClassroom(form, data) {
  const name = String(data.get("name") || "").trim();
  const parsed = parseStudentLabels(data.get("studentLabels"));
  if (name.length < 2) return showFormError(form, "Enter a class name.");
  if (!parsed.ok) {
    const messages = { "student-count": "Enter 1\u201340 student labels, one per line.", "student-label-too-long": "Keep each student label to 80 characters or fewer.", "duplicate-student-label": "Each student label must be unique." };
    return showFormError(form, messages[parsed.reason]);
  }
  const result = await productionIdentity.createClassroom({ name, studentLabels: parsed.labels });
  if (!result.ok) return showFormError(form, result.reason === "student-label-already-used" ? "One or more student labels are already used in another class. Generate the NameBobs again or edit the repeated label." : "The classroom could not be created. Sign in again or try later.");
  oneTimeClassroomCodes = result.value.classroom;
  setProductionTeacherClasses([productionClassRecord(result.value.classroom), ...productionTeacherClasses], result.value.classroom.classId);
  const region = document.querySelector("[data-classroom-setup]");
  if (region) region.outerHTML = classroomSetupMarkup();
  document.querySelector("#classroom-code-sheet-title")?.focus();
}
async function launchEvidencePilot() {
  const status = document.querySelector("[data-evidence-launch-status]");
  const keyInput = document.querySelector("[data-evidence-teacher-key]");
  evidenceTeacherRuntimeKey = keyInput?.value.trim() || evidenceTeacherRuntimeKey;
  if (status) status.textContent = "Launching the fictional evidence activity\u2026";
  const result = await evidenceUploadClient.publishLaunch({ teacherKey: evidenceTeacherRuntimeKey, activity: currentEvidenceActivity() });
  if (keyInput) keyInput.value = "";
  if (status) status.textContent = result.ok ? `Launched: ${result.launch.activity}. Fictional students can now save Photo and Screenshot evidence to the pilot Drive folder.` : `Launch not completed (${result.reason}). Check that the local pilot service is running and paste its current teacher key.`;
}
function renderTeacherLiveEvidence() {
  const region = document.querySelector("[data-live-evidence-inbox]");
  if (region) region.outerHTML = teacherLiveEvidenceMarkup();
}
async function refreshTeacherLiveEvidence() {
  const keyInput = document.querySelector("[data-evidence-teacher-key]");
  evidenceTeacherRuntimeKey = keyInput?.value.trim() || evidenceTeacherRuntimeKey;
  teacherLiveEvidenceNotice = "Checking the protected fictional evidence inbox\u2026";
  renderTeacherLiveEvidence();
  const result = await evidenceUploadClient.listEvidence({ teacherKey: evidenceTeacherRuntimeKey });
  if (!result.ok) {
    teacherLiveEvidenceNotice = `Live evidence unavailable (${result.reason}). Paste the current memory-only teacher key and try again.`;
    renderTeacherLiveEvidence();
    return;
  }
  teacherLiveEvidence = result.evidence;
  if (teacherLiveEvidencePreviewUrl) URL.revokeObjectURL(teacherLiveEvidencePreviewUrl);
  teacherLiveEvidencePreviewUrl = "";
  teacherLiveEvidenceSelection = teacherLiveEvidence[0]?.id || "";
  teacherLiveEvidenceNotice = teacherLiveEvidence.length ? `${teacherLiveEvidence.length} persistent fictional submission${teacherLiveEvidence.length === 1 ? "" : "s"} loaded from the teacher-owned Drive.` : "No fictional image submissions were found in the configured Drive folder.";
  renderTeacherLiveEvidence();
}
async function openTeacherLiveEvidence(evidenceId) {
  teacherLiveEvidenceSelection = evidenceId;
  if (teacherLiveEvidencePreviewUrl) URL.revokeObjectURL(teacherLiveEvidencePreviewUrl);
  teacherLiveEvidencePreviewUrl = "";
  teacherLiveEvidenceNotice = "Loading the protected visual preview\u2026";
  renderTeacherLiveEvidence();
  const result = await evidenceUploadClient.loadEvidencePreview({ teacherKey: evidenceTeacherRuntimeKey, evidenceId });
  teacherLiveEvidenceNotice = result.ok ? "Protected fictional visual evidence loaded." : `Visual preview unavailable (${result.reason}).`;
  if (result.ok) teacherLiveEvidencePreviewUrl = URL.createObjectURL(result.blob);
  renderTeacherLiveEvidence();
  document.querySelector(".platform-live-evidence-preview")?.focus();
}
async function saveEvidenceDraft() {
  const error = document.querySelector("[data-evidence-error]");
  const detail = evidenceDraft?.type === EVIDENCE_TYPES.REFLECTION ? evidenceDraft.detail : evidenceDraft?.fileName;
  if (!evidenceDraft || !String(detail || "").trim()) {
    if (error) {
      error.hidden = false;
      error.textContent = "Add evidence before saving.";
    }
    return;
  }
  let driveEvidence = null;
  let driveFailure = "drive-upload-not-attempted";
  const canUpload = [EVIDENCE_TYPES.PHOTO, EVIDENCE_TYPES.SCREENSHOT].includes(evidenceDraft.type) && evidenceDraft.file;
  if (canUpload) {
    const state = session.read();
    const launch = await evidenceUploadClient.currentLaunch();
    driveFailure = launch.ok ? "fictional-student-session-required" : `launch-${launch.reason}`;
    if (launch.ok && state.studentId) {
      const ticket = await evidenceUploadClient.requestTicket({ launchId: launch.launch.id, studentId: state.studentId });
      driveFailure = ticket.ok ? "upload-not-completed" : `ticket-${ticket.reason}`;
      if (ticket.ok) {
        const upload = await evidenceUploadClient.uploadImage({ ticket: ticket.ticket, file: evidenceDraft.file, fileName: evidenceDraft.fileName, evidenceType: evidenceDraft.type });
        if (upload.ok) driveEvidence = upload.evidence;
        else driveFailure = `upload-${upload.reason}`;
      }
    }
  }
  const timelineDetail = driveEvidence ? `Teacher Drive pilot \xB7 ${driveEvidence.name}` : detail;
  const result = evidenceFoundation.save({ type: evidenceDraft.type, title: evidenceDraft.type === EVIDENCE_TYPES.REFLECTION ? "New reflection" : evidenceDraft.fileName, activity: currentEvidenceActivity(), detail: timelineDetail });
  if (!result.ok) {
    if (error) {
      error.hidden = false;
      error.textContent = result.reason === "storage-unavailable" ? "Evidence could not be saved in this browser. Try again." : "Add evidence before saving.";
    }
    return;
  }
  if (evidenceDraft.previewUrl) URL.revokeObjectURL(evidenceDraft.previewUrl);
  evidenceDraft = null;
  evidenceNotice = driveEvidence ? "Evidence saved to the teacher-owned fictional pilot Drive and your timeline." : canUpload ? `The Drive pilot was unavailable (${driveFailure}), so this evidence was saved only in your browser timeline.` : "Evidence saved to your pilot timeline.";
  renderEvidenceFoundation();
}
function updateVoiceMeterPresentation(value) {
  const threshold = readVoiceMeterActivity().target;
  const state = voiceMeterState(value, threshold);
  const now = Date.now();
  const previousBobState = voiceBobState;
  if (state !== voiceBobState && now - voiceBobStateChangedAt >= 2400) {
    voiceBobState = state;
    voiceBobStateChangedAt = now;
  }
  updateBobUnlockProgress(voiceBobState);
  const bobMessages = { green: "Bob is calm and happy.", yellow: "Bob is asking the class to quiet down.", red: "Bob is uncomfortable because the room is too loud." };
  document.querySelectorAll("[data-voice-meter]").forEach((meter) => {
    meter.style.setProperty("--voice-meter-level", `${value}%`);
    meter.dataset.meterState = state;
    const output = meter.querySelector("[data-voice-meter-output]");
    if (output) output.textContent = String(value);
  });
  document.querySelectorAll("[data-voice-bob-message]").forEach((label) => {
    label.textContent = voiceBobState === "green" && now < floatingBobUnlockMessageUntil ? floatingBobUnlockMessage : bobMessages[voiceBobState];
  });
  document.querySelectorAll("[data-voice-bob]").forEach((bob) => {
    bob.dataset.meterState = voiceBobState;
    bob.dataset.poseUnlocked = String(voiceBobState === "green" && now < floatingBobUnlockMessageUntil);
    bob.setAttribute("aria-label", bobMessages[voiceBobState]);
    if (voiceBobState !== "green") bob.classList.remove("is-walking-out", "is-walking-in", "is-unlocked-pose");
  });
  if (previousBobState !== voiceBobState && voiceBobState === "green") applyUnlockedBobPose([...document.querySelectorAll(".platform-floating-voice-bob")], Math.max(0, floatingBobLastPose));
  if (voiceBobState === "green") delete document.body.dataset.voiceFrame;
  else document.body.dataset.voiceFrame = voiceBobState;
  const prediction = predictedLearningType(value);
  document.querySelectorAll("[data-voice-prediction]").forEach((label) => {
    label.textContent = `${prediction.icon} ${prediction.label}`;
  });
}
function relocateFloatingBob() {
  const setting = readClassroomBobDisplay();
  const corners = classroomBobCorners(setting.placement);
  const bobs = [document, classroomPresentationWindow?.document].filter(Boolean).flatMap((documentRef) => [...documentRef.querySelectorAll(".platform-floating-voice-bob")]);
  if (!setting.enabled || !bobs.length || bobs.some((bob) => bob.dataset.meterState !== "green" || bob.classList.contains("is-walking-out") || bob.classList.contains("is-walking-in"))) return;
  bobs.forEach((bob) => {
    bob.classList.remove("is-unlocked-pose");
    bob.classList.add("is-walking-out");
  });
  window.setTimeout(() => {
    const connectedBobs = bobs.filter((bob) => bob.isConnected && bob.dataset.meterState === "green");
    if (!connectedBobs.length) return;
    floatingBobCornerIndex = (floatingBobCornerIndex + 1) % corners.length;
    floatingBobIdleSet = floatingBobIdleSet % 4 + 1;
    connectedBobs.forEach((bob) => {
      bob.dataset.corner = corners[floatingBobCornerIndex];
      bob.dataset.idleSet = String(floatingBobIdleSet);
      bob.classList.remove("is-walking-out");
      bob.classList.add("is-walking-in");
    });
    window.setTimeout(() => {
      connectedBobs.forEach((bob) => bob.classList.remove("is-walking-in"));
      applyUnlockedBobPose(connectedBobs);
    }, 2800);
  }, 2800);
}
function whiteboardCanvas() {
  return document.querySelector("[data-whiteboard-canvas]");
}
function updateWhiteboardHistoryControls() {
  document.querySelectorAll('[data-action="whiteboard-undo"]').forEach((button) => {
    button.disabled = whiteboardUndoStack.length === 0;
  });
  document.querySelectorAll('[data-action="whiteboard-redo"]').forEach((button) => {
    button.disabled = whiteboardRedoStack.length === 0;
  });
}
function refreshWhiteboardLibraryOptions(selectedId = "") {
  const select = document.querySelector("[data-whiteboard-saved]");
  if (!select) return;
  const boards = readWhiteboardLibrary();
  select.innerHTML = `<option value="">Choose a saved board</option>${boards.map((board) => `<option value="${escapeHtml2(board.id)}"${board.id === selectedId ? " selected" : ""}>${escapeHtml2(board.title)} \xB7 ${escapeHtml2(whiteboardScheduleLabel(board))}${board.studentDisplay ? " \xB7 Student Display" : ""}</option>`).join("")}`;
}
function setWhiteboardStatus(message) {
  const status = document.querySelector("[data-whiteboard-status]");
  if (status) status.textContent = message;
  const pixelStatus = document.querySelector("[data-pixel-status]");
  if (pixelStatus) pixelStatus.textContent = message;
}
function showWhiteboardBobMeasurementCoach() {
  const coach = document.querySelector("[data-whiteboard-bob-coach]");
  if (!coach) return;
  if (!coach.hidden && ["intro", "directions"].includes(coach.dataset.state)) return;
  let seen = false;
  try {
    seen = window.sessionStorage.getItem(WHITEBOARD_BOB_MEASUREMENT_COACH_KEY) === "seen";
  } catch {
  }
  coach.hidden = false;
  coach.dataset.state = seen ? "collapsed" : "intro";
  coach.querySelector("[data-whiteboard-bob-intro]").hidden = seen;
  coach.querySelector("[data-whiteboard-bob-directions]").hidden = true;
  if (!seen) {
    try {
      window.sessionStorage.setItem(WHITEBOARD_BOB_MEASUREMENT_COACH_KEY, "seen");
    } catch {
    }
  }
}
function setWhiteboardBobCoachState(state) {
  const coach = document.querySelector("[data-whiteboard-bob-coach]");
  if (!coach) return;
  coach.hidden = false;
  coach.dataset.state = state;
  coach.querySelector("[data-whiteboard-bob-intro]").hidden = state !== "intro";
  coach.querySelector("[data-whiteboard-bob-directions]").hidden = state !== "directions";
  const compareUnit = document.querySelector("[data-whiteboard-compare-unit]");
  if (compareUnit) compareUnit.dataset.bobHighlight = state === "directions" ? "true" : "false";
}
function syncWhiteboardDimensionCompareControl() {
  const control = document.querySelector("[data-whiteboard-dimension-compare]");
  if (!control) return;
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  control.disabled = selected?.type !== "dimension";
  if (selected?.type === "dimension") control.value = selected.compareUnit ?? (selected.unit === "mm" ? "cm" : "mm");
}
function whiteboardSnapshot(canvas = whiteboardCanvas()) {
  return canvas?.toDataURL("image/png") ?? "";
}
function whiteboardStudentDisplayImage(canvas = whiteboardCanvas()) {
  if (!canvas) return "";
  const preview = document.createElement("canvas");
  const scale = Math.min(1, 1200 / canvas.width, 720 / canvas.height);
  preview.width = Math.max(1, Math.round(canvas.width * scale));
  preview.height = Math.max(1, Math.round(canvas.height * scale));
  preview.getContext("2d").drawImage(canvas, 0, 0, preview.width, preview.height);
  return preview.toDataURL("image/jpeg", 0.78);
}
function serializableWhiteboardObjects() {
  return whiteboardObjects.map(({ element, ...object }) => object);
}
function newWhiteboardPage(title = "") {
  return { id: globalThis.crypto?.randomUUID?.() ?? `page-${Date.now()}-${Math.random()}`, title: title || `Page ${whiteboardPages.length + 1}`, objects: [] };
}
function syncCurrentWhiteboardPage() {
  if (!whiteboardPages.length) whiteboardPages = [newWhiteboardPage("Page 1")];
  const page = whiteboardPages[whiteboardCurrentPageIndex] ?? whiteboardPages[0];
  page.objects = structuredClone(serializableWhiteboardObjects());
  const canvas = whiteboardCanvas();
  if (canvas) {
    const preview = document.createElement("canvas");
    preview.width = 160;
    preview.height = 90;
    const context = preview.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, preview.width, preview.height);
    context.drawImage(canvas, 0, 0, preview.width, preview.height);
    page.thumbnail = preview.toDataURL("image/jpeg", 0.68);
  }
}
function renderWhiteboardPageStrip() {
  const strip = document.querySelector("[data-whiteboard-pages]");
  if (!strip) return;
  strip.querySelector("[data-whiteboard-page-tabs]").innerHTML = whiteboardPages.map((page, index) => `<button type="button" data-action="whiteboard-page-select" data-whiteboard-page-index="${index}" aria-current="${index === whiteboardCurrentPageIndex ? "page" : "false"}">${page.thumbnail ? `<img src="${escapeHtml2(page.thumbnail)}" alt="">` : `<span class="platform-whiteboard-page-blank" aria-hidden="true"></span>`}<strong>${escapeHtml2(page.title || `Page ${index + 1}`)}</strong></button>`).join("");
  const count = strip.querySelector("[data-whiteboard-page-count]");
  if (count) count.textContent = `${whiteboardCurrentPageIndex + 1} / ${whiteboardPages.length}`;
  strip.querySelector('[data-action="whiteboard-page-previous"]').disabled = whiteboardCurrentPageIndex === 0;
  strip.querySelector('[data-action="whiteboard-page-next"]').disabled = whiteboardCurrentPageIndex >= whiteboardPages.length - 1;
  strip.querySelector('[data-action="whiteboard-page-left"]').disabled = whiteboardCurrentPageIndex === 0;
  strip.querySelector('[data-action="whiteboard-page-right"]').disabled = whiteboardCurrentPageIndex >= whiteboardPages.length - 1;
  strip.querySelector('[data-action="whiteboard-page-delete"]').disabled = whiteboardPages.length <= 1;
}
function openWhiteboardPage(index, { save = true } = {}) {
  if (!Number.isInteger(index) || index < 0 || index >= whiteboardPages.length || index === whiteboardCurrentPageIndex) return;
  if (save) syncCurrentWhiteboardPage();
  whiteboardCurrentPageIndex = index;
  whiteboardObjects = structuredClone(whiteboardPages[index].objects ?? []);
  whiteboardSelectedObjectId = "";
  whiteboardUndoStack = [];
  whiteboardRedoStack = [];
  hydrateWhiteboardImages(() => renderWhiteboardObjects());
  renderWhiteboardObjects();
  renderWhiteboardPageStrip();
  saveWhiteboard();
  updateWhiteboardHistoryControls();
  setWhiteboardStatus(`Showing ${whiteboardPages[index].title}.`);
}
function cloneEditableWhiteboardObject(object) {
  if (!object) return null;
  const { element, ...editable } = object;
  return structuredClone(editable);
}
function saveWhiteboard(canvas = whiteboardCanvas()) {
  if (!canvas) return;
  try {
    syncCurrentWhiteboardPage();
    window.sessionStorage.setItem(WHITEBOARD_SESSION_KEY, whiteboardSnapshot(canvas));
    window.sessionStorage.setItem(WHITEBOARD_OBJECT_SESSION_KEY, JSON.stringify(serializableWhiteboardObjects()));
    window.sessionStorage.setItem(WHITEBOARD_PAGES_SESSION_KEY, JSON.stringify({ currentPageIndex: whiteboardCurrentPageIndex, pages: whiteboardPages }));
    window.sessionStorage.setItem(WHITEBOARD_VIEW_SESSION_KEY, JSON.stringify({ gridUnit: whiteboardGridUnit, rulerUnit: whiteboardRulerUnit, zoom: whiteboardZoom, ruler: whiteboardRuler, title: whiteboardDrawingTitle, controlsDock: whiteboardControlsDock, controlsHidden: whiteboardControlsHidden, pageDock: whiteboardPageDock, background: { type: whiteboardBackground.type, color1: whiteboardBackground.color1, color2: whiteboardBackground.color2, imageSrc: whiteboardBackground.imageSrc } }));
    renderWhiteboardPageStrip();
  } catch {
    const status = document.querySelector("[data-whiteboard-status]");
    if (status) status.textContent = "The board is working, but this browser could not save a recovery copy.";
  }
}
function pushWhiteboardHistory() {
  whiteboardUndoStack.push(JSON.stringify(serializableWhiteboardObjects()));
  if (whiteboardUndoStack.length > 30) whiteboardUndoStack.shift();
  whiteboardRedoStack = [];
  updateWhiteboardHistoryControls();
}
function whiteboardPoint(event, canvas) {
  const bounds = canvas.getBoundingClientRect();
  return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
}
function refreshPendingWhiteboardTextEntryStyle() {
  const entry = document.querySelector("[data-whiteboard-text-entry]");
  const canvas = whiteboardCanvas();
  if (!entry || !canvas) return;
  const scaleX = canvas.clientWidth / canvas.width, scaleY = canvas.clientHeight / canvas.height;
  const size = Math.max(22, Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6) * 5);
  const fontFamily = document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial";
  const backgroundName = document.querySelector("[data-whiteboard-text-background]")?.value ?? "transparent";
  const guide = fontFamily === "School Cursive" ? document.querySelector("[data-whiteboard-cursive-lines]")?.value ?? "none" : "none";
  entry.dataset.cursiveGuide = guide;
  entry.style.fontFamily = `"${fontFamily}"`;
  entry.style.fontSize = `${size * scaleY}px`;
  entry.style.lineHeight = "1.22";
  entry.style.fontWeight = document.querySelector('[data-text-command="bold"]')?.getAttribute("aria-pressed") === "true" ? "700" : "400";
  entry.style.fontStyle = document.querySelector('[data-text-command="italic"]')?.getAttribute("aria-pressed") === "true" ? "italic" : "normal";
  entry.style.textDecoration = document.querySelector('[data-text-command="underline"]')?.getAttribute("aria-pressed") === "true" ? "underline" : "none";
  entry.style.color = backgroundName === "black" ? "#ffffff" : document.querySelector("[data-whiteboard-text-color]")?.value ?? "#12384d";
  entry.style.backgroundColor = whiteboardTextBackground(backgroundName) || "transparent";
  entry.style.width = `${Math.min(canvas.clientWidth - entry.offsetLeft - 4, Math.max(180 * scaleX, (entry.value.length + 2) * size * 0.55 * scaleX))}px`;
  entry.style.height = `${Math.max(38, size * 1.55 * scaleY)}px`;
  entry.style.minHeight = entry.style.height;
}
function openPencilGripTutorial() {
  document.querySelector("[data-pencil-grip-tutorial]")?.remove();
  const tutorial = document.createElement("div");
  tutorial.className = "platform-pencil-grip-tutorial";
  tutorial.dataset.pencilGripTutorial = "true";
  tutorial.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="pencil-grip-title"><button type="button" class="platform-pencil-grip-close" aria-label="Close pencil grip tutorial">\xD7</button><h3 id="pencil-grip-title">How to hold a pencil for cursive writing</h3><img src="./assets/images/whiteboard/proper-pencil-grip.jpg" alt="Close view of a relaxed tripod pencil grip"><ol><li>Rest the pencil on the side of the middle finger.</li><li>Hold it gently between the thumb and index finger.</li><li>Keep all three fingers curved and relaxed.</li><li>Let the side of the hand glide across the paper.</li></ol></section>`;
  const close = () => tutorial.remove();
  tutorial.addEventListener("click", (event) => {
    if (event.target === tutorial || event.target.closest(".platform-pencil-grip-close")) close();
  });
  document.body.append(tutorial);
  tutorial.querySelector("button")?.focus();
}
function updateWhiteboardCursiveCoach() {
  const entry = document.querySelector("[data-whiteboard-text-entry]");
  const surface = entry?.parentElement;
  surface?.querySelector("[data-whiteboard-cursive-coach-preview]")?.remove();
  const mode = document.querySelector("[data-whiteboard-cursive-coach]")?.value ?? "off";
  const font = document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial";
  const text = entry?.value ?? "";
  if (!entry || !surface || mode === "off" || font !== "School Cursive" || !text) {
    refreshPendingWhiteboardTextEntryStyle();
    return;
  }
  const coach = document.createElement("aside");
  coach.className = "platform-whiteboard-pencil-grip-photo";
  coach.dataset.whiteboardCursiveCoachPreview = "true";
  coach.innerHTML = `<button type="button" aria-label="Open the pencil grip tutorial"><img src="./assets/images/whiteboard/proper-pencil-grip.jpg" alt="A hand demonstrating a tripod pencil grip while writing"><small>Relaxed tripod pencil grip<br>Click for tutorial</small></button>`;
  coach.querySelector("button")?.addEventListener("click", openPencilGripTutorial);
  coach.style.left = "8px";
  coach.style.top = "8px";
  surface.append(coach);
  window.setTimeout(() => coach.classList.add("is-fading"), 5800);
  window.setTimeout(() => coach.remove(), 6600);
}
function showWhiteboardCursiveModel(text, object, canvas, onComplete) {
  const surface = canvas.parentElement;
  if (!surface || !text) return;
  surface.querySelector("[data-whiteboard-cursive-model]")?.remove();
  const modeledLetters = [...text].reduce((letters, character, sourceIndex, sourceCharacters) => {
    if (/^[A-Za-z]$/.test(character)) letters.push({
      character,
      connectsFromPrevious: sourceIndex > 0 && /^[A-Za-z]$/.test(sourceCharacters[sourceIndex - 1]),
      connectsToNext: sourceIndex < sourceCharacters.length - 1 && /^[A-Za-z]$/.test(sourceCharacters[sourceIndex + 1])
    });
    return letters;
  }, []);
  if (!modeledLetters.length) return;
  const model = document.createElement("aside");
  model.className = "platform-whiteboard-cursive-model";
  model.dataset.whiteboardCursiveModel = "true";
  const scaleX = canvas.clientWidth / canvas.width, scaleY = canvas.clientHeight / canvas.height;
  model.style.left = `${Math.max(4, object.x * scaleX)}px`;
  model.style.top = `${Math.max(4, object.y * scaleY)}px`;
  model.innerHTML = `<strong data-whiteboard-cursive-model-title>Watch each letter form</strong><svg data-whiteboard-cursive-model-svg viewBox="-12 -5 58 42" aria-live="polite"><g class="platform-whiteboard-cursive-guides" aria-hidden="true"><line x1="-12" x2="46" y1="-4" y2="-4"/><line class="is-midline" x1="-12" x2="46" y1="8" y2="8"/><line x1="-12" x2="46" y1="17" y2="17"/></g></svg>`;
  surface.append(model);
  const modelTitle = model.querySelector("[data-whiteboard-cursive-model-title]");
  const modelSvg = model.querySelector("[data-whiteboard-cursive-model-svg]");
  const penSpeedMillisecondsPerUnit = 45;
  const pauseAfterLetter = 800;
  const playLetter = (index) => {
    if (!model.isConnected || !modelTitle || !modelSvg) return;
    if (index >= modeledLetters.length) {
      const replay = window.confirm("The cursive letter model is complete. Would you like to replay it once more?");
      model.remove();
      if (replay) showWhiteboardCursiveModel(text, object, canvas, onComplete);
      else onComplete?.();
      return;
    }
    const { character, connectsFromPrevious, connectsToNext } = modeledLetters[index];
    const isUppercase = /^[A-Z]$/.test(character);
    const glyph = isUppercase ? null : customLetters[character];
    const letterStrokes = isUppercase ? `<text class="platform-whiteboard-cursive-capital" x="0" y="9">${escapeHtml2(character)}</text>` : glyph?.paths.map((path) => path.dot ? `<circle class="platform-whiteboard-cursive-dot" cx="${path.dot.cx}" cy="${path.dot.cy}" r="${path.dot.r}"/>` : `<path pathLength="1" d="${path.d}"/>`).join("") || "";
    modelTitle.textContent = `Letter ${index + 1} of ${modeledLetters.length}: ${character}`;
    modelSvg.setAttribute("aria-label", `${connectsFromPrevious ? "How to continue from the previous letter and form" : "How to begin at the baseline and form"} the cursive letter ${character}`);
    const previousLetter = modelSvg.querySelector("[data-cursive-letter-active]");
    modelSvg.insertAdjacentHTML("beforeend", `<g data-cursive-letter-active transform="translate(12 8)">${letterStrokes}</g>`);
    const currentLetter = [...modelSvg.querySelectorAll("[data-cursive-letter-active]")].at(-1);
    if (currentLetter) {
      const drawnPaths = [...currentLetter.querySelectorAll("path")];
      const firstDrawnPath = drawnPaths[0];
      const lastDrawnPath = drawnPaths.at(-1);
      const capitalBounds = currentLetter.querySelector("text")?.getBBox();
      const pathStart = firstDrawnPath?.getPointAtLength(0);
      const pathEndpoint = lastDrawnPath?.getPointAtLength(lastDrawnPath.getTotalLength());
      const entryEndX = pathStart?.x ?? 0;
      const entryEndY = pathStart?.y ?? 9;
      const entryStartX = entryEndX - 6;
      const previousEndpointY = Number(previousLetter?.dataset.cursiveExitY);
      const entryStartY = connectsFromPrevious && Number.isFinite(previousEndpointY) ? previousEndpointY : 9;
      if (!isUppercase) currentLetter.insertAdjacentHTML("afterbegin", `<path class="platform-whiteboard-cursive-entry${connectsFromPrevious ? " platform-whiteboard-cursive-incoming" : ""}" pathLength="1" d="M ${entryStartX} ${entryStartY} C ${entryStartX + 2} ${entryStartY}, ${entryEndX - 2} ${entryEndY}, ${entryEndX} ${entryEndY}"/>`);
      currentLetter.dataset.cursiveEntryX = String(entryStartX);
      currentLetter.dataset.cursiveExitX = String(pathEndpoint?.x ?? (capitalBounds ? capitalBounds.x + capitalBounds.width : 0));
      currentLetter.dataset.cursiveExitY = String(pathEndpoint?.y ?? 9);
      if (previousLetter) {
        const previousBounds = previousLetter.getBBox();
        const previousEndpointX = Number(previousLetter.dataset.cursiveExitX) || previousBounds.x + previousBounds.width;
        previousLetter.setAttribute("transform", `translate(${12 + entryStartX - previousEndpointX} 8)`);
        previousLetter.removeAttribute("data-cursive-letter-active");
        previousLetter.classList.add("is-fading");
        window.setTimeout(() => previousLetter.remove(), 800);
      }
    }
    let elapsedDrawingTime = 0;
    currentLetter?.querySelectorAll("path, circle, text").forEach((stroke) => {
      const isPath = stroke.tagName.toLowerCase() === "path";
      const isDot = stroke.tagName.toLowerCase() === "circle";
      const duration = isPath ? Math.max(650, Math.min(2200, stroke.getTotalLength() * penSpeedMillisecondsPerUnit)) : isDot ? 180 : 1100;
      stroke.style.setProperty("--stroke-delay", `${elapsedDrawingTime}ms`);
      stroke.style.setProperty("--stroke-duration", `${duration}ms`);
      elapsedDrawingTime += duration;
    });
    window.setTimeout(() => playLetter(index + 1), elapsedDrawingTime + pauseAfterLetter);
  };
  playLetter(0);
}
function openCursiveTouchPractice(text) {
  document.querySelector("[data-cursive-touch-practice]")?.remove();
  const practice = document.createElement("section");
  practice.className = "platform-cursive-touch-practice";
  practice.dataset.cursiveTouchPractice = "true";
  practice.setAttribute("role", "dialog");
  practice.setAttribute("aria-modal", "true");
  practice.setAttribute("aria-labelledby", "cursive-touch-title");
  practice.innerHTML = `<header><div><p class="platform-command-label">Touch Writing Practice</p><h2 id="cursive-touch-title">Write \u201C${escapeHtml2(text)}\u201D</h2></div><button type="button" data-touch-close aria-label="Close touch writing practice">Close</button></header><main><section class="platform-cursive-touch-model" data-touch-model-panel><span>Your cursive model</span><strong data-touch-model>${escapeHtml2(text)}</strong></section><div class="platform-cursive-touch-options"><label>Writing paper<select data-touch-paper><option value="wide" selected>Wide ruled</option><option value="practice">Handwriting practice \u2014 3 lines</option><option value="none">No lines</option></select></label><label>Writing help<select data-touch-help required><option value="" selected>Choose before writing</option><option value="model">Show the modeled writing while I write</option><option value="independent">Try without help</option></select></label><span data-touch-ready>Choose writing help to unlock the touch area.</span><button type="button" data-touch-previous>\u2190 Previous space</button><span data-touch-page-count>Space 1 of 1</span><button type="button" data-touch-next>Next space \u2192</button><button type="button" data-touch-add-page>+ New writing space</button></div><section class="platform-cursive-touch-pages is-locked" data-touch-pages aria-label="Finger writing area"></section><div class="platform-cursive-touch-actions"><button type="button" data-touch-clear>Clear this space</button><button type="button" class="platform-button-primary" data-touch-finish>I'm done writing</button></div><section class="platform-cursive-touch-result" data-touch-result hidden></section></main>`;
  document.body.append(practice);
  const pages = [];
  let currentPageIndex = 0, activeStroke = null, paper = "wide", traceMode = false, helpChoice = "";
  const pagesRegion = practice.querySelector("[data-touch-pages]");
  const pageCount = practice.querySelector("[data-touch-page-count]");
  const drawPaper = (context, canvas) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (paper === "wide") {
      context.strokeStyle = "#8bc4dc";
      context.lineWidth = 3;
      [115, 225, 335].forEach((y) => {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      });
    }
    if (paper === "practice") {
      [28, 142, 256].forEach((top) => {
        context.strokeStyle = "#76b6d0";
        context.lineWidth = 2;
        context.setLineDash([]);
        context.beginPath();
        context.moveTo(0, top);
        context.lineTo(canvas.width, top);
        context.moveTo(0, top + 76);
        context.lineTo(canvas.width, top + 76);
        context.stroke();
        context.setLineDash([10, 9]);
        context.beginPath();
        context.moveTo(0, top + 38);
        context.lineTo(canvas.width, top + 38);
        context.stroke();
      });
      context.setLineDash([]);
    }
    if (traceMode) {
      context.save();
      context.globalAlpha = 0.16;
      context.fillStyle = "#12384d";
      context.font = '110px "School Cursive", cursive';
      context.fillText(text, 35, 215);
      context.restore();
    }
  };
  const renderPage = (page) => {
    const context = page.canvas.getContext("2d");
    drawPaper(context, page.canvas);
    context.strokeStyle = "#12384d";
    context.lineWidth = 8;
    context.lineCap = "round";
    context.lineJoin = "round";
    page.strokes.forEach((stroke) => {
      if (!stroke.length) return;
      context.beginPath();
      context.moveTo(stroke[0].x, stroke[0].y);
      stroke.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.stroke();
    });
  };
  const showPage = (index) => {
    currentPageIndex = index;
    pages.forEach((page, pageIndex) => {
      page.canvas.hidden = pageIndex !== index;
    });
    pageCount.textContent = `Space ${index + 1} of ${pages.length}`;
    practice.querySelector("[data-touch-previous]").disabled = index === 0;
    practice.querySelector("[data-touch-next]").disabled = index === pages.length - 1;
  };
  const addPage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 370;
    canvas.setAttribute("aria-label", `Touch writing space ${pages.length + 1}`);
    canvas.style.touchAction = "none";
    canvas.style.setProperty("--touch-canvas-width", `${canvas.width}px`);
    const page = { canvas, strokes: [], inkLength: 0, minX: Infinity, maxX: -Infinity };
    pages.push(page);
    pagesRegion.append(canvas);
    renderPage(page);
    showPage(pages.length - 1);
    const pointFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
    };
    canvas.addEventListener("pointerdown", (event) => {
      if (!helpChoice) return;
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      activeStroke = [pointFromEvent(event)];
      page.strokes.push(activeStroke);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!activeStroke) return;
      event.preventDefault();
      const point = pointFromEvent(event), previous = activeStroke.at(-1);
      activeStroke.push(point);
      page.inkLength += Math.hypot(point.x - previous.x, point.y - previous.y);
      page.minX = Math.min(page.minX, point.x);
      page.maxX = Math.max(page.maxX, point.x);
      if (point.x > canvas.width - 40) {
        canvas.width += 800;
        canvas.style.setProperty("--touch-canvas-width", `${canvas.width}px`);
      }
      renderPage(page);
      if (point.x > pagesRegion.scrollLeft + pagesRegion.clientWidth - 90) pagesRegion.scrollTo({ left: point.x - pagesRegion.clientWidth + 140, behavior: "smooth" });
    });
    const stop = () => {
      activeStroke = null;
    };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
  };
  addPage();
  practice.querySelector("[data-touch-paper]").addEventListener("change", (event) => {
    paper = event.target.value;
    pages.forEach(renderPage);
  });
  practice.querySelector("[data-touch-help]").addEventListener("change", (event) => {
    helpChoice = event.target.value;
    pagesRegion.classList.toggle("is-locked", !helpChoice);
    practice.querySelector("[data-touch-model-panel]").hidden = helpChoice === "independent";
    practice.querySelector("[data-touch-ready]").textContent = helpChoice ? "Touch writing is ready." : "Choose writing help to unlock the touch area.";
  });
  practice.querySelector("[data-touch-previous]").addEventListener("click", () => showPage(Math.max(0, currentPageIndex - 1)));
  practice.querySelector("[data-touch-next]").addEventListener("click", () => showPage(Math.min(pages.length - 1, currentPageIndex + 1)));
  practice.querySelector("[data-touch-add-page]").addEventListener("click", addPage);
  practice.querySelector("[data-touch-clear]").addEventListener("click", () => {
    const page = pages[currentPageIndex];
    page.strokes = [];
    page.inkLength = 0;
    page.minX = Infinity;
    page.maxX = -Infinity;
    renderPage(page);
  });
  practice.querySelector("[data-touch-finish]").addEventListener("click", () => {
    const totalInk = pages.reduce((sum, page) => sum + page.inkLength, 0);
    const writtenWidth = pages.reduce((sum, page) => sum + Math.max(0, page.maxX - page.minX), 0);
    const difficultToRead = totalInk < Math.max(180, text.length * 24) || writtenWidth < Math.min(280, text.length * 20);
    const result = practice.querySelector("[data-touch-result]");
    result.hidden = false;
    result.innerHTML = `<h3>Your writing</h3><div class="platform-cursive-touch-submission">${pages.map((page, index) => `<figure><img src="${page.canvas.toDataURL("image/png")}" alt="Touch writing page ${index + 1}"><figcaption>Page ${index + 1}</figcaption></figure>`).join("")}</div>${difficultToRead ? `<aside class="platform-cursive-touch-bob"><strong>Bob's suggestion</strong><p>Some of this writing is difficult to read. Rewatch how the model is written, trace the typed cursive once, and then try writing it again.</p><button type="button" data-touch-rewatch>Rewatch model writing</button><button type="button" data-touch-trace>Trace the typed writing</button></aside>` : `<p class="platform-cursive-touch-success">Your touch writing is saved below the cursive model.</p>`}`;
    practice.querySelector("[data-touch-rewatch]")?.addEventListener("click", () => {
      const model = practice.querySelector("[data-touch-model]");
      model.classList.remove("is-replaying");
      window.requestAnimationFrame(() => model.classList.add("is-replaying"));
    });
    practice.querySelector("[data-touch-trace]")?.addEventListener("click", () => {
      traceMode = true;
      addPage();
      result.hidden = true;
    });
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  practice.querySelector("[data-touch-close]").addEventListener("click", () => practice.remove());
  practice.focus();
}
function openWhiteboardTextEntry(point, canvas) {
  const surface = canvas.parentElement;
  if (!surface) return;
  surface.querySelector("[data-whiteboard-text-entry]")?.remove();
  const entry = document.createElement("textarea");
  entry.className = "platform-whiteboard-text-entry";
  entry.dataset.whiteboardTextEntry = "true";
  entry.maxLength = 120;
  entry.placeholder = "Type here";
  entry.setAttribute("aria-label", "Type whiteboard text at this location");
  const scaleX = canvas.clientWidth / canvas.width;
  const scaleY = canvas.clientHeight / canvas.height;
  entry.style.left = `${Math.max(4, Math.min(canvas.clientWidth - 230, point.x * scaleX))}px`;
  entry.style.top = `${Math.max(4, Math.min(canvas.clientHeight - 55, point.y * scaleY))}px`;
  let finished = false;
  let returnReminderTimer = null;
  const scheduleReturnReminder = () => {
    window.clearTimeout(returnReminderTimer);
    surface.querySelector("[data-whiteboard-return-reminder]")?.remove();
    returnReminderTimer = window.setTimeout(() => {
      if (!entry.isConnected || !entry.value.trim()) return;
      const reminder = document.createElement("p");
      reminder.className = "platform-whiteboard-return-reminder";
      reminder.dataset.whiteboardReturnReminder = "true";
      reminder.setAttribute("role", "alert");
      reminder.textContent = "Press Return to complete this line of text.";
      reminder.style.left = entry.style.left;
      reminder.style.top = `${entry.offsetTop + entry.offsetHeight + 6}px`;
      surface.append(reminder);
    }, 1e4);
  };
  const close = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(returnReminderTimer);
    surface.querySelector("[data-whiteboard-return-reminder]")?.remove();
    surface.querySelector("[data-whiteboard-cursive-coach-preview]")?.remove();
    surface.querySelector("[data-whiteboard-live-cursive]")?.remove();
    entry.remove();
    canvas.focus({ preventScroll: true });
  };
  const commit = () => {
    if (finished) return;
    const value = entry.value.trim().slice(0, 120);
    if (!value) {
      close();
      setWhiteboardStatus("Text placement canceled.");
      return;
    }
    pushWhiteboardHistory();
    const size = Math.max(22, Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6) * 5);
    const object = createWhiteboardObject("text", { text: value, x: point.x, y: point.y, width: Math.min(canvas.width - point.x, Math.max(180, value.length * size * 0.55)), height: size * 1.3, fontSize: size, fontFamily: document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial", color: document.querySelector("[data-whiteboard-text-color]")?.value ?? document.querySelector("[data-whiteboard-color]")?.value ?? "#12384d", background: document.querySelector("[data-whiteboard-text-background]")?.value ?? "transparent", cursiveGuide: document.querySelector("[data-whiteboard-cursive-lines]")?.value ?? "none", bold: document.querySelector('[data-text-command="bold"]')?.getAttribute("aria-pressed") === "true", italic: document.querySelector('[data-text-command="italic"]')?.getAttribute("aria-pressed") === "true", underline: document.querySelector('[data-text-command="underline"]')?.getAttribute("aria-pressed") === "true", rotation: 0 });
    const shouldModelCursive = object.fontFamily === "School Cursive" && document.querySelector("[data-whiteboard-cursive-coach]")?.value !== "off";
    const touchPractice = object.fontFamily === "School Cursive" && document.querySelector("[data-whiteboard-touch-practice]")?.checked;
    whiteboardObjects.push(object);
    whiteboardSelectedObjectId = object.id;
    close();
    renderWhiteboardObjects(canvas);
    saveWhiteboard(canvas);
    updateWhiteboardHistoryControls();
    setWhiteboardStatus(shouldModelCursive || touchPractice ? "Text added. Watch each cursive stroke and letter connection." : "Text added at the selected spot. Drag it to reposition it.");
    if (touchPractice) window.requestAnimationFrame(() => showWhiteboardCursiveModel(value, object, canvas, () => openCursiveTouchPractice(value)));
    else if (shouldModelCursive) window.requestAnimationFrame(() => showWhiteboardCursiveModel(value, object, canvas));
  };
  entry.addEventListener("blur", (event) => {
    if (entry.value.trim()) {
      commit();
      return;
    }
    if (event.relatedTarget?.closest?.(".platform-whiteboard-quick-actions")) return;
    window.requestAnimationFrame(() => {
      if (entry.isConnected) entry.focus({ preventScroll: true });
    });
  });
  entry.addEventListener("input", () => {
    refreshPendingWhiteboardTextEntryStyle();
    updateWhiteboardCursiveCoach();
    scheduleReturnReminder();
  });
  entry.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      setWhiteboardStatus("Text placement canceled.");
    } else if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      commit();
    }
  });
  surface.append(entry);
  refreshPendingWhiteboardTextEntryStyle();
  scheduleReturnReminder();
  window.requestAnimationFrame(() => {
    if (entry.isConnected) entry.focus({ preventScroll: true });
  });
  setWhiteboardStatus("Type directly on the board. Press Enter or click elsewhere to finish; Escape cancels.");
}
function cancelPendingWhiteboardTextEntry() {
  document.querySelector("[data-whiteboard-cursive-coach-preview]")?.remove();
  document.querySelector("[data-whiteboard-live-cursive]")?.remove();
  document.querySelector("[data-whiteboard-text-entry]")?.remove();
}
function whiteboardRichTextRuns(html, fallbackText, fallbackSize = 36, fallbackColor = "#12384d", fallbackFont = "Arial") {
  if (!html) return [{ text: fallbackText ?? "", bold: true, italic: false, underline: false, size: fallbackSize, color: fallbackColor, fontFamily: fallbackFont }];
  const template = document.createElement("template");
  template.innerHTML = html;
  const runs = [];
  const visit = (node, style) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      runs.push({ ...style, text: node.textContent });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase(), next = { ...style };
    if (["b", "strong"].includes(tag)) next.bold = true;
    if (["i", "em"].includes(tag)) next.italic = true;
    if (tag === "u") next.underline = true;
    if (node.getAttribute("color")) next.color = node.getAttribute("color");
    if (node.style?.color) next.color = node.style.color;
    if (node.getAttribute("face")) next.fontFamily = node.getAttribute("face");
    if (node.style?.fontFamily) next.fontFamily = node.style.fontFamily.replace(/["']/g, "");
    const size = Number(node.dataset?.textSize || node.style?.fontSize?.replace("px", ""));
    if (size) next.size = size;
    node.childNodes.forEach((child) => visit(child, next));
  };
  template.content.childNodes.forEach((node) => visit(node, { bold: false, italic: false, underline: false, size: fallbackSize, color: fallbackColor, fontFamily: fallbackFont }));
  return runs.length ? runs : [{ text: fallbackText ?? "", bold: true, italic: false, underline: false, size: fallbackSize, color: fallbackColor, fontFamily: fallbackFont }];
}
function openWhiteboardRichTextEditor(object, canvas) {
  const surface = canvas.parentElement;
  if (!surface || object?.type !== "text" || object.emojiStamp) return;
  surface.querySelector("[data-whiteboard-rich-editor]")?.remove();
  const editor = document.createElement("section");
  editor.className = "platform-whiteboard-rich-editor";
  editor.dataset.whiteboardRichEditor = "true";
  editor.style.left = `${Math.max(4, object.x * canvas.clientWidth / canvas.width)}px`;
  editor.style.top = `${Math.max(4, object.y * canvas.clientHeight / canvas.height)}px`;
  editor.innerHTML = `<div class="platform-whiteboard-rich-toolbar"><button type="button" data-rich-command="bold" title="Bold (Ctrl+B)"><b>B</b></button><button type="button" data-rich-command="italic" title="Italic (Ctrl+I)"><i>I</i></button><button type="button" data-rich-command="underline" title="Underline (Ctrl+U)"><u>U</u></button><label>Font <select data-rich-font>${["Arial", "Verdana", "Courier New", "Comic Sans MS", "School Cursive"].map((font) => `<option value="${font}"${font === (object.fontFamily ?? "Arial") ? " selected" : ""}>${font}</option>`).join("")}</select></label><label>Font color <input type="color" data-rich-color value="${escapeHtml2(object.color ?? "#12384d")}"></label><label>Size <select data-rich-size>${[18, 24, 30, 36, 48, 60, 72].map((size) => `<option value="${size}"${size === Math.round((object.fontSize ?? 36) * (object.textScale ?? 1)) ? " selected" : ""}>${size}</option>`).join("")}</select></label><button type="button" data-rich-done>Done</button></div><div class="platform-whiteboard-rich-content" contenteditable="true" role="textbox" aria-label="Edit and format whiteboard text"></div>`;
  const content = editor.querySelector("[contenteditable]");
  content.innerHTML = object.richHtml || escapeHtml2(object.text);
  editor.querySelectorAll("[data-rich-command]").forEach((button) => button.addEventListener("mousedown", (event) => {
    event.preventDefault();
    document.execCommand(button.dataset.richCommand);
    content.focus();
  }));
  editor.querySelector("[data-rich-color]").addEventListener("input", (event) => {
    content.focus();
    document.execCommand("foreColor", false, event.target.value);
  });
  editor.querySelector("[data-rich-font]").addEventListener("change", (event) => {
    content.focus();
    document.execCommand("fontName", false, event.target.value);
  });
  editor.querySelector("[data-rich-size]").addEventListener("change", (event) => {
    content.focus();
    document.execCommand("fontSize", false, "7");
    content.querySelectorAll('font[size="7"]').forEach((node) => {
      node.removeAttribute("size");
      node.dataset.textSize = event.target.value;
      node.style.fontSize = `${event.target.value}px`;
    });
  });
  const save = () => {
    object.richHtml = content.innerHTML;
    object.text = content.textContent.trim().slice(0, 120);
    object.fontSize = Number(editor.querySelector("[data-rich-size]").value);
    object.fontFamily = editor.querySelector("[data-rich-font]").value;
    object.color = editor.querySelector("[data-rich-color]").value;
    object.textScale = 1;
    object.height = Math.max(object.height, object.fontSize * 1.4);
    pushWhiteboardHistory();
    editor.remove();
    renderWhiteboardObjects(canvas);
    saveWhiteboard(canvas);
    setWhiteboardStatus("Formatted text saved.");
    canvas.focus();
  };
  editor.querySelector("[data-rich-done]").addEventListener("click", save);
  surface.append(editor);
  content.focus();
}
function drawWhiteboardGrid(context, canvas) {
  if (whiteboardGridUnit === "plain") return;
  const minor = whiteboardGridUnit === "inch" ? 24 : whiteboardGridUnit === "cm" ? 37.8 : 3.78;
  const majorEvery = whiteboardGridUnit === "inch" ? 4 : whiteboardGridUnit === "cm" ? 1 : 10;
  for (let index = 0, x = 0; x <= canvas.width; index += 1, x += minor) {
    context.beginPath();
    context.strokeStyle = index % majorEvery === 0 ? "#83aec0" : "#d5e8ef";
    context.lineWidth = index % majorEvery === 0 ? 1.4 : 0.55;
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let index = 0, y = 0; y <= canvas.height; index += 1, y += minor) {
    context.beginPath();
    context.strokeStyle = index % majorEvery === 0 ? "#83aec0" : "#d5e8ef";
    context.lineWidth = index % majorEvery === 0 ? 1.4 : 0.55;
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
}
function drawWhiteboardTitleBar(context, canvas) {
  if (whiteboardGridUnit === "plain") return;
  const unitLabel = whiteboardGridUnit === "inch" ? "English \xB7 inches" : whiteboardGridUnit === "cm" ? "Metric \xB7 centimeters" : "Metric \xB7 millimeters";
  const scaleLabel = whiteboardGridUnit === "inch" ? "Major: 1 in \xB7 Minor: 1/4 in" : whiteboardGridUnit === "cm" ? "Major grid: 1 cm" : "Major: 1 cm \xB7 Minor: 1 mm";
  const width = Math.min(410, canvas.width * 0.44), height = 102, x = canvas.width - width - 12, y = canvas.height - height - 12;
  context.save();
  context.globalAlpha = 0.96;
  context.fillStyle = "#ffffff";
  context.strokeStyle = "#12384d";
  context.lineWidth = 2;
  context.fillRect(x, y, width, height);
  context.strokeRect(x, y, width, height);
  context.beginPath();
  context.moveTo(x, y + 48);
  context.lineTo(x + width, y + 48);
  context.moveTo(x + width * 0.62, y + 48);
  context.lineTo(x + width * 0.62, y + height);
  context.stroke();
  context.fillStyle = "#12384d";
  context.font = "800 19px sans-serif";
  context.fillText(whiteboardDrawingTitle || "Workshop Drawing", x + 10, y + 30, width - 20);
  context.font = "700 12px sans-serif";
  context.fillText(unitLabel, x + 10, y + 69, width * 0.58);
  context.fillText(scaleLabel, x + 10, y + 89, width * 0.58);
  context.fillText("DATE", x + width * 0.65, y + 65);
  context.font = "600 13px sans-serif";
  context.fillText((/* @__PURE__ */ new Date()).toLocaleDateString(), x + width * 0.65, y + 87);
  context.restore();
}
function drawWhiteboardRuler(context, canvas) {
  if (whiteboardRulerUnit === "none") return;
  const metric = whiteboardRulerUnit === "metric";
  const unit = whiteboardPixelsPerUnit(metric ? "cm" : "in");
  const subdivisions = metric ? 10 : 8;
  const width = Math.max(150, whiteboardRuler.length);
  const tickSpacing = unit / subdivisions, totalTicks = Math.floor(width / tickSpacing);
  const height = 62;
  context.save();
  context.translate(whiteboardRuler.x, whiteboardRuler.y);
  context.rotate(whiteboardRuler.angle);
  context.globalAlpha = 0.94;
  context.fillStyle = "#fff1a8";
  context.strokeStyle = "#6b5312";
  context.lineWidth = 2;
  context.fillRect(0, 0, width, height);
  context.strokeRect(0, 0, width, height);
  context.fillStyle = "#3e320d";
  context.font = "700 13px sans-serif";
  for (let tickIndex = 0; tickIndex <= totalTicks; tickIndex += 1) {
    const tickX = tickIndex * tickSpacing, tick = tickIndex % subdivisions;
    const length = tick === 0 ? 28 : tick % (subdivisions / 2) === 0 ? 20 : tick % (subdivisions / 4) === 0 ? 15 : 10;
    if (tick === 0) context.fillText(String(tickIndex / subdivisions), tickX + 3, 43);
    context.beginPath();
    context.moveTo(tickX, 0);
    context.lineTo(tickX, length);
    context.stroke();
    if (whiteboardRuler.sides === "both") {
      context.beginPath();
      context.moveTo(tickX, height);
      context.lineTo(tickX, height - length);
      context.stroke();
    }
  }
  context.beginPath();
  context.moveTo(width, 0);
  context.lineTo(width, 12);
  if (whiteboardRuler.sides === "both") {
    context.moveTo(width, height);
    context.lineTo(width, height - 12);
  }
  context.stroke();
  context.fillText(metric ? "cm" : "in", width - 25, 43);
  if (document.querySelector("[data-whiteboard-tool]")?.value === "ruler-adjust") {
    context.fillStyle = "#087ba0";
    context.fillRect(width - 7, height / 2 - 7, 14, 14);
    context.beginPath();
    context.arc(width, -24, 8, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#087ba0";
    context.beginPath();
    context.moveTo(width, 0);
    context.lineTo(width, -16);
    context.stroke();
  }
  context.restore();
}
function whiteboardTextBackground(value) {
  return { white: "#ffffff", black: "#111820", "highlight-yellow": "rgba(255, 226, 88, 0.62)", "highlight-green": "rgba(116, 219, 148, 0.58)", "highlight-pink": "rgba(255, 145, 196, 0.58)", "highlight-blue": "rgba(105, 196, 235, 0.58)" }[value] ?? "";
}
function drawWhiteboardCursiveGuides(context, object) {
  if (object.fontFamily !== "School Cursive" || !["wide", "practice"].includes(object.cursiveGuide)) return;
  const left = -object.width / 2 - 6, right = object.width / 2 + 6, top = -object.height / 2, bottom = object.height / 2;
  context.save();
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(64, 142, 190, 0.72)";
  if (object.cursiveGuide === "wide") {
    const spacing = Math.max(26, (object.fontSize ?? 36) * (object.textScale ?? 1) * 1.35);
    for (let y = bottom - 3; y >= top; y -= spacing) {
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(right, y);
      context.stroke();
    }
  } else {
    [top + 3, bottom - 3].forEach((y) => {
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(right, y);
      context.stroke();
    });
    context.setLineDash([7, 5]);
    context.strokeStyle = "rgba(207, 82, 82, 0.68)";
    context.beginPath();
    context.moveTo(left, 0);
    context.lineTo(right, 0);
    context.stroke();
  }
  context.restore();
}
function traceWhiteboardPath(context, points, offsetX = 0, offsetY = 0) {
  if (!points?.length) return;
  context.beginPath();
  points.forEach((point, index) => index ? context.lineTo(point.x + offsetX, point.y + offsetY) : context.moveTo(point.x + offsetX, point.y + offsetY));
  context.stroke();
}
function drawWhiteboardCalligraphyRibbon(context, object) {
  const points = object.points ?? [];
  if (!points.length) return;
  const nibSize = object.size ?? 10;
  const nibAngle = -Math.PI / 4;
  const nibX = Math.cos(nibAngle) * nibSize * 0.5;
  const nibY = Math.sin(nibAngle) * nibSize * 0.5;
  context.save();
  context.fillStyle = object.color ?? "#12384d";
  if (points.length === 1) {
    context.beginPath();
    context.ellipse(points[0].x, points[0].y, nibSize * 0.52, Math.max(1.5, nibSize * 0.16), nibAngle, 0, Math.PI * 2);
    context.fill();
    context.restore();
    return;
  }
  context.beginPath();
  points.forEach((point, index) => index ? context.lineTo(point.x + nibX, point.y + nibY) : context.moveTo(point.x + nibX, point.y + nibY));
  [...points].reverse().forEach((point) => context.lineTo(point.x - nibX, point.y - nibY));
  context.closePath();
  context.fill();
  context.restore();
}
function drawWhiteboardPath(context, object) {
  const points = object.points ?? [];
  if (object.strokeStyle === "eraser") {
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.strokeStyle = "rgba(0,0,0,1)";
    context.fillStyle = "rgba(0,0,0,1)";
    context.globalAlpha = 1;
    context.lineWidth = object.size ?? 40;
    context.lineCap = "round";
    context.lineJoin = "round";
    if (points.length === 1) {
      context.beginPath();
      context.arc(points[0].x, points[0].y, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
    } else traceWhiteboardPath(context, points);
    context.restore();
    return;
  }
  if (object.strokeStyle === "calligraphy") {
    drawWhiteboardCalligraphyRibbon(context, object);
    return;
  }
  if (object.strokeStyle === "brush") {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalAlpha *= 0.5;
    context.lineWidth = Math.max(3, (object.size ?? 18) * 0.62);
    traceWhiteboardPath(context, points);
    const bristleOffsets = [-0.34, -0.18, 0, 0.19, 0.36];
    bristleOffsets.forEach((offset, index) => {
      context.globalAlpha = (object.opacity ?? 1) * (0.34 + index * 0.08);
      context.lineWidth = Math.max(1.25, (object.size ?? 18) * (index % 2 ? 0.09 : 0.055));
      traceWhiteboardPath(context, points, offset * (object.size ?? 18), Math.sin(index * 1.7) * (object.size ?? 18) * 0.13);
    });
    context.restore();
    return;
  }
  traceWhiteboardPath(context, points);
}
function whiteboardYouTubeId(value) {
  try {
    const url = new URL(String(value).trim());
    const host = url.hostname.replace(/^www\./, "");
    const candidate = host === "youtu.be" ? url.pathname.slice(1).split("/")[0] : host.endsWith("youtube.com") ? url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/?#]+)/)?.[1] : "";
    return /^[A-Za-z0-9_-]{6,15}$/.test(candidate ?? "") ? candidate : "";
  } catch {
    return "";
  }
}
function addWhiteboardYouTubeVideo(videoId) {
  const canvas = whiteboardCanvas();
  if (!videoId || !canvas) return false;
  pushWhiteboardHistory();
  const width = Math.min(640, canvas.width * 0.7), height = width * 9 / 16;
  const object = createWhiteboardObject("youtube", { videoId, x: (canvas.width - width) / 2, y: Math.max(20, (canvas.height - height) / 2), width, height });
  whiteboardObjects.push(object);
  whiteboardSelectedObjectId = object.id;
  renderWhiteboardObjects(canvas);
  saveWhiteboard(canvas);
  updateWhiteboardHistoryControls();
  setWhiteboardStatus("YouTube video added. Use its header to move it and the corner handle to resize it.");
  return true;
}
function syncWhiteboardYouTubeOverlays(canvas = whiteboardCanvas()) {
  const surface = canvas?.parentElement;
  if (!canvas || !surface) return;
  surface.querySelectorAll("[data-whiteboard-youtube-overlay]").forEach((overlay) => overlay.remove());
  const scaleX = canvas.clientWidth / canvas.width, scaleY = canvas.clientHeight / canvas.height;
  whiteboardObjects.filter((object) => object.type === "youtube" && object.videoId).forEach((object) => {
    const overlay = document.createElement("section");
    overlay.className = "platform-whiteboard-youtube-overlay";
    overlay.dataset.whiteboardYoutubeOverlay = object.id;
    const place = () => {
      overlay.style.left = `${object.x * scaleX}px`;
      overlay.style.top = `${object.y * scaleY}px`;
      overlay.style.width = `${object.width * scaleX}px`;
      overlay.style.height = `${object.height * scaleY}px`;
    };
    overlay.innerHTML = `<header data-youtube-drag><strong>YouTube Video</strong><span>Drag to move</span></header><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml2(object.videoId)}" title="YouTube video on the whiteboard" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><button type="button" data-youtube-resize aria-label="Resize YouTube video"></button>`;
    place();
    surface.append(overlay);
    const begin = (event, mode) => {
      event.preventDefault();
      const start = { x: event.clientX, y: event.clientY, objectX: object.x, objectY: object.y, width: object.width, height: object.height };
      event.currentTarget.setPointerCapture(event.pointerId);
      whiteboardSelectedObjectId = object.id;
      const move = (moveEvent) => {
        const dx = (moveEvent.clientX - start.x) / scaleX, dy = (moveEvent.clientY - start.y) / scaleY;
        if (mode === "move") {
          object.x = Math.max(0, start.objectX + dx);
          object.y = Math.max(0, start.objectY + dy);
        } else {
          object.width = Math.max(240, start.width + dx);
          object.height = Math.max(170, start.height + dy);
        }
        place();
      };
      const end = () => {
        event.currentTarget.removeEventListener("pointermove", move);
        event.currentTarget.removeEventListener("pointerup", end);
        saveWhiteboard(canvas);
        renderWhiteboardObjects(canvas);
      };
      event.currentTarget.addEventListener("pointermove", move);
      event.currentTarget.addEventListener("pointerup", end);
    };
    overlay.querySelector("[data-youtube-drag]").addEventListener("pointerdown", (event) => begin(event, "move"));
    overlay.querySelector("[data-youtube-resize]").addEventListener("pointerdown", (event) => begin(event, "resize"));
  });
}
function traceWhiteboardPolygon(context, object, sides, innerRatio = 1) {
  const centerX = object.x + object.width / 2, centerY = object.y + object.height / 2;
  const points = innerRatio < 1 ? sides * 2 : sides;
  for (let index = 0; index < points; index += 1) {
    const radiusScale = innerRatio < 1 && index % 2 ? innerRatio : 1;
    const angle = -Math.PI / 2 + index * Math.PI * 2 / points;
    const x = centerX + Math.cos(angle) * object.width / 2 * radiusScale;
    const y = centerY + Math.sin(angle) * object.height / 2 * radiusScale;
    if (index) context.lineTo(x, y);
    else context.moveTo(x, y);
  }
  context.closePath();
}
function drawWhiteboard3DShape(context, object) {
  const bounds = objectBounds(object), x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;
  const depth = Math.min(Math.min(width, height) * 0.45, Math.max(10, object.depth ?? Math.min(width, height) * 0.22));
  context.beginPath();
  if (["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism"].includes(object.type)) {
    context.rect(x, y + depth, width - depth, height - depth);
    context.moveTo(x, y + depth);
    context.lineTo(x + depth, y);
    context.lineTo(x + width, y);
    context.lineTo(x + width - depth, y + depth);
    context.moveTo(x + width, y);
    context.lineTo(x + width, y + height - depth);
    context.lineTo(x + width - depth, y + height);
  } else if (object.type === "cylinder") {
    context.ellipse(x + width / 2, y + depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2);
    context.moveTo(x, y + depth / 2);
    context.lineTo(x, y + height - depth / 2);
    context.moveTo(x + width, y + depth / 2);
    context.lineTo(x + width, y + height - depth / 2);
    context.ellipse(x + width / 2, y + height - depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2);
  } else if (object.type === "cone") {
    context.moveTo(x + width / 2, y);
    context.lineTo(x, y + height - depth / 2);
    context.moveTo(x + width / 2, y);
    context.lineTo(x + width, y + height - depth / 2);
    context.ellipse(x + width / 2, y + height - depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2);
  } else if (object.type === "pyramid") {
    context.moveTo(x + width / 2, y);
    context.lineTo(x, y + height - depth);
    context.lineTo(x + width / 2, y + height);
    context.lineTo(x + width, y + height - depth);
    context.closePath();
    context.moveTo(x + width / 2, y);
    context.lineTo(x + width / 2, y + height);
  } else if (object.type === "sphere" || object.type === "hemisphere") {
    context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    context.moveTo(x, y + height / 2);
    context.bezierCurveTo(x + width * 0.2, y + height * 0.35, x + width * 0.8, y + height * 0.35, x + width, y + height / 2);
    if (object.type === "sphere") {
      context.moveTo(x + width / 2, y);
      context.bezierCurveTo(x + width * 0.35, y + height * 0.2, x + width * 0.35, y + height * 0.8, x + width / 2, y + height);
    }
  }
  context.stroke();
  const faceColors = { front: object.faceColors?.front ?? object.color ?? "#12384d", side: object.faceColors?.side ?? object.color ?? "#287da0", top: object.faceColors?.top ?? object.color ?? "#6aa9bf" };
  const strokeFace = (face, trace, fillTrace = trace) => {
    const color = faceColors[face];
    context.save();
    if (object.faceColors?.[face]) {
      context.save();
      context.globalAlpha = 0.2;
      context.fillStyle = color;
      context.beginPath();
      fillTrace();
      context.fill();
      context.restore();
    }
    context.strokeStyle = color;
    context.beginPath();
    trace();
    context.stroke();
    context.restore();
  };
  if (["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism"].includes(object.type)) {
    strokeFace("front", () => context.rect(x, y + depth, width - depth, height - depth));
    strokeFace("top", () => {
      context.moveTo(x, y + depth);
      context.lineTo(x + depth, y);
      context.lineTo(x + width, y);
      context.lineTo(x + width - depth, y + depth);
      context.closePath();
    });
    strokeFace("side", () => {
      context.moveTo(x + width - depth, y + depth);
      context.lineTo(x + width, y);
      context.lineTo(x + width, y + height - depth);
      context.lineTo(x + width - depth, y + height);
      context.closePath();
    });
    if (object.type === "triangular-prism") strokeFace("front", () => {
      context.moveTo(x, y + height - depth);
      context.lineTo(x + (width - depth) / 2, y + depth);
      context.lineTo(x + width - depth, y + height - depth);
      context.closePath();
    });
    if (object.type === "hexagonal-prism") strokeFace("front", () => {
      context.moveTo(x, y + height / 2);
      context.lineTo(x + depth, y + depth);
      context.lineTo(x + width - depth, y + depth);
      context.lineTo(x + width, y + height / 2);
      context.closePath();
    });
  } else if (object.type === "cylinder") {
    strokeFace("top", () => context.ellipse(x + width / 2, y + depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2));
    strokeFace("side", () => {
      context.moveTo(x, y + depth / 2);
      context.lineTo(x, y + height - depth / 2);
      context.moveTo(x + width, y + depth / 2);
      context.lineTo(x + width, y + height - depth / 2);
    }, () => {
      context.moveTo(x, y + depth / 2);
      context.lineTo(x, y + height - depth / 2);
      context.lineTo(x + width, y + height - depth / 2);
      context.lineTo(x + width, y + depth / 2);
      context.closePath();
    });
    strokeFace("front", () => context.ellipse(x + width / 2, y + height - depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2));
  } else if (object.type === "pyramid") {
    strokeFace("front", () => {
      context.moveTo(x + width / 2, y);
      context.lineTo(x, y + height - depth);
      context.lineTo(x + width / 2, y + height);
      context.closePath();
    });
    strokeFace("side", () => {
      context.moveTo(x + width / 2, y);
      context.lineTo(x + width / 2, y + height);
      context.lineTo(x + width, y + height - depth);
      context.closePath();
    });
    strokeFace("top", () => {
      context.moveTo(x, y + height - depth);
      context.lineTo(x + width / 2, y + height);
      context.lineTo(x + width, y + height - depth);
      context.closePath();
    });
  } else if (object.type === "cone") {
    strokeFace("side", () => {
      context.moveTo(x + width / 2, y);
      context.lineTo(x, y + height - depth / 2);
      context.moveTo(x + width / 2, y);
      context.lineTo(x + width, y + height - depth / 2);
    }, () => {
      context.moveTo(x + width / 2, y);
      context.lineTo(x, y + height - depth / 2);
      context.lineTo(x + width, y + height - depth / 2);
      context.closePath();
    });
    strokeFace("front", () => context.ellipse(x + width / 2, y + height - depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2));
  } else if (["sphere", "hemisphere"].includes(object.type)) {
    strokeFace("front", () => context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2));
    strokeFace("side", () => {
      context.moveTo(x + width / 2, y);
      context.bezierCurveTo(x + width * 0.35, y + height * 0.2, x + width * 0.35, y + height * 0.8, x + width / 2, y + height);
    });
    strokeFace("top", () => {
      context.moveTo(x, y + height / 2);
      context.bezierCurveTo(x + width * 0.2, y + height * 0.35, x + width * 0.8, y + height * 0.35, x + width, y + height / 2);
    });
  }
  if (object.shapeLabel) {
    const name = { "rectangular-prism": "Rectangular Prism", "triangular-prism": "Triangular Prism", "hexagonal-prism": "Hexagonal Prism", cylinder: "Cylinder", pyramid: "Pyramid", hemisphere: "Hemisphere" }[object.type] ?? "3D Shape";
    context.save();
    context.font = "800 18px sans-serif";
    const labelWidth = context.measureText(name).width + 20;
    const labelX = x + width / 2 - labelWidth / 2, labelY = y + height + 8;
    context.fillStyle = "rgba(255,255,255,0.94)";
    context.strokeStyle = "#12384d";
    context.lineWidth = 1.5;
    context.fillRect(labelX, labelY, labelWidth, 30);
    context.strokeRect(labelX, labelY, labelWidth, 30);
    context.fillStyle = "#12384d";
    context.fillText(name, labelX + 10, labelY + 21);
    context.restore();
  }
}
function whiteboardPixelsPerUnit(unit) {
  return { mm: 3.78, cm: 37.8, m: 3780, in: 96, ft: 1152, yd: 3456 }[unit] ?? 37.8;
}
function whiteboardDimensionValue(object, unit = object.unit) {
  return Math.hypot(object.width, object.height) / whiteboardPixelsPerUnit(unit);
}
function suggestedWhiteboardDimensionLabel(start, end) {
  const dx = Math.abs(end.x - start.x), dy = Math.abs(end.y - start.y);
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (selected && ["ellipse", "cylinder", "sphere"].includes(selected.type)) {
    const bounds = objectBounds(selected), center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const startAtCenter = Math.hypot(start.x - center.x, start.y - center.y) <= Math.min(bounds.width, bounds.height) * 0.18;
    const endAtCenter = Math.hypot(end.x - center.x, end.y - center.y) <= Math.min(bounds.width, bounds.height) * 0.18;
    if (startAtCenter || endAtCenter) return { label: "Radius", tip: "A radius goes from the center of a round shape to its outside edge." };
    return { label: "Diameter", tip: "A diameter crosses a round shape from one outside edge to the opposite outside edge." };
  }
  if (dy > dx * 1.35) return { label: "Height", tip: "Look at the direction of the laser. A mostly vertical measurement usually describes height." };
  if (dx > dy * 1.35) return { label: "Length", tip: "Look at the direction of the laser. A mostly horizontal measurement usually describes length." };
  return { label: "Length", tip: "The laser follows the longest direction between the two selected points, so length is the clearest general label." };
}
function drawWhiteboardDimension(context, object) {
  const x2 = object.x + object.width, y2 = object.y + object.height, angle = Math.atan2(object.height, object.width);
  const annotationOffset = Number(object.annotationOffset ?? 18);
  const normalX = -Math.sin(angle) * annotationOffset, normalY = Math.cos(angle) * annotationOffset;
  context.save();
  context.strokeStyle = object.color ?? "#b52222";
  context.fillStyle = object.color ?? "#b52222";
  context.lineWidth = object.size ?? 3;
  context.beginPath();
  context.moveTo(object.x, object.y);
  context.lineTo(object.x + normalX, object.y + normalY);
  context.moveTo(x2, y2);
  context.lineTo(x2 + normalX, y2 + normalY);
  context.moveTo(object.x + normalX, object.y + normalY);
  context.lineTo(x2 + normalX, y2 + normalY);
  context.stroke();
  const arrow = (x, y, direction) => {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 12 * Math.cos(direction + 0.5), y + 12 * Math.sin(direction + 0.5));
    context.lineTo(x + 12 * Math.cos(direction - 0.5), y + 12 * Math.sin(direction - 0.5));
    context.closePath();
    context.fill();
  };
  arrow(object.x + normalX, object.y + normalY, angle);
  arrow(x2 + normalX, y2 + normalY, angle + Math.PI);
  const value = whiteboardDimensionValue(object);
  const digits = object.unit === "mm" ? 0 : 2;
  const text = `${object.label || "Length"}: ${value.toFixed(digits)} ${object.unit}`;
  const compareUnit = object.compareUnit ?? (object.unit === "mm" ? "cm" : "mm");
  const compareValue = whiteboardDimensionValue(object, compareUnit);
  const compareDigits = compareUnit === "mm" ? 0 : compareUnit === "m" ? 3 : 2;
  const comparison = `This is the same as ${compareValue.toFixed(compareDigits)} ${compareUnit}`;
  context.font = "700 18px sans-serif";
  const textWidth = Math.max(context.measureText(text).width, context.measureText(comparison).width);
  const midX = (object.x + x2) / 2 + normalX, midY = (object.y + y2) / 2 + normalY;
  context.translate(midX, midY);
  context.rotate(angle);
  context.fillStyle = "rgba(255,255,255,0.94)";
  context.fillRect(-textWidth / 2 - 7, -25, textWidth + 14, 49);
  context.fillStyle = object.color ?? "#b52222";
  context.fillText(text, -textWidth / 2, -6);
  context.font = "600 15px sans-serif";
  context.fillText(comparison, -textWidth / 2, 15);
  const drawUnitKey = (unit, y, color) => {
    const keyLength = whiteboardPixelsPerUnit(unit);
    context.save();
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-keyLength / 2, y);
    context.lineTo(keyLength / 2, y);
    context.moveTo(-keyLength / 2, y - 6);
    context.lineTo(-keyLength / 2, y + 6);
    context.moveTo(keyLength / 2, y - 6);
    context.lineTo(keyLength / 2, y + 6);
    context.stroke();
    context.font = "700 13px sans-serif";
    const keyText = `1 ${unit}`;
    const keyTextWidth = context.measureText(keyText).width;
    context.fillStyle = "rgba(255,255,255,0.94)";
    context.fillRect(-keyTextWidth / 2 - 4, y + 5, keyTextWidth + 8, 18);
    context.fillStyle = color;
    context.fillText(keyText, -keyTextWidth / 2, y + 18);
    context.restore();
  };
  drawUnitKey(object.unit, 39, object.color ?? "#b52222");
  drawUnitKey(compareUnit, 71, "#1769aa");
  context.restore();
}
function drawWhiteboardLaserPreview(context) {
  const start = whiteboardPendingDimension?.start;
  const end = whiteboardPendingDimension?.end ?? whiteboardPendingDimension?.current;
  if (!start) return;
  context.save();
  if (end) {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = "rgba(255, 76, 76, 0.48)";
    context.lineWidth = 8;
    context.shadowColor = "#ff1f1f";
    context.shadowBlur = 18;
    context.stroke();
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = "rgba(255, 238, 238, 0.96)";
    context.lineWidth = 2;
    context.shadowBlur = 7;
    context.stroke();
  }
  const glow = context.createRadialGradient(start.x, start.y, 1, start.x, start.y, 22);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.18, "rgba(255,48,48,1)");
  glow.addColorStop(0.52, "rgba(255,31,31,0.5)");
  glow.addColorStop(1, "rgba(255,31,31,0)");
  context.fillStyle = glow;
  context.shadowColor = "#ff1f1f";
  context.shadowBlur = 14;
  context.beginPath();
  context.arc(start.x, start.y, 22, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(start.x, start.y, 3, 0, Math.PI * 2);
  context.fill();
  context.restore();
}
function whiteboardPointInPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const a = polygon[index], b = polygon[previous];
    const crosses = a.y > point.y !== b.y > point.y && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y || 1e-4) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}
function updateWhiteboardLassoBounds() {
  if (whiteboardLassoPoints.length < 3) {
    whiteboardLassoBounds = null;
    return;
  }
  const xs = whiteboardLassoPoints.map((point) => point.x), ys = whiteboardLassoPoints.map((point) => point.y);
  whiteboardLassoBounds = { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(1, Math.max(...xs) - Math.min(...xs)), height: Math.max(1, Math.max(...ys) - Math.min(...ys)) };
}
function whiteboardLassoObjectIds() {
  return whiteboardObjects.filter((object) => {
    const bounds = objectBounds(object);
    return bounds && whiteboardPointInPolygon({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }, whiteboardLassoPoints);
  }).map((object) => object.id);
}
function whiteboardLassoIntersectingObjectIds() {
  if (!whiteboardLassoBounds) return [];
  const area = whiteboardLassoBounds;
  return whiteboardObjects.filter((object) => {
    const bounds = objectBounds(object);
    return bounds && bounds.x < area.x + area.width && bounds.x + bounds.width > area.x && bounds.y < area.y + area.height && bounds.y + bounds.height > area.y;
  }).map((object) => object.id);
}
function clearWhiteboardLassoChoice() {
  whiteboardLassoPoints = [];
  whiteboardLassoBounds = null;
  whiteboardSelectionDownload = "";
  const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]");
  if (dialog) dialog.hidden = true;
  renderWhiteboardObjects();
}
function useWhiteboardLassoCutout() {
  const result = whiteboardSelectionCanvas();
  if (!result) return false;
  const selectedIds = new Set(whiteboardLassoIntersectingObjectIds()), source = result.canvas.toDataURL("image/png"), image = new Image();
  pushWhiteboardHistory();
  whiteboardObjects = whiteboardObjects.filter((object) => !selectedIds.has(object.id));
  const cutout = createWhiteboardObject("image", { x: result.bounds.x, y: result.bounds.y, width: result.bounds.width, height: result.bounds.height, src: source, element: image, lassoCutout: true, rotation: 0 });
  whiteboardObjects.push(cutout);
  whiteboardSelectedObjectId = cutout.id;
  whiteboardSelectionDownload = source;
  whiteboardLassoPoints = [];
  whiteboardLassoBounds = null;
  image.addEventListener("load", () => {
    renderWhiteboardObjects();
    saveWhiteboard();
    updateWhiteboardHistoryControls();
  }, { once: true });
  image.src = source;
  const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]");
  if (dialog) dialog.hidden = true;
  setWhiteboardStatus("Cutout created as a separate movable image.");
  return true;
}
function deleteWhiteboardLassoCutout() {
  if (!whiteboardLassoBounds || whiteboardLassoPoints.length < 3) return false;
  const object = whiteboardObjects.find((item) => item.type === "image" && item.element && whiteboardLassoIntersectingObjectIds().includes(item.id));
  if (!object) {
    clearWhiteboardLassoChoice();
    setWhiteboardStatus("Place the lasso over an image before choosing Delete Cutout.");
    return false;
  }
  const width = object.element.naturalWidth || Math.max(1, Math.round(object.width)), height = object.element.naturalHeight || Math.max(1, Math.round(object.height));
  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const context = source.getContext("2d");
  context.drawImage(object.element, 0, 0, width, height);
  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  whiteboardLassoPoints.forEach((point, index) => {
    const x = (point.x - object.x) / object.width * width, y = (point.y - object.y) / object.height * height;
    if (index) context.lineTo(x, y);
    else context.moveTo(x, y);
  });
  context.closePath();
  context.fill();
  context.globalCompositeOperation = "source-over";
  const result = source.toDataURL("image/png"), image = new Image();
  pushWhiteboardHistory();
  object.src = result;
  object.element = image;
  object.backgroundRemoved = true;
  whiteboardLassoPoints = [];
  whiteboardLassoBounds = null;
  const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]");
  if (dialog) dialog.hidden = true;
  image.addEventListener("load", () => {
    renderWhiteboardObjects();
    saveWhiteboard();
    updateWhiteboardHistoryControls();
  }, { once: true });
  image.src = result;
  setWhiteboardStatus("The area inside the lasso was deleted. Use Undo to restore it.");
  return true;
}
function fillWhiteboardLassoCutout(color) {
  if (!whiteboardLassoBounds || whiteboardLassoPoints.length < 3) return false;
  const intersectingIds = whiteboardLassoIntersectingObjectIds();
  const object = whiteboardObjects.find((item) => item.type === "image" && item.element && intersectingIds.includes(item.id));
  if (!object) {
    clearWhiteboardLassoChoice();
    setWhiteboardStatus("Place the lasso over an image before replacing its cutout color.");
    return false;
  }
  const width = object.element.naturalWidth || Math.max(1, Math.round(object.width)), height = object.element.naturalHeight || Math.max(1, Math.round(object.height));
  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const context = source.getContext("2d");
  context.drawImage(object.element, 0, 0, width, height);
  context.fillStyle = color;
  context.beginPath();
  whiteboardLassoPoints.forEach((point, index) => {
    const x = (point.x - object.x) / object.width * width, y = (point.y - object.y) / object.height * height;
    if (index) context.lineTo(x, y);
    else context.moveTo(x, y);
  });
  context.closePath();
  context.fill();
  const result = source.toDataURL("image/png"), image = new Image();
  pushWhiteboardHistory();
  object.src = result;
  object.element = image;
  whiteboardLassoPoints = [];
  whiteboardLassoBounds = null;
  const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]");
  if (dialog) dialog.hidden = true;
  image.addEventListener("load", () => {
    renderWhiteboardObjects();
    saveWhiteboard();
    updateWhiteboardHistoryControls();
  }, { once: true });
  image.src = result;
  setWhiteboardStatus(`The cutout was replaced with the matched color ${color}. Use Undo to restore it.`);
  return true;
}
function whiteboardSelectionCanvas({ removeBackground = false } = {}) {
  const canvas = whiteboardCanvas();
  if (!canvas || !whiteboardLassoBounds || whiteboardLassoPoints.length < 3) return null;
  const bounds = { x: Math.max(0, Math.floor(whiteboardLassoBounds.x)), y: Math.max(0, Math.floor(whiteboardLassoBounds.y)), width: Math.max(1, Math.ceil(whiteboardLassoBounds.width)), height: Math.max(1, Math.ceil(whiteboardLassoBounds.height)) };
  const savedPoints = whiteboardLassoPoints;
  whiteboardLassoPoints = [];
  renderWhiteboardObjects(canvas);
  const selection = document.createElement("canvas");
  selection.width = bounds.width;
  selection.height = bounds.height;
  const context = selection.getContext("2d");
  context.save();
  context.beginPath();
  savedPoints.forEach((point, index) => index ? context.lineTo(point.x - bounds.x, point.y - bounds.y) : context.moveTo(point.x - bounds.x, point.y - bounds.y));
  context.closePath();
  context.clip();
  context.drawImage(canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
  context.restore();
  whiteboardLassoPoints = savedPoints;
  renderWhiteboardObjects(canvas);
  if (removeBackground) {
    const pixels = context.getImageData(0, 0, selection.width, selection.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const red = pixels.data[index], green = pixels.data[index + 1], blue = pixels.data[index + 2];
      const light = (red + green + blue) / 3 > 218, neutral = Math.max(red, green, blue) - Math.min(red, green, blue) < 38;
      if (light && neutral) pixels.data[index + 3] = 0;
    }
    context.putImageData(pixels, 0, 0);
  }
  return { canvas: selection, bounds };
}
async function copySelectedWhiteboardObjectAsImage() {
  const canvas = whiteboardCanvas();
  const object = whiteboardObjects.find((item) => item.id === whiteboardSelectedObjectId);
  if (!canvas || !object) {
    setWhiteboardStatus("Right-click a whiteboard object before choosing Copy Image.");
    return;
  }
  const bounds = objectBounds(object), padding = object.type === "image" ? 0 : 12;
  const crop = { x: Math.max(0, Math.floor(bounds.x - padding)), y: Math.max(0, Math.floor(bounds.y - padding)), width: Math.max(1, Math.ceil(bounds.width + padding * 2)), height: Math.max(1, Math.ceil(bounds.height + padding * 2)) };
  const imageCanvas = document.createElement("canvas");
  imageCanvas.width = crop.width;
  imageCanvas.height = crop.height;
  if (object.type === "image" && object.element) imageCanvas.getContext("2d").drawImage(object.element, 0, 0, crop.width, crop.height);
  else {
    const selectedId = whiteboardSelectedObjectId, savedLasso = whiteboardLassoPoints;
    whiteboardSelectedObjectId = "";
    whiteboardLassoPoints = [];
    renderWhiteboardObjects(canvas);
    imageCanvas.getContext("2d").drawImage(canvas, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    whiteboardSelectedObjectId = selectedId;
    whiteboardLassoPoints = savedLasso;
    renderWhiteboardObjects(canvas);
  }
  whiteboardClipboard = structuredClone(serializableWhiteboardObjects().find((item) => item.id === object.id));
  try {
    const blob = await new Promise((resolve) => imageCanvas.toBlob(resolve, "image/png"));
    if (!blob || !navigator.clipboard?.write || typeof ClipboardItem === "undefined") throw new Error("clipboard-image-unavailable");
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setWhiteboardStatus("Image copied. Paste it into a document, message, or another supported app.");
  } catch {
    setWhiteboardStatus("The browser blocked image clipboard access. The object was copied for Ctrl+V inside this whiteboard.");
  }
}
function downloadWhiteboardImage(source, name = "whiteboard-image.png") {
  const link = document.createElement("a");
  link.download = name;
  link.href = source;
  link.click();
}
var PIXEL_PALETTE = ["#000000", "#ffffff", "#12384d", "#287da0", "#55a875", "#f0a52b", "#c83b32", "#7449a8", "#f4d35e", "#ee8fb3", "#7bdff2", "#b2f7a5", "#8d6e63", "#9aa7ad", "#243b75", "#f7f3e8"];
var PIXEL_8_BIT_PALETTE = Array.from({ length: 256 }, (_, value) => {
  const r = Math.round((value >> 5 & 7) * 255 / 7), g = Math.round((value >> 2 & 7) * 255 / 7), b = Math.round((value & 3) * 255 / 3);
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
});
function freshPixelFrame(size = pixelStudio.size) {
  return Array(size * size).fill("#ffffff00");
}
function pixelColorDistance(a, b) {
  const rgb = (value) => value.match(/[\da-f]{2}/gi)?.map((part) => parseInt(part, 16)) ?? [0, 0, 0];
  const aa = rgb(a), bb = rgb(b);
  return aa.reduce((sum, value, index) => sum + (value - bb[index]) ** 2, 0);
}
function pixelPalette() {
  const count = pixelStudio.bits === 24 ? 16 : 2 ** pixelStudio.bits;
  if (!pixelStudio.palette.length) pixelStudio.palette = [...PIXEL_PALETTE, ...PIXEL_8_BIT_PALETTE.slice(16)];
  return pixelStudio.palette.slice(0, count);
}
function nearestPixelColor(color) {
  if (pixelStudio.bits === 24) return String(color).slice(0, 7).toLowerCase();
  return pixelPalette().reduce((best, candidate) => pixelColorDistance(color, candidate) < pixelColorDistance(color, best) ? candidate : best, pixelPalette()[0]);
}
function pixelColorLabel(index) {
  return pixelStudio.bits === 24 ? pixelPalette()[index].toUpperCase() : index.toString(2).padStart(pixelStudio.bits, "0");
}
function randomPixelPalette() {
  const count = pixelStudio.bits === 24 ? 16 : Math.min(16, 2 ** pixelStudio.bits), next = Array.from({ length: count }, (_, index) => {
    if (pixelStudio.bits === 1) return index ? "#ffffff" : "#000000";
    const hue = Math.round((index * 360 / count + Math.random() * 28) % 360), saturation = 55 + Math.round(Math.random() * 35), lightness = 32 + Math.round(Math.random() * 45);
    const temporary = document.createElement("canvas").getContext("2d");
    temporary.fillStyle = `hsl(${hue} ${saturation}% ${lightness}%)`;
    temporary.fillRect(0, 0, 1, 1);
    const [r, g, b] = temporary.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  });
  pixelStudio.palette = [...next, ...pixelStudio.palette.slice(count)];
  if (pixelStudio.bits !== 24) pixelStudio.frames = pixelStudio.frames.map((frame) => frame.map((color) => color.endsWith("00") ? color : nearestPixelColor(color)));
  pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]];
  renderPixelStudio();
}
function pixelFrameCanvas(frame = pixelStudio.pixels, scale = 16) {
  const canvas = document.createElement("canvas");
  canvas.width = pixelStudio.size * scale;
  canvas.height = pixelStudio.size * scale;
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  frame.forEach((color, index) => {
    if (color.endsWith("00")) return;
    context.fillStyle = color;
    context.fillRect(index % pixelStudio.size * scale, Math.floor(index / pixelStudio.size) * scale, scale, scale);
  });
  return canvas;
}
function saveCurrentPixelFrame() {
  pixelStudio.frames[pixelStudio.frameIndex] = [...pixelStudio.pixels];
}
function renderPixelStudio() {
  const canvas = document.querySelector("[data-pixel-canvas]");
  if (!canvas) return;
  const context = canvas.getContext("2d"), cell = canvas.width / pixelStudio.size;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  pixelStudio.pixels.forEach((color, index) => {
    if (!color.endsWith("00")) {
      context.fillStyle = color;
      context.fillRect(index % pixelStudio.size * cell, Math.floor(index / pixelStudio.size) * cell, cell, cell);
    }
  });
  context.strokeStyle = "rgba(18,56,77,.22)";
  context.lineWidth = 1;
  for (let line = 0; line <= pixelStudio.size; line += 1) {
    const point = Math.round(line * cell) + 0.5;
    context.beginPath();
    context.moveTo(point, 0);
    context.lineTo(point, canvas.height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, point);
    context.lineTo(canvas.width, point);
    context.stroke();
  }
  const frames = document.querySelector("[data-pixel-frames]");
  if (frames) frames.innerHTML = pixelStudio.frames.map((frame, index) => `<button type="button" data-action="pixel-select-frame" data-pixel-frame="${index}" aria-pressed="${index === pixelStudio.frameIndex}"><img src="${pixelFrameCanvas(frame, 4).toDataURL()}" alt="Frame ${index + 1}"><span>${index + 1}</span></button>`).join("");
  const palette = document.querySelector("[data-pixel-palette]"), visiblePalette = pixelPalette().slice(0, 16);
  if (palette) palette.innerHTML = visiblePalette.map((color, index) => `<label class="platform-pixel-palette-color"><button type="button" data-action="pixel-select-color" data-pixel-palette-index="${index}" style="--pixel-palette-color:${color}" aria-label="Select ${pixelColorLabel(index)}"></button><code>${pixelColorLabel(index)}</code><input type="color" data-pixel-palette-color="${index}" value="${color}" aria-label="Change ${pixelColorLabel(index)}"></label>`).join("");
  const paletteHelp = document.querySelector("[data-pixel-palette-help]");
  if (paletteHelp) paletteHelp.textContent = pixelStudio.bits <= 4 ? `All ${2 ** pixelStudio.bits} colors available in ${pixelStudio.bits}-bit color are shown. Select one to draw or change its color box.` : pixelStudio.bits === 8 ? "The 8-bit canvas uses 256 colors for image detail. Its first 16 drawing colors are shown and editable here." : "Full Color preserves the many colors in a photograph. These 16 colors are convenient drawing shortcuts; the color picker can choose any color.";
  const preview = document.querySelector("[data-pixel-preview]");
  if (preview) {
    const previewContext = preview.getContext("2d");
    previewContext.imageSmoothingEnabled = false;
    previewContext.clearRect(0, 0, preview.width, preview.height);
    previewContext.drawImage(pixelFrameCanvas(pixelStudio.frames[pixelStudio.frameIndex] ?? pixelStudio.pixels, 4), 0, 0, preview.width, preview.height);
  }
}
function startPixelStudioPreview() {
  window.clearInterval(pixelStudioPreviewTimer);
  let index = 0;
  pixelStudioPreviewTimer = window.setInterval(() => {
    const preview = document.querySelector("[data-pixel-preview]");
    if (!preview || document.querySelector("[data-pixel-studio]")?.hidden) return;
    const context = preview.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, preview.width, preview.height);
    context.drawImage(pixelFrameCanvas(pixelStudio.frames[index % pixelStudio.frames.length], 4), 0, 0, preview.width, preview.height);
    index += 1;
  }, Number(document.querySelector("[data-pixel-speed]")?.value ?? 400));
}
function openPixelStudio() {
  if (!pixelStudio.frames.length) {
    pixelStudio.pixels = freshPixelFrame();
    pixelStudio.frames = [[...pixelStudio.pixels]];
    pixelStudio.frameIndex = 0;
  }
  const dialog = document.querySelector("[data-pixel-studio]");
  if (dialog) {
    dialog.hidden = false;
    const canvas = dialog.querySelector("[data-pixel-canvas]"), gifInput = dialog.querySelector("[data-pixel-gif]");
    if (gifInput && !gifInput.dataset.pixelUploadBound) {
      gifInput.dataset.pixelUploadBound = "true";
      gifInput.addEventListener("change", async (event) => {
        event.stopPropagation();
        const input = event.currentTarget, file = input.files?.[0];
        if (!file) return;
        const uploadLabel = input.closest("label");
        setWhiteboardStatus(`Selected ${file.name}. Opening the GIF now\u2026`);
        if (uploadLabel) uploadLabel.dataset.loading = "true";
        input.disabled = true;
        try {
          await importPixelGif(file);
        } catch {
          setWhiteboardStatus("The selected GIF could not be opened. Try a smaller GIF or update Chrome on the Chromebook.");
        } finally {
          input.disabled = false;
          input.value = "";
          if (uploadLabel) delete uploadLabel.dataset.loading;
        }
      });
    }
    if (canvas && !canvas.dataset.pixelBound) {
      canvas.dataset.pixelBound = "true";
      canvas.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        pixelStudio.drawing = true;
        canvas.setPointerCapture(event.pointerId);
        setPixelAtEvent(event);
      });
      canvas.addEventListener("pointermove", (event) => {
        if (pixelStudio.drawing) setPixelAtEvent(event);
      });
      const stop = () => {
        pixelStudio.drawing = false;
      };
      canvas.addEventListener("pointerup", stop);
      canvas.addEventListener("pointercancel", stop);
    }
    renderPixelStudio();
    startPixelStudioPreview();
    canvas?.focus();
  }
}
function setPixelAtEvent(event) {
  const canvas = event.currentTarget, rect = canvas.getBoundingClientRect(), x = Math.floor((event.clientX - rect.left) / rect.width * pixelStudio.size), y = Math.floor((event.clientY - rect.top) / rect.height * pixelStudio.size);
  if (x < 0 || y < 0 || x >= pixelStudio.size || y >= pixelStudio.size) return;
  const color = nearestPixelColor(document.querySelector("[data-pixel-color]")?.value ?? "#12384d");
  pixelStudio.pixels[y * pixelStudio.size + x] = color;
  saveCurrentPixelFrame();
  renderPixelStudio();
}
function selectedImageToPixels() {
  const object = whiteboardObjects.find((item) => item.id === whiteboardSelectedObjectId && item.type === "image");
  if (!object) {
    setWhiteboardStatus("Select a pasted or uploaded image first, then reopen Pixel Studio.");
    return;
  }
  const image = object.element;
  if (!image?.complete) return;
  const sample = document.createElement("canvas");
  sample.width = pixelStudio.size;
  sample.height = pixelStudio.size;
  const context = sample.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, pixelStudio.size, pixelStudio.size);
  const data = context.getImageData(0, 0, sample.width, sample.height).data;
  pixelStudio.pixels = Array.from({ length: pixelStudio.size ** 2 }, (_, index) => data[index * 4 + 3] < 24 ? "#ffffff00" : nearestPixelColor(`#${[0, 1, 2].map((offset) => data[index * 4 + offset].toString(16).padStart(2, "0")).join("")}`));
  saveCurrentPixelFrame();
  renderPixelStudio();
  setWhiteboardStatus("The selected image was turned into editable pixels.");
}
function imageDataToPixelFrame(data) {
  return Array.from({ length: pixelStudio.size ** 2 }, (_, index) => data[index * 4 + 3] < 24 ? "#ffffff00" : nearestPixelColor(`#${[0, 1, 2].map((offset) => data[index * 4 + offset].toString(16).padStart(2, "0")).join("")}`));
}
async function importPixelGif(file) {
  if (!file || file.type !== "image/gif" && !/\.gif$/i.test(file.name ?? "")) {
    setWhiteboardStatus("That file is not a GIF. Choose a file whose name ends in .gif.");
    return false;
  }
  if (typeof window.ImageDecoder !== "function") {
    setWhiteboardStatus("This browser version cannot separate animated GIF frames. Update Chrome on the Chromebook, then try the file again.");
    return false;
  }
  try {
    setWhiteboardStatus("Opening the GIF and separating its frames\u2026");
    const decoder = new window.ImageDecoder({ data: await file.arrayBuffer(), type: "image/gif" });
    await decoder.tracks.ready;
    const importLimit = document.querySelector("[data-pixel-import-more]")?.checked ? 48 : 12, availableFrames = decoder.tracks.selectedTrack?.frameCount ?? 1, frameCount = Math.min(importLimit, availableFrames), frames = [], sourceFrames = [];
    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const decoded = await decoder.decode({ frameIndex });
      const original = document.createElement("canvas"), originalWidth = decoded.image.displayWidth || decoded.image.codedWidth || pixelStudio.size, originalHeight = decoded.image.displayHeight || decoded.image.codedHeight || pixelStudio.size, scale = Math.min(1, 1600 / Math.max(originalWidth, originalHeight));
      original.width = Math.max(1, Math.round(originalWidth * scale));
      original.height = Math.max(1, Math.round(originalHeight * scale));
      original.getContext("2d").drawImage(decoded.image, 0, 0, original.width, original.height);
      sourceFrames.push(original.toDataURL("image/png"));
      const sample = document.createElement("canvas");
      sample.width = pixelStudio.size;
      sample.height = pixelStudio.size;
      const context = sample.getContext("2d", { willReadFrequently: true });
      context.imageSmoothingEnabled = false;
      context.drawImage(decoded.image, 0, 0, pixelStudio.size, pixelStudio.size);
      frames.push(imageDataToPixelFrame(context.getImageData(0, 0, pixelStudio.size, pixelStudio.size).data));
      decoded.image.close();
    }
    decoder.close();
    pixelStudio.frames = frames.length ? frames : [freshPixelFrame()];
    pixelStudio.sourceFrames = sourceFrames;
    pixelStudio.frameIndex = 0;
    pixelStudio.pixels = [...pixelStudio.frames[0]];
    renderPixelStudio();
    startPixelStudioPreview();
    setWhiteboardStatus(`${pixelStudio.frames.length} GIF frame${pixelStudio.frames.length === 1 ? "" : "s"} from ${file.name} opened as a bit-based editable animation.${availableFrames > frameCount ? ` The GIF has ${availableFrames} frames; turn on Advanced GIF import to open up to 48.` : ""}`);
    return true;
  } catch {
    setWhiteboardStatus(`The file ${file.name} could not be separated into frames. Try a smaller GIF or another GIF file.`);
    return false;
  }
}
function gifUrlFromClipboardText(value, isHtml = false) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (isHtml) {
    const documentCopy = new DOMParser().parseFromString(text, "text/html");
    const sources = [...documentCopy.querySelectorAll("img")].flatMap((image) => [image.currentSrc, image.src, image.getAttribute("data-src")]).filter(Boolean);
    return sources.find((source) => /^https?:\/\//i.test(source) && /\.gif(?:$|[?#])/i.test(source)) ?? sources.find((source) => /^https?:\/\//i.test(source)) ?? "";
  }
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  return match?.[0] ?? "";
}
async function importPixelGifUrl(url) {
  const fallback = document.querySelector("[data-pixel-gif-fallback]"), button = document.querySelector('[data-action="pixel-load-gif-url"]');
  if (fallback) fallback.hidden = true;
  if (button) button.disabled = true;
  try {
    const parsed = new URL(String(url ?? "").trim());
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("invalid-address");
    if (fallback) fallback.href = parsed.href;
    setWhiteboardStatus("Checking the GIF address and downloading its frames\u2026");
    const response = await fetch(parsed.href, { mode: "cors" });
    if (!response.ok) throw new Error("download-blocked");
    const blob = await response.blob(), bytes = new Uint8Array(await blob.slice(0, 6).arrayBuffer()), signature = String.fromCharCode(...bytes);
    if (!signature.startsWith("GIF8")) {
      setWhiteboardStatus("This address is not a direct GIF file. Open it below, then download the GIF and use Upload GIF file.");
      if (fallback) fallback.hidden = false;
      return false;
    }
    await importPixelGif(new File([blob], "copied-website.gif", { type: "image/gif" }));
    return true;
  } catch (error) {
    const invalid = error?.message === "invalid-address";
    setWhiteboardStatus(invalid ? "Enter a complete GIF address beginning with http:// or https://." : "This website prevents Pixel Studio from downloading the GIF directly. Open it below, save the GIF, then use Upload GIF file.");
    if (fallback && !invalid && fallback.href && fallback.getAttribute("href") !== "#") fallback.hidden = false;
    return false;
  } finally {
    if (button) button.disabled = false;
  }
}
async function pastePixelGif() {
  try {
    if (!navigator.clipboard?.read) throw new Error();
    const items = await navigator.clipboard.read();
    for (const item of items) if (item.types.includes("image/gif")) {
      await importPixelGif(await item.getType("image/gif"));
      return;
    }
    for (const item of items) if (item.types.includes("text/html")) {
      const url = gifUrlFromClipboardText(await (await item.getType("text/html")).text(), true);
      if (url) {
        await importPixelGifUrl(url);
        return;
      }
    }
    for (const item of items) if (item.types.includes("text/plain")) {
      const url = gifUrlFromClipboardText(await (await item.getType("text/plain")).text());
      if (url) {
        await importPixelGifUrl(url);
        return;
      }
    }
    if (items.some((item) => item.types.some((type) => type.startsWith("image/")))) setWhiteboardStatus("The website copied only a still picture of the GIF. Copy its image address, or download and upload the GIF.");
    else setWhiteboardStatus("No GIF was found. Copy the GIF or its image address, then paste again.");
  } catch {
    setWhiteboardStatus("Clipboard access was blocked. Press Ctrl+V or Command+V directly in Pixel Studio, or use Upload GIF.");
  }
}
function addPixelSpriteToWhiteboard() {
  const board = whiteboardCanvas();
  if (!board) return;
  const source = pixelFrameCanvas(pixelStudio.pixels, 16).toDataURL("image/png"), image = new Image();
  image.onload = () => {
    pushWhiteboardHistory();
    const size = Math.min(320, board.width * 0.4, board.height * 0.5);
    const object = createWhiteboardObject("image", { x: (board.width - size) / 2, y: (board.height - size) / 2, width: size, height: size, src: source, element: image, pixelArt: true });
    whiteboardObjects.push(object);
    whiteboardSelectedObjectId = object.id;
    renderWhiteboardObjects();
    saveWhiteboard();
    updateWhiteboardHistoryControls();
    setWhiteboardStatus("Pixel sprite added to the whiteboard. It can be moved and resized.");
  };
  image.src = source;
}
async function pixelGifFrameImage() {
  const source = pixelStudio.sourceFrames?.[pixelStudio.frameIndex], treatment = document.querySelector("[data-pixel-photo-treatment]")?.value ?? "natural", image = new Image();
  image.src = source || pixelFrameCanvas(pixelStudio.pixels, 24).toDataURL("image/png");
  await image.decode();
  const longest = Math.max(image.naturalWidth, image.naturalHeight), scale = Math.min(4, Math.max(1, 1200 / longest)), canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.filter = treatment === "smooth" ? "blur(.35px) saturate(1.05)" : treatment === "vivid" ? "contrast(1.12) saturate(1.2)" : "none";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}
async function addPixelGifFrameImageToWhiteboard() {
  const board = whiteboardCanvas();
  if (!board) return;
  const canvas = await pixelGifFrameImage(), source = canvas.toDataURL("image/png"), image = new Image();
  image.onload = () => {
    pushWhiteboardHistory();
    const scale = Math.min(1, board.width * 0.55 / image.naturalWidth, board.height * 0.6 / image.naturalHeight), width = image.naturalWidth * scale, height = image.naturalHeight * scale;
    const object = createWhiteboardObject("image", { x: (board.width - width) / 2, y: (board.height - height) / 2, width, height, src: source, element: image, pixelArt: false });
    whiteboardObjects.push(object);
    whiteboardSelectedObjectId = object.id;
    renderWhiteboardObjects();
    saveWhiteboard();
    updateWhiteboardHistoryControls();
    setWhiteboardStatus("The selected GIF frame was added as a smooth image on the whiteboard.");
  };
  image.src = source;
}
function downloadPixelStudio(source, name) {
  const link = document.createElement("a");
  link.href = source;
  link.download = name;
  link.click();
  if (String(source).startsWith("blob:")) window.setTimeout(() => URL.revokeObjectURL(source), 1e3);
}
function newPixelProject({ confirmFirst = true } = {}) {
  const hasWork = pixelStudio.frames.some((frame) => frame.some((color) => !color.endsWith("00")));
  if (confirmFirst && hasWork && !window.confirm("Start a new Pixel Studio project? Save this project first if you want to keep it.")) return false;
  pixelStudio = { size: 16, bits: 4, frames: [], sourceFrames: [], frameIndex: 0, pixels: [], drawing: false, palette: [...PIXEL_PALETTE, ...PIXEL_8_BIT_PALETTE.slice(16)] };
  pixelStudio.pixels = freshPixelFrame();
  pixelStudio.frames = [[...pixelStudio.pixels]];
  const size = document.querySelector("[data-pixel-size]"), bits = document.querySelector("[data-pixel-bits]"), speed = document.querySelector("[data-pixel-speed]");
  if (size) size.value = "16";
  if (bits) bits.value = "4";
  if (speed) speed.value = "400";
  document.querySelectorAll("[data-pixel-level]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.pixelLevel === "creator")));
  renderPixelStudio();
  startPixelStudioPreview();
  setWhiteboardStatus("A new Creator pixel project is ready.");
  return true;
}
function savePixelProjectFile() {
  saveCurrentPixelFrame();
  const speed = Number(document.querySelector("[data-pixel-speed]")?.value ?? 400), project = { type: "thinkamigbob-pixel-project", version: 1, size: pixelStudio.size, bits: pixelStudio.bits, palette: pixelStudio.palette, frames: pixelStudio.frames, frameIndex: pixelStudio.frameIndex, speed };
  downloadPixelStudio(URL.createObjectURL(new Blob([JSON.stringify(project)], { type: "application/json" })), "pixel-studio-project.json");
  setWhiteboardStatus("Pixel Studio project saved. Open this file later to continue editing.");
}
async function openPixelProjectFile(file) {
  try {
    const project = JSON.parse(await file.text());
    const validSize = [8, 16, 24, 32, 64].includes(project.size), validBits = [1, 2, 4, 8, 24].includes(project.bits), validFrames = Array.isArray(project.frames) && project.frames.length >= 1 && project.frames.length <= 120 && project.frames.every((frame) => Array.isArray(frame) && frame.length === project.size ** 2 && frame.every((color) => /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(color)));
    if (project.type !== "thinkamigbob-pixel-project" || !validSize || !validBits || !validFrames) throw new Error();
    pixelStudio.size = project.size;
    pixelStudio.bits = project.bits;
    pixelStudio.palette = Array.isArray(project.palette) && project.palette.length >= 16 ? [...project.palette.slice(0, 256), ...PIXEL_8_BIT_PALETTE].slice(0, 256) : [...PIXEL_PALETTE, ...PIXEL_8_BIT_PALETTE.slice(16)];
    pixelStudio.frames = project.frames;
    pixelStudio.frameIndex = Math.min(project.frames.length - 1, Math.max(0, Number(project.frameIndex) || 0));
    pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]];
    const size = document.querySelector("[data-pixel-size]"), bits = document.querySelector("[data-pixel-bits]"), speed = document.querySelector("[data-pixel-speed]");
    if (size) size.value = String(pixelStudio.size);
    if (bits) bits.value = String(pixelStudio.bits);
    if (speed) speed.value = String(Math.min(1200, Math.max(100, Number(project.speed) || 400)));
    document.querySelectorAll("[data-pixel-level]").forEach((button) => button.setAttribute("aria-pressed", "false"));
    renderPixelStudio();
    startPixelStudioPreview();
    setWhiteboardStatus(`${pixelStudio.frames.length}-frame Pixel Studio project opened.`);
  } catch {
    setWhiteboardStatus("That file is not a valid Pixel Studio project.");
  }
}
function gifLzw(indices, minimumCodeSize) {
  const clear = 1 << minimumCodeSize, end = clear + 1;
  let codeSize = minimumCodeSize + 1, next = end + 1, dictionary = /* @__PURE__ */ new Map(), bytes = [], currentByte = 0, bit = 0;
  const write = (code) => {
    for (let i = 0; i < codeSize; i += 1) {
      currentByte |= (code >> i & 1) << bit;
      bit += 1;
      if (bit === 8) {
        bytes.push(currentByte);
        currentByte = 0;
        bit = 0;
      }
    }
  };
  const reset = () => {
    dictionary = /* @__PURE__ */ new Map();
    codeSize = minimumCodeSize + 1;
    next = end + 1;
  };
  reset();
  write(clear);
  let prefix = String(indices[0] ?? 0);
  for (let i = 1; i < indices.length; i += 1) {
    const symbol = indices[i], key = `${prefix},${symbol}`;
    if (dictionary.has(key)) prefix = String(dictionary.get(key));
    else {
      write(Number(prefix));
      if (next < 4096) {
        dictionary.set(key, next++);
        if (next === 1 << codeSize && codeSize < 12) codeSize += 1;
      } else {
        write(clear);
        reset();
      }
      prefix = String(symbol);
    }
  }
  write(Number(prefix));
  write(end);
  if (bit) bytes.push(currentByte);
  return bytes;
}
function animatedPixelGif() {
  const palette = [...pixelStudio.palette, ...PIXEL_8_BIT_PALETTE].slice(0, 256), bytes = [], word = (value) => [value & 255, value >> 8 & 255], text = (value) => [...value].map((character) => character.charCodeAt(0)), paletteIndex = (color) => palette.reduce((best, candidate, index) => pixelColorDistance(color, candidate) < pixelColorDistance(color, palette[best]) ? index : best, 0);
  bytes.push(...text("GIF89a"), ...word(pixelStudio.size), ...word(pixelStudio.size), 247, 0, 0);
  palette.forEach((color) => bytes.push(...(color.match(/[\da-f]{2}/gi) ?? ["00", "00", "00"]).map((part) => parseInt(part, 16))));
  bytes.push(33, 255, 11, ...text("NETSCAPE2.0"), 3, 1, 0, 0, 0);
  const delay = Math.max(2, Math.round(Number(document.querySelector("[data-pixel-speed]")?.value ?? 400) / 10));
  pixelStudio.frames.forEach((frame) => {
    const indices = frame.map((color) => color.endsWith("00") ? 1 : paletteIndex(color));
    const compressed = gifLzw(indices, 8);
    bytes.push(33, 249, 4, 4, ...word(delay), 0, 0, 44, 0, 0, 0, 0, ...word(pixelStudio.size), ...word(pixelStudio.size), 0, 8);
    for (let i = 0; i < compressed.length; i += 255) {
      const block = compressed.slice(i, i + 255);
      bytes.push(block.length, ...block);
    }
    bytes.push(0);
  });
  bytes.push(59);
  return URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "image/gif" }));
}
function removeSelectedWhiteboardImageBackground(object) {
  if (object?.type !== "image" || !object.element) return false;
  const source = document.createElement("canvas"), width = object.element.naturalWidth || Math.max(1, Math.round(object.width)), height = object.element.naturalHeight || Math.max(1, Math.round(object.height));
  source.width = width;
  source.height = height;
  const context = source.getContext("2d");
  context.drawImage(object.element, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const red = pixels.data[index], green = pixels.data[index + 1], blue = pixels.data[index + 2];
    const light = (red + green + blue) / 3 > 218, neutral = Math.max(red, green, blue) - Math.min(red, green, blue) < 38;
    if (light && neutral) pixels.data[index + 3] = 0;
  }
  context.putImageData(pixels, 0, 0);
  const result = source.toDataURL("image/png"), image = new Image();
  pushWhiteboardHistory();
  object.src = result;
  object.backgroundRemoved = true;
  object.element = image;
  image.addEventListener("load", () => {
    renderWhiteboardObjects();
    saveWhiteboard();
    updateWhiteboardHistoryControls();
  }, { once: true });
  image.src = result;
  setWhiteboardStatus("Image background removed. The transparent PNG can now be copied or downloaded.");
  if (window.confirm("The image background was removed. Would you like to download the transparent PNG?")) downloadWhiteboardImage(result, "whiteboard-image-no-background.png");
  return true;
}
function pasteWhiteboardClipboard(point = null) {
  if (!whiteboardClipboard) {
    setWhiteboardStatus("Copy or cut a whiteboard object before pasting.");
    return false;
  }
  pushWhiteboardHistory();
  let copy = duplicateWhiteboardObject(whiteboardClipboard);
  if (point) {
    const bounds = objectBounds(copy);
    copy = moveWhiteboardObject(copy, point.x - (bounds.x + bounds.width / 2), point.y - (bounds.y + bounds.height / 2));
  }
  whiteboardObjects.push(copy);
  whiteboardSelectedObjectId = copy.id;
  hydrateWhiteboardImages(() => renderWhiteboardObjects());
  renderWhiteboardObjects();
  saveWhiteboard();
  updateWhiteboardHistoryControls();
  setWhiteboardStatus("Copied image pasted onto the board.");
  return true;
}
function addClipboardImageToWhiteboard(blob, point = null) {
  if (!blob || !String(blob.type).startsWith("image/")) {
    setWhiteboardStatus("The clipboard does not contain an image.");
    return false;
  }
  if (blob.size > 6 * 1024 * 1024) {
    setWhiteboardStatus("The copied image is too large. Use an image smaller than 6 MB.");
    return false;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const canvas = whiteboardCanvas(), image = new Image();
    if (!canvas) return;
    image.addEventListener("load", () => {
      pushWhiteboardHistory();
      const scale = Math.min(canvas.width * 0.7 / image.width, canvas.height * 0.7 / image.height, 1), width = image.width * scale, height = image.height * scale;
      const x = point ? Math.max(0, point.x - width / 2) : (canvas.width - width) / 2, y = point ? Math.max(0, point.y - height / 2) : (canvas.height - height) / 2;
      const object = createWhiteboardObject("image", { x, y, width, height, src: String(reader.result), element: image });
      whiteboardObjects.push(object);
      whiteboardSelectedObjectId = object.id;
      renderWhiteboardObjects(canvas);
      saveWhiteboard(canvas);
      updateWhiteboardHistoryControls();
      setWhiteboardStatus("Copied image pasted onto the board. Drag it to move or resize it.");
    }, { once: true });
    image.src = String(reader.result);
  }, { once: true });
  reader.readAsDataURL(blob);
  return true;
}
async function pasteSystemClipboardImage() {
  if (!navigator.clipboard?.read) {
    setWhiteboardStatus("Use Ctrl+V or Command+V to paste the copied image into the whiteboard.");
    return false;
  }
  try {
    const items = await navigator.clipboard.read();
    const item = items.find((entry) => entry.types.some((type2) => type2.startsWith("image/")));
    const type = item?.types.find((value) => value.startsWith("image/"));
    if (!item || !type) {
      setWhiteboardStatus("Copy an image first, then choose Paste copied image.");
      return false;
    }
    return addClipboardImageToWhiteboard(await item.getType(type));
  } catch {
    setWhiteboardStatus("The browser blocked the Paste button. Press Ctrl+V or Command+V while the whiteboard is open.");
    return false;
  }
}
function cutSelectedWhiteboardObject() {
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (!selected) {
    setWhiteboardStatus("Select a whiteboard object before cutting it.");
    return false;
  }
  whiteboardClipboard = structuredClone(serializableWhiteboardObjects().find((object) => object.id === selected.id));
  pushWhiteboardHistory();
  whiteboardObjects = whiteboardObjects.filter((object) => object.id !== selected.id);
  whiteboardSelectedObjectId = "";
  renderWhiteboardObjects();
  saveWhiteboard();
  updateWhiteboardHistoryControls();
  setWhiteboardStatus("Object cut. Right-click or press Ctrl+V or Command+V to paste it.");
  return true;
}
function duplicateSelectedWhiteboardObject() {
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (!selected) {
    setWhiteboardStatus("Select a whiteboard object before duplicating it.");
    return false;
  }
  pushWhiteboardHistory();
  const copy = duplicateWhiteboardObject(serializableWhiteboardObjects().find((object) => object.id === selected.id));
  whiteboardObjects.push(copy);
  whiteboardSelectedObjectId = copy.id;
  hydrateWhiteboardImages(() => renderWhiteboardObjects());
  renderWhiteboardObjects();
  saveWhiteboard();
  updateWhiteboardHistoryControls();
  setWhiteboardStatus("Selected object duplicated.");
  return true;
}
function deleteSelectedWhiteboardObject() {
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (!selected) {
    setWhiteboardStatus("Select a whiteboard object before deleting it.");
    return false;
  }
  pushWhiteboardHistory();
  whiteboardObjects = whiteboardObjects.filter((object) => object.id !== selected.id);
  whiteboardSelectedObjectId = "";
  renderWhiteboardObjects();
  saveWhiteboard();
  updateWhiteboardHistoryControls();
  setWhiteboardStatus("Selected object deleted. Use Undo to restore it.");
  return true;
}
function formatSelectedWhiteboardText(command) {
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (selected?.type !== "text" || selected.emojiStamp) {
    setWhiteboardStatus("Select a text box before changing its formatting.");
    return false;
  }
  pushWhiteboardHistory();
  selected.richHtml = "";
  if (["bold", "italic", "underline"].includes(command)) selected[command] = !selected[command];
  if (command === "font") selected.fontFamily = document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial";
  if (command === "color") selected.color = document.querySelector("[data-whiteboard-text-color]")?.value ?? "#12384d";
  renderWhiteboardObjects();
  saveWhiteboard();
  updateWhiteboardHistoryControls();
  setWhiteboardStatus("Text formatting updated.");
  return true;
}
function activateWhiteboardTextTool(message = "Text is active. Click anywhere on the whiteboard to start typing.") {
  whiteboardDeleteNextObject = false;
  const tool = document.querySelector("[data-whiteboard-tool]");
  if (tool) {
    tool.value = "text";
    tool.dispatchEvent(new Event("change", { bubbles: true }));
  }
  document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", "false"));
  whiteboardCanvas()?.focus({ preventScroll: true });
  setWhiteboardStatus(message);
}
function connectedWhiteboardObjectIds(seed) {
  if (!seed) return /* @__PURE__ */ new Set();
  const editable = whiteboardObjects.filter((object) => object.strokeStyle !== "eraser");
  const connected = /* @__PURE__ */ new Set([seed.id]);
  const queue = [seed];
  const touches = (first, second) => {
    const a = objectBounds(first), b = objectBounds(second), padding = Math.max(8, Number(first.size ?? 0) / 2, Number(second.size ?? 0) / 2);
    return a.x <= b.x + b.width + padding && a.x + a.width + padding >= b.x && a.y <= b.y + b.height + padding && a.y + a.height + padding >= b.y;
  };
  while (queue.length) {
    const current = queue.shift();
    editable.forEach((candidate) => {
      if (!connected.has(candidate.id) && touches(current, candidate)) {
        connected.add(candidate.id);
        queue.push(candidate);
      }
    });
  }
  return connected;
}
function isAccidentalWhiteboardDot(object) {
  if (!object || object.strokeStyle === "eraser" || object.emojiStamp) return false;
  if (object.type === "path") return (object.points?.length ?? 0) < 2;
  if (["line", "arrow", ...WHITEBOARD_CLOSED_2D_SHAPES, "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(object.type)) return Math.hypot(Number(object.width ?? 0), Number(object.height ?? 0)) < 5;
  return false;
}
function makeWhiteboardObject3D(object, depth = 24) {
  const typeMap = { rectangle: "rectangular-prism", ellipse: "cylinder", triangle: "pyramid" };
  const normalizedDepth = Math.max(10, Math.min(120, Number(depth) || 24));
  return typeMap[object.type] ? { ...object, type: typeMap[object.type], original2DType: object.type, shapeLabel: true, depth: normalizedDepth } : { ...object, original2DType: object.type, extruded3D: true, depth: normalizedDepth };
}
var WHITEBOARD_CLOSED_2D_SHAPES = Object.freeze(["rectangle", "ellipse", "triangle", "diamond", "pentagon", "hexagon", "star"]);
var WHITEBOARD_3D_SHAPES = Object.freeze(["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"]);
function bisectWhiteboardShapeWithLine(line) {
  if (!line || line.type !== "line") return false;
  const x1 = line.x, y1 = line.y, x2 = line.x + line.width, y2 = line.y + line.height;
  if (Math.hypot(x2 - x1, y2 - y1) < 20) return false;
  const lineBounds = { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };
  const candidate = [...whiteboardObjects].reverse().find((object) => {
    if (object.id === line.id || ![...WHITEBOARD_CLOSED_2D_SHAPES, ...WHITEBOARD_3D_SHAPES].includes(object.type)) return false;
    const bounds2 = objectBounds(object);
    if (lineBounds.x > bounds2.x + bounds2.width || lineBounds.x + lineBounds.width < bounds2.x || lineBounds.y > bounds2.y + bounds2.height || lineBounds.y + lineBounds.height < bounds2.y) return false;
    const signed = (x, y) => (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
    const corners = [[bounds2.x, bounds2.y], [bounds2.x + bounds2.width, bounds2.y], [bounds2.x, bounds2.y + bounds2.height], [bounds2.x + bounds2.width, bounds2.y + bounds2.height]].map(([x, y]) => signed(x, y));
    return Math.min(...corners) < 0 && Math.max(...corners) > 0;
  });
  if (!candidate) return false;
  const bounds = objectBounds(candidate), normalizedCut = { x1: (x1 - bounds.x) / bounds.width, y1: (y1 - bounds.y) / bounds.height, x2: (x2 - bounds.x) / bounds.width, y2: (y2 - bounds.y) / bounds.height };
  const base = structuredClone(serializableWhiteboardObjects().find((object) => object.id === candidate.id));
  delete base.id;
  delete base.type;
  const fragments = [-1, 1].map((cutSide) => createWhiteboardObject("shape-fragment", { ...base, sourceType: candidate.type, cutSide, normalizedCut }));
  whiteboardObjects = whiteboardObjects.filter((object) => object.id !== candidate.id && object.id !== line.id);
  whiteboardObjects.push(...fragments);
  whiteboardSelectedObjectId = fragments[0].id;
  return true;
}
function flattenWhiteboard3DShape(object) {
  if (object.type === "shape-fragment") {
    const flatType = { cube: "rectangle", "rectangular-prism": "rectangle", "triangular-prism": "triangle", "hexagonal-prism": "hexagon", cylinder: "ellipse", cone: "triangle", pyramid: "triangle", sphere: "ellipse", hemisphere: "ellipse" }[object.sourceType];
    if (!flatType) return [];
    const restored = { ...object, sourceType: flatType };
    delete restored.original2DType;
    delete restored.shapeLabel;
    delete restored.depth;
    delete restored.extruded3D;
    delete restored.faceColors;
    return [restored];
  }
  if (object.original2DType) {
    const restored = { ...object, type: object.original2DType };
    delete restored.original2DType;
    delete restored.shapeLabel;
    delete restored.depth;
    delete restored.extruded3D;
    return [restored];
  }
  if (!["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(object.type)) return [];
  const { id, type, original2DType, shapeLabel, depth, extruded3D, ...style } = object;
  const bounds = objectBounds(object), gap = 24;
  const part = (partType, values) => createWhiteboardObject(partType, { ...style, rotation: 0, ...values });
  if (["sphere", "hemisphere"].includes(type)) return [part("ellipse", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height })];
  if (type === "triangular-prism") return [part("triangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }), part("triangle", { x: bounds.x + bounds.width + gap, y: bounds.y, width: bounds.width, height: bounds.height })];
  if (type === "hexagonal-prism") return [part("hexagon", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }), part("hexagon", { x: bounds.x + bounds.width + gap, y: bounds.y, width: bounds.width, height: bounds.height })];
  if (type === "cylinder") return [
    part("rectangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }),
    part("ellipse", { x: bounds.x + bounds.width + gap, y: bounds.y, width: bounds.width, height: Math.max(24, bounds.width * 0.42) })
  ];
  if (type === "cone") return [
    part("triangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }),
    part("ellipse", { x: bounds.x + bounds.width + gap, y: bounds.y + bounds.height - Math.max(24, bounds.width * 0.42), width: bounds.width, height: Math.max(24, bounds.width * 0.42) })
  ];
  if (type === "pyramid") return [
    part("triangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }),
    part("rectangle", { x: bounds.x + bounds.width + gap, y: bounds.y + bounds.height - Math.max(36, bounds.height * 0.42), width: bounds.width, height: Math.max(36, bounds.height * 0.42) })
  ];
  const sideWidth = type === "cube" ? bounds.width : Math.max(36, Number(object.depth ?? bounds.width * 0.35));
  return [
    part("rectangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }),
    part("rectangle", { x: bounds.x + bounds.width + gap, y: bounds.y, width: sideWidth, height: bounds.height })
  ];
}
function drawWhiteboardExtrusion(context, object) {
  if (!object.extruded3D) return;
  const depth = Math.max(10, Math.min(48, Number(object.depth ?? 24)));
  const layers = Math.max(5, Math.min(14, Math.ceil(depth / 3)));
  const bounds = objectBounds(object);
  for (let layer = layers; layer >= 1; layer -= 1) {
    const ratio = layer / layers, offset = depth * ratio;
    const gradient = context.createLinearGradient(bounds.x, bounds.y, bounds.x + bounds.width + depth, bounds.y + bounds.height + depth);
    gradient.addColorStop(0, object.faceColors?.top ?? "rgba(255,255,255,0.96)");
    gradient.addColorStop(0.34, object.faceColors?.side ?? object.color ?? "#287da0");
    gradient.addColorStop(1, object.faceColors?.side ?? "#082b3b");
    context.save();
    context.translate(offset, offset);
    context.globalAlpha = 0.055 + 0.045 * ratio;
    context.strokeStyle = gradient;
    context.fillStyle = gradient;
    context.lineWidth = Math.max(2, Number(object.size ?? 6) * 0.72);
    context.lineCap = "round";
    context.lineJoin = "round";
    if (object.type === "path") drawWhiteboardPath(context, { ...object, opacity: 1, extruded3D: false });
    else if (object.type === "line" || object.type === "arrow") {
      context.beginPath();
      context.moveTo(object.x, object.y);
      context.lineTo(object.x + object.width, object.y + object.height);
      context.stroke();
    } else if (object.type === "text") {
      context.translate(object.x + object.width / 2, object.y + object.height / 2);
      context.rotate(object.rotation ?? 0);
      if (whiteboardTextBackground(object.background)) context.fillRect(-object.width / 2 - 8, -object.height / 2 - 5, object.width + 16, object.height + 10);
      context.font = `700 ${object.fontSize ?? 36}px sans-serif`;
      context.fillText(object.text ?? "", -object.width / 2, -object.height / 2 + (object.fontSize ?? 36));
    } else if (WHITEBOARD_CLOSED_2D_SHAPES.includes(object.type)) {
      context.beginPath();
      if (object.type === "rectangle") context.rect(object.x, object.y, object.width, object.height);
      if (object.type === "ellipse") context.ellipse(object.x + object.width / 2, object.y + object.height / 2, Math.abs(object.width / 2), Math.abs(object.height / 2), 0, 0, Math.PI * 2);
      if (object.type === "triangle") {
        context.moveTo(object.x + object.width / 2, object.y);
        context.lineTo(object.x + object.width, object.y + object.height);
        context.lineTo(object.x, object.y + object.height);
        context.closePath();
      }
      if (object.type === "diamond") traceWhiteboardPolygon(context, object, 4);
      if (object.type === "pentagon") traceWhiteboardPolygon(context, object, 5);
      if (object.type === "hexagon") traceWhiteboardPolygon(context, object, 6);
      if (object.type === "star") traceWhiteboardPolygon(context, object, 5, 0.44);
      context.stroke();
    }
    context.restore();
  }
}
function drawWhiteboardShapeFragment(context, object) {
  const bounds = objectBounds(object), cut = object.normalizedCut;
  if (!cut) return;
  const x1 = bounds.x + cut.x1 * bounds.width, y1 = bounds.y + cut.y1 * bounds.height, x2 = bounds.x + cut.x2 * bounds.width, y2 = bounds.y + cut.y2 * bounds.height;
  const dx = x2 - x1, dy = y2 - y1, length = Math.max(1, Math.hypot(dx, dy)), ux = dx / length, uy = dy / length, nx = -uy * object.cutSide, ny = ux * object.cutSide, far = Math.max(4e3, bounds.width * 8, bounds.height * 8);
  context.save();
  context.beginPath();
  context.moveTo(x1 - ux * far, y1 - uy * far);
  context.lineTo(x2 + ux * far, y2 + uy * far);
  context.lineTo(x2 + ux * far + nx * far, y2 + uy * far + ny * far);
  context.lineTo(x1 - ux * far + nx * far, y1 - uy * far + ny * far);
  context.closePath();
  context.clip();
  const source = { ...object, type: object.sourceType };
  if (WHITEBOARD_3D_SHAPES.includes(source.type)) drawWhiteboard3DShape(context, source);
  else {
    context.beginPath();
    if (source.type === "rectangle") context.rect(source.x, source.y, source.width, source.height);
    if (source.type === "ellipse") context.ellipse(source.x + source.width / 2, source.y + source.height / 2, Math.abs(source.width / 2), Math.abs(source.height / 2), 0, 0, Math.PI * 2);
    if (source.type === "triangle") {
      context.moveTo(source.x + source.width / 2, source.y);
      context.lineTo(source.x + source.width, source.y + source.height);
      context.lineTo(source.x, source.y + source.height);
      context.closePath();
    }
    if (source.type === "diamond") traceWhiteboardPolygon(context, source, 4);
    if (source.type === "pentagon") traceWhiteboardPolygon(context, source, 5);
    if (source.type === "hexagon") traceWhiteboardPolygon(context, source, 6);
    if (source.type === "star") traceWhiteboardPolygon(context, source, 5, 0.44);
    if (source.fillColor) {
      context.fillStyle = source.fillColor;
      context.fill();
    }
    context.stroke();
  }
  context.restore();
  context.save();
  context.strokeStyle = object.color ?? "#12384d";
  context.lineWidth = object.size ?? 6;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
}
function whiteboardFragmentCutSegment(object) {
  const bounds = objectBounds(object), cut = object.normalizedCut;
  if (!bounds || !cut) return null;
  const start = { x: bounds.x + cut.x1 * bounds.width, y: bounds.y + cut.y1 * bounds.height };
  const end = { x: bounds.x + cut.x2 * bounds.width, y: bounds.y + cut.y2 * bounds.height };
  const dx = end.x - start.x, dy = end.y - start.y;
  if (Math.hypot(dx, dy) < 1) return null;
  const points = [];
  const add = (t) => {
    const point = { x: start.x + dx * t, y: start.y + dy * t };
    if (point.x >= bounds.x - 0.5 && point.x <= bounds.x + bounds.width + 0.5 && point.y >= bounds.y - 0.5 && point.y <= bounds.y + bounds.height + 0.5 && !points.some((item) => Math.hypot(item.x - point.x, item.y - point.y) < 1)) points.push(point);
  };
  if (Math.abs(dx) > 1e-3) {
    add((bounds.x - start.x) / dx);
    add((bounds.x + bounds.width - start.x) / dx);
  }
  if (Math.abs(dy) > 1e-3) {
    add((bounds.y - start.y) / dy);
    add((bounds.y + bounds.height - start.y) / dy);
  }
  if (points.length < 2) return null;
  let pair = [points[0], points[1]], greatest = 0;
  points.forEach((first) => points.forEach((second) => {
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    if (distance > greatest) {
      greatest = distance;
      pair = [first, second];
    }
  }));
  return { start: pair[0], end: pair[1], length: greatest };
}
function whiteboardRulerLocalPoint(point) {
  const dx = point.x - whiteboardRuler.x, dy = point.y - whiteboardRuler.y, cosine = Math.cos(-whiteboardRuler.angle), sine = Math.sin(-whiteboardRuler.angle);
  return { x: dx * cosine - dy * sine, y: dx * sine + dy * cosine };
}
function whiteboardResizeCorner(bounds, point) {
  const corners = { nw: { x: bounds.x, y: bounds.y }, ne: { x: bounds.x + bounds.width, y: bounds.y }, sw: { x: bounds.x, y: bounds.y + bounds.height }, se: { x: bounds.x + bounds.width, y: bounds.y + bounds.height } };
  return Object.entries(corners).find(([, corner]) => Math.hypot(point.x - corner.x, point.y - corner.y) <= 22)?.[0] ?? "";
}
function resizeWhiteboardObjectFromCorner(object, corner, dx, dy) {
  const bounds = objectBounds(object);
  let left = bounds.x, top = bounds.y, right = bounds.x + bounds.width, bottom = bounds.y + bounds.height;
  if (corner.includes("w")) left = Math.min(right - 12, left + dx);
  if (corner.includes("e")) right = Math.max(left + 12, right + dx);
  if (corner.includes("n")) top = Math.min(bottom - 12, top + dy);
  if (corner.includes("s")) bottom = Math.max(top + 12, bottom + dy);
  if (["ellipse", "sphere", "hemisphere", "cube"].includes(object.type)) {
    const side = Math.max(12, Math.max(right - left, bottom - top));
    if (corner.includes("w")) left = right - side;
    else right = left + side;
    if (corner.includes("n")) top = bottom - side;
    else bottom = top + side;
  }
  let resized = resizeWhiteboardObject(object, right - left, bottom - top);
  if (object.type === "path") resized = moveWhiteboardObject(resized, left - bounds.x, top - bounds.y);
  else resized = { ...resized, x: left, y: top, width: right - left, height: bottom - top };
  if (object.type === "text" && !object.emojiStamp) resized.textScale = Math.max(0.25, Math.min(4, (object.textScale ?? 1) * ((bottom - top) / Math.max(12, bounds.height))));
  return resized;
}
function drawWhiteboardSelectionMeasurements(context, object) {
  const bounds = objectBounds(object);
  if (!bounds) return;
  const centerX = bounds.x + bounds.width / 2, centerY = bounds.y + bounds.height / 2;
  context.save();
  context.strokeStyle = "#b52222";
  context.fillStyle = "#b52222";
  context.lineWidth = 2.5;
  context.font = "800 16px sans-serif";
  const label = (text, x, y) => {
    const width = context.measureText(text).width + 12;
    context.fillStyle = "rgba(255,255,255,0.96)";
    context.fillRect(x - width / 2, y - 16, width, 22);
    context.strokeStyle = "rgba(181,34,34,0.35)";
    context.strokeRect(x - width / 2, y - 16, width, 22);
    context.fillStyle = "#b52222";
    context.fillText(text, x - width / 2 + 6, y);
  };
  if (object.type === "shape-fragment") {
    const segment = whiteboardFragmentCutSegment(object);
    if (segment) {
      const dx = segment.end.x - segment.start.x, dy = segment.end.y - segment.start.y, length = Math.max(1, segment.length);
      const normal = { x: -dy / length * 26 * object.cutSide, y: dx / length * 26 * object.cutSide };
      const acuteAngle = Math.max(1, Math.min(89, Math.round(Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI)));
      label(`${acuteAngle}\xB0`, segment.start.x + normal.x, segment.start.y + normal.y);
      label(`${180 - acuteAngle}\xB0`, segment.end.x + normal.x, segment.end.y + normal.y);
    }
    if (["ellipse", "cylinder", "sphere", "hemisphere", "cone"].includes(object.sourceType)) {
      const radius = Math.min(bounds.width, bounds.height) / 2;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(centerX + radius, centerY);
      context.stroke();
      context.beginPath();
      context.arc(centerX, centerY, 4, 0, Math.PI * 2);
      context.fill();
      label(`r = ${Math.round(radius)}`, centerX + radius / 2, centerY - 12);
    }
    context.restore();
    return;
  }
  if (["ellipse", "sphere", "hemisphere"].includes(object.type)) {
    const radius = Math.min(bounds.width, bounds.height) / 2;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + radius, centerY);
    context.stroke();
    context.beginPath();
    context.arc(centerX, centerY, 4, 0, Math.PI * 2);
    context.fill();
    label(`r = ${Math.round(radius)}`, centerX + radius / 2, centerY - 12);
  }
  if (["cylinder", "cone"].includes(object.type)) {
    const radius = bounds.width / 2;
    label(`r = ${Math.round(radius)}`, centerX, bounds.y + bounds.height + 34);
  }
  if (["triangle", "pyramid", "cone", "triangular-prism"].includes(object.type)) {
    const points = [{ x: 0, y: -bounds.height / 2 }, { x: bounds.width / 2, y: bounds.height / 2 }, { x: -bounds.width / 2, y: bounds.height / 2 }];
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const angleAt = (a, b, c) => Math.acos(Math.max(-1, Math.min(1, (distance(a, b) ** 2 + distance(a, c) ** 2 - distance(b, c) ** 2) / (2 * distance(a, b) * distance(a, c))))) * 180 / Math.PI;
    context.translate(centerX, centerY);
    context.rotate(object.rotation ?? 0);
    points.forEach((point, index) => {
      const degrees = Math.round(angleAt(point, points[(index + 1) % 3], points[(index + 2) % 3]));
      const length = Math.max(1, Math.hypot(point.x, point.y));
      const outwardX = point.x / length * 32, outwardY = point.y / length * 32;
      label(`${degrees}\xB0`, point.x + outwardX, point.y + outwardY);
    });
  } else if (["rectangle", "cube", "rectangular-prism"].includes(object.type)) {
    context.translate(centerX, centerY);
    context.rotate(object.rotation ?? 0);
    label("90\xB0", -bounds.width / 2 - 24, -bounds.height / 2 - 16);
    label("90\xB0", bounds.width / 2 + 24, bounds.height / 2 + 28);
  } else if (["diamond", "pentagon", "hexagon", "star", "hexagonal-prism"].includes(object.type)) {
    const sideCount = object.type === "diamond" ? 4 : object.type === "pentagon" ? 5 : object.type === "star" ? 10 : 6;
    const innerRatio = object.type === "star" ? 0.44 : 1;
    const points = Array.from({ length: sideCount }, (_, index) => {
      const scale = object.type === "star" && index % 2 ? innerRatio : 1, angle = -Math.PI / 2 + index * Math.PI * 2 / sideCount;
      return { x: Math.cos(angle) * bounds.width / 2 * scale, y: Math.sin(angle) * bounds.height / 2 * scale };
    });
    const angleAt = (previous, point, next) => {
      const a = Math.atan2(previous.y - point.y, previous.x - point.x), b = Math.atan2(next.y - point.y, next.x - point.x);
      let degrees = Math.abs((b - a) * 180 / Math.PI);
      if (degrees > 180) degrees = 360 - degrees;
      return Math.round(degrees);
    };
    context.translate(centerX, centerY);
    context.rotate(object.rotation ?? 0);
    points.forEach((point, index) => {
      const length = Math.max(1, Math.hypot(point.x, point.y)), offset = object.type === "star" && index % 2 ? 20 : 32;
      label(`${angleAt(points[(index + points.length - 1) % points.length], point, points[(index + 1) % points.length])}\xB0`, point.x + point.x / length * offset, point.y + point.y / length * offset);
    });
  }
  const rotationDegrees = Math.round((object.rotation ?? 0) * 180 / Math.PI);
  if (rotationDegrees && [...WHITEBOARD_CLOSED_2D_SHAPES, "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(object.type)) {
    context.restore();
    context.save();
    context.strokeStyle = "#b52222";
    context.fillStyle = "#b52222";
    context.lineWidth = 2.5;
    context.font = "800 16px sans-serif";
    const radius = Math.max(bounds.width, bounds.height) / 2 + 24;
    context.beginPath();
    context.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (object.rotation ?? 0));
    context.stroke();
    label(`${rotationDegrees}\xB0`, centerX, centerY - radius - 14);
  }
  context.restore();
}
function renderWhiteboardObjects(canvas = whiteboardCanvas()) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (whiteboardBackground.type === "gradient") {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, whiteboardBackground.color1);
    gradient.addColorStop(1, whiteboardBackground.color2);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    context.fillStyle = whiteboardBackground.type === "solid" ? whiteboardBackground.color1 : "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (whiteboardBackground.type === "image" && whiteboardBackground.element) context.drawImage(whiteboardBackground.element, 0, 0, canvas.width, canvas.height);
  drawWhiteboardGrid(context, canvas);
  for (const object of whiteboardObjects) {
    drawWhiteboardExtrusion(context, object);
    context.save();
    context.globalAlpha = object.opacity ?? 1;
    context.strokeStyle = object.faceColors?.front ?? object.color ?? "#12384d";
    context.fillStyle = object.faceColors?.front ?? object.color ?? "#12384d";
    context.lineWidth = object.size ?? 6;
    context.lineCap = "round";
    context.lineJoin = "round";
    if (object.rotation && !["text", "image", "path", "dimension"].includes(object.type)) {
      const bounds = objectBounds(object), centerX = bounds.x + bounds.width / 2, centerY = bounds.y + bounds.height / 2;
      context.translate(centerX, centerY);
      context.rotate(object.rotation);
      context.translate(-centerX, -centerY);
    }
    if (object.type === "path") drawWhiteboardPath(context, object);
    else if (object.type === "text") {
      const angle = object.rotation ?? 0, background = whiteboardTextBackground(object.background), textScale = object.textScale ?? 1;
      context.translate(object.x + object.width / 2, object.y + object.height / 2);
      context.rotate(angle);
      if (background) {
        context.fillStyle = background;
        context.fillRect(-object.width / 2 - 8, -object.height / 2 - 5, object.width + 16, object.height + 10);
      }
      drawWhiteboardCursiveGuides(context, object);
      let cursorX = -object.width / 2;
      const baseline = object.height / 2 - Math.max(3, (object.fontSize ?? 36) * textScale * 0.12);
      whiteboardRichTextRuns(object.richHtml, object.text, object.fontSize, object.background === "black" ? "#ffffff" : object.color, object.fontFamily ?? "Arial").forEach((run) => {
        const runSize = run.size * textScale, runFont = run.fontFamily || object.fontFamily || "Arial";
        context.font = `${object.italic || run.italic ? "italic " : ""}${object.bold || run.bold ? "700" : "400"} ${runSize}px "${runFont}"`;
        context.fillStyle = run.color;
        context.fillText(run.text, cursorX, baseline);
        const width = context.measureText(run.text).width;
        if (object.underline || run.underline) context.fillRect(cursorX, baseline + 3, width, Math.max(1.5, runSize / 18));
        cursorX += width;
      });
    } else if (object.type === "image" && object.element) {
      context.translate(object.x + object.width / 2, object.y + object.height / 2);
      context.rotate(object.rotation ?? 0);
      context.drawImage(object.element, -object.width / 2, -object.height / 2, object.width, object.height);
    } else if (object.type === "youtube") {
      context.fillStyle = "#111820";
      context.fillRect(object.x, object.y, object.width, object.height);
      context.strokeStyle = "#ffffff";
      context.lineWidth = 4;
      context.strokeRect(object.x + 2, object.y + 2, object.width - 4, object.height - 4);
      context.fillStyle = "#ff0033";
      context.beginPath();
      context.roundRect(object.x + object.width / 2 - 42, object.y + object.height / 2 - 30, 84, 60, 14);
      context.fill();
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.moveTo(object.x + object.width / 2 - 10, object.y + object.height / 2 - 18);
      context.lineTo(object.x + object.width / 2 + 22, object.y + object.height / 2);
      context.lineTo(object.x + object.width / 2 - 10, object.y + object.height / 2 + 18);
      context.closePath();
      context.fill();
    } else if (object.type === "dimension") drawWhiteboardDimension(context, object);
    else if (object.type === "line" || object.type === "arrow") {
      context.beginPath();
      context.moveTo(object.x, object.y);
      context.lineTo(object.x + object.width, object.y + object.height);
      context.stroke();
      if (object.type === "arrow") {
        const angle = Math.atan2(object.height, object.width);
        context.beginPath();
        context.moveTo(object.x + object.width, object.y + object.height);
        context.lineTo(object.x + object.width - 18 * Math.cos(angle - 0.55), object.y + object.height - 18 * Math.sin(angle - 0.55));
        context.moveTo(object.x + object.width, object.y + object.height);
        context.lineTo(object.x + object.width - 18 * Math.cos(angle + 0.55), object.y + object.height - 18 * Math.sin(angle + 0.55));
        context.stroke();
      }
    } else if (object.type === "shape-fragment") drawWhiteboardShapeFragment(context, object);
    else if (WHITEBOARD_3D_SHAPES.includes(object.type)) drawWhiteboard3DShape(context, object);
    else {
      context.beginPath();
      if (object.type === "rectangle") context.rect(object.x, object.y, object.width, object.height);
      if (object.type === "ellipse") context.ellipse(object.x + object.width / 2, object.y + object.height / 2, Math.abs(object.width / 2), Math.abs(object.height / 2), 0, 0, Math.PI * 2);
      if (object.type === "triangle") {
        context.moveTo(object.x + object.width / 2, object.y);
        context.lineTo(object.x + object.width, object.y + object.height);
        context.lineTo(object.x, object.y + object.height);
        context.closePath();
      }
      if (object.type === "diamond") traceWhiteboardPolygon(context, object, 4);
      if (object.type === "pentagon") traceWhiteboardPolygon(context, object, 5);
      if (object.type === "hexagon") traceWhiteboardPolygon(context, object, 6);
      if (object.type === "star") traceWhiteboardPolygon(context, object, 5, 0.44);
      if (object.fillColor && !object.extruded3D) {
        context.fillStyle = object.fillColor;
        context.fill();
      }
      context.stroke();
    }
    context.restore();
  }
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (selected) {
    const bounds = objectBounds(selected);
    context.save();
    context.setLineDash([8, 6]);
    context.strokeStyle = "#087ba0";
    context.lineWidth = 3;
    context.strokeRect(bounds.x - 6, bounds.y - 6, bounds.width + 12, bounds.height + 12);
    context.setLineDash([]);
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#087ba0";
    context.lineWidth = 3;
    [[bounds.x, bounds.y], [bounds.x + bounds.width, bounds.y], [bounds.x, bounds.y + bounds.height], [bounds.x + bounds.width, bounds.y + bounds.height]].forEach(([x, y]) => {
      context.fillRect(x - 7, y - 7, 14, 14);
      context.strokeRect(x - 7, y - 7, 14, 14);
    });
    context.restore();
    drawWhiteboardSelectionMeasurements(context, selected);
  }
  drawWhiteboardTitleBar(context, canvas);
  drawWhiteboardRuler(context, canvas);
  drawWhiteboardLaserPreview(context);
  if (whiteboardLassoPoints.length) {
    context.save();
    context.beginPath();
    whiteboardLassoPoints.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    if (whiteboardLassoPoints.length > 2 && !whiteboardDrawing) context.closePath();
    context.setLineDash([10, 7]);
    context.strokeStyle = "#d31324";
    context.lineWidth = 3;
    context.shadowColor = "#ffffff";
    context.shadowBlur = 4;
    context.stroke();
    context.restore();
  }
  syncWhiteboardYouTubeOverlays(canvas);
}
function hydrateWhiteboardImages(after = null) {
  const images = whiteboardObjects.filter((object) => object.type === "image" && object.src && !object.element);
  if (!images.length) {
    after?.();
    return;
  }
  let remaining = images.length;
  images.forEach((object) => {
    const image = new Image();
    image.onload = () => {
      object.element = image;
      remaining -= 1;
      if (!remaining) after?.();
    };
    image.src = object.src;
  });
}
function applyWhiteboardZoom(canvas = whiteboardCanvas()) {
  if (!canvas) return;
  canvas.style.width = `${whiteboardZoom}%`;
  canvas.style.height = `${whiteboardZoom}%`;
  const output = document.querySelector("[data-whiteboard-zoom-output]");
  const control = document.querySelector("[data-whiteboard-zoom]");
  if (output) output.textContent = `${whiteboardZoom}%`;
  if (control) control.value = String(whiteboardZoom);
}
function applyWhiteboardControlsLayout({ resizeCanvas = false } = {}) {
  const display = document.querySelector("#platform-classroom-whiteboard");
  if (!display) return;
  display.dataset.controlsDock = whiteboardControlsDock;
  display.dataset.controlsHidden = String(whiteboardControlsHidden);
  display.dataset.pageDock = whiteboardPageDock;
  const dock = display.querySelector("[data-whiteboard-controls-dock]");
  if (dock) dock.value = whiteboardControlsDock;
  const pageDock = display.querySelector("[data-whiteboard-page-dock]");
  if (pageDock) pageDock.value = whiteboardPageDock;
  const toggle = display.querySelector('[data-action="whiteboard-toggle-controls"]');
  if (toggle) {
    toggle.textContent = whiteboardControlsHidden ? "Show Board Menus" : "Hide Board Menus";
    toggle.setAttribute("aria-expanded", String(!whiteboardControlsHidden));
  }
  if (resizeCanvas) window.requestAnimationFrame(() => {
    const canvas = whiteboardCanvas(), surface = canvas?.parentElement;
    if (!canvas || !surface) return;
    canvas.width = Math.max(900, Math.round(surface.clientWidth || 900));
    canvas.height = Math.max(520, Math.round(surface.clientHeight || 520));
    renderWhiteboardObjects(canvas);
    applyWhiteboardZoom(canvas);
  });
}
function mountWhiteboard() {
  const canvas = whiteboardCanvas();
  if (!canvas || canvas.dataset.mounted === "true") return;
  canvas.dataset.mounted = "true";
  const quickActions = document.querySelector(".platform-whiteboard-quick-actions");
  const drawingToolbar = document.querySelector(".platform-whiteboard-toolbar");
  if (quickActions && drawingToolbar) {
    const selectPanel = quickActions.querySelector("[data-whiteboard-select-panel]");
    const penPanel = quickActions.querySelector("[data-whiteboard-pen-panel]");
    const textPanel = quickActions.querySelector("[data-whiteboard-text-panel]");
    const emojiPanel = quickActions.querySelector("[data-whiteboard-emoji-panel]");
    const measurePanel = quickActions.querySelector("[data-whiteboard-measure-panel]");
    const morePanel = quickActions.querySelector("[data-whiteboard-more-panel]");
    const measurementControls = [
      drawingToolbar.querySelector("[data-whiteboard-grid]")?.closest("label"),
      drawingToolbar.querySelector("[data-whiteboard-ruler]")?.closest("label"),
      drawingToolbar.querySelector('[data-whiteboard-quick-tool="ruler-adjust"]'),
      drawingToolbar.querySelector("[data-whiteboard-ruler-sides]")?.closest("label"),
      drawingToolbar.querySelector("[data-whiteboard-compare-unit]"),
      drawingToolbar.querySelector("[data-whiteboard-zoom]")?.closest("label")
    ].filter(Boolean);
    const selectControls = [drawingToolbar.querySelector("[data-whiteboard-image]")?.closest("label"), drawingToolbar.querySelector(".platform-whiteboard-youtube-control"), drawingToolbar.querySelector(".platform-whiteboard-object-actions"), drawingToolbar.querySelector("[data-whiteboard-lasso-actions]")].filter(Boolean);
    const shapeControls = [drawingToolbar.querySelector(".platform-whiteboard-push-help-wrap")].filter(Boolean);
    const colorControls = [drawingToolbar.querySelector("[data-whiteboard-color]")?.closest("label")].filter(Boolean);
    const penControls = [drawingToolbar.querySelector("[data-whiteboard-size]")?.closest("label")].filter(Boolean);
    const textControls = [drawingToolbar.querySelector("[data-whiteboard-text-background]")?.closest("label"), drawingToolbar.querySelector("[data-whiteboard-cursive-lines]")?.closest("label"), drawingToolbar.querySelector("[data-whiteboard-cursive-coach]")?.closest("label"), drawingToolbar.querySelector("[data-whiteboard-touch-practice]")?.closest("label")].filter(Boolean);
    const emojiControls = [drawingToolbar.querySelector("[data-whiteboard-emoji-label]")].filter(Boolean);
    drawingToolbar.querySelectorAll('[data-action="whiteboard-undo"], [data-action="whiteboard-redo"]').forEach((button) => button.remove());
    selectPanel?.append(...selectControls);
    document.querySelector("[data-whiteboard-shapes-panel]")?.append(...shapeControls);
    document.querySelector("[data-whiteboard-color-panel]")?.append(...colorControls);
    penPanel?.append(...penControls);
    textPanel?.append(...textControls);
    emojiPanel?.append(...emojiControls);
    measurePanel?.append(...measurementControls);
    morePanel?.append(...drawingToolbar.children);
    drawingToolbar.remove();
  }
  document.querySelectorAll(".platform-whiteboard-quick-menu").forEach((menu) => {
    let closeTimer = null;
    const cancelClose = () => {
      if (closeTimer) window.clearTimeout(closeTimer);
      closeTimer = null;
    };
    const scheduleClose = () => {
      cancelClose();
      closeTimer = window.setTimeout(() => {
        if (!menu.matches(":hover, :focus-within")) menu.removeAttribute("open");
      }, 300);
    };
    menu.addEventListener("mouseenter", () => {
      cancelClose();
      menu.open = true;
    });
    menu.addEventListener("mouseleave", scheduleClose);
    menu.addEventListener("focusout", scheduleClose);
    menu.querySelector("summary")?.addEventListener("click", () => {
      const primaryTool = menu.dataset.whiteboardPrimaryTool;
      if (!primaryTool) return;
      if (primaryTool !== "text") cancelPendingWhiteboardTextEntry();
      whiteboardDeleteNextObject = false;
      const tool = document.querySelector("[data-whiteboard-tool]");
      if (tool) {
        tool.value = primaryTool;
        tool.dispatchEvent(new Event("change", { bubbles: true }));
      }
      document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === primaryTool)));
      whiteboardCanvas()?.focus({ preventScroll: true });
      setWhiteboardStatus(primaryTool === "select" ? "Select and move is active." : primaryTool === "text" ? "Text is active. Click anywhere on the whiteboard to start typing." : "Pen is active. Drag anywhere on the whiteboard to draw.");
    });
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;
      document.querySelectorAll(".platform-whiteboard-quick-menu[open]").forEach((other) => {
        if (other !== menu) other.removeAttribute("open");
      });
      const bounds = menu.querySelector("summary")?.getBoundingClientRect();
      const panel = menu.querySelector(":scope > div");
      if (bounds && panel) {
        const panelWidth = Math.min(menu.matches("[data-whiteboard-more-menu]") ? 448 : 240, window.innerWidth - 16);
        menu.style.setProperty("--quick-menu-left", `${Math.max(8, Math.min(window.innerWidth - panelWidth - 8, bounds.left))}px`);
        menu.style.setProperty("--quick-menu-top", `${bounds.bottom - 1}px`);
      }
    });
  });
  const surface = canvas.parentElement;
  canvas.width = Math.max(900, Math.round(surface.clientWidth || 900));
  canvas.height = Math.max(520, Math.round(surface.clientHeight || 520));
  try {
    const pageState = JSON.parse(window.sessionStorage.getItem(WHITEBOARD_PAGES_SESSION_KEY) ?? "null");
    if (Array.isArray(pageState?.pages) && pageState.pages.length) {
      whiteboardPages = pageState.pages.map((page, index) => ({ id: page.id || `page-${index}`, title: String(page.title || `Page ${index + 1}`).slice(0, 40), objects: Array.isArray(page.objects) ? page.objects : [] }));
      whiteboardCurrentPageIndex = Math.min(Math.max(0, Number(pageState.currentPageIndex) || 0), whiteboardPages.length - 1);
      whiteboardObjects = structuredClone(whiteboardPages[whiteboardCurrentPageIndex].objects);
    } else {
      whiteboardObjects = JSON.parse(window.sessionStorage.getItem(WHITEBOARD_OBJECT_SESSION_KEY) ?? "[]");
      whiteboardPages = [{ ...newWhiteboardPage("Page 1"), objects: structuredClone(whiteboardObjects) }];
      whiteboardCurrentPageIndex = 0;
    }
  } catch {
    whiteboardObjects = [];
    whiteboardPages = [newWhiteboardPage("Page 1")];
    whiteboardCurrentPageIndex = 0;
  }
  try {
    const view = JSON.parse(window.sessionStorage.getItem(WHITEBOARD_VIEW_SESSION_KEY) ?? "{}");
    whiteboardGridUnit = ["plain", "inch", "cm", "mm"].includes(view.gridUnit) ? view.gridUnit : "plain";
    whiteboardRulerUnit = ["none", "english", "metric"].includes(view.rulerUnit) ? view.rulerUnit : "none";
    whiteboardZoom = Math.min(300, Math.max(50, Number(view.zoom) || 100));
    whiteboardRuler = view.ruler && typeof view.ruler === "object" ? { ...whiteboardRuler, ...view.ruler } : { ...whiteboardRuler, y: canvas.height - 92 };
    whiteboardDrawingTitle = String(view.title || "Workshop Drawing").slice(0, 60);
    whiteboardControlsDock = ["top", "left", "right", "bottom"].includes(view.controlsDock) ? view.controlsDock : "top";
    whiteboardControlsHidden = Boolean(view.controlsHidden);
    whiteboardPageDock = ["left", "right", "hidden"].includes(view.pageDock) ? view.pageDock : "left";
    if (view.background) whiteboardBackground = { ...whiteboardBackground, ...view.background, element: null };
  } catch {
    whiteboardGridUnit = "plain";
    whiteboardRulerUnit = "none";
    whiteboardZoom = 100;
    whiteboardDrawingTitle = "Workshop Drawing";
    whiteboardControlsDock = "top";
    whiteboardControlsHidden = false;
    whiteboardPageDock = "left";
  }
  if (whiteboardBackground.imageSrc) {
    const backgroundImage = new Image();
    backgroundImage.onload = () => {
      whiteboardBackground.element = backgroundImage;
      renderWhiteboardObjects();
    };
    backgroundImage.src = whiteboardBackground.imageSrc;
  }
  const gridControl = document.querySelector("[data-whiteboard-grid]");
  const rulerControl = document.querySelector("[data-whiteboard-ruler]");
  const rulerSides = document.querySelector("[data-whiteboard-ruler-sides]");
  if (gridControl) gridControl.value = whiteboardGridUnit;
  if (rulerControl) rulerControl.value = whiteboardRulerUnit;
  if (rulerSides) rulerSides.value = whiteboardRuler.sides;
  applyWhiteboardControlsLayout({ resizeCanvas: true });
  applyWhiteboardZoom(canvas);
  if (!whiteboardObjects.length) {
    let legacy = "";
    try {
      legacy = window.sessionStorage.getItem(WHITEBOARD_SESSION_KEY) ?? "";
    } catch {
    }
    if (legacy) whiteboardObjects = [createWhiteboardObject("image", { x: 0, y: 0, width: canvas.width, height: canvas.height, src: legacy })];
  }
  whiteboardObjects = whiteboardObjects.filter((object) => !isAccidentalWhiteboardDot(object));
  if (whiteboardPages[whiteboardCurrentPageIndex]) whiteboardPages[whiteboardCurrentPageIndex].objects = structuredClone(serializableWhiteboardObjects());
  renderWhiteboardPageStrip();
  hydrateWhiteboardImages(() => renderWhiteboardObjects(canvas));
  renderWhiteboardObjects(canvas);
  try {
    if (window.sessionStorage.getItem(WHITEBOARD_BOB_MEASUREMENT_COACH_KEY) === "seen") showWhiteboardBobMeasurementCoach();
  } catch {
  }
  const start = (event) => {
    if (event.button !== void 0 && event.button !== 0) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    const point = whiteboardPoint(event, canvas), tool = document.querySelector("[data-whiteboard-tool]")?.value ?? "select";
    const selected = hitTestObjects(whiteboardObjects.filter((object2) => object2.strokeStyle !== "eraser"), point);
    const activeSelected = whiteboardObjects.find((object2) => object2.id === whiteboardSelectedObjectId);
    const activeResizeCorner = activeSelected && activeSelected.type !== "dimension" ? whiteboardResizeCorner(objectBounds(activeSelected), point) : "";
    if (!whiteboardDeleteNextObject && activeSelected && activeResizeCorner) {
      pushWhiteboardHistory();
      whiteboardDrawing = { tool: "select", objectId: activeSelected.id, start: point, original: cloneEditableWhiteboardObject(activeSelected), resize: true, resizeCorner: activeResizeCorner };
      canvas.setPointerCapture?.(event.pointerId);
      setWhiteboardStatus("Drag the selected corner to resize the object.");
      return;
    }
    if (!selected && whiteboardSelectedObjectId) {
      whiteboardSelectedObjectId = "";
      syncWhiteboardDimensionCompareControl();
      renderWhiteboardObjects(canvas);
    }
    if (whiteboardDeleteNextObject) {
      if (!selected) {
        setWhiteboardStatus("Delete is ready. Click the object you want to remove.");
        return;
      }
      pushWhiteboardHistory();
      whiteboardObjects = whiteboardObjects.filter((object2) => object2.id !== selected.id);
      whiteboardSelectedObjectId = "";
      whiteboardDeleteNextObject = false;
      const selectTool = document.querySelector("[data-whiteboard-tool]");
      if (selectTool) {
        selectTool.value = "select";
        selectTool.dispatchEvent(new Event("change", { bubbles: true }));
      }
      document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === "select")));
      renderWhiteboardObjects(canvas);
      saveWhiteboard(canvas);
      updateWhiteboardHistoryControls();
      setWhiteboardStatus("Object deleted. Select and move is active again.");
      return;
    }
    const directTools = !["lasso-select", "emoji-stamp", "pull-3d", "laser-dimension", "fill", "eraser", "erase-object"].includes(tool);
    if (directTools && whiteboardRulerUnit !== "none") {
      const local = whiteboardRulerLocalPoint(point);
      const nearExtend = Math.hypot(local.x - whiteboardRuler.length, local.y - 31) < 28;
      const nearRotate = Math.hypot(local.x - whiteboardRuler.length, local.y + 24) < 28;
      const onRuler = local.x >= 0 && local.x <= whiteboardRuler.length && local.y >= 0 && local.y <= 62;
      if (nearExtend || nearRotate || onRuler) {
        whiteboardDrawing = { tool: "ruler-adjust", mode: nearRotate ? "rotate" : nearExtend ? "extend" : "move", start: point, originalRuler: structuredClone(whiteboardRuler) };
        canvas.setPointerCapture?.(event.pointerId);
        setWhiteboardStatus("Ruler selected directly. Drag to place it where you want.");
        return;
      }
    }
    if (tool === "text") {
      openWhiteboardTextEntry(point, canvas);
      return;
    }
    if (tool === "lasso-select") {
      whiteboardLassoPoints = [point];
      whiteboardLassoBounds = null;
      whiteboardSelectionDownload = "";
      whiteboardDrawing = { tool, start: point };
      canvas.setPointerCapture?.(event.pointerId);
      renderWhiteboardObjects(canvas);
      setWhiteboardStatus("Drag around the work you want to turn into an image.");
      return;
    }
    if (tool === "emoji-stamp") {
      const emoji = document.querySelector("[data-whiteboard-emoji]")?.value || "\u{1F600}";
      const fontSize = Math.max(42, Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6) * 3);
      pushWhiteboardHistory();
      const stamp = createWhiteboardObject("text", { text: emoji, emojiStamp: true, x: point.x - fontSize / 2, y: point.y - fontSize / 2, width: fontSize * 1.25, height: fontSize * 1.25, fontSize, color: "#12384d", background: "transparent", rotation: 0 });
      whiteboardObjects.push(stamp);
      whiteboardSelectedObjectId = stamp.id;
      renderWhiteboardObjects(canvas);
      saveWhiteboard(canvas);
      updateWhiteboardHistoryControls();
      setWhiteboardStatus(`${emoji} emoji stamped. Drag it to move, resize, rotate, copy, or delete it.`);
      return;
    }
    if (tool === "pull-3d") {
      if (!selected || ![...WHITEBOARD_CLOSED_2D_SHAPES, "text", "path", "line", "arrow"].includes(selected.type) || selected.strokeStyle === "eraser") {
        setWhiteboardStatus("Select a shape, highlighted text box, drawing, or line to make it 3D.");
        return;
      }
      pushWhiteboardHistory();
      whiteboardSelectedObjectId = selected.id;
      whiteboardDrawing = { tool, objectId: selected.id, start: point, original: cloneEditableWhiteboardObject(selected) };
      canvas.setPointerCapture?.(event.pointerId);
      return;
    }
    if (tool === "laser-dimension") {
      if (!whiteboardPendingDimension?.start) {
        whiteboardPendingDimension = { start: point, current: point, attempts: 0 };
        renderWhiteboardObjects(canvas);
        setWhiteboardStatus("Laser point 1 selected. Move the glowing laser to the second point, then select it.");
        return;
      }
      whiteboardPendingDimension.end = point;
      whiteboardPendingDimension.current = point;
      renderWhiteboardObjects(canvas);
      const unit = whiteboardGridUnit === "inch" ? "in" : whiteboardGridUnit === "mm" ? "mm" : "cm";
      const unitControl = document.querySelector("[data-whiteboard-dimension-unit]");
      if (unitControl) unitControl.value = unit;
      const tip = document.querySelector("[data-whiteboard-measurement-tip]");
      if (tip) {
        tip.hidden = true;
        tip.textContent = "";
      }
      const question = document.querySelector("[data-whiteboard-dimension-question]");
      if (question) question.hidden = false;
      setWhiteboardStatus("Two points selected. Answer the measurement question to add the CAD dimension.");
      return;
    }
    if (tool === "ruler-adjust") {
      if (whiteboardRulerUnit === "none") {
        setWhiteboardStatus("Choose an English or metric ruler first.");
        return;
      }
      const local = whiteboardRulerLocalPoint(point);
      const nearExtend = Math.hypot(local.x - whiteboardRuler.length, local.y - 31) < 28;
      const nearRotate = Math.hypot(local.x - whiteboardRuler.length, local.y + 24) < 28;
      if (nearExtend || nearRotate || local.x >= 0 && local.x <= whiteboardRuler.length && local.y >= 0 && local.y <= 62) {
        whiteboardDrawing = { tool, mode: nearRotate ? "rotate" : nearExtend ? "extend" : "move", start: point, originalRuler: structuredClone(whiteboardRuler) };
      }
      return;
    }
    if (tool === "select") {
      whiteboardSelectedObjectId = selected?.id ?? "";
      if (selected) {
        pushWhiteboardHistory();
        const bounds = objectBounds(selected);
        const resizeCorner = selected.type !== "dimension" ? whiteboardResizeCorner(bounds, point) : "";
        whiteboardDrawing = { tool, objectId: selected.id, start: point, original: cloneEditableWhiteboardObject(selected), resize: Boolean(resizeCorner), resizeCorner };
        if (selected.type === "dimension") setWhiteboardStatus("Drag the red measurement to the object perimeter, or choose its comparison unit above.");
      }
      syncWhiteboardDimensionCompareControl();
      renderWhiteboardObjects(canvas);
      return;
    }
    if (tool === "fill") {
      if (selected && [...WHITEBOARD_CLOSED_2D_SHAPES, "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(selected.type)) {
        pushWhiteboardHistory();
        selected.fillColor = document.querySelector("[data-whiteboard-color]")?.value ?? "#12384d";
        whiteboardSelectedObjectId = selected.id;
        renderWhiteboardObjects(canvas);
        saveWhiteboard(canvas);
        setWhiteboardStatus("Shape filled. Use Undo to restore its previous color.");
      } else setWhiteboardStatus("Use the Paint Can on a closed 2D or 3D shape.");
      return;
    }
    if (tool === "erase-object") {
      if (!selected) {
        setWhiteboardStatus("Click a connected drawing, line, or filled shape to erase the whole object.");
        return;
      }
      const connectedIds = connectedWhiteboardObjectIds(selected);
      pushWhiteboardHistory();
      whiteboardObjects = whiteboardObjects.filter((object2) => !connectedIds.has(object2.id));
      whiteboardSelectedObjectId = "";
      renderWhiteboardObjects(canvas);
      saveWhiteboard(canvas);
      updateWhiteboardHistoryControls();
      setWhiteboardStatus(`${connectedIds.size === 1 ? "Object" : "Connected objects"} erased. Use Undo to restore ${connectedIds.size === 1 ? "it" : "them"}.`);
      return;
    }
    if (tool === "eraser") {
      pushWhiteboardHistory();
      const size2 = Number(document.querySelector("[data-whiteboard-eraser-size]")?.value ?? 40);
      const object2 = createWhiteboardObject("path", { points: [point], color: "#ffffff", size: size2, opacity: 1, strokeStyle: "eraser" });
      whiteboardObjects.push(object2);
      whiteboardSelectedObjectId = "";
      whiteboardDrawing = { tool, objectId: object2.id, start: point };
      canvas.setPointerCapture?.(event.pointerId);
      renderWhiteboardObjects(canvas);
      setWhiteboardStatus("Drag the eraser across anything you want to remove.");
      return;
    }
    pushWhiteboardHistory();
    const color = document.querySelector("[data-whiteboard-color]")?.value ?? "#12384d", size = Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6);
    const isDrawingStroke = ["pen", "calligraphy", "brush", "highlighter"].includes(tool);
    const strokeSize = tool === "highlighter" ? size * 2.5 : tool === "brush" ? size * 3 : tool === "calligraphy" ? size * 1.6 : size;
    const object = isDrawingStroke ? createWhiteboardObject("path", { points: [point], color, size: strokeSize, opacity: tool === "highlighter" ? 0.3 : tool === "brush" ? 0.78 : 1, strokeStyle: tool }) : createWhiteboardObject(tool, { x: point.x, y: point.y, width: 1, height: 1, color, size });
    whiteboardObjects.push(object);
    whiteboardSelectedObjectId = object.id;
    whiteboardDrawing = { tool, objectId: object.id, start: point };
    canvas.setPointerCapture?.(event.pointerId);
  };
  const move = (event) => {
    const point = whiteboardPoint(event, canvas);
    if (!whiteboardDrawing) {
      const tool = document.querySelector("[data-whiteboard-tool]")?.value ?? "select";
      if (tool === "laser-dimension" && whiteboardPendingDimension?.start && !whiteboardPendingDimension?.end) {
        whiteboardPendingDimension.current = point;
        renderWhiteboardObjects(canvas);
      }
      return;
    }
    event.preventDefault();
    if (whiteboardDrawing.tool === "lasso-select") {
      whiteboardLassoPoints.push(point);
      renderWhiteboardObjects(canvas);
      return;
    }
    if (whiteboardDrawing.tool === "ruler-adjust") {
      const original = whiteboardDrawing.originalRuler;
      if (whiteboardDrawing.mode === "move") {
        whiteboardRuler.x = original.x + point.x - whiteboardDrawing.start.x;
        whiteboardRuler.y = original.y + point.y - whiteboardDrawing.start.y;
      } else if (whiteboardDrawing.mode === "rotate") whiteboardRuler.angle = Math.atan2(point.y - original.y, point.x - original.x);
      else {
        const dx = point.x - original.x, dy = point.y - original.y;
        whiteboardRuler.length = Math.max(150, Math.min(canvas.width * 1.5, dx * Math.cos(original.angle) + dy * Math.sin(original.angle)));
      }
      renderWhiteboardObjects(canvas);
      return;
    }
    const index = whiteboardObjects.findIndex((object2) => object2.id === whiteboardDrawing.objectId);
    if (index < 0) return;
    const object = whiteboardObjects[index];
    if (whiteboardDrawing.tool === "pull-3d") {
      const depth = Math.max(10, Math.min(120, Math.hypot(point.x - whiteboardDrawing.start.x, point.y - whiteboardDrawing.start.y)));
      whiteboardObjects[index] = makeWhiteboardObject3D(whiteboardDrawing.original, depth);
      renderWhiteboardObjects(canvas);
      return;
    }
    if (whiteboardDrawing.tool === "select") {
      const dx = point.x - whiteboardDrawing.start.x, dy = point.y - whiteboardDrawing.start.y;
      let updated;
      if (whiteboardDrawing.original.type === "dimension" && !whiteboardDrawing.resize) {
        const angle = Math.atan2(whiteboardDrawing.original.height, whiteboardDrawing.original.width);
        updated = { ...whiteboardDrawing.original, annotationOffset: Number(whiteboardDrawing.original.annotationOffset ?? 18) + dx * -Math.sin(angle) + dy * Math.cos(angle) };
      } else updated = whiteboardDrawing.resize ? resizeWhiteboardObjectFromCorner(whiteboardDrawing.original, whiteboardDrawing.resizeCorner, dx, dy) : moveWhiteboardObject(whiteboardDrawing.original, dx, dy);
      if (updated.emojiStamp && whiteboardDrawing.resize) updated.fontSize = Math.max(18, updated.height / 1.25);
      if (object.element) updated.element = object.element;
      whiteboardObjects[index] = updated;
    } else if (object.type === "path") object.points.push(point);
    else {
      object.width = point.x - whiteboardDrawing.start.x;
      object.height = point.y - whiteboardDrawing.start.y;
    }
    renderWhiteboardObjects(canvas);
  };
  const end = () => {
    if (!whiteboardDrawing) return;
    const completedTool = whiteboardDrawing.tool, completedObjectId = whiteboardDrawing.objectId;
    whiteboardDrawing = null;
    if (completedTool === "lasso-select") {
      updateWhiteboardLassoBounds();
      renderWhiteboardObjects(canvas);
      const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]");
      if (whiteboardLassoBounds && dialog) {
        dialog.hidden = false;
        dialog.querySelector('[data-action="whiteboard-lasso-use"]')?.focus();
      }
      setWhiteboardStatus(whiteboardLassoBounds ? "Cutout ready. Choose whether to use it or delete the selected image." : "Draw a larger loop around the work you want to select.");
      return;
    }
    const completedObject = whiteboardObjects.find((object) => object.id === completedObjectId);
    if (completedTool === "line" && bisectWhiteboardShapeWithLine(completedObject)) {
      renderWhiteboardObjects(canvas);
      saveWhiteboard(canvas);
      updateWhiteboardHistoryControls();
      setWhiteboardStatus("Shape divided into two independently editable objects along the line.");
      return;
    }
    if (isAccidentalWhiteboardDot(completedObject)) {
      whiteboardObjects = whiteboardObjects.filter((object) => object.id !== completedObjectId);
      whiteboardSelectedObjectId = "";
      renderWhiteboardObjects(canvas);
      saveWhiteboard(canvas);
      setWhiteboardStatus("No mark added. Drag on the board to draw a line or shape.");
      return;
    }
    saveWhiteboard(canvas);
    setWhiteboardStatus(completedTool === "eraser" ? "Eraser stroke saved. Use Undo to restore the erased area." : "Board saved. Select any object to move, resize, copy, or delete it.");
  };
  canvas.addEventListener("pointerdown", start);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("dblclick", (event) => {
    const selected = hitTestObjects(whiteboardObjects.filter((object) => object.strokeStyle !== "eraser"), whiteboardPoint(event, canvas));
    if (selected?.type === "text" && !selected.emojiStamp) {
      event.preventDefault();
      whiteboardSelectedObjectId = selected.id;
      openWhiteboardRichTextEditor(selected, canvas);
    }
  });
  canvas.addEventListener("contextmenu", (event) => {
    const point = whiteboardPoint(event, canvas), selected = hitTestObjects(whiteboardObjects.filter((object) => object.strokeStyle !== "eraser"), point);
    if (!selected && !whiteboardClipboard) return;
    event.preventDefault();
    whiteboardContextPoint = point;
    if (selected) {
      whiteboardSelectedObjectId = selected.id;
      syncWhiteboardDimensionCompareControl();
      renderWhiteboardObjects(canvas);
    }
    const menu = document.querySelector("[data-whiteboard-context-menu]");
    if (menu) {
      menu.hidden = false;
      menu.style.left = `${Math.min(event.clientX, window.innerWidth - 180)}px`;
      menu.style.top = `${Math.min(event.clientY, window.innerHeight - 170)}px`;
      menu.querySelector('[data-action="whiteboard-copy-image"]').disabled = !selected;
      menu.querySelector('[data-action="whiteboard-cut-image"]').disabled = !selected;
      menu.querySelector('[data-action="whiteboard-paste-image"]').disabled = !whiteboardClipboard;
      menu.querySelector("button:not([disabled])")?.focus();
    }
    setWhiteboardStatus(selected ? "Object selected. Choose Copy Image, Cut Image, or Paste Image." : "Choose Paste Image to place the copied object here.");
  });
  updateWhiteboardHistoryControls();
}
function stopVoiceMeter(message = "Voice Meter stopped. No audio was saved.") {
  if (voiceMeterAnimationFrame) window.cancelAnimationFrame(voiceMeterAnimationFrame);
  voiceMeterAnimationFrame = null;
  voiceMeterStream?.getTracks().forEach((track) => track.stop());
  voiceMeterStream = null;
  if (voiceMeterAudioContext && voiceMeterAudioContext.state !== "closed") void voiceMeterAudioContext.close();
  voiceMeterAudioContext = null;
  recordVoiceMeterUse();
  document.querySelectorAll("[data-student-voice-meter]").forEach((meter) => {
    meter.hidden = true;
  });
  document.querySelectorAll('[data-action="voice-meter-start"]').forEach((button) => {
    button.disabled = false;
  });
  document.querySelectorAll('[data-action="voice-meter-stop"]').forEach((button) => {
    button.disabled = true;
  });
  const status = document.querySelector("[data-voice-meter-status]");
  if (status) status.textContent = message;
  document.querySelectorAll("[data-live-voice-status]").forEach((label) => {
    label.dataset.state = "off";
    label.innerHTML = `<span aria-hidden="true"></span> Voice Meter is off`;
  });
  voiceBobState = "green";
  voiceBobStateChangedAt = 0;
  floatingBobGreenSince = Date.now();
  updateVoiceMeterPresentation(0);
  refreshCurrentClassPlan();
}
async function startVoiceMeter() {
  const status = document.querySelector("[data-voice-meter-status]");
  if (!navigator.mediaDevices?.getUserMedia) {
    if (status) status.textContent = "Voice Meter is not supported in this browser. Open the platform in Chrome.";
    return;
  }
  if (status) status.textContent = "Requesting microphone permission\u2026";
  try {
    voiceMeterStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceBobStateChangedAt = 0;
    floatingBobGreenSince = Date.now();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    voiceMeterAudioContext = new AudioContextClass();
    const analyser = voiceMeterAudioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.72;
    voiceMeterAudioContext.createMediaStreamSource(voiceMeterStream).connect(analyser);
    beginVoiceMeterUsage();
    const samples = new Uint8Array(analyser.fftSize);
    document.querySelectorAll("[data-student-voice-meter]").forEach((meter) => {
      meter.hidden = !studentDisplayVoiceMeterIsEnabled();
    });
    document.querySelectorAll('[data-action="voice-meter-start"]').forEach((button) => {
      button.disabled = true;
    });
    document.querySelectorAll('[data-action="voice-meter-stop"]').forEach((button) => {
      button.disabled = false;
    });
    if (status) status.textContent = "Voice Meter is listening. Audio is analyzed live and never saved.";
    document.querySelectorAll("[data-live-voice-status]").forEach((label) => {
      label.dataset.state = "on";
      label.innerHTML = `<span aria-hidden="true"></span> Voice Meter is on and listening`;
    });
    const sample = () => {
      if (!voiceMeterAudioContext || !voiceMeterStream) return;
      analyser.getByteTimeDomainData(samples);
      const level = Math.max(0, Math.min(100, Math.round(rmsToVoiceLevel(samples) * voiceMeter.readSensitivity() / 100)));
      const sampledAt = Date.now();
      const elapsed = Math.min(250, Math.max(0, sampledAt - voiceMeterUsage.lastSampleAt));
      const change = Math.abs(level - voiceMeterUsage.previousLevel);
      const detectedMode = level <= 22 ? "independent" : level <= 58 && change <= 9 ? "teacher-led" : "collaborative";
      voiceMeterUsage.detectedSeconds[detectedMode] += elapsed / 1e3;
      voiceMeterUsage.goalMilliseconds += elapsed;
      if (level > voiceMeterUsage.target) voiceMeterUsage.loudMilliseconds += elapsed;
      voiceMeterUsage.lastSampleAt = sampledAt;
      voiceMeterUsage.previousLevel = level;
      voiceMeterUsage.total += level;
      voiceMeterUsage.count += 1;
      voiceMeterUsage.peak = Math.max(voiceMeterUsage.peak, level);
      updateVoiceMeterPresentation(level);
      voiceMeterAnimationFrame = window.requestAnimationFrame(sample);
    };
    sample();
  } catch {
    stopVoiceMeter("Microphone permission is blocked. Allow microphone access, then try again.");
  }
}
async function startReflectionDictation(button) {
  const form = button.closest('[data-form="weekly-reflection"]');
  const field = form?.elements.explanation;
  const status = form?.querySelector("[data-reflection-speech-status]");
  const stopButton = form?.querySelector('[data-action="reflection-dictate-stop"]');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!form || !field || !status) return;
  if (!Recognition) {
    status.textContent = "Speak Answer is not supported in this browser. Open the platform in Chrome or type your answer.";
    return;
  }
  if (reflectionRecognition) {
    reflectionRecognition.stop();
    return;
  }
  button.disabled = true;
  button.setAttribute("aria-pressed", "true");
  status.textContent = "Requesting microphone permission\u2026";
  try {
    if (navigator.mediaDevices?.getUserMedia) {
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionStream.getTracks().forEach((track) => track.stop());
    }
  } catch {
    button.disabled = false;
    button.setAttribute("aria-pressed", "false");
    status.textContent = "Microphone permission is blocked. Allow microphone access in the browser, then try again.";
    return;
  }
  const recognition = new Recognition();
  reflectionRecognition = recognition;
  const answerBeforeListening = field.value.trim();
  recognition.lang = document.documentElement.lang || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  button.hidden = true;
  if (stopButton) stopButton.hidden = false;
  status.textContent = "Start speaking now \u2014 listening.";
  recognition.onresult = (event) => {
    const spoken = Array.from(event.results ?? []).filter((result) => result.isFinal !== false).map((result) => String(result?.[0]?.transcript ?? "").trim()).filter(Boolean).join(" ");
    if (!spoken) return;
    field.value = `${answerBeforeListening}${answerBeforeListening ? " " : ""}${spoken}`.slice(0, 500);
    field.focus();
    status.textContent = "Your spoken answer was added. Check it before submitting.";
  };
  recognition.onerror = (event) => {
    const permissionError = event.error === "not-allowed" || event.error === "service-not-allowed";
    status.textContent = permissionError ? "Microphone permission is blocked. Allow microphone access in the browser, then try again." : "I couldn't hear that. Try again or type your answer.";
  };
  recognition.onend = () => {
    reflectionRecognition = null;
    button.disabled = false;
    button.hidden = false;
    if (stopButton) stopButton.hidden = true;
    button.setAttribute("aria-pressed", "false");
    if (status.textContent === "Start speaking now \u2014 listening.") status.textContent = "Listening stopped. No words were added; try again or type your answer.";
  };
  try {
    recognition.start();
  } catch {
    reflectionRecognition = null;
    button.disabled = false;
    button.hidden = false;
    if (stopButton) stopButton.hidden = true;
    button.setAttribute("aria-pressed", "false");
    status.textContent = "Speak Answer could not start. Try Chrome or type your answer.";
  }
}
function closeQuickMessageBoard() {
  const panel = document.querySelector("[data-message-board-quick-panel]");
  const home = document.querySelector("[data-message-board-home]");
  const board = document.querySelector("#teacher-message-board");
  if (home && board) home.append(board);
  if (panel) panel.hidden = true;
}
function closeQuickClassSchedule() {
  const panel = document.querySelector("[data-class-schedule-quick-panel]");
  const storage = document.querySelector("[data-class-schedule-storage]");
  const schedule = document.querySelector("#teacher-class-schedule");
  if (storage && schedule) storage.append(schedule);
  if (panel) panel.hidden = true;
}
async function handleClick(event) {
  const action = event.target.closest("[data-action]");
  if (!action) return;
  if (action.dataset.action === "generate-namebobs") {
    const form = action.closest('[data-form="production-classroom-setup"]');
    const textarea = form?.elements.studentLabels;
    const status = form?.querySelector("[data-namebob-status]");
    if (!textarea) return;
    const usedLabels = productionTeacherClasses.flatMap((classroom) => Array.isArray(classroom.studentLabels) ? classroom.studentLabels : []);
    const generated = generateNameBobs(textarea.value, { usedLabels });
    if (!generated.labels.length) {
      if (status) status.textContent = "Enter or paste at least one student first name.";
      textarea.focus();
      return;
    }
    textarea.value = generated.labels.join("\n");
    if (status) status.textContent = `${generated.labels.length} unique NameBob${generated.labels.length === 1 ? "" : "s"} generated. Review or edit them before creating the class.`;
    textarea.focus();
    return;
  }
  if (action.dataset.action === "retry-namebob") {
    const form = action.closest('[data-form="production-classroom-setup"]');
    const textarea = form?.elements.studentLabels;
    const retryInput = form?.elements.retryName;
    const status = form?.querySelector("[data-namebob-status]");
    if (!textarea || !retryInput) return;
    const usedLabels = productionTeacherClasses.flatMap((classroom) => Array.isArray(classroom.studentLabels) ? classroom.studentLabels : []);
    const result = retryNameBob(retryInput.value, textarea.value.split(/\r?\n/), { usedLabels });
    if (!result.ok) {
      if (status) status.textContent = result.reason === "student-not-found" ? "That first name is not in the generated list. Check the spelling and try again." : "Enter one student's first name to retry it.";
      retryInput.focus();
      return;
    }
    textarea.value = result.labels.join("\n");
    retryInput.value = "";
    if (status) status.textContent = `${result.firstName}'s new NameBob is ${result.label}. Retry again or keep it.`;
    retryInput.focus();
    return;
  }
  if (action.dataset.action === "generate-class-namebob-limerick") {
    const form = action.closest('[data-form="production-classroom-setup"]');
    const textarea = form?.elements.studentLabels;
    const output = form?.querySelector("[data-namebob-limerick-output]");
    const status = form?.querySelector("[data-namebob-status]");
    if (!textarea || !output) return;
    const result = generateAllNameBobLimericks(textarea.value.split(/\r?\n/));
    if (!result.ok) {
      output.hidden = true;
      if (status) status.textContent = "Enter or paste the class names first.";
      textarea.focus();
      return;
    }
    output.textContent = [`OUR CLASS LIMERICK
${result.limerick}`, ...result.studentLimericks.map((item) => `${item.label}
${item.limerick}`)].join("\n\n");
    output.hidden = false;
    if (status) status.textContent = `Created one class limerick and ${result.studentLimericks.length} student limericks.`;
    action.focus();
    return;
  }
  if (action.dataset.action === "open-student-quest-step") {
    const map = action.closest(".platform-student-quest-map");
    map?.querySelectorAll(".platform-student-quest-stop").forEach((stop, index) => {
      const status = stop.querySelector("[data-student-quest-status]");
      stop.classList.toggle("is-current", stop === action);
      if (stop === action) {
        stop.setAttribute("aria-current", "step");
        if (status) status.textContent = "You are here";
      } else {
        stop.removeAttribute("aria-current");
        if (status) status.textContent = index < Number(action.querySelector(".platform-student-quest-number")?.textContent || 1) - 1 ? "Visited" : index === 3 ? "Finish here" : index === 2 ? "Then" : "Next";
      }
    });
    return;
  }
  if (action.dataset.action === "open-student-calendar-day") {
    const detail = action.closest(".platform-student-calendar")?.querySelector("[data-student-calendar-detail]");
    if (!detail) return;
    const symbol = action.dataset.calendarToday === "true" ? "TODAY" : action.dataset.calendarWork === "true" ? "SAVED" : "\u2014";
    detail.querySelector("strong").textContent = `${symbol} ${action.dataset.calendarDate}`;
    detail.querySelector("span").textContent = action.dataset.calendarWork === "true" ? `Main activity: ${action.dataset.calendarActivity}` : "No saved work";
    const activityLink = detail.querySelector("[data-student-calendar-activity-link]");
    if (activityLink) {
      activityLink.hidden = action.dataset.calendarWork !== "true";
      activityLink.href = action.dataset.calendarUrl || "#student-todays-activities";
    }
    action.closest(".platform-student-calendar-days")?.querySelectorAll(".is-selected").forEach((day) => day.classList.remove("is-selected"));
    action.classList.add("is-selected");
    return;
  }
  if (action.dataset.action === "read-student-section") {
    const section = action.closest("section, article, details");
    if (!section || !("speechSynthesis" in window)) {
      action.textContent = "Listening unavailable";
      return;
    }
    if (window.speechSynthesis.speaking && action.getAttribute("aria-pressed") === "true") {
      window.speechSynthesis.cancel();
      action.setAttribute("aria-pressed", "false");
      action.textContent = "Listen";
      return;
    }
    window.speechSynthesis.cancel();
    document.querySelectorAll('[data-action="read-student-section"][aria-pressed="true"]').forEach((button) => {
      button.setAttribute("aria-pressed", "false");
      button.textContent = "Listen";
    });
    const copy = section.cloneNode(true);
    copy.querySelectorAll("section, article, nav, form, details, button, [aria-hidden='true'], [hidden]").forEach((element) => element.remove());
    const text = copy.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;
    const message = new SpeechSynthesisUtterance(text);
    message.rate = 0.86;
    message.onend = () => {
      action.setAttribute("aria-pressed", "false");
      action.textContent = "Listen";
    };
    action.setAttribute("aria-pressed", "true");
    action.textContent = "\u25A0 Stop";
    window.speechSynthesis.speak(message);
    return;
  }
  if (action.dataset.action === "read-student-launches") {
    const status = action.closest(".platform-school-start-launcher")?.querySelector("[data-student-launch-listen-status]");
    if (!("speechSynthesis" in window)) {
      if (status) status.textContent = "Listening is not available on this device.";
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      action.setAttribute("aria-pressed", "false");
      action.textContent = "Listen";
      if (status) status.textContent = "Reading stopped.";
      return;
    }
    const sidePathWords = action.dataset.sidePathAssigned === "true" ? "Current Side Path. Open your assigned directions." : "Current Side Path is not assigned yet.";
    const message = new SpeechSynthesisUtterance(`${sidePathWords} STEM Builder. Build and test your idea. STEM Workshop. Open your class workshop.`);
    message.rate = 0.86;
    message.onend = () => {
      action.setAttribute("aria-pressed", "false");
      action.textContent = "Listen";
      if (status) status.textContent = "Choose the tool you need.";
    };
    action.setAttribute("aria-pressed", "true");
    action.textContent = "\u25A0 Stop";
    if (status) status.textContent = "Reading the choices aloud.";
    window.speechSynthesis.speak(message);
    return;
  }
  if (action.dataset.action === "open-do-now-editor" || action.dataset.action === "edit-do-now") {
    openDoNowEditor(readLiveDoNow() || readDoNowPosts().find((item) => item.classId === currentDoNowClassId()) || null);
    return;
  }
  if (action.dataset.action === "close-do-now-editor") {
    action.closest("[data-do-now-editor]")?.remove();
    return;
  }
  if (action.dataset.action === "save-do-now") {
    saveDoNowDraft(false);
    return;
  }
  if (action.dataset.action === "show-do-now") {
    saveDoNowDraft(true);
    return;
  }
  if (action.dataset.action === "copy-do-now") {
    updateDoNowDraftFromEditor(action.closest("[data-do-now-editor]"));
    doNowDraft = { ...structuredClone(doNowDraft), id: `do-now-${Date.now()}`, title: `${doNowDraft.title} \u2014 Copy`, savedAt: Date.now(), live: false };
    openDoNowEditor(doNowDraft);
    const status = document.querySelector("[data-do-now-status]");
    if (status) status.textContent = "Copy created. Change it as needed, then save it.";
    return;
  }
  if (action.dataset.action === "hide-do-now") {
    window.sessionStorage.removeItem(DO_NOW_LIVE_KEY);
    syncDoNowPresentation(null);
    return;
  }
  if (action.dataset.action === "add-do-now-box") {
    updateDoNowDraftFromEditor(action.closest("[data-do-now-editor]"));
    doNowDraft.boxes.push({ id: `box-${Date.now()}`, text: "Add your next direction.", color: "#12384d", size: 28, font: "Arial", bold: false, italic: false, underline: false, backgroundType: "solid", background1: "#ffffff", background2: "#ffffff" });
    openDoNowEditor(doNowDraft);
    return;
  }
  if (action.dataset.action === "remove-do-now-box") {
    updateDoNowDraftFromEditor(action.closest("[data-do-now-editor]"));
    doNowDraft.boxes.splice(Number(action.closest("[data-do-now-box]")?.dataset.doNowBox), 1);
    openDoNowEditor(doNowDraft);
    return;
  }
  if (action.dataset.action === "do-now-toggle-format") {
    const box = doNowDraft?.boxes[Number(action.closest("[data-do-now-box]")?.dataset.doNowBox)];
    if (box) {
      box[action.dataset.format] = !box[action.dataset.format];
      action.setAttribute("aria-pressed", String(box[action.dataset.format]));
      updateDoNowDraftFromEditor(action.closest("[data-do-now-editor]"));
    }
    return;
  }
  if (action.dataset.action === "remove-do-now-image") {
    if (doNowDraft) doNowDraft.image = "";
    openDoNowEditor(doNowDraft);
    return;
  }
  if (action.dataset.action === "load-do-now") {
    const id = action.closest("[data-do-now-editor]")?.querySelector("[data-do-now-saved]")?.value;
    const post = readDoNowPosts().find((item) => item.id === id);
    if (post) openDoNowEditor(post);
    return;
  }
  if (action.dataset.action === "delete-do-now") {
    const editor = action.closest("[data-do-now-editor]"), id = editor?.querySelector("[data-do-now-saved]")?.value;
    if (id && window.confirm("Delete this saved Do Now Post?")) {
      writeDoNowPosts(readDoNowPosts().filter((item) => item.id !== id));
      openDoNowEditor();
    }
    return;
  }
  if (handleNamePickerAction(action, document)) return;
  if (handleActivitySideTimerAction(action)) return;
  if (action.dataset.action === "assign-research-bank-group") {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id, group = readTeacherResearchLinkBank().find((item) => item.id === action.dataset.researchGroupId);
    if (!classId || !group) return;
    writeTeacherAssignedResearch(classId, { topic: group.title, links: group.links });
    render();
    return;
  }
  if (action.dataset.action === "delete-research-bank-group") {
    const group = readTeacherResearchLinkBank().find((item) => item.id === action.dataset.researchGroupId);
    if (!group || !window.confirm(`Delete the link group \u201C${group.title}\u201D?`)) return;
    writeTeacherResearchLinkBank(readTeacherResearchLinkBank().filter((item) => item.id !== group.id));
    render();
    return;
  }
  if (action.dataset.action === "preview-assigned-google-search") {
    const topic = action.closest("form")?.elements.topic?.value.trim();
    if (!topic) {
      action.closest("form")?.elements.topic?.focus();
      return;
    }
    window.open(`https://www.google.com/search?q=${encodeURIComponent(topic)}`, "_blank", "noopener");
    return;
  }
  if (action.dataset.action === "clear-assigned-research") {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id, form = action.closest("form");
    if (!classId || !form) return;
    writeTeacherAssignedResearch(classId, { topic: "", links: [] });
    form.reset();
    form.querySelector("[data-assigned-research-status]").textContent = "Teacher-Assigned Research was cleared for this class in this browser.";
    return;
  }
  if (action.dataset.action === "open-assigned-research") {
    const state = session.read(), approved = readTeacherAssignedResearch(state.classId).links.find((link) => link.url === action.dataset.researchUrl), status = action.closest(".platform-assigned-research")?.querySelector("[data-assigned-research-student-status]");
    if (!approved) {
      if (status) status.textContent = "This resource is not currently approved by your teacher.";
      return;
    }
    const width = Math.max(480, Math.floor(screen.availWidth / 2)), height = screen.availHeight, researchWindow = window.open(approved.url, "thinkamigbob-assigned-research", `popup=yes,width=${width},height=${height},left=${width},top=0,resizable=yes`);
    if (!researchWindow) {
      if (status) status.textContent = "The browser blocked the research window. Allow pop-ups for this platform, then try again.";
      return;
    }
    try {
      window.moveTo(0, 0);
      window.resizeTo(width, height);
    } catch {
    }
    if (status) status.textContent = `${approved.title} opened. Your browser may ask you to place the windows side by side.`;
    const closedCheck = window.setInterval(() => {
      if (!researchWindow.closed) return;
      window.clearInterval(closedCheck);
      try {
        window.moveTo(0, 0);
        window.resizeTo(screen.availWidth, screen.availHeight);
      } catch {
      }
      if (status?.isConnected) status.textContent = "The research resource closed. The platform is ready to use full screen again.";
    }, 1e3);
    return;
  }
  if (action.dataset.action === "whiteboard-activate-text") {
    activateWhiteboardTextTool();
    return;
  }
  if (action.dataset.action === "whiteboard-format-text") {
    if (!formatSelectedWhiteboardText(action.dataset.textCommand)) action.setAttribute("aria-pressed", String(action.getAttribute("aria-pressed") !== "true"));
    activateWhiteboardTextTool();
    refreshPendingWhiteboardTextEntryStyle();
    return;
  }
  if (action.dataset.action === "whiteboard-choose-text-font") {
    const font = action.dataset.textFont, fontControl = document.querySelector("[data-whiteboard-text-font]");
    if (fontControl) fontControl.value = font;
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type === "text" && !selected.emojiStamp) formatSelectedWhiteboardText("font");
    activateWhiteboardTextTool(`${font} selected. Click anywhere on the whiteboard to start typing.`);
    refreshPendingWhiteboardTextEntryStyle();
    return;
  }
  if (action.closest("[data-class-resource-teacher]") || action.dataset.action?.startsWith("timer-") || action.dataset.action === "instant-timer") window.setTimeout(refreshCurrentClassPlan, 0);
  if (action.dataset.action === "open-current-plan-editor") {
    const modal = action.closest(".platform-current-class-plan")?.querySelector("[data-current-plan-modal]") ?? document.querySelector("[data-current-plan-modal]");
    const content = modal?.querySelector("[data-current-plan-editor-content]");
    const title = modal?.querySelector("#current-plan-editor-title");
    const state = session.read();
    const classId = modal?.dataset.currentClassId || currentTeacherClass(state.teacherId)?.id || state.classId;
    const teacherId = modal?.dataset.currentTeacherId || state.teacherId;
    if (!modal || !content || !title || !classId) return;
    const labels = { activities: "Edit Assigned Activities", access: "Student Resource Access", message: "Edit Current Message", timer: "Adjust Today\u2019s Timer", whiteboard: "Latest Whiteboard", voice: "Voice Meter History" };
    title.textContent = labels[action.dataset.currentPlanEditor] || "Quick edit";
    content.innerHTML = currentClassPlanEditorMarkup(action.dataset.currentPlanEditor, classId, teacherId);
    modal.dataset.editorCategory = action.dataset.currentPlanEditor;
    modal.hidden = false;
    modal.querySelector('[data-action="close-current-plan-editor"]')?.focus();
    return;
  }
  if (action.dataset.action === "close-current-plan-editor") {
    closeCurrentClassPlanEditor();
    document.querySelector(`[data-current-plan-editor="${action.closest("[data-current-plan-modal]")?.dataset.editorCategory || ""}"]`)?.focus();
    return;
  }
  if (action.dataset.action === "return-current-plan") {
    closeCurrentClassPlanEditor();
    const plan = document.querySelector(".platform-current-class-plan");
    plan?.scrollIntoView({ behavior: "smooth", block: "start" });
    plan?.querySelector(`[data-current-plan-editor="${action.closest("[data-current-plan-modal]")?.dataset.editorCategory || ""}"]`)?.focus();
    return;
  }
  if (action.dataset.action === "return-to-current-class-plan") {
    closeCurrentClassPlanEditor();
    closeQuickMessageBoard();
    closeQuickClassSchedule();
    const readinessPanel = document.querySelector('[data-form="class-readiness"]');
    if (readinessPanel) readinessPanel.hidden = true;
    const plan = document.querySelector(".platform-current-class-plan");
    plan?.scrollIntoView({ behavior: "smooth", block: "start" });
    plan?.querySelector("#current-class-plan-title")?.focus?.();
    return;
  }
  if (action.dataset.action === "current-plan-open-resources") {
    closeCurrentClassPlanEditor();
    document.querySelector("#teacher-todays-resources")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action.dataset.action === "save-current-plan-message") {
    const modal = action.closest("[data-current-plan-modal]");
    const value = modal?.querySelector("[data-current-plan-message]")?.value ?? "";
    const result = teacherMemo.save(value);
    const status = modal?.querySelector("[data-current-plan-editor-status]");
    if (status) status.textContent = result.ok ? "Message saved and displayed." : value.trim() ? `Keep the message to ${TEACHER_MEMO_MAX_CHARACTERS} characters or fewer.` : "Type a message before saving.";
    if (result.ok) syncTeacherMemoPresentation();
    return;
  }
  if (action.dataset.action === "clear-current-plan-message") {
    teacherMemo.clear();
    syncTeacherMemoPresentation();
    const modal = action.closest("[data-current-plan-modal]");
    const field = modal?.querySelector("[data-current-plan-message]");
    const status = modal?.querySelector("[data-current-plan-editor-status]");
    if (field) field.value = "";
    if (status) status.textContent = "Message cleared.";
    return;
  }
  if (["open-message-board-quick", "open-whiteboard", "open-today-timer-tools"].includes(action.dataset.action)) closeCurrentClassPlanEditor();
  if (action.dataset.action === "open-teacher-preview") {
    session.signInTeacher("teacher-preview-1");
    navigate(ROUTES.TEACHER_DASHBOARD);
    return;
  }
  if (action.dataset.action === "open-student-preview") {
    session.signInStudent("class-preview-1", "student-preview-1");
    navigate(ROUTES.STUDENT_DASHBOARD);
    return;
  }
  if (action.dataset.action === "open-class-readiness") {
    const panel = document.querySelector("[data-form='class-readiness']");
    if (panel) {
      const state = session.read();
      const classId = currentTeacherClass(state.teacherId)?.id;
      const goals = panel.querySelector("[data-quick-goals]");
      if (classId && goals?.dataset.goalsMode === "automatic") goals.outerHTML = todaysGoalInputsMarkup(classId);
      closeQuickMessageBoard();
      closeQuickClassSchedule();
      panel.hidden = false;
      panel.querySelector(`[data-readiness-setting="${action.dataset.readinessFocus}"]`)?.focus();
    }
    return;
  }
  if (action.dataset.action === "open-today-timer-tools") {
    const card = document.querySelector("#teacher-timer-card");
    const adjuster = card?.querySelector(".platform-timer-display-settings");
    if (adjuster) adjuster.open = true;
    card?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action.dataset.action === "toggle-smartboard-tool") {
    const display = action.closest("#platform-student-timer-display");
    installSmartboardToolPopoutButtons(document);
    const tool = display?.querySelector(`[data-smartboard-tool="${action.dataset.smartboardToolName}"]`);
    if (tool) {
      tool.hidden = !tool.hidden;
      if (!tool.hidden) {
        bringSmartboardToolForward(tool);
        keepSmartboardToolsOnScreen(document);
      }
    }
    return;
  }
  if (action.dataset.action === "reset-smartboard-tools") {
    resetSmartboardToolPositions(action.ownerDocument || document);
    return;
  }
  if (action.dataset.action === "fullscreen-classroom-display") {
    void toggleClassroomDisplayFullscreen(action);
    return;
  }
  if (action.dataset.action === "exit-classroom-fullscreen") {
    void exitClassroomDisplayFullscreen(action.ownerDocument);
    return;
  }
  if (action.dataset.action === "popout-smartboard-tool") {
    openSmartboardToolPopout(action.closest("[data-smartboard-tool]"));
    return;
  }
  if (action.dataset.action === "fullscreen-smartboard-tool") {
    toggleSmartboardToolMaximized(action.closest("[data-smartboard-tool]"));
    return;
  }
  if (action.dataset.action === "close-smartboard-tool") {
    const tool = action.closest("[data-smartboard-tool]");
    if (tool) {
      tool.hidden = true;
      const display = tool.closest("#platform-student-timer-display[data-tool-only]");
      if (display) {
        display.hidden = true;
        delete display.dataset.toolOnly;
      }
    }
    return;
  }
  if (action.dataset.action === "open-message-board-quick") {
    const settings = document.querySelector("[data-form='class-readiness']");
    const panel = document.querySelector("[data-message-board-quick-panel]");
    const host = panel?.querySelector("[data-message-board-quick-host]");
    const board = document.querySelector("#teacher-message-board");
    if (settings) settings.hidden = true;
    closeQuickClassSchedule();
    if (panel && host && board) {
      panel.hidden = false;
      host.append(board);
    }
    return;
  }
  if (action.dataset.action === "open-class-schedule-quick") {
    const settings = document.querySelector("[data-form='class-readiness']");
    const panel = document.querySelector("[data-class-schedule-quick-panel]");
    const host = panel?.querySelector("[data-class-schedule-quick-host]");
    const schedule = document.querySelector("#teacher-class-schedule");
    if (settings) settings.hidden = true;
    closeQuickMessageBoard();
    if (panel && host && schedule) {
      panel.hidden = false;
      host.append(schedule);
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      schedule.querySelector('[name="durationMinutes"]')?.focus({ preventScroll: true });
    }
    return;
  }
  if (action.dataset.action === "close-class-schedule-quick") {
    closeQuickClassSchedule();
    document.querySelector('[data-action="open-class-schedule-quick"]')?.focus();
    return;
  }
  if (action.dataset.action === "close-message-board-quick") {
    closeQuickMessageBoard();
    document.querySelector('[data-action="open-message-board-quick"]')?.focus();
    return;
  }
  if (action.dataset.action === "close-class-readiness") {
    const panel = document.querySelector("[data-form='class-readiness']");
    if (panel) panel.hidden = true;
    return;
  }
  if (action.dataset.action === "add-quick-goal") {
    const goals = action.closest("[data-quick-goals]");
    const list = goals?.querySelector("[data-quick-goal-list]");
    if (!goals || !list) return;
    goals.dataset.goalsMode = "custom";
    list.querySelector("[data-no-quick-goals]")?.remove();
    const index = list.querySelectorAll('[name="todayGoal"]').length;
    list.insertAdjacentHTML("beforeend", `<label>I Can Goal ${index + 1}<span><input name="todayGoal" maxlength="90" value="I can "><button type="button" data-action="delete-quick-goal" aria-label="Delete I Can goal ${index + 1}">Delete</button></span></label>`);
    list.querySelectorAll('[name="todayGoal"]')[index]?.focus();
    return;
  }
  if (action.dataset.action === "delete-quick-goal") {
    const goals = action.closest("[data-quick-goals]");
    const list = goals?.querySelector("[data-quick-goal-list]");
    action.closest("label")?.remove();
    if (goals) goals.dataset.goalsMode = "custom";
    if (list && !list.querySelector('[name="todayGoal"]')) list.innerHTML = `<p data-no-quick-goals>No goal is currently assigned.</p>`;
    return;
  }
  if (action.dataset.action === "keep-readiness-mission") {
    const form = action.closest("[data-form='class-readiness']");
    const confirmation = form?.querySelector("[data-readiness-no-mission-confirmation]");
    if (confirmation) confirmation.hidden = true;
    if (form?.elements.mission) form.elements.mission.value = "previous";
    form?.elements.mission?.focus();
    return;
  }
  if (action.dataset.action === "confirm-readiness-no-mission") {
    const form = action.closest("[data-form='class-readiness']");
    const confirmation = form?.querySelector("[data-readiness-no-mission-confirmation]");
    if (confirmation) confirmation.hidden = true;
    if (form) form.dataset.noMissionConfirmed = "true";
    form?.querySelector('[data-action="save-class-readiness"]')?.click();
    return;
  }
  if (action.dataset.action === "save-class-readiness") {
    const form = action.closest("[data-form='class-readiness']");
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    if (!form || !classId) return;
    const missionChoice = form.elements.mission.value;
    const planningRange = String(form.elements.planningRange?.value || "today");
    const planningWindows = { today: { label: "Today", schoolDays: 1 }, week: { label: "This week", schoolDays: 5 }, "seven-weeks": { label: "7 weeks", schoolDays: 35 } };
    const selectedWindow = planningWindows[planningRange] || planningWindows.today;
    const planningWindow = { ...selectedWindow, scope: planningRange, startsOn: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), savedAt: Date.now() };
    if (missionChoice === "previous") {
      if (planningRange !== "today") classSetupProfiles.save(classId, { ...classSetupProfiles.profile(classId) ?? {}, planningWindow });
      form.hidden = true;
      if (planningRange !== "today") render();
      return;
    }
    const currentMission = todaysMission.read();
    if (missionChoice === "none" && currentMission.title && form.dataset.noMissionConfirmed !== "true") {
      const confirmation = form.querySelector("[data-readiness-no-mission-confirmation]");
      const missionName = confirmation?.querySelector("[data-readiness-current-mission]");
      if (missionName) missionName.textContent = currentMission.title;
      if (confirmation) {
        confirmation.hidden = false;
        confirmation.querySelector('[data-action="keep-readiness-mission"]')?.focus();
      }
      return;
    }
    delete form.dataset.noMissionConfirmed;
    const readiness = { ...classReadiness(classId), mission: missionChoice };
    const profile = classSetupProfiles.profile(classId) ?? {};
    const goalsRegion = form.querySelector("[data-quick-goals]");
    const todayGoals = [...form.querySelectorAll('[name="todayGoal"]')].map((input) => iCanGoal(input.value)).filter(Boolean).slice(0, 6);
    const todayGoalsMode = goalsRegion?.dataset.goalsMode === "custom" ? "custom" : "automatic";
    classSetupProfiles.save(classId, { ...profile, readiness, todayGoals, todayGoalsMode, planningWindow });
    if (readiness.mission === "none" || !todayGoals.length) todaysMission.clear();
    else {
      const resources = classResourceSharing.read(classId).audienceRows.flatMap((row) => row.resources).filter(Boolean);
      todaysMission.save({ title: todayGoals[0], focus: todayGoals.join(" \u2022 "), builder: resources.some((item) => item.type === "Builder") ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART, workshop: resources.some((item) => item.type === "Workshop") ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART });
    }
    if (readiness.timer !== "saved") classTimerSchedule.save({ ...classTimerSchedule.read(), enabled: false });
    if (readiness.mission === "new") {
      pendingScrollTarget = "teacher-todays-resources";
      pendingOpenClassResourceEditor = true;
    }
    render();
    return;
  }
  if (action.dataset.action === "select-catalog-resource") {
    const form = action.closest('[data-form="class-resource"]');
    if (!form) return;
    form.elements.type.value = action.dataset.resourceType;
    form.elements.title.value = action.dataset.resourceTitle;
    form.elements.url.value = action.dataset.resourceUrl;
    const status = form.querySelector("[data-class-resource-status]");
    if (status) status.textContent = `Selected: ${action.dataset.resourceTitle}. Choose Save for Later or Show on Student Page.`;
    form.elements.title.focus();
    return;
  }
  if (action.dataset.action === "use-custom-webpage") {
    const form = action.closest('[data-form="class-resource"]');
    if (!form) return;
    form.elements.type.value = "Webpage";
    form.elements.title.value = "";
    form.elements.url.value = "";
    const customFields = form.querySelector("[data-custom-resource-fields]");
    if (customFields) customFields.open = true;
    const status = form.querySelector("[data-class-resource-status]");
    if (status) status.textContent = "Enter the page name and address below. Students will not see it until you choose Show on Student Page.";
    form.elements.title.focus();
    return;
  }
  if (action.dataset.action === "add-resource-slot") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const result = classResourceSharing.addSlot(classId, action.dataset.resourceRowId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    const status = document.querySelector("[data-class-resource-status]");
    if (status && result.ok) status.textContent = `Slot ${result.slotCount} added. Choose another resource when ready.`;
    return;
  }
  if (action.dataset.action === "remove-resource-slot") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const result = classResourceSharing.removeSlot(classId, action.dataset.resourceRowId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    const status = document.querySelector("[data-class-resource-status]");
    if (status) status.textContent = result.ok ? `Empty Slot ${result.slotCount + 1} deleted.` : "Uncheck the resource in the last slot before deleting that slot.";
    return;
  }
  if (action.dataset.action === "edit-resource-slot") {
    const region = action.closest("[data-class-resource-teacher]");
    const editor = region?.querySelector(".platform-class-resource-editor");
    const form = editor?.querySelector('[data-form="class-resource"]');
    if (!editor || !form) return;
    form.elements.rowId.value = action.dataset.resourceRowId;
    form.elements.slot.value = action.dataset.resourceSlotIndex;
    editor.open = true;
    return;
  }
  if (action.dataset.action === "add-resource-audience") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    classResourceSharing.addAudienceRow(classId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "add-resource-exception") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    const type = region?.querySelector("[data-resource-exception-type]")?.value;
    if (!classId || !region || !type) return;
    const row = classResourceSharing.addAudienceRow(classId);
    const label = type === "whole-class" ? "Whole class" : type === "students" ? "Selected students" : type === "teacher-group" ? "Exception Group" : "Random Exception Group";
    classResourceSharing.updateAudience(classId, row.id, { audienceType: type, audienceIds: [], audienceLabel: label });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "add-teacher-group") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const row = classResourceSharing.addAudienceRow(classId);
    const groupNumber = classResourceSharing.read(classId).audienceRows.filter((item) => ["teacher-group", "random-group"].includes(item.audienceType)).length + 1;
    classResourceSharing.updateAudience(classId, row.id, { audienceType: "teacher-group", audienceIds: [], audienceLabel: `Group ${groupNumber}` });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "build-random-groups") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const roster = [...getRosterForClass(classId)].sort(() => Math.random() - 0.5);
    const requestedSize = Number(region.querySelector("[data-random-group-size]")?.value);
    const size = Math.max(1, Math.min(roster.length || 1, Number.isFinite(requestedSize) ? requestedSize : 3));
    const groupCount = Math.max(1, Math.ceil(roster.length / size));
    const groups = Array.from({ length: groupCount }, (_, index) => ({ name: `Random Group ${index + 1}`, audienceIds: [] }));
    roster.forEach((student, index) => groups[index % groupCount].audienceIds.push(student.id));
    classResourceSharing.setGroupRows(classId, groups, "random-group");
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "save-group-set") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const result = classResourceSharing.saveGroupSet(classId, region.querySelector("[data-group-set-name]")?.value);
    if (result.ok) region.outerHTML = classResourceTeacherMarkup(classId);
    else {
      const status = region.querySelector("[data-class-resource-status]");
      if (status) status.textContent = "Name the group settings and create at least one group before saving.";
    }
    return;
  }
  if (action.dataset.action === "apply-group-set") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    const presetId = region?.querySelector("[data-saved-group-set]")?.value;
    if (!classId || !region || !presetId) return;
    classResourceSharing.applyGroupSet(classId, presetId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "remove-resource-audience") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    classResourceSharing.removeAudienceRow(classId, action.dataset.resourceRowId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "randomize-resource-audience") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const shuffled = [...getRosterForClass(classId)].sort(() => Math.random() - 0.5);
    const count = Math.max(1, Math.ceil(shuffled.length / 2));
    classResourceSharing.updateAudience(classId, action.dataset.resourceRowId, { audienceType: "random-group", audienceIds: shuffled.slice(0, count).map((student) => student.id), audienceLabel: "Random group" });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "show-selected-webpages") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    const form = region?.querySelector('[data-form="class-resource"]');
    const selected = [...region?.querySelectorAll("[data-webpage-selection]:checked") ?? []];
    if (!classId || !region || !form) return;
    const catalogUrls = new Set(TEACHER_WEBPAGE_CATALOG.map((page) => page.url));
    const retained = classResourceSharing.read(classId).activeResources.filter((resource) => resource.type !== "Webpage" || !catalogUrls.has(resource.url));
    const selectedPages = selected.map((input, selectionIndex) => {
      const page = TEACHER_WEBPAGE_CATALOG[Number(input.value)];
      return page ? { id: `webpage-${Date.now()}-${selectionIndex}`, type: "Webpage", title: page.title, url: page.url, release: form.elements.release.value } : null;
    }).filter(Boolean);
    classResourceSharing.replaceActive(classId, [...retained, ...selectedPages]);
    region.outerHTML = classResourceTeacherMarkup(classId);
    const status = document.querySelector("[data-class-resource-status]");
    if (status) status.textContent = selected.length ? `${selected.length} webpage${selected.length === 1 ? " is" : "s are"} now available to students.` : "Catalog webpages were removed from the student page.";
    return;
  }
  if (action.dataset.action === "whiteboard-quick-tool") {
    whiteboardDeleteNextObject = false;
    const tool = document.querySelector("[data-whiteboard-tool]");
    const nextTool = action.dataset.whiteboardQuickTool;
    if (nextTool !== "text") cancelPendingWhiteboardTextEntry();
    if (nextTool === "pull-3d") {
      const selectedIndex = whiteboardObjects.findIndex((object) => object.id === whiteboardSelectedObjectId);
      const selected = whiteboardObjects[selectedIndex];
      if (selected && [...WHITEBOARD_CLOSED_2D_SHAPES, "text", "path", "line", "arrow"].includes(selected.type) && selected.strokeStyle !== "eraser" && !selected.original2DType) {
        const depth = Number(document.querySelector("[data-whiteboard-3d-depth]")?.value ?? 24);
        const connectedIds = WHITEBOARD_CLOSED_2D_SHAPES.includes(selected.type) ? connectedWhiteboardObjectIds(selected) : /* @__PURE__ */ new Set([selected.id]);
        const connectedShapes = whiteboardObjects.filter((object) => connectedIds.has(object.id) && WHITEBOARD_CLOSED_2D_SHAPES.includes(object.type) && !object.original2DType);
        const objectsToPull = connectedShapes.length > 1 ? connectedShapes : [selected];
        const idsToPull = new Set(objectsToPull.map((object) => object.id));
        pushWhiteboardHistory();
        whiteboardObjects = whiteboardObjects.map((object) => idsToPull.has(object.id) ? makeWhiteboardObject3D(object, depth) : object);
        renderWhiteboardObjects();
        saveWhiteboard();
        updateWhiteboardHistoryControls();
        setWhiteboardStatus(objectsToPull.length > 1 ? `${objectsToPull.length} connected 2D shapes are now one 3D assembly with thickness ${depth}.` : `Selected object is now 3D with thickness ${depth}. Use Push Back to 2D to reverse it.`);
        return;
      }
    }
    if (tool && nextTool) {
      tool.value = nextTool;
      tool.dispatchEvent(new Event("change", { bubbles: true }));
      document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === nextTool)));
      const label = action.textContent?.trim() || action.title || "Whiteboard tool";
      setWhiteboardStatus(`${label} is active.`);
    }
    whiteboardCanvas()?.focus({ preventScroll: true });
    return;
  }
  if (action.dataset.action === "whiteboard-open-pixel-studio") {
    openPixelStudio();
    return;
  }
  if (action.dataset.action === "pixel-new-project") {
    newPixelProject();
    return;
  }
  if (action.dataset.action === "pixel-save-project") {
    savePixelProjectFile();
    return;
  }
  if (action.dataset.action === "pixel-level") {
    const levels = { starter: { size: 8, bits: 1 }, creator: { size: 16, bits: 4 }, advanced: { size: 64, bits: 8 }, "full-color": { size: 64, bits: 24 } }, level = levels[action.dataset.pixelLevel];
    if (!level) return;
    const hasWork = pixelStudio.frames.some((frame) => frame.some((color) => !color.endsWith("00")));
    if (hasWork && !window.confirm("Changing learning level starts a new pixel project. Continue?")) return;
    pixelStudio.size = level.size;
    pixelStudio.bits = level.bits;
    pixelStudio.palette = [...PIXEL_PALETTE, ...PIXEL_8_BIT_PALETTE.slice(16)];
    pixelStudio.pixels = freshPixelFrame();
    pixelStudio.frames = [[...pixelStudio.pixels]];
    pixelStudio.sourceFrames = [];
    pixelStudio.frameIndex = 0;
    const size = document.querySelector("[data-pixel-size]"), bits = document.querySelector("[data-pixel-bits]");
    if (size) size.value = String(level.size);
    if (bits) bits.value = String(level.bits);
    document.querySelectorAll("[data-pixel-level]").forEach((button) => button.setAttribute("aria-pressed", String(button === action)));
    renderPixelStudio();
    startPixelStudioPreview();
    setWhiteboardStatus(`${action.textContent.trim()} mode is ready.`);
    return;
  }
  if (action.dataset.action === "pixel-close") {
    const dialog = document.querySelector("[data-pixel-studio]");
    if (dialog) dialog.hidden = true;
    window.clearInterval(pixelStudioPreviewTimer);
    setWhiteboardStatus("Pixel Studio closed. Your frames are kept while this whiteboard is open.");
    return;
  }
  if (action.dataset.action === "pixel-clear") {
    pixelStudio.pixels = freshPixelFrame();
    saveCurrentPixelFrame();
    renderPixelStudio();
    return;
  }
  if (action.dataset.action === "pixel-from-image") {
    selectedImageToPixels();
    return;
  }
  if (action.dataset.action === "pixel-paste-gif") {
    void pastePixelGif().finally(() => document.querySelector("[data-pixel-gif-url]")?.focus());
    return;
  }
  if (action.dataset.action === "pixel-load-gif-url") {
    const field = document.querySelector("[data-pixel-gif-url]"), url = field?.value.trim();
    if (!url) {
      setWhiteboardStatus("Paste a GIF image address into the box first.");
      field?.focus();
      return;
    }
    void importPixelGifUrl(url);
    return;
  }
  if (action.dataset.action === "pixel-add-frame") {
    saveCurrentPixelFrame();
    pixelStudio.frames.push(freshPixelFrame());
    pixelStudio.sourceFrames?.push("");
    pixelStudio.frameIndex = pixelStudio.frames.length - 1;
    pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]];
    renderPixelStudio();
    startPixelStudioPreview();
    return;
  }
  if (action.dataset.action === "pixel-duplicate-frame") {
    saveCurrentPixelFrame();
    pixelStudio.frames.splice(pixelStudio.frameIndex + 1, 0, [...pixelStudio.pixels]);
    pixelStudio.sourceFrames?.splice(pixelStudio.frameIndex + 1, 0, pixelStudio.sourceFrames[pixelStudio.frameIndex] ?? "");
    pixelStudio.frameIndex += 1;
    pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]];
    renderPixelStudio();
    startPixelStudioPreview();
    return;
  }
  if (action.dataset.action === "pixel-delete-frame") {
    if (pixelStudio.frames.length === 1) {
      pixelStudio.pixels = freshPixelFrame();
      pixelStudio.frames[0] = [...pixelStudio.pixels];
      pixelStudio.sourceFrames = [];
    } else {
      pixelStudio.frames.splice(pixelStudio.frameIndex, 1);
      pixelStudio.sourceFrames?.splice(pixelStudio.frameIndex, 1);
      pixelStudio.frameIndex = Math.min(pixelStudio.frameIndex, pixelStudio.frames.length - 1);
      pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]];
    }
    renderPixelStudio();
    startPixelStudioPreview();
    return;
  }
  if (action.dataset.action === "pixel-move-frame-left" || action.dataset.action === "pixel-move-frame-right") {
    saveCurrentPixelFrame();
    const offset = action.dataset.action.endsWith("left") ? -1 : 1, nextIndex = pixelStudio.frameIndex + offset;
    if (nextIndex >= 0 && nextIndex < pixelStudio.frames.length) {
      [pixelStudio.frames[pixelStudio.frameIndex], pixelStudio.frames[nextIndex]] = [pixelStudio.frames[nextIndex], pixelStudio.frames[pixelStudio.frameIndex]];
      if (pixelStudio.sourceFrames?.length) [pixelStudio.sourceFrames[pixelStudio.frameIndex], pixelStudio.sourceFrames[nextIndex]] = [pixelStudio.sourceFrames[nextIndex], pixelStudio.sourceFrames[pixelStudio.frameIndex]];
      pixelStudio.frameIndex = nextIndex;
      pixelStudio.pixels = [...pixelStudio.frames[nextIndex]];
      renderPixelStudio();
      startPixelStudioPreview();
    }
    return;
  }
  if (action.dataset.action === "pixel-select-frame") {
    saveCurrentPixelFrame();
    pixelStudio.frameIndex = Number(action.dataset.pixelFrame);
    pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]];
    renderPixelStudio();
    return;
  }
  if (action.dataset.action === "pixel-add-board") {
    saveCurrentPixelFrame();
    addPixelSpriteToWhiteboard();
    return;
  }
  if (action.dataset.action === "pixel-photo-open") {
    const tools = document.querySelector("[data-pixel-photo-tools]"), opening = Boolean(tools?.hidden);
    if (tools) tools.hidden = !opening;
    action.setAttribute("aria-expanded", String(opening));
    setWhiteboardStatus(opening ? "Still-image options opened. Choose a GIF frame before adding or downloading it." : "Still-image options closed. Pixel Studio remains in bit-animation mode.");
    return;
  }
  if (action.dataset.action === "pixel-photo-board") {
    void addPixelGifFrameImageToWhiteboard();
    return;
  }
  if (action.dataset.action === "pixel-photo-download") {
    void pixelGifFrameImage().then((canvas) => {
      downloadPixelStudio(canvas.toDataURL("image/png"), `gif-frame-${pixelStudio.frameIndex + 1}.png`);
      setWhiteboardStatus("The selected GIF frame was downloaded as a smooth PNG image.");
    });
    return;
  }
  if (action.dataset.action === "pixel-download-png") {
    saveCurrentPixelFrame();
    downloadPixelStudio(pixelFrameCanvas(pixelStudio.pixels, 24).toDataURL("image/png"), "pixel-sprite.png");
    return;
  }
  if (action.dataset.action === "pixel-download-gif") {
    saveCurrentPixelFrame();
    const source = animatedPixelGif();
    downloadPixelStudio(source, "pixel-animation.gif");
    window.setTimeout(() => URL.revokeObjectURL(source), 1e3);
    setWhiteboardStatus(pixelStudio.bits === 24 ? "Animated GIF downloaded. GIF format reduced each Full Color frame to no more than 256 colors." : "Animated pixel GIF downloaded.");
    return;
  }
  if (action.dataset.action === "pixel-eyedropper") {
    if (typeof window.EyeDropper !== "function") {
      setWhiteboardStatus("The eyedropper is unavailable here. Choose a pixel color instead.");
      return;
    }
    new window.EyeDropper().open().then(({ sRGBHex }) => {
      const input = document.querySelector("[data-pixel-color]");
      if (input) {
        input.value = sRGBHex;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }).catch(() => {
    });
    return;
  }
  if (action.dataset.action === "pixel-random-palette") {
    randomPixelPalette();
    setWhiteboardStatus(`A new random ${pixelStudio.bits}-bit color palette was generated.`);
    return;
  }
  if (action.dataset.action === "pixel-select-color") {
    const color = pixelPalette()[Number(action.dataset.pixelPaletteIndex)], input = document.querySelector("[data-pixel-color]");
    if (input && color) {
      input.value = color;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return;
  }
  if (action.dataset.action === "whiteboard-tool-select") {
    cancelPendingWhiteboardTextEntry();
    whiteboardDeleteNextObject = false;
    const tool = document.querySelector("[data-whiteboard-tool]");
    if (tool) {
      tool.value = "select";
      tool.dispatchEvent(new Event("change", { bubbles: true }));
    }
    document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === "select")));
    whiteboardCanvas()?.focus({ preventScroll: true });
    setWhiteboardStatus("Select and move is active.");
    return;
  }
  if (action.dataset.action === "whiteboard-paste-youtube") {
    const field = document.querySelector("[data-whiteboard-youtube-url]");
    navigator.clipboard.readText().then((copied) => {
      if (field) field.value = copied;
      if (whiteboardYouTubeId(copied)) setWhiteboardStatus("YouTube link pasted. Choose Add YouTube Video.");
      else setWhiteboardStatus("The copied text is not a recognized YouTube video link.");
    }).catch(() => {
      setWhiteboardStatus("Clipboard access was blocked. Paste the YouTube link into the link box instead.");
      field?.focus();
    });
    return;
  }
  if (action.dataset.action === "whiteboard-add-youtube") {
    const field = document.querySelector("[data-whiteboard-youtube-url]"), videoId = whiteboardYouTubeId(field?.value ?? ""), canvas = whiteboardCanvas();
    if (!videoId || !canvas) {
      setWhiteboardStatus("Enter a valid YouTube video link, including youtube.com or youtu.be.");
      field?.focus();
      return;
    }
    addWhiteboardYouTubeVideo(videoId);
    if (field) field.value = "";
    return;
  }
  if (action.dataset.action === "whiteboard-cut") {
    cutSelectedWhiteboardObject();
    whiteboardCanvas()?.focus({ preventScroll: true });
    return;
  }
  if (action.dataset.action === "whiteboard-copy-image") {
    const menu = document.querySelector("[data-whiteboard-context-menu]");
    if (menu) menu.hidden = true;
    void copySelectedWhiteboardObjectAsImage();
    return;
  }
  if (action.dataset.action === "whiteboard-cut-image") {
    const menu = document.querySelector("[data-whiteboard-context-menu]");
    if (menu) menu.hidden = true;
    cutSelectedWhiteboardObject();
    return;
  }
  if (action.dataset.action === "whiteboard-paste-image") {
    const menu = document.querySelector("[data-whiteboard-context-menu]");
    if (menu) menu.hidden = true;
    pasteWhiteboardClipboard(whiteboardContextPoint);
    return;
  }
  if (action.dataset.action === "whiteboard-paste-system-image") {
    void pasteSystemClipboardImage();
    return;
  }
  if (action.dataset.action === "whiteboard-close-context-menu") {
    const menu = document.querySelector("[data-whiteboard-context-menu]");
    if (menu) menu.hidden = true;
    return;
  }
  if (action.dataset.action === "whiteboard-toggle-controls") {
    whiteboardControlsHidden = !whiteboardControlsHidden;
    applyWhiteboardControlsLayout({ resizeCanvas: true });
    saveWhiteboard();
    setWhiteboardStatus(whiteboardControlsHidden ? "Board menus hidden. The canvas now uses the extra space." : "Board menus expanded.");
    return;
  }
  if (action.dataset.action === "whiteboard-remove-selection-background") {
    const selectedImage = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId && object.type === "image");
    if (selectedImage) {
      try {
        removeSelectedWhiteboardImageBackground(selectedImage);
      } catch {
        setWhiteboardStatus("This image could not remove its background. Try pasting or uploading it again.");
      }
      return;
    }
    if (!whiteboardLassoBounds) {
      setWhiteboardStatus("Choose Lasso select for image and drag around the work first.");
      return;
    }
    try {
      const selectedIds = new Set(whiteboardLassoObjectIds());
      const result = whiteboardSelectionCanvas({ removeBackground: true });
      if (!result) return;
      pushWhiteboardHistory();
      whiteboardSelectionDownload = result.canvas.toDataURL("image/png");
      whiteboardObjects = whiteboardObjects.filter((object) => !selectedIds.has(object.id));
      const image = createWhiteboardObject("image", { x: result.bounds.x, y: result.bounds.y, width: result.bounds.width, height: result.bounds.height, src: whiteboardSelectionDownload, backgroundRemoved: true, rotation: 0 });
      whiteboardObjects.push(image);
      whiteboardSelectedObjectId = image.id;
      whiteboardLassoPoints = [];
      whiteboardLassoBounds = null;
      hydrateWhiteboardImages(() => renderWhiteboardObjects());
      renderWhiteboardObjects();
      saveWhiteboard();
      updateWhiteboardHistoryControls();
      setWhiteboardStatus("Background removed. The selection is now one movable image. Use Undo if light details were removed.");
    } catch {
      setWhiteboardStatus("This selection could not remove its background. Try a smaller selection or an uploaded image from this device.");
    }
    return;
  }
  if (action.dataset.action === "whiteboard-lasso-use") {
    useWhiteboardLassoCutout();
    return;
  }
  if (action.dataset.action === "whiteboard-lasso-delete") {
    deleteWhiteboardLassoCutout();
    return;
  }
  if (action.dataset.action === "whiteboard-lasso-fill") {
    if (typeof window.EyeDropper !== "function") {
      const currentColor = document.querySelector("[data-whiteboard-color]")?.value ?? "#ffffff";
      fillWhiteboardLassoCutout(currentColor);
      setWhiteboardStatus("Eyedropper is unavailable, so the cutout was replaced with the current toolbar color.");
      return;
    }
    new window.EyeDropper().open().then(({ sRGBHex }) => {
      const color = document.querySelector("[data-whiteboard-color]");
      if (color) {
        color.value = sRGBHex;
        color.dispatchEvent(new Event("input", { bubbles: true }));
      }
      fillWhiteboardLassoCutout(sRGBHex);
    }).catch(() => setWhiteboardStatus("Color matching canceled. The image was not changed."));
    return;
  }
  if (action.dataset.action === "whiteboard-lasso-cancel") {
    clearWhiteboardLassoChoice();
    setWhiteboardStatus("Cutout canceled. The board was not changed.");
    return;
  }
  if (action.dataset.action === "whiteboard-eyedropper") {
    if (typeof window.EyeDropper !== "function") {
      setWhiteboardStatus("The eyedropper is not supported in this browser. Use the color picker instead.");
      return;
    }
    new window.EyeDropper().open().then(({ sRGBHex }) => {
      const color = document.querySelector("[data-whiteboard-color]");
      if (!color) return;
      color.value = sRGBHex;
      color.dispatchEvent(new Event("input", { bubbles: true }));
      color.dispatchEvent(new Event("change", { bubbles: true }));
      setWhiteboardStatus(`${sRGBHex} matched from the screen.`);
    }).catch(() => setWhiteboardStatus("Eyedropper canceled. The current color was kept."));
    return;
  }
  if (action.dataset.action === "whiteboard-apply-background") {
    const type = document.querySelector("[data-whiteboard-background-type]")?.value ?? "white";
    if (type === "image" && !whiteboardBackground.imageSrc) {
      setWhiteboardStatus("Choose a background image first.");
      return;
    }
    whiteboardBackground.type = ["white", "solid", "gradient", "image"].includes(type) ? type : "white";
    whiteboardBackground.color1 = document.querySelector("[data-whiteboard-background-color-1]")?.value ?? "#ffffff";
    whiteboardBackground.color2 = document.querySelector("[data-whiteboard-background-color-2]")?.value ?? "#d8edf5";
    renderWhiteboardObjects();
    saveWhiteboard();
    setWhiteboardStatus(`${whiteboardBackground.type === "white" ? "Plain white" : whiteboardBackground.type === "solid" ? "Solid color" : whiteboardBackground.type === "gradient" ? "Gradient" : "Image"} background applied.`);
    return;
  }
  if (action.dataset.action === "whiteboard-download-selection") {
    try {
      if (!whiteboardSelectionDownload) {
        const result = whiteboardSelectionCanvas();
        if (!result) {
          setWhiteboardStatus("Use Lasso select for image and drag around the work before downloading.");
          return;
        }
        whiteboardSelectionDownload = result.canvas.toDataURL("image/png");
      }
      const link = document.createElement("a");
      link.download = "whiteboard-selection.png";
      link.href = whiteboardSelectionDownload;
      link.click();
      setWhiteboardStatus("Selected work downloaded as a PNG image.");
    } catch {
      setWhiteboardStatus("The selected image could not be downloaded from this browser.");
    }
    return;
  }
  if (action.dataset.action === "whiteboard-bob-directions") {
    setWhiteboardBobCoachState("directions");
    return;
  }
  if (action.dataset.action === "whiteboard-bob-collapse") {
    setWhiteboardBobCoachState("collapsed");
    return;
  }
  if (action.dataset.action === "whiteboard-bob-open") {
    setWhiteboardBobCoachState("directions");
    return;
  }
  if (action.dataset.action === "whiteboard-dimension-cancel") {
    whiteboardPendingDimension = null;
    const question = document.querySelector("[data-whiteboard-dimension-question]");
    if (question) question.hidden = true;
    renderWhiteboardObjects();
    setWhiteboardStatus("CAD measurement canceled.");
    return;
  }
  if (action.dataset.action === "whiteboard-dimension-save") {
    if (!whiteboardPendingDimension?.start || !whiteboardPendingDimension?.end) return;
    let choice = document.querySelector("[data-whiteboard-dimension-label]")?.value ?? "Length";
    const custom = document.querySelector("[data-whiteboard-dimension-custom]")?.value.trim();
    const suggestion = suggestedWhiteboardDimensionLabel(whiteboardPendingDimension.start, whiteboardPendingDimension.end);
    const tip = document.querySelector("[data-whiteboard-measurement-tip]");
    if (choice !== "custom" && choice !== suggestion.label) {
      whiteboardPendingDimension.attempts = Number(whiteboardPendingDimension.attempts ?? 0) + 1;
      if (whiteboardPendingDimension.attempts < 2) {
        if (tip) {
          tip.hidden = false;
          tip.textContent = `Try again. Tip: ${suggestion.tip}`;
        }
        setWhiteboardStatus("That label does not match the two laser points yet. Use the tip and try again.");
        return;
      }
      choice = suggestion.label;
      const labelControl = document.querySelector("[data-whiteboard-dimension-label]");
      if (labelControl) labelControl.value = choice;
      if (tip) {
        tip.hidden = false;
        tip.textContent = `The most logical answer is ${suggestion.label}. ${suggestion.tip}`;
      }
    }
    const label = choice === "custom" ? custom : choice;
    if (!label) {
      setWhiteboardStatus("Add your own measurement label before continuing.");
      return;
    }
    const unit = document.querySelector("[data-whiteboard-dimension-unit]")?.value ?? "cm";
    const { start, end } = whiteboardPendingDimension;
    pushWhiteboardHistory();
    const dimension = createWhiteboardObject("dimension", { x: start.x, y: start.y, width: end.x - start.x, height: end.y - start.y, annotationOffset: 18, label, unit, compareUnit: unit === "mm" ? "cm" : unit === "cm" ? "mm" : "cm", color: "#b52222", size: 3 });
    whiteboardObjects.push(dimension);
    whiteboardSelectedObjectId = dimension.id;
    whiteboardRulerUnit = unit === "in" ? "english" : "metric";
    whiteboardRuler.x = Math.min(start.x, end.x);
    whiteboardRuler.y = Math.max(40, Math.min(start.y, end.y) - 82);
    whiteboardRuler.angle = Math.atan2(end.y - start.y, end.x - start.x);
    whiteboardRuler.length = Math.max(150, Math.hypot(end.x - start.x, end.y - start.y));
    const rulerControl = document.querySelector("[data-whiteboard-ruler]");
    if (rulerControl) rulerControl.value = whiteboardRulerUnit;
    whiteboardPendingDimension = null;
    const question = document.querySelector("[data-whiteboard-dimension-question]");
    if (question) question.hidden = true;
    syncWhiteboardDimensionCompareControl();
    renderWhiteboardObjects();
    saveWhiteboard();
    showWhiteboardBobMeasurementCoach();
    setWhiteboardStatus(`CAD dimension added: ${label}. ${suggestion.tip}`);
    return;
  }
  if (action.dataset.action === "open-whiteboard") {
    const display = document.querySelector("#platform-classroom-whiteboard");
    if (display) {
      whiteboardDisplayTrigger = action;
      display.hidden = false;
      mountWhiteboard();
      display.focus();
    }
    return;
  }
  if (action.dataset.action === "whiteboard-keyboard-help") {
    const help = document.querySelector("[data-whiteboard-keyboard-help]");
    if (help) {
      help.hidden = false;
      help.querySelector("button")?.focus();
    }
    return;
  }
  if (action.dataset.action === "whiteboard-close-keyboard-help") {
    const help = document.querySelector("[data-whiteboard-keyboard-help]");
    if (help) help.hidden = true;
    document.querySelector('[data-action="whiteboard-keyboard-help"]')?.focus();
    return;
  }
  if (action.dataset.action === "close-whiteboard") {
    const display = document.querySelector("#platform-classroom-whiteboard");
    if (display) display.hidden = true;
    whiteboardDisplayTrigger?.focus();
    whiteboardDisplayTrigger = null;
    return;
  }
  if (action.dataset.action === "whiteboard-show-students") {
    const canvas = whiteboardCanvas();
    if (!canvas) return;
    const title = document.querySelector("[data-whiteboard-title]")?.value.trim() || "Whiteboard";
    const currentMemo = teacherMemo.read();
    const result = teacherMemo.save(title, { ...currentMemo, image: whiteboardStudentDisplayImage(canvas) });
    if (!result.ok || !result.state.image) {
      setWhiteboardStatus("The board could not be prepared for the Student Display. Try exporting it as a PNG.");
      return;
    }
    studentDisplayMode.select(STUDENT_DISPLAY_MODES.MESSAGE, { hasMemo: true });
    syncTeacherMemoPresentation();
    openClassroomPresentationWindow();
    syncClassroomPresentationWindow();
    setWhiteboardStatus("The current board is now showing on the Student Display. Click again after drawing to update it.");
    return;
  }
  if (action.dataset.action === "whiteboard-present" || action.dataset.action === "whiteboard-exit-presentation") {
    const display = document.querySelector("#platform-classroom-whiteboard");
    if (display) {
      const presenting = action.dataset.action === "whiteboard-present";
      display.dataset.presentation = String(presenting);
      const exit = display.querySelector('[data-action="whiteboard-exit-presentation"]');
      if (exit) exit.hidden = !presenting;
      if (!presenting) display.focus();
    }
    return;
  }
  if (action.dataset.action === "whiteboard-page-select") {
    openWhiteboardPage(Number(action.dataset.whiteboardPageIndex));
    return;
  }
  if (action.dataset.action === "whiteboard-page-previous" || action.dataset.action === "whiteboard-page-next") {
    openWhiteboardPage(whiteboardCurrentPageIndex + (action.dataset.action === "whiteboard-page-next" ? 1 : -1));
    return;
  }
  if (action.dataset.action === "whiteboard-page-add") {
    syncCurrentWhiteboardPage();
    whiteboardPages.push(newWhiteboardPage());
    openWhiteboardPage(whiteboardPages.length - 1, { save: false });
    setWhiteboardStatus("A new blank page was added.");
    return;
  }
  if (action.dataset.action === "whiteboard-page-duplicate") {
    syncCurrentWhiteboardPage();
    const source = whiteboardPages[whiteboardCurrentPageIndex];
    const copy = { id: globalThis.crypto?.randomUUID?.() ?? `page-${Date.now()}`, title: `${source.title} copy`.slice(0, 40), objects: structuredClone(source.objects) };
    whiteboardPages.splice(whiteboardCurrentPageIndex + 1, 0, copy);
    openWhiteboardPage(whiteboardCurrentPageIndex + 1, { save: false });
    setWhiteboardStatus("The current page was duplicated.");
    return;
  }
  if (action.dataset.action === "whiteboard-page-rename") {
    const page = whiteboardPages[whiteboardCurrentPageIndex];
    const rename = document.querySelector("[data-whiteboard-page-rename]");
    const input = rename?.querySelector("[data-whiteboard-page-name]");
    if (rename && input) {
      rename.hidden = false;
      input.value = page.title;
      input.focus();
      input.select();
    }
    return;
  }
  if (action.dataset.action === "whiteboard-page-rename-save") {
    const rename = document.querySelector("[data-whiteboard-page-rename]");
    const title = rename?.querySelector("[data-whiteboard-page-name]")?.value.trim().slice(0, 40);
    if (title) {
      whiteboardPages[whiteboardCurrentPageIndex].title = title;
      rename.hidden = true;
      renderWhiteboardPageStrip();
      saveWhiteboard();
      setWhiteboardStatus(`Page renamed to ${title}.`);
    }
    return;
  }
  if (action.dataset.action === "whiteboard-page-rename-cancel") {
    const rename = document.querySelector("[data-whiteboard-page-rename]");
    if (rename) rename.hidden = true;
    return;
  }
  if (action.dataset.action === "whiteboard-page-left" || action.dataset.action === "whiteboard-page-right") {
    syncCurrentWhiteboardPage();
    const destination = whiteboardCurrentPageIndex + (action.dataset.action === "whiteboard-page-right" ? 1 : -1);
    if (destination < 0 || destination >= whiteboardPages.length) return;
    [whiteboardPages[whiteboardCurrentPageIndex], whiteboardPages[destination]] = [whiteboardPages[destination], whiteboardPages[whiteboardCurrentPageIndex]];
    whiteboardCurrentPageIndex = destination;
    renderWhiteboardPageStrip();
    saveWhiteboard();
    setWhiteboardStatus("Page order updated.");
    return;
  }
  if (action.dataset.action === "whiteboard-page-delete") {
    if (whiteboardPages.length <= 1 || !window.confirm(`Delete ${whiteboardPages[whiteboardCurrentPageIndex].title}?`)) return;
    whiteboardPages.splice(whiteboardCurrentPageIndex, 1);
    whiteboardCurrentPageIndex = Math.min(whiteboardCurrentPageIndex, whiteboardPages.length - 1);
    whiteboardObjects = structuredClone(whiteboardPages[whiteboardCurrentPageIndex].objects ?? []);
    whiteboardSelectedObjectId = "";
    whiteboardUndoStack = [];
    whiteboardRedoStack = [];
    hydrateWhiteboardImages(() => renderWhiteboardObjects());
    renderWhiteboardObjects();
    renderWhiteboardPageStrip();
    saveWhiteboard();
    updateWhiteboardHistoryControls();
    setWhiteboardStatus("Page deleted.");
    return;
  }
  if (action.dataset.action === "whiteboard-save-named") {
    const canvas = whiteboardCanvas();
    const titleField = document.querySelector("[data-whiteboard-title]");
    const title = titleField?.value.trim();
    if (!canvas || !title) {
      setWhiteboardStatus("Add a board name before saving.");
      return;
    }
    const scheduleType = document.querySelector("[data-whiteboard-schedule-type]")?.value ?? "none";
    const date = document.querySelector("[data-whiteboard-date]")?.value ?? "";
    const studentDisplay = Boolean(document.querySelector("[data-whiteboard-student-display]")?.checked);
    if (scheduleType === "date" && !date) {
      setWhiteboardStatus("Choose the specific date before saving.");
      return;
    }
    if (studentDisplay && scheduleType === "none") {
      setWhiteboardStatus("Choose a weekly schedule or specific date for automatic Student Display use.");
      return;
    }
    whiteboardDrawingTitle = title;
    renderWhiteboardObjects(canvas);
    syncCurrentWhiteboardPage();
    const boards = readWhiteboardLibrary();
    const board = { id: globalThis.crypto?.randomUUID?.() ?? `board-${Date.now()}`, title, classId: document.querySelector("[data-whiteboard-class]")?.value ?? "all", scheduleType, day: scheduleType === "weekly" ? document.querySelector("[data-whiteboard-day]")?.value ?? WEEKDAYS[0] : "", date: scheduleType === "date" ? date : "", studentDisplay, gridUnit: whiteboardGridUnit, rulerUnit: whiteboardRulerUnit, ruler: structuredClone(whiteboardRuler), background: { type: whiteboardBackground.type, color1: whiteboardBackground.color1, color2: whiteboardBackground.color2, imageSrc: whiteboardBackground.imageSrc }, image: whiteboardSnapshot(canvas), displayImage: studentDisplay ? whiteboardStudentDisplayImage(canvas) : "", objects: serializableWhiteboardObjects(), pages: structuredClone(whiteboardPages), currentPageIndex: whiteboardCurrentPageIndex, savedAt: Date.now() };
    boards.unshift(board);
    if (!writeWhiteboardLibrary(boards)) {
      setWhiteboardStatus("This board is too large for browser storage. Export it as a PNG instead.");
      return;
    }
    refreshWhiteboardLibraryOptions(board.id);
    setWhiteboardStatus(`Saved \u201C${title}\u201D for later use.`);
    refreshCurrentClassPlan();
    return;
  }
  if (action.dataset.action === "whiteboard-load") {
    const id = document.querySelector("[data-whiteboard-saved]")?.value;
    const board = readWhiteboardLibrary().find((item) => item.id === id);
    if (!board) {
      setWhiteboardStatus("Choose a saved board to load.");
      return;
    }
    pushWhiteboardHistory();
    if (Array.isArray(board.pages) && board.pages.length) {
      whiteboardPages = structuredClone(board.pages);
      whiteboardCurrentPageIndex = Math.min(Math.max(0, Number(board.currentPageIndex) || 0), whiteboardPages.length - 1);
      whiteboardObjects = structuredClone(whiteboardPages[whiteboardCurrentPageIndex].objects ?? []);
    } else {
      whiteboardObjects = Array.isArray(board.objects) && board.objects.length ? structuredClone(board.objects) : [createWhiteboardObject("image", { x: 0, y: 0, width: whiteboardCanvas().width, height: whiteboardCanvas().height, src: board.image })];
      whiteboardPages = [{ ...newWhiteboardPage("Page 1"), objects: structuredClone(whiteboardObjects) }];
      whiteboardCurrentPageIndex = 0;
    }
    whiteboardGridUnit = ["plain", "inch", "cm", "mm"].includes(board.gridUnit) ? board.gridUnit : "plain";
    whiteboardBackground = { type: "white", color1: "#ffffff", color2: "#d8edf5", imageSrc: "", element: null, ...board.background ?? {} };
    if (whiteboardBackground.imageSrc) {
      const backgroundImage = new Image();
      backgroundImage.onload = () => {
        whiteboardBackground.element = backgroundImage;
        renderWhiteboardObjects();
      };
      backgroundImage.src = whiteboardBackground.imageSrc;
    }
    whiteboardRulerUnit = ["none", "english", "metric"].includes(board.rulerUnit) ? board.rulerUnit : "none";
    whiteboardRuler = board.ruler && typeof board.ruler === "object" ? { ...whiteboardRuler, ...board.ruler } : whiteboardRuler;
    whiteboardDrawingTitle = board.title || "Workshop Drawing";
    const gridControl = document.querySelector("[data-whiteboard-grid]");
    const rulerControl = document.querySelector("[data-whiteboard-ruler]");
    const rulerSides = document.querySelector("[data-whiteboard-ruler-sides]");
    if (gridControl) gridControl.value = whiteboardGridUnit;
    if (rulerControl) rulerControl.value = whiteboardRulerUnit;
    if (rulerSides) rulerSides.value = whiteboardRuler.sides;
    whiteboardSelectedObjectId = "";
    renderWhiteboardPageStrip();
    hydrateWhiteboardImages(() => {
      renderWhiteboardObjects();
      saveWhiteboard();
    });
    renderWhiteboardObjects();
    const title = document.querySelector("[data-whiteboard-title]");
    if (title) title.value = board.title;
    const scheduleType = document.querySelector("[data-whiteboard-schedule-type]");
    const weekday = document.querySelector("[data-whiteboard-day]");
    const date = document.querySelector("[data-whiteboard-date]");
    const studentDisplay = document.querySelector("[data-whiteboard-student-display]");
    if (scheduleType) scheduleType.value = board.scheduleType === "date" ? "date" : board.scheduleType === "weekly" && board.day && board.day !== "any" ? "weekly" : "none";
    if (weekday && board.day && board.day !== "any") weekday.value = board.day;
    if (date) date.value = board.date ?? "";
    if (studentDisplay) studentDisplay.checked = board.studentDisplay === true;
    if (scheduleType) scheduleType.dispatchEvent(new Event("change", { bubbles: true }));
    setWhiteboardStatus(`Loaded \u201C${board.title}\u201D.`);
    return;
  }
  if (action.dataset.action === "whiteboard-delete") {
    const id = document.querySelector("[data-whiteboard-saved]")?.value;
    const boards = readWhiteboardLibrary();
    const board = boards.find((item) => item.id === id);
    if (!board) {
      setWhiteboardStatus("Choose a saved board to delete.");
      return;
    }
    writeWhiteboardLibrary(boards.filter((item) => item.id !== id));
    refreshWhiteboardLibraryOptions();
    setWhiteboardStatus(`Deleted the saved copy of \u201C${board.title}\u201D. The open board was not cleared.`);
    return;
  }
  if (action.dataset.action === "whiteboard-export") {
    const canvas = whiteboardCanvas();
    if (!canvas) return;
    const title = document.querySelector("[data-whiteboard-title]")?.value.trim() || "classroom-whiteboard";
    const link = document.createElement("a");
    link.download = `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "classroom-whiteboard"}.png`;
    link.href = whiteboardSnapshot(canvas);
    link.click();
    setWhiteboardStatus("Whiteboard exported as a PNG image.");
    return;
  }
  if (action.dataset.action === "whiteboard-add-text") {
    const canvas = whiteboardCanvas();
    const field = document.querySelector("[data-whiteboard-text]");
    const text = field?.value.trim();
    if (!canvas || !text) return;
    pushWhiteboardHistory();
    const size = Math.max(22, Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6) * 5);
    const object = createWhiteboardObject("text", { text, x: 35, y: Math.min(canvas.height - 80, 30 + whiteboardObjects.length * 24), width: Math.min(canvas.width - 70, Math.max(180, text.length * size * 0.55)), height: size * 1.3, fontSize: size, fontFamily: document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial", color: document.querySelector("[data-whiteboard-text-color]")?.value ?? document.querySelector("[data-whiteboard-color]")?.value ?? "#12384d", background: document.querySelector("[data-whiteboard-text-background]")?.value ?? "transparent", cursiveGuide: document.querySelector("[data-whiteboard-cursive-lines]")?.value ?? "none", bold: document.querySelector('[data-text-command="bold"]')?.getAttribute("aria-pressed") === "true", italic: document.querySelector('[data-text-command="italic"]')?.getAttribute("aria-pressed") === "true", underline: document.querySelector('[data-text-command="underline"]')?.getAttribute("aria-pressed") === "true", rotation: 0 });
    whiteboardObjects.push(object);
    whiteboardSelectedObjectId = object.id;
    field.value = "";
    renderWhiteboardObjects(canvas);
    saveWhiteboard(canvas);
    updateWhiteboardHistoryControls();
    return;
  }
  if (action.dataset.action === "whiteboard-apply-text-background") {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type !== "text") {
      setWhiteboardStatus("Select a text object before applying a text background.");
      return;
    }
    pushWhiteboardHistory();
    selected.background = document.querySelector("[data-whiteboard-text-background]")?.value ?? "transparent";
    renderWhiteboardObjects();
    saveWhiteboard();
    setWhiteboardStatus("Text background updated.");
    return;
  }
  if (action.dataset.action === "whiteboard-apply-all-3d-face-colors") {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    const is3D = Boolean(selected?.extruded3D || ["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(selected?.type));
    if (!selected || !is3D) {
      setWhiteboardStatus("Select a 3D shape before changing its face colors.");
      return;
    }
    const faceColors = { front: document.querySelector("[data-whiteboard-3d-front-color]")?.value ?? "#287da0", side: document.querySelector("[data-whiteboard-3d-side-color]")?.value ?? "#f0a52b", top: document.querySelector("[data-whiteboard-3d-top-color]")?.value ?? "#55a875" };
    pushWhiteboardHistory();
    selected.faceColors = faceColors;
    renderWhiteboardObjects();
    saveWhiteboard();
    updateWhiteboardHistoryControls();
    setWhiteboardStatus("Front, side, and top or back face colors updated together.");
    return;
  }
  if (["whiteboard-copy", "whiteboard-paste", "whiteboard-duplicate", "whiteboard-push-2d", "whiteboard-rotate-left", "whiteboard-rotate-right", "whiteboard-delete-object"].includes(action.dataset.action)) {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (action.dataset.action === "whiteboard-copy") {
      if (selected) {
        whiteboardClipboard = structuredClone(serializableWhiteboardObjects().find((object) => object.id === selected.id));
        if (selected.type === "image") void copySelectedWhiteboardObjectAsImage();
        else setWhiteboardStatus("Selected object copied.");
      } else setWhiteboardStatus("Select an object first.");
      return;
    }
    if (action.dataset.action === "whiteboard-paste") {
      if (!whiteboardClipboard) {
        setWhiteboardStatus("Copy an object before pasting.");
        return;
      }
      pushWhiteboardHistory();
      const copy = duplicateWhiteboardObject(whiteboardClipboard);
      whiteboardObjects.push(copy);
      whiteboardSelectedObjectId = copy.id;
      hydrateWhiteboardImages(() => renderWhiteboardObjects());
      saveWhiteboard();
      return;
    }
    if (!selected && action.dataset.action === "whiteboard-delete-object") {
      whiteboardDeleteNextObject = true;
      whiteboardCanvas()?.focus({ preventScroll: true });
      setWhiteboardStatus("Delete is ready. Click the next object you want to remove.");
      return;
    }
    if (!selected) {
      setWhiteboardStatus("Select an object first.");
      return;
    }
    if (action.dataset.action === "whiteboard-push-2d") {
      const flattened = flattenWhiteboard3DShape(selected);
      if (!flattened.length) {
        setWhiteboardStatus("Select a 3D object first.");
        return;
      }
      pushWhiteboardHistory();
      const selectedIndex = whiteboardObjects.findIndex((object) => object.id === selected.id);
      whiteboardObjects.splice(selectedIndex, 1, ...flattened);
      whiteboardSelectedObjectId = flattened[0]?.id ?? "";
      renderWhiteboardObjects();
      saveWhiteboard();
      setWhiteboardStatus(flattened.length > 1 ? `The 3D shape was unfolded into ${flattened.length} editable 2D shapes.` : "The object was pushed back to its original 2D form.");
      return;
    }
    if (["whiteboard-rotate-left", "whiteboard-rotate-right"].includes(action.dataset.action)) {
      if (["path", "dimension"].includes(selected.type)) {
        setWhiteboardStatus("Rotation is available for images, text, lines, arrows, and 2D or 3D shapes.");
        return;
      }
      pushWhiteboardHistory();
      selected.rotation = (selected.rotation ?? 0) + (action.dataset.action === "whiteboard-rotate-left" ? -Math.PI / 12 : Math.PI / 12);
      renderWhiteboardObjects();
      saveWhiteboard();
      setWhiteboardStatus("Selected object rotated 15 degrees.");
      return;
    }
    pushWhiteboardHistory();
    if (action.dataset.action === "whiteboard-duplicate") {
      const copy = duplicateWhiteboardObject(selected);
      whiteboardObjects.push(copy);
      whiteboardSelectedObjectId = copy.id;
      hydrateWhiteboardImages(() => renderWhiteboardObjects());
    } else {
      whiteboardObjects = whiteboardObjects.filter((object) => object.id !== selected.id);
      whiteboardSelectedObjectId = "";
    }
    renderWhiteboardObjects();
    saveWhiteboard();
    return;
  }
  if (action.dataset.action === "whiteboard-undo" || action.dataset.action === "whiteboard-redo") {
    const canvas = whiteboardCanvas();
    if (!canvas) return;
    const source = action.dataset.action === "whiteboard-undo" ? whiteboardUndoStack : whiteboardRedoStack;
    const target = action.dataset.action === "whiteboard-undo" ? whiteboardRedoStack : whiteboardUndoStack;
    const snapshot = source.pop();
    if (!snapshot) return;
    target.push(JSON.stringify(serializableWhiteboardObjects()));
    whiteboardObjects = JSON.parse(snapshot);
    whiteboardSelectedObjectId = "";
    hydrateWhiteboardImages(() => renderWhiteboardObjects(canvas));
    renderWhiteboardObjects(canvas);
    saveWhiteboard(canvas);
    updateWhiteboardHistoryControls();
    return;
  }
  if (action.dataset.action === "whiteboard-clear") {
    const confirmation = document.querySelector("[data-whiteboard-clear-confirmation]");
    if (confirmation) confirmation.hidden = false;
    return;
  }
  if (action.dataset.action === "whiteboard-keep") {
    const confirmation = document.querySelector("[data-whiteboard-clear-confirmation]");
    if (confirmation) confirmation.hidden = true;
    return;
  }
  if (action.dataset.action === "whiteboard-confirm-clear") {
    const canvas = whiteboardCanvas();
    if (canvas) {
      pushWhiteboardHistory();
      whiteboardObjects = [];
      whiteboardSelectedObjectId = "";
      renderWhiteboardObjects(canvas);
      saveWhiteboard(canvas);
    }
    whiteboardRedoStack = [];
    updateWhiteboardHistoryControls();
    const confirmation = document.querySelector("[data-whiteboard-clear-confirmation]");
    if (confirmation) confirmation.hidden = true;
    return;
  }
  if (action.dataset.action === "voice-meter-start") {
    void startVoiceMeter();
    return;
  }
  if (action.dataset.action === "voice-meter-stop") {
    stopVoiceMeter(action.dataset.meterStopMessage);
    return;
  }
  if (action.dataset.action === "open-voice-meter-display") {
    const display = document.querySelector("#platform-large-voice-meter-display");
    if (display) {
      voiceMeterDisplayTrigger = action;
      display.hidden = false;
      display.focus();
    }
    return;
  }
  if (action.dataset.action === "close-voice-meter-display") {
    const display = document.querySelector("#platform-large-voice-meter-display");
    if (display) display.hidden = true;
    voiceMeterDisplayTrigger?.focus();
    voiceMeterDisplayTrigger = null;
    return;
  }
  if (action.dataset.action === "reflection-dictate") {
    void startReflectionDictation(action);
    return;
  }
  if (action.dataset.action === "reflection-dictate-stop") {
    reflectionRecognition?.stop();
    const status = action.closest("form")?.querySelector("[data-reflection-speech-status]");
    if (status) status.textContent = "Stopping\u2026";
    return;
  }
  if (action.dataset.action === "open-manage-classes-section") {
    event.preventDefault();
    pendingScrollTarget = action.dataset.scrollTarget ?? "";
    navigate(ROUTES.TEACHER_CLASSES);
    return;
  }
  if (action.dataset.action === "open-teacher-dashboard-section") {
    event.preventDefault();
    pendingScrollTarget = action.dataset.scrollTarget ?? "";
    navigate(ROUTES.TEACHER_DASHBOARD);
    return;
  }
  if (action.dataset.action === "add-lesson-step") {
    const builder = document.querySelector('[data-lesson-builder="steps"]');
    const editor = builder?.querySelector(".platform-direction-editor");
    if (builder) builder.open = true;
    if (editor) editor.open = true;
    editor?.querySelector('[name="title"]')?.focus();
    return;
  }
  if (["save-direction-card", "save-release-direction-card", "edit-direction-card", "release-direction-card", "withdraw-direction-card", "duplicate-direction-card", "move-direction-card", "remove-direction-card", "cancel-direction-edit"].includes(action.dataset.action)) {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-activity-directions-teacher]") ?? document.querySelector("[data-activity-directions-teacher]");
    const form = region?.querySelector('[data-form="activity-direction"]');
    if (!classId || !region || !form) return;
    const id = action.dataset.directionId;
    if (["save-direction-card", "save-release-direction-card"].includes(action.dataset.action)) {
      const resources = [...form.querySelectorAll("[data-direction-resource-list] .platform-direction-resource-row")].map((row) => ({ mediaType: row.querySelector('[name="resourceType"]').value, title: row.querySelector('[name="resourceTitle"]').value.trim(), url: row.querySelector('[name="resourceUrl"]').value.trim() })).filter((item) => item.url);
      const result = activityDirections.saveCard(classId, { id: form.elements.id.value, title: form.elements.title.value, directions: form.elements.directions.value, resources });
      if (!result.ok) {
        const output = form.querySelector("[data-activity-direction-status]");
        if (output) output.textContent = result.reason === "missing-media" ? "Add a secure https link for the selected media." : "Add both a card title and student directions.";
        return;
      }
      const visibility = form.elements.visibility?.value || (action.dataset.action === "save-release-direction-card" ? "released" : "draft");
      if (visibility === "released") activityDirections.release(classId, result.card.id);
      else activityDirections.withdraw(classId, result.card.id);
      const savedCard = activityDirections.read(classId).cards.find((item) => item.id === result.card.id);
      action.disabled = true;
      await saveLessonStepToService(classId, savedCard);
    }
    if (action.dataset.action === "edit-direction-card") {
      const card = activityDirections.read(classId).cards.find((item) => item.id === id);
      if (!card) return;
      form.elements.id.value = card.id;
      form.elements.title.value = card.title;
      form.elements.directions.value = card.directions;
      if (form.elements.visibility) form.elements.visibility.value = card.status;
      const resourceList = form.querySelector("[data-direction-resource-list]");
      if (resourceList) resourceList.innerHTML = (card.resources || []).map(directionResourceEditorRow).join("");
      form.closest("details").open = true;
      form.elements.title.focus();
      return;
    }
    if (action.dataset.action === "release-direction-card") {
      activityDirections.release(classId, id);
      action.disabled = true;
      await saveLessonStepToService(classId, activityDirections.read(classId).cards.find((item) => item.id === id));
    }
    if (action.dataset.action === "withdraw-direction-card") {
      activityDirections.withdraw(classId, id);
      action.disabled = true;
      await saveLessonStepToService(classId, activityDirections.read(classId).cards.find((item) => item.id === id));
    }
    if (action.dataset.action === "duplicate-direction-card") activityDirections.duplicate(classId, id);
    if (action.dataset.action === "move-direction-card") activityDirections.move(classId, id, Number(action.dataset.directionOffset));
    if (action.dataset.action === "remove-direction-card") activityDirections.remove(classId, id);
    region.outerHTML = activityDirectionsTeacherMarkup(classId);
    return;
  }
  if (["add-direction-resource", "remove-direction-resource", "move-direction-resource"].includes(action.dataset.action)) {
    const list = action.closest('[data-form="activity-direction"]')?.querySelector("[data-direction-resource-list]");
    if (!list) return;
    if (action.dataset.action === "add-direction-resource") list.insertAdjacentHTML("beforeend", directionResourceEditorRow());
    if (action.dataset.action === "remove-direction-resource") action.closest(".platform-direction-resource-row")?.remove();
    if (action.dataset.action === "move-direction-resource") {
      const row = action.closest(".platform-direction-resource-row"), offset = Number(action.dataset.offset), sibling = offset < 0 ? row?.previousElementSibling : row?.nextElementSibling;
      if (row && sibling) offset < 0 ? list.insertBefore(row, sibling) : list.insertBefore(sibling, row);
    }
    return;
  }
  if (action.dataset.action === "close-optional-dashboard-section") {
    const section = action.closest("[data-optional-dashboard-section]");
    if (section) section.hidden = true;
    document.querySelector("#teacher-classroom-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (["prepare-class-resource", "push-class-resource", "hide-class-resource", "push-saved-resource", "remove-saved-resource"].includes(action.dataset.action)) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    const form = region?.querySelector('[data-form="class-resource"]');
    if (!classId || !region || !form) return;
    let result = { ok: true };
    if (["prepare-class-resource", "push-class-resource"].includes(action.dataset.action)) {
      const result2 = classResourceSharing.prepare(classId, { type: form.elements.type.value, title: form.elements.title.value, url: form.elements.url.value, release: form.elements.release.value });
      if (!result2.ok) {
        const status = region.querySelector("[data-class-resource-status]");
        if (status) status.textContent = "Add a title and a safe http(s) or platform resource address.";
        return;
      }
    }
    if (action.dataset.action === "push-class-resource") result = classResourceSharing.push(classId, form.elements.slot.value, form.elements.rowId.value);
    if (action.dataset.action === "hide-class-resource") classResourceSharing.stop(classId, action.dataset.resourceIndex, action.dataset.resourceRowId);
    if (action.dataset.action === "push-saved-resource") result = classResourceSharing.pushSaved(classId, action.dataset.resourceId, form.elements.slot.value, form.elements.rowId.value);
    if (action.dataset.action === "remove-saved-resource") classResourceSharing.removeSaved(classId, action.dataset.resourceId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    if (!result.ok && result.reason === "tray-full") {
      const status = document.querySelector("[data-class-resource-status]");
      if (status) status.textContent = "Every current slot is full. Choose Add an Additional Slot, replace a slot, or uncheck a resource.";
    }
    return;
  }
  if (action.dataset.action === "print-classroom-codes") {
    window.print();
    return;
  }
  if (action.dataset.action === "timer-recommend-phases") {
    const form = action.closest('form[data-form="class-timer-schedule"]');
    const duration = Number(form?.querySelector('[name="durationMinutes"]')?.value);
    const recommended = recommendedTimerPhases(duration);
    recommended.forEach((phase) => {
      const input = form?.querySelector(`[data-phase-start="${phase.key}"]`);
      if (input) input.value = String(phase.startMinute);
    });
    return;
  }
  if (action.dataset.action === "timer-test-sound") {
    const form = action.closest("form");
    const selected = form?.querySelector(`[name="${action.dataset.soundField}"]`)?.value;
    if (selected === "Custom Upload") {
      const fileField = form?.querySelector(`[name="${action.dataset.soundField}File"]`);
      const stored = classTimerSchedule.read()[action.dataset.soundField.replace("Sound", "CustomAudio")];
      void readTimerAudioFile(fileField?.files?.[0]).then((audio) => playTimerSound(selected, audio || stored)).catch(() => {
        const output = form?.querySelector("[data-class-timer-schedule-error]");
        if (output) {
          output.textContent = "Choose a valid custom audio file of 750 KB or smaller.";
          output.hidden = false;
        }
      });
    } else playTimerSound(selected);
    return;
  }
  if (action.dataset.action === "close-classroom-codes") {
    oneTimeClassroomCodes = null;
    const region = document.querySelector("[data-classroom-setup]");
    if (region) region.outerHTML = classroomSetupMarkup();
    return;
  }
  if (action.dataset.action === "evidence-start") {
    evidenceDraft = { type: action.dataset.evidenceType, detail: "", fileName: "", file: null, previewUrl: "", hasSelection: false };
    evidenceNotice = "";
    renderEvidenceFoundation();
    document.querySelector("#evidence-capture-title")?.focus();
    return;
  }
  if (action.dataset.action === "evidence-teacher-launch") {
    void launchEvidencePilot();
    return;
  }
  if (action.dataset.action === "evidence-teacher-refresh") {
    void refreshTeacherLiveEvidence();
    return;
  }
  if (action.dataset.action === "evidence-teacher-live-open") {
    void openTeacherLiveEvidence(action.dataset.evidenceId);
    return;
  }
  if (action.dataset.action === "governance-simulation-cancel") {
    evidenceGovernanceSimulation.cancel();
    renderGovernanceSimulation();
    return;
  }
  if (action.dataset.action === "governance-simulation-reset") {
    evidenceGovernanceSimulation.reset();
    renderGovernanceSimulation();
    return;
  }
  if (action.dataset.action === "google-connection-preview-begin") {
    googleConnectionPreview.begin();
    renderGoogleConnectionPreview();
    return;
  }
  if (action.dataset.action === "google-connection-preview-cancel") {
    googleConnectionPreview.cancel();
    renderGoogleConnectionPreview();
    return;
  }
  if (action.dataset.action === "google-connection-preview-disconnect") {
    googleConnectionPreview.disconnect();
    renderGoogleConnectionPreview();
    return;
  }
  if (action.dataset.action === "teacher-evidence-open") {
    teacherEvidenceSelection = action.dataset.evidenceId;
    renderTeacherEvidenceReview();
    document.querySelector(".platform-teacher-evidence-detail")?.focus();
    return;
  }
  if (action.dataset.action === "evidence-retake") {
    if (evidenceDraft?.previewUrl) URL.revokeObjectURL(evidenceDraft.previewUrl);
    evidenceDraft = { ...evidenceDraft, detail: "", fileName: "", file: null, previewUrl: "", hasSelection: false };
    evidenceNotice = "Ready for another capture. Nothing was saved.";
    renderEvidenceFoundation();
    return;
  }
  if (action.dataset.action === "evidence-cancel") {
    if (evidenceDraft?.previewUrl) URL.revokeObjectURL(evidenceDraft.previewUrl);
    evidenceDraft = null;
    evidenceNotice = "Capture canceled. Nothing was saved.";
    renderEvidenceFoundation();
    return;
  }
  if (action.dataset.action === "evidence-open-log") {
    document.querySelector("#student-evidence-log")?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector("#evidence-log-title")?.focus();
    return;
  }
  if (action.dataset.action === "evidence-save") {
    void saveEvidenceDraft();
    return;
  }
  if (action.dataset.action === "sign-out") {
    stopVoiceMeter();
    storeLessonTimerDisplayOpen(false);
    lessonTimer.clear();
    session.signOut();
    teacherMemo.clear();
    todaysMission.clear();
    studentDisplayMode.clear();
    navigate(ROUTES.WELCOME, { replace: true });
    if (studentTimerPopout && !studentTimerPopout.closed) studentTimerPopout.close();
    studentTimerPopout = null;
    if (classroomPresentationWindow && !classroomPresentationWindow.closed) classroomPresentationWindow.close();
    classroomPresentationWindow = null;
    if (productionIdentityConfig.enabled) void productionIdentity.signOut();
    pb002jClasswide.signOut();
  }
  if (action.dataset.action === "pb002j-withdraw") {
    void pb002jClasswide.handleWithdraw();
  }
  if (action.dataset.action === "reserved-nav") {
    const status = document.querySelector("#teacher-nav-status");
    if (status) status.textContent = `${action.dataset.label}: Coming in future build.`;
  }
  if (action.dataset.action === "select-student") {
    const state = session.read();
    const student = getStudentById(action.dataset.studentId);
    if (!student || student.classId !== state.pendingClassId) return navigate(ROUTES.STUDENT_ENTRY, { replace: true });
    session.selectStudent(student.id);
    navigate(ROUTES.STUDENT_IDENTIFIER);
  }
  if (action.dataset.action === "instant-timer") {
    lessonTimer.setDuration(Number(action.dataset.instantMinutes));
    lessonTimer.start();
    syncLessonTimerPresentation();
    return;
  }
  if (action.dataset.action === "stopwatch-start") {
    if (stopwatchInterval === null) stopwatchInterval = window.setInterval(() => {
      stopwatchSeconds += 1;
      document.querySelectorAll("[data-stopwatch-output]").forEach((output) => {
        output.textContent = formatLessonTime(stopwatchSeconds);
      });
    }, 1e3);
    return;
  }
  if (action.dataset.action === "stopwatch-pause") {
    if (stopwatchInterval !== null) window.clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    return;
  }
  if (action.dataset.action === "stopwatch-reset") {
    if (stopwatchInterval !== null) window.clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchSeconds = 0;
    document.querySelectorAll("[data-stopwatch-output]").forEach((output) => {
      output.textContent = formatLessonTime(0);
    });
    return;
  }
  if (action.dataset.action === "timer-view-mode") {
    setPresentationTimerViewMode(action.dataset.timerViewMode);
    return;
  }
  if (action.dataset.action === "timer-start-or-resume") {
    lessonTimer.read().status === LESSON_TIMER_STATES.PAUSED ? lessonTimer.resume() : lessonTimer.start();
    syncLessonTimerPresentation();
    return;
  }
  const timerActions = {
    "timer-start": () => lessonTimer.start(),
    "timer-pause": () => lessonTimer.pause(),
    "timer-resume": () => lessonTimer.resume(),
    "timer-reset": () => lessonTimer.reset(),
    "timer-end": () => lessonTimer.end(),
    "timer-subtract-minute": () => lessonTimer.subtractMinute(),
    "timer-add-minute": () => lessonTimer.addMinute()
  };
  if (timerActions[action.dataset.action]) {
    timerActions[action.dataset.action]();
    syncLessonTimerPresentation();
  }
  if (action.dataset.action === "clear-teacher-memo") {
    teacherMemo.clear();
    syncTeacherMemoPresentation();
    const error = document.querySelector("[data-teacher-memo-error]");
    const status = document.querySelector("[data-teacher-memo-status]");
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    if (status) {
      status.dataset.state = "empty";
      status.textContent = "Memo cleared. No memo is currently saved.";
    }
  }
  if (action.dataset.action === "apply-memo-format") {
    if (!applyMemoFormatToSelection()) {
      const status = document.querySelector("[data-teacher-memo-status]");
      if (status) status.textContent = "Highlight some memo text, then apply formatting.";
    }
  }
  if (action.dataset.action === "apply-class-setup") {
    const section = action.closest(".platform-class-setup-sharing");
    const currentId = classSetupProfiles.read().currentClassId;
    preserveCurrentClassSetup(currentId);
    const all = section?.querySelector("[data-class-setup-all]")?.checked;
    const targets = all ? pilotTeacherClasses.filter((item) => item.id !== currentId).map((item) => item.id) : [...section?.querySelectorAll("[data-class-setup-target]:checked") ?? []].map((input) => input.value);
    const components = Object.fromEntries([...section?.querySelectorAll("[data-class-setup-component]") ?? []].map((input) => [input.dataset.classSetupComponent, input.checked]));
    const targetNames = pilotTeacherClasses.filter((item) => targets.includes(item.id)).map((item) => item.periodLabel).join(", ");
    if (!targets.length || !components.timer && !components.memo && !components.resources && !components.reflection) {
      const status2 = section?.querySelector("[data-class-setup-status]");
      if (status2) status2.textContent = "Choose at least one class and one setup type.";
      return;
    }
    if (!window.confirm(`Apply the selected setup to ${targetNames}? Unselected settings will remain unchanged.`)) return;
    classSetupProfiles.copy(currentId, targets, components);
    if (components.resources) targets.forEach((classId) => classResourceSharing.copyPlan(currentId, classId));
    if (components.reflection) {
      const required = weeklyReflections.requirement(currentId);
      targets.forEach((classId) => weeklyReflections.setRequirement(classId, required));
    }
    const status = section?.querySelector("[data-class-setup-status]");
    if (status) status.textContent = `Setup copied to ${targetNames}.`;
  }
  if (action.dataset.action === "save-message-to-library") {
    const title = document.querySelector("[data-message-library-title]")?.value ?? "";
    const memo = teacherMemo.read();
    const result = messageLibrary.save({ title, ...memo });
    if (!result.ok) {
      const status = document.querySelector("[data-message-library-status]");
      if (status) status.textContent = result.reason === "limit" ? "The 20-message library is full." : "Add a title and save a memo first.";
      return;
    }
    render();
  }
  if (action.dataset.action === "save-class-message") {
    const region = action.closest(".platform-class-message-creator");
    const result = messageLibrary.save({
      title: region?.querySelector("[data-class-message-title]")?.value ?? "",
      text: region?.querySelector("[data-class-message-text]")?.value ?? "",
      color: region?.querySelector("[data-class-message-color]")?.value ?? "white",
      size: region?.querySelector("[data-class-message-size]")?.value ?? "extra-large",
      style: region?.querySelector("[data-class-message-style]")?.value ?? "bold"
    });
    if (!result.ok) {
      const status = region?.querySelector("[data-class-message-status]");
      if (status) status.textContent = result.reason === "limit" ? "The shared library is full. Delete an older message first." : "Add both a message title and message text.";
      return;
    }
    render();
    return;
  }
  if (action.dataset.action === "use-saved-message") {
    const message = messageLibrary.read().messages.find((item) => item.id === action.dataset.messageId);
    if (message) {
      teacherMemo.save(message.text, message);
      render();
    }
  }
  if (action.dataset.action === "delete-saved-message") {
    if (window.confirm("Delete this saved message?")) {
      messageLibrary.remove(action.dataset.messageId);
      render();
    }
  }
  if (action.dataset.action === "delete-captains-log-prompt") {
    if (window.confirm("Delete this Captain\u2019s Log prompt from My Library?")) {
      weeklyReflections.deleteCaptainLogPrompt(action.dataset.promptId);
      render();
    }
  }
  if (action.dataset.action === "save-message-assignments") {
    document.querySelectorAll("[data-message-assignment]").forEach((select) => messageLibrary.assign(action.dataset.classId, select.dataset.messageAssignment, select.value));
    render();
  }
  if (action.dataset.action === "clear-todays-mission") {
    const confirmation = document.querySelector("[data-todays-mission-confirmation]");
    if (confirmation && confirmation.hidden) {
      confirmation.hidden = false;
      confirmation.querySelector('[data-action="keep-todays-mission"]')?.focus();
    }
  }
  if (action.dataset.action === "keep-todays-mission") {
    closeTodaysMissionClearConfirmation();
  }
  if (action.dataset.action === "confirm-clear-todays-mission") {
    if (action.disabled) return;
    action.disabled = true;
    todaysMission.clear();
    syncTodaysMissionPresentation();
    const form = document.querySelector('[data-form="todays-mission"]');
    if (form) {
      form.elements.title.value = "";
      form.querySelectorAll('input[type="checkbox"]').forEach((control) => {
        control.checked = false;
      });
    }
    const titleCount = document.querySelector("[data-todays-mission-title-count]");
    const focusCount = document.querySelector("[data-todays-mission-focus-count]");
    const error = document.querySelector("[data-todays-mission-error]");
    const status = document.querySelector("[data-todays-mission-status]");
    if (titleCount) titleCount.textContent = "0";
    if (focusCount) focusCount.textContent = "0";
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    if (status) {
      status.dataset.state = "empty";
      status.textContent = "Today\u2019s Plan cleared. No plan is currently saved.";
    }
    closeTodaysMissionClearConfirmation({ restoreFocus: false });
  }
  if (action.dataset.action === "select-presentation-mode") {
    const hasMessageContent = Boolean(teacherMemo.read().text || todaysMission.read().title);
    const result = studentDisplayMode.select(action.dataset.presentationMode, { hasMemo: hasMessageContent });
    if (result.ok) syncStudentDisplayPresentation();
  }
  if (action.dataset.action === "open-amig-anchor-chart") {
    openClassroomPresentationWindow();
    const chart = classroomPresentationWindow?.document.querySelector('[data-smartboard-tool="amig"]');
    if (chart) {
      chart.hidden = false;
      bringSmartboardToolForward(chart);
      chart.focus?.();
    }
    const status = document.querySelector("[data-classroom-window-status]");
    if (status && chart) status.textContent = "The AMIG Anchor Chart is showing on the Classroom Display.";
  }
  if (action.dataset.action === "open-timer-display") {
    syncStudentDisplayPresentation();
    const display = document.querySelector("#platform-student-timer-display");
    if (display) {
      lessonTimerDisplayTrigger = action;
      storeLessonTimerDisplayOpen(true);
      display.hidden = false;
      display.focus();
      window.requestAnimationFrame(fitStudentMemoPresentation);
      if (studentDisplayVoiceMeterIsEnabled() && !voiceMeterStream) void startVoiceMeter();
    }
  }
  if (action.dataset.action === "open-name-picker-display") {
    syncStudentDisplayPresentation();
    installSmartboardToolPopoutButtons(document);
    const display = document.querySelector("#platform-student-timer-display");
    const picker = display?.querySelector('[data-smartboard-tool="names"]');
    if (picker && display) {
      picker.hidden = false;
      updateNamePickerView(document);
      display.dataset.toolOnly = "names";
      display.hidden = false;
      installSmartboardPopoutFullscreenButton(picker, document);
      picker.focus?.();
    }
  }
  if (action.dataset.action === "open-timer-popout") {
    openStudentTimerPopout();
  }
  if (action.dataset.action === "open-classroom-presentation-window") {
    openClassroomPresentationWindow();
  }
}
function renderEvidenceFoundation() {
  const region = document.querySelector("[data-evidence-foundation]");
  if (!region) return;
  const workspace = region.querySelector(".platform-evidence-workspace");
  if (workspace) workspace.outerHTML = evidenceCaptureMarkup();
}
function renderTeacherEvidenceReview() {
  const region = document.querySelector("[data-teacher-evidence-review]");
  if (region) region.outerHTML = teacherEvidenceReviewMarkup();
}
function renderGovernanceSimulation() {
  const region = document.querySelector("[data-governance-simulation]");
  if (!region) return;
  const policyReady = evidenceGovernance.read().status === EVIDENCE_GOVERNANCE_STATUS.DRAFT_SAVED;
  region.outerHTML = governanceSimulationMarkup({ policyReady });
}
function renderGoogleConnectionPreview() {
  const region = document.querySelector("[data-google-connection-preview]");
  if (region) region.outerHTML = googleConnectionPreviewMarkup();
}
function render() {
  const requestedRoute = currentRoute();
  if (!knownRoutes.has(requestedRoute)) return navigate(ROUTES.WELCOME, { replace: true });
  if (requestedRoute === ROUTES.PREVIEW_CLASSROOM_DEMO) {
    setClassroomDemoMode(true);
    session.signInTeacher("teacher-preview-1");
    seedClassroomDemo();
    return navigate(ROUTES.TEACHER_DASHBOARD, { replace: true });
  }
  if (requestedRoute === ROUTES.PREVIEW_TEACHER) {
    setClassroomDemoMode(false);
    session.signInTeacher("teacher-preview-1");
    lessonTimer.setDuration(classTimerSchedule.readEffective().durationMinutes);
    return navigate(ROUTES.TEACHER_DASHBOARD, { replace: true });
  }
  if (requestedRoute === ROUTES.PREVIEW_STUDENT) {
    session.signInStudent("class-preview-1", "student-preview-1");
    return navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
  }
  const state = session.read();
  const allowedRoute = guardRoute(requestedRoute, state);
  if (allowedRoute !== requestedRoute) return navigate(allowedRoute, { replace: true });
  root.innerHTML = viewForRoute(allowedRoute, state);
  if (allowedRoute === ROUTES.TEACHER_DASHBOARD) {
    installClassroomDisplayChoices();
    applyClassroomBobDisplay();
  }
  if (allowedRoute === ROUTES.TEACHER_LOGIN) mountProductionGoogleSignIn();
  if (allowedRoute === ROUTES.TEACHER_DASHBOARD) pb002jClasswide.mount(root, "teacher");
  if (allowedRoute === ROUTES.STUDENT_DASHBOARD) pb002jClasswide.mount(root, "student");
  if (allowedRoute === ROUTES.STUDENT_DASHBOARD) installStudentReadAloudControls();
  manageLessonTimerPresentation(allowedRoute);
  if (allowedRoute === ROUTES.TEACHER_DASHBOARD) {
    syncStudentDisplayPresentation();
    updateNamePickerView(document);
    enterStandaloneClassroomDisplayMode();
  }
  const studentDisplayRestored = restoreLessonTimerDisplay(allowedRoute, state);
  window.requestAnimationFrame(() => {
    const scrollTarget = pendingScrollTarget ? document.querySelector(`#${pendingScrollTarget}`) : null;
    if (scrollTarget) {
      if (scrollTarget.matches("[data-optional-dashboard-section]")) scrollTarget.hidden = false;
      if (pendingOpenClassResourceEditor) {
        const resourceEditor = scrollTarget.querySelector(".platform-class-resource-editor");
        if (resourceEditor) resourceEditor.open = true;
        pendingOpenClassResourceEditor = false;
      }
      pendingScrollTarget = "";
      scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      scrollTarget.querySelector("h3")?.focus({ preventScroll: true });
    } else if (studentDisplayRestored) {
      document.querySelector("#platform-student-timer-display")?.focus({ preventScroll: true });
    } else {
      document.querySelector("#platform-main")?.focus({ preventScroll: true });
    }
  });
}
function installStudentReadAloudControls() {
  root.querySelectorAll(".platform-student-home section, .platform-student-home article").forEach((section) => {
    if (section.matches(".platform-school-start-launcher") || section.querySelector(":scope > .platform-student-section-listen")) return;
    const heading = section.querySelector(":scope > h2, :scope > h3, :scope > h4, :scope > div > h2, :scope > div > h3, :scope > div > h4");
    if (!heading) return;
    const readable = [...section.childNodes].some((node) => node.nodeType === Node.TEXT_NODE ? node.textContent.trim() : node.matches?.("p, div:not(:has(section, article)), ul, ol"));
    if (!readable) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "platform-student-section-listen";
    button.dataset.action = "read-student-section";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `Listen to ${heading.textContent.trim()}`);
    button.textContent = "Listen";
    heading.insertAdjacentElement("afterend", button);
  });
}
function mountProductionGoogleSignIn() {
  if (!productionIdentityConfig.googleEnabled) return;
  const target = document.querySelector("[data-production-google-signin]");
  if (!target) return;
  const renderButton = () => {
    if (!globalThis.google?.accounts?.id || !target.isConnected) return;
    globalThis.google.accounts.id.initialize({ client_id: productionIdentityConfig.clientId, ux_mode: "redirect", login_uri: `${window.location.origin}/api/auth/v1/google` });
    globalThis.google.accounts.id.renderButton(target, { type: "standard", theme: "outline", size: "large", text: "continue_with", width: 280 });
  };
  if (globalThis.google?.accounts?.id) return renderButton();
  if (document.querySelector("script[data-production-google-identity]")) return;
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.dataset.productionGoogleIdentity = "true";
  script.addEventListener("load", renderButton, { once: true });
  document.head.append(script);
}
root.addEventListener("submit", handleSubmit);
root.addEventListener("click", handleClick);
root.addEventListener("click", (event) => {
  const action = event.target.closest?.('[data-action="open-name-picker-display"]');
  if (!action) return;
  const display = document.querySelector("#platform-student-timer-display");
  const picker = display?.querySelector('[data-smartboard-tool="names"]');
  if (!display || !picker) return;
  installSmartboardToolPopoutButtons(document);
  picker.hidden = false;
  updateNamePickerView(document);
  display.dataset.toolOnly = "names";
  display.hidden = false;
  installSmartboardPopoutFullscreenButton(picker, document);
  picker.focus?.();
});
root.addEventListener("pointerover", (event) => {
  if (!window.matchMedia("(hover: hover)").matches) return;
  const category = event.target instanceof Element ? event.target.closest(".platform-teacher-menu-category") : null;
  if (!category || category.contains(event.relatedTarget)) return;
  document.querySelectorAll(".platform-teacher-menu-category[open]").forEach((item) => {
    if (item !== category) item.open = false;
  });
  category.open = true;
});
root.addEventListener("pointerout", (event) => {
  if (!window.matchMedia("(hover: hover)").matches) return;
  const category = event.target instanceof Element ? event.target.closest(".platform-teacher-menu-category") : null;
  if (!category || category.contains(event.relatedTarget)) return;
  category.open = false;
});
root.addEventListener("focusin", (event) => {
  const category = event.target instanceof Element ? event.target.closest(".platform-teacher-menu-category") : null;
  if (category) category.open = true;
});
root.addEventListener("focusout", (event) => {
  const category = event.target instanceof Element ? event.target.closest(".platform-teacher-menu-category") : null;
  if (category && !category.contains(event.relatedTarget)) category.open = false;
});
function closeTodaysMissionClearConfirmation({ restoreFocus = true } = {}) {
  const confirmation = document.querySelector("[data-todays-mission-confirmation]");
  if (!confirmation || confirmation.hidden) return;
  confirmation.hidden = true;
  const confirmButton = confirmation.querySelector('[data-action="confirm-clear-todays-mission"]');
  if (confirmButton) confirmButton.disabled = false;
  if (restoreFocus) document.querySelector('[data-action="clear-todays-mission"]')?.focus();
}
function handleTodaysMissionEdit(event) {
  const missionForm = event.target.closest('[data-form="todays-mission"]');
  if (missionForm) {
    const title = missionForm.elements.title?.value ?? "";
    const focus = title;
    const builder = missionForm.elements.builder.checked ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART;
    const workshop = missionForm.elements.workshop.checked ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART;
    const saved = todaysMission.read();
    const titleCount = missionForm.querySelector("[data-todays-mission-title-count]");
    const focusCount = missionForm.querySelector("[data-todays-mission-focus-count]");
    const error = missionForm.querySelector("[data-todays-mission-error]");
    const status = missionForm.querySelector("[data-todays-mission-status]");
    if (titleCount) titleCount.textContent = String(title.length);
    if (focusCount) focusCount.textContent = String(focus.length);
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    if (status) {
      const hasUnsavedChanges = title.trim() !== saved.title || focus.trim() !== saved.focus || builder !== saved.builder || workshop !== saved.workshop;
      status.dataset.state = hasUnsavedChanges ? "unsaved" : saved.title ? "saved" : "empty";
      status.textContent = hasUnsavedChanges ? "Unsaved changes. Save before refreshing or opening Student Display." : saved.title ? "Today\u2019s Plan is saved for this class and Student Display." : "No plan has been prepared for this class today.";
    }
    return true;
  }
  return false;
}
var smartboardToolZIndex = 30;
var SMARTBOARD_TOOL_DEFAULT_STYLES = Object.freeze({
  timer: "left: 3%; top: 12%;",
  message: "right: 3%; top: 12%;",
  stopwatch: "left: 35%; top: 18%;",
  voice: "right: 16%; top: 18%;",
  names: "left: 24%; top: 8%; width: min(28rem, 82vw);",
  whiteboard: "left: 8%; top: 8%; width: min(46rem, 82vw); height: min(34rem, 72vh);"
});
function bringSmartboardToolForward(tool) {
  if (!tool) return;
  smartboardToolZIndex += 1;
  tool.style.zIndex = String(smartboardToolZIndex);
}
function keepSmartboardToolsOnScreen(documentRef = document) {
  const view = documentRef.defaultView || window;
  const margin = 8;
  documentRef.querySelectorAll("[data-smartboard-tool]:not([hidden])").forEach((tool) => {
    if (documentRef.fullscreenElement === tool) return;
    tool.style.maxWidth = `${Math.max(220, view.innerWidth - margin * 2)}px`;
    tool.style.maxHeight = `${Math.max(150, view.innerHeight - margin * 2)}px`;
    let rect = tool.getBoundingClientRect();
    if (rect.width > view.innerWidth - margin * 2) tool.style.width = `${view.innerWidth - margin * 2}px`;
    if (rect.height > view.innerHeight - margin * 2) tool.style.height = `${view.innerHeight - margin * 2}px`;
    rect = tool.getBoundingClientRect();
    const left = Math.max(margin, Math.min(rect.left, view.innerWidth - rect.width - margin));
    const top = Math.max(margin, Math.min(rect.top, view.innerHeight - rect.height - margin));
    if (Math.abs(left - rect.left) > 0.5 || Math.abs(top - rect.top) > 0.5) {
      tool.style.right = "auto";
      tool.style.left = `${left}px`;
      tool.style.top = `${top}px`;
    }
  });
}
function resetSmartboardToolPositions(documentRef = document) {
  documentRef.querySelectorAll("[data-smartboard-tool]").forEach((tool) => {
    const initialStyle = tool.dataset.smartboardDefaultStyle ?? SMARTBOARD_TOOL_DEFAULT_STYLES[tool.dataset.smartboardTool] ?? "";
    tool.setAttribute("style", initialStyle);
    tool.style.zIndex = "";
  });
}
function installSmartboardToolPopoutButtons(documentRef = document) {
  documentRef.querySelectorAll("[data-smartboard-tool]").forEach((tool) => {
    const header = tool.querySelector("[data-smartboard-drag-handle]");
    const close = header?.querySelector('[data-action="close-smartboard-tool"]');
    if (!header || !close || header.querySelector('[data-action="popout-smartboard-tool"], [data-action="fullscreen-smartboard-tool"]')) return;
    const button = documentRef.createElement("button");
    button.type = "button";
    button.dataset.action = "fullscreen-smartboard-tool";
    button.className = "platform-smartboard-fullscreen-button";
    button.setAttribute("aria-label", `Show ${tool.dataset.smartboardTool} tool full screen`);
    button.title = "Fill the Classroom Display with this tool";
    button.textContent = "Full Screen";
    header.insertBefore(button, close);
  });
}
function toggleSmartboardToolMaximized(tool) {
  if (!tool) return;
  const maximized = !tool.classList.contains("platform-smartboard-tool-maximized");
  if (maximized) {
    bringSmartboardToolForward(tool);
    tool.dataset.smartboardRestoreStyle = tool.style.cssText;
    tool.classList.add("platform-smartboard-tool-maximized");
    for (const [property, value] of [["inset", "0"], ["width", "100vw"], ["height", "100vh"], ["max-width", "none"], ["max-height", "none"], ["z-index", "300"]]) tool.style.setProperty(property, value, "important");
  } else {
    tool.classList.remove("platform-smartboard-tool-maximized");
    tool.style.cssText = tool.dataset.smartboardRestoreStyle || SMARTBOARD_TOOL_DEFAULT_STYLES[tool.dataset.smartboardTool] || "";
    delete tool.dataset.smartboardRestoreStyle;
  }
  const button = tool.querySelector('[data-action="fullscreen-smartboard-tool"]');
  if (button) {
    button.textContent = maximized ? "Restore" : "Full Screen";
    button.setAttribute("aria-pressed", String(maximized));
    button.title = maximized ? "Return this tool to its window" : "Fill the Classroom Display with this tool";
  }
}
async function toggleClassroomDisplayFullscreen(button) {
  const displayWindow = button?.ownerDocument?.defaultView;
  const displayDocument = button?.ownerDocument;
  if (!displayWindow || !displayDocument) return;
  const status = displayDocument.querySelector("[data-classroom-display-layout-status]");
  if (displayDocument.body.classList.contains("platform-classroom-presentation-mode") || displayDocument.fullscreenElement) return exitClassroomDisplayFullscreen(displayDocument);
  displayDocument.body.classList.add("platform-classroom-presentation-mode");
  displayDocument.body.dataset.classroomRestoreWindow = JSON.stringify({
    left: displayWindow.screenX,
    top: displayWindow.screenY,
    width: displayWindow.outerWidth,
    height: displayWindow.outerHeight
  });
  const exitButton = displayDocument.querySelector("[data-action='exit-classroom-fullscreen']");
  if (exitButton) exitButton.hidden = false;
  const screen2 = displayWindow.screen;
  try {
    displayWindow.moveTo(Number(screen2.availLeft || 0), Number(screen2.availTop || 0));
    displayWindow.resizeTo(Number(screen2.availWidth || screen2.width), Number(screen2.availHeight || screen2.height));
  } catch {
  }
  try {
    await displayDocument.documentElement.requestFullscreen({ navigationUI: "hide" });
    if (status) status.textContent = "Classroom Display is full screen.";
  } catch {
    if (status) status.textContent = "The Classroom Display window was expanded to fill the smartboard.";
  }
}
async function exitClassroomDisplayFullscreen(displayDocument) {
  if (!displayDocument) return;
  if (displayDocument.fullscreenElement) {
    try {
      await displayDocument.exitFullscreen();
    } catch {
    }
  }
  displayDocument.body.classList.remove("platform-classroom-presentation-mode");
  const displayWindow = displayDocument.defaultView;
  try {
    const restoreWindow = JSON.parse(displayDocument.body.dataset.classroomRestoreWindow || "null");
    if (restoreWindow && displayWindow) {
      displayWindow.moveTo(restoreWindow.left, restoreWindow.top);
      displayWindow.resizeTo(restoreWindow.width, restoreWindow.height);
    }
  } catch {
  }
  delete displayDocument.body.dataset.classroomRestoreWindow;
  const exitButton = displayDocument.querySelector("[data-action='exit-classroom-fullscreen']");
  if (exitButton) exitButton.hidden = true;
  const status = displayDocument.querySelector("[data-classroom-display-layout-status]");
  if (status) status.textContent = "Full-screen presentation mode closed.";
}
function smartboardToolSource(name) {
  if (classroomPresentationWindow && !classroomPresentationWindow.closed) {
    const tool = classroomPresentationWindow.document.querySelector(`[data-smartboard-tool="${name}"]`);
    if (tool) return tool;
  }
  return document.querySelector(`[data-smartboard-tool="${name}"]`);
}
function syncSmartboardToolPopout(name) {
  const popout = smartboardToolPopouts.get(name);
  const source = smartboardToolSource(name);
  if (!popout || popout.closed || !source) return;
  const target = popout.document.querySelector("[data-smartboard-tool]");
  if (!target) return;
  target.innerHTML = source.innerHTML;
  target.querySelector('[data-action="popout-smartboard-tool"]')?.remove();
  installSmartboardPopoutFullscreenButton(target, popout.document);
}
function installSmartboardPopoutFullscreenButton(tool, documentRef) {
  const header = tool?.querySelector("header");
  const close = header?.querySelector('[data-action="close-smartboard-tool"]');
  if (!header || !close || header.querySelector('[data-action="fullscreen-smartboard-tool"]')) return;
  const button = documentRef.createElement("button");
  button.type = "button";
  button.dataset.action = "fullscreen-smartboard-tool";
  button.className = "platform-smartboard-fullscreen-button";
  button.textContent = "Full Screen";
  header.insertBefore(button, close);
}
function openSmartboardToolPopout(sourceTool) {
  const name = sourceTool?.dataset.smartboardTool;
  if (!name) return null;
  const existing = smartboardToolPopouts.get(name);
  if (existing && !existing.closed) {
    existing.focus();
    syncSmartboardToolPopout(name);
    return existing;
  }
  const title = sourceTool.querySelector("header strong")?.textContent?.trim() || "Presentation Tool";
  const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => `<link rel="stylesheet" href="${escapeHtml2(link.href)}">`).join("");
  const clone = sourceTool.cloneNode(true);
  clone.hidden = false;
  clone.removeAttribute("style");
  clone.querySelector('[data-action="popout-smartboard-tool"]')?.remove();
  installSmartboardPopoutFullscreenButton(clone, clone.ownerDocument);
  const sourceWindow = sourceTool.ownerDocument?.defaultView || window;
  const popout = sourceWindow.open("", `thinkamigbob-tool-${name}`, "popup=yes,width=520,height=640,resizable=yes");
  if (!popout) return null;
  smartboardToolPopouts.set(name, popout);
  popout.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml2(title)} \xB7 THINKamigBOB</title>${styles}<style>html,body{margin:0;min-height:100%;background:#dce9ee}.platform-smartboard-tool{position:relative!important;inset:auto!important;display:grid!important;width:auto!important;min-height:calc(100vh - 1rem);max-height:none!important;margin:.5rem}.platform-smartboard-resize-handle,.platform-floating-tool-switcher{display:none!important}</style></head><body class="platform-app">${clone.outerHTML}</body></html>`);
  popout.document.close();
  popout.document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    if (action.dataset.action === "close-smartboard-tool") {
      popout.close();
      return;
    }
    if (action.dataset.action === "fullscreen-smartboard-tool") {
      if (popout.document.fullscreenElement) void popout.document.exitFullscreen();
      else void popout.document.documentElement.requestFullscreen();
      return;
    }
    const source = smartboardToolSource(name);
    const candidates = [...source?.querySelectorAll(`[data-action="${action.dataset.action}"]`) || []];
    const matching = candidates.find((candidate) => !action.dataset.studentId || candidate.dataset.studentId === action.dataset.studentId) || candidates[0];
    matching?.click();
    window.setTimeout(() => syncSmartboardToolPopout(name), 40);
    window.setTimeout(() => syncSmartboardToolPopout(name), 1150);
  });
  popout.addEventListener("beforeunload", () => smartboardToolPopouts.delete(name));
  popout.focus();
  return popout;
}
function installSmartboardToolGestures(eventTarget) {
  const documentRef = eventTarget.nodeType === 9 ? eventTarget : eventTarget.ownerDocument;
  installSmartboardToolPopoutButtons(documentRef);
  eventTarget.querySelectorAll?.("[data-smartboard-tool]").forEach((tool) => {
    if (!tool.dataset.smartboardDefaultStyle) tool.dataset.smartboardDefaultStyle = tool.getAttribute("style") || "";
  });
  eventTarget.addEventListener("pointerdown", (event) => {
    const resizeHandle = event.target.closest?.("[data-smartboard-resize-handle]");
    const dragHandle = event.target.closest?.("[data-smartboard-drag-handle]");
    const handle = resizeHandle || dragHandle;
    const tool = handle?.closest("[data-smartboard-tool]");
    if (!handle || !tool || !resizeHandle && event.target.closest("button")) return;
    if (tool.dataset.smartboardDefaultStyle === void 0) tool.dataset.smartboardDefaultStyle = SMARTBOARD_TOOL_DEFAULT_STYLES[tool.dataset.smartboardTool] ?? tool.getAttribute("style") ?? "";
    const view2 = eventTarget.defaultView || window;
    const bounds = { left: 0, top: 0, width: view2.innerWidth, height: view2.innerHeight };
    const rect = tool.getBoundingClientRect();
    bringSmartboardToolForward(tool);
    smartboardDrag = {
      tool,
      mode: resizeHandle ? "resize" : "move",
      pointerId: event.pointerId,
      handle,
      bounds,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      startWidth: rect.width,
      startHeight: rect.height,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    handle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });
  eventTarget.addEventListener("pointermove", (event) => {
    if (!smartboardDrag || smartboardDrag.pointerId !== event.pointerId) return;
    const { tool, bounds } = smartboardDrag;
    if (smartboardDrag.mode === "resize") {
      const width = Math.max(220, Math.min(bounds.width - smartboardDrag.startLeft, smartboardDrag.startWidth + event.clientX - smartboardDrag.startX));
      const height = Math.max(150, Math.min(bounds.height - smartboardDrag.startTop - 52, smartboardDrag.startHeight + event.clientY - smartboardDrag.startY));
      tool.style.width = `${width}px`;
      tool.style.height = `${height}px`;
      tool.style.maxHeight = "none";
    } else {
      const left = Math.max(0, Math.min(bounds.width - tool.offsetWidth, event.clientX - smartboardDrag.offsetX));
      const top = Math.max(0, Math.min(bounds.height - tool.offsetHeight, event.clientY - smartboardDrag.offsetY));
      tool.style.right = "auto";
      tool.style.left = `${left}px`;
      tool.style.top = `${top}px`;
    }
    event.preventDefault();
  });
  const endGesture = (event) => {
    if (smartboardDrag && event.pointerId === smartboardDrag.pointerId) smartboardDrag = null;
  };
  eventTarget.addEventListener("pointerup", endGesture);
  eventTarget.addEventListener("pointercancel", endGesture);
  const view = documentRef.defaultView || window;
  if (!documentRef.documentElement.dataset.smartboardResizeGuard) {
    documentRef.documentElement.dataset.smartboardResizeGuard = "true";
    view.addEventListener("resize", () => keepSmartboardToolsOnScreen(documentRef));
  }
}
installSmartboardToolGestures(root);
root.addEventListener("dragstart", (event) => {
  const student = event.target.closest("[data-group-student-id]");
  if (!student || !event.dataTransfer) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", student.dataset.groupStudentId);
});
root.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-group-drop-row-id]")) event.preventDefault();
});
root.addEventListener("drop", (event) => {
  const dropzone = event.target.closest("[data-group-drop-row-id]");
  const studentId = event.dataTransfer?.getData("text/plain");
  if (!dropzone || !studentId) return;
  event.preventDefault();
  const sessionState = session.read();
  const classId = currentTeacherClass(sessionState.teacherId)?.id;
  const region = dropzone.closest("[data-class-resource-teacher]");
  if (!classId || !region) return;
  const current = classResourceSharing.read(classId);
  current.audienceRows.filter((row) => ["teacher-group", "random-group"].includes(row.audienceType)).forEach((row) => {
    const audienceIds = row.audienceIds.filter((id) => id !== studentId);
    if (dropzone.dataset.groupDropRowId === row.id) audienceIds.push(studentId);
    classResourceSharing.updateAudience(classId, row.id, { audienceIds: [...new Set(audienceIds)] });
  });
  region.outerHTML = classResourceTeacherMarkup(classId);
});
root.addEventListener("change", (event) => {
  const studentNameplateControl = event.target.closest?.("[data-student-nameplate-control]");
  if (studentNameplateControl) {
    const nameplate = studentNameplateControl.closest("[data-student-nameplate]");
    const font = nameplate?.querySelector('[data-student-nameplate-control="font"]')?.value || "slab";
    const background = nameplate?.querySelector('[data-student-nameplate-control="background"]')?.value || "cream";
    const color = nameplate?.querySelector('[data-student-nameplate-control="color"]')?.value || "#173247";
    if (!nameplate || !STUDENT_NAMEPLATE_FONTS.includes(font) || !STUDENT_NAMEPLATE_BACKGROUNDS.includes(background) || !/^#[0-9a-f]{6}$/i.test(color)) return;
    STUDENT_NAMEPLATE_FONTS.forEach((value) => nameplate.classList.remove(`platform-student-nameplate-font-${value}`));
    STUDENT_NAMEPLATE_BACKGROUNDS.forEach((value) => nameplate.classList.remove(`platform-student-nameplate-bg-${value}`));
    nameplate.classList.add(`platform-student-nameplate-font-${font}`, `platform-student-nameplate-bg-${background}`);
    nameplate.style.setProperty("--student-name-color", color);
    writeStudentNameplate(nameplate.dataset.studentId, { font, background, color });
    return;
  }
  const activityTitle = event.target.closest?.("[data-activity-directions-title]");
  if (activityTitle) {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id;
    if (classId) activityDirections.setTitle(classId, activityTitle.value);
    return;
  }
  if (event.target.matches?.("[data-classroom-bob-enabled], [data-classroom-bob-menu-hidden], [data-classroom-bob-placement], [data-classroom-bob-earn-minutes], [data-classroom-bob-daily-limit]")) {
    const controls = document.querySelector(".platform-classroom-bob-controls"), enabledInput = document.querySelector("[data-classroom-bob-enabled]"), menuInput = document.querySelector("[data-classroom-bob-menu-hidden]");
    const enabled = enabledInput?.checked ?? false;
    let menuHidden = controls?.dataset.menuHidden === "true";
    if (event.target.matches("[data-classroom-bob-enabled]")) menuHidden = !enabled;
    if (event.target.matches("[data-classroom-bob-menu-hidden]")) menuHidden = !menuHidden;
    if (!enabled) menuHidden = true;
    if (controls) controls.dataset.menuHidden = String(menuHidden);
    if (menuInput) menuInput.checked = false;
    const placement = document.querySelector("[data-classroom-bob-placement]")?.value || "move", earnMinutes = Math.min(30, Math.max(1, Number(document.querySelector("[data-classroom-bob-earn-minutes]")?.value) || 5)), dailyUnlockLimit = Math.min(10, Math.max(1, Number(document.querySelector("[data-classroom-bob-daily-limit]")?.value) || 6));
    window.localStorage.setItem(CLASSROOM_BOB_DISPLAY_KEY, JSON.stringify({ placement, earnMinutes, dailyUnlockLimit }));
    writeClassroomBobDailyMenu({ enabled, menuHidden });
    const menuLabel = document.querySelector("[data-classroom-bob-menu-label]");
    if (menuLabel) menuLabel.textContent = menuHidden ? "Show menu" : "Hide menu";
    floatingBobCornerIndex = 0;
    floatingBobGreenSince = Date.now();
    updateBobRewardOutputs();
    applyClassroomBobDisplay();
    scheduleNextBobMove();
    return;
  }
  const doNowImage = event.target.closest?.("[data-do-now-image]");
  if (doNowImage) {
    const file2 = doNowImage.files?.[0];
    if (file2?.type.startsWith("image/") && file2.size <= 6 * 1024 * 1024) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        doNowDraft.image = String(reader.result);
        openDoNowEditor(doNowDraft);
      }, { once: true });
      reader.readAsDataURL(file2);
    }
    return;
  }
  if (event.target.closest?.("[data-do-now-editor]")) {
    updateDoNowDraftFromEditor(event.target.closest("[data-do-now-editor]"));
    return;
  }
  const quickScheduleSetting = event.target.closest('form[data-form="class-timer-schedule"] [name="enabled"], form[data-form="class-timer-schedule"] [name="weekdays"], form[data-form="class-timer-schedule"] [name="startTime"], form[data-form="class-timer-schedule"] [name="timeZone"], form[data-form="class-timer-schedule"] [name="pomodoroEnabled"], form[data-form="class-timer-schedule"] [name="phaseName"], form[data-form="class-timer-schedule"] [name="phaseStart"], form[data-form="class-timer-schedule"] [name="yellowSound"], form[data-form="class-timer-schedule"] [name="redSound"], form[data-form="class-timer-schedule"] [name="endSound"]');
  if (quickScheduleSetting) {
    const result = saveQuickClassTimerSchedule(quickScheduleSetting.closest("form"));
    if (result.ok && lessonTimer.read().status === LESSON_TIMER_STATES.READY) lessonTimer.setDuration(result.schedule.durationMinutes);
    syncLessonTimerPresentation();
    return;
  }
  const pixelProjectFile = event.target.closest("[data-pixel-project-file]");
  if (pixelProjectFile) {
    const file2 = pixelProjectFile.files?.[0];
    pixelStudio.sourceFrames = [];
    if (file2) void openPixelProjectFile(file2);
    pixelProjectFile.value = "";
    return;
  }
  const pixelGif = event.target.closest("[data-pixel-gif]");
  if (pixelGif) return;
  const pixelSize = event.target.closest("[data-pixel-size]");
  if (pixelSize) {
    const nextSize = Number(pixelSize.value);
    if (nextSize !== pixelStudio.size && window.confirm("Changing the grid size starts a new pixel drawing. Continue?")) {
      pixelStudio.size = nextSize;
      pixelStudio.pixels = freshPixelFrame();
      pixelStudio.frames = [[...pixelStudio.pixels]];
      pixelStudio.frameIndex = 0;
      renderPixelStudio();
      startPixelStudioPreview();
    } else pixelSize.value = String(pixelStudio.size);
    return;
  }
  const pixelBits = event.target.closest("[data-pixel-bits]");
  if (pixelBits) {
    pixelStudio.bits = Number(pixelBits.value);
    pixelStudio.frames = pixelStudio.frames.map((frame) => frame.map((color) => color.endsWith("00") ? color : nearestPixelColor(color)));
    pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]];
    renderPixelStudio();
    return;
  }
  const paletteColor = event.target.closest("[data-pixel-palette-color]");
  if (paletteColor) {
    const index = Number(paletteColor.dataset.pixelPaletteColor), oldColor = pixelPalette()[index], newColor = paletteColor.value;
    pixelStudio.palette[index] = newColor;
    pixelStudio.frames = pixelStudio.frames.map((frame) => frame.map((color) => color === oldColor ? newColor : color));
    pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]];
    const drawingColor = document.querySelector("[data-pixel-color]");
    if (drawingColor?.value.toLowerCase() === oldColor.toLowerCase()) drawingColor.value = newColor;
    renderPixelStudio();
    setWhiteboardStatus(pixelStudio.bits === 24 ? `${oldColor} was replaced with ${newColor} throughout the animation.` : `Color code ${index.toString(2).padStart(pixelStudio.bits, "0")} was changed throughout the animation.`);
    return;
  }
  const pixelColor = event.target.closest("[data-pixel-color]");
  if (pixelColor) {
    const code = document.querySelector("[data-pixel-code]"), paletteIndex = pixelPalette().indexOf(nearestPixelColor(pixelColor.value));
    if (code) code.textContent = pixelStudio.bits === 24 ? `Full Color RGB: ${pixelColor.value.toUpperCase()}` : `Color code: ${Math.max(0, paletteIndex).toString(2).padStart(pixelStudio.bits, "0")}`;
    return;
  }
  const whiteboardBackgroundImage = event.target.closest("[data-whiteboard-background-image]");
  if (whiteboardBackgroundImage) {
    const file2 = whiteboardBackgroundImage.files?.[0];
    if (!file2) return;
    if (!String(file2.type).startsWith("image/") || file2.size > 6 * 1024 * 1024) {
      setWhiteboardStatus("Choose a background image no larger than 6 MB.");
      whiteboardBackgroundImage.value = "";
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => {
        whiteboardBackground = { ...whiteboardBackground, type: "image", imageSrc: String(reader.result), element: image };
        const type = document.querySelector("[data-whiteboard-background-type]");
        if (type) type.value = "image";
        renderWhiteboardObjects();
        saveWhiteboard();
        setWhiteboardStatus("Image background applied.");
      }, { once: true });
      image.src = String(reader.result);
    }, { once: true });
    reader.readAsDataURL(file2);
    whiteboardBackgroundImage.value = "";
    return;
  }
  if (event.target.closest("[data-whiteboard-text-font]")) {
    if (whiteboardSelectedObjectId) formatSelectedWhiteboardText("font");
    activateWhiteboardTextTool(`${event.target.value} selected. Click anywhere on the whiteboard to start typing.`);
    refreshPendingWhiteboardTextEntryStyle();
    return;
  }
  if (event.target.closest("[data-whiteboard-text-color]")) {
    if (whiteboardSelectedObjectId) formatSelectedWhiteboardText("color");
    activateWhiteboardTextTool("Font color selected. Click anywhere on the whiteboard to start typing.");
    refreshPendingWhiteboardTextEntryStyle();
    return;
  }
  if (event.target.closest("[data-class-resource-teacher]")) window.setTimeout(refreshCurrentClassPlan, 0);
  const planResourceToggle = event.target.closest("[data-current-plan-resource-toggle]");
  if (planResourceToggle) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    if (!classId) return;
    classResourceSharing.stop(classId, planResourceToggle.dataset.resourceIndex, planResourceToggle.dataset.resourceRowId);
    refreshCurrentClassPlan();
    return;
  }
  const classComparison = event.target.closest("[data-class-plan-comparison]");
  if (classComparison) {
    teacherComparisonClassId = classComparison.value;
    render();
    return;
  }
  const planMode = event.target.closest("[data-resource-plan-mode]");
  if (planMode) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = planMode.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const current = classResourceSharing.read(classId);
    classResourceSharing.configureAssignment(classId, planMode.value, current.exceptionsEnabled);
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  const exceptionsEnabled = event.target.closest("[data-resource-exceptions-enabled]");
  if (exceptionsEnabled) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = exceptionsEnabled.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const current = classResourceSharing.read(classId);
    classResourceSharing.configureAssignment(classId, current.assignmentMode, exceptionsEnabled.value === "yes");
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  const groupName = event.target.closest("[data-resource-group-name]");
  if (groupName) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    if (!classId) return;
    classResourceSharing.updateAudience(classId, groupName.dataset.resourceRowId, { audienceLabel: groupName.value.trim() || "Unnamed group" });
    return;
  }
  const audienceType = event.target.closest("[data-resource-audience-type]");
  if (audienceType) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = audienceType.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const type = audienceType.value;
    classResourceSharing.updateAudience(classId, audienceType.dataset.resourceRowId, { audienceType: type, audienceIds: type === "whole-class" ? [] : void 0, audienceLabel: type === "whole-class" ? "Whole class" : type === "students" ? "Selected students" : type === "teacher-group" ? "Teacher group" : "Random group" });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  const audienceStudent = event.target.closest("[data-resource-audience-student]");
  if (audienceStudent) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = audienceStudent.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const resourceState = classResourceSharing.read(classId);
    const row = resourceState.audienceRows.find((item) => item.id === audienceStudent.dataset.resourceRowId);
    if (audienceStudent.checked && ["teacher-group", "random-group"].includes(row?.audienceType)) {
      resourceState.audienceRows.filter((item) => item.id !== row.id && ["teacher-group", "random-group"].includes(item.audienceType)).forEach((item) => {
        classResourceSharing.updateAudience(classId, item.id, { audienceIds: item.audienceIds.filter((id) => id !== audienceStudent.value) });
      });
    }
    const audienceIds = new Set(row?.audienceIds ?? []);
    if (audienceStudent.checked) audienceIds.add(audienceStudent.value);
    else audienceIds.delete(audienceStudent.value);
    classResourceSharing.updateAudience(classId, audienceStudent.dataset.resourceRowId, { audienceIds: [...audienceIds] });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  const activeResourceToggle = event.target.closest("[data-active-resource-toggle]");
  if (activeResourceToggle && !activeResourceToggle.checked) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = activeResourceToggle.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    classResourceSharing.stop(classId, activeResourceToggle.dataset.resourceIndex, activeResourceToggle.dataset.resourceRowId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    const status = document.querySelector("[data-class-resource-status]");
    if (status) status.textContent = "Resource removed from the student page.";
    return;
  }
  const webpageSelection = event.target.closest("[data-webpage-selection]");
  if (webpageSelection) {
    const picker = webpageSelection.closest("[data-resource-picker-webpage]");
    const selectedCount = picker?.querySelectorAll("[data-webpage-selection]:checked").length ?? 0;
    const status = webpageSelection.closest("[data-class-resource-teacher]")?.querySelector("[data-class-resource-status]");
    if (status) status.textContent = `${selectedCount} webpage choice${selectedCount === 1 ? "" : "s"} selected. Choose Show Selected Pages to Students when ready.`;
    return;
  }
  const webpageCategory = event.target.closest("[data-webpage-category]");
  if (webpageCategory) {
    webpageCategory.closest("[data-resource-picker-webpage]")?.querySelector("[data-webpage-search]")?.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  const controlsDock = event.target.closest("[data-whiteboard-controls-dock]");
  if (controlsDock) {
    whiteboardControlsDock = ["top", "left", "right", "bottom"].includes(controlsDock.value) ? controlsDock.value : "top";
    applyWhiteboardControlsLayout({ resizeCanvas: true });
    saveWhiteboard();
    setWhiteboardStatus(`Board menus moved to the ${whiteboardControlsDock}.`);
    return;
  }
  const pageDock = event.target.closest("[data-whiteboard-page-dock]");
  if (pageDock) {
    whiteboardPageDock = ["left", "right", "hidden"].includes(pageDock.value) ? pageDock.value : "left";
    applyWhiteboardControlsLayout({ resizeCanvas: true });
    saveWhiteboard();
    setWhiteboardStatus(whiteboardPageDock === "hidden" ? "Page thumbnails hidden." : `Page thumbnails moved to the ${whiteboardPageDock}.`);
    return;
  }
  const textBackground = event.target.closest("[data-whiteboard-text-background]");
  if (textBackground) {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type === "text") {
      pushWhiteboardHistory();
      selected.background = textBackground.value;
      renderWhiteboardObjects();
      saveWhiteboard();
      updateWhiteboardHistoryControls();
    }
    refreshPendingWhiteboardTextEntryStyle();
    setWhiteboardStatus(`${textBackground.options[textBackground.selectedIndex].text} text background selected.`);
    return;
  }
  const cursiveLines = event.target.closest("[data-whiteboard-cursive-lines]");
  if (cursiveLines) {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type === "text") {
      pushWhiteboardHistory();
      selected.cursiveGuide = cursiveLines.value;
      renderWhiteboardObjects();
      saveWhiteboard();
      updateWhiteboardHistoryControls();
    }
    refreshPendingWhiteboardTextEntryStyle();
    setWhiteboardStatus(`${cursiveLines.options[cursiveLines.selectedIndex].text} selected for School Cursive text.`);
    return;
  }
  const cursiveCoach = event.target.closest("[data-whiteboard-cursive-coach]");
  if (cursiveCoach) {
    updateWhiteboardCursiveCoach();
    setWhiteboardStatus(cursiveCoach.value === "off" ? "Cursive Coach is off." : `${cursiveCoach.options[cursiveCoach.selectedIndex].text} is active.`);
    return;
  }
  const emojiChoice = event.target.closest("[data-whiteboard-emoji]");
  if (emojiChoice) {
    const tool = document.querySelector("[data-whiteboard-tool]");
    if (tool) {
      tool.value = "emoji-stamp";
      tool.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setWhiteboardStatus(`${emojiChoice.value} selected. Click the whiteboard to place it.`);
    return;
  }
  const whiteboardTool = event.target.closest("[data-whiteboard-tool]");
  if (whiteboardTool) {
    document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === whiteboardTool.value)));
    const emojiLabel = document.querySelector("[data-whiteboard-emoji-label]");
    if (emojiLabel) emojiLabel.hidden = false;
    const lassoActions = document.querySelector("[data-whiteboard-lasso-actions]");
    if (lassoActions) lassoActions.hidden = whiteboardTool.value !== "lasso-select";
    const help = document.querySelector("[data-whiteboard-push-help]");
    if (help) help.hidden = whiteboardTool.value !== "pull-3d";
    if (whiteboardTool.value === "pull-3d") setWhiteboardStatus("Pull a rectangle, oval, or triangle into 3D. The highlighted Push Back to 2D button restores it later.");
    return;
  }
  const dimensionCompare = event.target.closest("[data-whiteboard-dimension-compare]");
  if (dimensionCompare) {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type === "dimension") {
      pushWhiteboardHistory();
      selected.compareUnit = dimensionCompare.value;
      renderWhiteboardObjects();
      saveWhiteboard();
      setWhiteboardStatus(`Dimension comparison changed to ${dimensionCompare.options[dimensionCompare.selectedIndex].text}.`);
    }
    return;
  }
  const dimensionLabel = event.target.closest("[data-whiteboard-dimension-label]");
  if (dimensionLabel) {
    const custom = document.querySelector("[data-whiteboard-dimension-custom-label]");
    if (custom) custom.hidden = dimensionLabel.value !== "custom";
    return;
  }
  const whiteboardGrid = event.target.closest("[data-whiteboard-grid]");
  if (whiteboardGrid) {
    whiteboardGridUnit = whiteboardGrid.value;
    renderWhiteboardObjects();
    saveWhiteboard();
    setWhiteboardStatus(`${whiteboardGrid.options[whiteboardGrid.selectedIndex].text} graph paper selected.`);
    return;
  }
  const whiteboardRuler2 = event.target.closest("[data-whiteboard-ruler]");
  if (whiteboardRuler2) {
    whiteboardRulerUnit = whiteboardRuler2.value;
    renderWhiteboardObjects();
    saveWhiteboard();
    setWhiteboardStatus(whiteboardRulerUnit === "none" ? "Ruler hidden." : `${whiteboardRuler2.options[whiteboardRuler2.selectedIndex].text} shown on the board.`);
    return;
  }
  const whiteboardRulerSides = event.target.closest("[data-whiteboard-ruler-sides]");
  if (whiteboardRulerSides) {
    whiteboardRuler2.sides = whiteboardRulerSides.value === "top" ? "top" : "both";
    renderWhiteboardObjects();
    saveWhiteboard();
    setWhiteboardStatus(whiteboardRuler2.sides === "both" ? "Ruler measurements shown on both sides." : "Ruler measurements shown on one side.");
    return;
  }
  const whiteboardScheduleType = event.target.closest("[data-whiteboard-schedule-type]");
  if (whiteboardScheduleType) {
    const usesDate = whiteboardScheduleType.value === "date";
    const usesWeekday = whiteboardScheduleType.value === "weekly";
    const weekdayLabel = document.querySelector("[data-whiteboard-weekday-label]");
    const dateLabel = document.querySelector("[data-whiteboard-date-label]");
    if (weekdayLabel) weekdayLabel.hidden = !usesWeekday;
    if (dateLabel) dateLabel.hidden = !usesDate;
    return;
  }
  const whiteboardImage = event.target.closest("[data-whiteboard-image]");
  if (whiteboardImage) {
    const file2 = whiteboardImage.files?.[0];
    if (!file2) return;
    if (!String(file2.type).startsWith("image/") || file2.size > 3 * 1024 * 1024) {
      setWhiteboardStatus("Choose an image file no larger than 3 MB.");
      whiteboardImage.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const canvas = whiteboardCanvas();
      if (!canvas) return;
      const image = new Image();
      image.onload = () => {
        pushWhiteboardHistory();
        const scale = Math.min(canvas.width * 0.7 / image.width, canvas.height * 0.7 / image.height, 1);
        const width = image.width * scale;
        const height = image.height * scale;
        const object = createWhiteboardObject("image", { x: (canvas.width - width) / 2, y: (canvas.height - height) / 2, width, height, src: String(reader.result), element: image });
        whiteboardObjects.push(object);
        whiteboardSelectedObjectId = object.id;
        renderWhiteboardObjects(canvas);
        saveWhiteboard(canvas);
        setWhiteboardStatus("Image added to the board. Use Undo to remove it.");
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file2);
    whiteboardImage.value = "";
    return;
  }
  const studentDisplayVoiceMeter = event.target.closest("[data-student-display-voice-meter]");
  if (studentDisplayVoiceMeter) {
    storeStudentDisplayVoiceMeterEnabled(studentDisplayVoiceMeter.checked);
    document.querySelectorAll("[data-student-voice-meter]").forEach((meter) => {
      meter.hidden = !studentDisplayVoiceMeter.checked || !voiceMeterStream;
    });
    return;
  }
  const voiceTarget = event.target.closest("[data-voice-meter-target]");
  if (voiceTarget) {
    const result = voiceMeter.setLevel(voiceTarget.value);
    const activityKey = result.level.key === "team" ? "collaborative" : ["silent", "whisper"].includes(result.level.key) ? "independent" : "teacher-led";
    const activity = VOICE_METER_ACTIVITIES.find((item) => item.key === activityKey) ?? VOICE_METER_ACTIVITIES[0];
    try {
      window.localStorage.setItem(VOICE_METER_ACTIVITY_KEY, activity.key);
    } catch {
    }
    segmentActiveVoiceMeter(activity);
    const status = document.querySelector("[data-voice-meter-status]");
    if (status) status.textContent = result.ok ? `Expected level: ${result.level.label}.` : "Choose a supported voice level.";
    document.querySelectorAll("[data-voice-meter-target]").forEach((select) => {
      select.value = result.level.key;
    });
    document.querySelectorAll("[data-student-voice-meter] > p").forEach((label) => {
      label.textContent = `${result.level.icon} ${result.level.label}`;
    });
    document.querySelectorAll("[data-large-voice-level-label]").forEach((label) => {
      label.textContent = `${result.level.icon} ${result.level.label}`;
    });
    document.querySelectorAll("[data-voice-meter-activity]").forEach((select) => {
      select.value = activity.key;
    });
    document.querySelectorAll("[data-voice-meter]").forEach((meter) => {
      meter.style.setProperty("--voice-threshold", `${activity.target}%`);
    });
    updateVoiceMeterPresentation(Number(document.querySelector("[data-voice-meter-output]")?.textContent ?? 0));
    return;
  }
  const voiceActivity = event.target.closest("[data-voice-meter-activity]");
  if (voiceActivity) {
    const activity = VOICE_METER_ACTIVITIES.find((item) => item.key === voiceActivity.value) ?? VOICE_METER_ACTIVITIES[0];
    try {
      window.localStorage.setItem(VOICE_METER_ACTIVITY_KEY, activity.key);
    } catch {
    }
    segmentActiveVoiceMeter(activity);
    const matchingLevel = { "teacher-led": "partner", independent: "whisper", collaborative: "team" }[activity.key];
    const result = voiceMeter.setLevel(matchingLevel);
    document.querySelectorAll("[data-voice-meter-target]").forEach((select) => {
      select.value = result.level.key;
    });
    document.querySelectorAll("[data-large-voice-level-label]").forEach((label) => {
      label.textContent = `${result.level.icon} ${result.level.label}`;
    });
    document.querySelectorAll("[data-voice-meter]").forEach((meter) => {
      meter.style.setProperty("--voice-threshold", `${activity.target}%`);
    });
    const status = document.querySelector("[data-voice-meter-status]");
    if (status) status.textContent = `${activity.label} selected. The louder-than-expected threshold is set automatically.`;
    return;
  }
  const voiceStarGoal = event.target.closest("[data-voice-star-goal]");
  if (voiceStarGoal) {
    const percentage = Math.max(50, Math.min(100, Math.round(Number(voiceStarGoal.value) || 80)));
    try {
      window.localStorage.setItem(VOICE_METER_STAR_GOAL_KEY, String(percentage));
    } catch {
    }
    refreshCurrentClassPlan();
    return;
  }
  const voiceWeeklyStarGoal = event.target.closest("[data-voice-weekly-star-goal]");
  if (voiceWeeklyStarGoal) {
    const days = Math.max(1, Math.min(5, Math.round(Number(voiceWeeklyStarGoal.value) || 3)));
    try {
      window.localStorage.setItem(VOICE_METER_WEEKLY_STAR_GOAL_KEY, String(days));
    } catch {
    }
    refreshCurrentClassPlan();
    return;
  }
  const voiceDisplayMode = event.target.closest("[data-voice-meter-display-mode]");
  if (voiceDisplayMode) {
    const mode = voiceDisplayMode.value === "prediction" ? "prediction" : "basic";
    try {
      window.localStorage.setItem(VOICE_METER_DISPLAY_MODE_KEY, mode);
    } catch {
    }
    document.querySelectorAll("[data-voice-display-mode]").forEach((element) => {
      element.dataset.voiceDisplayMode = mode;
    });
    document.querySelectorAll("[data-voice-meter-display-mode]").forEach((select) => {
      select.value = mode;
    });
    return;
  }
  const reflectionActivity = event.target.closest('[data-form="weekly-reflection"] [name="activityChoice"]');
  if (reflectionActivity) {
    const form = reflectionActivity.closest("form");
    const other = form?.querySelector("[data-reflection-other-activity]");
    const input = other?.querySelector("input");
    const usesOther = reflectionActivity.value === "__other__";
    if (other) other.hidden = !usesOther;
    if (input) {
      input.required = usesOther;
      if (usesOther) input.focus();
      else input.value = "";
    }
    return;
  }
  const captainPromptChoice = event.target.closest('[data-form="captains-log-plan"] [name="promptId"]');
  if (captainPromptChoice) {
    const form = captainPromptChoice.closest("form");
    const prompt = [...CAPTAINS_LOG_PRESET_PROMPTS, ...weeklyReflections.captainLogLibrary()].find((item) => item.id === captainPromptChoice.value);
    if (prompt) {
      form.elements.prompt.value = prompt.prompt;
      if (prompt.week) form.elements.week.value = String(prompt.week);
    } else {
      form.elements.prompt.value = "";
      form.elements.prompt.focus();
    }
    return;
  }
  const resourceType = event.target.closest("[data-class-resource-type]");
  if (resourceType) {
    const form = resourceType.closest('[data-form="class-resource"]');
    const defaults = resourceType.value === "Builder" ? { title: "STEM Builder", url: "../index.html" } : resourceType.value === "Workshop" ? { title: "STEM Workshop", url: "http://192.168.1.252:8000" } : null;
    if (defaults && form) {
      form.elements.title.value = defaults.title;
      form.elements.url.value = defaults.url;
    }
    const picker = form?.querySelector("[data-resource-picker]");
    const missionPicker = picker?.querySelector("[data-resource-picker-mission]");
    const sidePathPicker = picker?.querySelector("[data-resource-picker-side-path]");
    const webpagePicker = picker?.querySelector("[data-resource-picker-webpage]");
    if (picker) {
      picker.hidden = !["Mission Activity", "Side Path", "Webpage"].includes(resourceType.value);
      picker.dataset.pickerMode = resourceType.value === "Side Path" ? "side-path" : resourceType.value === "Webpage" ? "webpage" : "mission";
    }
    if (missionPicker) missionPicker.hidden = resourceType.value !== "Mission Activity";
    if (sidePathPicker) sidePathPicker.hidden = resourceType.value !== "Side Path";
    if (webpagePicker) webpagePicker.hidden = resourceType.value !== "Webpage";
    return;
  }
  const currentClass = event.target.closest("[data-current-teacher-class]");
  if (currentClass) {
    const previousId = classSetupProfiles.read().currentClassId;
    preserveCurrentClassSetup(previousId);
    classSetupProfiles.select(currentClass.value);
    activateClassSetup(currentClass.value);
    render();
    return;
  }
  const allClasses = event.target.closest("[data-class-setup-all]");
  if (allClasses) {
    allClasses.closest(".platform-class-setup-sharing")?.querySelectorAll("[data-class-setup-target]").forEach((input) => {
      input.checked = allClasses.checked;
    });
    return;
  }
  if (event.target.closest("[data-memo-format]")) {
    memoTypingFormat = {
      color: document.querySelector('[data-memo-format="color"]')?.value ?? "white",
      size: document.querySelector('[data-memo-format="size"]')?.value ?? "extra-large",
      style: document.querySelector('[data-memo-format="style"]')?.value ?? "bold"
    };
    const status = document.querySelector("[data-teacher-memo-status]");
    if (status) status.textContent = `New typing will use ${memoTypingFormat.color.replaceAll("-", " ")}, ${memoTypingFormat.size.replaceAll("-", " ")}, ${memoTypingFormat.style.replaceAll("-", " ")}. Highlight existing text and choose Apply to change it.`;
    return;
  }
  const memoImage = event.target.closest("[data-memo-image-file]")?.files?.[0];
  if (memoImage) {
    const status = document.querySelector("[data-teacher-memo-status]");
    if (!String(memoImage.type).startsWith("image/") || memoImage.size > 500 * 1024) {
      if (status) status.textContent = "Choose an image no larger than 500 KB.";
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const hidden = document.querySelector('[name="memoImage"]');
      if (hidden) hidden.value = String(reader.result ?? "");
      if (status) status.textContent = "Image ready. Save the memo to keep it.";
    }, { once: true });
    reader.readAsDataURL(memoImage);
    return;
  }
  const liveEvidenceFilter = event.target.closest("[data-live-evidence-filter]");
  if (liveEvidenceFilter) {
    teacherLiveEvidenceFilters = { ...teacherLiveEvidenceFilters, [liveEvidenceFilter.dataset.liveEvidenceFilter]: liveEvidenceFilter.value };
    const visible = teacherLiveEvidence.filter((item) => Object.entries(teacherLiveEvidenceFilters).every(([field, value]) => value === "All" || item[field] === value));
    teacherLiveEvidenceSelection = visible[0]?.id || "";
    if (teacherLiveEvidencePreviewUrl) URL.revokeObjectURL(teacherLiveEvidencePreviewUrl);
    teacherLiveEvidencePreviewUrl = "";
    renderTeacherLiveEvidence();
    return;
  }
  const teacherFilter = event.target.closest("[data-teacher-evidence-filter]");
  if (teacherFilter) {
    teacherEvidenceFilter = teacherFilter.value;
    const visible = teacherEvidenceFilter === "All" ? PILOT_TEACHER_EVIDENCE : PILOT_TEACHER_EVIDENCE.filter((item) => item.type === teacherEvidenceFilter);
    teacherEvidenceSelection = visible[0]?.id ?? "";
    renderTeacherEvidenceReview();
    return;
  }
  const file = event.target.closest("[data-evidence-file]")?.files?.[0];
  if (file && evidenceDraft) {
    if (evidenceDraft.previewUrl) URL.revokeObjectURL(evidenceDraft.previewUrl);
    evidenceDraft.fileName = file.name;
    evidenceDraft.file = file;
    evidenceDraft.detail = `${file.name} \xB7 ${Math.max(1, Math.round(file.size / 1024))} KB`;
    evidenceDraft.previewUrl = URL.createObjectURL(file);
    evidenceDraft.hasSelection = true;
    renderEvidenceFoundation();
    return;
  }
  handleTodaysMissionEdit(event);
});
root.addEventListener("beforeinput", (event) => {
  const editor = event.target.closest("[data-teacher-memo-editor]");
  if (!editor || !memoTypingFormat || event.inputType !== "insertText" || !event.data) return;
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return;
  event.preventDefault();
  if (editor.innerText.length >= TEACHER_MEMO_MAX_CHARACTERS && range.collapsed) return;
  range.deleteContents();
  const span = document.createElement("span");
  span.dataset.memoColor = memoTypingFormat.color;
  span.dataset.memoSize = memoTypingFormat.size;
  span.dataset.memoStyle = memoTypingFormat.style;
  memoFormatRevision += 1;
  span.dataset.memoPriority = String(memoFormatRevision);
  span.textContent = event.data;
  range.insertNode(span);
  range.setStartAfter(span);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  const hidden = document.querySelector("[data-teacher-memo]");
  if (hidden) hidden.value = editor.innerText.slice(0, TEACHER_MEMO_MAX_CHARACTERS);
  const count = document.querySelector("[data-teacher-memo-count]");
  if (count) count.textContent = String(hidden?.value.length ?? 0);
  const status = document.querySelector("[data-teacher-memo-status]");
  if (status) {
    status.dataset.state = "unsaved";
    status.textContent = "Unsaved changes. Save before refreshing or opening Student Display.";
  }
});
root.addEventListener("input", (event) => {
  if (event.target.closest?.("[data-do-now-editor]")) {
    const editor2 = event.target.closest("[data-do-now-editor]");
    const range = event.target.matches('input[type="range"]') ? event.target : null;
    if (range) range.nextElementSibling && (range.nextElementSibling.textContent = `${range.value} px`);
    updateDoNowDraftFromEditor(editor2);
    return;
  }
  const pixelSpeed = event.target.closest("[data-pixel-speed]");
  if (pixelSpeed) {
    const output = document.querySelector("[data-pixel-speed-output]");
    if (output) output.textContent = `${(Number(pixelSpeed.value) / 1e3).toFixed(1)} sec`;
    startPixelStudioPreview();
    return;
  }
  const pixelColor = event.target.closest("[data-pixel-color]");
  if (pixelColor) {
    pixelColor.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  const voiceSensitivity = event.target.closest("[data-voice-sensitivity]");
  if (voiceSensitivity) {
    const sensitivity = voiceMeter.setSensitivity(voiceSensitivity.value);
    document.querySelectorAll("[data-voice-sensitivity]").forEach((input) => {
      input.value = String(sensitivity);
    });
    document.querySelectorAll("[data-voice-sensitivity-value]").forEach((output) => {
      output.textContent = `${sensitivity}%`;
    });
    const status2 = document.querySelector("[data-voice-meter-status]");
    if (status2) status2.textContent = sensitivity === 100 ? "Sensitivity is set to normal." : sensitivity < 100 ? "Sensitivity reduced for a louder room or microphone." : "Sensitivity increased for a quieter room or microphone.";
    return;
  }
  const quickGoal = event.target.closest('[name="todayGoal"]');
  if (quickGoal) {
    const goals = quickGoal.closest("[data-quick-goals]");
    if (goals) goals.dataset.goalsMode = "custom";
    return;
  }
  const webpageSearch = event.target.closest("[data-webpage-search]");
  if (webpageSearch) {
    const picker = webpageSearch.closest("[data-resource-picker-webpage]");
    const category = picker?.querySelector("[data-webpage-category]")?.value ?? "all";
    const query = webpageSearch.value.trim().toLowerCase();
    let visible = 0;
    picker?.querySelectorAll("[data-webpage-catalog-item]").forEach((item) => {
      const matches = (!query || item.dataset.webpageSearchValue.includes(query)) && (category === "all" || item.dataset.webpageCategoryValue === category);
      item.hidden = !matches;
      if (matches) visible += 1;
    });
    const empty3 = picker?.querySelector("[data-webpage-empty]");
    if (empty3) empty3.hidden = visible > 0;
    return;
  }
  const whiteboardTitle = event.target.closest("[data-whiteboard-title]");
  if (whiteboardTitle) {
    whiteboardDrawingTitle = whiteboardTitle.value.trim() || "Workshop Drawing";
    renderWhiteboardObjects();
    return;
  }
  const whiteboardZoomControl = event.target.closest("[data-whiteboard-zoom]");
  if (whiteboardZoomControl) {
    whiteboardZoom = Math.min(300, Math.max(50, Number(whiteboardZoomControl.value) || 100));
    applyWhiteboardZoom();
    saveWhiteboard();
    setWhiteboardStatus(`Zoom set to ${whiteboardZoom}%.`);
    return;
  }
  const whiteboardSize = event.target.closest("[data-whiteboard-size]");
  if (whiteboardSize) {
    const output = document.querySelector("[data-whiteboard-size-output]");
    if (output) output.textContent = whiteboardSize.value;
    return;
  }
  const whiteboardColor = event.target.closest("[data-whiteboard-color]");
  if (whiteboardColor) {
    const chip = document.querySelector("[data-whiteboard-color-chip]");
    const paintCan = document.querySelector("[data-whiteboard-paint-can-icon]");
    if (chip) chip.style.setProperty("--whiteboard-selected-color", whiteboardColor.value);
    if (paintCan) paintCan.style.setProperty("--whiteboard-selected-color", whiteboardColor.value);
    return;
  }
  const whiteboardLineSize = event.target.closest("[data-whiteboard-line-size]");
  if (whiteboardLineSize) {
    const size = document.querySelector("[data-whiteboard-size]");
    const output = document.querySelector("[data-whiteboard-line-size-output]");
    if (size) {
      size.value = whiteboardLineSize.value;
      size.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (output) output.textContent = whiteboardLineSize.value;
    return;
  }
  const whiteboardEraserSize = event.target.closest("[data-whiteboard-eraser-size]");
  if (whiteboardEraserSize) {
    const output = document.querySelector("[data-whiteboard-eraser-size-output]");
    if (output) output.textContent = whiteboardEraserSize.value;
    return;
  }
  const whiteboard3DDepth = event.target.closest("[data-whiteboard-3d-depth]");
  if (whiteboard3DDepth) {
    const depth = Number(whiteboard3DDepth.value);
    const output = document.querySelector("[data-whiteboard-3d-depth-output]");
    if (output) output.textContent = String(depth);
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.original2DType) {
      selected.depth = depth;
      renderWhiteboardObjects();
      saveWhiteboard();
      setWhiteboardStatus(`3D thickness set to ${depth}.`);
    }
    return;
  }
  const scheduleDuration = event.target.closest('form[data-form="class-timer-schedule"] [name="durationMinutes"]');
  if (scheduleDuration) {
    const form = scheduleDuration.closest("form");
    const duration = Number(scheduleDuration.value);
    recommendedTimerPhases(duration).forEach((phase) => {
      const input = form?.querySelector(`[data-phase-start="${phase.key}"]`);
      if (input) {
        input.value = String(phase.startMinute);
        input.max = String(Math.max(0, duration - 1));
      }
    });
    if (Number.isInteger(duration) && duration >= MIN_LESSON_MINUTES && duration <= MAX_LESSON_MINUTES) {
      const currentSchedule = classTimerSchedule.read();
      const saved = classTimerSchedule.save({ ...currentSchedule, durationMinutes: duration, phases: recommendedTimerPhases(duration) });
      if (saved.ok) {
        preserveCurrentClassSetup(currentTeacherClass(session.read().teacherId)?.id);
        const status2 = form?.querySelector("[data-class-timer-schedule-status]");
        if (status2) status2.textContent = `Class duration saved automatically at ${duration} minutes.`;
      }
    }
    if (Number.isInteger(duration) && duration >= MIN_LESSON_MINUTES && duration <= MAX_LESSON_MINUTES && lessonTimer.read().status === LESSON_TIMER_STATES.READY) {
      lessonTimer.setDuration(duration);
      syncLessonTimerPresentation();
    }
    return;
  }
  const reflection = event.target.closest("[data-evidence-reflection]");
  if (reflection && evidenceDraft) {
    evidenceDraft.detail = reflection.value;
    const preview = document.querySelector("[data-evidence-preview]");
    if (preview) preview.innerHTML = `<p>${escapeHtml2(reflection.value || "Your preview will appear here before anything is saved.")}</p>`;
    return;
  }
  if (handleTodaysMissionEdit(event)) return;
  const editor = event.target.closest("[data-teacher-memo-editor]");
  const field = editor ? document.querySelector("[data-teacher-memo]") : event.target.closest("[data-teacher-memo]");
  if (!field) return;
  if (editor) field.value = editor.innerText.slice(0, TEACHER_MEMO_MAX_CHARACTERS);
  const count = document.querySelector("[data-teacher-memo-count]");
  const error = document.querySelector("[data-teacher-memo-error]");
  const status = document.querySelector("[data-teacher-memo-status]");
  if (count) count.textContent = String(field.value.length);
  if (error) {
    error.textContent = "";
    error.hidden = true;
  }
  if (status) {
    const savedText = teacherMemo.read().text;
    const hasUnsavedChanges = field.value.trim() !== savedText;
    status.dataset.state = hasUnsavedChanges ? "unsaved" : savedText ? "saved" : "empty";
    status.textContent = hasUnsavedChanges ? "Unsaved changes. Save before refreshing or opening Student Display." : savedText ? "Saved for refresh and Student Display." : "No memo saved yet.";
  }
});
window.addEventListener("hashchange", () => {
  stopVoiceMeter();
  render();
});
window.addEventListener("storage", (event) => {
  if (![CLASS_RESOURCE_STORAGE_KEY, ACTIVITY_DIRECTIONS_STORAGE_KEY, WEEKLY_REFLECTION_STORAGE_KEY].includes(event.key)) return;
  const state = session.read();
  if (currentRoute() === ROUTES.STUDENT_DASHBOARD && state.role === PLATFORM_ROLES.STUDENT) render();
  if (currentRoute() === ROUTES.TEACHER_DASHBOARD && state.role === PLATFORM_ROLES.TEACHER) {
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = document.querySelector("[data-class-resource-teacher]");
    if (classId && region) region.outerHTML = classResourceTeacherMarkup(classId);
    const directionsRegion = document.querySelector("[data-activity-directions-teacher]");
    if (classId && directionsRegion) directionsRegion.outerHTML = activityDirectionsTeacherMarkup(classId);
  }
});
window.addEventListener("resize", () => window.requestAnimationFrame(fitStudentMemoPresentation));
document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  const editor = document.querySelector("[data-teacher-memo-editor]");
  if (!editor || !selection?.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  if (editor.contains(range.commonAncestorContainer)) memoSelectionRange = range.cloneRange();
});
document.addEventListener("keydown", (event) => {
  const openWhiteboard = document.querySelector("#platform-classroom-whiteboard:not([hidden])");
  const typingTarget = event.target instanceof Element && event.target.closest("textarea, [contenteditable='true'], input:not([type='button']):not([type='range']):not([type='color'])");
  const shortcutKey = (event.ctrlKey || event.metaKey) && !event.altKey ? event.key.toLowerCase() : "";
  if (openWhiteboard && !typingTarget && ["b", "i", "u"].includes(shortcutKey)) {
    event.preventDefault();
    formatSelectedWhiteboardText({ b: "bold", i: "italic", u: "underline" }[shortcutKey]);
    return;
  }
  if (openWhiteboard && !typingTarget && ["c", "x", "d"].includes(shortcutKey)) {
    event.preventDefault();
    if (shortcutKey === "c") {
      const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
      if (!selected) {
        setWhiteboardStatus("Select a whiteboard object before copying it.");
        return;
      }
      whiteboardClipboard = structuredClone(serializableWhiteboardObjects().find((object) => object.id === selected.id));
      if (selected.type === "image") void copySelectedWhiteboardObjectAsImage();
      else setWhiteboardStatus("Selected object copied. Press Ctrl+V or Command+V to paste it.");
      return;
    }
    if (shortcutKey === "x") {
      cutSelectedWhiteboardObject();
      return;
    }
    if (shortcutKey === "d") {
      duplicateSelectedWhiteboardObject();
      return;
    }
  }
  if (openWhiteboard && !typingTarget && (event.key === "Backspace" || event.key === "Delete")) {
    if (!whiteboardSelectedObjectId) return;
    event.preventDefault();
    deleteSelectedWhiteboardObject();
    return;
  }
  if (event.key !== "Escape") return;
  const whiteboard = document.querySelector("#platform-classroom-whiteboard:not([hidden])");
  if (whiteboard) {
    event.preventDefault();
    const keyboardHelp = whiteboard.querySelector("[data-whiteboard-keyboard-help]:not([hidden])");
    const contextMenu = whiteboard.querySelector("[data-whiteboard-context-menu]:not([hidden])");
    const confirmation = whiteboard.querySelector("[data-whiteboard-clear-confirmation]:not([hidden])");
    const lassoConfirmation = whiteboard.querySelector("[data-whiteboard-lasso-confirmation]:not([hidden])");
    const pixelDialog = whiteboard.querySelector("[data-pixel-studio]:not([hidden])");
    const dimensionQuestion = whiteboard.querySelector("[data-whiteboard-dimension-question]:not([hidden])");
    if (pixelDialog) {
      pixelDialog.hidden = true;
      window.clearInterval(pixelStudioPreviewTimer);
      setWhiteboardStatus("Pixel Studio closed. Your frames are kept while this whiteboard is open.");
    } else if (keyboardHelp) keyboardHelp.hidden = true;
    else if (contextMenu) contextMenu.hidden = true;
    else if (lassoConfirmation) {
      clearWhiteboardLassoChoice();
      setWhiteboardStatus("Cutout canceled. The board was not changed.");
    } else if (dimensionQuestion) {
      dimensionQuestion.hidden = true;
      whiteboardPendingDimension = null;
      renderWhiteboardObjects();
      setWhiteboardStatus("CAD measurement canceled.");
    } else if (confirmation) confirmation.hidden = true;
    else if (whiteboard.dataset.presentation === "true") {
      whiteboard.dataset.presentation = "false";
      const exit = whiteboard.querySelector('[data-action="whiteboard-exit-presentation"]');
      if (exit) exit.hidden = true;
      whiteboard.focus();
    } else {
      whiteboard.hidden = true;
      whiteboardDisplayTrigger?.focus();
      whiteboardDisplayTrigger = null;
    }
    return;
  }
  const voiceDisplay = document.querySelector("#platform-large-voice-meter-display:not([hidden])");
  if (voiceDisplay) {
    event.preventDefault();
    voiceDisplay.hidden = true;
    voiceMeterDisplayTrigger?.focus();
    voiceMeterDisplayTrigger = null;
    return;
  }
  const missionConfirmation = document.querySelector("[data-todays-mission-confirmation]:not([hidden])");
  if (missionConfirmation) {
    event.preventDefault();
    closeTodaysMissionClearConfirmation();
    return;
  }
  const display = document.querySelector("#platform-student-timer-display:not([hidden])");
  if (!display) return;
  storeLessonTimerDisplayOpen(false);
  display.hidden = true;
  const focusTarget = lessonTimerDisplayTrigger?.isConnected ? lessonTimerDisplayTrigger : document.querySelector('[data-action="open-timer-display"]');
  lessonTimerDisplayTrigger = null;
  focusTarget?.focus();
});
document.addEventListener("paste", (event) => {
  const doNowEditor = document.querySelector("[data-do-now-editor]");
  if (doNowEditor && !(event.target instanceof Element && event.target.closest("textarea, input, [contenteditable='true']"))) {
    const imageItem2 = [...event.clipboardData?.items || []].find((item) => item.type.startsWith("image/"));
    const imageFile = imageItem2?.getAsFile();
    if (imageFile) {
      event.preventDefault();
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        doNowDraft.image = String(reader.result);
        openDoNowEditor(doNowDraft);
      }, { once: true });
      reader.readAsDataURL(imageFile);
      return;
    }
  }
  const openWhiteboard = document.querySelector("#platform-classroom-whiteboard:not([hidden])");
  const openPixelStudio2 = document.querySelector("[data-pixel-studio]:not([hidden])");
  if (openPixelStudio2) {
    const gifItem = [...event.clipboardData?.items || []].find((item) => item.type === "image/gif");
    const gifFile = gifItem?.getAsFile();
    if (gifFile) {
      event.preventDefault();
      void importPixelGif(gifFile);
      return;
    }
    const htmlUrl = gifUrlFromClipboardText(event.clipboardData?.getData("text/html"), true), textUrl = gifUrlFromClipboardText(event.clipboardData?.getData("text/plain"));
    if (htmlUrl || textUrl) {
      event.preventDefault();
      void importPixelGifUrl(htmlUrl || textUrl);
      return;
    }
    const stillImage = [...event.clipboardData?.items || []].some((item) => item.type.startsWith("image/"));
    if (stillImage) {
      event.preventDefault();
      setWhiteboardStatus("The website copied only one still frame. Copy the GIF image address, or download and upload the GIF.");
      return;
    }
  }
  const typingTarget = event.target instanceof Element && event.target.closest("textarea, [contenteditable='true'], input");
  if (!openWhiteboard || typingTarget) return;
  const imageItem = [...event.clipboardData?.items || []].find((item) => item.type.startsWith("image/"));
  const blob = imageItem?.getAsFile();
  if (blob) {
    event.preventDefault();
    addClipboardImageToWhiteboard(blob);
    return;
  }
  if (whiteboardClipboard) {
    event.preventDefault();
    pasteWhiteboardClipboard();
  }
});
async function startPlatform() {
  if (productionIdentityConfig.enabled) {
    const result = await productionIdentity.session();
    if (result.ok && result.value.teacher?.id) {
      session.signInTeacher(result.value.teacher.id);
      const classrooms = await productionIdentity.listClassrooms();
      if (classrooms.ok) setProductionTeacherClasses(classrooms.value.classrooms);
    } else if (result.ok && result.value.student?.id && result.value.student?.classId) session.signInStudent(result.value.student.classId, result.value.student.id);
    else if (result.ok) session.signOut();
    if (result.ok && (result.value.teacher?.id || result.value.student?.id)) await loadLessonStepsFromService(session.read());
  }
  render();
  enterStandaloneClassroomDisplayMode();
  if (floatingBobRoamingInterval === null) scheduleNextBobMove();
}
void startPlatform();
export {
  ROUTES
};
