'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Siren, PhoneCall, Radio, AlertOctagon, HeartPulse, ShieldAlert,
  Clock, MapPin, Building2, ExternalLink, Info, CheckCircle2,
  AlertTriangle, Phone, Activity, Navigation, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { getHospitals } from '@/services/apiClient';
import { Hospital } from '@/types';
import { formatSriLankanPhone } from '@/lib/sriLankaGeo';

export default function EmergencyPage() {
  const hospitals = useMemo(() => getHospitals(), []);

  // Filter major trauma hospitals that have verified 24/7 emergency departments
  const traumaCenters = useMemo(() => {
    return hospitals.filter((h) => h.emergencyAvailable);
  }, [hospitals]);

  // Verified Sri Lankan Emergency Services
  const emergencyContacts = [
    {
      name: '1990 Suwa Seriya Free Ambulance',
      number: '1990',
      description: 'Nationwide 24/7 pre-hospital emergency medical service with trained emergency medical technicians (EMTs). Free island-wide service.',
      agency: '1990 Suwa Seriya Foundation (Act No. 18 of 2018)',
      badge: 'Primary Medical Emergency',
      urgent: true,
      color: 'border-rose-500/60 bg-rose-950/30',
    },
    {
      name: '1907 Suwasariya Health Tele-Advice',
      number: '1907',
      description: 'Ministry of Health 24/7 public health information, clinical guidance, and primary care referral directory.',
      agency: 'Health Promotion Bureau, Ministry of Health',
      badge: 'Telehealth & Advice',
      urgent: false,
      color: 'border-teal-500/60 bg-teal-950/30',
    },
    {
      name: '1926 National Mental Health Helpline',
      number: '1926',
      description: 'Toll-free 24/7 confidential crisis intervention, psychological first aid, and psychiatric support.',
      agency: 'National Institute of Mental Health (NIMH), Angoda',
      badge: 'Mental Health Crisis',
      urgent: false,
      color: 'border-purple-500/60 bg-purple-950/30',
    },
    {
      name: 'National Poison Information Centre (NHSL)',
      number: '011-2686143',
      description: 'Specialized 24/7 toxicological advice for snakebites, chemical ingestion, agrochemical poisoning, and medicinal overdoses.',
      agency: 'National Hospital of Sri Lanka, Colombo',
      badge: 'Toxicology & Snakebite',
      urgent: true,
      color: 'border-amber-500/60 bg-amber-950/30',
    },
    {
      name: '119 Police Emergency Service',
      number: '119',
      description: 'National police assistance for road accidents, physical violence, and public safety incidents.',
      agency: 'Sri Lanka Police Department',
      badge: 'Public Safety',
      urgent: false,
      color: 'border-blue-500/60 bg-blue-950/30',
    },
    {
      name: '110 Fire & Rescue Service',
      number: '110',
      description: 'Fire suppression, building collapse rescue, and hazardous material containment.',
      agency: 'Fire Service Department / Municipal Councils',
      badge: 'Fire & Rescue',
      urgent: false,
      color: 'border-orange-500/60 bg-orange-950/30',
    },
    {
      name: '1919 Government Information Center',
      number: '1919',
      description: 'Multi-lingual citizen directory for general public services, hospital contacts, and disaster inquiries.',
      agency: 'Government of Sri Lanka (GIC)',
      badge: 'Citizen Inquiries',
      urgent: false,
      color: 'border-slate-500/60 bg-slate-900',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* High-Urgency Primary Callout */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-slate-950 p-6 sm:p-8 text-white border-2 border-rose-600 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-bold border border-rose-500/40">
              <Siren className="w-4 h-4 animate-bounce" />
              <span>Immediate Medical Emergency?</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Dial 1990 for Suwa Seriya Ambulance
            </h1>

            <p className="text-sm sm:text-base text-rose-100 max-w-2xl leading-relaxed">
              Toll-free, island-wide pre-hospital emergency medical service. Immediate response with
              trained EMTs for road collisions, acute heart attacks, strokes, and trauma.
            </p>
          </div>

          <a
            href="tel:1990"
            className="px-6 py-4 rounded-xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xl flex items-center justify-center gap-2.5 shadow-xl transition-transform hover:scale-105 shrink-0"
          >
            <PhoneCall className="w-6 h-6" />
            <span>Call 1990 Now</span>
          </a>
        </div>
      </div>

      {/* Mandatory Telemetry Disclaimer (Requirement 24) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Emergency Network Notice:</strong> Live emergency network
          telemetry is not currently available. Real-time GPS ambulance positioning requires direct
          integration with the 1990 Suwa Seriya Computer-Aided Dispatch (CAD) system. In an urgent medical
          situation, <strong>always dial 1990 directly</strong> rather than relying on web browser status updates.
        </div>
      </div>

      {/* Verified Emergency Contacts Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Verified Sri Lankan Emergency Hotlines</span>
          </h2>
          <SourceBadge type="VERIFIED_OFFICIAL" size="sm" showDetails={false} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyContacts.map((svc) => (
            <div
              key={svc.number}
              className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between space-y-3 ${svc.color}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                    {svc.badge}
                  </span>
                  {svc.urgent && (
                    <span className="text-[10px] font-bold text-rose-400 animate-pulse flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" /> 24/7 Urgent
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">{svc.name}</h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Authority: <span className="text-slate-300">{svc.agency}</span>
                </div>

                <a
                  href={`tel:${svc.number.replace(/[\-\s]/g, '')}`}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>{svc.number}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Major 24/7 Government Trauma Centers */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Major Government Acute Trauma & Emergency Centers</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tertiary healthcare facilities equipped with 24/7 Emergency Treatment Units (ETU) and Intensive Care Units (ICU).
            </p>
          </div>

          <Link href="/find-care">
            <Button variant="outline" size="sm">
              View All Facilities →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {traumaCenters.slice(0, 6).map((hosp) => (
            <div
              key={hosp.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
            >
              <div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">
                  {hosp.categoryLabel || hosp.officialCategory}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {hosp.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {hosp.district} District ({hosp.region.replace('_', ' ')})
                </p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                {hosp.phone ? (
                  <a
                    href={`tel:${hosp.phone.replace(/\s+/g, '')}`}
                    className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> {formatSriLankanPhone(hosp.phone)}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Telephone unlisted in official dataset</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
