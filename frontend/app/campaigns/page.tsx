'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flag, Plus, Calendar, Users, MapPin, CheckCircle2,
  ArrowRight, Sparkles, Target, BookOpen, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getCampaigns, campaignService } from '@/services/apiClient';
import { HealthCampaign, SriLankaRegion, UserRole } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';

export default function CampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState<HealthCampaign[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Chronic Disease Prevention',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    targetPopulation: 2000000,
    currentReach: 450000,
    regions: [SriLankaRegion.WESTERN, SriLankaRegion.CENTRAL],
    keyMessages: 'Prioritize physical activity 30 minutes daily.\nReduce added sugar and sodium intake.\nSchedule annual blood glucose checkups.',
    status: 'ACTIVE' as const,
  });

  useEffect(() => {
    setCampaigns(getCampaigns());
  }, []);

  const canManage =
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.MINISTRY_ADMIN;

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title) return;
    setIsSubmitting(true);
    try {
      const created = await campaignService.create({
        ...newCampaign,
        keyMessages: newCampaign.keyMessages.split('\n').filter((m) => m.trim().length > 0),
      });
      setCampaigns(getCampaigns());
      toast.success(`${created.title} campaign enrolled`, 'Campaign Published');
      setIsCreateOpen(false);
    } catch {
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              National Health Promotion & Awareness Campaigns
            </h1>
            <Badge variant="teal">{campaigns.length} Active Campaigns</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Democratic Socialist Republic of Sri Lanka • Health Promotion Bureau & Preventive Medicine
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Launch Health Campaign
          </Button>
        )}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <Card key={camp.id} className="overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="h-3 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {camp.category}
                    </span>
                    <Badge variant="emerald" size="sm">{camp.status}</Badge>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 italic mt-0.5 font-medium">
                    &ldquo;{camp.tagline}&rdquo;
                  </p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {camp.description}
                </p>

                {/* Progress bar */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-teal-600" /> Target Reach
                    </span>
                    <span className="text-teal-600 font-bold">{camp.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full"
                      style={{ width: `${camp.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Reach: <strong>{formatNumber(camp.currentReach)}</strong></span>
                    <span>Target: <strong>{formatNumber(camp.targetPopulation)}</strong></span>
                  </div>
                </div>

                {/* Key Guidance Messages */}
                {camp.keyMessages && camp.keyMessages.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Official Directives:
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {camp.keyMessages.slice(0, 2).map((msg, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{msg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(camp.startDate)} - {formatDate(camp.endDate)}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {camp.regions.length} Provinces Covered
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* New Campaign Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Launch Public Health Promotion Campaign"
          description="Mobilize regional health units, educational outreach, and media communications."
          size="lg"
        >
          <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Campaign Title"
                placeholder="e.g. National Salt Reduction Initiative"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                required
              />
              <Input
                label="Campaign Slogan / Tagline"
                placeholder="e.g. Less Salt, Longer Life"
                value={newCampaign.tagline}
                onChange={(e) => setNewCampaign({ ...newCampaign, tagline: e.target.value })}
                required
              />
              <Input
                label="Start Date"
                type="date"
                value={newCampaign.startDate}
                onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={newCampaign.endDate}
                onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                required
              />
              <Input
                label="Target Citizen Population"
                type="number"
                value={newCampaign.targetPopulation}
                onChange={(e) => setNewCampaign({ ...newCampaign, targetPopulation: parseInt(e.target.value) || 0 })}
                required
              />
              <Input
                label="Initial / Current Reach"
                type="number"
                value={newCampaign.currentReach}
                onChange={(e) => setNewCampaign({ ...newCampaign, currentReach: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <Textarea
              label="Detailed Campaign Overview"
              placeholder="Outline campaign objectives, target demographic groups, and inter-agency collaborations..."
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
              rows={3}
              required
            />

            <Textarea
              label="Key Guidance Messages (one per line)"
              placeholder="Enter core behavioral change directives..."
              value={newCampaign.keyMessages}
              onChange={(e) => setNewCampaign({ ...newCampaign, keyMessages: e.target.value })}
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                Publish Campaign
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
