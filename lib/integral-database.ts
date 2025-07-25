export interface IntegralProblem {
  id: string;
  problem: string;
  solution: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  hint?: string;
  alternativeForms?: string[];
}

export const basicIntegrals: IntegralProblem[] = [
  {
    id: "basic_1",
    problem: "\\int x \\,dx",
    solution: "\\frac{x^2}{2} + C",
    difficulty: "Basic",
    hint: "Use the power rule: ∫x^n dx = x^(n+1)/(n+1) + C",
    alternativeForms: ["\\frac{1}{2}x^2 + C", "0.5x^2 + C"]
  },
  {
    id: "basic_2",
    problem: "\\int x^2 \\,dx",
    solution: "\\frac{x^3}{3} + C",
    difficulty: "Basic",
    hint: "Apply the power rule with n = 2",
    alternativeForms: ["\\frac{1}{3}x^3 + C"]
  },
  {
    id: "basic_3",
    problem: "\\int \\frac{1}{x} \\,dx",
    solution: "\\ln|x| + C",
    difficulty: "Basic",
    hint: "This is a special case - the antiderivative of 1/x",
    alternativeForms: ["\\ln(x) + C", "\\log(x) + C"]
  },
  {
    id: "basic_4",
    problem: "\\int e^x \\,dx",
    solution: "e^x + C",
    difficulty: "Basic",
    hint: "The exponential function is its own derivative",
    alternativeForms: []
  },
  {
    id: "basic_5",
    problem: "\\int \\sin(x) \\,dx",
    solution: "-\\cos(x) + C",
    difficulty: "Basic",
    hint: "Remember the derivative of cos(x) is -sin(x)",
    alternativeForms: []
  },
  {
    id: "basic_6",
    problem: "\\int \\cos(x) \\,dx",
    solution: "\\sin(x) + C",
    difficulty: "Basic",
    hint: "The derivative of sin(x) is cos(x)",
    alternativeForms: []
  },
  {
    id: "basic_7",
    problem: "\\int x^3 \\,dx",
    solution: "\\frac{x^4}{4} + C",
    difficulty: "Basic",
    hint: "Use the power rule",
    alternativeForms: ["\\frac{1}{4}x^4 + C"]
  },
  {
    id: "basic_8",
    problem: "\\int 2x \\,dx",
    solution: "x^2 + C",
    difficulty: "Basic",
    hint: "Factor out the constant first",
    alternativeForms: []
  }
];

export const intermediateIntegrals: IntegralProblem[] = [
  {
    id: "inter_1",
    problem: "\\int x\\ln(x) \\,dx",
    solution: "\\frac{x^2\\ln(x)}{2} - \\frac{x^2}{4} + C",
    difficulty: "Intermediate",
    hint: "Use integration by parts: u = ln(x), dv = x dx",
    alternativeForms: ["\\frac{x^2}{2}\\ln(x) - \\frac{x^2}{4} + C"]
  },
  {
    id: "inter_2",
    problem: "\\int xe^x \\,dx",
    solution: "xe^x - e^x + C",
    difficulty: "Intermediate",
    hint: "Use integration by parts: u = x, dv = e^x dx",
    alternativeForms: ["e^x(x-1) + C"]
  },
  {
    id: "inter_3",
    problem: "\\int x\\sin(x) \\,dx",
    solution: "-x\\cos(x) + \\sin(x) + C",
    difficulty: "Intermediate",
    hint: "Use integration by parts: u = x, dv = sin(x) dx",
    alternativeForms: ["\\sin(x) - x\\cos(x) + C"]
  },
  {
    id: "inter_4",
    problem: "\\int x\\cos(x) \\,dx",
    solution: "x\\sin(x) + \\cos(x) + C",
    difficulty: "Intermediate",
    hint: "Use integration by parts: u = x, dv = cos(x) dx",
    alternativeForms: ["\\cos(x) + x\\sin(x) + C"]
  },
  {
    id: "inter_5",
    problem: "\\int \\tan(x) \\,dx",
    solution: "-\\ln|\\cos(x)| + C",
    difficulty: "Intermediate",
    hint: "Rewrite as sin(x)/cos(x) and use substitution",
    alternativeForms: ["\\ln|\\sec(x)| + C"]
  },
  {
    id: "inter_6",
    problem: "\\int \\sec(x) \\,dx",
    solution: "\\ln|\\sec(x) + \\tan(x)| + C",
    difficulty: "Intermediate",
    hint: "Multiply by (sec(x) + tan(x))/(sec(x) + tan(x))",
    alternativeForms: []
  },
  {
    id: "inter_7",
    problem: "\\int \\frac{1}{x^2+1} \\,dx",
    solution: "\\arctan(x) + C",
    difficulty: "Intermediate",
    hint: "This is a standard arctangent integral",
    alternativeForms: ["\\tan^{-1}(x) + C"]
  },
  {
    id: "inter_8",
    problem: "\\int \\frac{x}{x^2+1} \\,dx",
    solution: "\\frac{1}{2}\\ln(x^2+1) + C",
    difficulty: "Intermediate",
    hint: "Use substitution: u = x^2 + 1",
    alternativeForms: ["\\frac{\\ln(x^2+1)}{2} + C"]
  }
];

