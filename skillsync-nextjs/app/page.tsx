"use client";

import { FormEvent, useEffect, useState } from "react";
import { createRespondentCode, saveAssessmentRecord } from "@/lib/saveAssessment";
import jsPDF from "jspdf";

type PageName = "landing" | "studentInfo" | "assessment" | "results";

type Question = {
  id: string;
  label: string;
  desc: string;
  group?: string;
};

type Section = {
  name: string;
  title: string;
  subtitle: string;
  icon: IconName;
  iconClass: string;
  questions: Question[];
};

type CareerPathway = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  programs: string[];
  occupations: string[];
  onetClusters: string[];
  competencyBasis: {
    workStyles: string[];
    skills: string[];
    abilities: string[];
    knowledge: string[];
  };
  weights: Record<string, number>;
};

type CareerResult = CareerPathway & {
  score: number;
  matchedStrengths: string[];
};

const ratingLabels = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree"
];

const workStyleQuestions: Question[] = [
  {
    id: "ws_achievement_1",
    group: "Achievement Orientation",
    label: "I set high standards for my performance.",
    desc: "",
  },
  {
    id: "ws_achievement_2",
    group: "Achievement Orientation",
    label: "I work hard to finish difficult tasks.",
    desc: "",
  },
  {
    id: "ws_achievement_3",
    group: "Achievement Orientation",
    label: "I try to improve my performance when I make mistakes.",
    desc: "",
  },
  {
    id: "ws_achievement_4",
    group: "Achievement Orientation",
    label: "I feel motivated to do my best in every task.",
    desc: "",
  },
  {
    id: "ws_achievement_5",
    group: "Achievement Orientation",
    label: "I put effort into achieving good results.",
    desc: "",
  },

  {
    id: "ws_leadership_1",
    group: "Leadership Orientation",
    label: "I am comfortable guiding a group toward a goal.",
    desc: "",
  },
  {
    id: "ws_leadership_2",
    group: "Leadership Orientation",
    label: "I take responsibility when a group task needs direction.",
    desc: "",
  },
  {
    id: "ws_leadership_3",
    group: "Leadership Orientation",
    label: "I am willing to make decisions during group activities.",
    desc: "",
  },
  {
    id: "ws_leadership_4",
    group: "Leadership Orientation",
    label: "I encourage others to stay focused on the task.",
    desc: "",
  },
  {
    id: "ws_leadership_5",
    group: "Leadership Orientation",
    label: "I can help organize group work when needed.",
    desc: "",
  },

  {
    id: "ws_cooperation_1",
    group: "Cooperation",
    label: "I work well with others to complete tasks.",
    desc: "",
  },
  {
    id: "ws_cooperation_2",
    group: "Cooperation",
    label: "I support group decisions even if I don’t personally agree with it.",
    desc: "",
  },
  {
    id: "ws_cooperation_3",
    group: "Cooperation",
    label: "I listen to the ideas of my groupmates.",
    desc: "",
  },
  {
    id: "ws_cooperation_4",
    group: "Cooperation",
    label: "I contribute fairly during group activities.",
    desc: "",
  },
  {
    id: "ws_cooperation_5",
    group: "Cooperation",
    label: "I respect the contributions of others.",
    desc: "",
  },

  {
    id: "ws_empathy_1",
    group: "Empathy",
    label: "I consider how my actions affect other people.",
    desc: "",
  },
  {
    id: "ws_empathy_2",
    group: "Empathy",
    label: "I try to understand how others feel in a situation.",
    desc: "",
  },
  {
    id: "ws_empathy_3",
    group: "Empathy",
    label: "I get concerned when someone is having difficulty.",
    desc: "",
  },
  {
    id: "ws_empathy_4",
    group: "Empathy",
    label: "I think about others needs before responding.",
    desc: "",
  },
  {
    id: "ws_empathy_5",
    group: "Empathy",
    label: "I try to respond in a kind and understanding way.",
    desc: "",
  },

  {
    id: "ws_dependability_1",
    group: "Dependability",
    label: "I follow through on tasks that I am assigned.",
    desc: "",
  },
  {
    id: "ws_dependability_2",
    group: "Dependability",
    label: "I can be trusted to complete my responsibilities.",
    desc: "",
  },
  {
    id: "ws_dependability_3",
    group: "Dependability",
    label: "I do what I am expected to do even without reminders.",
    desc: "",
  },
  {
    id: "ws_dependability_4",
    group: "Dependability",
    label: "I take my responsibilities seriously.",
    desc: "",
  },
  {
    id: "ws_dependability_5",
    group: "Dependability",
    label: "I try to finish the tasks I start.",
    desc: "",
  },

  {
    id: "ws_attention_1",
    group: "Attention to Detail",
    label: "I notice small mistakes in my work and correct them accordingly.",
    desc: "",
  },
  {
    id: "ws_attention_2",
    group: "Attention to Detail",
    label: "I check my work to make sure it is accurate.",
    desc: "",
  },
  {
    id: "ws_attention_3",
    group: "Attention to Detail",
    label: "I ensure all parts of a task are complete.",
    desc: "",
  },
  {
    id: "ws_attention_4",
    group: "Attention to Detail",
    label: "I make sure my work is complete before submitting it.",
    desc: "",
  },
  {
    id: "ws_attention_5",
    group: "Attention to Detail",
    label: "I carefully review instructions before starting a task.",
    desc: "",
  },

  {
    id: "ws_stress_1",
    group: "Stress Tolerance",
    label: "I make an effort to relax and engage in activities that will help me feel better.",
    desc: "",
  },
  {
    id: "ws_stress_2",
    group: "Stress Tolerance",
    label: "I try to adjust my mindset and allow myself to be happier.",
    desc: "",
  },
  {
    id: "ws_stress_3",
    group: "Stress Tolerance",
    label: "I remain productive under pressure.",
    desc: "",
  },
  {
    id: "ws_stress_4",
    group: "Stress Tolerance",
    label: "I allow myself to settle down and think of how to reconcile the negative emotions.",
    desc: "",
  },
  {
    id: "ws_stress_5",
    group: "Stress Tolerance",
    label: "I eat and have fun to decrease the stress first.",
    desc: "",
  },
];
const skillQuestions: Question[] = [
  {
    id: "sk_reading_1",
    group: "Reading Comprehension",
    label: "I understand written instructions clearly.",
    desc: "",
  },
  {
    id: "sk_reading_2",
    group: "Reading Comprehension",
    label: "I identify important information when reading.",
    desc: "",
  },
  {
    id: "sk_reading_3",
    group: "Reading Comprehension",
    label: "I grasp the main idea of the material while reading in English.",
    desc: "",
  },
  {
    id: "sk_reading_4",
    group: "Reading Comprehension",
    label: "I follow written instructions in the correct order.",
    desc: "",
  },
  {
    id: "sk_reading_5",
    group: "Reading Comprehension",
    label: "I understand written materials needed to complete tasks.",
    desc: "",
  },

  {
    id: "sk_critical_1",
    group: "Critical Thinking & Problem Solving",
    label: "I can evaluate different solutions before choosing one.",
    desc: "",
  },
  {
    id: "sk_critical_2",
    group: "Critical Thinking & Problem Solving",
    label: "I can identify the cause of the problem.",
    desc: "",
  },
  {
    id: "sk_critical_3",
    group: "Critical Thinking & Problem Solving",
    label: "I can use facts or evidence to solve a problem.",
    desc: "",
  },
  {
    id: "sk_critical_4",
    group: "Critical Thinking & Problem Solving",
    label: "I generate practical solutions to problems.",
    desc: "",
  },
  {
    id: "sk_critical_5",
    group: "Critical Thinking & Problem Solving",
    label: "I analyze problems before taking action.",
    desc: "",
  },

  {
    id: "sk_communication_1",
    group: "Communication Skills",
    label: "I can explain ideas clearly to others.",
    desc: "",
  },
  {
    id: "sk_communication_2",
    group: "Communication Skills",
    label: "I can write messages that are easy to understand.",
    desc: "",
  },
  {
    id: "sk_communication_3",
    group: "Communication Skills",
    label: "I can ask questions when I need clarification.",
    desc: "",
  },
  {
    id: "sk_communication_4",
    group: "Communication Skills",
    label: "I can present information in an organized way.",
    desc: "",
  },
  {
    id: "sk_communication_5",
    group: "Communication Skills",
    label: "I adjust my communication based on my audience.",
    desc: "",
  },

  {
    id: "sk_technical_1",
    group: "Technical & Digital Skills",
    label: "I can use a computer to complete tasks.",
    desc: "",
  },
  {
    id: "sk_technical_2",
    group: "Technical & Digital Skills",
    label: "I can perform basic coding.",
    desc: "",
  },
  {
    id: "sk_technical_3",
    group: "Technical & Digital Skills",
    label: "I can use digital tools to search for needed information.",
    desc: "",
  },
  {
    id: "sk_technical_4",
    group: "Technical & Digital Skills",
    label: "I can use online applications to complete assignments.",
    desc: "",
  },
  {
    id: "sk_technical_5",
    group: "Technical & Digital Skills",
    label: "I can determine the kind of tools and equipment needed to do a job.",
    desc: "",
  },

  {
    id: "sk_coordination_1",
    group: "Coordination",
    label: "I can work with others to achieve shared goals.",
    desc: "",
  },
  {
    id: "sk_coordination_2",
    group: "Coordination",
    label: "I can adjust my actions based on what others are doing.",
    desc: "",
  },
  {
    id: "sk_coordination_3",
    group: "Coordination",
    label: "I can share responsibilities during group work.",
    desc: "",
  },
  {
    id: "sk_coordination_4",
    group: "Coordination",
    label: "I can respond appropriately to changes during teamwork.",
    desc: "",
  },
  {
    id: "sk_coordination_5",
    group: "Coordination",
    label: "I can cooperate with others to complete a task successfully.",
    desc: "",
  },

  {
    id: "sk_time_1",
    group: "Time Management",
    label: "I can organize tasks to complete work efficiently.",
    desc: "",
  },
  {
    id: "sk_time_2",
    group: "Time Management",
    label: "I can manage my time to meet deadlines.",
    desc: "",
  },
  {
    id: "sk_time_3",
    group: "Time Management",
    label: "I can avoid delays by following a schedule or plan.",
    desc: "",
  },
  {
    id: "sk_time_4",
    group: "Time Management",
    label: "I can manage my time when working on more than one task.",
    desc: "",
  },
  {
    id: "sk_time_5",
    group: "Time Management",
    label: "I can organize my tasks based on priority.",
    desc: "",
  },
];

