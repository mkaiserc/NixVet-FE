'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

interface User {
  id: string;
  name: string;
  email: string;
  crmv?: string;
  specialty?: string;
  role: string;
}

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/veterinarians');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Erro ao carregar equipe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingId(record.id);
    form.setFieldsValue({
        ...record,
        password: '', // Don't show password
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('Veterinário removido com sucesso');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Erro ao remover veterinário');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = { ...values, role: 'veterinarian' };
      if (editingId) {
        if (!payload.password) delete payload.password; // Don't update password if empty
        await api.put(`/users/${editingId}`, payload);
        message.success('Veterinário atualizado com sucesso');
      } else {
        await api.post('/users', payload);
        message.success('Veterinário cadastrado com sucesso');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      message.error('Erro ao salvar veterinário');
    }
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'CRMV',
      dataIndex: 'crmv',
      key: 'crmv',
    },
    {
      title: 'Especialidade',
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: 'Função',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'veterinarian' ? 'VETERINÁRIO' : role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Tem certeza?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <UserOutlined /> Equipe Veterinária
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-blue-600">
          Novo Veterinário
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingId ? 'Editar Veterinário' : 'Novo Veterinário'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Nome Completo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label={editingId ? 'Nova Senha (opcional)' : 'Senha Inicial'} rules={[{ required: !editingId }]}>
            <Input.Password placeholder={editingId ? 'Deixe em branco para não alterar' : ''} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="crmv" label="CRMV">
              <Input />
            </Form.Item>
            <Form.Item name="specialty" label="Especialidade">
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
