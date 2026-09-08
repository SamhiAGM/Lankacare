'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Megaphone, Search, Plus, Calendar, Clock, Download,
  Pin, ShieldAlert, ArrowRight, FileText, CheckCircle2, User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAnnouncements, announcementService } from '@/services/apiClient';
import { Announcement, AnnouncementCategory, UserRole } from '@/types';
import { formatDateTime, formatDate } from '@/lib/utils';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeArticle, setActiveArticle] = useState<Announcement | null>(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newAnnounce, setNewAnnounce] = useState({
    title: '',
    summary: '',
    content: '',
    category: AnnouncementCategory.PUBLIC_HEALTH_ALERT,
    priority: 'HIGH' as const,
    department: 'Epidemiological Unit — Ministry of Health',
    author: user?.name || 'Dr. Asela Gunawardena, DGHS',
    isPinned: false,
  });

  useEffect(() => {
    setAnnouncements(getAnnouncements());
  }, []);

  const canPublish =
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.MINISTRY_ADMIN;

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase()) ||
        a.department.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || a.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [announcements, search, selectedCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounce.title || !newAnnounce.content) return;
    setIsSubmitting(true);
    try {
      const created = await announcementService.create(newAnnounce);
      setAnnouncements(getAnnouncements());
      toast.success(`${created.title}`, 'Announcement Gazetted & Published');
      setIsCreateOpen(false);
    } catch {
      toast.error('Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Official Ministry Gazettes & Public Announcements
            </h1>
            <Badge variant="teal">{filteredAnnouncements.length} Bulletins</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Democratic Socialist Republic of Sri Lanka • Official Communications & Circulars
          </p>
        </div>

        {canPublish && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Issue New Circular
          </Button>
        )}
      </div>

      {/* Search & Categories Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex items-center w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars, gazette bulletins, public advisories..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Circular Categories</option>
            {Object.values(AnnouncementCategory).map((cat) => (
              <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {filteredAnnouncements.map((a) => (
          <Card key={a.id} className="hover:border-teal-500/50 transition-all p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {a.isPinned && (
                  <Badge variant="rose" size="sm">
                    <Pin className="w-3 h-3 mr-1" /> Pinned Official
                  </Badge>
                )}
                <Badge
                  variant={
                    a.priority === 'CRITICAL'
                      ? 'rose'
                      : a.priority === 'HIGH'
                      ? 'amber'
                      : 'teal'
                  }
                  size="sm"
                >
                  {a.category.replace('_', ' ')}
                </Badge>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Published: {formatDateTime(a.publishedAt)}
                </span>
              </div>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                {a.department}
              </span>
            </div>

            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              {a.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {a.summary}
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Author: <strong>{a.author}</strong>
              </span>

              <button
                onClick={() => setActiveArticle(a)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 inline-flex items-center hover:underline cursor-pointer"
              >
                Read Official Communique <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Read Announcement Modal */}
      {activeArticle && (
        <Modal
          isOpen={!!activeArticle}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
          description={`${activeArticle.department} • Published ${formatDateTime(activeArticle.publishedAt)}`}
          size="lg"
        >
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs">
              <span className="font-bold">Summary: </span>
              {activeArticle.summary}
            </div>

            <div className="whitespace-pre-line space-y-3 font-normal leading-relaxed">
              {activeArticle.content}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Signatory: {activeArticle.author}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download / Print Gazette PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Announcement Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Draft & Publish Ministry Announcement"
          description="Official circulars are broadcasted to all hospitals, regional MOH offices, and the public landing page."
          size="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <Input
              label="Gazette / Notice Title"
              placeholder="e.g. Preventive Protocols for Vector Management"
              value={newAnnounce.title}
              onChange={(e) => setNewAnnounce({ ...newAnnounce, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Communique Category"
                value={newAnnounce.category}
                onChange={(e) => setNewAnnounce({ ...newAnnounce, category: e.target.value as any })}
                options={Object.values(AnnouncementCategory).map((c) => ({
                  value: c,
                  label: c.replace('_', ' '),
                }))}
              />

              <Select
                label="Priority Tier"
                value={newAnnounce.priority}
                onChange={(e) => setNewAnnounce({ ...newAnnounce, priority: e.target.value as any })}
                options={[
                  { value: 'NORMAL', label: 'NORMAL' },
                  { value: 'HIGH', label: 'HIGH' },
                  { value: 'CRITICAL', label: 'CRITICAL' },
                ]}
              />

              <Input
                label="Issuing Ministry Division"
                value={newAnnounce.department}
                onChange={(e) => setNewAnnounce({ ...newAnnounce, department: e.target.value })}
                required
              />

              <Input
                label="Authorizing Signatory"
                value={newAnnounce.author}
                onChange={(e) => setNewAnnounce({ ...newAnnounce, author: e.target.value })}
                required
              />
            </div>

            <Textarea
              label="Executive Summary"
              placeholder="1-2 sentences summarizing the communique..."
              value={newAnnounce.summary}
              onChange={(e) => setNewAnnounce({ ...newAnnounce, summary: e.target.value })}
              rows={2}
              required
            />

            <Textarea
              label="Full Official Gazette Body"
              placeholder="Full directive text including statutory references..."
              value={newAnnounce.content}
              onChange={(e) => setNewAnnounce({ ...newAnnounce, content: e.target.value })}
              rows={5}
              required
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinNotice"
                checked={newAnnounce.isPinned}
                onChange={(e) => setNewAnnounce({ ...newAnnounce, isPinned: e.target.checked })}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="pinNotice" className="font-semibold text-slate-700 dark:text-slate-300">
                Pin to top of public portal
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                Publish Official Communique
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </div>
    </RoleGuard>
  );
}