const abilityQuestions: Question[] = [
  {
    id: "ab_cognitive_1",
    group: "Cognitive Abilities",
    label: "I can understand written instructions clearly.",
    desc: "",
  },
  {
    id: "ab_cognitive_2",
    group: "Cognitive Abilities",
    label: "I can understand spoken instructions clearly.",
    desc: "",
  },
  {
    id: "ab_cognitive_3",
    group: "Cognitive Abilities",
    label: "I can apply rules and facts to solve a problem.",
    desc: "",
  },
  {
    id: "ab_cognitive_4",
    group: "Cognitive Abilities",
    label: "I can identify patterns in information.",
    desc: "",
  },
  {
    id: "ab_cognitive_5",
    group: "Cognitive Abilities",
    label: "I can make sense of information to reach a conclusion.",
    desc: "",
  },

  {
    id: "ab_quantitative_1",
    group: "Quantitative Abilities",
    label: "I can use numbers to solve basic mathematical problems.",
    desc: "",
  },
  {
    id: "ab_quantitative_2",
    group: "Quantitative Abilities",
    label: "I can solve problems involving measurements.",
    desc: "",
  },
  {
    id: "ab_quantitative_3",
    group: "Quantitative Abilities",
    label: "I perform calculations accurately.",
    desc: "",
  },
  {
    id: "ab_quantitative_4",
    group: "Quantitative Abilities",
    label: "I can compare numerical values to make decisions.",
    desc: "",
  },
  {
    id: "ab_quantitative_5",
    group: "Quantitative Abilities",
    label: "I can interpret data presented in tables, charts, or graphs.",
    desc: "",
  },

  {
    id: "ab_perceptual_1",
    group: "Perceptual / Attention Abilities",
    label: "I can notice errors in tasks or outputs.",
    desc: "",
  },
  {
    id: "ab_perceptual_2",
    group: "Perceptual / Attention Abilities",
    label: "I can focus on a task even when there are distractions.",
    desc: "",
  },
  {
    id: "ab_perceptual_3",
    group: "Perceptual / Attention Abilities",
    label: "I can quickly spot differences in similar details.",
    desc: "",
  },
  {
    id: "ab_perceptual_4",
    group: "Perceptual / Attention Abilities",
    label: "I can compare information carefully and accurately.",
    desc: "",
  },
  {
    id: "ab_perceptual_5",
    group: "Perceptual / Attention Abilities",
    label: "I can maintain my attention on a task for a period of time.",
    desc: "",
  },

  {
    id: "ab_spatial_1",
    group: "Spatial Abilities",
    label: "I can imagine how objects will look when moved or changed.",
    desc: "",
  },
  {
    id: "ab_spatial_2",
    group: "Spatial Abilities",
    label: "I can understand where objects are in relation to each other.",
    desc: "",
  },
  {
    id: "ab_spatial_3",
    group: "Spatial Abilities",
    label: "I can picture how parts fit together in space.",
    desc: "",
  },
  {
    id: "ab_spatial_4",
    group: "Spatial Abilities",
    label: "I can understand simple diagrams.",
    desc: "",
  },
  {
    id: "ab_spatial_5",
    group: "Spatial Abilities",
    label: "I can recognize patterns in visual information.",
    desc: "",
  },

  {
    id: "ab_learning_1",
    group: "Information Processing & Learning Ability",
    label: "I can organize information in a logical order.",
    desc: "",
  },
  {
    id: "ab_learning_2",
    group: "Information Processing & Learning Ability",
    label: "I can group information into meaningful categories.",
    desc: "",
  },
  {
    id: "ab_learning_3",
    group: "Information Processing & Learning Ability",
    label: "I can remember important information when needed.",
    desc: "",
  },
  {
    id: "ab_learning_4",
    group: "Information Processing & Learning Ability",
    label: "I can learn new information and apply it to a task.",
    desc: "",
  },
  {
    id: "ab_learning_5",
    group: "Information Processing & Learning Ability",
    label: "I can process information quickly enough to complete a task.",
    desc: "",
  },
];

