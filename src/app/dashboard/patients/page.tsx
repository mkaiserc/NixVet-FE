'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

interface Tutor {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  sex: string;
  chip_number?: string;
  tutor_id: string;
  tutor?: Tutor;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      message.error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await api.get('/tutors');
      setTutors(response.data);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchTutors();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Patient) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/patients/${id}`);
      message.success('Paciente removido com sucesso');
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      message.error('Erro ao remover paciente');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, values);
        message.success('Paciente atualizado com sucesso');
      } else {
        await api.post('/patients', values);
        message.success('Paciente criado com sucesso');
      }
      setModalVisible(false);
      fetchPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
      message.error('Erro ao salvar paciente');
    }
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Espécie',
      dataIndex: 'species',
      key: 'species',
    },
    {
      title: 'Raça',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: 'Tutor',
      dataIndex: ['tutor', 'name'],
      key: 'tutorName',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Patient) => (
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
        <h1 className="text-2xl font-bold text-[#13364F] flex items-center gap-2">
          <MedicineBoxOutlined /> Pacientes
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-[#13364F]">
          Novo Paciente
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={patients}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Editar Paciente' : 'Novo Paciente'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="tutor_id" label="Tutor" rules={[{ required: true, message: 'Obrigatório' }]}>
            <Select placeholder="Selecione um tutor">
              {tutors.map(tutor => (
                <Select.Option key={tutor.id} value={tutor.id}>{tutor.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="species" label="Espécie" rules={[{ required: true, message: 'Obrigatório' }]}>
              <Select>
                <Select.Option value="Cão">Cão</Select.Option>
                <Select.Option value="Gato">Gato</Select.Option>
                <Select.Option value="Outro">Outro</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="breed" label="Raça" rules={[{ required: true, message: 'Obrigatório' }]}>
              <Input />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item name="age" label="Idade (anos)" rules={[{ required: true, message: 'Obrigatório' }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="weight" label="Peso (kg)" rules={[{ required: true, message: 'Obrigatório' }]}>
              <InputNumber min={0} step={0.1} className="w-full" />
            </Form.Item>
            <Form.Item name="sex" label="Sexo" rules={[{ required: true, message: 'Obrigatório' }]}>
              <Select>
                <Select.Option value="M">Macho</Select.Option>
                <Select.Option value="F">Fêmea</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="chip_number" label="Nº Microchip">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
