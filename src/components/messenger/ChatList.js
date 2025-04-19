import { useState, useEffect } from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, CircularProgress, Box } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import PropTypes from 'prop-types';
import './ChatList.css';
const ChatList = ({ chats, currentUser, onSelectChat, loading, activeChat }) => {
  const [otherUsers, setOtherUsers] = useState({});

  // Fetch other users' data
  useEffect(() => {
    const fetchOtherUsers = async () => {
      const usersData = {};
      
      for (const chat of chats) {
        const otherUserId = chat.participants.find(id => id !== currentUser.uid);
        if (otherUserId && !usersData[otherUserId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            if (userDoc.exists()) {
              usersData[otherUserId] = userDoc.data();
            }
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }
      }
      
      setOtherUsers(usersData);
    };

    if (chats?.length > 0) {
      fetchOtherUsers();
    }
  }, [chats, currentUser]);

  const getOtherUser = (chat) => {
    const otherUserId = chat.participants.find(id => id !== currentUser.uid);
    return otherUsers[otherUserId] || { 
      displayName: 'Unknown User',
      photoURL: '',
      uid: otherUserId 
    };
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <List className="chat-list">
      {chats?.map((chat) => {
        const otherUser = getOtherUser(chat);
        const isActive = activeChat === chat.id;
  
        return (
          <ListItem
            key={chat.id}
            onClick={() => onSelectChat?.(chat.id)}
            className={`chat-list-item ${isActive ? 'active' : ''}`}
          >
            <ListItemAvatar className="chat-avatar">
              <Avatar src={otherUser.photoURL} alt={otherUser.displayName} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <span className="chat-text-primary">{otherUser.firstName}</span>
              }
              secondary={
                <Typography
                  component="span"
                  variant="body2"
                  className="chat-text-secondary"
                >
                  {chat.lastMessageSender === currentUser.firstName ? 'You: ' : ''}
                  {chat.lastMessage}
                </Typography>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
};

ChatList.propTypes = {
  chats: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
  onSelectChat: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  activeChat: PropTypes.string
};

export default ChatList;