"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTodaySessionById } from "@/lib/sessionsToday";

interface PageProps {
  params: {
    id: string;
  };
}

export default function TutorSessionMeetingPage({ params }: PageProps) {
  const session = useMemo(() => getTodaySessionById(params.id), [params.id]);

  if (!session) {
    notFound();
    return null;
  }

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const downloadUrlRef = useRef<string | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingMessage, setRecordingMessage] = useState("The session is being recorded.");
  const [recordError, setRecordError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      setRecordError("Screen recording is not supported in this browser.");
      setRecordingMessage("");
      return;
    }

    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(captureStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        if (downloadUrlRef.current) {
          URL.revokeObjectURL(downloadUrlRef.current);
        }
        downloadUrlRef.current = url;
        setDownloadUrl(url);
        setRecordingMessage("Recording saved. You can download it below.");
        setIsRecording(false);
        captureStream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        streamRef.current = null;
      };

      recorderRef.current = mediaRecorder;
      streamRef.current = captureStream;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingMessage("The session is being recorded.");
      setRecordError(null);
    } catch (error) {
      console.error("Screen recording error", error);
      setRecordError("Screen recording permission denied. Recording disabled for this session.");
      setRecordingMessage("");
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      setRecordingMessage("Ending session… saving recording.");
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsRecording(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) {
        void startRecording();
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [startRecording]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/90">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">HCMUT Tutor Meet</p>
          <h1 className="text-lg font-semibold">{session.courseTitle ?? session.course}</h1>
          <p className="text-sm text-white/60">
            Session {session.id} · {session.time} · Student {session.student}
          </p>
        </div>
        <Link
          href="/tutor/sessions-today"
          className="text-sm text-white/70 hover:text-white transition"
        >
          ← Back to sessions
        </Link>
      </header>

      {recordingMessage && (
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-200 shadow-lg">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
          {recordingMessage}
        </div>
      )}

      {recordError && (
        <div className="absolute top-24 right-6 z-10 rounded-md bg-red-500/30 px-4 py-2 text-sm text-red-100 shadow-lg">
          {recordError}
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 pt-10">
        <div className="grid gap-4 w-full max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent)]" aria-hidden />
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <div className="text-sm uppercase tracking-wide text-white/60">You are presenting</div>
                <div className="text-4xl font-semibold">{session.course}</div>
                <div className="text-base text-white/70 max-w-md">
                  Share slides or code snippets while mentoring {session.student}. Meeting recording will be saved automatically when the class ends.
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white/70 text-sm">
                  {session.student.slice(-3).toUpperCase()}
                </div>
                <div>
                  <div className="text-base font-semibold">{session.student}</div>
                  <div className="text-sm text-white/60">Participant</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-90">
            {["Whiteboard", "Slide deck", "Code", "Q&A"].map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-center text-sm text-white/70"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 inset-x-0 flex flex-col items-center gap-4 pb-8">
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`session-${session.id}.webm`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20 transition"
          >
            ⬇️ Download recording
          </a>
        )}

        <div className="flex items-center gap-4 rounded-full bg-slate-900/80 px-6 py-3 border border-white/10 shadow-lg">
          <button
            type="button"
            className="h-12 w-12 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition"
            aria-label="Toggle microphone"
          >
            🎙️
          </button>
          <button
            type="button"
            className="h-12 w-12 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition"
            aria-label="Toggle camera"
          >
            🎥
          </button>
          <button
            type="button"
            onClick={stopRecording}
            className="h-12 w-24 rounded-full bg-red-600 text-white font-semibold hover:bg-red-500 transition"
          >
            {isRecording ? "End class" : "Class ended"}
          </button>
        </div>
      </footer>
    </div>
  );
}
