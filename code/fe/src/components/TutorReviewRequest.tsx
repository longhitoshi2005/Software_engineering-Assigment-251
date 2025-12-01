"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { parseUTC } from "@/lib/dateUtils";
import { BASE_API_URL } from "@/config/env";

// --- Mini Data from List ---
interface SessionMiniData {
  id: string;
  student_id: string;
  student_name: string;
  course_code: string;
  course_name: string;
  start_time: string;
  end_time: string;
  status: string;
  session_request_type?: string;
  mode: string;
}

// --- Full Detail Data (fetched when needed) ---
interface SessionDetailData {
  id: string;
  tutor_id: string;
  tutor_name: string;
  student_id: string; 
  student_name: string; 
  course_code: string; 
  course_name: string;
  start_time: string;
  end_time: string;
  created_at: string; 
  mode: string;
  location: string | null; 
  status: string;
  session_request_type: "ONE_ON_ONE" | "PRIVATE_GROUP" | "PUBLIC_GROUP";
  max_capacity: number; 
  note?: string;
}

interface ConfirmPayload {
  topic: string;
  max_capacity: number;
  is_public: boolean;
  final_location_link: string;
}

interface NegotiatePayload {
  new_topic: string;
  new_start_time: string;
  new_end_time: string;
  new_mode?: string;
  new_location?: string;
  message: string;
  new_max_capacity?: number;
  new_is_public?: boolean;
}

interface RequestCardProps {
  sessionMiniData: SessionMiniData;
  onActionComplete?: () => void;
}

// --- Helper Functions ---
const getModeLabel = (mode: string) => {
  if (mode === 'ONLINE') return 'Online';
  if (mode === 'CAMPUS_1') return 'CS1';
  if (mode === 'CAMPUS_2') return 'CS2';
  return mode;
};

const getTypeLabel = (type?: string) => {
  if (!type) return 'One-On-One';
  if (type === 'ONE_ON_ONE') return 'One-On-One';
  if (type === 'PRIVATE_GROUP') return 'Private-Group';
  if (type === 'PUBLIC_GROUP') return 'Public-Group';
  return type;
};

