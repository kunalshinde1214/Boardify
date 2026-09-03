'use client';

import React, { useState, useMemo } from 'react';
import {
  PROFESSION_ROLES,
  PROFESSION_ASSETS,
  SHAPE_PRESETS,
  ProfessionAssetItem,
} from '@/lib/profession-assets';
import {
  X,
  Search,
  Sparkles,
  Database,
  Table2,
  Diamond,
  Hexagon,
  Circle,
  Square,
  Cloud,
  Layers,
  ArrowRight,
  Briefcase,
  Check,
} from 'lucide-react';
import { resolveBrandOrSignIcon } from '@/components/ui/BrandIcons';

interface ProfessionAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertAsset: (asset: ProfessionAssetItem) => void;
  onInsertShape: (shapeType: 'rectangle' | 'circle' | 'diamond' | 'cylinder' | 'hexagon' | 'cloud', name: string) => void;
  onInsertEntityTable: (tableName?: string) => void;
}

export function ProfessionAssetsModal({
  isOpen,
  onClose,
  onInsertAsset,
  onInsertShape,
  onInsertEntityTable,
}: ProfessionAssetsModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roles' | 'shapes' | 'erd'>('roles');

  const filteredAssets = useMemo(() => {
    return PROFESSION_ASSETS.filter(item => {
      const matchRole = selectedRole === 'all' || item.role === selectedRole;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.defaultTitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.defaultBody.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [selectedRole, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1A16]/50 backdrop-blur-xs animate-note-pop select-none">
      <div className="bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-[8px_8px_0_#1D1A16] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD4C2] bg-[#F4EFE4]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E24E1B] text-white flex items-center justify-center border border-[#1D1A16] shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Fraunces'] italic font-bold text-xl text-[#1D1A16]">
                Profession Assets & Shapes Studio
              </h2>
              <p className="text-xs text-[#6B6353]">
                Curated components, ER diagrams, and geometric shapes tailored for every discipline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#F4EFE4] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-[#DCD4C2] bg-[#FFFDF6] pb-2">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'roles', label: 'Profession Roles & Packs', icon: Briefcase },
              { id: 'shapes', label: 'Geometric Shapes', icon: Diamond },
              { id: 'erd', label: 'Entity-Relationship (ERD)', icon: Table2 },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1D1A16] text-[#F4EFE4] shadow-[2px_2px_0_#6B6353]'
                      : 'bg-[#F4EFE4] text-[#1D1A16] border border-[#DCD4C2] hover:bg-[#EAE2D2]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'roles' && (
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B6353]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search cards & assets..."
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-[#DCD4C2] bg-[#FFFDF6] outline-none focus:border-[#E24E1B]"
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[380px]">
          {/* TAB 1: PROFESSION ROLES */}
          {activeTab === 'roles' && (
            <div className="space-y-5">
              {/* Role filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {PROFESSION_ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedRole === r.id
                        ? 'bg-[#E24E1B] text-white shadow-xs'
                        : 'bg-[#F4EFE4] text-[#6B6353] hover:text-[#1D1A16] border border-[#DCD4C2]'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>

              {/* Asset grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredAssets.map(asset => {
                  const Icon = resolveBrandOrSignIcon(asset.logoType || asset.signType || asset.name);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        onInsertAsset(asset);
                        onClose();
                      }}
                      className="p-3.5 rounded-xl border-2 border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#FFE9A8]/40 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1D1A16] transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-[#6B6353] bg-[#F4EFE4] px-1.5 py-0.5 rounded border border-[#DCD4C2]">
                            {asset.category}
                          </span>
                          <span className="text-[10px] font-bold text-[#E24E1B] uppercase font-mono">
                            {asset.role}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          {Icon && <Icon size={16} className="shrink-0 text-[#E24E1B]" />}
                          <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[#1D1A16] group-hover:text-[#E24E1B] transition-colors line-clamp-1">
                            {asset.name}
                          </h4>
                        </div>

                        <p className="text-xs text-[#6B6353] line-clamp-2 leading-relaxed">
                          {asset.defaultBody}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#DCD4C2]/60 flex items-center justify-between text-[11px] font-bold text-[#1D1A16]">
                        <span className="text-[#6B6353] capitalize">{asset.nodeType} node</span>
                        <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[#E24E1B]">
                          Drop onto Canvas <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GEOMETRIC SHAPES */}
          {activeTab === 'shapes' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-['Fraunces'] italic font-bold text-base text-[#1D1A16]">
                  Standard Geometric & Flowchart Shapes
                </h3>
                <p className="text-xs text-[#6B6353]">
                  Click any geometric node to drop it on the canvas with 4-way connection ports.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {SHAPE_PRESETS.map(shape => {
                  return (
                    <div
                      key={shape.id}
                      onClick={() => {
                        onInsertShape(shape.shapeType, shape.name);
                        onClose();
                      }}
                      className="p-4 rounded-xl border-2 border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#FFE9A8]/40 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1D1A16] transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex flex-col items-center text-center p-3 mb-2">
                        {/* Shape preview glyph */}
                        <div
                          className={`w-16 h-12 border-2 border-[#1D1A16] shadow-xs flex items-center justify-center font-bold text-xs bg-[#FFE9A8] mb-2 ${
                            shape.shapeType === 'circle'
                              ? 'rounded-full w-14 h-14'
                              : shape.shapeType === 'diamond'
                              ? 'rotate-45 w-11 h-11'
                              : shape.shapeType === 'cylinder'
                              ? 'rounded-xl border-t-4'
                              : shape.shapeType === 'hexagon'
                              ? 'rounded-md [clip-path:polygon(20%_0%,80%_0%,100%_50%,80%_100%,20%_100%,0%_50%)]'
                              : shape.shapeType === 'cloud'
                              ? 'rounded-2xl border-dashed'
                              : 'rounded-lg'
                          }`}
                        />
                        <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[#1D1A16] group-hover:text-[#E24E1B]">
                          {shape.name}
                        </h4>
                        <p className="text-xs text-[#6B6353] mt-1 leading-relaxed">
                          {shape.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#DCD4C2]/60 flex items-center justify-center text-xs font-bold text-[#E24E1B]">
                        <span>Place Shape Node</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ER DIAGRAM ENTITY TABLES */}
          {activeTab === 'erd' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-['Fraunces'] italic font-bold text-base text-[#1D1A16]">
                  Entity-Relationship (ERD) SQL Tables
                </h3>
                <p className="text-xs text-[#6B6353]">
                  Drop interactive database tables with schema columns, Primary Key (PK), Foreign Key (FK), and types.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'users',
                    color: 'slate',
                    desc: 'User account & authentication table',
                    fields: ['id UUID PK', 'email VARCHAR', 'role VARCHAR', 'created_at TIMESTAMP'],
                  },
                  {
                    title: 'orders',
                    color: 'butter',
                    desc: 'Customer purchase orders table',
                    fields: ['id UUID PK', 'user_id UUID FK', 'total DECIMAL', 'status VARCHAR'],
                  },
                  {
                    title: 'products',
                    color: 'mint',
                    desc: 'Inventory catalog & SKU table',
                    fields: ['id UUID PK', 'sku VARCHAR', 'price DECIMAL', 'inventory INT'],
                  },
                  {
                    title: 'organizations',
                    color: 'lavender',
                    desc: 'Multi-tenant workspaces & teams',
                    fields: ['id UUID PK', 'name VARCHAR', 'plan VARCHAR', 'created_at TIMESTAMP'],
                  },
                  {
                    title: 'payments',
                    color: 'coral',
                    desc: 'Stripe transaction ledger',
                    fields: ['id UUID PK', 'order_id UUID FK', 'stripe_id VARCHAR', 'status VARCHAR'],
                  },
                  {
                    title: 'Custom Blank Table',
                    color: 'sage',
                    desc: 'Start with an empty schema table',
                    fields: ['id UUID PK', 'name VARCHAR', 'created_at TIMESTAMP'],
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onInsertEntityTable(item.title);
                      onClose();
                    }}
                    className="p-4 rounded-xl border-2 border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#FFE9A8]/40 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1D1A16] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Table2 className="w-4 h-4 text-[#E24E1B]" />
                          <span className="font-mono font-bold text-sm text-[#1D1A16]">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono bg-[#1D1A16] text-white px-1.5 py-0.5 rounded font-bold">
                          TABLE
                        </span>
                      </div>

                      <p className="text-xs text-[#6B6353] mb-3">{item.desc}</p>

                      {/* Mock field list */}
                      <div className="p-2 rounded bg-[#F4EFE4] border border-[#DCD4C2] font-mono text-[10px] space-y-1 text-[#403A2F]">
                        {item.fields.map((f, fIdx) => (
                          <div key={fIdx} className="flex items-center justify-between">
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#DCD4C2]/60 flex items-center justify-center text-xs font-bold text-[#E24E1B]">
                      <span>Insert ER Table</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
