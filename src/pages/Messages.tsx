import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, ArrowLeft, Check, X, Mail, BadgeCheck } from 'lucide-react';
import './Messages.css';

export const Messages = () => {
  const { users, currentUser, messages, messageRequests, sendMessage, acceptMessageRequest, rejectMessageRequest } = useAppContext();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [showRequests, setShowRequests] = useState(false);

  // Get pending requests for current user
  const pendingRequests = Object.values(messageRequests).filter(
    r => r.toId === currentUser?.id && r.status === 'pending'
  );

  // Get users with accepted requests (can message freely)
  const acceptedConnections = Object.values(messageRequests)
    .filter(r => r.status === 'accepted')
    .map(r => r.fromId === currentUser?.id ? r.toId : r.fromId)
    .filter(id => id !== currentUser?.id);

  // All messageable users (mutual follow or accepted request)
  const allMessageableUsers = Object.values(users).filter(u => {
    if (!currentUser || u.id === currentUser.id) return false;

    // Check if they follow each other
    const followsMe = u.following?.includes(currentUser.id);
    const iFollowThem = currentUser.following?.includes(u.id);

    // Check if they have accepted message request
    const hasAcceptedRequest = acceptedConnections.includes(u.id);

    // Check for pending request from them
    const hasPendingFromThem = pendingRequests.some(r => r.fromId === u.id);

    return followsMe && iFollowThem || hasAcceptedRequest || hasPendingFromThem;
  });

  const chatThread = activeChat ? (messages[activeChat] || []) : [];
  const activeUser = activeChat ? users[activeChat] : null;

  const handleSend = () => {
    if (!newMsg.trim() || !activeChat) return;
    sendMessage(activeChat, newMsg);
    setNewMsg('');
  };

  return (
    <div className="messages-page">
      {/* Inbox List */}
      <div className={`inbox-panel ${activeChat ? 'hidden-mobile' : ''}`}>
        <div className="inbox-header">
          <h2>Mensajes 💬</h2>
          {pendingRequests.length > 0 && (
            <button
              className="requests-badge"
              onClick={() => setShowRequests(!showRequests)}
            >
              <Mail size={16} />
              <span>{pendingRequests.length}</span>
            </button>
          )}
        </div>

        {/* Message Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="requests-section">
            <div
              className="requests-header"
              onClick={() => setShowRequests(!showRequests)}
            >
              <span>📨 Solicitudes de mensaje</span>
              <span className="requests-count">{pendingRequests.length} pendiente(s)</span>
            </div>

            {showRequests && (
              <div className="requests-list">
                {pendingRequests.map(req => {
                  const requester = users[req.fromId];
                  return (
                    <div key={req.id} className="request-item">
                      <img src={requester?.avatar} alt="" className="request-avatar" />
                      <div className="request-info">
                        <strong>u/{requester?.username?.replace(/^u\//, '')}</strong>
                        {requester?.isVerified && <BadgeCheck size={14} color="#1DA1F2" style={{ marginLeft: 4 }} />}
                        <p className="request-message">"{req.message}"</p>
                      </div>
                      <div className="request-actions">
                        <button
                          className="btn-accept"
                          onClick={() => acceptMessageRequest(req.id)}
                          title="Aceptar"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => rejectMessageRequest(req.id)}
                          title="Rechazar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Users List */}
        <div className="inbox-list">
          {allMessageableUsers.length === 0 ? (
            <div className="no-messages">
              <p>💌 No tienes conversaciones aún.</p>
              <p className="hint">Sigue a alguien para poder enviarle mensajes, o espera a que te envíen una solicitud.</p>
            </div>
          ) : (
            allMessageableUsers.map(u => {
              const thread = messages[u.id] || [];
              const lastMsg = thread[thread.length - 1];
              const hasPendingFromThem = pendingRequests.some(r => r.fromId === u.id);

              return (
                <div
                  key={u.id}
                  className={`inbox-item ${activeChat === u.id ? 'active' : ''} ${hasPendingFromThem ? 'has-pending' : ''}`}
                  onClick={() => setActiveChat(u.id)}
                >
                  <div className="inbox-avatar-wrapper">
                    <img src={u.avatar} alt={u.username} className="inbox-avatar" />
                    {hasPendingFromThem && (
                      <span className="pending-indicator" title="Solicitud pendiente">⏳</span>
                    )}
                  </div>
                  <div className="inbox-info">
                    <strong>u/{u.username?.replace(/^u\//, '')}</strong>
                    {u.isVerified && <BadgeCheck size={14} color="#1DA1F2" style={{ marginLeft: 4 }} />}
                    <span className="inbox-preview">
                      {lastMsg ? lastMsg.text.slice(0, 30) + '...' : hasPendingFromThem ? 'Solicitud pendiente...' : 'Inicia una conversación...'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className={`chat-panel ${!activeChat ? 'hidden-mobile' : ''}`}>
        {activeChat && activeUser ? (
          <>
            <div className="chat-header">
              <button className="back-btn" onClick={() => setActiveChat(null)}><ArrowLeft size={20} /></button>
              <img src={activeUser.avatar} alt={activeUser.username} className="chat-avatar" />
              <div>
                <strong>u/{activeUser.username?.replace(/^u\//, '')}</strong>
                {activeUser.isVerified && <BadgeCheck size={14} color="#1DA1F2" style={{ marginLeft: 4 }} />}
                <span className="online-dot">● En línea</span>
              </div>
            </div>
            <div className="messages-list">
              {chatThread.length === 0 ? (
                <div className="empty-chat">
                  <p>¡Inicia la conversación! 💕</p>
                  <p className="hint">Ya pueden mensajear libremente porque se siguen mutuamente.</p>
                </div>
              ) : (
                chatThread.map(msg => (
                  <div
                    key={msg.id}
                    className={`message-bubble ${currentUser && msg.fromId === currentUser.id ? 'mine' : 'theirs'}`}
                  >
                    <p>{msg.text}</p>
                    <span className="msg-time">{new Date(msg.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                placeholder="Escribe un mensaje... 💬"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className="send-btn" onClick={handleSend}><Send size={18} /></button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <span className="no-chat-icon">💌</span>
              <h3>Selecciona una conversación</h3>
              <p>Elige una usuaria de la lista para chatear.</p>
              <p className="hint">💡 Solo puedes mensajear a personas que sigues y que te siguen de vuelta, o que han aceptado tu solicitud de mensaje.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
