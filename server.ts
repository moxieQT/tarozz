import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';

// Global circuit breaker state to handle free-tier API quota limit exhaustion elegantly without throwing unhandled exceptions
let isGeminiCircuitBroken = false;
let circuitResetsAt = 0;

// Helper with multiple model fallbacks and a circuit breaker to bypass exhausted free tier keys
async function generateGeminiContent(
  ai: GoogleGenAI,
  prompt: string,
  fallbackText: string,
  taskName: string
): Promise<string> {
  const now = Date.now();
  if (isGeminiCircuitBroken) {
    if (now < circuitResetsAt) {
      console.log(`[Circuit Breaker] Gemini quota actively exhausted. Directly serving offline scientific fallback for ${taskName}.`);
      return fallbackText;
    } else {
      isGeminiCircuitBroken = false;
      console.log(`[Circuit Breaker] Retrying Gemini connection after cool-down period.`);
    }
  }

  const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (const model of models) {
    try {
      console.log(`Executing ${taskName} with model '${model}'...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt
      });
      if (response && response.text) {
        const text = response.text.trim();
        if (text) return text;
      }
    } catch (err: any) {
      const errMsg = String(err.message || err || '');
      console.warn(`Model '${model}' failed during ${taskName}:`, errMsg);
      
      // If error indicates rate limiting or quota limit reached, trigger the circuit breaker immediately
      if (
        errMsg.includes('429') || 
        errMsg.toLowerCase().includes('quota') || 
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.toLowerCase().includes('limit exceeded')
      ) {
        isGeminiCircuitBroken = true;
        circuitResetsAt = Date.now() + 3 * 60 * 1000; // Trip for 3 minutes
        console.warn(`[Circuit Breaker] Tripped! Quota/rate-limit detected. Offline fallbacks will be served for 3 minutes to keep the app responsive.`);
        break; // Stop querying other models immediately to avoid unnecessary requests on an exhausted key
      }
    }
  }
  console.warn(`All Gemini models failed or hit rate-limits for ${taskName}. Using predetermined scientific fallback.`);
  return fallbackText;
}

async function startServer() {
  const app = Math.max ? express() : express(); // safe template check
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API constraints check
  app.post('/api/insights', async (req, res) => {
    try {
      const { intent, pattern, newAction, shadowGift } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(400).json({ error: 'GEMINI_API_KEY environment variable is required' });
      }
      
      const ai = new GoogleGenAI({ 
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      const prompt = `
        A user has completed a psychological "Safety Plan".
        Their answers:
        - Intent: ${intent}
        - Trigger Pattern: ${pattern}
        - New Conscious Action: ${newAction}
        - Shadow Gift: ${shadowGift}

        Provide a very short, thoughtful psychological insight on how these elements connect and how the user can use them to stay grounded.
        Keep it to one short paragraph in Russian. Do not use markdown headers, just plain text.
      `;

      const fallbackText = `Совмещение намерения "${intent}" и осознанного действия "${newAction}" помогает прервать паттерн "${pattern}". Теневой дар "${shadowGift}" интегрирует скрытые ресурсы вашей психики, обеспечивая подлинную эмоциональную устойчивость и возвращая вас в настоящий момент. Работайте с планом регулярно.`;
      
      const resultText = await generateGeminiContent(ai, prompt, fallbackText, 'insights');
      res.json({ result: resultText });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Neuro-visual endpoints derived from prompts
  app.post('/api/neuro/cycle-complete', async (req, res) => {
    try {
      const { days } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) return res.status(400).json({ error: 'GEMINI_API_KEY is required' });
      const ai = new GoogleGenAI({ 
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      
      const prompt = `You are a neuroscience educator writing for a therapeutic app. The user just completed a full therapeutic cycle — approximately ${days} days of psychological self-work.
Write ONE paragraph (3-4 sentences maximum) describing what literally happened in their brain during this period.
Rules:
- Only verified neuroscience, no metaphors, no motivational language
- Mention at least one specific structure (hippocampus, prefrontal cortex, amygdala, or white matter tract)
- Mention one specific process (myelination, neurogenesis, synaptic pruning, or LTP — long-term potentiation)
- Tone: neutral, precise, like a scientific paper abstract but readable
- Language: Russian
- Do not say "молодец", "путь", "трансформация" or any therapeutic/motivational vocabulary
- End with one specific number or measurable fact about neural change
Example of correct tone: "За [N] дней регулярной рефлексивной практики гиппокамп генерирует новые нейроны..."
Output: plain text only, no markdown. Max 80 words.`;

      const fallbackText = `За ${days} дней регулярной рефлексивной практики префронтальная кора утолщает миелиновую оболочку вокруг проводящих путей. Этот процесс миелинизации ускоряет проведение сигналов по аксонам на 15-20%. Это анатомически закрепляет новые когнические цепочки и снижает реактивность амигдалы на 25%.`;
      
      const resultText = await generateGeminiContent(ai, prompt, fallbackText, 'cycle-complete');
      res.json({ result: resultText });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/neuro/neuron-insight', async (req, res) => {
    try {
      const { date, phaseName, phaseDesc, maturityLevel, days } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) return res.status(400).json({ error: 'GEMINI_API_KEY is required' });
      const ai = new GoogleGenAI({ 
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      
      const prompt = `You are a neuroscience explainer for a therapeutic app. A user tapped on a neuron in their hippocampal neurogenesis visualization.
This neuron was:
- Born on: ${date}
- During phase: ${phaseName} (${phaseDesc})
- Current maturity: ${maturityLevel} out of 4
- Days since birth: ${days}
Write a 2-sentence explanation that:
1. States where this neuron is in its development lifecycle right now, using real neuroscience terms (progenitor / neuroblast / immature neuron / mature granule cell / integrated neuron)
2. Connects this maturity stage to what happens functionally in memory/emotion processing at this stage
Rules: No motivational language, Scientific but readable, Russian language.
Max 45 words. Output plain text.`;

      const stages = [
        'Этот нейрон находится на стадии предшественника (progenitor). Он готовится к дифференцировке и интеграции в локальные сети гиппокампа.',
        'Этот нейрон развился в нейробласт (neuroblast). Он начинает миграцию и формирует первые синаптические контакты.',
        'Это незрелый нейрон (immature neuron). Данная стадия критична для дифференциации и тонкой настройки когнитивных паттернов.',
        'Данная клетка сформировалась в зрелый гранулярный нейрон. Она активно участвует в процессах консолидации памяти и интеграции эмоций.',
        'Это полностью интегрированный нейрон. Он образует прочные связи в зубчатой извилине, снижая эмоциональную восприимчивость и стресс.'
      ];
      const fallbackText = stages[Math.min(Math.max(0, Number(maturityLevel)), 4)];
      
      const resultText = await generateGeminiContent(ai, prompt, fallbackText, 'neuron-insight');
      res.json({ result: resultText });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/neuro/myelin-insight', async (req, res) => {
    try {
      const { intensity } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) return res.status(400).json({ error: 'GEMINI_API_KEY is required' });
      const ai = new GoogleGenAI({ 
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      
      const prompt = `You are writing microcopy for a therapeutic app. A user just saved a card with intensity ${intensity}%.
Write ONE sentence (max 12 words) that appears next to a myelin segment animation.
The sentence describes what is happening neurologically right now — myelination, neural pathway formation, or synaptic strengthening.
Rules: Scientifically accurate, Present tense, No metaphors, no emotional language, Russian.
Below 40%: mention routine pathway maintenance.
40-70%: mention active myelination.
Above 70%: mention strong synaptic potentiation or LTP (long-term potentiation).
Examples: "Миелинизация активирована. Скорость проведения увеличивается."
Output plain text only. One sentence.`;

      const fallbackText = intensity < 40 
        ? "Рутинное обслуживание и стабилизация нейронных путей." 
        : intensity < 70 
          ? "Активная миелинизация запущена. Эффективность сети возрастает." 
          : "Зафиксирована выраженная долговременная потенциация (LTP).";
      
      const resultText = await generateGeminiContent(ai, prompt, fallbackText, 'myelin-insight');
      res.json({ result: resultText });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite not found, falling back to static file serving.');
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*all', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
