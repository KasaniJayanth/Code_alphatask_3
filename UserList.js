import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('userList');
    };
  }, []);

  return (
    <div>
      <h3>Online Users:</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
