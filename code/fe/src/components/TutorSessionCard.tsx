import React from 'react';
import { format } from 'date-fns';
import { parseUTC } from '@/lib/dateUtils';

interface SessionCardProps {
  session: {
    id: string;
    course_code: string;
    course_name: string;
    start_time: string;
    end_time: string;
    mode: string;
    location?: string | null;
    session_request_type?: string;
    students: Array<{ id: string; full_name?: string; status?: string }>;
    max_capacity?: number;
    status: string;
  };
  onClick: () => void;
}

const TutorSessionCard: React.FC<SessionCardProps> = ({ session, onClick }) => {
  const startTime = parseUTC(session.start_time);
  const endTime = parseUTC(session.end_time);
  const activeStudents = session.students?.filter(s => s.status !== 'CANCELLED').length || 0;

  const getModeLabel = (mode: string) => {
    if (mode === 'ONLINE') return 'Online';
    if (mode === 'CAMPUS_1') return 'Campus 1';
    if (mode === 'CAMPUS_2') return 'Campus 2';
    return mode;
  };

  const getTypeLabel = (type?: string) => {
    if (!type) return 'One-on-One';
    if (type === 'ONE_ON_ONE') return 'One-on-One';
    if (type === 'PRIVATE_GROUP') return 'Private Group';
    if (type === 'PUBLIC_GROUP') return 'Public Group';
    return type;
  };

  const getStatusColor = (status: string) => {
    if (status === 'CONFIRMED') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'COMPLETED') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <article
      onClick={onClick}
      className="border border-black/10 rounded-lg bg-white p-4 hover:shadow-md hover:border-light-blue transition cursor-pointer"
    >
      {/* Time and Status */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-lg font-semibold text-dark-blue">
            {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
          </div>
          <div className="text-xs text-black/50">
            {format(startTime, 'EEE, MMM dd, yyyy')}
          </div>
        </div>
        <span className={`inline-flex items-center rounded-md text-xs font-semibold px-2 py-1 border ${getStatusColor(session.status)}`}>
          {session.status}
        </span>
      </div>

      {/* Course Info */}
      <div className="mb-2">
        <div className="font-semibold text-dark-blue">
          {session.course_code}
        </div>
        <div className="text-sm text-black/70">
          {session.course_name}
        </div>
      </div>

      {/* Session Details */}
      <div className="flex flex-wrap gap-2 text-xs text-black/60">
        <span className="inline-flex items-center gap-1">
          <span className="font-semibold">Type:</span>
          {getTypeLabel(session.session_request_type)}
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          <span className="font-semibold">Mode:</span>
          {getModeLabel(session.mode)}
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          <span className="font-semibold">Students:</span>
          {activeStudents}/{session.max_capacity || 1}
        </span>
      </div>

      {/* Location */}
      {session.location && (
        <div className="mt-2 text-xs text-black/60 truncate">
          <span className="font-semibold">Location:</span> {session.location}
        </div>
      )}
    </article>
  );
};

export default TutorSessionCard;
