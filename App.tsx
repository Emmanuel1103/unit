import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lightbulb,
  BookOpen,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Layers
} from 'lucide-react';

// --- TYPES ---

type ModuleId = 'all' | 'unit8' | 'unit8_vocab' | 'unit9_future' | 'unit9_past';

interface ModuleTab {
  id: ModuleId;
  label: string;
  shortLabel: string;
}

interface TheoryRule {
  label: string;
  formula: string;
  example: string;
}

interface TheoryCard {
  title: string;
  description: string;
  rules: TheoryRule[];
}

interface Drill {
  id: number;
  module: Exclude<ModuleId, 'all'>;
  category: string;
  title: string;
  formula: string;
  context: string;
  prompt: string;
  placeholder: string;
  hint: string;
  answers: string[];
  explanation: string;
}

interface Feedback {
  isCorrect: boolean;
  message: string;
}

// --- DATA & CURRICULUM CONTENT ---

const MODULES: ModuleTab[] = [
  { id: 'all', label: 'Todos (Modo Examen)', shortLabel: 'Todos (22)' },
  { id: 'unit8', label: 'U8: Subjunctive', shortLabel: 'U8: Subjunctive' },
  { id: 'unit8_vocab', label: 'U8: Vocabulario (Talentos)', shortLabel: 'U8: Vocabulario' },
  { id: 'unit9_future', label: 'U9: Future Passive', shortLabel: 'U9: Future' },
  { id: 'unit9_past', label: 'U9: Future in the Past', shortLabel: 'U9: Past Future' }
];

