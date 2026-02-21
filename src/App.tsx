/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  PlusCircle, 
  Search, 
  UserPlus2, 
  Share2, 
  Link as LinkIcon, 
  Inbox, 
  User, 
  Video, 
  MoreHorizontal,
  LayoutGrid,
  FileText,
  Music,
  Settings,
  Database,
  ChevronRight,
  Circle,
  Shield,
  Play,
  Eye,
  EyeOff,
  Loader2,
  X,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { auth, user as gunUser, gun, getPrivateRoomId } from './services/gunService';

// --- Types ---

interface Friend {
  pub: string;
  alias: string;
  status: string;
  online?: boolean;
}

interface Message {
  id: string;
  msg: string;
  user: string;
  pub: string;
  time: number;
}

interface ServerIconProps {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
  badge?: number | boolean | string;
  onClick?: () => void;
}

const ServerIcon: React.FC<ServerIconProps> = ({ children, active, color, badge, onClick }) => (
  <div className="relative flex items-center justify-center mb-3">
    {active && <div className="absolute -left-3 w-1 h-8 bg-white rounded-r-full" />}
    <div 
      onClick={onClick}
      className={cn(
        "w-12 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer relative",
        active ? "rounded-[16px] bg-brand-accent text-black" : "rounded-full bg-discord-chat text-discord-text hover:rounded-[16px] hover:bg-brand-accent hover:text-black",
        color
      )}
    >
      {children}
      {badge && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-[3px] border-discord-servers flex items-center justify-center text-[10px] font-bold text-white">
          {typeof badge === 'number' || typeof badge === 'string' ? badge : ''}
        </div>
      )}
    </div>
  </div>
);

// --- Auth Overlay ---

