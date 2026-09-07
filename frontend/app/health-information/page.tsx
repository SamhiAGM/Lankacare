'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen, Search, Filter, Calendar, User, ArrowRight,
  Heart, Shield, AlertCircle, ChevronRight, Share2, Printer,
  Eye, Type, Contrast, ExternalLink, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Footer } from '@/components/layout/Footer';

interface HealthArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  lastUpdated: string;
  author: string;
  source: string;
  sourceUrl?: string;
  readTime: string;
  relatedResources: string[];
}

const articlesData: HealthArticle[] = [
  {
    id: 'art-001',
    title: 'Dengue Fever Prevention & Warning Signs During Monsoon Resurgence',
    category: 'Infectious Diseases',
    summary: 'Recognize the critical phase of dengue, fluid management guidelines, and community vector source reduction techniques.',
    content: `Dengue is a mosquito-borne viral infection transmitted predominantly by female Aedes aegypti and Aedes albopictus mosquitoes.

### Clinical Stages
1. **Febrile Phase (Days 1 to 3):** Sudden high-grade fever (39°C - 40°C), severe headache, retro-orbital pain, severe myalgia, arthralgia, and facial flushing.
2. **Critical Phase (Days 3 to 6):** Temperature typically drops below 38°C. This corresponds to the period of increased capillary permeability. Watch closely for warning signs:
   - Persistent vomiting and inability to tolerate oral fluids
   - Severe abdominal pain or tenderness
   - Mucosal bleeding (epistaxis, gum bleeding)
   - Lethargy, restlessness, or behavioral change
   - Cold, clammy extremities and oliguria (reduced urine output)
3. **Recovery Phase:** Gradual stabilization of hematocrit and return of appetite.

### Safe Home Management
- Maintain adequate oral rehydration with king coconut water, oral rehydration solutions (ORS), and kanji.
- **Strict Avoidance:** NEVER take Non-Steroidal Anti-Inflammatory Drugs (NSAIDs) such as Ibuprofen, Mefenamic acid, or Diclofenac as they dramatically increase gastrointestinal bleeding risks. Use only Paracetamol within prescribed limits.
- If fever persists past day 2, obtain a Full Blood Count (FBC) from the nearest government hospital.`,
    lastUpdated: 'September 5, 2026',
    author: 'Dr. Thilini Dissanayake, Consultant Epidemiologist',
    source: 'Epidemiology Unit Sri Lanka (epid.gov.lk)',
    sourceUrl: 'https://www.epid.gov.lk',
    readTime: '4 min read',
    relatedResources: ['Epidemiological Unit Dengue Circular 2026', 'Suwa Seriya 1990 Triage Guidelines'],
  },
  {
    id: 'art-002',
    title: 'Type 2 Diabetes Mellitus: National Prevention & Dietary Guidance',
    category: 'Noncommunicable Diseases (NCD)',
    summary: 'Dietary habits for blood glucose control, traditional low-GI foods, and early screening at Healthy Lifestyle Centers (HLC).',
    content: `According to national NCD surveillance data, diabetes affects over 1 in 4 Sri Lankan adults in urban and suburban sectors.

### Primary Lifestyle Adjustments
- **Traditional Low Glycemic Foods:** Replace polished white rice with traditional red rice (Suwandel, Kalu Heenati), kurakkan (finger millet), and pulses (mung bean, cowpea, chickpeas).
- **Sugar Consumption:** Sri Lankan adults consume on average over 60g of refined sugar per day, largely from sweetened milk tea and confectionery. Adhere to the Traffic Light Food Labeling regulations.
- **Physical Activity:** Engage in at least 150 minutes of moderate-intensity aerobic exercise per week (such as brisk walking or swimming).

### Free Screening at Government HLCs
Free screening for fasting blood glucose, lipid profile, and BMI is available at all Divisional Hospitals and Primary Medical Care Units across Sri Lanka for all citizens over 35.`,
    lastUpdated: 'August 30, 2026',
    author: 'Directorate of Non-Communicable Diseases (NCD)',
    source: 'Health Promotion Bureau, Ministry of Health Sri Lanka',
    sourceUrl: 'https://hpb.health.gov.lk',
    readTime: '5 min read',
    relatedResources: ['National NCD Strategic Plan', 'Healthy Lifestyle Center Directory'],
  },
  {
    id: 'art-003',
    title: 'Systemic Hypertension & Cardiovascular Health in Sri Lanka',
    category: 'Noncommunicable Diseases (NCD)',
    summary: 'Managing blood pressure, reducing dietary sodium intake, and recognizing acute coronary syndromes.',
    content: `Hypertension is known as the "silent killer" as high blood pressure frequently exhibits zero symptoms until acute cardiovascular complications occur.

### Dietary Salt Restriction
- WHO and Ministry of Health guidelines recommend consuming less than 5 grams of salt per day (approximately one level teaspoon).
- Reduce consumption of processed salted fish (karawala), pickles (achcharu), and salted crackers.
- Regular monitoring: Check your blood pressure every 6 months if over 35 years of age.

### Warning Signs of Heart Attack
- Central crushing chest pain or tightness radiating to the left arm, jaw, or back.
- Associated diaphoresis (cold sweats), shortness of breath, or sudden dizziness.
- **Immediate Action:** Dial 1990 Suwa Seriya immediately for pre-hospital paramedic transfer to the nearest ETU.`,
    lastUpdated: 'August 24, 2026',
    author: 'Sri Lanka Heart Association & Directorate of NCD',
    source: 'Ministry of Health Sri Lanka',
    sourceUrl: 'https://www.health.gov.lk',
    readTime: '4 min read',
    relatedResources: ['Cardiovascular Risk Assessment Protocol', 'Emergency 1990 Response'],
  },
  {
    id: 'art-004',
    title: 'Elderly Care: Healthy Ageing, Mobility, and Fall Prevention',
    category: 'Elderly Care',
    summary: 'Essential home safety guidelines, medication adherence, and cognitive wellness for Sri Lankan senior citizens.',
    content: `Sri Lanka has one of the fastest ageing demographic profiles in South Asia. Fostering healthy ageing ensures independence and dignity for older adults.

### Home Safety & Fall Prevention
- **Bathroom Hazards:** Over 60% of senior falls occur in bathrooms. Install wall grab rails, non-slip rubber mats, and adequate nighttime lighting.
- **Footwear:** Wear supportive, non-skid footwear both inside and outside the home.
- **Medication Review:** Annual polypharmacy review by a government hospital medical clinic to avoid sedating drug interactions that impair balance.

### Vision and Hearing Care
- Free cataract screening and intraocular lens surgery are provided at all government Provincial and District General Hospitals.
- Regular annual vision evaluations prevent disorientation and falls.`,
    lastUpdated: 'August 15, 2026',
    author: 'Directorate of Youth, Elderly and Disabled Persons',
    source: 'Ministry of Health Sri Lanka',
    sourceUrl: 'https://www.health.gov.lk',
    readTime: '6 min read',
    relatedResources: ['Elderly Healthcare Charter Sri Lanka', 'Provincial Eye Care Network'],
  },
  {
    id: 'art-005',
    title: 'Leptospirosis (Rat Fever / Meemeka) Prevention for Agricultural Workers',
    category: 'Infectious Diseases',
    summary: 'Prophylactic Doxycycline, protective footwear for paddy farmers, and recognizing early jaundice or oliguria.',
    content: `Leptospirosis is a serious bacterial zoonosis transmitted through water contaminated with the urine of infected rodents and livestock.

### High-Risk Activities
- Paddy cultivation, cleaning storm canals, gem mining, and working in flooded lowland fields in Sabaragamuwa, Western, and Southern provinces.

### Prevention Protocol
- **Prophylaxis:** Free prophylactic Doxycycline (two 100mg capsules weekly) is provided by the local Public Health Inspector (PHI) to all paddy field cultivators before ploughing.
- Cover all skin cuts and abrasions with waterproof dressings.
- Seek medical attention immediately for high fever, calf muscle tenderness, conjunctival suffusion (red eyes), or dark urine.`,
    lastUpdated: 'September 1, 2026',
    author: 'Epidemiology Unit, Ministry of Health Sri Lanka',
    source: 'Epidemiology Unit Sri Lanka (epid.gov.lk)',
    sourceUrl: 'https://www.epid.gov.lk',
    readTime: '4 min read',
    relatedResources: ['National Leptospirosis Guidelines', 'Agricultural Health Safety Circular'],
  },
];

