import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CommentInputProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
  autoFocus?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  placeholder = 'Add a comment...',
  onSubmit,
  autoFocus = false,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#818384"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
        autoFocus={autoFocus}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        disabled={!text.trim()}
      >
        <Ionicons
          name="send"
          size={18}
          color={text.trim() ? '#0a66c2' : '#4a4a4a'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: '#272729',
    borderTopWidth: 1,
    borderTopColor: '#343536',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#1f1f20',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#343536',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#e4e6eb',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16181f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