const knowledgeQuestions: Question[] = [
  {
    id: "kn_math_1",
    group: "Mathematics",
    label: "I understand basic arithmetic operations such as addition, subtraction, multiplication, and division.",
    desc: "",
  },
  {
    id: "kn_math_2",
    group: "Mathematics",
    label: "I can apply math concepts to solve practical problems.",
    desc: "",
  },
  {
    id: "kn_math_3",
    group: "Mathematics",
    label: "I can understand algebraic expressions and equations.",
    desc: "",
  },
  {
    id: "kn_math_4",
    group: "Mathematics",
    label: "I understand basic geometric ideas such as shapes, angles, and measurements.",
    desc: "",
  },
  {
    id: "kn_math_5",
    group: "Mathematics",
    label: "I can interpret numerical data easily.",
    desc: "",
  },

  {
    id: "kn_science_1",
    group: "Science",
    label: "I understand how plants, animals, and humans function and survive.",
    desc: "",
  },
  {
    id: "kn_science_2",
    group: "Science",
    label: "I understand how materials can change in form or composition.",
    desc: "",
  },
  {
    id: "kn_science_3",
    group: "Science",
    label: "I understand how movement, energy, and force affect objects.",
    desc: "",
  },
  {
    id: "kn_science_4",
    group: "Science",
    label: "I can use scientific concepts to explain real-world situations.",
    desc: "",
  },
  {
    id: "kn_science_5",
    group: "Science",
    label: "I understand the basic steps of scientific investigation.",
    desc: "",
  },

  {
    id: "kn_computers_1",
    group: "Computers and Electronics",
    label: "I understand basic computer and digital technology concepts.",
    desc: "",
  },
  {
    id: "kn_computers_2",
    group: "Computers and Electronics",
    label: "I understand the basic purpose of software applications.",
    desc: "",
  },
  {
    id: "kn_computers_3",
    group: "Computers and Electronics",
    label: "I understand how digital devices are used to perform tasks.",
    desc: "",
  },
  {
    id: "kn_computers_4",
    group: "Computers and Electronics",
    label: "I understand basic internet use.",
    desc: "",
  },
  {
    id: "kn_computers_5",
    group: "Computers and Electronics",
    label: "I understand how computers support work.",
    desc: "",
  },

  {
    id: "kn_business_1",
    group: "Business & Management",
    label: "I understand how to follow a budget.",
    desc: "",
  },
  {
    id: "kn_business_2",
    group: "Business & Management",
    label: "I understand how saving, cost, and profit affect financial decisions.",
    desc: "",
  },
  {
    id: "kn_business_3",
    group: "Business & Management",
    label: "I understand the main roles of a business.",
    desc: "",
  },
  {
    id: "kn_business_4",
    group: "Business & Management",
    label: "I understand how to manage tasks in a business setting.",
    desc: "",
  },
  {
    id: "kn_business_5",
    group: "Business & Management",
    label: "I understand how customer service and marketing affect how a business attracts and keeps customers.",
    desc: "",
  },

  {
    id: "kn_english_1",
    group: "English Language & Communication",
    label: "I understand the rules of grammar and proper language use.",
    desc: "",
  },
  {
    id: "kn_english_2",
    group: "English Language & Communication",
    label: "I can understand information presented in written form.",
    desc: "",
  },
  {
    id: "kn_english_3",
    group: "English Language & Communication",
    label: "I can understand spoken information in English.",
    desc: "",
  },
  {
    id: "kn_english_4",
    group: "English Language & Communication",
    label: "I can express ideas clearly in written English.",
    desc: "",
  },
  {
    id: "kn_english_5",
    group: "English Language & Communication",
    label: "I can express ideas clearly in spoken English.",
    desc: "",
  },

  {
    id: "kn_health_1",
    group: "Health Services",
    label: "I understand how one’s nutrition affects health.",
    desc: "",
  },
  {
    id: "kn_health_2",
    group: "Health Services",
    label: "I understand how hygiene and safety practices help prevent disease and accidents.",
    desc: "",
  },
  {
    id: "kn_health_3",
    group: "Health Services",
    label: "I understand how to assist a person with simple health-related needs.",
    desc: "",
  },
  {
    id: "kn_health_4",
    group: "Health Services",
    label: "I understand how illness can be prevented through proper care and precaution.",
    desc: "",
  },
  {
    id: "kn_health_5",
    group: "Health Services",
    label: "I know how to appropriately respond when someone needs health-related support.",
    desc: "",
  },
];

const sections: Section[] = [
  {
    name: "Work Styles",
    title: "Section 1: Work Styles",
    subtitle: "Rate how well each statement describes you",
    icon: "user",
    iconClass: "from-teal-500 to-teal-600",
    questions: workStyleQuestions,
  },
  {
    name: "Skills",
    title: "Section 2: Skills",
    subtitle: "Evaluate your proficiency in these skill areas",
    icon: "bulb",
    iconClass: "from-navy-600 to-navy-700",
    questions: skillQuestions,
  },
  {
    name: "Abilities",
    title: "Section 3: Abilities",
    subtitle: "Rate your natural aptitudes and capabilities",
    icon: "lightning",
    iconClass: "from-teal-600 to-teal-700",
    questions: abilityQuestions,
  },
  {
    name: "Knowledge Areas",
    title: "Section 4: Knowledge Areas",
    subtitle: "Indicate your familiarity with these knowledge domains",
    icon: "book",
    iconClass: "from-navy-700 to-navy-800",
    questions: knowledgeQuestions,
  },
];

