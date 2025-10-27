import {useEffect, useState} from "react";
import type { User } from "../../../types/user";
import { useAuth } from "../../../states/AuthContext";
import {Avatar, Button, message, Modal, Space, Table, type TableColumnsType, Typography} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import UserModal, {type UserSaveValues} from "./UserModal";
const { Title, Text } = Typography;

function UserManagement() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : [data]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await fetch(`http://localhost:8080/users/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('User deleted');
          fetchUsers();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          message.error('Error deleting user');
        }
      }
    });
  };

  const handleSave = async (values: UserSaveValues) => {
    try {
      const url = editingUser
        ? `http://localhost:8080/users/${editingUser.id}`
        : 'http://localhost:8080/users';

      const method = editingUser ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      message.success(`User ${editingUser ? 'updated' : 'created'}`);
      setModalVisible(false);
      fetchUsers();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error('Error saving user');
    }
  };

  const columns: TableColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <Avatar style={{ background: '#1890ff' }}>{name[0]}</Avatar>
          <Text strong>{name}</Text>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: 12,
          background: role === 'admin' ? '#ff4d4f20' : '#1890ff20',
          color: role === 'admin' ? '#ff4d4f' : '#1890ff',
          fontSize: 12,
          fontWeight: 500
        }}>
          {role.toUpperCase()}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!isAdmin && record.id !== currentUser?.id}
          />
          {isAdmin && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>User Management</Title>
          <Text type="secondary">Manage system users and permissions</Text>
        </div>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add User
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <UserModal
        visible={modalVisible}
        user={editingUser}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        isAdmin={isAdmin}
      />
    </div>
  );
}

export default UserManagement;