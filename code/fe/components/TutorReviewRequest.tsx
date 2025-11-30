import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const TutorReviewRequest = () => {
  const router = useRouter();
  const { session_id } = router.query;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);

  const [confirmPayload, setConfirmPayload] = useState({
    max_capacity: 0,
    is_public: false,
    final_location_link: "",
  });

  const [rejectReason, setRejectReason] = useState("");

  const [negotiatePayload, setNegotiatePayload] = useState({
    new_start_time: "",
    new_end_time: "",
    new_is_online: false,
    new_location: "",
    message: "",
  });

  useEffect(() => {
    if (!session_id) return;

    const fetchSessionDetails = async () => {
      try {
        const response = await axios.get(`/sessions/${session_id}`);
        setSession(response.data);
      } catch (err) {
        setError("Failed to load session details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [session_id]);

  const handleConfirm = async () => {
    try {
      await axios.put(`/sessions/${session_id}/confirm`, confirmPayload);
      alert("Session confirmed successfully.");
      router.push("/sessions");
    } catch (err) {
      alert("Failed to confirm session.");
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleReject = async () => {
    try {
      await axios.put(`/sessions/${session_id}/reject`, { reason: rejectReason });
      alert("Session rejected successfully.");
      router.push("/sessions");
    } catch (err) {
      alert("Failed to reject session.");
    } finally {
      setShowRejectModal(false);
    }
  };

  const handleNegotiate = async () => {
    try {
      await axios.post(`/sessions/${session_id}/negotiate`, negotiatePayload);
      alert("Negotiation proposed successfully.");
      router.push("/sessions");
    } catch (err) {
      alert("Failed to propose negotiation.");
    } finally {
      setShowNegotiateModal(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Review Booking Request</h1>

      {session && (
        <div>
          <p><strong>Course:</strong> {session.course_name}</p>
          <p><strong>Start Time:</strong> {session.start_time}</p>
          <p><strong>End Time:</strong> {session.end_time}</p>
          <p><strong>Preferred Format:</strong> {session.session_request_type}</p>
        </div>
      )}

      <button onClick={() => setShowConfirmModal(true)}>Confirm</button>
      <button onClick={() => setShowRejectModal(true)}>Reject</button>
      <button onClick={() => setShowNegotiateModal(true)}>Negotiate</button>

      {showConfirmModal && (
        <div>
          <h2>Confirm Session</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
            <label>
              Max Capacity:
              <input
                type="number"
                value={confirmPayload.max_capacity}
                onChange={(e) => setConfirmPayload({ ...confirmPayload, max_capacity: e.target.value })}
                required
              />
            </label>
            <label>
              Public Session:
              <input
                type="checkbox"
                checked={confirmPayload.is_public}
                onChange={(e) => setConfirmPayload({ ...confirmPayload, is_public: e.target.checked })}
              />
            </label>
            <label>
              Final Location Link:
              <input
                type="url"
                value={confirmPayload.final_location_link}
                onChange={(e) => setConfirmPayload({ ...confirmPayload, final_location_link: e.target.value })}
                required
              />
            </label>
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          </form>
        </div>
      )}

      {showRejectModal && (
        <div>
          <h2>Reject Session</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleReject(); }}>
            <label>
              Reason:
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </label>
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowRejectModal(false)}>Cancel</button>
          </form>
        </div>
      )}

      {showNegotiateModal && (
        <div>
          <h2>Propose Counter-Offer</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleNegotiate(); }}>
            <label>
              New Start Time:
              <input
                type="datetime-local"
                value={negotiatePayload.new_start_time}
                onChange={(e) => setNegotiatePayload({ ...negotiatePayload, new_start_time: e.target.value })}
                required
              />
            </label>
            <label>
              New End Time:
              <input
                type="datetime-local"
                value={negotiatePayload.new_end_time}
                onChange={(e) => setNegotiatePayload({ ...negotiatePayload, new_end_time: e.target.value })}
                required
              />
            </label>
            <label>
              Online Session:
              <input
                type="checkbox"
                checked={negotiatePayload.new_is_online}
                onChange={(e) => setNegotiatePayload({ ...negotiatePayload, new_is_online: e.target.checked })}
              />
            </label>
            <label>
              New Location:
              <input
                type="text"
                value={negotiatePayload.new_location}
                onChange={(e) => setNegotiatePayload({ ...negotiatePayload, new_location: e.target.value })}
                required
              />
            </label>
            <label>
              Message:
              <textarea
                value={negotiatePayload.message}
                onChange={(e) => setNegotiatePayload({ ...negotiatePayload, message: e.target.value })}
                required
              />
            </label>
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowNegotiateModal(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TutorReviewRequest;