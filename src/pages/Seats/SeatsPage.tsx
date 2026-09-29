import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { AuditoriumName, Seat } from '../../types';
import { auditoriumsList } from '../../data/mockSeats';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { SeatDetailDrawer } from '../../components/seats/SeatDetailDrawer';
import { SeatQRModal } from '../../components/seats/SeatQRModal';
import { BlockConfirmModal } from '../../components/seats/BlockConfirmModal';
import { useToast } from '../../context/ToastContext';
import {
  QrCode,
  Armchair,
  Download,
  Eye,
  RefreshCw,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
  Ban,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const SeatsPage: React.FC = () => {
  const { seats, batchGenerateQR, blockSeat, unblockSeat } = useAdmin();
  const { showToast } = useToast();

  const [selectedAudi, setSelectedAudi] = useState<AuditoriumName>('Audi 2');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual');

  // Selected seat for Drawer
  const [activeSeat, setActiveSeat] = useState<Seat | null>(null);

  // Selected seat for QR Modal
  const [qrModalSeat, setQrModalSeat] = useState<Seat | null>(null);

  // Selected seat for Block/Unblock Confirmation
  const [blockModalSeat, setBlockModalSeat] = useState<Seat | null>(null);

  // Currently focused seat ID (Yellow selected state)
  const [highlightedSeatId, setHighlightedSeatId] = useState<string | null>(null);

  // Hovered seat for tooltip
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Active auditorium configuration
  const currentAudiConfig = useMemo(() => {
    return auditoriumsList.find(a => a.name === selectedAudi) || auditoriumsList[0];
  }, [selectedAudi]);

  // Seats for current selected Audi
  const audiSeats = useMemo(() => {
    return seats.filter(s => s.auditorium === selectedAudi);
  }, [seats, selectedAudi]);

  // Filtered seats
  const filteredSeats = useMemo(() => {
    return audiSeats.filter(s => {
      const matchType = selectedType === 'All' || s.type === selectedType;
      const matchStatus =
        selectedStatus === 'All'
          ? true
          : selectedStatus === 'Occupied'
          ? s.status === 'Occupied' || s.status === 'Ordering'
          : s.status === selectedStatus;
      const matchSearch =
        s.seatNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.row.toLowerCase().includes(search.toLowerCase()) ||
        (s.currentOrder && s.currentOrder.customerName.toLowerCase().includes(search.toLowerCase())) ||
        (s.token && s.token.toLowerCase().includes(search.toLowerCase()));
      return matchType && matchStatus && matchSearch;
    });
  }, [audiSeats, selectedType, selectedStatus, search]);

  // Dynamic stats for active auditorium
  const stats = useMemo(() => {
    const total = audiSeats.length;
    const available = audiSeats.filter(s => s.status === 'Available').length;
    const occupied = audiSeats.filter(s => s.status === 'Occupied' || s.status === 'Ordering').length;
    const blocked = audiSeats.filter(s => s.status === 'Blocked').length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, available, occupied, blocked, occupancyRate };
  }, [audiSeats]);

  const handleSeatClick = (seat: Seat) => {
    setHighlightedSeatId(seat.id);
    setActiveSeat(seat);
  };

  const handleDownloadQR = (seat: Seat) => {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
      seat.qrUrl
    )}&color=0B0B0D`;
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `ASR-Cinema-${seat.auditorium.replace(/\s+/g, '')}-Seat-${seat.seatNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR Code Downloaded', `Saved QR plaque for ${seat.auditorium} • ${seat.seatNumber}`);
  };

  const handleOpenBlockConfirm = (seat: Seat) => {
    setBlockModalSeat(seat);
  };

  const handleConfirmBlockAction = (reason?: string) => {
    if (!blockModalSeat) return;
    if (blockModalSeat.status === 'Blocked') {
      unblockSeat(blockModalSeat.id);
    } else {
      blockSeat(blockModalSeat.id, reason);
    }
    // Update activeSeat if open
    if (activeSeat && activeSeat.id === blockModalSeat.id) {
      setActiveSeat(prev =>
        prev
          ? {
              ...prev,
              status: prev.status === 'Blocked' ? 'Available' : 'Blocked',
              qrStatus: prev.status === 'Blocked' ? 'Active' : 'Inactive'
            }
          : null
      );
    }
  };

  const handleSelectDemoB16 = () => {
    setSelectedAudi('Audi 2');
    setSelectedType('All');
    setSelectedStatus('All');
    setSearch('');
    const b16 = seats.find(s => s.auditorium === 'Audi 2' && s.seatNumber === 'B16');
    if (b16) {
      setHighlightedSeatId(b16.id);
      setActiveSeat(b16);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title & Top Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2
              style={{
                fontFamily: 'var(--font-brand)',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                lineHeight: 1.2
              }}
            >
              Seats & QR Management
            </h2>
            <span
              style={{
                backgroundColor: '#FEF2F2',
                color: 'var(--color-primary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 9999,
                border: '1px solid #FECACA'
              }}
            >
              Scan-to-Food
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Control physical theatre seat QR ordering links, live patron occupancy, and plaque downloads.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => batchGenerateQR(selectedAudi)}
            title={`Sync and verify QR codes for all seats in ${selectedAudi}`}
          >
            <RefreshCw size={15} />
            <span>Sync {selectedAudi} QR Batch</span>
          </button>

          {/* Quick Demo seat button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSelectDemoB16}
            style={{ boxShadow: '0 2px 10px rgba(227, 27, 35, 0.3)' }}
          >
            <Sparkles size={16} />
            <span>Demo Seat B16 (Audi 2)</span>
          </button>
        </div>
      </div>

      {/* Auditorium Cards / Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 14
        }}
      >
        {auditoriumsList.map(audi => {
          const isSelected = selectedAudi === audi.name;
          const audiSeatsCount = seats.filter(s => s.auditorium === audi.name);
          const avail = audiSeatsCount.filter(s => s.status === 'Available').length;
          const occ = audiSeatsCount.filter(s => s.status === 'Occupied' || s.status === 'Ordering').length;
          const blk = audiSeatsCount.filter(s => s.status === 'Blocked').length;

          return (
            <div
              key={audi.id}
              onClick={() => setSelectedAudi(audi.name)}
              className="card"
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                boxShadow: isSelected ? '0 6px 20px rgba(227, 27, 35, 0.12)' : 'var(--shadow-xs)',
                backgroundColor: isSelected ? '#FFFFFF' : '#FAFAFB',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: -9,
                    right: 14,
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    letterSpacing: '0.04em'
                  }}
                >
                  ACTIVE AUDI
                </div>
              )}

              {audi.name === 'Audi 2' && (
                <div
                  style={{
                    position: 'absolute',
                    top: isSelected ? 14 : 10,
                    right: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)'
                  }}
                >
                  <Sparkles size={11} />
                  <span>Demo Prime</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: isSelected ? 'var(--color-primary)' : '#E5E5E7',
                    color: isSelected ? '#FFFFFF' : '#0B0B0D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem'
                  }}
                >
                  <Armchair size={20} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    {audi.name}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {audi.screenType}
                  </div>
                </div>
              </div>

              {/* Counts Breakdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                  paddingTop: 10,
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '0.75rem',
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem' }}>Total</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{audiSeatsCount.length}</div>
                </div>
                <div>
                  <div style={{ color: '#059669', fontSize: '0.68rem', fontWeight: 600 }}>Avail</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#059669' }}>{avail}</div>
                </div>
                <div>
                  <div style={{ color: '#4B5563', fontSize: '0.68rem', fontWeight: 600 }}>Occ</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#4B5563' }}>{occ}</div>
                </div>
                <div>
                  <div style={{ color: '#DC2626', fontSize: '0.68rem', fontWeight: 600 }}>Block</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#DC2626' }}>{blk}</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: 'var(--color-text-muted)'
                }}
              >
                <span>{audi.soundSystem}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{audi.revenueSummary}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Cards for Active Audi */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14
        }}
      >
        <div className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total Seats ({selectedAudi})</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 800 }}>
              {stats.total}
            </div>
          </div>
          <Armchair size={24} color="var(--color-text-muted)" />
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Available Seats</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>
              {stats.available}
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 9999,
              backgroundColor: '#ECFDF5',
              color: '#059669'
            }}
          >
            Ready
          </span>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Occupied / Ordering</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 800, color: '#4B5563' }}>
              {stats.occupied}
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 9999,
              backgroundColor: '#F3F4F6',
              color: '#374151'
            }}
          >
            {stats.occupancyRate}% Full
          </span>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Blocked / Maintenance</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>
              {stats.blocked}
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 9999,
              backgroundColor: '#1F2937',
              color: '#F9FAFB'
            }}
          >
            Blocked
          </span>
        </div>
      </div>

      {/* Filter Bar & View Switcher */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SearchInput
            value={search}
            onChange={val => setSearch(val)}
            placeholder="Search seat number (e.g. B16, A01)..."
            width={240}
          />

          {/* Seat Type Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="All">All Seat Tiers</option>
            <option value="Premium Recliner">Premium Recliner (₹350)</option>
            <option value="Premium Platinum">Premium Platinum (₹250)</option>
            <option value="Premium Gold">Premium Gold (₹200)</option>
            <option value="Premium Lounger">Premium Lounger (₹250)</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied / Ordering</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* Legend & View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          {/* Status Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#10B981', display: 'inline-block' }} />
              Available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#EAB308', display: 'inline-block' }} />
              Selected
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#9CA3AF', display: 'inline-block' }} />
              Occupied
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#1F2937', display: 'inline-block' }} />
              Blocked
            </span>
          </div>

          {/* View Mode Switcher */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F6F6F7',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              style={{
                border: 'none',
                padding: '6px 12px',
                background: viewMode === 'visual' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'visual' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8125rem',
                fontWeight: 600,
                boxShadow: viewMode === 'visual' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <LayoutGrid size={15} />
              <span>Seat Layout</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                border: 'none',
                padding: '6px 12px',
                background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8125rem',
                fontWeight: 600,
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <List size={15} />
              <span>Table View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Seat Map or Table View */}
      {viewMode === 'visual' ? (
        <div
          className="card"
          style={{
            padding: '28px 24px',
            backgroundColor: '#FFFFFF',
            position: 'relative',
            overflowX: 'auto'
          }}
        >
          {/* Tooltip bar on hover */}
          <div
            style={{
              minHeight: 34,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 14px',
              backgroundColor: hoveredSeat ? '#FAFAFB' : 'transparent',
              borderRadius: 8,
              border: hoveredSeat ? '1px solid var(--color-border)' : '1px solid transparent',
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            {hoveredSeat ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>
                  {hoveredSeat.auditorium} • Seat {hoveredSeat.seatNumber}
                </span>
                <span style={{ color: 'var(--color-border)' }}>|</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{hoveredSeat.type}</span>
                <span style={{ color: 'var(--color-border)' }}>|</span>
                <span style={{ fontWeight: 700 }}>₹{hoveredSeat.price}</span>
                <span style={{ color: 'var(--color-border)' }}>|</span>
                <span>
                  Status: <strong>{hoveredSeat.status}</strong>
                </span>
                <span style={{ color: 'var(--color-border)' }}>|</span>
                <span>QR: {hoveredSeat.qrStatus}</span>
                {hoveredSeat.isDemo && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      backgroundColor: '#FEF2F2',
                      color: 'var(--color-primary)',
                      padding: '1px 6px',
                      borderRadius: 4
                    }}
                  >
                    ★ PRESERVED DEMO QR
                  </span>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                <HelpCircle size={14} />
                <span>Hover over any seat for tier & price SLA. Click to inspect, view QR plaque, or block.</span>
              </div>
            )}

            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              Showing {filteredSeats.length} of {audiSeats.length} seats
            </div>
          </div>

          {/* Special Preserved Demo Banner for Audi 2 */}
          {selectedAudi === 'Audi 2' && (
            <div
              style={{
                marginBottom: 20,
                padding: '12px 18px',
                borderRadius: 12,
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    Preserved Customer Demo Flow: Audi 2 • Seat B16
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#7F1D1D' }}>
                    Token: <code>audi2-b16</code> • Live customer order endpoint preserved and operational.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const b16 = seats.find(s => s.auditorium === 'Audi 2' && s.seatNumber === 'B16');
                    if (b16) setQrModalSeat(b16);
                  }}
                >
                  <Eye size={14} />
                  <span>Preview B16 QR</span>
                </button>
                <a
                  href="https://asr-cinema-scan-to-food.vercel.app/order/audi2-b16"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <ExternalLink size={14} />
                  <span>Launch Customer Web App</span>
                </a>
              </div>
            </div>
          )}

          {/* The Visual Theatre Seating Plan grouped by sections */}
          <div
            style={{
              minWidth: 700,
              maxWidth: 960,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 22
            }}
          >
            {currentAudiConfig.sections.map((section, secIdx) => {
              // Get rows belonging to this section
              const sectionRows = section.rows;

              return (
                <div
                  key={secIdx}
                  style={{
                    backgroundColor: '#FAFAFB',
                    border: '1px solid var(--color-border)',
                    borderRadius: 14,
                    padding: '16px 20px'
                  }}
                >
                  {/* Section Title Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 14,
                      paddingBottom: 8,
                      borderBottom: '1px dashed var(--color-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor:
                            section.type === 'Premium Recliner'
                              ? 'var(--color-primary)'
                              : section.type === 'Premium Platinum'
                              ? '#2563EB'
                              : section.type === 'Premium Gold'
                              ? '#D97706'
                              : '#7C3AED'
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-brand)',
                          fontWeight: 800,
                          fontSize: '0.875rem',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          color: 'var(--color-text-main)'
                        }}
                      >
                        {section.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-brand)',
                          fontWeight: 800,
                          fontSize: '0.875rem',
                          color: 'var(--color-primary)'
                        }}
                      >
                        ₹{section.price}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        ({section.seatsPerRow} seats/row)
                      </span>
                    </div>
                  </div>

                  {/* Rows inside this section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sectionRows.map(rowLetter => {
                      // Get seats for this row in this audi
                      const rowSeats = audiSeats
                        .filter(s => s.row === rowLetter)
                        .sort((a, b) => a.number - b.number);

                      // Split into Left and Right aisles
                      const half = Math.ceil(section.seatsPerRow / 2);
                      const leftSeats = rowSeats.filter(s => s.number <= half);
                      const rightSeats = rowSeats.filter(s => s.number > half && s.number <= section.seatsPerRow);

                      // Also check if there is a special demo seat in this row (like B16 in Audi 2)
                      const demoSeatsInRow = rowSeats.filter(s => s.isDemo);

                      return (
                        <div
                          key={rowLetter}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10
                          }}
                        >
                          {/* Row Label (Left) */}
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              backgroundColor: '#E5E5E7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              color: 'var(--color-text-secondary)',
                              flexShrink: 0
                            }}
                          >
                            {rowLetter}
                          </div>

                          {/* Left Bank */}
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                            {leftSeats.map(seat => renderSeatButton(seat))}
                          </div>

                          {/* Center Aisle Gap */}
                          <div
                            style={{
                              width: 32,
                              textAlign: 'center',
                              fontSize: '0.62rem',
                              color: 'var(--color-border)',
                              fontWeight: 700,
                              letterSpacing: '0.05em',
                              userSelect: 'none'
                            }}
                          >
                            AISLE
                          </div>

                          {/* Right Bank */}
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                            {rightSeats.map(seat => renderSeatButton(seat))}
                          </div>

                          {/* Row Label (Right) */}
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              backgroundColor: '#E5E5E7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              color: 'var(--color-text-secondary)',
                              flexShrink: 0
                            }}
                          >
                            {rowLetter}
                          </div>

                          {/* Attached Preserved Demo Seat for Row B */}
                          {demoSeatsInRow.length > 0 && (
                            <div style={{ marginLeft: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                                VIP:
                              </span>
                              {demoSeatsInRow.map(seat => renderSeatButton(seat))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Cinema Screen Indicator at BOTTOM */}
            <div style={{ marginTop: 24, padding: '0 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '85%',
                  height: 10,
                  backgroundColor: '#0B0B0D',
                  borderRadius: '0 0 999px 999px',
                  margin: '0 auto 12px auto',
                  boxShadow: '0 6px 18px rgba(227, 27, 35, 0.45)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -1,
                    left: '10%',
                    right: '10%',
                    height: 2,
                    backgroundColor: 'var(--color-primary)'
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  color: 'var(--color-text-muted)'
                }}
              >
                ◄ ◄ ◄ ALL EYES THIS WAY • {selectedAudi.toUpperCase()} SCREEN ({currentAudiConfig.screenType}) ► ► ►
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Seat</th>
                  <th>Auditorium</th>
                  <th>Tier / Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>QR Status</th>
                  <th>Token</th>
                  <th>Last Order</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSeats.map(seat => {
                  const isB16 = seat.auditorium === 'Audi 2' && seat.seatNumber === 'B16';

                  return (
                    <tr
                      key={seat.id}
                      style={{
                        backgroundColor: highlightedSeatId === seat.id ? '#FEF9C3' : undefined
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Armchair
                            size={16}
                            color={
                              isB16
                                ? 'var(--color-primary)'
                                : seat.status === 'Available'
                                ? '#10B981'
                                : seat.status === 'Blocked'
                                ? '#1F2937'
                                : '#6B7280'
                            }
                          />
                          <span
                            style={{
                              fontFamily: 'var(--font-brand)',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: isB16 ? 'var(--color-primary)' : 'var(--color-text-main)'
                            }}
                          >
                            {seat.seatNumber}
                          </span>
                          {isB16 && (
                            <span
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                backgroundColor: '#FEF2F2',
                                color: 'var(--color-primary)',
                                padding: '1px 6px',
                                borderRadius: 4
                              }}
                            >
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600 }}>{seat.auditorium}</span>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                          {seat.type}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{seat.price}</span>
                      </td>

                      <td>
                        <Badge
                          variant={
                            seat.status === 'Available'
                              ? 'available'
                              : seat.status === 'Occupied'
                              ? 'occupied'
                              : seat.status === 'Ordering'
                              ? 'pending'
                              : 'blocked'
                          }
                          label={seat.status}
                        />
                      </td>

                      <td>
                        <Badge variant={seat.qrStatus === 'Active' ? 'active' : 'inactive'} label={seat.qrStatus} />
                      </td>

                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}>
                          {seat.token || `audi2-${seat.seatNumber.toLowerCase()}`}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {seat.lastOrder || '—'}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Inspect Seat Details"
                            onClick={() => handleSeatClick(seat)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="View QR Plaque"
                            onClick={() => setQrModalSeat(seat)}
                          >
                            <QrCode size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Download Seat QR"
                            onClick={() => handleDownloadQR(seat)}
                          >
                            <Download size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title={seat.status === 'Blocked' ? 'Unblock Seat' : 'Block Seat'}
                            onClick={() => handleOpenBlockConfirm(seat)}
                            style={{
                              color: seat.status === 'Blocked' ? '#16A34A' : '#DC2626'
                            }}
                          >
                            {seat.status === 'Blocked' ? <CheckCircle size={14} /> : <Ban size={14} />}
                          </button>
                          <a
                            href={seat.qrUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Open Customer Scan Link"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seat Detail Drawer */}
      <SeatDetailDrawer
        seat={activeSeat}
        onClose={() => {
          setActiveSeat(null);
          setHighlightedSeatId(null);
        }}
        onViewQR={seat => setQrModalSeat(seat)}
        onOpenBlockModal={seat => handleOpenBlockConfirm(seat)}
      />

      {/* QR Preview Modal */}
      <SeatQRModal seat={qrModalSeat} isOpen={!!qrModalSeat} onClose={() => setQrModalSeat(null)} />

      {/* Block / Unblock Confirmation Modal */}
      <BlockConfirmModal
        seat={blockModalSeat}
        isOpen={!!blockModalSeat}
        onClose={() => setBlockModalSeat(null)}
        onConfirm={reason => handleConfirmBlockAction(reason)}
      />
    </div>
  );

  // Helper renderer for each seat card/button
  function renderSeatButton(seat: Seat) {
    const isSelected = highlightedSeatId === seat.id;
    const isB16 = seat.auditorium === 'Audi 2' && seat.seatNumber === 'B16';

    // Status colors conforming strictly to prompt:
    // Available = green
    // Selected = yellow
    // Occupied = grey
    // Blocked = dark/disabled
    let bgColor = '#ECFDF5';
    let borderColor = '#10B981';
    let textColor = '#065F46';

    if (seat.status === 'Blocked') {
      bgColor = '#1F2937';
      borderColor = '#111827';
      textColor = '#9CA3AF';
    } else if (seat.status === 'Occupied' || seat.status === 'Ordering') {
      bgColor = '#F3F4F6';
      borderColor = '#9CA3AF';
      textColor = '#4B5563';
    } else {
      // Available
      bgColor = '#ECFDF5';
      borderColor = '#10B981';
      textColor = '#065F46';
    }

    // Selected state overrides to yellow
    if (isSelected) {
      bgColor = '#FEF9C3';
      borderColor = '#EAB308';
      textColor = '#854D0E';
    }

    // B16 has red demo outline and accent
    if (isB16 && !isSelected) {
      borderColor = 'var(--color-primary)';
      bgColor = '#FEF2F2';
      textColor = 'var(--color-primary)';
    }

    return (
      <button
        key={seat.id}
        type="button"
        onClick={() => handleSeatClick(seat)}
        onMouseEnter={() => setHoveredSeat(seat)}
        onMouseLeave={() => setHoveredSeat(null)}
        style={{
          width: 36,
          height: 38,
          borderRadius: 8,
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
          color: textColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: 'all var(--transition-fast)',
          position: 'relative',
          transform: isSelected ? 'scale(1.12)' : 'none',
          boxShadow: isSelected
            ? '0 4px 12px rgba(234, 179, 8, 0.4)'
            : isB16
            ? '0 2px 8px rgba(227, 27, 35, 0.3)'
            : 'none',
          zIndex: isSelected ? 10 : 1
        }}
        title={`Seat ${seat.seatNumber} • ${seat.type} (₹${seat.price}) - ${seat.status}`}
      >
        {isB16 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              fontSize: '0.5rem',
              fontWeight: 900,
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              padding: '0 3px',
              borderRadius: 3
            }}
          >
            DEMO
          </span>
        )}

        <span
          style={{
            fontFamily: 'var(--font-brand)',
            fontSize: '0.75rem',
            fontWeight: 800,
            lineHeight: 1
          }}
        >
          {seat.number < 10 ? `0${seat.number}` : seat.number}
        </span>

        {/* Status dot */}
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            marginTop: 3,
            backgroundColor:
              seat.status === 'Available'
                ? '#10B981'
                : seat.status === 'Blocked'
                ? '#9CA3AF'
                : seat.status === 'Ordering'
                ? '#F59E0B'
                : '#6B7280'
          }}
        />
      </button>
    );
  }
};