const careerPathways: CareerPathway[] = [
  {
    id: "digital_technology",
    name: "Digital Technology",
    icon: "DT",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    programs: ["Computer Science", "Information Technology", "Software Engineering", "Cybersecurity"],
    occupations: ["Software Developer", "IT Specialist", "Systems Analyst", "Web Developer"],
    onetClusters: ["Digital Technology"],
    competencyBasis: {
      workStyles: ["Attention to Detail", "Achievement Orientation"],
      skills: ["Critical Thinking", "Technical & Digital Skills"],
      abilities: ["Cognitive Ability", "Information Processing & Learning"],
      knowledge: ["Computers and Electronics", "Mathematics"],
    },
    weights: {
      kn_computers: 0.22,
      sk_technical: 0.20,
      sk_critical: 0.14,
      ab_cognitive: 0.12,
      ab_learning: 0.10,
      ws_attention: 0.10,
      kn_math: 0.07,
      ws_achievement: 0.05,
    },
  },
  {
    id: "healthcare_human_services",
    name: "Healthcare & Human Services",
    icon: "HS",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    programs: ["Nursing", "Caregiving", "Medical Technology", "Public Health", "Psychology"],
    occupations: ["Nurse", "Caregiver", "Health Aide", "Medical Technologist"],
    onetClusters: ["Health Science", "Human Services"],
    competencyBasis: {
      workStyles: ["Empathy", "Cooperation", "Dependability"],
      skills: ["Communication", "Active Listening"],
      abilities: ["Perceptual Ability", "Communication Ability"],
      knowledge: ["Health Services", "Science"],
    },
    weights: {
      kn_health: 0.22,
      ws_empathy: 0.16,
      ws_dependability: 0.12,
      ws_cooperation: 0.10,
      sk_communication: 0.12,
      ab_perceptual: 0.10,
      kn_science: 0.10,
      ws_stress: 0.08,
    },
  },
  {
    id: "financial_services",
    name: "Financial Services",
    icon: "FS",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    programs: ["Accountancy", "Finance", "Economics", "Business Administration"],
    occupations: ["Accountant", "Financial Analyst", "Bookkeeper", "Budget Analyst"],
    onetClusters: ["Financial Services"],
    competencyBasis: {
      workStyles: ["Dependability", "Achievement Orientation", "Attention to Detail"],
      skills: ["Critical Thinking", "Mathematical Skills"],
      abilities: ["Quantitative Ability", "Analytical Thinking"],
      knowledge: ["Business", "Mathematics"],
    },
    weights: {
      kn_business: 0.20,
      kn_math: 0.18,
      ab_quantitative: 0.18,
      sk_critical: 0.14,
      ws_attention: 0.12,
      ws_dependability: 0.10,
      ws_achievement: 0.08,
    },
  },
  {
    id: "marketing_sales",
    name: "Marketing & Sales",
    icon: "MS",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    programs: ["Marketing", "Business Administration", "Entrepreneurship", "Communication"],
    occupations: ["Marketing Specialist", "Sales Agent", "Customer Service Representative"],
    onetClusters: ["Marketing, Sales & Service"],
    competencyBasis: {
      workStyles: ["Leadership", "Cooperation", "Achievement Orientation"],
      skills: ["Communication", "Persuasion"],
      abilities: ["Social Perceptiveness", "Oral Expression"],
      knowledge: ["Business", "Communication"],
    },
    weights: {
      kn_business: 0.22,
      sk_communication: 0.20,
      ws_leadership: 0.12,
      ws_cooperation: 0.10,
      ws_achievement: 0.10,
      ab_learning: 0.08,
      sk_coordination: 0.08,
      kn_english: 0.10,
    },
  },
  {
    id: "management_entrepreneurship",
    name: "Management & Entrepreneurship",
    icon: "ME",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    programs: ["Business Management", "Entrepreneurship", "Operations Management", "Marketing"],
    occupations: ["Business Manager", "Entrepreneur", "Operations Manager", "Team Leader"],
    onetClusters: ["Management & Entrepreneurship", "Business, Management & Administration"],
    competencyBasis: {
      workStyles: ["Leadership", "Achievement Orientation", "Dependability"],
      skills: ["Decision Making", "Strategic Thinking", "Communication"],
      abilities: ["Problem Solving", "Judgment"],
      knowledge: ["Business Management"],
    },
    weights: {
      kn_business: 0.24,
      ws_leadership: 0.18,
      sk_communication: 0.14,
      sk_critical: 0.12,
      sk_time: 0.10,
      sk_coordination: 0.08,
      ws_achievement: 0.08,
      ws_dependability: 0.06,
    },
  },
  {
    id: "education",
    name: "Education",
    icon: "ED",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    programs: ["Education", "English", "Psychology", "Communication"],
    occupations: ["Teacher", "Instructor", "Tutor", "Training Specialist"],
    onetClusters: ["Education & Training"],
    competencyBasis: {
      workStyles: ["Cooperation", "Empathy", "Dependability"],
      skills: ["Communication", "Reading Comprehension"],
      abilities: ["Verbal Ability", "Information Processing"],
      knowledge: ["Education", "English Language"],
    },
    weights: {
      kn_english: 0.20,
      sk_communication: 0.18,
      sk_reading: 0.16,
      ws_empathy: 0.12,
      ws_cooperation: 0.10,
      ws_dependability: 0.08,
      ab_learning: 0.10,
      ab_cognitive: 0.06,
    },
  },
  {
    id: "arts_entertainment_design",
    name: "Arts, Entertainment, & Design",
    icon: "AD",
    color: "from-fuchsia-500 to-fuchsia-600",
    bgColor: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
    programs: ["Graphic Design", "Multimedia Arts", "Fine Arts", "Architecture", "Media Arts"],
    occupations: ["Graphic Designer", "Multimedia Artist", "Art Director", "Animator"],
    onetClusters: ["Arts, Entertainment, & Design", "Arts, Audio/Video Technology & Communications"],
    competencyBasis: {
      workStyles: ["Creativity", "Achievement Orientation", "Attention to Detail"],
      skills: ["Creative Thinking", "Communication"],
      abilities: ["Visualization Ability", "Spatial Ability"],
      knowledge: ["Design", "Media"],
    },
    weights: {
      ab_spatial: 0.22,
      ab_perceptual: 0.16,
      ws_attention: 0.12,
      sk_technical: 0.12,
      sk_communication: 0.10,
      sk_critical: 0.10,
      ws_achievement: 0.10,
      ab_learning: 0.08,
    },
  },
  {
    id: "construction",
    name: "Construction",
    icon: "CO",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    programs: ["Construction Technology", "Civil Technology", "Carpentry", "Drafting"],
    occupations: ["Civil Worker", "Carpenter", "Construction Worker", "Building Technician"],
    onetClusters: ["Construction", "Architecture & Construction"],
    competencyBasis: {
      workStyles: ["Achievement Orientation", "Attention to Detail"],
      skills: ["Technical Skills", "Equipment Handling"],
      abilities: ["Spatial Ability", "Manual Dexterity"],
      knowledge: ["Engineering Technology", "Construction"],
    },
    weights: {
      sk_technical: 0.20,
      ab_spatial: 0.18,
      ab_perceptual: 0.12,
      ws_attention: 0.14,
      ws_dependability: 0.10,
      sk_coordination: 0.10,
      sk_time: 0.08,
      kn_math: 0.08,
    },
  },
  {
    id: "advanced_manufacturing",
    name: "Advanced Manufacturing",
    icon: "AM",
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    programs: ["Manufacturing Technology", "Machine Operation", "Industrial Technology", "Electronics"],
    occupations: ["Machine Operator", "Technician", "Production Worker", "Quality Control Inspector"],
    onetClusters: ["Advanced Manufacturing", "Manufacturing"],
    competencyBasis: {
      workStyles: ["Achievement Orientation", "Attention to Detail", "Dependability"],
      skills: ["Technical Skills", "Monitoring"],
      abilities: ["Control Precision", "Manual Dexterity"],
      knowledge: ["Production", "Engineering"],
    },
    weights: {
      sk_technical: 0.22,
      ws_attention: 0.16,
      ab_perceptual: 0.14,
      ws_dependability: 0.12,
      ab_spatial: 0.12,
      sk_coordination: 0.10,
      sk_time: 0.08,
      kn_computers: 0.06,
    },
  },
  {
    id: "supply_chain_transportation",
    name: "Supply Chain & Transportation",
    icon: "SC",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    programs: ["Logistics", "Transportation Management", "Operations Management", "Automotive Technology"],
    occupations: ["Logistics Coordinator", "Driver", "Dispatcher", "Warehouse Coordinator"],
    onetClusters: ["Supply Chain & Transportation", "Transportation, Distribution & Logistics"],
    competencyBasis: {
      workStyles: ["Dependability", "Stress Tolerance", "Attention to Detail"],
      skills: ["Time Management", "Coordination"],
      abilities: ["Spatial Orientation", "Information Processing"],
      knowledge: ["Transportation", "Logistics"],
    },
    weights: {
      sk_time: 0.18,
      sk_coordination: 0.16,
      ws_dependability: 0.16,
      ws_stress: 0.12,
      ws_attention: 0.12,
      ab_spatial: 0.10,
      ab_learning: 0.08,
      sk_technical: 0.08,
    },
  },
  {
    id: "hospitality_events_tourism",
    name: "Hospitality, Events, & Tourism",
    icon: "HT",
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    programs: ["Hospitality Management", "Tourism", "Culinary Arts", "Events Management"],
    occupations: ["Receptionist", "Food Service Manager", "Tourism Staff", "Event Assistant"],
    onetClusters: ["Hospitality, Events, & Tourism", "Hospitality & Tourism"],
    competencyBasis: {
      workStyles: ["Cooperation", "Service Orientation", "Empathy"],
      skills: ["Communication", "Customer Service"],
      abilities: ["Social Perceptiveness"],
      knowledge: ["Hospitality", "Tourism"],
    },
    weights: {
      sk_communication: 0.22,
      ws_cooperation: 0.16,
      ws_empathy: 0.14,
      sk_coordination: 0.12,
      ws_dependability: 0.10,
      sk_time: 0.10,
      kn_business: 0.08,
      kn_english: 0.08,
    },
  },
  {
    id: "public_service_safety",
    name: "Public Service & Safety",
    icon: "PS",
    color: "from-blue-700 to-blue-800",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    programs: ["Criminology", "Public Administration", "Political Science", "Public Safety"],
    occupations: ["Civil Engineer", "Lawyer", "Legislator", "Public Safety Officer"],
    onetClusters: ["Public Service & Safety", "Law, Public Safety, Corrections & Security", "Government & Public Administration"],
    competencyBasis: {
      workStyles: ["Integrity", "Stress Tolerance", "Dependability"],
      skills: ["Problem Solving", "Coordination"],
      abilities: ["Reaction Time", "Decision Making"],
      knowledge: ["Public Safety", "Law"],
    },
    weights: {
      ws_dependability: 0.16,
      ws_stress: 0.16,
      sk_critical: 0.16,
      sk_coordination: 0.12,
      sk_communication: 0.10,
      ab_perceptual: 0.10,
      ws_leadership: 0.10,
      kn_english: 0.10,
    },
  },
  {
    id: "agriculture",
    name: "Agriculture",
    icon: "AG",
    color: "from-lime-600 to-lime-700",
    bgColor: "bg-lime-50",
    borderColor: "border-lime-200",
    programs: ["Agriculture", "Environmental Science", "Animal Science", "Agricultural Technology"],
    occupations: ["Agriculture Engineer", "Farmer", "Agricultural Technician", "Crop Specialist"],
    onetClusters: ["Agriculture", "Agriculture, Food & Natural Resources"],
    competencyBasis: {
      workStyles: ["Dependability", "Achievement Orientation"],
      skills: ["Equipment Handling", "Monitoring"],
      abilities: ["Manual Dexterity", "Perceptual Ability"],
      knowledge: ["Agriculture", "Biology"],
    },
    weights: {
      kn_science: 0.18,
      sk_technical: 0.16,
      ws_dependability: 0.14,
      ab_perceptual: 0.12,
      ab_spatial: 0.10,
      sk_coordination: 0.10,
      ws_achievement: 0.10,
      kn_math: 0.10,
    },
  },
  {
    id: "energy_natural_resources",
    name: "Energy & Natural Resources",
    icon: "EN",
    color: "from-yellow-600 to-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    programs: ["Electrical Technology", "Environmental Science", "Energy Technology", "Engineering Technology"],
    occupations: ["Electrician", "Environmental Technician", "Energy Technician", "Utility Worker"],
    onetClusters: ["Energy & Natural Resources", "Agriculture, Food & Natural Resources"],
    competencyBasis: {
      workStyles: ["Attention to Detail", "Dependability"],
      skills: ["Technical Skills", "Problem Solving"],
      abilities: ["Spatial Ability", "Perceptual Ability"],
      knowledge: ["Engineering", "Environmental Science"],
    },
    weights: {
      sk_technical: 0.20,
      kn_science: 0.16,
      ws_attention: 0.14,
      ws_dependability: 0.12,
      ab_spatial: 0.12,
      ab_perceptual: 0.10,
      sk_critical: 0.10,
      kn_math: 0.06,
    },
  },
];

