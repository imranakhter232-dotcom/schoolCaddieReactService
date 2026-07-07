import { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "../../../core/api/axiosInstance";
import { mediaUrl } from "../../../core/api/mediaUrl";
import dayjs from "dayjs";

// Teacher chat — uses chat/inbox/ and chat/messages/
const Communication = () => {
  const teacherId = localStorage.getItem("teacher_id");
  const roleId = localStorage.getItem("role_id");

  // Redirect students to the correct communication page
  useEffect(() => {
    if (roleId === "3") {
      window.location.href = "/academic/student-communication";
    }
  }, [roleId]);

  const [inbox, setInbox] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<any>(null);
  const inboxFetchedRef = useRef(false); // Prevent multiple inbox fetches

  // ── Fetch inbox (students in teacher's class) ──
  const fetchInbox = useCallback(async () => {
    if (inboxFetchedRef.current) return; // Prevent duplicate calls
    inboxFetchedRef.current = true;
    
    try {
      const res = await axiosInstance.get("chat/inbox/");
      setInbox(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Inbox error", err);
      inboxFetchedRef.current = false; // Allow retry on error
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  // ── Fetch messages for selected student ──
  const fetchMessages = useCallback(async (studentId: number) => {
    if (!teacherId) {
      console.error("Teacher ID not found");
      return;
    }
    try {
      console.log(`Fetching messages: teacher_id=${teacherId}, student_id=${studentId}`);
      const res = await axiosInstance.get(
        `chat/messages/?teacher_id=${teacherId}&student_id=${studentId}`
      );
      console.log("Messages received:", res.data);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Messages error", err);
    }
  }, [teacherId]);

  useEffect(() => { 
    fetchInbox(); 
    
    // Cleanup on unmount
    return () => {
      clearInterval(pollRef.current);
      inboxFetchedRef.current = false;
    };
  }, [fetchInbox]);

  // Poll every 4s when a student is selected
  useEffect(() => {
    clearInterval(pollRef.current);
    if (selected) {
      fetchMessages(selected.id);
      pollRef.current = setInterval(() => fetchMessages(selected.id), 4000);
    }
    return () => clearInterval(pollRef.current);
  }, [selected, fetchMessages]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = (student: any) => {
    setSelected(student);
    setMessages([]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selected || !teacherId) return;
    
    const messageText = text.trim();
    setText(""); // Clear input immediately
    setSending(true);
    
    try {
      console.log("Sending message:", {
        teacher: parseInt(teacherId),
        student: selected.id,
        message: messageText,
      });
      
      const response = await axiosInstance.post("chat/messages/", {
        teacher: parseInt(teacherId),
        student: selected.id,
        message: messageText,
      });
      
      console.log("Message sent successfully:", response.data);
      
      // Fetch messages immediately after sending
      await fetchMessages(selected.id);
    } catch (err) {
      console.error("Send error", err);
      setText(messageText); // Restore text on error
    } finally {
      setSending(false);
    }
  };

  const filtered = inbox.filter((s) =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="content" style={{ height: "calc(100vh - 60px)" }}>
        <div className="row g-0 h-100">

          {/* ── INBOX SIDEBAR ── */}
          <div className="col-xl-3 col-md-4 border-end d-flex flex-column" style={{ height: "100%" }}>
            <div className="p-3 border-bottom">
              <h5 className="fw-semibold mb-2">Messages</h5>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-0">
                  <i className="ti ti-search text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-grow-1 overflow-auto">
              {loadingInbox ? (
                <div className="text-center p-5">
                  <div className="spinner-border spinner-border-sm text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-muted p-5 small">No conversations yet</div>
              ) : (
                filtered.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className="d-flex align-items-center gap-3 px-3 py-3 border-bottom"
                    style={{
                      cursor: "pointer",
                      background: selected?.id === s.id ? "#f0f4ff" : "transparent",
                      borderLeft: selected?.id === s.id ? "3px solid #4a6fa5" : "3px solid transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <div className="flex-shrink-0">
                      {s.photo ? (
                        <img src={mediaUrl(s.photo)} className="rounded-circle"
                          style={{ width: 42, height: 42, objectFit: "cover" }} alt="" />
                      ) : (
                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: 42, height: 42, fontSize: 15, background: "linear-gradient(135deg,#4a6fa5,#6b8cce)" }}>
                          {s.first_name?.[0]}{s.last_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-medium text-dark text-truncate">
                        {s.first_name} {s.last_name}
                      </div>
                      <small className="text-muted">Grade {s.grade}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── CHAT WINDOW ── */}
          <div className="col-xl-9 col-md-8 d-flex flex-column" style={{ height: "100%" }}>
            {selected ? (
              <>
                {/* Header */}
                <div className="px-4 py-3 border-bottom d-flex align-items-center gap-3"
                  style={{ background: "#fff" }}>
                  {selected.photo ? (
                    <img src={mediaUrl(selected.photo)} className="rounded-circle"
                      style={{ width: 40, height: 40, objectFit: "cover" }} alt="" />
                  ) : (
                    <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{ width: 40, height: 40, fontSize: 14, background: "linear-gradient(135deg,#4a6fa5,#6b8cce)" }}>
                      {selected.first_name?.[0]}{selected.last_name?.[0]}
                    </div>
                  )}
                  <div>
                    <div className="fw-semibold">{selected.first_name} {selected.last_name}</div>
                    <small className="text-muted">Grade {selected.grade} · Student</small>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 overflow-auto p-4"
                  style={{ background: "#f8f9fb" }}>
                  {messages.length === 0 ? (
                    <div className="text-center text-muted mt-5 small">No messages yet. Say hello!</div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.sender_type === "teacher";
                      return (
                        <div key={i} className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                          <div style={{
                            maxWidth: "70%",
                            padding: "10px 14px",
                            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: isMe ? "linear-gradient(135deg,#4a6fa5,#6b8cce)" : "#fff",
                            color: isMe ? "#fff" : "#212529",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                            fontSize: 14,
                          }}>
                            <div>{msg.message}</div>
                            <div style={{ fontSize: 10, opacity: 0.7, textAlign: "right", marginTop: 4 }}>
                              {dayjs(msg.created_at).format("h:mm A")}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-top" style={{ background: "#fff" }}>
                  <form onSubmit={handleSend} className="d-flex gap-2 align-items-center">
                    <input
                      className="form-control"
                      style={{ borderRadius: 24, padding: "10px 18px", background: "#f0f2f5", border: "none" }}
                      placeholder="Type a message..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 44, height: 44 }}
                      disabled={sending || !text.trim()}
                    >
                      {sending
                        ? <span className="spinner-border spinner-border-sm" />
                        : <i className="ti ti-send" />}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <div style={{ fontSize: 56, opacity: 0.15 }}>💬</div>
                <p className="mt-2">Select a student to start chatting</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Communication;
