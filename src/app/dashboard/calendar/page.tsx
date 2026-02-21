'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Badge, Modal, Form, Select, DatePicker, Input, message, Button } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

interface Consultation {
  id: string;
  consultation_date: string;
  patient?: { name: string };
  veterinarian?: { name: string };
  observations?: string;
}

interface Patient {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function CalendarPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [veterinarians, setVeterinarians] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [form] = Form.useForm();

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations');
      setConsultations(response.data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchVeterinarians = async () => {
    try {
      const response = await api.get('/users/veterinarians');
      setVeterinarians(response.data);
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
    }
  };

  useEffect(() => {
    fetchConsultations();
    fetchPatients();
    fetchVeterinarians();
  }, []);

  const getListData = (value: Dayjs) => {
    const listData = consultations.filter(c => 
      dayjs(c.consultation_date).isSame(value, 'day')
    );
    return listData || [];
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="list-none p-0 m-0">
        {listData.map((item) => (
          <li key={item.id} className="mb-1">
            <Badge 
              status="success" 
              text={<span className="text-xs">{dayjs(item.consultation_date).format('HH:mm')} - {item.patient?.name}</span>} 
            />
          </li>
        ))}
      </ul>
    );
  };

  const handleSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ consultation_date: selectedDate });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        consultation_date: values.consultation_date.toISOString(),
        price: parseFloat(values.price),
      };

      await api.post('/consultations', payload);
      message.success('Consulta agendada com sucesso');
      setModalVisible(false);
      fetchConsultations();
    } catch (error) {
      console.error('Error scheduling consultation:', error);
      message.error('Erro ao agendar consulta. Verifique os dados.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#13364F] flex items-center gap-2">
          <CalendarOutlined /> Agenda
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-[#13364F]">
          Agendar Consulta
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Calendar 
          cellRender={dateCellRender} 
          onSelect={handleSelect}
        />
      </div>

      <Modal
        title="Agendar Consulta"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="patient_id" label="Paciente" rules={[{ required: true, message: 'Selecione o paciente' }]}>
            <Select placeholder="Selecione o paciente">
              {patients.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="veterinarian_id" label="Veterinário" rules={[{ required: true, message: 'Selecione o veterinário' }]}>
            <Select placeholder="Selecione o veterinário">
              {veterinarians.map(v => (
                <Select.Option key={v.id} value={v.id}>{v.name} ({v.role})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="consultation_date" label="Data e Hora" rules={[{ required: true, message: 'Selecione data e hora' }]}>
            <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item name="price" label="Valor da Consulta (R$)" rules={[{ required: true, message: 'Informe o valor' }]}>
            <Input type="number" step="0.01" prefix="R$" />
          </Form.Item>

          <Form.Item name="observations" label="Observações">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
