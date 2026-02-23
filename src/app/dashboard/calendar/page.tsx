'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Badge, Modal, Form, Select, DatePicker, Input, message, Button, Tag } from 'antd';
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
  status?: string;
  paid?: boolean;
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
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [updating, setUpdating] = useState(false);
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
      dayjs(c.consultation_date).isSame(value, 'day'),
    );
    return listData || [];
  };

  const formatStatus = (status?: string) => {
    if (status === 'completed') return 'Realizada';
    if (status === 'cancelled') return 'Cancelada';
    return 'Agendada';
  };

  const getStatusColor = (status?: string) => {
    if (status === 'completed') return 'green';
    if (status === 'cancelled') return 'red';
    return 'blue';
  };

  const handleOpenDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setDetailsVisible(true);
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

  const handleMarkCompleted = async () => {
    if (!selectedConsultation) return;
    try {
      setUpdating(true);
      await api.put(`/consultations/${selectedConsultation.id}`, {
        status: 'completed',
      });
      message.success('Consulta marcada como realizada');
      setDetailsVisible(false);
      setSelectedConsultation(null);
      fetchConsultations();
    } catch (error) {
      console.error('Error updating consultation status:', error);
      message.error('Erro ao atualizar status da consulta');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedConsultation) return;
    try {
      setUpdating(true);
      await api.put(`/consultations/${selectedConsultation.id}`, {
        paid: true,
      });
      message.success('Pagamento confirmado');
      setDetailsVisible(false);
      setSelectedConsultation(null);
      fetchConsultations();
    } catch (error) {
      console.error('Error confirming payment:', error);
      message.error('Erro ao confirmar pagamento');
    } finally {
      setUpdating(false);
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="list-none p-0 m-0">
        {listData.map(item => (
          <li
            key={item.id}
            className="mb-1 cursor-pointer"
            onClick={() => handleOpenDetails(item)}
          >
            <Badge
              status="success"
              text={
                <span className="text-xs">
                  {dayjs(item.consultation_date).format('HH:mm')} - {item.patient?.name}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <CalendarOutlined /> Agenda
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="bg-blue-600"
        >
          Agendar Consulta
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Calendar cellRender={dateCellRender} onSelect={handleSelect} />
      </div>

      <Modal
        title="Agendar Consulta"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="patient_id"
            label="Paciente"
            rules={[{ required: true, message: 'Selecione o paciente' }]}
          >
            <Select placeholder="Selecione o paciente">
              {patients.map(p => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="veterinarian_id"
            label="Veterinário"
            rules={[{ required: true, message: 'Selecione o veterinário' }]}
          >
            <Select placeholder="Selecione o veterinário">
              {veterinarians.map(v => (
                <Select.Option key={v.id} value={v.id}>
                  {v.name} ({v.role})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="consultation_date"
            label="Data e Hora"
            rules={[{ required: true, message: 'Selecione data e hora' }]}
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Valor da Consulta (R$)"
            rules={[{ required: true, message: 'Informe o valor' }]}
          >
            <Input type="number" step="0.01" prefix="R$" />
          </Form.Item>

          <Form.Item name="observations" label="Observações">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Detalhes da Consulta"
        open={detailsVisible}
        onCancel={() => {
          setDetailsVisible(false);
          setSelectedConsultation(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDetailsVisible(false);
              setSelectedConsultation(null);
            }}
          >
            Fechar
          </Button>,
          <Button
            key="complete"
            type="primary"
            disabled={selectedConsultation?.status === 'completed'}
            loading={updating}
            onClick={handleMarkCompleted}
          >
            Marcar como realizada
          </Button>,
          <Button
            key="paid"
            type="primary"
            disabled={selectedConsultation?.paid}
            loading={updating}
            onClick={handleConfirmPayment}
          >
            Confirmar pagamento
          </Button>,
        ]}
      >
        {selectedConsultation && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Data e hora:</span>
              <span>
                {new Date(selectedConsultation.consultation_date).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Paciente:</span>
              <span>{selectedConsultation.patient?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Veterinário:</span>
              <span>{selectedConsultation.veterinarian?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <Tag color={getStatusColor(selectedConsultation.status)}>
                {formatStatus(selectedConsultation.status)}
              </Tag>
            </div>
            <div className="flex justify-between items-center">
              <span>Pagamento:</span>
              <Tag color={selectedConsultation.paid ? 'green' : 'orange'}>
                {selectedConsultation.paid ? 'Pago' : 'Pendente'}
              </Tag>
            </div>
            {selectedConsultation.observations && (
              <div>
                <div className="font-semibold mb-1">Observações</div>
                <div className="text-sm text-gray-700">
                  {selectedConsultation.observations}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
