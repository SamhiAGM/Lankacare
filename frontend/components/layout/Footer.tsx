import React from 'react';
import Link from 'next/link';
import { Activity, Phone, Mail, MapPin, ShieldCheck, HeartPulse, ExternalLink, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      {/* Emergency Hotline Bar */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-b border-rose-900/40 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-rose-300 font-semibold">
            <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>24/7 Verified Sri Lankan Emergency Hotlines:</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Pre-Hospital Ambulance:</span>
              <a href="tel:1990" className="text-rose-300 font-bold hover:text-white transition-colors">
                1990 (Suwa Seriya)
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Dengue Control:</span>
              <a href="tel:1907" className="text-amber-300 font-bold hover:text-white transition-colors">
                1907 (NDCU)
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Mental Health:</span>
              <a href="tel:1926" className="text-cyan-300 font-bold hover:text-white transition-colors">
                1926
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Poison Information:</span>
              <a href="tel:0112686143" className="text-emerald-300 font-bold hover:text-white transition-colors">
                011-2686143
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Govt Info:</span>
              <a href="tel:1919" className="text-slate-300 font-bold hover:text-white transition-colors">
                1919
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Disclaimer */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight text-white">LankaCare</p>
              <p className="text-[10px] text-teal-400 font-medium">Sri Lanka Digital Health Platform</p>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Coordinating healthcare facility discovery, dengue surveillance, essential medicines navigation, and emergency response across all 9 provinces and 25 districts of Sri Lanka.
          </p>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10.5px] text-amber-300/90 leading-relaxed">
            <span className="font-semibold text-amber-200">Prototype Notice: </span>
            Independent digital health platform / prototype using publicly available health information. Not an official government instrument.
          </div>
        </div>

        {/* Public Navigation */}
        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Healthcare Services</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><Link href="/find-care" className="hover:text-teal-400 transition-colors text-teal-300 font-medium flex items-center gap-1">Find Care Wizard →</Link></li>
            <li><Link href="/hospitals" className="hover:text-teal-400 transition-colors">Hospital & Facility Directory (25 Districts)</Link></li>
            <li><Link href="/dengue" className="hover:text-teal-400 transition-colors">Dengue Surveillance & Citizen Reporting</Link></li>
            <li><Link href="/medicines" className="hover:text-teal-400 transition-colors">NMRA Essential Medicines</Link></li>
            <li><Link href="/emergency" className="hover:text-teal-400 transition-colors">Emergency Dispatch & 1990 Contacts</Link></li>
            <li><Link href="/health-information" className="hover:text-teal-400 transition-colors">Public Health & NCD Guidance</Link></li>
          </ul>
        </div>

        {/* Administrative & Open Data */}
        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Data Governance</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><Link href="/admin/data-quality" className="hover:text-teal-400 transition-colors flex items-center gap-1.5"><Database className="w-3 h-3 text-teal-400" /> Data Quality Audit & Completeness</Link></li>
            <li><Link href="/admin/data" className="hover:text-teal-400 transition-colors">Dataset Ingestion & Version Pipeline</Link></li>
            <li><Link href="/dashboard" className="hover:text-teal-400 transition-colors">National Health Overview & Map</Link></li>
            <li><Link href="/surveillance" className="hover:text-teal-400 transition-colors">Disease Surveillance Dashboard</Link></li>
            <li><Link href="/complaints" className="hover:text-teal-400 transition-colors">Citizen Feedback & Inquiries</Link></li>
          </ul>
        </div>

        {/* Compliance & Standards */}
        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Compliance & Privacy</h4>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>PDPA Act No. 9 of 2022</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[10px]">
              Designed in alignment with Sri Lanka&apos;s Personal Data Protection Act No. 9 of 2022. No personal health records are shared without consent.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] pt-1 text-slate-400">
            <span>Colombo, Sri Lanka</span>
            <span>•</span>
            <span>Timezone: Asia/Colombo (+05:30)</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-900 py-4 px-4 sm:px-8 text-center text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} LankaCare — Sri Lanka Digital Health Coordination Platform. Open health informatics prototype.</p>
        <p className="text-[10px] mt-0.5 text-slate-600">
          Public health data sourced from Ministry of Health Sri Lanka, Epidemiology Unit & National Dengue Control Unit published releases.
        </p>
      </div>
    </footer>
  );
};

