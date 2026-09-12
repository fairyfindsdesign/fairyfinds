'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavItem, NavDropdownItem } from '@/lib/types';
import { saveNavigationAction } from '@/app/actions/store';
import {
  Menu,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface NavbarManagerClientProps {
  initialNavigation: NavItem[];
}

export default function NavbarManagerClient({
  initialNavigation,
}: NavbarManagerClientProps) {
  const router = useRouter();
  const [navigation, setNavigation] = useState<NavItem[]>(initialNavigation);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setNavigation(initialNavigation);
  }, [initialNavigation]);

  // New dropdown item form state
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);
  const [subLabel, setSubLabel] = useState('');
  const [subHref, setSubHref] = useState('');
  const [subDesc, setSubDesc] = useState('');

  // Editing state
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubLabel, setEditSubLabel] = useState('');
  const [editSubHref, setEditSubHref] = useState('');
  const [editSubDesc, setEditSubDesc] = useState('');

  const featuredNav = navigation.find((item) => item.isDropdown) || navigation[1];

  const handleSaveNavigation = async (updatedNav: NavItem[]) => {
    setIsSaving(true);
    setNavigation(updatedNav);
    try {
      await saveNavigationAction(updatedNav);
      router.refresh();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      console.error('Save navigation error:', err);
      alert(`Could not save navigation: ${err?.message || 'Database error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle top-level item visibility
  const toggleVisibility = (id: string) => {
    const updated = navigation.map((item) =>
      item.id === id ? { ...item, is_visible: !item.is_visible } : item
    );
    handleSaveNavigation(updated);
  };

  // Add new link to Featured dropdown
  const handleAddDropdownItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subLabel.trim() || !subHref.trim()) return;

    const newItem: NavDropdownItem = {
      id: `feat-${Date.now()}`,
      label: subLabel.trim(),
      href: subHref.trim(),
      description: subDesc.trim() || undefined,
    };

    const updated = navigation.map((item) => {
      if (item.id === featuredNav.id) {
        return {
          ...item,
          dropdownItems: [...(item.dropdownItems || []), newItem],
        };
      }
      return item;
    });

    handleSaveNavigation(updated);
    setSubLabel('');
    setSubHref('');
    setSubDesc('');
    setIsAddingSubItem(false);
  };

  // Delete link from Featured dropdown
  const handleDeleteDropdownItem = (subId: string) => {
    const updated = navigation.map((item) => {
      if (item.id === featuredNav.id) {
        return {
          ...item,
          dropdownItems: item.dropdownItems?.filter((sub) => sub.id !== subId),
        };
      }
      return item;
    });
    handleSaveNavigation(updated);
  };

  // Move dropdown item up
  const handleMoveSubUp = (index: number) => {
    if (index === 0) return;
    const items = [...(featuredNav.dropdownItems || [])];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;

    const updated = navigation.map((item) =>
      item.id === featuredNav.id ? { ...item, dropdownItems: items } : item
    );
    handleSaveNavigation(updated);
  };

  // Move dropdown item down
  const handleMoveSubDown = (index: number) => {
    const items = [...(featuredNav.dropdownItems || [])];
    if (index === items.length - 1) return;
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;

    const updated = navigation.map((item) =>
      item.id === featuredNav.id ? { ...item, dropdownItems: items } : item
    );
    handleSaveNavigation(updated);
  };

  // Start editing a dropdown item
  const startEditSubItem = (sub: NavDropdownItem) => {
    setEditingSubId(sub.id);
    setEditSubLabel(sub.label);
    setEditSubHref(sub.href);
    setEditSubDesc(sub.description || '');
  };

  // Save edit of a dropdown item
  const handleSaveSubItemEdit = (subId: string) => {
    const updated = navigation.map((item) => {
      if (item.id === featuredNav.id) {
        return {
          ...item,
          dropdownItems: item.dropdownItems?.map((sub) =>
            sub.id === subId
              ? {
                  ...sub,
                  label: editSubLabel.trim(),
                  href: editSubHref.trim(),
                  description: editSubDesc.trim() || undefined,
                }
              : sub
          ),
        };
      }
      return item;
    });

    handleSaveNavigation(updated);
    setEditingSubId(null);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] font-light">
            Navigation & Featured Dropdown CMS
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Customize the storefront navigation bar and manage all links inside the <strong>Featured</strong> dropdown menu.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Navigation Updated Live</span>
          </div>
        )}
      </div>

      {/* Primary Top-level Navigation Structure */}
      <div className="bg-white border border-neutral-200 p-6 shadow-xs space-y-4">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-neutral-800">
          Storefront Navigation Items
        </h2>
        <p className="text-xs text-neutral-500 font-light">
          Your public navbar displays: <strong>Home</strong>, <strong>Featured</strong> (with dropdown), <strong>About</strong>, and <strong>Contact</strong>. The owner login shortcut has been removed from the public storefront.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
          {navigation.map((item) => (
            <div
              key={item.id}
              className={`p-3 sm:p-3.5 border rounded-xs flex items-center justify-between transition-all ${
                item.is_visible
                  ? 'border-neutral-300 bg-neutral-50/60'
                  : 'border-neutral-200 opacity-50 bg-neutral-100'
              }`}
            >
              <div>
                <span className="font-sans text-sm font-medium text-[#1A1A1A] block">
                  {item.label}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {item.isDropdown ? 'Dropdown Menu' : item.href}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleVisibility(item.id)}
                className={`w-9 h-9 min-w-[36px] flex items-center justify-center border rounded-xs transition-colors active:scale-90 shrink-0 ${
                  item.is_visible
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'border-neutral-300 text-neutral-400 hover:bg-neutral-200'
                }`}
                title={item.is_visible ? 'Visible on Navbar' : 'Hidden from Navbar'}
              >
                {item.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Dropdown Items Manager */}
      <div className="bg-white border border-neutral-200 shadow-xs">
        <div className="p-5 sm:p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF55D2]" />
              <h2 className="font-serif text-lg font-medium text-[#1A1A1A]">
                "Featured" Dropdown Menu Items
              </h2>
            </div>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              These links appear in the elegant dropdown when customers hover or click "Featured".
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingSubItem(!isAddingSubItem)}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingSubItem ? 'Close Form' : 'Add Dropdown Link'}</span>
          </button>
        </div>

        {/* Add Dropdown Item Form */}
        {isAddingSubItem && (
          <form onSubmit={handleAddDropdownItem} className="p-6 bg-[#FAF9F6] border-b border-neutral-200 space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-800">
              New Dropdown Item
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
                  Menu Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal Silk Edit"
                  value={subLabel}
                  onChange={(e) => setSubLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /collections/red-saree or /shop"
                  value={subHref}
                  onChange={(e) => setSubHref(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
                Subtext Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Handcrafted festive silk drapes with gold zari"
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingSubItem(false)}
                className="w-full sm:w-auto min-h-[42px] px-4 py-2 border border-neutral-300 text-xs uppercase tracking-wider text-neutral-600 hover:bg-neutral-100 rounded-xs flex items-center justify-center active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto min-h-[42px] px-5 py-2 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold transition-colors rounded-xs active:scale-95 flex items-center justify-center shadow-xs"
              >
                Add to Dropdown
              </button>
            </div>
          </form>
        )}

        {/* Dropdown Items List */}
        <div className="divide-y divide-neutral-100">
          {(!featuredNav.dropdownItems || featuredNav.dropdownItems.length === 0) ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No items in the Featured dropdown. Click "Add Dropdown Link" to create one.
            </div>
          ) : (
            featuredNav.dropdownItems.map((sub, index) => {
              const isEditing = editingSubId === sub.id;

              return (
                <div key={sub.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-neutral-50/60 transition-colors">
                  {isEditing ? (
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editSubLabel}
                          onChange={(e) => setEditSubLabel(e.target.value)}
                          className="px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                          placeholder="Menu Label"
                        />
                        <input
                          type="text"
                          value={editSubHref}
                          onChange={(e) => setEditSubHref(e.target.value)}
                          className="px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                          placeholder="Link Destination"
                        />
                      </div>
                      <input
                        type="text"
                        value={editSubDesc}
                        onChange={(e) => setEditSubDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                        placeholder="Subtext Description"
                      />
                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingSubId(null)}
                          className="w-full sm:w-auto min-h-[38px] px-3 py-1.5 text-xs border border-neutral-300 hover:bg-neutral-100 rounded-xs active:scale-95 flex items-center justify-center"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveSubItemEdit(sub.id)}
                          className="w-full sm:w-auto min-h-[38px] px-4 py-1.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs font-semibold rounded-xs active:scale-95 flex items-center justify-center"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-neutral-100 text-neutral-600 text-xs font-semibold flex items-center justify-center rounded-xs shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans text-base font-medium text-[#1A1A1A]">
                            {sub.label}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-xs truncate">
                            {sub.href}
                          </span>
                        </div>
                        {sub.description && (
                          <p className="text-xs text-neutral-500 font-light mt-0.5 truncate">
                            {sub.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Move Up, Move Down, Edit, Delete Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1.5 self-end sm:self-auto pt-1 sm:pt-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveSubUp(index)}
                        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-600 active:scale-90 transition-transform"
                        title="Move item up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={index === (featuredNav.dropdownItems?.length || 0) - 1}
                        onClick={() => handleMoveSubDown(index)}
                        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-600 active:scale-90 transition-transform"
                        title="Move item down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditSubItem(sub)}
                        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-neutral-100 text-neutral-600 active:scale-90 transition-transform"
                        title="Edit link"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteDropdownItem(sub.id)}
                        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-red-50 text-neutral-400 hover:text-red-600 active:scale-90 transition-transform"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
