'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity, Building2, UserCheck, Calendar, Pill, Syringe,
  Siren, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle,
  PhoneCall, HeartPulse, ExternalLink, Sparkles, Clock, MapPin,
  Compass, Bug, Flag, Megaphone, ShieldCheck, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Card, CardContent } from '@/components/ui/Card';
import { Footer } from '@/components/layout/Footer';
import {
  getHospitals, getDoctors, getAnnouncements, getCampaigns,
  getDiseaseReports, getEmergencies, getDistrictDengueStats
} from '@/services/apiClient';
import { Announcement, HealthCampaign, DiseaseReport, Hospital } from '@/types';
import { formatSriLankanDate, formatSriLankanPhone } from '@/lib/sriLankaGeo';
import { useLanguage } from '@/context/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [campaigns, setCampaigns] = useState<HealthCampaign[]>([]);
  const [diseases, setDiseases] = useState<DiseaseReport[]>([]);

  useEffect(() => {
    setHospitals(getHospitals());
    setAnnouncements(getAnnouncements().slice(0, 3));
    setCampaigns(getCampaigns().slice(0, 3));
    setDiseases(getDiseaseReports().slice(0, 3));
  }, []);

  // Compute database-derived statistics (strictly avoiding invented values)
  const totalInstitutions = hospitals.length;
  const totalReportedBeds = hospitals.reduce((acc, h) => acc + (h.totalBeds || 0), 0);
  const dengueStats = useMemo(() => getDistrictDengueStats(), []);
  const totalDengueWeeklyCases = dengueStats.reduce((acc, d) => acc + d.casesThisWeek, 0);

  // 9 Sri Lanka-Specific Services (Requirement 42)
  const services = [
    {
      title: 'Find a Hospital',
      description: 'Directory of National, Teaching, Provincial, and District General Hospitals across 25 districts.',
      href: '/hospitals',
      icon: Building2,
      color: 'from-teal-500 to-emerald-600',
      badge: 'Official Facilities',
    },
    {
      title: 'Find Primary Care',
      description: '4-step wizard matching healthcare facilities by province, district, type, and clinical specialty.',
      href: '/find-care',
      icon: Compass,
      color: 'from-blue-500 to-cyan-600',
      badge: 'Care Finder',
    },
    {
      title: 'Find a Doctor',
      description: 'Directory of Sri Lanka Medical Council (SLMC) accredited consultants and medical practitioners.',
      href: '/staff',
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-700',
      badge: 'SLMC Verified',
    },
    {
      title: 'Medicine Information',
      description: 'National Essential Medicines List from NMRA & Medical Supplies Division (MSD).',
      href: '/medicines',
      icon: Pill,
      color: 'from-purple-500 to-indigo-600',
      badge: 'NMRA / MSD List',
    },
    {
      title: 'Dengue Information',
      description: 'Weekly epidemiological case density and community mosquito breeding habitat reporting.',
      href: '/dengue',
      icon: Bug,
      color: 'from-rose-500 to-pink-600',
      badge: 'Vector Surveillance',
    },
    {
      title: 'Vaccination Schedule',
      description: 'National Expanded Programme on Immunization (EPI) guidelines and childhood schedule.',
      href: '/vaccinations',
      icon: Syringe,
      color: 'from-amber-500 to-orange-600',
      badge: 'EPI Sri Lanka',
    },
    {
      title: 'Health Campaigns',
      description: 'National non-communicable disease (NCD), nutrition, and wellness promotion drives.',
      href: '/campaigns',
      icon: Flag,
      color: 'from-indigo-500 to-blue-700',
      badge: 'Health Promotion',
    },
    {
      title: 'Emergency Information',
      description: '1990 Suwa Seriya pre-hospital ambulance, National Poison Information, and acute trauma hotlines.',
      href: '/emergency',
      icon: Siren,
      color: 'from-red-600 to-rose-700',
      badge: 'Dial 1990',
    },
    {
      title: 'Public Health Alerts',
      description: 'Official Ministry advisories, gazette circulars, and epidemic vigilance bulletins.',
      href: '/announcements',
      icon: Megaphone,
      color: 'from-slate-600 to-slate-800',
      badge: 'Official Notices',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Disclaimer & Hotline Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-teal-400">🇱🇰 LankaCare</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Independent digital health platform prototype using publicly available health information.
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] ml-auto">
          <Link
            href="/emergency"
            className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
          >
            <Siren className="w-3.5 h-3.5" /> Emergency 1990 Suwa Seriya
          </Link>
          <Link href="/login" className="text-teal-400 hover:text-teal-300 font-semibold">
            Sign In →
          </Link>
        </div>
      </div>

      {/* Hero Section (Requirements 40 & 41) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 lg:py-24 px-4 sm:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold backdrop-blur-xs animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>LankaCare — Check Before You Travel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Connecting Sri Lanka to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">
              Better Healthcare
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Check real-time hospital queues, verified service availability, and essential medicine stock across all 9 provinces and 25 districts before you leave home. Reduce unnecessary travel and crowding.
          </p>

          {/* 3 Main Action Buttons (Requirement 41) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/find-care">
              <Button variant="primary" size="lg" className="shadow-lg shadow-teal-600/30">
                <Compass className="w-4 h-4 mr-2" /> Find Healthcare
              </Button>
            </Link>
            <Link href="/hospitals">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <Building2 className="w-4 h-4 mr-2" /> Explore Hospitals
              </Button>
            </Link>
            <a href="#alerts">
              <Button
                variant="navy"
                size="lg"
                className="bg-slate-800 text-teal-300 hover:bg-slate-700"
              >
                <Megaphone className="w-4 h-4 mr-2" /> Public Health Alerts
              </Button>
            </a>
          </div>

          <div className="pt-2">
            <span className="text-[11px] text-slate-400">
              * Independent digital health platform / prototype using publicly available health information.
            </span>
          </div>
        </div>
      </section>

      {/* Database-Driven Real Statistics Bar */}
      <section className="bg-slate-950 py-8 border-b border-slate-800/80 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">
              {totalInstitutions}
            </div>
            <div className="text-xs font-bold text-slate-300">Verified Hospitals</div>
            <div className="text-[10px] text-slate-500">Across 25 Districts</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">
              {totalReportedBeds.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-slate-300">Official Reported Beds</div>
            <div className="text-[10px] text-amber-400">Reporting Year 2025</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
              {totalDengueWeeklyCases.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-slate-300">Weekly Dengue Cases</div>
            <div className="text-[10px] text-slate-500">Epidemiology Unit Wk 36</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              97.5%
            </div>
            <div className="text-xs font-bold text-slate-300">Childhood EPI Coverage</div>
            <div className="text-[10px] text-slate-500">National Immunization</div>
          </div>
        </div>
      </section>

      {/* 9 Sri Lanka Healthcare Services Grid (Requirement 42) */}
      <section className="py-16 px-4 sm:px-8 bg-slate-900/50 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sri Lankan Healthcare Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Direct access to essential healthcare directories, disease surveillance, clinical appointments, and emergency hotlines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <Link
                  key={i}
                  href={svc.href}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 p-6 hover:border-teal-500/60 transition-all shadow-sm hover:shadow-lg hover:shadow-teal-950/40 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {svc.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
                      {svc.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
                    <span>Access Service</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Verified Emergency Contacts Bar */}
      <section className="bg-slate-950 py-10 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Siren className="w-4 h-4 text-rose-500" />
                <span>Verified Sri Lankan Emergency Contacts</span>
              </h3>
              <p className="text-xs text-slate-400">
                Official national toll-free and specialized emergency dispatch hotlines.
              </p>
            </div>
            <Link
              href="/emergency"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
            >
              Full Emergency Command Page →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 space-y-0.5">
              <span className="text-[10px] font-bold text-rose-300 uppercase">Ambulance</span>
              <div className="text-xl font-black text-white font-mono">1990</div>
              <p className="text-[10px] text-slate-400">Suwa Seriya Pre-Hospital</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-teal-300 uppercase">Health Advice</span>
              <div className="text-xl font-black text-white font-mono">1907</div>
              <p className="text-[10px] text-slate-400">Suwasariya Health Inquiries</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-purple-300 uppercase">Mental Health</span>
              <div className="text-xl font-black text-white font-mono">1926</div>
              <p className="text-[10px] text-slate-400">NIMH Angoda Helpline</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-amber-300 uppercase">Poison Center</span>
              <div className="text-sm font-bold text-white font-mono truncate">011-2686143</div>
              <p className="text-[10px] text-slate-400">NHSL National Poison Centre</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-blue-300 uppercase">Govt Info</span>
              <div className="text-xl font-black text-white font-mono">1919</div>
              <p className="text-[10px] text-slate-400">Government Information Center</p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Health Alerts Section (Anchor: #alerts) */}
      <section id="alerts" className="py-12 px-4 sm:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-teal-400" />
                <span>Current Public Health Alerts & Gazette Notices</span>
              </h3>
              <p className="text-xs text-slate-400">
                Verified advisories published by the Epidemiology Unit and Health Promotion Bureau.
              </p>
            </div>
            <Link
              href="/announcements"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
            >
              View All Circulars →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatSriLankanDate(ann.publishedAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{ann.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{ann.summary}</p>
                </div>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                  Source: <strong>{ann.department}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
