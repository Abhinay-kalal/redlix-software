import { Question } from "./questions";

export const UIUX_QUESTIONS: Question[] = [
  // SECTION A — ADVANCED MCQs (1 - 25)
  {
    id: 5001,
    type: "mcq",
    section: "A",
    number: 1,
    questionText: "A user completes a checkout flow successfully, but usability testing shows that users consistently hesitate before clicking the final button. Which UX issue should be investigated first?",
    options: [
      "A. Server latency",
      "B. Affordance, hierarchy, and CTA clarity",
      "C. Database normalization",
      "D. Brand awareness"
    ],
    marks: 2
  },
  {
    id: 5002,
    type: "mcq",
    section: "A",
    number: 2,
    questionText: "A designer uses a 12-column grid but places elements at inconsistent horizontal positions. Which design principle is primarily being violated?",
    options: ["A. Alignment", "B. Proximity", "C. Accessibility", "D. Affordance"],
    marks: 2
  },
  {
    id: 5003,
    type: "mcq",
    section: "A",
    number: 3,
    questionText: "Which situation best demonstrates a violation of Jakob's Law?",
    options: [
      "A. Users expect a familiar navigation pattern based on experiences with other websites",
      "B. Users prefer larger fonts",
      "C. Users dislike animations",
      "D. Users prefer dark mode"
    ],
    marks: 2
  },
  {
    id: 5004,
    type: "mcq",
    section: "A",
    number: 4,
    questionText: "A button visually looks clickable but provides no hover, focus, or pressed state. Which principle is most affected?",
    options: [
      "A. Affordance and feedback",
      "B. Information architecture",
      "C. Card sorting",
      "D. User segmentation"
    ],
    marks: 2
  },
  {
    id: 5005,
    type: "mcq",
    section: "A",
    number: 5,
    questionText: "Which research method is most appropriate for discovering why users abandon a checkout process?",
    options: [
      "A. Logo testing",
      "B. User interviews combined with usability testing",
      "C. Color preference survey only",
      "D. Competitor logo analysis"
    ],
    marks: 2
  },
  {
    id: 5006,
    type: "mcq",
    section: "A",
    number: 6,
    questionText: "A dashboard contains 25 metrics, all displayed with identical visual prominence. What is the primary UX problem?",
    options: [
      "A. Lack of visual hierarchy",
      "B. Excessive accessibility",
      "C. Excessive whitespace",
      "D. Strong information architecture"
    ],
    marks: 2
  },
  {
    id: 5007,
    type: "mcq",
    section: "A",
    number: 7,
    questionText: "Which principle explains why visually grouped elements are perceived as related?",
    options: ["A. Similarity", "B. Proximity", "C. Continuity", "D. Closure"],
    marks: 2
  },
  {
    id: 5008,
    type: "mcq",
    section: "A",
    number: 8,
    questionText: "A user interface uses red text on a dark-red background. What should the designer primarily evaluate?",
    options: [
      "A. Color contrast and accessibility",
      "B. Brand positioning",
      "C. Information architecture",
      "D. User persona"
    ],
    marks: 2
  },
  {
    id: 5009,
    type: "mcq",
    section: "A",
    number: 9,
    questionText: "Which WCAG concept primarily concerns whether users can perceive content?",
    options: ["A. Operable", "B. Understandable", "C. Perceivable", "D. Robust"],
    marks: 2
  },
  {
    id: 5010,
    type: "mcq",
    section: "A",
    number: 10,
    questionText: "A designer creates a component that changes unpredictably depending on the page where it appears. What design-system principle is being compromised?",
    options: ["A. Consistency", "B. Responsiveness", "C. Personalization", "D. Animation"],
    marks: 2
  },
  {
    id: 5011,
    type: "mcq",
    section: "A",
    number: 11,
    questionText: "Which research method is best suited to discovering how users naturally organize categories?",
    options: ["A. Card sorting", "B. A/B testing", "C. Heatmap analysis", "D. Eye tracking only"],
    marks: 2
  },
  {
    id: 5012,
    type: "mcq",
    section: "A",
    number: 12,
    questionText: "Which technique is most useful for determining whether users can successfully complete a specific task?",
    options: [
      "A. Usability testing",
      "B. Mood board creation",
      "C. Competitive branding",
      "D. Typography pairing"
    ],
    marks: 2
  },
  {
    id: 5013,
    type: "mcq",
    section: "A",
    number: 13,
    questionText: "A designer asks users, \"Would you use this feature?\" before building it. Why might this produce unreliable evidence?",
    options: [
      "A. Users always dislike new features",
      "B. Stated intentions may differ from actual behavior",
      "C. Interviews cannot be used in UX research",
      "D. Users cannot answer questions"
    ],
    marks: 2
  },
  {
    id: 5014,
    type: "mcq",
    section: "A",
    number: 14,
    questionText: "Which UX metric measures the percentage of users who successfully complete a task?",
    options: [
      "A. Task success rate",
      "B. Bounce rate",
      "C. Net Promoter Score",
      "D. Conversion velocity"
    ],
    marks: 2
  },
  {
    id: 5015,
    type: "mcq",
    section: "A",
    number: 15,
    questionText: "A user repeatedly clicks an element that looks interactive but does nothing. What is this commonly evidence of?",
    options: [
      "A. Poor affordance",
      "B. Good feedback",
      "C. Strong information architecture",
      "D. Successful interaction design"
    ],
    marks: 2
  },
  {
    id: 5016,
    type: "mcq",
    section: "A",
    number: 16,
    questionText: "Which approach is most appropriate for designing an application used equally on mobile, tablet, and desktop?",
    options: [
      "A. Desktop-only design",
      "B. Responsive/adaptive design strategy based on content and interaction requirements",
      "C. Fixed-width design",
      "D. Separate random layouts with no system"
    ],
    marks: 2
  },
  {
    id: 5017,
    type: "mcq",
    section: "A",
    number: 17,
    questionText: "A mobile interface places the most frequently used actions at the top-left corner even though users primarily operate the device with one hand. What should be evaluated?",
    options: [
      "A. Thumb reach and ergonomic accessibility",
      "B. Brand personality",
      "C. Logo scalability",
      "D. Database performance"
    ],
    marks: 2
  },
  {
    id: 5018,
    type: "mcq",
    section: "A",
    number: 18,
    questionText: "Which UX principle states that the time required to reach a target depends partly on its size and distance?",
    options: ["A. Hick's Law", "B. Fitts's Law", "C. Miller's Law", "D. Jakob's Law"],
    marks: 2
  },
  {
    id: 5019,
    type: "mcq",
    section: "A",
    number: 19,
    questionText: "A navigation menu contains 30 equally weighted options. Which principle suggests reducing decision complexity?",
    options: [
      "A. Hick's Law",
      "B. Fitts's Law",
      "C. Gestalt closure",
      "D. Von Restorff effect"
    ],
    marks: 2
  },
  {
    id: 5020,
    type: "mcq",
    section: "A",
    number: 20,
    questionText: "A designer makes one important button visually different from all surrounding buttons to draw attention to it. Which principle is being used?",
    options: [
      "A. Von Restorff effect",
      "B. Serial position effect",
      "C. Pareto principle",
      "D. Occam's principle"
    ],
    marks: 2
  },
  {
    id: 5021,
    type: "mcq",
    section: "A",
    number: 21,
    questionText: "Which typography decision generally improves readability for long-form digital content?",
    options: [
      "A. Extremely condensed typeface with minimal line spacing",
      "B. Appropriate line length, hierarchy, spacing, and readable type size",
      "C. Using five unrelated fonts",
      "D. Using all-caps paragraphs"
    ],
    marks: 2
  },
  {
    id: 5022,
    type: "mcq",
    section: "A",
    number: 22,
    questionText: "A design looks visually attractive but users cannot understand what to do next. What is the most important issue?",
    options: [
      "A. Visual appeal is insufficient without usable interaction and clear hierarchy",
      "B. The design needs more gradients",
      "C. The logo should be larger",
      "D. More animations should be added"
    ],
    marks: 2
  },
  {
    id: 5023,
    type: "mcq",
    section: "A",
    number: 23,
    questionText: "Which design process is most appropriate for solving a complex user problem?",
    options: [
      "A. Design → Launch → Research",
      "B. Research → Define → Ideate → Prototype → Test → Iterate",
      "C. Code → Design → Research",
      "D. Launch → Test → Research"
    ],
    marks: 2
  },
  {
    id: 5024,
    type: "mcq",
    section: "A",
    number: 24,
    questionText: "A product team has strong quantitative analytics showing where users drop off but doesn't know why. Which research approach best complements the data?",
    options: [
      "A. Qualitative user research",
      "B. Increasing the font size",
      "C. Changing the logo",
      "D. Adding animations"
    ],
    marks: 2
  },
  {
    id: 5025,
    type: "mcq",
    section: "A",
    number: 25,
    questionText: "A UI is aesthetically excellent but requires users to remember information from one screen while completing a task on another. Which usability principle is being violated?",
    options: [
      "A. Recognition rather than recall",
      "B. Visibility of system status",
      "C. Error prevention",
      "D. Flexibility"
    ],
    marks: 2
  },

  // SECTION B — DESIGN, UX ANALYSIS & PRACTICAL THINKING (26 - 50)
  {
    id: 5026,
    type: "mcq",
    section: "B",
    number: 26,
    questionText: "UX Case Study: A food-delivery app checkout flow (Cart → Address → Payment → Confirmation) shows 45% abandonment between Address and Payment. What should the UX team do first?",
    options: [
      "A. Immediately redesign the entire application",
      "B. Investigate the step using analytics, usability testing, and session research",
      "C. Change the logo",
      "D. Add more advertisements"
    ],
    marks: 2
  },
  {
    id: 5027,
    type: "mcq",
    section: "B",
    number: 27,
    questionText: "Information Architecture: On an education platform, users frequently confuse 'Progress' and 'Certificates'. What is the best UX approach?",
    options: [
      "A. Remove Progress",
      "B. Remove Certificates",
      "C. Clarify information architecture and distinguish their purposes",
      "D. Add more colors"
    ],
    marks: 2
  },
  {
    id: 5028,
    type: "mcq",
    section: "B",
    number: 28,
    questionText: "Design System: A company has 15 different button styles across its product. What should a UX designer recommend?",
    options: [
      "A. Create more button styles",
      "B. Establish a reusable design-system component with defined variants and states",
      "C. Remove all buttons",
      "D. Use different styles on every page"
    ],
    marks: 2
  },
  {
    id: 5029,
    type: "mcq",
    section: "B",
    number: 29,
    questionText: "Component States: Which list of states should a production-ready button component consider?",
    options: [
      "A. Default only",
      "B. Default, hover, focus, active/pressed, disabled, loading where applicable",
      "C. Dark mode only",
      "D. Mobile only"
    ],
    marks: 2
  },
  {
    id: 5030,
    type: "mcq",
    section: "B",
    number: 30,
    questionText: "Accessibility: A form uses only red borders to indicate invalid fields. What is the primary accessibility problem?",
    options: [
      "A. Red is always prohibited",
      "B. Color alone should not be the only means of communicating an error",
      "C. Forms should never show errors",
      "D. Borders should always be blue"
    ],
    marks: 2
  },
  {
    id: 5031,
    type: "mcq",
    section: "B",
    number: 31,
    questionText: "Responsive Design: A desktop dashboard contains a 10-column data table that becomes unreadable on mobile. Which approach is generally strongest?",
    options: [
      "A. Shrink everything until unreadable",
      "B. Consider responsive restructuring such as horizontal scrolling, prioritized columns, or alternative mobile presentation",
      "C. Remove all data",
      "D. Keep the exact desktop layout"
    ],
    marks: 2
  },
  {
    id: 5032,
    type: "mcq",
    section: "B",
    number: 32,
    questionText: "User Persona: A team creates a persona based entirely on assumptions from the internal marketing team. What is the biggest weakness?",
    options: [
      "A. Personas should be grounded in research and representative evidence",
      "B. Personas should never contain demographic information",
      "C. Personas must always be fictional",
      "D. Marketing teams cannot participate in UX"
    ],
    marks: 2
  },
  {
    id: 5033,
    type: "mcq",
    section: "B",
    number: 33,
    questionText: "User Flow: A registration process requires (Name → Email → Phone → Address → DOB → Password → OTP → Preferences → Confirmation). What is the most important UX question?",
    options: [
      "A. Can unnecessary steps or information requirements be reduced?",
      "B. Can the logo be animated?",
      "C. Can the background use more gradients?",
      "D. Can every field be made mandatory?"
    ],
    marks: 2
  },
  {
    id: 5034,
    type: "mcq",
    section: "B",
    number: 34,
    questionText: "A/B Testing: Version A has a 4.8% conversion rate. Version B has a 5.2% conversion rate. Can the team immediately conclude B is better?",
    options: [
      "A. Yes, always",
      "B. No; sample size, statistical significance, experiment quality, and practical significance should be evaluated",
      "C. Only if B has a better color",
      "D. Only if B uses a larger logo"
    ],
    marks: 2
  },
  {
    id: 5035,
    type: "mcq",
    section: "B",
    number: 35,
    questionText: "Heuristic Evaluation: A banking application allows users to submit a transaction but provides no confirmation or status. Which usability heuristic is primarily violated?",
    options: [
      "A. Visibility of system status",
      "B. Match between system and real world",
      "C. Aesthetic design",
      "D. Flexibility"
    ],
    marks: 2
  },
  {
    id: 5036,
    type: "mcq",
    section: "B",
    number: 36,
    questionText: "Error Handling: Which error message provides the best UX?",
    options: [
      "A. Invalid input.",
      "B. Error 402.",
      "C. Password must contain at least 8 characters, including one number.",
      "D. Something happened."
    ],
    marks: 2
  },
  {
    id: 5037,
    type: "mcq",
    section: "B",
    number: 37,
    questionText: "Form Design: Which approach generally reduces unnecessary cognitive load in a complex form?",
    options: [
      "A. Asking for every possible field immediately",
      "B. Grouping related fields and progressively revealing information when appropriate",
      "C. Removing field labels",
      "D. Using placeholders as the only labels"
    ],
    marks: 2
  },
  {
    id: 5038,
    type: "mcq",
    section: "B",
    number: 38,
    questionText: "Visual Hierarchy: A landing page has 5 large headings, 4 primary buttons, 8 highlighted statistics, and 6 promotional cards (everything looks equally important). What is the core problem?",
    options: [
      "A. Lack of hierarchy",
      "B. Too much accessibility",
      "C. Too little content",
      "D. Insufficient animation"
    ],
    marks: 2
  },
  {
    id: 5039,
    type: "mcq",
    section: "B",
    number: 39,
    questionText: "Color System: A design system uses Primary, Secondary, Success, Warning, Error, but designers randomly choose different shades. What should be introduced?",
    options: [
      "A. Semantic color tokens",
      "B. More random colors",
      "C. No color system",
      "D. Different colors per page"
    ],
    marks: 2
  },
  {
    id: 5040,
    type: "mcq",
    section: "B",
    number: 40,
    questionText: "Figma: Which Figma feature is most appropriate for maintaining reusable UI components?",
    options: ["A. Components and variants", "B. Manual duplication only", "C. Screenshot export", "D. Pencil tool"],
    marks: 2
  },
  {
    id: 5041,
    type: "mcq",
    section: "B",
    number: 41,
    questionText: "Auto Layout: A card should automatically expand when its title becomes longer. Which Figma capability is most appropriate?",
    options: ["A. Flatten", "B. Auto Layout", "C. Rasterize", "D. Crop"],
    marks: 2
  },
  {
    id: 5042,
    type: "mcq",
    section: "B",
    number: 42,
    questionText: "Prototyping: A designer wants to test whether users can navigate from a dashboard to a course page before development begins. What should they create?",
    options: [
      "A. High-level interactive prototype",
      "B. Database schema",
      "C. Backend API",
      "D. Production deployment"
    ],
    marks: 2
  },
  {
    id: 5043,
    type: "mcq",
    section: "B",
    number: 43,
    questionText: "Design Critique: A designer says: \"I chose this layout because I personally like it.\" What is the strongest UX response?",
    options: [
      "A. Personal preference is sufficient",
      "B. Design decisions should be supported by user needs, usability principles, research, or measurable objectives",
      "C. Designers should never make decisions",
      "D. Visual design does not matter"
    ],
    marks: 2
  },
  {
    id: 5044,
    type: "mcq",
    section: "B",
    number: 44,
    questionText: "UX Research: Five users encounter the same navigation problem during usability testing. What should the team do?",
    options: [
      "A. Ignore it because only five users participated",
      "B. Investigate the pattern and determine whether it represents a broader usability issue",
      "C. Immediately redesign the entire product",
      "D. Remove navigation"
    ],
    marks: 2
  },
  {
    id: 5045,
    type: "mcq",
    section: "B",
    number: 45,
    questionText: "Dark Mode: A designer converts a light UI to dark mode by simply changing white backgrounds to black and black text to white. Why can this be problematic?",
    options: [
      "A. Dark mode requires consideration of contrast, elevation, semantic colors, visual hierarchy, and accessibility",
      "B. Dark mode cannot use black",
      "C. Dark mode should never use text",
      "D. Dark mode is automatically inaccessible"
    ],
    marks: 2
  },
  {
    id: 5046,
    type: "mcq",
    section: "B",
    number: 46,
    questionText: "Microinteractions: A payment button changes to a loading state immediately after being clicked. What UX problem does this primarily help address?",
    options: [
      "A. Lack of system feedback and uncertainty about whether the action was registered",
      "B. Poor typography",
      "C. Weak branding",
      "D. Incorrect information architecture"
    ],
    marks: 2
  },
  {
    id: 5047,
    type: "mcq",
    section: "B",
    number: 47,
    questionText: "Mobile UX: A mobile application uses tiny icons without labels for critical actions. What should the designer evaluate?",
    options: [
      "A. Whether the icons are understandable, appropriately sized, accessible, and supported by labels where necessary",
      "B. Whether the logo is larger",
      "C. Whether animations are faster",
      "D. Whether more icons can be added"
    ],
    marks: 2
  },
  {
    id: 5048,
    type: "mcq",
    section: "B",
    number: 48,
    questionText: "UX Metrics: A product team wants to measure whether a redesigned checkout is easier to use. Which combination provides stronger evidence?",
    options: [
      "A. Number of colors + number of screens",
      "B. Task success rate + completion time + error rate + qualitative feedback",
      "C. Number of designers",
      "D. Number of animations"
    ],
    marks: 2
  },
  {
    id: 5049,
    type: "mcq",
    section: "B",
    number: 49,
    questionText: "Design Decision: Users request a feature that adds significant complexity for a very small percentage of users. What should the UX team do?",
    options: [
      "A. Automatically build it",
      "B. Evaluate user impact, frequency, business value, complexity, and alternatives before prioritizing it",
      "C. Reject every user request",
      "D. Build every requested feature"
    ],
    marks: 2
  },
  {
    id: 5050,
    type: "mcq",
    section: "B",
    number: 50,
    questionText: "Final Case Study: A learning platform faces missing deadlines, 20+ cards, mobile nav issues, and an 18% drop in completion rates. The team wants to only change colors/typography. What should the UX team recommend?",
    options: [
      "A. Change colors and typography only",
      "B. Redesign the logo",
      "C. Conduct research, analyze user flows, simplify IA, prioritize actions, improve responsive nav, prototype solutions, and test them",
      "D. Add more dashboard cards"
    ],
    marks: 2
  }
];
