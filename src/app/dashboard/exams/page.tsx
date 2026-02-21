'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Select, Tooltip, Space } from 'antd';
import { PlusOutlined, FilePdfOutlined, FileSearchOutlined, MinusCircleOutlined, MailOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

interface ExamRequest {
  id: string;
  createdAt: string;
  consultation: {
    patient: {
      name: string;
      tutor: {
        name: string;
      };
    };
  };
  veterinarian: {
    name: string;
  };
  requested_exams: string[];
}

export default function ExamRequestsPage() {
  const [examRequests, setExamRequests] = useState<ExamRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [form] = Form.useForm();

  const fetchExamRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/exam-requests');
      setExamRequests(response.data);
    } catch (error) {
      console.error('Error fetching exam requests:', error);
      message.error('Erro ao carregar solicitações de exames');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations');
      setConsultations(response.data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  useEffect(() => {
    fetchExamRequests();
    fetchConsultations();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = await api.get(`/exam-requests/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exames-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      message.error('Erro ao baixar PDF');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        message.error('Usuário não autenticado');
        return;
      }
      const user = JSON.parse(userStr);
      
      const payload = {
        ...values,
        veterinarian_id: user.id
      };

      await api.post('/exam-requests', payload);
      message.success('Solicitação gerada com sucesso');
      setModalVisible(false);
      fetchExamRequests();
    } catch (error) {
      console.error('Error generating exam request:', error);
      message.error('Erro ao gerar solicitação');
    }
  };

  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedExamRequest, setSelectedExamRequest] = useState<ExamRequest | null>(null);

  const handleOpenEmailModal = (examRequest: ExamRequest) => {
    setSelectedExamRequest(examRequest);
    setEmailModalVisible(true);
  };

  const handleSendEmail = async () => {
    if (!selectedExamRequest) return;
    try {
      await api.post(`/exam-requests/${selectedExamRequest.id}/email`);
      message.success('Email enviado com sucesso');
      setEmailModalVisible(false);
    } catch (error) {
      console.error('Error sending email:', error);
      message.error('Erro ao enviar email');
    }
  };

  const columns = [
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Paciente',
      dataIndex: ['consultation', 'patient', 'name'],
      key: 'patient',
    },
    {
      title: 'Tutor',
      dataIndex: ['consultation', 'patient', 'tutor', 'name'],
      key: 'tutor',
    },
    {
      title: 'Veterinário',
      dataIndex: ['veterinarian', 'name'],
      key: 'veterinarian',
    },
    {
      title: 'Exames',
      dataIndex: 'requested_exams',
      key: 'exams',
      render: (exams: string[]) => exams?.join(', '),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: ExamRequest) => (
        <Space>
          <Tooltip title="Baixar PDF">
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={() => handleDownloadPdf(record.id)} 
              className="text-red-500 border-red-500 hover:bg-red-50"
            >
              PDF
            </Button>
          </Tooltip>
          <Tooltip title="Enviar por Email">
            <Button 
              icon={<MailOutlined />} 
              onClick={() => handleOpenEmailModal(record)}
              className="text-blue-500 border-blue-500 hover:bg-blue-50"
            >
              Email
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#13364F] flex items-center gap-2">
          <FileSearchOutlined /> Solicitações de Exames
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-[#13364F]">
          Nova Solicitação
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={examRequests}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Nova Solicitação de Exames"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="consultation_id" 
            label="Consulta Base" 
            rules={[{ required: true, message: 'Selecione uma consulta' }]}
          >
            <Select placeholder="Selecione a consulta">
              {consultations.map(c => (
                <Select.Option key={c.id} value={c.id}>
                  {new Date(c.consultation_date).toLocaleDateString()} - {c.patient?.name} (Dr. {c.veterinarian?.name})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="requested_exams">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    {...field}
                    label={index === 0 ? 'Exames' : ''}
                    required={false}
                    key={field.key}
                  >
                    <div className="flex gap-2">
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[{ required: true, message: 'Insira o nome do exame ou apague este campo.' }]}
                        noStyle
                      >
                        <Input placeholder="Nome do exame (ex: Hemograma Completo)" />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      ) : null}
                    </div>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Adicionar Exame
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="clinical_notes" label="Suspeita Clínica / Observações">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Confirmar Envio de Email"
        open={emailModalVisible}
        onCancel={() => setEmailModalVisible(false)}
        onOk={handleSendEmail}
        okText="Enviar"
        cancelText="Cancelar"
      >
        <p>Deseja enviar a solicitação de exames por email para o tutor de <strong>{selectedExamRequest?.consultation.patient.name}</strong>?</p>
        <p className="text-gray-500 text-sm mt-2">O email será enviado para o endereço cadastrado no perfil do tutor.</p>
        
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
            <p className="font-bold mb-1">Corpo do Email:</p>
            <p>Olá {selectedExamRequest?.consultation.patient.tutor.name},</p>
            <p className="mt-2">Segue em anexo a solicitação de exames do(a) {selectedExamRequest?.consultation.patient.name}.</p>
            <p className="mt-2">Atenciosamente,<br/>NixVet</p>
        </div>
      </Modal>
    </div>
  );
}
