'use client';

import React from 'react';
import HospitalDetailView from '@/components/hospital/HospitalDetailView';

export default function KinniyaHospitalPage() {
  return <HospitalDetailView hospitalId="hosp-kinniya" isDedicatedKinniyaRoute={true} />;
}
