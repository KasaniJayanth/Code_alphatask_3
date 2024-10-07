import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const socket = io('http://localhost:5000');

const Editor = () => {
  const [text, setText] = useState('');
  const [cursors, setCursors] = useState({});
  const editorRef = useRef(null);

  useEffect(() => {
    socket.on('updateText', (newText) => {
      setText(newText);
    });

    socket.on('updateCursor', (userId, position) => {
      setCursors(prevCursors => ({ ...prevCursors, [userId]: position }));
    });

    socket.on('userDisconnected', (userId) => {
      setCursors(prevCursors => {
        const { [userId]: _, ...rest } = prevCursors;
        return rest;
      });
    });

    return () => {
      socket.off('updateText');
      socket.off('updateCursor');
      socket.off('userDisconnected');
    };
  }, []);

  const handleChange = (newText) => {
    setText(newText);
    socket.emit('textChange', newText);
  };

  const handleSelectionChange = () => {
    if (editorRef.current) {
      const selection = editorRef.current.getEditor().getSelection();
      if (selection) {
        socket.emit('cursorUpdate', selection.index);
      }
    }
  };

  return (
    <div>
      <ReactQuill
        ref={editorRef}
        value={text}
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        style={{ height: '80vh' }}
      />
      {/* Render cursor indicators here */}
    </div>
  );
};

export default Editor;