// --- Component Logic ---
const RequestCard: React.FC<RequestCardProps> = ({ sessionMiniData, onActionComplete }) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Card UI state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<'confirm' | 'reject' | 'negotiate' | null>(null);
  
  // Detail data (fetched on demand)
  const [detailData, setDetailData] = useState<SessionDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Form payloads
  const [confirmPayload, setConfirmPayload] = useState<ConfirmPayload>({
    topic: "",
    max_capacity: 1,
    is_public: false,
    final_location_link: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [negotiatePayload, setNegotiatePayload] = useState<NegotiatePayload>({
    new_topic: "",
    new_start_time: "",
    new_end_time: "",
    new_mode: "ONLINE",
    new_location: "",
    message: "",
    new_max_capacity: 1,
    new_is_public: false,
  });

  // --- Fetch Detail Data ---
  const fetchDetailData = async () => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionMiniData.id}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to load detail");
      
      const data: SessionDetailData = await response.json();
      setDetailData(data);
      
      // Initialize form defaults
      const isPublicRequest = data.session_request_type === "PUBLIC_GROUP";
      const defaultCapacity = data.max_capacity > 1 ? data.max_capacity : 1;
      
      setConfirmPayload({
        topic: "",
        max_capacity: defaultCapacity,
        is_public: isPublicRequest,
        final_location_link: data.location || "",
      });
      
      const localStartTime = toZonedTime(data.start_time, timeZone).toISOString().substring(0, 16);
      const localEndTime = toZonedTime(data.end_time, timeZone).toISOString().substring(0, 16);
      
      setNegotiatePayload({
        new_topic: "",
        new_start_time: localStartTime,
        new_end_time: localEndTime,
        new_mode: data.mode,
        new_location: data.location || "",
        message: "",
        new_max_capacity: defaultCapacity,
        new_is_public: isPublicRequest,
      });
      
    } catch (error) {
      console.error("Failed to load detail:", error);
      alert("Failed to load session details");
    } finally {
      setLoadingDetail(false);
    }
  };

  // --- Event Handlers ---
  const handleCardClick = async () => {
    await fetchDetailData();
    setShowDetailModal(true);
  };

  const handleQuickAction = async (e: React.MouseEvent, action: 'confirm' | 'reject' | 'negotiate') => {
    e.stopPropagation();
    await fetchDetailData();
    setCurrentAction(action);
    setShowActionModal(true);
  };

  const closeAllModals = () => {
    setShowDetailModal(false);
    setShowActionModal(false);
    setCurrentAction(null);
    if (onActionComplete) onActionComplete();
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setCurrentAction(null);
    // Keep detail modal open if it was open
  };

  // --- Action Handlers ---
  const handleConfirm = async () => {
    if (!detailData) return;
    
    if (!confirmPayload.topic.trim()) {
      alert("Please enter a topic for this session.");
      return;
    }
    
    const isPublicRequest = detailData.session_request_type === "PUBLIC_GROUP";
    const finalPayload: ConfirmPayload = {
      topic: confirmPayload.topic,
      final_location_link: detailData.location || "",
      max_capacity: isPublicRequest ? Number(confirmPayload.max_capacity) : detailData.max_capacity,
      is_public: isPublicRequest,
    };
    
    if (finalPayload.max_capacity < 1) {
      alert("Please ensure capacity is at least 1.");
      return;
    }
    
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionMiniData.id}/confirm`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to confirm" }));
        const errorMessage = errorData.detail || "Failed to confirm session";
        throw new Error(errorMessage);
      }
      
      alert("Session confirmed successfully.");
      closeAllModals();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to confirm session.");
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionMiniData.id}/reject`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason || "No reason specified." }),
      });
      
      if (!response.ok) throw new Error("Failed to reject");
      
      alert("Session rejected successfully.");
      closeAllModals();
    } catch (error) {
      console.error(error);
      alert("Failed to reject session.");
    }
  };

  const handleNegotiate = async () => {
    if (!negotiatePayload.message) {
      alert("A message is required for proposing a change.");
      return;
    }
    
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionMiniData.id}/negotiate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...negotiatePayload,
          new_start_time: new Date(negotiatePayload.new_start_time).toISOString(),
          new_end_time: new Date(negotiatePayload.new_end_time).toISOString(),
          new_max_capacity: negotiatePayload.new_max_capacity ? Number(negotiatePayload.new_max_capacity) : undefined,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to propose negotiation");
      
      alert("Negotiation proposed successfully.");
      closeAllModals();
    } catch (error) {
      console.error(error);
      alert("Failed to propose negotiation.");
    }
  };

  // --- Rendering ---
  const sessionStartTime = parseUTC(sessionMiniData.start_time);
  const sessionEndTime = parseUTC(sessionMiniData.end_time);
  const isPending = sessionMiniData.status === 'WAITING_FOR_TUTOR';
  const isWaitingForStudent = sessionMiniData.status === 'WAITING_FOR_STUDENT';

  return (
    <>
      {/* --- CARD --- */}
      <article
        onClick={handleCardClick}
        className="border border-black/10 rounded-lg bg-white px-4 py-3 hover:shadow-md hover:border-light-blue transition cursor-pointer"
      >
        {/* Line 1: Time - Course */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-dark-blue">
              {format(sessionStartTime, 'dd/MM, HH:mm')}-{format(sessionEndTime, 'HH:mm')}
            </span>
            <span className="text-base font-medium text-dark-blue">
              {sessionMiniData.course_code} · {sessionMiniData.course_name}
            </span>
          </div>
          <span className="inline-flex items-center rounded-md bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 border border-amber-200">
            {isWaitingForStudent ? 'Waiting for Student' : 'Pending'}
          </span>
        </div>

        {/* Line 2: Student Info - Type - Mode + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-black/70">
            <span>{sessionMiniData.student_name} ({sessionMiniData.student_id})</span>
            <span>·</span>
            <span>{getTypeLabel(sessionMiniData.session_request_type)}</span>
            <span>·</span>
            <span>{getModeLabel(sessionMiniData.mode)}</span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-1 shrink-0">
            {isPending && (
              <>
                <button 
                  title="Confirm"
                  onClick={(e) => handleQuickAction(e, 'confirm')}
                  className="border text-black transition text-sm font-medium px-2 py-1 rounded-lg"
                >
                  Confirm
                </button>
                <button 
                  title="Reject"
                  onClick={(e) => handleQuickAction(e, 'reject')}
                  className="border text-black transition text-sm font-medium px-2 py-1 rounded-lg"
                >
                  Reject
                </button>
                <button 
                  title="Negotiate"
                  onClick={(e) => handleQuickAction(e, 'negotiate')}
                  className="border text-black transition text-sm font-medium px-2 py-1 rounded-lg"
                >
                  Negotiate
                </button>
              </>
            )}
            {isWaitingForStudent && (
              <span className="text-xs text-amber-600 italic px-2 py-1">
                Awaiting student response
              </span>
            )}
          </div>
        </div>
      </article>

      {/* --- DETAIL MODAL --- */}
      {showDetailModal && (
        <div className="modal-overlay" style={modalStyle} onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowDetailModal(false)} style={closeButtonStyle} className="hover:text-black">✕</button>
            
            {loadingDetail ? (
              <div>Loading details...</div>
            ) : detailData ? (
              <div>
                <h2>{detailData.student_name} ({detailData.student_id})</h2>
                <hr />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <strong>Course:</strong> {detailData.course_name} ({detailData.course_code})
                    <p><strong>Start Time:</strong> {format(parseUTC(detailData.start_time), 'MMM dd, HH:mm')}</p>
                    <p><strong>End Time:</strong> {format(parseUTC(detailData.end_time), 'HH:mm')}</p>
                  </div>

                  <div>
                    <strong>Status:</strong> <span style={{ color: isPending ? 'orange' : 'green' }}>{detailData.status.replace(/_/g, ' ')}</span>
                    <p><strong>Type:</strong> {getTypeLabel(detailData.session_request_type)}</p>
                    <p><strong>Mode:</strong> {getModeLabel(detailData.mode)}</p>
                    <p><strong>Location:</strong> {detailData.location || 'Not provided'}</p>
                  </div>
                </div>
                
                <div style={{ marginTop: '15px', padding: '10px', borderTop: '1px solid #eee' }}>
                  <strong>Student Notes:</strong> {detailData.note || 'No special requests.'}
                </div>
                
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <button 
                    style={{ backgroundColor: 'green', color: 'white', padding: '10px 15px', marginRight: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setCurrentAction('confirm'); setShowActionModal(true); }}
                    disabled={!isPending}
                  >Confirm</button>
                  <button 
                    style={{ backgroundColor: 'red', color: 'white', padding: '10px 15px', marginRight: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setCurrentAction('reject'); setShowActionModal(true); }}
                    disabled={!isPending}
                  >Reject</button>
                  <button 
                    style={{ backgroundColor: 'blue', color: 'white', padding: '10px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setCurrentAction('negotiate'); setShowActionModal(true); }}
                    disabled={!isPending}
                  >Negotiate</button>
                </div>
              </div>
            ) : (
              <div>Failed to load session details</div>
            )}
          </div>
        </div>
      )}

      {/* --- ACTION MODAL --- */}
      {showActionModal && currentAction && detailData && (
        <div className="modal-overlay" style={modalStyle} onClick={() => setShowActionModal(false)}>
          <div className="modal-content" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowActionModal(false)} style={closeButtonStyle} className="hover:text-black">✕</button>
            
            {currentAction === 'confirm' && (
              <div>
                <h2>Confirm Session</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
                  {/* Read-only session details */}
                  <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <p><strong>Student:</strong> {detailData.student_name} ({detailData.student_id})</p>
                    <p><strong>Course:</strong> {detailData.course_name} ({detailData.course_code})</p>
                    <p><strong>Time:</strong> {format(parseUTC(detailData.start_time), 'MMM dd, HH:mm')} - {format(parseUTC(detailData.end_time), 'HH:mm')}</p>
                    <p><strong>Mode:</strong> {getModeLabel(detailData.mode)}</p>
                    <p><strong>Location:</strong> {detailData.location || 'Not provided'}</p>
                    <p><strong>Type:</strong> {getTypeLabel(detailData.session_request_type)}</p>
                  </div>
                  
                  {/* Session Topic - required for confirmation */}
                  <label style={labelStyle}>
                    Session Topic: <span style={{ color: 'red' }}>*</span>
                    <input
                      type="text"
                      value={confirmPayload.topic}
                      onChange={(e) => setConfirmPayload({ ...confirmPayload, topic: e.target.value })}
                      placeholder="e.g., Introduction to Design Patterns"
                      required
                      style={inputStyle}
                    />
                  </label>
                  
                  {/* Max Capacity - editable only for PUBLIC_GROUP */}
                  <label style={labelStyle}>
                    Max Capacity: <span style={{ fontStyle: 'italic', color: '#666', fontSize:'small', fontWeight:'lighter'}}>(student requested {detailData.max_capacity})</span>
                    <input
                      type="number"
                      value={confirmPayload.max_capacity}
                      min={1}
                      max={detailData.max_capacity}
                      onChange={(e) => setConfirmPayload({ ...confirmPayload, max_capacity: Math.min(Number(e.target.value), detailData.max_capacity) })}
                      required
                      disabled={detailData.session_request_type !== "PUBLIC_GROUP"}
                      style={inputStyle}
                      title={detailData.session_request_type === "PUBLIC_GROUP" ? `Maximum allowed: ${detailData.max_capacity}` : "Read-only for this session type"}
                    />
                  </label>
                  
                  <button type="submit" style={submitButtonStyle}>Confirm Session</button>
                  <button type="button" onClick={closeActionModal} style={cancelButtonStyle}>Cancel</button>
                </form>
              </div>
            )}

            {currentAction === 'reject' && (
              <div>
                <h2>Reject Session</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleReject(); }}>
                  <label style={labelStyle}>
                    Reason:
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      style={{ ...inputStyle, minHeight: '80px' }}
                    />
                  </label>
                  
                  <button type="submit" style={submitButtonStyle}>Submit Rejection</button>
                  <button type="button" onClick={closeActionModal} style={cancelButtonStyle}>Cancel</button>
                </form>
              </div>
            )}

            {currentAction === 'negotiate' && (
              <div>
                <h2>Propose Counter-Offer</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleNegotiate(); }}>
                  <label style={labelStyle}>
                    Session Topic/Name (Required):
                    <input
                      type="text"
                      value={negotiatePayload.new_topic}
                      onChange={(e) => setNegotiatePayload({ ...negotiatePayload, new_topic: e.target.value })}
                      required
                      style={inputStyle}
                      placeholder="e.g., Introduction to React Hooks"
                    />
                  </label>
                  
                  <label style={labelStyle}>
                    New Start Time:
                    <input
                      type="datetime-local"
                      value={negotiatePayload.new_start_time}
                      onChange={(e) => setNegotiatePayload({ ...negotiatePayload, new_start_time: e.target.value })}
                      required
                      style={inputStyle}
                    />
                  </label>
                  
                  <label style={labelStyle}>
                    New End Time:
                    <input
                      type="datetime-local"
                      value={negotiatePayload.new_end_time}
                      onChange={(e) => setNegotiatePayload({ ...negotiatePayload, new_end_time: e.target.value })}
                      required
                      style={inputStyle}
                    />
                  </label>
                  
                  <label style={labelStyle}>
                    New Mode:
                    <select
                      value={negotiatePayload.new_mode}
                      onChange={(e) => setNegotiatePayload({ ...negotiatePayload, new_mode: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="ONLINE">Online</option>
                      <option value="CAMPUS_1">Campus 1</option>
                      <option value="CAMPUS_2">Campus 2</option>
                    </select>
                  </label>
                  
                  {/* Request Type Change */}
                  <label style={labelStyle}>
                    Request New Session Type:
                    <select
                      value={negotiatePayload.new_is_public ? 'PUBLIC_GROUP' : 'ONE_ON_ONE'}
                      onChange={(e) => {
                        const isPublic = e.target.value === 'PUBLIC_GROUP';
                        setNegotiatePayload({ 
                          ...negotiatePayload, 
                          new_is_public: isPublic,
                          new_max_capacity: isPublic ? (negotiatePayload.new_max_capacity || 5) : 1
                        });
                      }}
                      style={inputStyle}
                    >
                      <option value="ONE_ON_ONE">One-On-One</option>
                      <option value="PUBLIC_GROUP">Public Group</option>
                    </select>
                  </label>
                  
                  {/* Show max capacity if requesting public group */}
                  {negotiatePayload.new_is_public && (
                    <label style={labelStyle}>
                      Proposed Max Capacity:
                      <input
                        type="number"
                        min={2}
                        value={negotiatePayload.new_max_capacity || 5}
                        onChange={(e) => setNegotiatePayload({ ...negotiatePayload, new_max_capacity: Number(e.target.value) })}
                        style={inputStyle}
                      />
                    </label>
                  )}
                  
                  <label style={labelStyle}>
                    Message (Required):
                    <textarea
                      value={negotiatePayload.message}
                      onChange={(e) => setNegotiatePayload({ ...negotiatePayload, message: e.target.value })}
                      required
                      style={{ ...inputStyle, minHeight: '80px' }}
                      placeholder="Explain why you're proposing these changes..."
                    />
                  </label>
                  
                  <button type="submit" style={submitButtonStyle}>Submit Proposal</button>
                  <button type="button" onClick={closeActionModal} style={cancelButtonStyle}>Cancel</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RequestCard;

// --- Styles ---
const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '85vh',
  overflow: 'auto',
  position: 'relative'
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  right: '15px',
  border: 'none',
  background: 'transparent',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#666'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '15px',
  fontWeight: 'bold'
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '5px',
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px'
};

const submitButtonStyle: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '10px'
};

const cancelButtonStyle: React.CSSProperties = {
  backgroundColor: '#f44336',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};