const AuthOverlay = ({ onAuthSuccess }: { onAuthSuccess: (username: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await auth.login(username, password);
      } else {
        await auth.register(username, password);
        await auth.login(username, password);
      }
      onAuthSuccess(username);
    } catch (err: any) {
      setError(err || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#313338] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#5865F2] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#5865F2] rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-[#2B2D31] rounded-lg shadow-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Welcome back!' : 'Create an account'}
          </h1>
          <p className="text-[#B5BAC1] text-sm">
            {isLogin ? "We're so excited to see you again!" : "Join the mesh network today."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[12px] font-bold text-[#B5BAC1] uppercase mb-2 tracking-wide">
              Username
            </label>
            <input 
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1E1F22] text-white px-4 py-2.5 rounded border border-transparent focus:border-[#5865F2] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#B5BAC1] uppercase mb-2 tracking-wide">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1E1F22] text-white px-4 py-2.5 rounded border border-transparent focus:border-[#5865F2] outline-none transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B5BAC1] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[#F23F42] text-xs font-medium">{error}</p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {isLogin ? 'Log In' : 'Continue'}
          </button>

          <p className="text-sm text-[#B5BAC1]">
            {isLogin ? 'Need an account?' : 'Already have an account?'}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#00A8FC] hover:underline ml-1"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};

// --- Views ---

const HomeView = ({ onAddFriend }: { onAddFriend: () => void }) => (
  <div className="space-y-6">
    <section className="bg-discord-chat p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="font-bold text-lg mb-1 text-white">Expand your Mesh</h3>
        <p className="text-xs text-discord-muted mb-5 leading-relaxed max-w-[240px]">
          Connect with more nodes to strengthen the network. Share your unique access key.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onAddFriend}
            className="flex-1 bg-brand-accent h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-black hover:opacity-90 transition-opacity shadow-lg shadow-brand-accent/20"
          >
            <UserPlus2 size={18} />
            Add Friend
          </button>
          <button className="w-12 h-11 bg-discord-sidebar rounded-xl flex items-center justify-center text-discord-text hover:text-brand-accent border border-white/5 transition-all">
            <LinkIcon size={20} />
          </button>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl" />
    </section>

    <section>
      <h3 className="text-[10px] font-bold text-discord-muted uppercase tracking-[0.2em] mb-4 px-1">Network Status</h3>
      <div className="bg-discord-chat p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-sm font-medium text-white">Connected to Gun Relay</span>
        </div>
        <p className="text-[11px] text-discord-muted mt-2">Decentralized graph synchronization active.</p>
      </div>
    </section>
  </div>
);

const ChatView = ({ messages, currentUser, onSendMessage, title, placeholder, onAvatarClick }: { 
  messages: Message[], 
  currentUser: string, 
  onSendMessage: (msg: string) => void,
  title: string,
  placeholder: string,
  onAvatarClick: (user: string, pub: string) => void
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 space-y-6 flex flex-col-reverse overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageCircle size={48} className="text-discord-muted mb-4 opacity-20" />
            <p className="text-discord-muted text-sm">No messages in this mesh yet.</p>
          </div>
        ) : (
          messages.map((notif, i) => {
            const isMention = notif.msg?.includes(`@${currentUser}`);
            return (
              <div 
                key={notif.id || i} 
                className={cn(
                  "flex gap-4 group cursor-pointer p-2 rounded-xl transition-colors",
                  isMention ? "bg-brand-accent/5 border-l-2 border-brand-accent" : "hover:bg-white/5"
                )}
              >
                <div className="flex-shrink-0">
                  <div 
                    onClick={() => onAvatarClick(notif.user, notif.pub)}
                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-discord-servers border border-white/5 hover:border-brand-accent transition-all"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-brand-accent/20 to-indigo-500/20 flex items-center justify-center text-brand-accent font-bold">
                      {notif.user?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <h4 
                        onClick={() => onAvatarClick(notif.user, notif.pub)}
                        className="text-[13px] font-bold text-white leading-tight hover:underline"
                      >
                        {notif.user}
                      </h4>
                      {isMention && (
                        <span className="bg-brand-accent text-black text-[9px] font-black px-1 rounded uppercase">Mention</span>
                      )}
                    </div>
                    <span className="text-[11px] text-discord-muted whitespace-nowrap">
                      {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={cn(
                    "mt-1 text-[13px] whitespace-pre-line leading-relaxed",
                    isMention ? "text-brand-accent font-medium" : "text-discord-muted"
                  )}>
                    {notif.msg}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4">
        <div className="bg-discord-chat rounded-xl p-2 flex items-center gap-2 border border-white/5 shadow-2xl">
          <input 
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent text-white px-3 py-2 outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 bg-brand-accent text-black rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ username, pub, onLogout }: { username: string, pub: string, onLogout: () => void }) => {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(pub);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="relative mb-12">
        <div className="h-32 w-full bg-gradient-to-r from-brand-accent/20 to-indigo-900/40 rounded-3xl border border-white/5 shadow-inner" />
        <div className="absolute -bottom-10 left-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-[32px] bg-discord-servers flex items-center justify-center border-[6px] border-discord-sidebar shadow-2xl overflow-hidden">
              <User size={48} className="text-discord-muted" />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-brand-accent border-4 border-discord-sidebar rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">{username}</h2>
          <p className="text-xs text-discord-muted font-semibold uppercase tracking-widest mt-1">Status: Online & Synchronized</p>
        </div>
        <button 
          onClick={onLogout}
          className="text-xs text-rose-500 font-bold uppercase tracking-widest hover:underline"
        >
          Logout
        </button>
      </div>

      <section className="bg-discord-chat p-5 rounded-3xl border border-white/5 shadow-xl">
        <h3 className="text-[10px] font-bold text-discord-muted uppercase tracking-[0.2em] mb-3">Your Unique ID</h3>
        <div className="flex items-center gap-2 bg-discord-sidebar p-3 rounded-xl border border-white/5">
          <code className="text-[10px] text-brand-accent truncate flex-1">{pub}</code>
          <button onClick={copyId} className="text-discord-muted hover:text-white transition-colors">
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
        </div>
      </section>

      <section className="bg-discord-chat p-5 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-sm text-white">Vault Storage</h3>
          </div>
          <span className="text-[10px] font-bold text-brand-accent uppercase tracking-tighter bg-brand-accent/10 px-2 py-1 rounded-md">Unlimited</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-discord-sidebar rounded-full overflow-hidden border border-white/5">
            <div className="h-full w-[1%] bg-brand-accent shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-discord-muted uppercase tracking-wider">
            <span>0 GB Used</span>
            <span>Unlimited</span>
          </div>
        </div>
      </section>

      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-discord-muted uppercase tracking-[0.2em] mb-3 px-2">User Settings</h3>
        {[
          { icon: User, label: 'Account', sub: 'Profile, Email, Security' },
          { icon: Shield, label: 'Privacy', sub: 'Mesh Visibility, Encryption' },
          { icon: Inbox, label: 'Notifications', sub: 'Alerts, Mentions, Sounds' }
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between p-4 bg-discord-chat rounded-2xl border border-white/5 hover:border-brand-accent/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-discord-sidebar flex items-center justify-center text-discord-muted group-hover:text-brand-accent transition-colors">
                <item.icon size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors">{item.label}</p>
                <p className="text-[10px] text-discord-muted font-medium">{item.sub}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-discord-muted group-hover:text-brand-accent transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentPub, setCurrentPub] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [globalMessages, setGlobalMessages] = useState<Message[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Record<string, Message[]>>({});
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendIdInput, setFriendIdInput] = useState('');
  const [friendAliasInput, setFriendAliasInput] = useState('');
  const [popoutUser, setPopoutUser] = useState<{ user: string, pub: string } | null>(null);

  const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

  useEffect(() => {
    // Listen for auth changes
    gunUser.get('alias').on((alias: string) => {
      if (alias && gunUser.is) {
        setIsAuthenticated(true);
        setCurrentUser(alias);
        setCurrentPub(gunUser.is.pub);
      } else {
        setIsAuthenticated(false);
        setCurrentUser('');
        setCurrentPub('');
      }
      setIsCheckingAuth(false);
    });

    // Global Chat Listener
    gun.get('ma-mesh-global-chat-v1').map().on((data: any, id: string) => {
      if (data && data.msg) {
        setGlobalMessages(prev => {
          if (prev.find(m => m.id === id)) return prev;
          return [{ ...data, id }, ...prev].sort((a, b) => b.time - a.time);
        });
      }
    });

    // Friends Listener
    const friendsHandler = (data: any, id: string) => {
      if (data && data.status === 'friend') {
        setFriends(prev => {
          if (prev.find(f => f.pub === id)) return prev;
          return [...prev, { ...data, pub: id }];
        });

        // Listen for private messages for this friend
        if (gunUser.is) {
          const roomId = getPrivateRoomId(gunUser.is.pub, id);
          gun.get('ma-mesh-private-chats').get(roomId).map().on((msg: any, msgId: string) => {
            if (msg && msg.msg) {
              setPrivateMessages(prev => {
                const roomMsgs = prev[roomId] || [];
                if (roomMsgs.find(m => m.id === msgId)) return prev;
                return {
                  ...prev,
                  [roomId]: [{ ...msg, id: msgId }, ...roomMsgs].sort((a, b) => b.time - a.time)
                };
              });
            }
          });
        }
      }
    };

    if (gunUser.is) {
      gunUser.get('friends').map().on(friendsHandler);
    }

    return () => {};
  }, [isAuthenticated]);

  const handleSendMessage = (text: string) => {
    if (!gunUser.is) return;
    const messageData = {
      msg: text,
      user: currentUser,
      pub: gunUser.is.pub,
      time: Date.now(),
    };
    gun.get('ma-mesh-global-chat-v1').set(messageData);
  };

  const handleSendPrivateMessage = (text: string) => {
    if (!gunUser.is || !selectedFriend) return;
    const roomId = getPrivateRoomId(gunUser.is.pub, selectedFriend.pub);
    const messageData = {
      msg: text,
      user: currentUser,
      pub: gunUser.is.pub,
      time: Date.now(),
    };
    gun.get('ma-mesh-private-chats').get(roomId).set(messageData);
  };

  const handleAddFriend = () => {
    if (!friendIdInput.trim() || !friendAliasInput.trim()) return;
    auth.addFriend(friendIdInput, friendAliasInput);
    setFriendIdInput('');
    setFriendAliasInput('');
    setShowAddFriend(false);
  };

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setCurrentUser('');
    setCurrentPub('');
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-full bg-[#313338] flex items-center justify-center">
        <Loader2 size={48} className="text-[#5865F2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-discord-servers overflow-hidden font-sans text-discord-text select-none">
      
      <AnimatePresence>
        {!isAuthenticated && (
          <AuthOverlay onAuthSuccess={(user) => {
            setIsAuthenticated(true);
            setCurrentUser(user);
          }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {popoutUser && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPopoutUser(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-[300px] bg-discord-servers rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-10"
            >
              <div className="h-16 bg-gradient-to-r from-brand-accent/40 to-indigo-600/40" />
              <div className="px-4 pb-6 relative">
                <div className="absolute -top-8 left-4">
                  <div className="w-20 h-20 rounded-[24px] bg-discord-servers flex items-center justify-center border-[6px] border-discord-servers shadow-xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-brand-accent/20 to-indigo-500/20 flex items-center justify-center text-brand-accent text-2xl font-bold">
                      {popoutUser.user[0].toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="mt-14">
                  <h3 className="text-xl font-bold text-white">{popoutUser.user}</h3>
                  <p className="text-[10px] text-discord-muted font-bold uppercase tracking-widest mt-1">Mesh Node</p>
                  
                  <div className="mt-4 p-3 bg-discord-sidebar rounded-xl border border-white/5">
                    <p className="text-[9px] font-bold text-discord-muted uppercase mb-1">Public Key</p>
                    <p className="text-[9px] text-brand-accent break-all font-mono">{popoutUser.pub}</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    {friends.find(f => f.pub === popoutUser.pub) ? (
                      <button 
                        onClick={() => {
                          setSelectedFriend(friends.find(f => f.pub === popoutUser.pub)!);
                          setActiveTab('private');
                          setPopoutUser(null);
                        }}
                        className="w-full bg-brand-accent text-black font-bold py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                      >
                        Message
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setFriendIdInput(popoutUser.pub);
                          setFriendAliasInput(popoutUser.user);
                          setShowAddFriend(true);
                          setPopoutUser(null);
                        }}
                        className="w-full bg-brand-accent text-black font-bold py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddFriend && (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-discord-sidebar rounded-3xl p-6 shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Add Mesh Node</h2>
                <button onClick={() => setShowAddFriend(false)} className="text-discord-muted hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-discord-muted uppercase tracking-widest mb-2">Node Alias</label>
                  <input 
                    type="text"
                    value={friendAliasInput}
                    onChange={(e) => setFriendAliasInput(e.target.value)}
                    placeholder="e.g. Cipher_Node"
                    className="w-full bg-discord-servers text-white px-4 py-3 rounded-xl border border-white/5 focus:border-brand-accent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-discord-muted uppercase tracking-widest mb-2">Unique ID (Public Key)</label>
                  <input 
                    type="text"
                    value={friendIdInput}
                    onChange={(e) => setFriendIdInput(e.target.value)}
                    placeholder="Paste public key here..."
                    className="w-full bg-discord-servers text-white px-4 py-3 rounded-xl border border-white/5 focus:border-brand-accent outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={handleAddFriend}
                  className="w-full bg-brand-accent text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-4"
                >
                  Send Mesh Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar (Far Left) - Mesh List */}
      <aside className="w-[72px] bg-discord-servers flex flex-col items-center py-3 z-10">
        <ServerIcon 
          active={activeTab === 'home' && !selectedFriend}
          onClick={() => {
            setActiveTab('home');
            setSelectedFriend(null);
          }}
        >
          <MessageCircle size={24} />
        </ServerIcon>
        
        <div className="w-8 h-[2px] bg-discord-chat rounded-full mb-3 opacity-30" />
        
        <ServerIcon 
          active={activeTab === 'inbox' && !selectedFriend}
          onClick={() => {
            setActiveTab('inbox');
            setSelectedFriend(null);
          }}
        >
          <span className="font-bold text-xs">GC</span>
        </ServerIcon>

        <div className="w-8 h-[2px] bg-discord-chat rounded-full mb-3 opacity-30" />

        {/* Friends in Sidebar */}
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto w-full items-center">
          {friends.map(friend => (
            <ServerIcon 
              key={friend.pub}
              active={selectedFriend?.pub === friend.pub}
              onClick={() => {
                setSelectedFriend(friend);
                setActiveTab('private');
              }}
              badge={true}
            >
              <span className="font-bold text-xs uppercase">{friend.alias[0]}</span>
            </ServerIcon>
          ))}
        </div>

        <div className="mt-auto">
          <ServerIcon color="text-brand-accent" onClick={() => setShowAddFriend(true)}>
            <PlusCircle size={24} />
          </ServerIcon>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative min-w-0 h-full bg-discord-sidebar rounded-l-[32px] shadow-2xl overflow-hidden ml-2">
        
        {/* Header */}
        <header className="h-14 px-6 flex items-center justify-between border-b border-black/10 bg-discord-sidebar sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <h2 className="font-bold tracking-tight text-white uppercase">
              {selectedFriend ? `@${selectedFriend.alias}` : (activeTab === 'profile' ? 'You' : activeTab === 'inbox' ? 'Global Chat' : 'Messages')}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <div className="p-2 text-discord-muted hover:text-brand-accent cursor-pointer transition-colors">
              <Search size={20} />
            </div>
            <div className="p-2 text-discord-muted hover:text-brand-accent cursor-pointer transition-colors">
              <MoreHorizontal size={22} />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFriend ? selectedFriend.pub : activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {selectedFriend ? (
                <ChatView 
                  messages={privateMessages[getPrivateRoomId(currentPub, selectedFriend.pub)] || []} 
                  currentUser={currentUser}
                  onSendMessage={handleSendPrivateMessage}
                  title={`@${selectedFriend.alias}`}
                  placeholder={`Message @${selectedFriend.alias}`}
                  onAvatarClick={(user, pub) => setPopoutUser({ user, pub })}
                />
              ) : (
                <>
                  {activeTab === 'home' && <HomeView onAddFriend={() => setShowAddFriend(true)} />}
                  {activeTab === 'inbox' && (
                    <div className="flex flex-col h-full space-y-4">
                      <div className="bg-discord-chat p-4 rounded-2xl border border-white/5 space-y-3">
                        <h3 className="text-[10px] font-bold text-discord-muted uppercase tracking-widest">Your Mesh Friends</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {friends.length === 0 ? (
                            <p className="text-[10px] text-discord-muted italic">No friends in your mesh yet.</p>
                          ) : (
                            friends.map(friend => (
                              <div 
                                key={friend.pub}
                                onClick={() => {
                                  setSelectedFriend(friend);
                                  setActiveTab('private');
                                }}
                                className="flex flex-col items-center gap-1 cursor-pointer group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-discord-sidebar flex items-center justify-center text-brand-accent border border-white/5 group-hover:border-brand-accent transition-all">
                                  <span className="font-bold text-xs uppercase">{friend.alias[0]}</span>
                                </div>
                                <span className="text-[9px] font-bold text-discord-muted group-hover:text-white truncate w-10 text-center">{friend.alias}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="bg-discord-chat p-4 rounded-2xl border border-white/5 space-y-3">
                        <h3 className="text-[10px] font-bold text-discord-muted uppercase tracking-widest">Search Mesh Nodes</h3>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-discord-muted" size={16} />
                          <input 
                            type="text"
                            placeholder="Search by Public Key..."
                            className="w-full bg-discord-sidebar text-white pl-10 pr-4 py-2 rounded-xl border border-white/5 focus:border-brand-accent outline-none text-xs transition-all"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value;
                                if (val) setPopoutUser({ user: 'Unknown Node', pub: val });
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <ChatView 
                          messages={globalMessages} 
                          currentUser={currentUser}
                          onSendMessage={handleSendMessage}
                          title="Global Chat"
                          placeholder="Message #global-chat"
                          onAvatarClick={(user, pub) => setPopoutUser({ user, pub })}
                        />
                      </div>
                    </div>
                  )}
                  {activeTab === 'profile' && <ProfileView username={currentUser} pub={currentPub} onLogout={handleLogout} />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <nav className="h-[80px] bg-discord-sidebar border-t border-black/10 flex items-center justify-around px-8 z-40 pb-safe rounded-tl-[24px]">
          <button 
            onClick={() => {
              setActiveTab('home');
              setSelectedFriend(null);
            }}
            className={cn("flex flex-col items-center gap-1.5 transition-all relative", activeTab === 'home' && !selectedFriend ? "text-brand-accent scale-110" : "text-discord-muted hover:text-discord-text")}
          >
            <LayoutGrid size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Home</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('inbox');
              setSelectedFriend(null);
            }}
            className={cn("flex flex-col items-center gap-1.5 transition-all relative", activeTab === 'inbox' && !selectedFriend ? "text-brand-accent scale-110" : "text-discord-muted hover:text-discord-text")}
          >
            <div className="relative">
              <Inbox size={24} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Mesh</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('profile');
              setSelectedFriend(null);
            }}
            className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === 'profile' ? "text-brand-accent scale-110" : "text-discord-muted hover:text-discord-text")}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden relative",
              activeTab === 'profile' ? "border-brand-accent shadow-lg shadow-brand-accent/20" : "border-transparent bg-discord-chat"
            )}>
              <User size={18} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tighter">You</span>
          </button>
        </nav>

      </main>

    </div>
  );
}
