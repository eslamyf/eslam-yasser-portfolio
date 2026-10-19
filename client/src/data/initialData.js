export const initialServices = [
  {
    num: '01',
    title: 'MEAN Stack Web Development',
    desc: 'High-performance web applications built end to end with Angular, Node.js, Express and MongoDB — clean, maintainable and ready to grow.',
    tags: ['Angular', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB']
  },
  {
    num: '02',
    title: 'Backend & API Architecture',
    desc: 'Secure server-side logic and RESTful APIs with JWT authentication, role-based access control, middleware design and rate limiting.',
    tags: ['REST APIs', 'JWT', 'RBAC', 'Middleware', 'Rate limiting']
  },
  {
    num: '03',
    title: 'Databases & Core CS Systems',
    desc: 'Well-structured data models in MongoDB and SQL, backed by solid foundations in data structures, algorithms and object-oriented design.',
    tags: ['MongoDB', 'SQL', 'Data Structures', 'OOP', 'C++']
  },
  {
    num: '04',
    title: 'Web Development Instruction',
    desc: 'Practical, example-driven sessions on HTML, CSS, JavaScript and core CS concepts for university students.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Mentoring']
  }
];

export const initialProjects = [
  {
    _id: 'proj-1',
    no: '01',
    type: 'MEAN Stack',
    accent: '205 100% 62%',
    title: 'Aqarlo Luxe',
    subtitle: 'Real Estate Management System',
    description: 'A scalable real estate platform on the MEAN stack with a clean, maintainable architecture, a freemium model with secure payment integration, a structured MongoDB design and Git-based workflow.',
    tags: ['Angular', 'Node.js', 'MongoDB', 'Payments'],
    codeUrl: 'https://github.com/eslamyasser',
    liveUrl: '',
    mockType: 'web'
  },
  {
    _id: 'proj-2',
    no: '02',
    type: 'MEAN Stack',
    accent: '28 100% 60%',
    title: 'Foodio',
    subtitle: 'University Food Delivery Platform',
    description: 'A food-delivery app connecting local restaurants with university students — cart system, favorites management and a modular project structure built for high scalability.',
    tags: ['Angular', 'Node.js', 'REST APIs', 'TypeScript'],
    codeUrl: 'https://github.com/eslamyasser',
    liveUrl: '',
    mockType: 'phone'
  },
  {
    _id: 'proj-3',
    no: '03',
    type: 'Backend & Cloud',
    accent: '150 80% 52%',
    title: 'Scalable RESTful Backend',
    subtitle: 'Node.js & MongoDB core engine',
    description: 'High-performance REST API services with role-based access control, authentication using JWT and BcryptJS, automated rate limiting and Cloudinary media pipelines.',
    tags: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'Cloudinary'],
    codeUrl: 'https://github.com/eslamyasser',
    liveUrl: '',
    mockType: 'term'
  }
];

export const initialStackLayers = [
  {
    tag: 'UI layer',
    name: 'Angular',
    accent: '262 90% 72%',
    desc: 'Components, routing and forms in TypeScript, laid out responsively so the app feels the same on a phone and a desktop.',
    tags: ['Angular', 'TypeScript', 'Bootstrap', 'Responsive UI']
  },
  {
    tag: 'API layer',
    name: 'Express',
    accent: '205 100% 62%',
    desc: 'Routes and middleware that expose clean RESTful endpoints, protected with JWT authentication, role-based access control and rate limiting.',
    tags: ['Express.js', 'REST APIs', 'JWT', 'RBAC', 'Rate limiting', 'Postman']
  },
  {
    tag: 'Runtime',
    name: 'Node.js',
    accent: '150 80% 52%',
    desc: 'Server-side JavaScript that runs the business logic, hashes credentials with BcryptJS and handles media uploads through Cloudinary.',
    tags: ['Node.js', 'BcryptJS', 'Cloudinary']
  },
  {
    tag: 'Data layer',
    name: 'MongoDB',
    accent: '178 90% 58%',
    desc: 'Structured document models and queries, backed by SQL fundamentals and a solid grounding in data structures.',
    tags: ['MongoDB', 'SQL', 'Data Structures']
  }
];