const THEORY_CARDS: Record<ModuleId, TheoryCard> = {
  all: {
    title: 'Guía Rápida y Vocabulario: Unidades 8 & 9',
    description: 'Domina las 4 áreas clave del examen: Subjuntivo tras verbos/adjetivos de urgencia, Vocabulario de Talentos y Aptitudes (U8), Voz Pasiva en Futuro y Futuro visto desde el Pasado (U9).',
    rules: [
      {
        label: 'U8 Subjunctive',
        formula: 'Verb/Adj + that + Subject + BASE FORM (neg: not + base | pas: be + PP)',
        example: 'She insisted that we be on time. / It’s important that he not be late.'
      },
      {
        label: 'U8 Talents & Abilities',
        formula: 'be good with hands · mechanically inclined · head for figures · ear for music · eye for detail · intuitive sense · way with words/people · knack for',
        example: 'She has a knack for learning languages.'
      },
      {
        label: 'U9 Future & Past Passives',
        formula: 'Futuro: will be / going to be + PP | Pasado: would be / was-were going to be + PP',
        example: 'Appliances will be linked. / He predicted computers would be used.'
      }
    ]
  },
  unit8: {
    title: 'Unidad 8: The Subjunctive (Urgencia, Obligación y Consejo)',
    description: 'Se usa después de verbos (demand, insist, propose, recommend, request, suggest, urge) y adjetivos (critical, crucial, desirable, essential, important, necessary) seguidos de "that".',
    rules: [
      {
        label: 'Forma Base (Base Form)',
        formula: 'Subject + BASE VERB (Nunca lleva -s; el verbo "to be" siempre es "be")',
        example: 'The doctor recommends that he rest for a week.'
      },
      {
        label: 'Forma Negativa (Negative)',
        formula: 'Subject + NOT + BASE VERB (Jamás uses don’t / doesn’t / didn’t)',
        example: 'It’s crucial that you not forget your passport.'
      },
      {
        label: 'Pasiva y Continua',
        formula: 'Pasiva: be + past participle | Continua: be + verb-ing',
        example: 'We recommend that the report be reviewed. / It’s crucial that they be waiting.'
      }
    ]
  },
  unit8_vocab: {
    title: 'Unidad 8: Vocabulario de Talentos y Habilidades (Talents & Abilities)',
    description: 'Expresiones idiomáticas para describir habilidades naturales, aptitudes técnicas, artísticas o sociales. Recuerda conjugar el verbo inicial ("be" o "have") según el sujeto.',
    rules: [
      {
        label: 'Habilidades Manuales y Técnicas',
        formula: 'be good with one’s hands (destreza manual) · be mechanically inclined (entender máquinas)',
        example: 'He can fix any engine; he is mechanically inclined.'
      },
      {
        label: 'Mente, Detalle y Sentidos',
        formula: 'have a head for figures (matemáticas) · an ear for music (oído musical) · an eye for detail (detallista) · a good intuitive sense (intuición)',
        example: 'Accountants usually have a head for figures.'
      },
      {
        label: 'Comunicación y Dones Naturales',
        formula: 'have a way with words (elocuencia) · a way with [people/animals] (trato especial) · a knack for [doing sth] (don natural)',
        example: 'She has a way with children and animals.'
      }
    ]
  },
  unit9_future: {
    title: 'Unidad 9: Passive Voice About the Future',
    description: 'Se usa para predicciones y planes futuros cuando el foco está en quién o qué recibe la acción, no en quién la realiza.',
    rules: [
      {
        label: 'Afirmativa (Will / Going to)',
        formula: 'Subject + will be / (am/is/are) going to be + PAST PARTICIPLE',
        example: 'In coming years, our lives are going to be made easier by new tech.'
      },
      {
        label: 'Negativa',
        formula: 'Subject + won’t be / (isn’t/aren’t) going to be + PAST PARTICIPLE',
        example: 'Paper money won’t be used in the future.'
      },
      {
        label: 'Pregunta',
        formula: 'Will + subject + be + PAST PARTICIPLE? / Is-Are + subject + going to be + PP?',
        example: 'Will robots be used in every hospital?'
      }
    ]
  },
  unit9_past: {
    title: 'Unidad 9: Future as Seen from the Past (Passive)',
    description: 'Se usa cuando reportamos hoy lo que alguien dijo, pensó o predijo EN EL PASADO (predicted, thought, said, believed, promised, told) sobre un futuro posterior a ese momento.',
    rules: [
      {
        label: 'Conversión de Will -> Would',
        formula: 'Verbo en pasado + that + Subject + WOULD BE + PAST PARTICIPLE',
        example: 'Jobs and Gates predicted that computers would be used by millions.'
      },
      {
        label: 'Conversión de Going to -> Was/Were going to',
        formula: 'Verbo en pasado + that + Subject + WAS/WERE GOING TO BE + PAST PARTICIPLE',
        example: 'Olsen thought that computers were never going to be purchased for home use.'
      }
    ]
  }
};