export default function HealthInformationPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeArticle, setActiveArticle] = useState<HealthArticle | null>(null);

  // Elderly Care Accessibility Toggles (Requirement 18)
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const categories = useMemo(() => {
    const list = Array.from(new Set(articlesData.map((a) => a.category)));
    return ['ALL', ...list];
  }, []);

  const filteredArticles = useMemo(() => {
    return articlesData.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || a.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  return (
    <div
      className={`min-h-screen ${
        highContrast ? 'bg-black text-white' : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200'
      } ${largeText ? 'text-lg' : 'text-sm'} transition-all`}
    >
      {/* Top Header & Elderly Accessibility Bar */}
      <div className="bg-slate-900 text-white py-3 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-teal-400 font-bold hover:underline">
              ← LankaCare Portal
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-300">Public Health Library & Patient Education</span>
          </div>

          {/* Elderly Accessibility Controls (Requirement 18) */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Accessibility:</span>
            <button
              onClick={() => setLargeText(!largeText)}
              className={`px-2.5 py-1 rounded-md border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                largeText
                  ? 'bg-teal-600 text-white border-teal-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>{largeText ? 'Large Text: ON' : 'Large Text'}</span>
            </button>

            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-2.5 py-1 rounded-md border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                highContrast
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Contrast className="w-3.5 h-3.5" />
              <span>{highContrast ? 'High Contrast: ON' : 'High Contrast'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-12 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>Sri Lanka Health Promotion & Disease Prevention</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Authoritative Public Health Information
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Educational guidelines on Non-Communicable Diseases (Diabetes, Hypertension, CVD), Vector Control,
            Maternal Care, and Healthy Ageing sourced from the Sri Lanka Health Promotion Bureau.
          </p>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-amber-300 flex items-center gap-2 max-w-2xl">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Medical Disclaimer:</strong> This portal provides evidence-based educational material.
              It does not diagnose medical conditions or automatically prescribe pharmaceuticals. Please consult
              a qualified clinician at your local hospital for clinical diagnosis.
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-8 space-y-6">
        {/* Search & Category Tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search public health topics, symptoms, diet advice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {c === 'ALL' ? 'All Health Topics' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className={`rounded-2xl border p-6 transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                highContrast
                  ? 'bg-zinc-900 border-zinc-700 hover:border-yellow-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{art.readTime}</span>
                </div>

                <h3 className="text-base font-bold leading-snug">{art.title}</h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">
                  <span>Source: </span>
                  <strong className="text-slate-700 dark:text-slate-300">{art.source}</strong>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold"
                  onClick={() => setActiveArticle(art)}
                >
                  Read Verified Article <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <Modal
          isOpen={!!activeArticle}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
          description={`Published by ${activeArticle.author} • Sourced from ${activeArticle.source}`}
          size="lg"
        >
          <div className="space-y-4 py-2 text-xs leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                {activeArticle.category}
              </span>
              <SourceBadge type="VERIFIED_OFFICIAL" size="sm" showDetails={false} />
            </div>

            <div className="prose dark:prose-invert max-w-none whitespace-pre-line text-slate-800 dark:text-slate-200">
              {activeArticle.content}
            </div>

            {activeArticle.sourceUrl && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Authoritative Publication:</span>
                <a
                  href={activeArticle.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  Open Official Sourced Page <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
