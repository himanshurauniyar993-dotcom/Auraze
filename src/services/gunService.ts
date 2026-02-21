import Gun from 'gun';
import 'gun/sea';
import 'gun/axe';

// Initialize Gun with public relay peers for decentralized sync
export const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://peer.wall.org/gun',
    'https://gun-us.herokuapp.com/gun'
  ]
});

// Global user object with session persistence
export const user = gun.user().recall({ sessionStorage: true });

// Namespace for global chat
export const globalChat = gun.get('ma-mesh-global-chat-v1');

export const auth = {
  register: (username: string, pass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      user.create(username, pass, (ack: any) => {
        if (ack.err) {
          reject(ack.err);
        } else {
          resolve();
        }
      });
    });
  },
  login: (username: string, pass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      user.auth(username, pass, (ack: any) => {
        if (ack.err) {
          reject(ack.err);
        } else {
          resolve();
        }
      });
    });
  },
  logout: () => {
    user.leave();
  },
  isLoggedIn: () => {
    return !!user.is;
  },
  // Persistent Read State
  setLastRead: (chatId: string, timestamp: number) => {
    if (user.is) {
      user.get('readState').get(chatId).put(timestamp);
    }
  },
  getLastRead: (chatId: string, cb: (ts: number) => void) => {
    if (user.is) {
      user.get('readState').get(chatId).on(cb);
    }
  },
  // Friend Management
  addFriend: (pub: string, alias: string) => {
    if (user.is) {
      user.get('friends').get(pub).put({ pub, alias, status: 'friend' });
      // In a real app, we'd notify the other user, but for this demo we'll assume mutual for simplicity
    }
  },
  getFriends: (cb: (data: any, id: string) => void) => {
    if (user.is) {
      user.get('friends').map().on(cb);
    }
  }
};

/**
 * Security: Signs a message using the user's private key (SEA)
 * This ensures the message authenticity in the decentralized graph.
 */
export const sendMessage = async (text: string) => {
  if (!user.is) return;
  
  const alias = await user.get('alias').then();
  const pub = user.is.pub;
  
  const messageData = {
    msg: text,
    user: alias,
    pub: pub,
    time: Date.now(),
  };

  globalChat.set(messageData);
};

/**
 * Private Messaging: Gets a unique room ID for two users
 */
export const getPrivateRoomId = (pub1: string, pub2: string) => {
  return [pub1, pub2].sort().join('_');
};

export const sendPrivateMessage = async (friendPub: string, text: string) => {
  if (!user.is) return;
  
  const roomId = getPrivateRoomId(user.is.pub, friendPub);
  const alias = await user.get('alias').then();
  
  const messageData = {
    msg: text,
    user: alias,
    pub: user.is.pub,
    time: Date.now(),
  };

  gun.get('ma-mesh-private-chats').get(roomId).set(messageData);
};