const DRILLS: Drill[] = [
  // --- MODULE 1: UNIT 8 SUBJUNCTIVE (6 DRILLS) ---
  {
    id: 1,
    module: 'unit8',
    category: 'U8 · Subjunctive (Base Form)',
    title: 'Drill 1: Tercera persona en Subjuntivo',
    formula: '⚡ recommend + that + he + BASE FORM (sin -s)',
    context: 'El médico da una recomendación médica.',
    prompt: 'The doctor recommends that he ________ (rest) for a week.',
    placeholder: 'Escribe la forma verbal correcta...',
    hint: 'En subjuntivo el verbo nunca lleva "-s", incluso con "he", "she" o "it".',
    answers: ['rest'],
    explanation: 'Después de "recommends that", el verbo se mantiene en su forma base ("rest"), sin añadir "-s" para la tercera persona.'
  },
  {
    id: 2,
    module: 'unit8',
    category: 'U8 · Subjunctive (Verb To Be)',
    title: 'Drill 2: El verbo "To Be" en Subjuntivo',
    formula: '⚡ It’s essential + that + subject + BE',
    context: 'Adjetivo de urgencia seguido del verbo "to be".',
    prompt: "It's essential that I ________ (be) on time.",
    placeholder: 'Escribe la forma correcta de "be"...',
    hint: 'No uses "am", "is" ni "are". Usa directamente la forma base del verbo.',
    answers: ['be'],
    explanation: 'En el subjuntivo, el verbo "to be" siempre se escribe como "be" para todos los pronombres (I, you, he, she, it, we, they).'
  },
  {
    id: 3,
    module: 'unit8',
    category: 'U8 · Subjunctive (Negative)',
    title: 'Drill 3: Subjuntivo Negativo (Acción)',
    formula: '⚡ demand + that + subject + NOT + BASE FORM',
    context: 'Prohibición estricta en las reuniones de trabajo.',
    prompt: 'Our boss demanded that we ________ (not / use) phones in meetings.',
    placeholder: 'Ej: not + verbo base...',
    hint: 'Nunca uses auxiliares como "don\'t" o "didn\'t". Pon "not" directamente antes del verbo base.',
    answers: ['not use'],
    explanation: 'El subjuntivo negativo se forma estrictamente con "not + forma base" ("not use"), omitiendo cualquier auxiliar.'
  },
  {
    id: 4,
    module: 'unit8',
    category: 'U8 · Subjunctive (Negative To Be)',
    title: 'Drill 4: Subjuntivo Negativo con "To Be"',
    formula: '⚡ It’s important + that + he + NOT BE',
    context: 'Advertencia sobre la puntualidad en una entrevista.',
    prompt: "It's important that he ________ (not / be) late for the interview.",
    placeholder: 'Ej: not + be...',
    hint: 'Jamás digas "doesn\'t be". Usa "not" seguido de la forma base "be".',
    answers: ['not be'],
    explanation: 'Para negar "to be" en subjuntivo usamos "not be" ("It\'s important that he not be late").'
  },
  {
    id: 5,
    module: 'unit8',
    category: 'U8 · Subjunctive (Passive)',
    title: 'Drill 5: Subjuntivo en Voz Pasiva',
    formula: '⚡ It’s important + that + object + BE + PAST PARTICIPLE',
    context: 'El reporte recibe la acción de ser terminado antes del viernes.',
    prompt: "It's important that the report ________ (be / finish) by Friday.",
    placeholder: 'Ej: be + participio pasado...',
    hint: 'Mantén "be" en forma base y cambia "finish" a su participio pasado (-ed).',
    answers: ['be finished'],
    explanation: 'Para la voz pasiva en subjuntivo usamos "be" en forma base seguido del participio pasado: "be finished".'
  },
  {
    id: 6,
    module: 'unit8',
    category: 'U8 · Subjunctive (Continuous)',
    title: 'Drill 6: Subjuntivo Continuo',
    formula: '⚡ It’s crucial + that + subject + BE + VERB-ING',
    context: 'Acción en progreso requerida después de la entrevista.',
    prompt: "It's crucial that they ________ (be / wait) outside the room.",
    placeholder: 'Ej: be + gerundio...',
    hint: 'Usa "be" sin conjugar seguido del verbo terminado en "-ing".',
    answers: ['be waiting'],
    explanation: 'El subjuntivo continuo utiliza "be" + gerundio (-ing): "be waiting".'
  },

  // --- MODULE 2: UNIT 8 VOCABULARY - TALENTS & ABILITIES (7 DRILLS) ---
  {
    id: 7,
    module: 'unit8_vocab',
    category: 'U8 · Talents & Abilities',
    title: 'Drill 7: Talento Musical',
    formula: '⚡ have an ear for music = reconocer, recordar e imitar sonidos musicales',
    context: 'Ella puede tocar cualquier melodía de oído sin leer partituras.',
    prompt: "She doesn't even need sheet music to play that song on the piano; she really ________________________.",
    placeholder: 'Completa con el verbo conjugado (has...)...',
    hint: 'Usa "has" (tercera persona de have) + "an ear for music".',
    answers: ['has an ear for music'],
    explanation: '"Have an ear for music" significa tener buen oído musical. Con "she" se conjuga como "has an ear for music".'
  },
  {
    id: 8,
    module: 'unit8_vocab',
    category: 'U8 · Talents & Abilities',
    title: 'Drill 8: Aptitud Mecánica',
    formula: '⚡ be mechanically inclined = entender cómo funcionan las máquinas',
    context: 'Él puede reparar cualquier motor o aparato electrónico sin manual.',
    prompt: 'He can fix any car engine or gadget without looking at the manual because he ________________________.',
    placeholder: 'Completa con el verbo "to be" conjugado...',
    hint: 'Usa "is" + "mechanically inclined".',
    answers: ['is mechanically inclined', "he's mechanically inclined"],
    explanation: '"Be mechanically inclined" describe a alguien con facilidad para entender y reparar máquinas ("is mechanically inclined").'
  },
  {
    id: 9,
    module: 'unit8_vocab',
    category: 'U8 · Talents & Abilities',
    title: 'Drill 9: Atención al Detalle',
    formula: '⚡ have an eye for detail = notar pequeñas cosas que otros pasan por alto',
    context: 'Mi hermana detecta errores minúsculos en un documento en segundos.',
    prompt: 'My sister spots tiny typos in a document in seconds—she definitely ________________________.',
    placeholder: 'Completa la expresión con "has"...',
    hint: 'Usa "has" + "an eye for detail".',
    answers: ['has an eye for detail'],
    explanation: '"Have an eye for detail" significa ser muy observador y notar detalles que otros no ven.'
  },
  {
    id: 10,
    module: 'unit8_vocab',
    category: 'U8 · Talents & Abilities',
    title: 'Drill 10: Habilidad Matemática',
    formula: '⚡ have a head for figures = ser bueno para los cálculos matemáticos',
    context: 'Él es contador y hace cálculos financieros complejos mentalmente.',
    prompt: "He's an accountant and loves spreadsheets; he really ________________________.",
    placeholder: 'Completa con "has a head..."',
    hint: '"Figures" en este contexto significa números o cifras. Usa "has a head for figures".',
    answers: ['has a head for figures'],
    explanation: '"Have a head for figures" significa tener facilidad natural para las matemáticas y los números.'
  },
  {
    id: 11,
    module: 'unit8_vocab',
    category: 'U8 · Talents & Abilities',
    title: 'Drill 11: Elocuencia y Expresión',
    formula: '⚡ have a way with words = expresar ideas y opiniones muy bien',
    context: 'Sus discursos siempre convencen y emocionan a toda la audiencia.',
    prompt: 'Her speeches always inspire the audience because she ________________________.',
    placeholder: 'Completa con "has a way..."',
    hint: 'Combina "has a way with" + "words".',
    answers: ['has a way with words'],
    explanation: '"Have a way with words" significa tener facilidad de palabra y expresarse con elocuencia.'
  },
  {
    id: 12,
    module: 'unit8_vocab',
    category: 'U8 · Talents & Abilities',
    title: 'Drill 12: Trato Especial con Animales o Personas',
    formula: '⚡ have a way with [people / animals / children] = habilidad especial para tratar con ellos',
    context: 'Incluso los perros más nerviosos se calman apenas él se acerca.',
    prompt: 'Even the most nervous dogs calm down around him; he really ________________________ animals.',
    placeholder: 'Escribe las 4 palabras antes de "animals"...',
    hint: 'Usa "has a way with" antes de "animals".',
    answers: ['has a way with', 'has a way with animals'],
    explanation: '"Have a way with [animals/people/children]" indica una habilidad especial para conectar y trabajar bien con ellos.'
  },
  {
    id: 13,
    module: 'unit8_vocab',
    category: 'U8 · Talents & Abilities',
    title: 'Drill 13: Don Natural y Destreza Manual',
    formula: '⚡ have a knack for [doing sth] + be good with one’s hands',
    context: 'Él aprende idiomas sin esfuerzo (knack) y construye muebles de madera (hands).',
    prompt: 'He ________________________ learning languages, and he also ________________________ his hands. (Separa ambas con coma)',
    placeholder: 'Ej: has a knack for, is good with',
    hint: 'Primera parte: "has a knack for". Segunda parte: "is good with".',
    answers: ['has a knack for, is good with', 'has a knack for learning languages, is good with his hands'],
    explanation: '"Have a knack for" significa tener un don natural para algo, y "be good with one\'s hands" es tener destreza manual.'
  },

  // --- MODULE 3: UNIT 9 FUTURE PASSIVE (5 DRILLS) ---
  {
    id: 14,
    module: 'unit9_future',
    category: 'U9 · Future Passive (Will)',
    title: 'Drill 14: Electrodomésticos Conectados (Libro)',
    formula: '⚡ Subject + WILL BE + PAST PARTICIPLE',
    context: 'Ejemplo oficial del libro sobre el hogar del futuro.',
    prompt: 'In the future, appliances ________ (link) to each other and to the Internet. (Usa "will")',
    placeholder: 'Ej: will be + participio...',
    hint: 'Usa "will be" + participio pasado de "link" (linked).',
    answers: ['will be linked'],
    explanation: 'La pasiva futura con "will" se forma con: will + be + participio pasado ("will be linked").'
  },
  {
    id: 15,
    module: 'unit9_future',
    category: 'U9 · Future Passive (Going to)',
    title: 'Drill 15: Tecnología en el Hogar (Libro)',
    formula: '⚡ Subject (plural) + ARE GOING TO BE + PAST PARTICIPLE',
    context: 'Ejemplo del libro: "our lives" es plural.',
    prompt: 'In coming years, our lives ________ (make) easier by new home technologies. (Usa "going to")',
    placeholder: 'Ej: are going to be + participio...',
    hint: '"Our lives" es plural ("are") + going to be + participio de "make" (made).',
    answers: ['are going to be made'],
    explanation: 'Con sujeto plural usamos "are going to be" + participio pasado irregular de make ("made").'
  },
  {
    id: 16,
    module: 'unit9_future',
    category: 'U9 · Future Passive (Negative)',
    title: 'Drill 16: Dinero en Efectivo en el Futuro',
    formula: '⚡ Subject + WON’T BE / WILL NOT BE + PAST PARTICIPLE',
    context: 'Predicción negativa sobre el uso de billetes físicos.',
    prompt: 'Paper money ________ (not / use) in the future. (Usa "will")',
    placeholder: 'Ej: won\'t be + participio...',
    hint: 'Usa "won\'t be" (o "will not be") + participio pasado de "use" (used).',
    answers: ["won't be used", 'will not be used'],
    explanation: 'La pasiva futura negativa se construye con "won\'t be" + participio pasado ("used").'
  },
  {
    id: 17,
    module: 'unit9_future',
    category: 'U9 · Future Passive (Question)',
    title: 'Drill 17: Pregunta sobre Robots en Hospitales',
    formula: '⚡ WILL + subject + BE + PAST PARTICIPLE?',
    context: 'Forma interrogativa sobre el futuro de la medicina.',
    prompt: 'Completa la pregunta: ________ robots ________ (use) in every hospital?',
    placeholder: 'Ej: Will, be used',
    hint: 'Inicia con "Will", después del sujeto "robots" coloca "be used".',
    answers: ['will, be used', 'will be used', 'will robots be used'],
    explanation: 'En preguntas en pasiva futura con "will", el orden es: Will + sujeto + be + participio pasado.'
  },
  {
    id: 18,
    module: 'unit9_future',
    category: 'U9 · Future Passive (Will)',
    title: 'Drill 18: Automatización en 2040',
    formula: '⚡ Subject + WILL BE + PAST PARTICIPLE (irregular: do -> done)',
    context: 'Predicción sobre tareas realizadas por robots.',
    prompt: 'In 2040, many tasks ________ (do) by robots. (Usa "will")',
    placeholder: 'Ej: will be + participio...',
    hint: 'El participio pasado de "do" es "done".',
    answers: ['will be done'],
    explanation: 'Se forma con "will be" + el participio pasado irregular "done": "will be done".'
  },

  // --- MODULE 4: UNIT 9 FUTURE AS SEEN FROM THE PAST (4 DRILLS) ---
  {
    id: 19,
    module: 'unit9_past',
    category: 'U9 · Future in the Past (Would)',
    title: 'Drill 19: Predicción de Jobs y Gates',
    formula: '⚡ predicted (pasado) + that + Subject + WOULD BE + PAST PARTICIPLE',
    context: 'Predicción hecha en el pasado sobre las computadoras personales.',
    prompt: 'Jobs and Gates predicted that computers ________ (use) by millions of people. (Usa "would")',
    placeholder: 'Ej: would be + participio...',
    hint: 'Como "predicted" está en pasado, "will be" cambia a "would be" + used.',
    answers: ['would be used'],
    explanation: 'Al tener un verbo introductorio en pasado ("predicted"), el futuro pasivo retrocede a "would be used".'
  },
  {
    id: 20,
    module: 'unit9_past',
    category: 'U9 · Future in the Past (Going to)',
    title: 'Drill 20: Cierre de la Fábrica',
    formula: '⚡ said (pasado) + that + Subject (singular) + WAS GOING TO BE + PP',
    context: 'Reporte pasado sobre una fábrica ("the factory" = singular).',
    prompt: 'She said that the factory ________ (close). (Usa "going to")',
    placeholder: 'Ej: was going to be + participio...',
    hint: '"is going to be" cambia a pasado singular: "was going to be" + closed.',
    answers: ['was going to be closed'],
    explanation: 'Como el verbo principal ("said") está en pasado y "the factory" es singular, usamos "was going to be closed".'
  },
  {
    id: 21,
    module: 'unit9_past',
    category: 'U9 · Future in the Past (Would)',
    title: 'Drill 21: Creencia de los Expertos en 1990',
    formula: '⚡ believed (pasado) + that + Subject + WOULD BE + PAST PARTICIPLE',
    context: 'En 1990 se creía que los gobiernos controlarían Internet.',
    prompt: 'In 1990, experts believed that the Internet ________ (control) by governments. (Usa "would")',
    placeholder: 'Ej: would be + participio...',
    hint: 'Usa "would be" + participio pasado de control ("controlled" con doble L).',
    answers: ['would be controlled'],
    explanation: 'El verbo "believed" sitúa la predicción en el pasado, exigiendo "would be controlled".'
  },
  {
    id: 22,
    module: 'unit9_past',
    category: 'U9 · Future in the Past (Going to)',
    title: 'Drill 22: Entrega de Equipaje',
    formula: '⚡ were told (pasado) + that + luggage (incontable) + WAS GOING TO BE + PP',
    context: 'Aviso pasado en el aeropuerto ("luggage" siempre va en singular).',
    prompt: 'We were told that our luggage ________ (deliver) to the hotel. (Usa "going to")',
    placeholder: 'Ej: was going to be + participio...',
    hint: '"Luggage" es incontable (usa singular "was") + going to be + delivered.',
    answers: ['was going to be delivered'],
    explanation: '"Luggage" siempre concuerda en singular ("was"), formando "was going to be delivered".'
  }
];

