import { useAppContext } from '../context/AppContext';
import { Bell, Heart, MessageCircle, UserPlus, AlertTriangle } from 'lucide-react';
import './Notifications.css';

export const Notifications = () => {
  const { notifications, users, markNotificationRead } = useAppContext();

  // Sort: newest first
  const sorted = Object.values(notifications).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getIcon = (type: string) => {
    switch(type) {
      case 'like': return <Heart size={20} color="#ff4d6d" fill="#ff4d6d" />;
      case 'comment': return <MessageCircle size={20} color="#8b5cf6" fill="#8b5cf6" />;
      case 'follow': return <UserPlus size={20} color="#10b981" />;
      case 'alert': return <AlertTriangle size={20} color="#f59e0b" />;
      case 'message': return <MessageCircle size={20} color="#3b82f6" fill="#3b82f6" />;
      default: return <Bell size={20} color="#888" />;
    }
  };

  const getMessage = (type: string, senderName: string, customMsg?: string) => {
    if (customMsg) return customMsg;
    switch(type) {
      case 'like': return `A ${senderName} le gustó tu publicación.`;
      case 'comment': return `${senderName} comentó en tu publicación.`;
      case 'follow': return `${senderName} ha comenzado a seguirte.`;
      case 'message': return `${senderName} te ha enviado un mensaje.`;
      default: return 'Tienes una nueva notificación.';
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2><Bell size={24} color="var(--primary)"/> Notificaciones</h2>
      </div>
      <div className="notifications-list">
        {sorted.length === 0 && (
          <div className="empty-notifs">
            <Bell size={48} color="#ddd" />
            <p>No tienes notificaciones nuevas.<br/>¡Interactúa más con la comunidad! ✨</p>
          </div>
        )}
        {sorted.map(n => {
          const sender = users[n.senderId];
          const senderName = sender ? `@${sender.username}` : (n.senderId === 'system_modbot' ? 'ModBot' : 'Alguien');
          
          return (
            <div key={n.id} className={`notif-card ${!n.read ? 'unread' : ''}`} onClick={() => !n.read && markNotificationRead(n.id)}>
              <div className="notif-icon-wrapper">
                {getIcon(n.type)}
              </div>
              {sender && <img src={sender.avatar} alt="avatar" className="notif-avatar" />}
              <div className="notif-content">
                <p><strong>{senderName}</strong> {getMessage(n.type, '', n.message).replace(senderName, '')}</p>
                <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()} a las {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              {!n.read && <div className="unread-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