const iconPaths = {
  lightning: "M13 10V3L4 14h7v7l9-11h-7z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  bulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  check: "M5 13l4 4L19 7",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  arrowRight: "M17 8l4 4m0 0l-4 4m4-4H3",
  back: "M10 19l-7-7m0 0l7-7m-7 7h18",
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  retry: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
} as const;

type IconName = keyof typeof iconPaths;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SvgIcon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[name]} />
    </svg>
  );
}
function averageGroup(responses: Record<string, number>, ids: string[]): number {
  const values = ids
    .map((id) => responses[id])
    .filter((value): value is number => typeof value === "number");

  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeAssessmentResponses(responses: Record<string, number>) {
  return {
    ...responses,

    ws_achievement: averageGroup(responses, [
      "ws_achievement_1",
      "ws_achievement_2",
      "ws_achievement_3",
      "ws_achievement_4",
      "ws_achievement_5",
    ]),

    ws_leadership: averageGroup(responses, [
      "ws_leadership_1",
      "ws_leadership_2",
      "ws_leadership_3",
      "ws_leadership_4",
      "ws_leadership_5",
    ]),

    ws_cooperation: averageGroup(responses, [
      "ws_cooperation_1",
      "ws_cooperation_2",
      "ws_cooperation_3",
      "ws_cooperation_4",
      "ws_cooperation_5",
    ]),

    ws_empathy: averageGroup(responses, [
      "ws_empathy_1",
      "ws_empathy_2",
      "ws_empathy_3",
      "ws_empathy_4",
      "ws_empathy_5",
    ]),

    ws_dependability: averageGroup(responses, [
      "ws_dependability_1",
      "ws_dependability_2",
      "ws_dependability_3",
      "ws_dependability_4",
      "ws_dependability_5",
    ]),

    ws_attention: averageGroup(responses, [
      "ws_attention_1",
      "ws_attention_2",
      "ws_attention_3",
      "ws_attention_4",
      "ws_attention_5",
    ]),

    ws_stress: averageGroup(responses, [
      "ws_stress_1",
      "ws_stress_2",
      "ws_stress_3",
      "ws_stress_4",
      "ws_stress_5",
    ]),
        sk_reading: averageGroup(responses, [
      "sk_reading_1",
      "sk_reading_2",
      "sk_reading_3",
      "sk_reading_4",
      "sk_reading_5",
    ]),

    sk_critical: averageGroup(responses, [
      "sk_critical_1",
      "sk_critical_2",
      "sk_critical_3",
      "sk_critical_4",
      "sk_critical_5",
    ]),

    sk_communication: averageGroup(responses, [
      "sk_communication_1",
      "sk_communication_2",
      "sk_communication_3",
      "sk_communication_4",
      "sk_communication_5",
    ]),

    sk_technical: averageGroup(responses, [
      "sk_technical_1",
      "sk_technical_2",
      "sk_technical_3",
      "sk_technical_4",
      "sk_technical_5",
    ]),

    sk_coordination: averageGroup(responses, [
      "sk_coordination_1",
      "sk_coordination_2",
      "sk_coordination_3",
      "sk_coordination_4",
      "sk_coordination_5",
    ]),

    sk_time: averageGroup(responses, [
      "sk_time_1",
      "sk_time_2",
      "sk_time_3",
      "sk_time_4",
      "sk_time_5",
    ]),
        ab_cognitive: averageGroup(responses, [
      "ab_cognitive_1",
      "ab_cognitive_2",
      "ab_cognitive_3",
      "ab_cognitive_4",
      "ab_cognitive_5",
    ]),

    ab_quantitative: averageGroup(responses, [
      "ab_quantitative_1",
      "ab_quantitative_2",
      "ab_quantitative_3",
      "ab_quantitative_4",
      "ab_quantitative_5",
    ]),

    ab_perceptual: averageGroup(responses, [
      "ab_perceptual_1",
      "ab_perceptual_2",
      "ab_perceptual_3",
      "ab_perceptual_4",
      "ab_perceptual_5",
    ]),

    ab_spatial: averageGroup(responses, [
      "ab_spatial_1",
      "ab_spatial_2",
      "ab_spatial_3",
      "ab_spatial_4",
      "ab_spatial_5",
    ]),

    ab_learning: averageGroup(responses, [
      "ab_learning_1",
      "ab_learning_2",
      "ab_learning_3",
      "ab_learning_4",
      "ab_learning_5",
    ]),
        kn_math: averageGroup(responses, [
      "kn_math_1",
      "kn_math_2",
      "kn_math_3",
      "kn_math_4",
      "kn_math_5",
    ]),

    kn_science: averageGroup(responses, [
      "kn_science_1",
      "kn_science_2",
      "kn_science_3",
      "kn_science_4",
      "kn_science_5",
    ]),

    kn_computers: averageGroup(responses, [
      "kn_computers_1",
      "kn_computers_2",
      "kn_computers_3",
      "kn_computers_4",
      "kn_computers_5",
    ]),

    kn_business: averageGroup(responses, [
      "kn_business_1",
      "kn_business_2",
      "kn_business_3",
      "kn_business_4",
      "kn_business_5",
    ]),

    kn_english: averageGroup(responses, [
      "kn_english_1",
      "kn_english_2",
      "kn_english_3",
      "kn_english_4",
      "kn_english_5",
    ]),

    kn_health: averageGroup(responses, [
      "kn_health_1",
      "kn_health_2",
      "kn_health_3",
      "kn_health_4",
      "kn_health_5",
    ]),
  };
}

function calculateResults(responses: Record<string, number>): CareerResult[] {
  const scores = careerPathways.map((pathway) => {
    let totalWeight = 0;
    let weightedSum = 0;

    Object.entries(pathway.weights).forEach(([key, weight]) => {
      if (responses[key] !== undefined) {
        weightedSum += responses[key] * weight;
        totalWeight += weight;
      }
    });

    const normalizedScore = totalWeight > 0 ? ((weightedSum / totalWeight) / 5) * 100 : 0;

    return {
      ...pathway,
      score: Math.round(normalizedScore),
      matchedStrengths: getMatchedStrengths(pathway, responses)
    };
  });

  return scores.sort((a, b) => b.score - a.score);
}

function getMatchedStrengths(pathway: CareerPathway, responses: Record<string, number>) {
  const allQuestions = [
    ...workStyleQuestions,
    ...skillQuestions,
    ...abilityQuestions,
    ...knowledgeQuestions
  ];

  const strengths: string[] = [];

  Object.entries(pathway.weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .forEach(([key]) => {
      const question = allQuestions.find((q) => q.id === key);
      if (question && responses[key] >= 4) {
        strengths.push(question.label);
      }
    });

  return strengths.length > 0 ? strengths : ["General Aptitude"];
}

export default function Home() {
  const [page, setPage] = useState<PageName>("landing");
  const [currentSection, setCurrentSection] = useState(1);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [results, setResults] = useState<CareerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState({
  respondentCode: "",
  gradeLevel: "",
  strand: "",
  section: "",
});

  const currentSectionData = sections[currentSection - 1];
  const progress = currentSection * 25;


  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [page, currentSection]);

  function showMessage(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function startAssessment() {
  setResponses({});
  setResults([]);
  setCurrentSection(1);
  setPage("assessment");
}

  function goHome() {
  setResponses({});
  setResults([]);
  setCurrentSection(1);
  setPage("landing");
}

  function isCurrentSectionComplete() {
    return currentSectionData.questions.every((question) => responses[question.id] !== undefined);
  }

  function nextSection() {
    if (!isCurrentSectionComplete()) {
      showMessage("Please answer all questions before proceeding.");
      return;
    }

    if (currentSection < sections.length) {
      setCurrentSection((section) => section + 1);
    }
  }

  function prevSection() {
    if (currentSection > 1) {
      setCurrentSection((section) => section - 1);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!isCurrentSectionComplete()) {
    showMessage("Please answer all questions before proceeding.");
    return;
  }

  setLoading(true);
  await new Promise((resolve) => window.setTimeout(resolve, 900));

  const normalizedResponses = normalizeAssessmentResponses(responses);
  const calculatedResults = calculateResults(normalizedResponses);

  setResults(calculatedResults);

 try {
  const saveResult = await saveAssessmentRecord({
    respondent_code: studentInfo.respondentCode.trim(),
    grade_level: studentInfo.gradeLevel,
    strand: studentInfo.strand,
    section: studentInfo.section.trim(),
    responses,
    competency_scores: normalizedResponses,
    top_results: calculatedResults.slice(0, 3),
  });

  if (saveResult.saved) {
    showMessage("Your assessment result has been saved.");
  } else {
    console.warn(saveResult.reason);
  }
} catch (error) {
  console.error(error);
  showMessage("Results generated, but saving to the database failed.");
}

setLoading(false);
setPage("results");
}

function updateResponse(questionId: string, value: number) {
  setResponses((previous) => ({
    ...previous,
    [questionId]: value,
  }));
}

  return (
    <main className="min-h-screen">
      {page === "landing" && <LandingPage onStart={() => setPage("studentInfo")} />}

{page === "studentInfo" && (
    <StudentInfoPage
      studentInfo={studentInfo}
      setStudentInfo={setStudentInfo}
      onProceed={() => setPage("assessment")}
      onBack={() => setPage("landing")}
    />
  )}

      {page === "assessment" && (
        <AssessmentPage
          currentSection={currentSection}
          currentSectionData={currentSectionData}
          progress={progress}
          responses={responses}
          onBackHome={goHome}
          onPrevious={prevSection}
          onNext={nextSection}
          onSubmit={handleSubmit}
          onResponseChange={updateResponse}
        />
      )}

      {page === "results" && (
        <ResultsPage
          results={results}
          onRetake={startAssessment}
          onBackHome={goHome}
        />
      )}

      {loading && <LoadingOverlay />}
      {toast && <Toast message={toast} />}
    </main>
  );
}
function StudentInfoPage({
  studentInfo,
  setStudentInfo,
  onProceed,
  onBack,
}: {
  studentInfo: {
    respondentCode: string;
    gradeLevel: string;
    strand: string;
    section: string;
  };
  setStudentInfo: React.Dispatch<
    React.SetStateAction<{
      respondentCode: string;
      gradeLevel: string;
      strand: string;
      section: string;
    }>
  >;
  onProceed: () => void;
  onBack: () => void;
}) {
  const canProceed =
    studentInfo.respondentCode.trim() !== "" &&
    studentInfo.gradeLevel.trim() !== "" &&
    studentInfo.strand.trim() !== "";

  return (
    <div className="gradient-bg min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm font-semibold text-navy-500 hover:text-navy-900"
        >
          ← Back to Home
        </button>

        <div className="mb-8">
          <span className="mb-3 inline-flex rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
            Student Entry Form
          </span>

          <h1 className="mb-3 font-jakarta text-3xl font-bold text-navy-900">
            Student Information
          </h1>

          <p className="text-navy-600">
            Please provide your basic respondent information before starting the
            assessment. This helps organize your competency profile and
            recommendation results.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-700">
              Respondent Code / Student ID
            </label>
            <input
              value={studentInfo.respondentCode}
              onChange={(e) =>
                setStudentInfo((prev) => ({
                  ...prev,
                  respondentCode: e.target.value,
                }))
              }
              placeholder="Example: RESP-001 or Student ID"
              className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-700">
              Grade Level
            </label>
            <select
              value={studentInfo.gradeLevel}
              onChange={(e) =>
                setStudentInfo((prev) => ({
                  ...prev,
                  gradeLevel: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            >
              <option value="">Select grade level</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-700">
              Strand
            </label>
            <select
              value={studentInfo.strand}
              onChange={(e) =>
                setStudentInfo((prev) => ({
                  ...prev,
                  strand: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            >
              <option value="">Select strand</option>
              <option value="STEM">STEM</option>
              <option value="ABM">ABM</option>
              <option value="HUMSS">HUMSS</option>
              <option value="GAS">GAS</option>
              <option value="TVL">TVL</option>
              <option value="Arts and Design">Arts and Design</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-700">
              Section <span className="text-navy-400">(Optional)</span>
            </label>
            <input
              value={studentInfo.section}
              onChange={(e) =>
                setStudentInfo((prev) => ({
                  ...prev,
                  section: e.target.value,
                }))
              }
              placeholder="Example: STEM-12A"
              className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onProceed}
          disabled={!canProceed}
          className="mt-8 w-full rounded-xl bg-teal-500 px-6 py-4 font-semibold text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-navy-300"
        >
          Proceed to Assessment
        </button>

        <p className="mt-4 text-center text-xs text-navy-400">
          Your responses will be used only for career pathway recommendation and
          research evaluation purposes.
        </p>
      </div>
    </div>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="gradient-bg relative min-h-screen w-full overflow-hidden">
      <div className="floating-shapes">
        <div className="floating-shape bg-teal-400" style={{ width: 300, height: 300, top: "10%", left: "-5%", animationDelay: "0s" }} />
        <div className="floating-shape bg-navy-400" style={{ width: 200, height: 200, top: "60%", right: "-3%", animationDelay: "-5s" }} />
        <div className="floating-shape bg-teal-300" style={{ width: 150, height: 150, bottom: "10%", left: "20%", animationDelay: "-10s" }} />
      </div>

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600">
            <SvgIcon name="lightning" className="h-6 w-6 text-white" />
          </div>
          <span className="font-jakarta text-xl font-bold text-white">SkillSync</span>
        </div>

 <div className="hidden items-center gap-4 md:flex">
  <a
    href="#methodology"
    className="text-sm font-medium text-navy-200 transition-colors hover:text-white"
  >
    Methodology
  </a>

  <a
    href="/login"
    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-navy-100 transition-all hover:border-teal-300 hover:bg-white/10 hover:text-white"
  >
    Admin Login
  </a>

  <button
    onClick={onStart}
    className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-teal-400"
  >
    Start Assessment
  </button>
</div>
        </nav>

        <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
          <div className="grid min-h-[70vh] items-center gap-12 lg:grid-cols-2">
            <section className="fade-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-600 bg-navy-800/50 px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
                <span className="text-sm font-medium text-teal-300">Knowledge Management Framework</span>
              </div>

              <h1 className="mb-6 font-jakarta text-5xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl">
                Skill<span className="text-teal-400">Sync</span>
              </h1>
              <p className="mb-4 text-xl font-light text-navy-200 md:text-2xl">
                A KM-Integrated Career Pathway Recommendation System
              </p>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-navy-300">
                Discover your ideal career pathway through a comprehensive assessment system. SkillSync analyzes your work styles, skills, abilities, and knowledge areas to provide personalized, data-driven career recommendations aligned with O*NET competency domains.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button onClick={onStart} className="pulse-glow group flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-teal-400 hover:to-teal-500">

                  Start Assessment

                <SvgIcon name="arrowRight" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <a href="#methodology" className="flex items-center justify-center gap-2 rounded-xl border border-navy-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-navy-800/50">
                <SvgIcon name="info" className="h-5 w-5" />
                Learn More
              </a>
            </div>
          </section>

          <section className="slide-up hidden lg:block">
            <div className="relative">
              <div className="glass-card rounded-3xl p-8 shadow-2xl">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-700 to-navy-900">
                    <SvgIcon name="chart" className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-bold text-navy-900">Career Analytics</h3>
                    <p className="text-sm text-navy-500">Personalized pathway matching</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <SampleBar label="STEM" value={87} className="from-teal-500 to-teal-400" />
                  <SampleBar label="ICT" value={72} className="from-navy-600 to-navy-500" />
                  <SampleBar label="Business" value={65} className="from-teal-600 to-teal-500" />
                </div>
              </div>

              <div className="absolute -right-4 -top-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-xl">
                <p className="text-xs text-navy-500">Assessments</p>
                <p className="font-bold text-navy-900">1,247+</p>
              </div>

              <div className="absolute -bottom-4 -left-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-xl">
                <p className="text-xs text-navy-500">Students Guided</p>
                <p className="font-bold text-navy-900">850+</p>
              </div>
            </div>
          </section>
        </div>

        <section id="methodology" className="fade-in mt-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-jakarta text-3xl font-bold text-white">Knowledge Management Framework</h2>
            <p className="mx-auto max-w-2xl text-navy-300">
              The system follows a KM approach to support meaningful career recommendations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <FrameworkCard title="Knowledge Capture" icon="check" description="Student inputs through assessment forms covering work styles, skills, abilities, and knowledge areas." />
            <FrameworkCard title="Knowledge Storage" icon="chart" description="Prepared for database integration such as Supabase for reliable data management and retrieval." />
            <FrameworkCard title="Knowledge Application" icon="bulb" description="Competency-based recommendation engine aligned with O*NET career competency domains." />
            <FrameworkCard title="Knowledge Evaluation" icon="info" description="Usability feedback can be added later for continuous improvement and user satisfaction." />
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-20 border-t border-navy-700 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-navy-400">&copy; 2024 SkillSync. Academic Research Project.</p>
          <span className="text-xs text-navy-500">Powered by Next.js, Tailwind CSS, and Vercel</span>
        </div>
      </footer>
    </div>
  );
}

function SampleBar({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-navy-600">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-navy-100">
        <div className={cn("h-full rounded-full bg-gradient-to-r", className)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-semibold text-navy-800">{value}%</span>
    </div>
  );
}

function FrameworkCard({ title, description, icon }: { title: string; description: string; icon: IconName }) {
  return (
    <div className="glass-card card-hover rounded-2xl p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600">
        <SvgIcon name={icon} className="h-6 w-6 text-white" />
      </div>
      <h3 className="mb-2 font-jakarta font-bold text-navy-900">{title}</h3>
      <p className="text-sm text-navy-600">{description}</p>
    </div>
  );
}

function AssessmentPage({
  currentSection,
  currentSectionData,
  progress,
  responses,
  onBackHome,
  onPrevious,
  onNext,
  onSubmit,
  onResponseChange
}: {
  currentSection: number;
  currentSectionData: Section;
  progress: number;
  responses: Record<string, number>;
  onBackHome: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResponseChange: (questionId: string, value: number) => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-teal-50">
      <nav className="sticky top-0 z-50 border-b border-navy-100 bg-white/80 px-6 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <button onClick={onBackHome} className="flex items-center gap-2 text-navy-600 transition-colors hover:text-navy-900">
            <SvgIcon name="back" className="h-5 w-5" />
            <span className="font-medium">Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
              <SvgIcon name="lightning" className="h-4 w-4 text-white" />
            </div>
            <span className="font-jakarta font-bold text-navy-900">SkillSync</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-jakarta font-bold text-navy-900">Career Profiling Assessment</h2>
            <span className="text-sm text-navy-500">Step {currentSection} of 4</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-100">
            <div className="progress-fill h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-xs text-navy-400">{currentSectionData.name}</span>
            <span className="text-xs font-medium text-teal-600">{progress}%</span>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <section className="glass-card mb-6 rounded-2xl p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br", currentSectionData.iconClass)}>
                <SvgIcon name={currentSectionData.icon} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-jakarta text-xl font-bold text-navy-900">{currentSectionData.title}</h3>
                <p className="text-sm text-navy-500">{currentSectionData.subtitle}</p>
              </div>
            </div>

            <RatingHeader />

            <div className="space-y-6">
              {currentSectionData.questions.map((question, index) => (
                <QuestionCard
  key={question.id}
  question={question}
  index={index}
  value={responses[question.id]}
  onChange={onResponseChange}
  showGroup={
    index === 0 ||
    question.group !== currentSectionData.questions[index - 1]?.group
  }
/>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onPrevious}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-navy-200 px-6 py-3 font-semibold text-navy-700 transition-all hover:bg-navy-50",
                currentSection === 1 && "invisible"
              )}
            >
              <SvgIcon name="back" className="h-5 w-5" />
              Back
            </button>

            {currentSection < sections.length ? (
              <button type="button" onClick={onNext} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-3 font-semibold text-white transition-all hover:from-teal-400 hover:to-teal-500">
                Next
                <SvgIcon name="arrowRight" className="h-5 w-5" />
              </button>
            ) : (
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-navy-700 to-navy-800 px-8 py-3 font-semibold text-white transition-all hover:from-navy-600 hover:to-navy-700">
                <SvgIcon name="check" className="h-5 w-5" />
                Submit Assessment
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

function RatingHeader() {
  return (
    <div className="mb-6 px-20 max-sm:px-0">
      <div className="grid grid-cols-5 gap-3 text-center text-xs text-navy-500">
        {ratingLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  value,
  onChange,
  showGroup,
}: {
  question: Question;
  index: number;
  value?: number;
  onChange: (questionId: string, value: number) => void;
  showGroup: boolean;
}) {
  return (
    <>
      {showGroup && question.group && (
        <div className="mt-8 mb-3 rounded-xl bg-navy-100 px-5 py-3">
          <h4 className="font-jakarta text-lg font-bold text-navy-900">
            {question.group}
          </h4>
        </div>
      )}

      <div className="rounded-xl border border-navy-100 bg-white p-5 transition-colors hover:border-teal-200">
        <div className="flex items-start gap-4">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-navy-100 text-sm font-semibold text-navy-600">
            {index + 1}
          </span>

          <div className="flex-1">
            <h4 className="mb-4 font-semibold text-navy-900">
              {question.label}
            </h4>

            {question.desc && (
              <p className="mb-4 text-sm text-navy-500">{question.desc}</p>
            )}

            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((number) => {
                const inputId = `${question.id}_${number}`;

                return (
                  <div className="likert-option" key={number}>
                    <input
                      type="radio"
                      name={question.id}
                      id={inputId}
                      value={number}
                      checked={value === number}
                      onChange={() => onChange(question.id, number)}
                      className="sr-only"
                    />

                    <label
                      htmlFor={inputId}
                      className="block w-full cursor-pointer rounded-lg border-2 border-navy-200 py-3 text-center text-sm font-medium text-navy-600 hover:border-teal-400"
                    >
                      {number}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ResultsPage({
  results,
  onRetake,
  onBackHome
}: {
  results: CareerResult[];
  onRetake: () => void;
  onBackHome: () => void;
}) {
  const top3 = results.slice(0, 3);

  function downloadResultPDF() {
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("SkillSync Career Pathway Recommendation Result", margin, y);

  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(
    "This result is a non-conclusive recommendation for career exploration.",
    margin,
    y
  );

  y += 12;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Top 3 Matched Career Pathways", margin, y);

  y += 8;

  top3.forEach((result, index) => {
    if (y > 260) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(`${index + 1}. ${result.name}`, margin, y);

    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Match Score: ${result.score}%`, margin, y);

    const strengthsText = `Matched Strengths: ${
      result.matchedStrengths && result.matchedStrengths.length > 0
        ? result.matchedStrengths.join(", ")
        : "General competency alignment"
    }`;

    const wrappedStrengths = pdf.splitTextToSize(
      strengthsText,
      pageWidth - margin * 2
    );

    pdf.text(wrappedStrengths, margin, y);
    y += wrappedStrengths.length * 5 + 3;

    if (result.programs && result.programs.length > 0) {
      const programsText = `Suggested Programs: ${result.programs.join(", ")}`;
      const wrappedPrograms = pdf.splitTextToSize(
        programsText,
        pageWidth - margin * 2
      );

      pdf.text(wrappedPrograms, margin, y);
      y += wrappedPrograms.length * 5 + 3;
    }

    if (result.occupations && result.occupations.length > 0) {
      const occupationsText = `Related Occupations: ${result.occupations.join(", ")}`;
      const wrappedOccupations = pdf.splitTextToSize(
        occupationsText,
        pageWidth - margin * 2
      );

      pdf.text(wrappedOccupations, margin, y);
      y += wrappedOccupations.length * 5 + 8;
    }
  });

  if (y > 245) {
    pdf.addPage();
    y = 20;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Disclaimer", margin, y);

  y += 7;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  const disclaimer =
    "The recommendations generated by SkillSync are intended for career exploration only. They should not be treated as final career decisions and may be reviewed with a guidance counselor or career adviser.";

  const wrappedDisclaimer = pdf.splitTextToSize(
    disclaimer,
    pageWidth - margin * 2
  );

  pdf.text(wrappedDisclaimer, margin, y);

  pdf.save("SkillSync_Career_Pathway_Result.pdf");
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-teal-50">
      <nav className="sticky top-0 z-50 border-b border-navy-100 bg-white/80 px-6 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button onClick={onBackHome} className="flex items-center gap-2 text-navy-600 transition-colors hover:text-navy-900">
            <SvgIcon name="back" className="h-5 w-5" />
            <span className="font-medium">Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
              <SvgIcon name="lightning" className="h-4 w-4 text-white" />
            </div>
            <span className="font-jakarta font-bold text-navy-900">SkillSync</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="fade-in">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-100 px-4 py-2">
              <SvgIcon name="check" className="h-5 w-5 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Assessment Complete</span>
            </div>
            <h1 className="mb-3 font-jakarta text-3xl font-bold text-navy-900 md:text-4xl">Your Career Pathway Matches</h1>
           <p className="mx-auto max-w-2xl text-navy-500">
  Based on your responses, here are your top career pathway recommendations
  aligned with O*NET competency domains.
</p>

<button
  type="button"
  onClick={downloadResultPDF}
  className="mt-4 rounded-xl bg-teal-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-teal-400"
>
  Download Result as PDF
</button>
          </div>

          <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <SvgIcon name="info" className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800">Non-Conclusive Recommendations</p>
              <p className="text-sm text-amber-700">
                These results are suggestions based on your self-assessment. They are meant to guide exploration, not determine your path. Consider consulting with career counselors for comprehensive guidance.
              </p>
            </div>
          </div>

          <div className="mb-10 space-y-6">
            {top3.map((result, index) => (
              <ResultCard key={result.id} result={result} index={index} />
            ))}
          </div>

          <div className="glass-card mb-8 rounded-2xl p-8 shadow-lg">
            <h3 className="mb-6 font-jakarta text-xl font-bold text-navy-900">Complete Career Pathway Analysis</h3>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="flex items-center gap-4">
                  <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white", result.color)}>
                    {result.icon}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-navy-700">{result.name}</span>
                      <span className="text-sm font-bold text-navy-900">{result.score}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-navy-100">
                      <div className={cn("bar-animate h-full rounded-full bg-gradient-to-r", result.color)} style={{ width: `${result.score}%`, animationDelay: "0.5s" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button onClick={onRetake} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-3 font-semibold text-white transition-all hover:from-teal-400 hover:to-teal-500">
              <SvgIcon name="retry" className="h-5 w-5" />
              Retake Assessment
            </button>
            <button onClick={onBackHome} className="flex items-center justify-center gap-2 rounded-xl border border-navy-200 px-8 py-3 font-semibold text-navy-700 transition-all hover:bg-navy-50">
              <SvgIcon name="home" className="h-5 w-5" />
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ResultCard({ result, index }: { result: CareerResult; index: number }) {
  return (
    <div className={cn("glass-card slide-up rounded-2xl border-l-4 p-6 shadow-lg", result.borderColor)} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white", result.color)}>
              {result.icon}
            </div>
            <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-lg">
              <span className="text-sm font-bold text-navy-900">#{index + 1}</span>
            </div>
          </div>
          <div>
            <h3 className="font-jakarta text-xl font-bold text-navy-900">{result.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div className={cn("bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent", result.color)}>{result.score}%</div>
              <span className="text-sm text-navy-500">Match Score</span>
            </div>
            <div className="mt-3">
  <p className="mb-2 text-sm font-medium text-navy-700">
    Career Cluster Alignment:
  </p>
  <div className="flex flex-wrap gap-2">
    {result.onetClusters.map((cluster) => (
      <span
        key={cluster}
        className="rounded-full border border-navy-200 bg-white px-3 py-1 text-xs font-medium text-navy-600"
      >
        {cluster}
      </span>
    ))}
  </div>
</div>
          </div>
        </div>

        <div className="flex-1 lg:border-l lg:border-navy-100 lg:pl-6">
          <div className="mb-4 h-3 overflow-hidden rounded-full bg-navy-100">
            <div className={cn("bar-animate h-full rounded-full bg-gradient-to-r", result.color)} style={{ width: `${result.score}%` }} />
          </div>

          <div className="mb-4 grid gap-3 rounded-xl bg-navy-50 p-4 text-sm text-navy-700 md:grid-cols-2">
  <div>
    <p className="font-semibold text-navy-900">Preferred Work Styles</p>
    <p>{result.competencyBasis.workStyles.join(", ")}</p>
  </div>
  <div>
    <p className="font-semibold text-navy-900">Key Skills</p>
    <p>{result.competencyBasis.skills.join(", ")}</p>
  </div>
  <div>
    <p className="font-semibold text-navy-900">Abilities</p>
    <p>{result.competencyBasis.abilities.join(", ")}</p>
  </div>
  <div>
    <p className="font-semibold text-navy-900">Knowledge Areas</p>
    <p>{result.competencyBasis.knowledge.join(", ")}</p>
  </div>
</div>

          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-navy-700">Key Matched Strengths:</p>
            <div className="flex flex-wrap gap-2">
              {result.matchedStrengths.map((strength) => (
                <span key={strength} className={cn("rounded-full border px-3 py-1 text-sm font-medium text-navy-700", result.bgColor, result.borderColor)}>
                  {strength}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-navy-700">Suggested Programs:</p>
              <ul className="space-y-1 text-sm text-navy-600">
                {result.programs.slice(0, 4).map((program) => (
                  <li key={program} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    {program}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-navy-700">Related Occupations:</p>
              <ul className="space-y-1 text-sm text-navy-600">
                {result.occupations.slice(0, 4).map((occupation) => (
                  <li key={occupation} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-navy-500" />
                    {occupation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-teal-400 border-t-transparent" />
        <p className="font-medium text-white">Analyzing your profile...</p>
        <p className="mt-1 text-sm text-navy-300">Matching with career pathways</p>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-pulse rounded-xl bg-navy-800 px-6 py-3 text-white shadow-xl">
      {message}
    </div>
  );
}
