'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Search,
  MapPin,
  FileText,
  Share2,
  Sliders,
  Check,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Smartphone,
  Monitor,
  Info,
  Building2,
  Key,
  Eye,
  MessageCircle,
  Copy,
} from 'lucide-react';
import { SeoConfig, PageSeoItem } from '@/lib/types';
import { saveSeoConfigAction } from '@/app/actions/store';
import { initialSeoConfig } from '@/lib/data/initial-data';

interface SeoManagerClientProps {
  initialConfig: SeoConfig;
  isMissingDbColumn?: boolean;
  isNotConnected?: boolean;
  dbError?: string;
}

export default function SeoManagerClient({
  initialConfig,
  isMissingDbColumn = false,
  isNotConnected = false,
  dbError,
}: SeoManagerClientProps) {
  const router = useRouter();
  const [config, setConfig] = useState<SeoConfig>(initialConfig || initialSeoConfig);
  const [activeTab, setActiveTab] = useState<'global' | 'pages' | 'keywords' | 'social' | 'technical'>('global');
  const [activePageKey, setActivePageKey] = useState<string>('home');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [customKeyword, setCustomKeyword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Suggested Kerala & Kottayam Keyword Clusters
  const keywordSuggestions = [
    {
      category: 'Kottayam Local Intent',
      badge: 'Local Search',
      keywords: [
        'boutique in kottayam',
        'designer boutique kottayam',
        'ladies boutique kottayam',
        'bridal boutique kottayam',
        'best boutique in kottayam',
        'boutique near me kottayam',
        'tailoring boutique kottayam',
      ],
    },
    {
      category: 'Bridal & Bespoke Couture',
      badge: 'High-Ticket',
      keywords: [
        'christian bridal wear kottayam',
        'designer wedding sarees kottayam',
        'bridal lehenga boutique kerala',
        'designer bridal blouse hand embroidery kottayam',
        'engagement dress kerala bride',
        'custom bridal couture kerala',
      ],
    },
    {
      category: 'Traditional & Festive Heritage',
      badge: 'Trending',
      keywords: [
        'kerala designer sarees',
        'onam kasavu sarees online',
        'banarasi silk saree kottayam',
        'festive kurtis kottayam',
        'party wear gowns kerala',
        'ready to wear sarees kerala',
      ],
    },
    {
      category: 'NRI Diaspora & Worldwide Shipping',
      badge: 'NRI Shopping',
      keywords: [
        'kerala boutique shipping to dubai',
        'nri kerala wedding shopping online',
        'custom christian wedding gown online india',
        'handloom kasavu saree online nri',
        'kerala bridal wear international shipping',
      ],
    },
  ];

  const handleGlobalChange = (field: keyof SeoConfig['global'], value: any) => {
    setConfig((prev) => {
      const nextGlobal = {
        ...prev.global,
        [field]: value,
      };
      let nextPages = prev.pages;
      if (field === 'site_title') {
        nextPages = {
          ...prev.pages,
          home: {
            ...(prev.pages?.home || { title: '', description: '', keywords: [] }),
            title: value,
          },
        };
      }
      if (field === 'meta_description') {
        nextPages = {
          ...nextPages,
          home: {
            ...(nextPages?.home || { title: '', description: '', keywords: [] }),
            description: value,
          },
        };
      }
      return {
        ...prev,
        global: nextGlobal,
        pages: nextPages,
      };
    });
    setIsDirty(true);
  };

  const handleLocalBusinessChange = (field: keyof SeoConfig['local_business'], value: any) => {
    setConfig((prev) => ({
      ...prev,
      local_business: {
        ...prev.local_business,
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handlePageChange = (pageKey: string, field: keyof PageSeoItem, value: any) => {
    setConfig((prev) => {
      const nextPages = {
        ...prev.pages,
        [pageKey]: {
          ...(prev.pages?.[pageKey] || { title: '', description: '', keywords: [] }),
          [field]: value,
        },
      };
      let nextGlobal = prev.global;
      if (pageKey === 'home') {
        if (field === 'title') {
          nextGlobal = { ...prev.global, site_title: value };
        } else if (field === 'description') {
          nextGlobal = { ...prev.global, meta_description: value };
        }
      }
      return {
        ...prev,
        global: nextGlobal,
        pages: nextPages,
      };
    });
    setIsDirty(true);
  };

  const handleSocialChange = (field: keyof SeoConfig['social'], value: any) => {
    setConfig((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleVerificationChange = (field: keyof SeoConfig['verification'], value: any) => {
    setConfig((prev) => ({
      ...prev,
      verification: {
        ...prev.verification,
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleCrawlChange = (field: keyof SeoConfig['crawl'], value: any) => {
    setConfig((prev) => ({
      ...prev,
      crawl: {
        ...prev.crawl,
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const addKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    if (config.global.keywords.includes(trimmed)) return;
    setConfig((prev) => ({
      ...prev,
      global: {
        ...prev.global,
        keywords: [...prev.global.keywords, trimmed],
      },
    }));
    setIsDirty(true);
  };

  const removeKeyword = (kw: string) => {
    setConfig((prev) => ({
      ...prev,
      global: {
        ...prev.global,
        keywords: prev.global.keywords.filter((k) => k !== kw),
      },
    }));
    setIsDirty(true);
  };

  const addCategoryKeywords = (keywords: string[]) => {
    const toAdd = keywords.filter((k) => !config.global.keywords.includes(k));
    if (toAdd.length === 0) return;
    setConfig((prev) => ({
      ...prev,
      global: {
        ...prev.global,
        keywords: [...prev.global.keywords, ...toAdd],
      },
    }));
    setIsDirty(true);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all SEO configurations to the recommended Kerala boutique defaults?')) {
      setConfig(initialSeoConfig);
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await saveSeoConfigAction(config);
      if (res.success) {
        setSaveStatus({
          type: 'success',
          message: 'SEO configuration saved & live storefront cache revalidated successfully!',
        });
        setIsDirty(false);
        router.refresh();
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setSaveStatus({
          type: 'error',
          message: res.error || 'Failed to save SEO settings',
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Error saving settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Google SERP Snippet Preview Data
  const serpTitle = config.global.site_title || 'Fairy Finds Boutique';
  const serpDescription =
    config.global.meta_description ||
    'Shop ready-to-wear dresses, sarees, and custom-made bespoke fashion from Fairy Finds Boutique in Kottayam, Kerala.';
  const serpUrl = config.global.canonical_base || 'https://fairyfindsboutique.store';

  return (
    <div className="space-y-6">
      {/* Header with Title and Global Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#FF55D2] font-bold">Discovery & Growth</span>
            {isDirty && (
              <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-xs">
                Unsaved Changes
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-semibold mt-1">
            SEO & Search Engine Control
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
            Fine-tune search engine visibility, Google Map pack signals for Kottayam & Kerala, Open Graph WhatsApp sharing cards, and page-specific meta tags.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to recommended defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-[#1A1A1A] hover:bg-[#FF55D2] disabled:bg-neutral-400 rounded-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save SEO Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Database Not Connected Warning Banner */}
      {isNotConnected && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 sm:p-5 rounded-xs shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900">
                Notice: Database Not Connected (Vercel Read-Only Mode)
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your store is running on Vercel without a database connection (Supabase). Because Vercel has a read-only filesystem, edits made in this admin panel cannot be saved permanently to disk.
                To enable live dashboard saving, add your <strong>Supabase environment variables</strong> in Vercel Project Settings. Alternatively, you can edit titles directly in the project codebase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Missing Column Migration Warning Banner */}
      {isMissingDbColumn && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 sm:p-5 rounded-xs shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900">
                Action Required: Supabase Database Migration Needed
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your production Supabase database is missing the <code className="bg-amber-200/70 px-1 py-0.5 rounded font-mono text-amber-950 font-bold">seo_config</code> column on the <code className="bg-amber-200/70 px-1 py-0.5 rounded font-mono text-amber-950 font-bold">store_settings</code> table.
                Updates saved here will <strong>not persist to your live storefront</strong> until you execute this 1-line SQL query in your <strong>Supabase Project → SQL Editor</strong>:
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 sm:pl-8">
            <code className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xs font-mono text-xs text-amber-950 select-all overflow-x-auto">
              ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT &apos;{}&apos;::jsonb;
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT '{}'::jsonb;");
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 3000);
              }}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Save Status Alert */}
      {saveStatus && (
        <div
          className={`p-4 rounded-xs text-xs font-medium space-y-2 transition-all ${
            saveStatus.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-2 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {saveStatus.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{saveStatus.message}</span>
          </div>

          {saveStatus.type === 'error' && saveStatus.message.includes('ALTER TABLE') && (
            <div className="pt-2 sm:pl-6 space-y-2">
              <p className="text-[11px] text-red-700">
                Run this command in your Supabase SQL Editor to enable SEO settings storage:
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="flex-1 px-3 py-1.5 bg-white border border-red-200 rounded-xs font-mono text-xs text-red-950 select-all overflow-x-auto">
                  ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT &apos;{}&apos;::jsonb;
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT '{}'::jsonb;");
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-neutral-200 pb-px scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'global'
              ? 'border-[#FF55D2] text-[#FF55D2] font-semibold bg-white'
              : 'border-transparent text-neutral-600 hover:text-[#1A1A1A] hover:border-neutral-300'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>1. Global & Local SEO</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'pages'
              ? 'border-[#FF55D2] text-[#FF55D2] font-semibold bg-white'
              : 'border-transparent text-neutral-600 hover:text-[#1A1A1A] hover:border-neutral-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>2. Page-by-Page Meta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('keywords')}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'keywords'
              ? 'border-[#FF55D2] text-[#FF55D2] font-semibold bg-white'
              : 'border-transparent text-neutral-600 hover:text-[#1A1A1A] hover:border-neutral-300'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>3. Kerala Keyword Bank</span>
          <span className="text-[10px] bg-pink-100 text-[#FF55D2] px-1.5 py-0.2 rounded-full font-bold">
            {config.global.keywords.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'social'
              ? 'border-[#FF55D2] text-[#FF55D2] font-semibold bg-white'
              : 'border-transparent text-neutral-600 hover:text-[#1A1A1A] hover:border-neutral-300'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>4. Social & WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'technical'
              ? 'border-[#FF55D2] text-[#FF55D2] font-semibold bg-white'
              : 'border-transparent text-neutral-600 hover:text-[#1A1A1A] hover:border-neutral-300'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>5. Search Console & Crawl</span>
        </button>
      </div>

      {/* TAB 1: Global & Local Boutique SEO */}
      {activeTab === 'global' && (
        <div className="space-y-6">
          {/* Live Google SERP Simulator */}
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#FF55D2]" />
                <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]">
                  Live Google Search Result Simulator
                </h2>
              </div>
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-xs border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 text-[11px] font-medium flex items-center gap-1 rounded-xs transition-colors cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 text-[11px] font-medium flex items-center gap-1 rounded-xs transition-colors cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Google Result Preview Box */}
            <div
              className={`p-4 bg-white border border-neutral-200 rounded-sm font-sans transition-all ${
                previewDevice === 'mobile' ? 'max-w-md mx-auto shadow-md' : 'max-w-2xl'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[9px] font-bold text-[#FF55D2]">
                  FF
                </div>
                <div className="text-[12px] text-neutral-700 leading-tight">
                  <div className="font-medium text-[#202124]">Fairy Finds Boutique</div>
                  <div className="text-[11px] text-[#4d5156] truncate">{serpUrl}</div>
                </div>
              </div>
              <h3 className="text-[17px] sm:text-[18px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug line-clamp-1">
                {serpTitle}
              </h3>
              <p className="text-[13px] text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
                {serpDescription}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-[#70757a]">
                <span>Neendoor, Kottayam</span>
                <span>•</span>
                <span>In Stock & Custom Couture</span>
                <span>•</span>
                <span>Ships across India</span>
              </div>
            </div>
          </div>

          {/* Store Meta Title & Description Settings */}
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FF55D2]" />
              <span>Primary Website Title & Meta Description</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Global Site Title
                </label>
                <input
                  type="text"
                  value={config.global.site_title}
                  onChange={(e) => handleGlobalChange('site_title', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="Fairy Finds Boutique | Luxury Women's Fashion & Bridal Boutique Kottayam, Kerala"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-neutral-400">
                  <span>Target length: 50–60 characters</span>
                  <span className={config.global.site_title.length > 60 ? 'text-amber-600 font-semibold' : ''}>
                    {config.global.site_title.length} chars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Title Suffix Template
                  </label>
                  <input
                    type="text"
                    value={config.global.title_template}
                    onChange={(e) => handleGlobalChange('title_template', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                    placeholder="%s | Fairy Finds Boutique"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    <code>%s</code> gets replaced with the individual page title.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Canonical Base URL
                  </label>
                  <input
                    type="url"
                    value={config.global.canonical_base}
                    onChange={(e) => handleGlobalChange('canonical_base', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                    placeholder="https://fairyfindsboutique.store"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Enforces single canonical domain to prevent duplicate indexing penalties.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Global Meta Description
                </label>
                <textarea
                  rows={3}
                  value={config.global.meta_description}
                  onChange={(e) => handleGlobalChange('meta_description', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="Shop ready-to-wear designer sarees, bridal lehengas, kurtis, and bespoke couture from Fairy Finds Boutique in Neendoor, Kottayam, Kerala..."
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-neutral-400">
                  <span>Recommended: 140–160 characters for maximum Google visibility</span>
                  <span
                    className={
                      config.global.meta_description.length > 160
                        ? 'text-amber-600 font-semibold'
                        : config.global.meta_description.length >= 120
                        ? 'text-emerald-600 font-semibold'
                        : ''
                    }
                  >
                    {config.global.meta_description.length} / 160 chars
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Local Map Pack & Physical Location Signals */}
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF55D2]" />
                <span>Central Kerala & Kottayam Map Pack Signals (LocalBusiness Schema)</span>
              </h2>
              <span className="text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 font-bold rounded-xs">
                Google Map Pack Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Business Legal Name
                </label>
                <input
                  type="text"
                  value={config.local_business.legal_name || config.local_business.name}
                  onChange={(e) => handleLocalBusinessChange('legal_name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="Fairy Finds Boutique"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={config.local_business.street_address}
                  onChange={(e) => handleLocalBusinessChange('street_address', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="Neendoor"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Locality / City
                </label>
                <input
                  type="text"
                  value={config.local_business.address_locality}
                  onChange={(e) => handleLocalBusinessChange('address_locality', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="Kottayam"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  State / Region & Postal Code
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={config.local_business.address_region}
                    onChange={(e) => handleLocalBusinessChange('address_region', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                    placeholder="Kerala"
                  />
                  <input
                    type="text"
                    value={config.local_business.postal_code}
                    onChange={(e) => handleLocalBusinessChange('postal_code', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                    placeholder="686601"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  GPS Latitude & Longitude (Coordinates)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={config.local_business.latitude}
                    onChange={(e) => handleLocalBusinessChange('latitude', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                    placeholder="9.6582"
                  />
                  <input
                    type="text"
                    value={config.local_business.longitude}
                    onChange={(e) => handleLocalBusinessChange('longitude', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                    placeholder="76.5445"
                  />
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Exact coordinates for Neendoor, Kottayam pin placement in Google Maps.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Operating Hours Specification
                </label>
                <input
                  type="text"
                  value={config.local_business.opening_hours}
                  onChange={(e) => handleLocalBusinessChange('opening_hours', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="Mo-Sa 10:00-19:00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Accepted Payment Methods (Schema Signal)
                </label>
                <input
                  type="text"
                  value={config.local_business.payment_accepted}
                  onChange={(e) => handleLocalBusinessChange('payment_accepted', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="Cash, UPI, GPay, PhonePe, Cards, Net Banking"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Price Range Indicator
                </label>
                <input
                  type="text"
                  value={config.local_business.price_range}
                  onChange={(e) => handleLocalBusinessChange('price_range', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="₹₹"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Page-Specific SEO */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] pb-3 border-b border-neutral-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF55D2]" />
                <span>Page-Specific Meta Overrides</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-normal">
                Customize titles & descriptions per major storefront route
              </span>
            </h2>

            {/* Google Crawl Delay Tip */}
            <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-semibold">Why didn't Google Search update right away?</span> Google saves a cached copy of your pages. When you update titles or meta descriptions, the changes are live on your website instantly, but Google only updates search results when its crawler revisits your page. To speed this up, paste your URL into <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline font-bold text-blue-700 hover:text-blue-900">Google Search Console</a> and click <strong>Request Indexing</strong>.
              </div>
            </div>

            {/* Sub-tabs for pages */}
            <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-neutral-100 scrollbar-none">
              {[
                { key: 'home', label: 'Homepage (/)', path: '/' },
                { key: 'shop', label: 'Shop Catalog (/shop)', path: '/shop' },
                { key: 'custom', label: 'Custom Atelier (/custom)', path: '/custom' },
                { key: 'about', label: 'About Story (/about)', path: '/about' },
                { key: 'contact', label: 'Contact (/contact)', path: '/contact' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setActivePageKey(p.key)}
                  className={`px-3 py-1.5 text-xs rounded-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activePageKey === p.key
                      ? 'bg-[#1A1A1A] text-white font-semibold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Current Selected Page Meta Inputs */}
            {(() => {
              const currentPage = config.pages?.[activePageKey] || {
                title: '',
                description: '',
                keywords: [],
              };

              return (
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Page Meta Title
                    </label>
                    <input
                      type="text"
                      value={currentPage.title}
                      onChange={(e) => handlePageChange(activePageKey, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                      placeholder={`Enter SEO title for ${activePageKey} page`}
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px] text-neutral-400">
                      <span>Will display in browser tab and search results</span>
                      <span>{currentPage.title.length} chars</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Page Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={currentPage.description}
                      onChange={(e) => handlePageChange(activePageKey, 'description', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                      placeholder={`Enter search description for ${activePageKey} page`}
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px] text-neutral-400">
                      <span>Target: 140–160 characters</span>
                      <span className={currentPage.description.length > 160 ? 'text-amber-600 font-semibold' : ''}>
                        {currentPage.description.length} / 160 chars
                      </span>
                    </div>
                  </div>

                  {/* Page Snippet Preview */}
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                      SERP Preview for this route:
                    </div>
                    <div className="text-[15px] font-medium text-[#1a0dab] line-clamp-1">
                      {currentPage.title || config.global.site_title}
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      {config.global.canonical_base}/{activePageKey === 'home' ? '' : activePageKey}
                    </div>
                    <div className="text-[12px] text-neutral-600 mt-1 line-clamp-2">
                      {currentPage.description || config.global.meta_description}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 3: Kerala & India Keyword Bank */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          {/* Active Site Keywords */}
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#FF55D2]" />
                <span>Active Target Keywords ({config.global.keywords.length})</span>
              </h2>
              <span className="text-[11px] text-neutral-500">
                Injected into global meta tags and JSON-LD structured data
              </span>
            </div>

            {/* Keyword Adder */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword(customKeyword);
                    setCustomKeyword('');
                  }
                }}
                className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                placeholder="Type a new keyword (e.g. 'bridal lehengas kottayam') and press Enter..."
              />
              <button
                type="button"
                onClick={() => {
                  addKeyword(customKeyword);
                  setCustomKeyword('');
                }}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Active Tags Flow */}
            <div className="flex flex-wrap gap-2 pt-2">
              {config.global.keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-full border border-neutral-200 transition-colors"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Categorized Regional Keyword Suggestion Clusters */}
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF55D2]" />
                <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]">
                  Curated Kerala & Kottayam High-Intent Keyword Bank
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Derived from heavy search volume research for Central Kerala fashion boutiques and NRI diaspora wedding shoppers. Click any pill to add to active keywords.
              </p>
            </div>

            <div className="space-y-4">
              {keywordSuggestions.map((cluster) => {
                const unaddedCount = cluster.keywords.filter((k) => !config.global.keywords.includes(k)).length;

                return (
                  <div key={cluster.category} className="p-4 bg-neutral-50 border border-neutral-200 rounded-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">{cluster.category}</span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-pink-50 text-[#FF55D2] border border-pink-200 font-semibold rounded-xs">
                          {cluster.badge}
                        </span>
                      </div>
                      {unaddedCount > 0 && (
                        <button
                          type="button"
                          onClick={() => addCategoryKeywords(cluster.keywords)}
                          className="text-[11px] font-semibold text-[#FF55D2] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add All ({unaddedCount})</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cluster.keywords.map((kw) => {
                        const isAdded = config.global.keywords.includes(kw);
                        return (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => (isAdded ? removeKeyword(kw) : addKeyword(kw))}
                            className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#FF55D2] hover:text-[#FF55D2]'
                            }`}
                          >
                            {isAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
                            <span>{kw}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Social Sharing & WhatsApp Preview (Open Graph) */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Live WhatsApp Link Preview Mockup */}
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-4">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]">
                Live WhatsApp Link Sharing Preview
              </h2>
            </div>

            <div className="max-w-md mx-auto bg-[#EFEAE2] p-4 rounded-lg shadow-inner">
              {/* WhatsApp Chat Bubble */}
              <div className="bg-white rounded-lg p-2.5 shadow-sm space-y-2 border border-neutral-200">
                <div className="text-[12px] text-[#00a884] font-medium truncate">
                  {config.global.canonical_base}
                </div>
                {/* OG Card in Chat */}
                <div className="border border-neutral-200 rounded overflow-hidden bg-neutral-50">
                  <div className="relative aspect-[1.91/1] w-full bg-neutral-900 flex items-center justify-center text-white">
                    {config.social.og_image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={config.social.og_image}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <span className="font-serif text-lg tracking-widest text-[#FF55D2] uppercase font-bold">
                          Fairy Finds
                        </span>
                        <div className="text-[11px] text-neutral-300">Neendoor, Kottayam</div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-neutral-50">
                    <h4 className="font-serif text-sm font-semibold text-neutral-900 line-clamp-1">
                      {config.social.og_title || config.global.site_title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-tight">
                      {config.social.og_description || config.global.meta_description}
                    </p>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-1">
                      fairyfindsboutique.store
                    </span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-neutral-400">10:42 AM ✓✓</div>
              </div>
            </div>
            <p className="text-xs text-neutral-500 text-center mt-3">
              This is how your boutique preview card appears when customers or NRIs share your link across WhatsApp groups.
            </p>
          </div>

          {/* Social OpenGraph Form */}
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#FF55D2]" />
              <span>Open Graph & Social Share Metadata</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Social Sharing Title (og:title)
                </label>
                <input
                  type="text"
                  value={config.social.og_title}
                  onChange={(e) => handleSocialChange('og_title', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="Fairy Finds Boutique | Artisanal Ready-to-Wear & Bespoke Couture"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Social Sharing Description (og:description)
                </label>
                <textarea
                  rows={2}
                  value={config.social.og_description}
                  onChange={(e) => handleSocialChange('og_description', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="Curated luxury fashion, artisanal ready-to-wear garments, and bespoke couture commissions from Neendoor, Kottayam, Kerala."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Social Banner Image URL (1200×630 recommended)
                </label>
                <input
                  type="text"
                  value={config.social.og_image}
                  onChange={(e) => handleSocialChange('og_image', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900"
                  placeholder="/og-image.jpg or full URL"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleSocialChange('og_image', '/og-image.jpg')}
                    className="text-[11px] px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xs cursor-pointer"
                  >
                    Use Default Atelier Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialChange('og_image', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200')}
                    className="text-[11px] px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xs cursor-pointer"
                  >
                    Use Crimson Silk Saree
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Search Console, Analytics & Crawl Directives */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          {/* Google Search Console & Analytics Verification */}
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FF55D2]" />
              <span>Search Console & Analytics Integration</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Google Search Console Verification Token
                </label>
                <input
                  type="text"
                  value={config.verification.google_site_verification || ''}
                  onChange={(e) => handleVerificationChange('google_site_verification', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900 font-mono text-xs"
                  placeholder="e.g. google1234567890abcdef or verification token"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Paste the content string from your Google Search Console HTML verification tag. It will automatically render into <code>&lt;meta name=&quot;google-site-verification&quot;&gt;</code>.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Bing Webmaster Tools Verification Token (Bing, Yahoo, DuckDuckGo, Copilot)
                </label>
                <input
                  type="text"
                  value={config.verification.bing_verification || ''}
                  onChange={(e) => handleVerificationChange('bing_verification', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900 font-mono text-xs"
                  placeholder="e.g. 1234567890ABCDEF1234567890ABCDEF or verification token"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Enables discovery and fast indexing on <strong>Bing, Microsoft Copilot, DuckDuckGo, and Yahoo</strong>. Renders into <code>&lt;meta name=&quot;msvalidate.01&quot;&gt;</code>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Google Analytics 4 (GA4) Measurement ID
                  </label>
                  <input
                    type="text"
                    value={config.verification.google_analytics_id || ''}
                    onChange={(e) => handleVerificationChange('google_analytics_id', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900 font-mono text-xs"
                    placeholder="G-XXXXXXXXXX"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Enables tracking traffic, conversions, and bounce rate across India & Gulf.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Meta (Facebook / Instagram) Pixel ID
                  </label>
                  <input
                    type="text"
                    value={config.verification.meta_pixel_id || ''}
                    onChange={(e) => handleVerificationChange('meta_pixel_id', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF55D2] bg-white text-neutral-900 font-mono text-xs"
                    placeholder="e.g. 123456789012345"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Tracks Instagram ad conversions and boutique campaign retargeting.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Crawl Directives & Master Indexing Control */}
          <div className="bg-white border border-neutral-200 rounded-xs p-5 shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FF55D2]" />
              <span>Search Engine Crawl & Indexing Directives</span>
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-900">Search Engine Indexing</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-xs ${
                      config.crawl.is_indexed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {config.crawl.is_indexed ? 'INDEX, FOLLOW (ACTIVE)' : 'NOINDEX, NOFOLLOW (BLOCKED)'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                  {config.crawl.is_indexed
                    ? 'Google, Bing, and other search engines are permitted to discover, index, and rank all public storefront and catalog pages.'
                    : 'Search engines are instructed NOT to index the site. Use only during major private staging reworks.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCrawlChange('is_indexed', !config.crawl.is_indexed)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer shrink-0 ${
                  config.crawl.is_indexed
                    ? 'bg-neutral-800 hover:bg-neutral-900 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {config.crawl.is_indexed ? 'Disable Indexing' : 'Enable Indexing'}
              </button>
            </div>

            {/* Sitemap, Robots & llms.txt Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 hover:border-[#FF55D2] rounded-xs flex items-center justify-between group transition-colors bg-white"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-400 group-hover:text-[#FF55D2]" />
                  <div>
                    <div className="text-xs font-semibold text-neutral-800">Dynamic XML Sitemap</div>
                    <div className="text-[11px] text-neutral-400">/sitemap.xml (All engines)</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#FF55D2]" />
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 hover:border-[#FF55D2] rounded-xs flex items-center justify-between group transition-colors bg-white"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-neutral-400 group-hover:text-[#FF55D2]" />
                  <div>
                    <div className="text-xs font-semibold text-neutral-800">Robots Directives</div>
                    <div className="text-[11px] text-neutral-400">/robots.txt (AI & search bots)</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#FF55D2]" />
              </a>

              <a
                href="/llms.txt"
                target="_blank"
                rel="noreferrer"
                className="p-3 border border-neutral-200 hover:border-[#FF55D2] rounded-xs flex items-center justify-between group transition-colors bg-white"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF55D2]" />
                  <div>
                    <div className="text-xs font-semibold text-neutral-800">AI Context Hub</div>
                    <div className="text-[11px] text-neutral-400">/llms.txt (ChatGPT & Perplexity)</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#FF55D2]" />
              </a>
            </div>

            {/* AI Search & GEO Card */}
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Generative Engine Optimization (GEO) & AI Search Status</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-200 text-purple-900 px-2 py-0.5 rounded-xs">
                  Active
                </span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed">
                Your storefront is configured with dedicated permissions and structured context for <strong>ChatGPT (GPTBot / SearchGPT), Perplexity AI, Claude (ClaudeBot), Microsoft Copilot (Bingbot), and Apple Intelligence</strong>.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { name: 'ChatGPT / SearchGPT', bot: 'GPTBot / OAI-SearchBot', status: 'Allowed' },
                  { name: 'Perplexity AI', bot: 'PerplexityBot', status: 'Allowed' },
                  { name: 'Microsoft Copilot & Bing', bot: 'Bingbot', status: 'Allowed' },
                  { name: 'Claude & Anthropic', bot: 'ClaudeBot', status: 'Allowed' },
                ].map((engine) => (
                  <div key={engine.name} className="bg-white/80 border border-purple-200/80 p-2 rounded-xs">
                    <div className="text-[11px] font-bold text-neutral-800">{engine.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">{engine.bot}</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {engine.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
