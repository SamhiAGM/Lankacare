'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText, Bug, Syringe, HeartPulse, Baby, Phone, ShieldCheck,
  AlertCircle, ArrowRight, ExternalLink, Activity, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';

export default function CitizenHealthInformationPage() {
  const [activeTab, setActiveTab] = useState<'dengue' | 'vaccines' | 'maternal' | 'ncd' | 'emergency'>('dengue');

  return (
    <RoleGuard allowedRoles={[UserRole.CITIZEN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Public Health Education Center
              </h1>
              <Badge variant="teal">Official Ministry Guidelines</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verified clinical health education for Sri Lankan families from the Epidemiology Unit &amp; Health Promotion Bureau.
            </p>
          </div>
          <Link href="/citizen">
            <Button variant="outline" size="sm">
              ← Return to Citizen Portal
            </Button>
          </Link>
        </div>

        {/* Educational Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center gap-3 text-xs text-teal-800 dark:text-teal-200">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Official Notice:</strong> All information on this portal is verified educational content published by the Ministry of Health Sri Lanka. It does not replace individualized emergency clinical assessment.
          </span>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'dengue', label: 'Dengue Prevention', icon: Bug },
            { id: 'vaccines', label: 'National Immunization', icon: Syringe },
            { id: 'maternal', label: 'Maternal & Child Health', icon: Baby },
            { id: 'ncd', label: 'NCD & Lifestyle Health', icon: HeartPulse },
            { id: 'emergency', label: 'Emergency Hotlines', icon: Phone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'dengue' && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bug className="w-5 h-5 text-amber-500" />
                Dengue Fever: Critical Warnings &amp; Community Source Reduction
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dengue virus is transmitted primarily by <em>Aedes aegypti</em> and <em>Aedes albopictus</em> mosquitoes, which breed in clean standing water. With Sri Lanka’s monsoon weather cycles, domestic eradication is paramount.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-2">
                  <h3 className="font-bold text-amber-900 dark:text-amber-200">Red Flag Symptoms (Seek Urgent ETU Care):</h3>
                  <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
                    <li>Persistent vomiting or inability to tolerate oral fluids</li>
                    <li>Severe, unrelenting abdominal pain</li>
                    <li>Bleeding from gums, nose, or skin petechiae</li>
                    <li>Extreme lethargy, restlessness, or confusion</li>
                    <li>Sudden drop in body temperature with clammy extremities</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 text-xs space-y-2">
                  <h3 className="font-bold text-teal-900 dark:text-teal-200">Weekly 30-Minute Inspection Checklist:</h3>
                  <ul className="list-disc list-inside space-y-1 text-teal-800 dark:text-teal-300">
                    <li>Roof gutters cleared of fallen leaves and blockages</li>
                    <li>Refrigerator drip trays cleaned and scrubbed weekly</li>
                    <li>Discarded plastic bottles, coconut shells, and cups punctured</li>
                    <li>Water storage barrels and flower vases tightly covered or emptied</li>
                    <li>Pet water bowls and air conditioner drainage drained regularly</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/dengue">
                  <Button variant="primary" size="sm" className="gap-2 text-xs">
                    View Real-Time National Dengue Surveillance Dashboard →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vaccines' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Syringe className="w-5 h-5 text-teal-600" />
              Sri Lanka National Immunization Schedule (EPI)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Sri Lanka has maintained world-leading immunization coverage for over four decades through free public health services delivered via MOH clinic centers and hospitals.
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5">Age Milestone</th>
                    <th className="px-4 py-2.5">Vaccine Component</th>
                    <th className="px-4 py-2.5">Target Disease Prevention</th>
                    <th className="px-4 py-2.5">Site / Administration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-2.5 font-bold">At Birth</td>
                    <td className="px-4 py-2.5">BCG</td>
                    <td className="px-4 py-2.5">Tuberculosis (TB)</td>
                    <td className="px-4 py-2.5">Hospital Delivery Ward</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">2 Months</td>
                    <td className="px-4 py-2.5">Pentavalent 1 + OPV 1 + fIPV 1</td>
                    <td className="px-4 py-2.5">Diphtheria, Pertussis, Tetanus, Hep B, Hib, Polio</td>
                    <td className="px-4 py-2.5">MOH Field Clinic</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">4 Months</td>
                    <td className="px-4 py-2.5">Pentavalent 2 + OPV 2 + fIPV 2</td>
                    <td className="px-4 py-2.5">Diphtheria, Pertussis, Tetanus, Hep B, Hib, Polio</td>
                    <td className="px-4 py-2.5">MOH Field Clinic</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">9 Months</td>
                    <td className="px-4 py-2.5">MMR 1</td>
                    <td className="px-4 py-2.5">Measles, Mumps, Rubella</td>
                    <td className="px-4 py-2.5">MOH Field Clinic</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">18 Months</td>
                    <td className="px-4 py-2.5">DTP Booster + OPV 4</td>
                    <td className="px-4 py-2.5">Diphtheria, Pertussis, Tetanus booster</td>
                    <td className="px-4 py-2.5">MOH Field Clinic</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">3 Years</td>
                    <td className="px-4 py-2.5">MMR 2</td>
                    <td className="px-4 py-2.5">Measles, Mumps, Rubella booster</td>
                    <td className="px-4 py-2.5">MOH Field Clinic</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">5 Years</td>
                    <td className="px-4 py-2.5">DT + OPV 5</td>
                    <td className="px-4 py-2.5">Pre-school Diphtheria &amp; Tetanus</td>
                    <td className="px-4 py-2.5">MOH School Medical Clinic</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'maternal' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Baby className="w-5 h-5 text-rose-500" />
              Maternal &amp; Child Health Care Services
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every pregnant mother in Sri Lanka is assigned a dedicated Public Health Midwife (PHM) and issued a Maternal Health Record (B 544). Antenatal visits, iron/folic acid supplementation, and hospital delivery coordination are provided free across all provinces.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white">Antenatal Clinic</h3>
                <p className="text-slate-500">Scheduled monthly reviews, ultrasound scans, blood glucose screening, and tetanus toxoid vaccination.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white">Postnatal Midwife Visits</h3>
                <p className="text-slate-500">Direct home visits by PHMs on days 1, 3, 7, 14, and 28 following birth to support exclusive breastfeeding.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white">Child Growth Monitoring</h3>
                <p className="text-slate-500">Child Health Development Record (CHDR) weight plotting at local field weighing posts to eliminate malnutrition.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ncd' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-indigo-500" />
              Non-Communicable Diseases (NCD) &amp; Healthy Lifestyle Centers (HLC)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Sri Lanka provides free screening for Diabetes, Hypertension, and Cardiovascular risks at Healthy Lifestyle Centers (HLCs) established at Primary Medical Care Units (PMCU) and Divisional Hospitals nationwide.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white">Who Should Be Screened:</h3>
                <p className="text-slate-500">
                  All adults aged 35 years and above should attend an HLC annual screening session, including fasting blood sugar, blood pressure, BMI, and total cholesterol.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white">Dietary Guidance:</h3>
                <p className="text-slate-500">
                  Follow the Ministry of Health Traffic Light color-coding for sugar, salt, and fat on consumer beverage and food packaging. Limit daily salt to &lt;5g (one level teaspoon).
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-rose-600" />
              Verified Sri Lankan Emergency Contacts (Section 81)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-rose-900 dark:text-rose-200">1990 Suwa Seriya Ambulance</span>
                  <span className="font-mono font-black text-xl text-rose-600 dark:text-rose-400">1990</span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  Free 24/7 pre-hospital emergency medical response and paramedic transport across all 9 provinces of Sri Lanka.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-blue-900 dark:text-blue-200">National Mental Health Hotline</span>
                  <span className="font-mono font-black text-xl text-blue-600 dark:text-blue-400">1926</span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Confidential, free 24/7 mental health counseling and crisis intervention by the National Institute of Mental Health (NIMH).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">National Poison Information Centre</span>
                  <span className="font-mono font-bold text-sm text-teal-600">011 268 6143</span>
                </div>
                <p className="text-xs text-slate-500">
                  Specialist toxicological advice based at the National Hospital of Sri Lanka (NHSL Colombo).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Ministry of Health General Inquiries</span>
                  <span className="font-mono font-bold text-sm text-teal-600">011 269 8507</span>
                </div>
                <p className="text-xs text-slate-500">
                  Directorate of Health Services and disaster management emergency operations desk.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
