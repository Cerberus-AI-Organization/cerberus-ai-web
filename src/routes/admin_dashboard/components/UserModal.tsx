import {useEffect, useState} from "react";
import {Input, message, Modal, Select, Space} from "antd";
import type {User} from "../../../types/user.ts";

export type UserSaveValues = {
  name: string;
  email: string;
  password?: string;
  role?: string;
};

type UserModalProps = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (values: UserSaveValues) => void;
  isAdmin: boolean;
}

function UserModal({ visible, user, onClose, onSave, isAdmin }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword('');
      setRole(user.role);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
    }
  }, [user, visible]);

  const handleSave = () => {
    if (!name || !email) {
      message.error('Name and email are required');
      return;
    }
    if (!user && !password) {
      message.error('Password is required for new users');
      return;
    }

    onSave({ name, email, role, password });
  };

  return (
    <Modal
      title={user ? 'Edit User' : 'Add User'}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      width={500}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 8 }}>Name *</div>
          <Input
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <div style={{ marginBottom: 8 }}>Email *</div>
          <Input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div style={{ marginBottom: 8 }}>Password {user ? '' : '*'}</div>
          <Input.Password
            placeholder={user ? 'Leave empty to keep current' : 'Enter password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {isAdmin && (
          <div>
            <div style={{ marginBottom: 8 }}>Role</div>
            <Select
              style={{ width: '100%' }}
              value={role}
              onChange={setRole}
            >
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </div>
        )}
      </Space>
    </Modal>
  );
}

export default UserModal;