export const advancedIntegrals: IntegralProblem[] = [
  {
    id: "adv_1",
    problem: "\\int x^2e^x \\,dx",
    solution: "x^2e^x - 2xe^x + 2e^x + C",
    difficulty: "Advanced",
    hint: "Use integration by parts twice",
    alternativeForms: ["e^x(x^2 - 2x + 2) + C"]
  },
  {
    id: "adv_2",
    problem: "\\int \\sin^2(x) \\,dx",
    solution: "\\frac{x}{2} - \\frac{\\sin(2x)}{4} + C",
    difficulty: "Advanced",
    hint: "Use the identity: sin²(x) = (1 - cos(2x))/2",
    alternativeForms: ["\\frac{x - \\sin(x)\\cos(x)}{2} + C"]
  },
  {
    id: "adv_3",
    problem: "\\int x^2\\sin(x) \\,dx",
    solution: "-x^2\\cos(x) + 2x\\sin(x) + 2\\cos(x) + C",
    difficulty: "Advanced",
    hint: "Use integration by parts twice",
    alternativeForms: ["2\\cos(x) + 2x\\sin(x) - x^2\\cos(x) + C"]
  },
  {
    id: "adv_4",
    problem: "\\int e^x\\sin(x) \\,dx",
    solution: "\\frac{e^x(\\sin(x) - \\cos(x))}{2} + C",
    difficulty: "Advanced",
    hint: "Use integration by parts twice to get a system",
    alternativeForms: ["\\frac{e^x\\sin(x) - e^x\\cos(x)}{2} + C"]
  },
  {
    id: "adv_5",
    problem: "\\int \\frac{1}{\\sqrt{1-x^2}} \\,dx",
    solution: "\\arcsin(x) + C",
    difficulty: "Advanced",
    hint: "This is a standard arcsine integral",
    alternativeForms: ["\\sin^{-1}(x) + C"]
  },
  {
    id: "adv_6",
    problem: "\\int \\frac{x^3}{x^2+1} \\,dx",
    solution: "\\frac{x^2}{2} - \\frac{1}{2}\\ln(x^2+1) + C",
    difficulty: "Advanced",
    hint: "Use polynomial long division first",
    alternativeForms: ["\\frac{x^2 - \\ln(x^2+1)}{2} + C"]
  },
  {
    id: "adv_7",
    problem: "\\int x\\ln^2(x) \\,dx",
    solution: "\\frac{x^2\\ln^2(x)}{2} - \\frac{x^2\\ln(x)}{2} + \\frac{x^2}{4} + C",
    difficulty: "Advanced",
    hint: "Use integration by parts twice",
    alternativeForms: ["\\frac{x^2}{4}(2\\ln^2(x) - 2\\ln(x) + 1) + C"]
  },
  {
    id: "adv_8",
    problem: "\\int \\sec^3(x) \\,dx",
    solution: "\\frac{1}{2}(\\sec(x)\\tan(x) + \\ln|\\sec(x) + \\tan(x)|) + C",
    difficulty: "Advanced",
    hint: "Use integration by parts and a reduction formula",
    alternativeForms: []
  }
];

// Helper function to get all problems
export const getAllProblems = (): IntegralProblem[] => {
  return [...basicIntegrals, ...intermediateIntegrals, ...advancedIntegrals];
};

// Helper function to get problems by difficulty
export const getProblemsByDifficulty = (difficulty: 'Basic' | 'Intermediate' | 'Advanced'): IntegralProblem[] => {
  switch (difficulty) {
    case 'Basic':
      return basicIntegrals;
    case 'Intermediate':
      return intermediateIntegrals;
    case 'Advanced':
      return advancedIntegrals;
    default:
      return [];
  }
};

// Helper function to get random problem
export const getRandomProblem = (difficulty: 'Basic' | 'Intermediate' | 'Advanced'): IntegralProblem | null => {
  const problems = getProblemsByDifficulty(difficulty);
  if (problems.length === 0) return null;
  return problems[Math.floor(Math.random() * problems.length)];
};