export const initialBentoSkills = {
  frontend: {
    title: 'Frontend',
    icon: 'code',
    skills: [
      { name: 'Angular', core: true },
      { name: 'TypeScript', core: true },
      { name: 'JavaScript', core: false },
      { name: 'HTML5', core: false },
      { name: 'CSS3', core: false },
      { name: 'Bootstrap', core: false },
      { name: 'Responsive UI', core: false }
    ]
  },
  backend: {
    title: 'Backend',
    icon: 'server',
    skills: [
      { name: 'Node.js', core: true },
      { name: 'Express.js', core: true },
      { name: 'MongoDB', core: true },
      { name: 'REST APIs', core: false },
      { name: 'JWT Auth', core: false },
      { name: 'RBAC', core: false }
    ]
  },
  foundations: {
    title: 'CS foundations',
    icon: 'cap',
    skills: [
      { name: 'Data Structures', core: false },
      { name: 'OOP', core: false },
      { name: 'C++', core: false },
      { name: 'Python', core: false }
    ]
  },
  workflow: {
    title: 'Workflow',
    icon: 'shield',
    skills: [
      { name: 'Git & GitHub', core: false },
      { name: 'Postman', core: false },
      { name: 'Cloudinary', core: false }
    ]
  }
};

export const initialExperiences = [
  {
    _id: 'exp-1',
    time: 'June 2026 — Present',
    title: 'Web Development Instructor',
    org: 'Support Web Program · Qena, Egypt',
    desc: 'Practical sessions on HTML, CSS and JavaScript for CS students, simplifying programming concepts through hands-on examples.'
  }
];

export const initialEducation = [
  {
    _id: 'edu-1',
    time: 'In progress',
    title: 'B.Sc. in Computer Science',
    org: 'Faculty of Computers & Information · Qena University',
    desc: 'Core coursework in data structures, algorithms, OOP with C++, databases and web engineering.'
  }
];

export const initialVolunteering = [
  {
    _id: 'vol-1',
    time: 'Present',
    title: 'Head of PR Team',
    org: 'Students for Egypt · Faculty of Computers & Information',
    desc: 'Leading the public relations team and student communications for the Faculty of Computers and Information.'
  },
  {
    _id: 'vol-2',
    time: 'Present',
    title: 'Content Data Collector',
    org: 'ClassMate Platform',
    desc: 'Collecting, structuring and organizing educational data and content resources for the platform.'
  }
];