// --- HELPERS ---

// Compara sin importar mayúsculas, puntuación, espacios ni tipo de apóstrofo (’ vs ')
const normalizeText = (str: string): string =>
  str
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc`´]/g, "'")
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// --- MAIN APPLICATION COMPONENT ---

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('all');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showTheory, setShowTheory] = useState(true);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLElement | null>(null);

  const filteredDrills = useMemo(() => {
    if (activeModule === 'all') return DRILLS;
    return DRILLS.filter((d) => d.module === activeModule);
  }, [activeModule]);

  const currentDrill = filteredDrills[currentIdx] ?? filteredDrills[0];
  const currentTheory = THEORY_CARDS[activeModule];

  // Al validar, lleva el resultado a la vista (el teclado del celular tapa la zona de abajo)
  useEffect(() => {
    if (feedback && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [feedback]);

  const resetQuestionUI = () => {
    setUserInput('');
    setFeedback(null);
    setShowHint(false);
  };

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCheckAnswer = () => {
    const cleanInput = normalizeText(userInput);
    if (!cleanInput) return;

    // Coincidencia exacta: antes se usaba "includes", así que "rests" pasaba como "rest"
    const isCorrect = currentDrill.answers.some(
      (ans) => normalizeText(ans) === cleanInput
    );

    if (isCorrect) {
      setFeedback({ isCorrect: true, message: currentDrill.explanation });
      setCompletedIds((prev) =>
        prev.includes(currentDrill.id) ? prev : [...prev, currentDrill.id]
      );
    } else {
      setFeedback({
        isCorrect: false,
        message: `Respuesta esperada: "${currentDrill.answers[0]}". ${currentDrill.explanation}`
      });
    }
  };

  const handleModuleChange = (modId: ModuleId) => {
    setActiveModule(modId);
    setCurrentIdx(0);
    resetQuestionUI();
  };

  const goToIndex = (idx: number) => {
    setCurrentIdx(idx);
    resetQuestionUI();
  };

  const handleNext = () => {
    if (currentIdx < filteredDrills.length - 1) {
      goToIndex(currentIdx + 1);
      scrollToWorkspace();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      goToIndex(currentIdx - 1);
      scrollToWorkspace();
    }
  };

  const handleFullReset = () => {
    setCompletedIds([]);
    setCurrentIdx(0);
    resetQuestionUI();
  };

  const moduleCompletedCount = filteredDrills.filter((d) =>
    completedIds.includes(d.id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-6 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* TOP HEADER & SCORE BAR */}
        <header className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <Brain className="w-4 h-4" /> Summit 2 · Grammar & Vocabulary Lab
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Laboratorio Summit 2 - Unidades 8 & 9
            </h1>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3.5 py-2 rounded-xl">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                Total: <span className="text-emerald-400">{completedIds.length}</span> / {DRILLS.length}
              </span>
            </div>
            <button
              onClick={handleFullReset}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition"
              title="Reiniciar todo el progreso"
              aria-label="Reiniciar todo el progreso"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* MODULE NAVIGATION TABS */}
        <nav className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700/80 shadow-lg">
          {MODULES.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleModuleChange(mod.id)}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 hidden md:inline" />
                <span className="hidden sm:inline">{mod.label}</span>
                <span className="sm:hidden">{mod.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* EXPANDABLE THEORY REFERENCE CARD */}
        <section className="bg-slate-800 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
          <button
            onClick={() => setShowTheory(!showTheory)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <div>
                <h2 className="font-bold text-sm sm:text-base text-white">
                  {currentTheory.title}
                </h2>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Haz clic para {showTheory ? 'ocultar' : 'ver'} fórmulas y reglas clave del módulo
                </p>
              </div>
            </div>
            {showTheory ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showTheory && (
            <div className="px-5 pb-5 pt-2 border-t border-slate-700/60 bg-slate-900/50 space-y-3">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentTheory.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentTheory.rules.map((rule, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5"
                  >
                    <div className="text-xs font-bold text-sky-400 uppercase">
                      {rule.label}
                    </div>
                    <div className="font-mono text-xs text-amber-300 bg-slate-900/90 p-2 rounded border border-slate-800">
                      {rule.formula}
                    </div>
                    <div className="text-xs text-slate-400 italic pt-1">
                      Ej: "{rule.example}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* INTERACTIVE DRILL WORKSPACE */}
        <main ref={workspaceRef} className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          {/* Module Progress Header & Dots */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
              <span>
                Ejercicio {currentIdx + 1} de {filteredDrills.length}
              </span>
              <span>
                Completados en este módulo: {moduleCompletedCount} / {filteredDrills.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {filteredDrills.map((d, idx) => {
                const isDone = completedIds.includes(d.id);
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={d.id}
                    onClick={() => goToIndex(idx)}
                    className="group flex-1 h-7 flex items-center"
                    title={`Ir al ejercicio ${idx + 1}`}
                    aria-label={`Ir al ejercicio ${idx + 1}`}
                  >
                    <span
                      className={`block w-full h-2.5 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-sky-400 ring-2 ring-sky-400/40'
                          : isDone
                          ? 'bg-emerald-500'
                          : 'bg-slate-700 group-hover:bg-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drill Category & Title */}
          <div className="mb-4">
            <span className="inline-block text-xs font-bold text-sky-400 bg-sky-950/90 border border-sky-800/70 px-3 py-1 rounded-md">
              {currentDrill.category}
            </span>
            <h3 className="text-xl font-bold text-white mt-2">
              {currentDrill.title}
            </h3>
          </div>

          {/* Structural Formula Box */}
          <div className="bg-slate-900 border-l-4 border-sky-400 p-3.5 rounded-r-xl mb-4 font-mono text-xs sm:text-sm text-sky-200">
            {currentDrill.formula}
          </div>

          {/* Context Note */}
          <p className="text-xs sm:text-sm text-slate-400 italic mb-4">
            💡 Contexto: {currentDrill.context}
          </p>

          {/* Prompt Box */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 sm:p-5 mb-5 text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
            {currentDrill.prompt}
          </div>

          {/* Input Area */}
          <div className="mb-5">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCheckAnswer();
              }}
              placeholder={currentDrill.placeholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="done"
              className="w-full bg-slate-900 border border-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-white rounded-xl px-4 py-3.5 text-base outline-none transition placeholder:text-slate-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={handleCheckAnswer}
              className="bg-sky-400 hover:bg-sky-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <Sparkles className="w-4 h-4" /> Validar Respuesta
            </button>

            <button
              onClick={() => setShowHint(!showHint)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              {showHint ? 'Ocultar Pista' : 'Ver Pista'}
            </button>
          </div>

          {/* Hint Box */}
          {showHint && (
            <div className="bg-amber-950/40 border border-amber-700/60 text-amber-200 p-4 rounded-xl text-xs sm:text-sm mb-5 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">
                  Pista gramatical:
                </span>
                {currentDrill.hint}
              </div>
            </div>
          )}

          {/* Feedback Result Banner */}
          {feedback && (
            <div
              ref={feedbackRef}
              role="status"
              className={`p-4 sm:p-5 rounded-xl border mb-6 flex items-start gap-3 ${
                feedback.isCorrect
                  ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-100'
                  : 'bg-rose-950/60 border-rose-600/80 text-rose-100'
              }`}
            >
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4
                  className={`font-bold text-sm sm:text-base ${
                    feedback.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {feedback.isCorrect
                    ? '¡Excelente! Estructura gramatical correcta.'
                    : 'Revisa la regla gramatical:'}
                </h4>
                <p className="text-xs sm:text-sm mt-1 leading-relaxed opacity-95">
                  {feedback.message}
                </p>
              </div>
            </div>
          )}

          {/* Bottom Navigation Bar */}
          <div className="flex justify-between items-center border-t border-slate-700/80 pt-5 mt-2">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentIdx === 0
                  ? 'text-slate-600 bg-slate-800/40 cursor-not-allowed'
                  : 'text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              {currentIdx + 1} / {filteredDrills.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIdx === filteredDrills.length - 1}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentIdx === filteredDrills.length - 1
                  ? 'text-slate-600 bg-slate-800/40 cursor-not-allowed'
                  : 'text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
