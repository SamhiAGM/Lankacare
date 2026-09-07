'use client';

import React, { use } from 'react';
import HospitalDetailView from '@/components/hospital/HospitalDetailView';

export default function HospitalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  return <HospitalDetailView hospitalId={id} />;
}