export const initialCertificates = [
  {
    _id: 'cert-1',
    name: 'Python Programming Fundamentals',
    title: 'Python Programming Fundamentals',
    issuer: 'Creativa Hubs',
    org: 'Creativa TIEC Qena',
    issueDate: 'July 2026',
    duration: '30 Hours',
    credentialId: 'CREATIVA-PY-102',
    tags: ['Python 3', 'OOP', 'Data Structures', 'Scripting'],
    description: 'Completed intensive training in Python core programming, data structures, and script automation.',
    img: 'https://res.cloudinary.com/azk1xpfli/image/upload/v1789469355/portfolio/image/nnzkclycuu6mnbxg8c3v.png',
    link: 'https://creativa.gov.eg/'
  },
  {
    _id: 'cert-2',
    name: 'Learn C++ & OOP from Scratch',
    title: 'Learn C++ & OOP from Scratch',
    issuer: 'Udemy',
    org: 'Udemy',
    issueDate: 'September 2025',
    duration: '32 Hours',
    credentialId: 'UC-CPP-OOP-7712',
    tags: ['C++', 'OOP', 'Memory Management', 'Data Structures'],
    description: 'Mastered C++ programming fundamentals, object-oriented programming (OOP) principles, memory management, and data structures.',
    img: 'https://res.cloudinary.com/azk1xpfli/image/upload/v1789469355/portfolio/image/nnzkclycuu6mnbxg8c3v.png',
    link: 'https://www.udemy.com/'
  },
  {
    _id: 'cert-3',
    name: 'The 2026 ICPC Egyptian Collegiate Programming Contest',
    title: 'The 2026 ICPC Egyptian Collegiate Programming Contest',
    issuer: 'ICPC / ECPC',
    org: 'ICPC ECPC Qualifications',
    issueDate: 'August 2026',
    duration: 'Competitive Finalist',
    credentialId: 'ECPC-QUAL-2026',
    tags: ['Algorithms', 'Data Structures', 'C++', 'Competitive Programming'],
    description: 'Qualified and competed in the Egyptian Collegiate Programming Contest solving complex algorithmic and data structure problems.',
    img: 'https://res.cloudinary.com/azk1xpfli/image/upload/v1789469355/portfolio/image/nnzkclycuu6mnbxg8c3v.png',
    link: 'https://icpc.global/'
  },
  {
    _id: 'cert-4',
    name: 'AWS Certified Solutions Architect',
    title: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    org: 'Amazon Web Services',
    issueDate: '2026',
    duration: '60 Hours',
    credentialId: 'AWS-PSA-88231',
    tags: ['AWS', 'Cloud Architecture', 'S3', 'EC2', 'Lambda'],
    description: 'Architecting resilient, scalable, and high-performance cloud applications on AWS.',
    img: 'https://res.cloudinary.com/azk1xpfli/image/upload/v1789469355/portfolio/image/nnzkclycuu6mnbxg8c3v.png',
    link: 'https://aws.amazon.com/certification/'
  },
  {
    _id: 'cert-5',
    name: 'Cybersecurity Academy (Undergraduate)',
    title: 'Cybersecurity Academy (Undergraduate)',
    issuer: 'NTI & EG-CERT',
    org: 'NTI & EG-CERT',
    issueDate: 'June 2025',
    duration: '120 Hours',
    credentialId: 'NTI-SEC-2025',
    tags: ['Network Defense', 'Vulnerability Assessment', 'Linux'],
    description: 'Completed undergraduate cybersecurity academy covering network defense, vulnerability assessment, and security fundamentals.',
    img: 'https://res.cloudinary.com/azk1xpfli/image/upload/v1789469355/portfolio/image/nnzkclycuu6mnbxg8c3v.png',
    link: 'https://www.nti.sci.eg/'
  },
  {
    _id: 'cert-6',
    name: 'NASA International Space Apps Challenge',
    title: 'NASA International Space Apps Challenge',
    issuer: 'NASA',
    org: 'NASA Space Apps',
    issueDate: 'October 2026',
    duration: 'Hackathon (48h)',
    credentialId: 'NASA-APPS-2026',
    tags: ['Space Science', 'Data Analysis', 'Python', 'Problem Solving'],
    description: 'Participated in global hackathon solving space science, data analysis, and environmental engineering challenges.',
    img: 'https://res.cloudinary.com/azk1xpfli/image/upload/v1789469355/portfolio/image/nnzkclycuu6mnbxg8c3v.png',
    link: 'https://www.spaceappschallenge.org/'
  },
  {
    _id: 'cert-7',
    name: 'InnovEgypt Innovation & Entrepreneurship',
    title: 'InnovEgypt Innovation & Entrepreneurship',
    issuer: 'TIEC / Creativa',
    org: 'TIEC & Ministry of Communications',
    issueDate: 'August 2026',
    duration: '40 Hours',
    credentialId: 'TIEC-INNOV-894',
    tags: ['Tech Entrepreneurship', 'MVP Design', 'Lean Startup'],
    description: 'Completed innovation and tech entrepreneurship training program focused on creating technology ventures and commercialization.',
    img: 'https://res.cloudinary.com/azk1xpfli/image/upload/v1789469355/portfolio/image/nnzkclycuu6mnbxg8c3v.png',
    link: 'https://tiec.gov.eg/'
  },
  {
    _id: 'cert-8',
    name: 'Startup Innovation Lab',
    title: 'Startup Innovation Lab',
    issuer: 'Creativa Hubs',
    org: 'Creativa TIEC Qena',
    issueDate: 'June 2026',
    duration: 'Incubator Lab',
    credentialId: 'TIEC-LAB-2026',
    tags: ['Lean Model', 'Prototyping', 'Business Strategy', 'Agile'],
    description: 'Participated in an intensive startup incubator program focused on lean methodology, MVP development, business models, and pitching.',
    img: 'https://res.cloudinary.com/azk1xpfli/image/upload/v1789469355/portfolio/image/nnzkclycuu6mnbxg8c3v.png',
    link: 'https://creativa.gov.eg/'
  }
];

export const initialTestimonials = [
  {
    _id: 'test-1',
    quote: 'Eslam is an exceptionally talented Full-Stack engineer. His command of the MEAN stack and his understanding of REST API architecture elevated our platform significantly.',
    author: 'Ahmed Mansour',
    role: 'Senior Engineering Manager · Support Community',
    initials: 'AM'
  },
  {
    _id: 'test-2',
    quote: 'Outstanding technical competence and dedication. He showed remarkable problem-solving ability and real leadership during our academic and technical training.',
    author: 'Dr. Tarek El-Sayed',
    role: 'Academic Supervisor · Qena University',
    initials: 'TE'
  },
  {
    _id: 'test-3',
    quote: 'Working with Eslam on our platform was a breeze. He turned complex business workflows into fast, intuitive interfaces and delivered ahead of the deadline.',
    author: 'Omar Abdelaziz',
    role: 'Product Lead & Founder · Arabic Block Real Estate',
    initials: 'OA'
  }
];

export const initialStats = [
  { target: 50, suffix: '+', label: 'Students taught' },
  { target: 10, suffix: '+', label: 'Projects built' },
  { target: 4, suffix: '', label: 'Core MEAN technologies' }
];
