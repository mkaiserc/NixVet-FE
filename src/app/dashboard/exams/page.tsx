'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Select, Space, Tooltip, DatePicker } from 'antd';
import { PlusOutlined, FilePdfOutlined, FileSearchOutlined, MailOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';

interface ExamRequest {
  id: string;
  createdAt: string;
  consultation?: { patient?: { name: string; id: string; tutor?: { name: string } } };
  patient?: { name: string; id: string; tutor?: { name: string } };
  veterinarian: { name: string };
  requested_exams: string[];
}

interface ExamOption {
  id: number;
  name: string;
  area?: { name: string };
}

interface ExamAreaOption {
  id: number;
  name: string;
}

function ExamRequestsContent() {
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  const [examRequests, setExamRequests] = useState<ExamRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [consultationsByPatient, setConsultationsByPatient] = useState<any[]>([]);
  const [examsFromCatalog, setExamsFromCatalog] = useState<ExamOption[]>([]);
  const [examAreas, setExamAreas] = useState<ExamAreaOption[]>([]);
  const [form] = Form.useForm();

  const fetchExamRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/exam-requests');
      setExamRequests(response.data);
    } catch (error) {
      message.error('Erro ao carregar solicitações de exames');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExamsAndAreas = async () => {
    try {
      const [examsRes, areasRes] = await Promise.all([
        api.get<ExamOption[]>('/catalog/exams'),
        api.get<ExamAreaOption[]>('/catalog/exam-areas'),
      ]);
      setExamsFromCatalog(examsRes.data ?? []);
      setExamAreas(areasRes.data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConsultationsForPatient = async (patientId: string) => {
    try {
      const response = await api.get('/consultations');
      const all = (response.data ?? []).filter((c: any) => c.patient_id === patientId || c.patient?.id === patientId);
      setConsultationsByPatient(all);
    } catch (error) {
      setConsultationsByPatient([]);
    }
  };

  useEffect(() => {
    fetchExamRequests();
    fetchPatients();
    fetchExamsAndAreas();
  }, []);

  useEffect(() => {
    if (preselectedPatientId && modalVisible) {
      form.setFieldsValue({ patient_id: preselectedPatientId });
      setSelectedPatientId(preselectedPatientId);
      fetchConsultationsForPatient(preselectedPatientId);
    }
  }, [preselectedPatientId, modalVisible]);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleAdd = () => {
    form.resetFields();
    setSelectedPatientId(null);
    setConsultationsByPatient([]);
    if (preselectedPatientId) {
      form.setFieldsValue({ patient_id: preselectedPatientId });
      setSelectedPatientId(preselectedPatientId);
      fetchConsultationsForPatient(preselectedPatientId);
    }
    setModalVisible(true);
  };

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId || null);
    form.setFieldsValue({ consultation_id: undefined, request_date: undefined });
    if (patientId) fetchConsultationsForPatient(patientId);
    else setConsultationsByPatient([]);
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = await api.get(`/exam-requests/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exames-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
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

      if (!values.consultation_id && !values.request_date) {
        message.error('Selecione uma consulta ou informe a data da solicitação');
        return;
      }

      const requestedNames = values.requested_exams ?? [];
      const catalogNames = new Set(examsFromCatalog.map((e) => e.name));
      const defaultAreaId = examAreas[0]?.id;

      for (const name of requestedNames) {
        const trimmed = typeof name === 'string' ? name.trim() : '';
        if (trimmed && !catalogNames.has(trimmed) && defaultAreaId) {
          try {
            await api.post('/catalog/exams', { name: trimmed, area_id: defaultAreaId });
            catalogNames.add(trimmed);
          } catch (e) {
            console.warn('Não foi possível adicionar exame ao catálogo:', trimmed);
          }
        }
      }

      const payload: any = {
        veterinarian_id: user.id,
        requested_exams: requestedNames.map((n: string) => (typeof n === 'string' ? n.trim() : n)),
        clinical_notes: values.clinical_notes,
      };

      if (values.consultation_id) {
        payload.consultation_id = values.consultation_id;
      } else {
        payload.patient_id = values.patient_id;
        payload.request_date = values.request_date ? dayjs(values.request_date).format('YYYY-MM-DD') : null;
      }

      await api.post('/exam-requests', payload);
      message.success('Solicitação gerada com sucesso');
      setModalVisible(false);
      fetchExamRequests();
      fetchExamsAndAreas();
    } catch (error) {
      message.error('Erro ao gerar solicitação');
    }
  };

  const getPatient = (record: ExamRequest) => record.consultation?.patient ?? record.patient;

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
      message.error('Erro ao enviar email');
    }
  };

  const [addExamModalVisible, setAddExamModalVisible] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamAreaId, setNewExamAreaId] = useState<number | null>(null);

  const handleAddExamToCatalog = async () => {
    if (!newExamName.trim() || !newExamAreaId) {
      message.warning('Preencha o nome e a área do exame');
      return;
    }
    try {
      await api.post('/catalog/exams', { name: newExamName.trim(), area_id: newExamAreaId });
      message.success('Exame adicionado ao catálogo da clínica');
      setAddExamModalVisible(false);
      setNewExamName('');
      setNewExamAreaId(null);
      fetchExamsAndAreas();
    } catch (error) {
      message.error('Erro ao adicionar exame');
    }
  };

  const columns = [
    { title: 'Data', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleDateString('pt-BR') },
    { title: 'Paciente', key: 'patient', render: (_: any, record: ExamRequest) => getPatient(record)?.name ?? '—' },
    { title: 'Tutor', key: 'tutor', render: (_: any, record: ExamRequest) => getPatient(record)?.tutor?.name ?? '—' },
    { title: 'Veterinário', dataIndex: ['veterinarian', 'name'], key: 'veterinarian' },
    {
      title: 'Exames',
      dataIndex: 'requested_exams',
      key: 'exams',
      render: (exams: string[] | undefined) => {
        if (!exams?.length) return '—';
        return exams.map((name) => {
          const catalog = examsFromCatalog.find((e) => e.name === name);
          const label = catalog?.area?.name ? `${catalog.area.name} - ${name}` : name;
          return label;
        }).join(', ');
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: ExamRequest) => (
        <Space>
          <Tooltip title="Baixar PDF">
            <Button icon={<FilePdfOutlined />} onClick={() => handleDownloadPdf(record.id)} className="text-red-500 border-red-500 hover:bg-red-50">PDF</Button>
          </Tooltip>
          <Tooltip title="Enviar por Email">
            <Button icon={<MailOutlined />} onClick={() => handleOpenEmailModal(record)} className="text-blue-500 border-blue-500 hover:bg-blue-50">Email</Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const examOptions = examsFromCatalog.map((e) => ({
    value: e.name,
    label: e.area?.name ? `${e.area.name}: ${e.name}` : e.name,
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <FileSearchOutlined /> Solicitações de Exames
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-blue-600">
          Nova Solicitação
        </Button>
      </div>

      <Table columns={columns} dataSource={examRequests} rowKey="id" loading={loading} />

      <Modal title="Nova Solicitação de Exames" open={modalVisible} onCancel={() => setModalVisible(false)} width={700} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="patient_id" label="Paciente" rules={[{ required: true, message: 'Selecione o paciente' }]}>
            <Select
              showSearch
              placeholder="Buscar paciente"
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.species}) - ${p.tutor?.name ?? ''}` }))}
              onChange={handlePatientChange}
            />
          </Form.Item>

          {selectedPatientId && (
            <>
              <Form.Item name="consultation_id" label="Consulta (opcional)" help="Se não houver consulta, preencha a data abaixo">
                <Select
                  placeholder="Selecione a consulta ou deixe em branco"
                  allowClear
                  options={consultationsByPatient.map((c) => ({
                    value: c.id,
                    label: `${new Date(c.consultation_date).toLocaleDateString('pt-BR')} - Dr. ${c.veterinarian?.name ?? ''}`,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="request_date"
                label="Data da solicitação (quando não houver consulta)"
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="requested_exams"
            label="Exames"
            rules={[{ required: true, message: 'Adicione ao menos um exame' }, { type: 'array', min: 1, message: 'Adicione ao menos um exame' }]}
          >
            <Select
              mode="tags"
              placeholder="Selecione da lista ou digite um novo exame (novos são adicionados ao catálogo da clínica)"
              options={examOptions}
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div className="p-2 border-t">
                    <Button type="link" size="small" block onClick={() => setAddExamModalVisible(true)}>
                      + Cadastrar novo exame (escolher área)
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>

          <Form.Item name="clinical_notes" label="Suspeita Clínica / Observações">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-blue-600">Gerar solicitação</Button>
              <Button onClick={() => setModalVisible(false)}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Adicionar exame ao catálogo"
        open={addExamModalVisible}
        onCancel={() => setAddExamModalVisible(false)}
        onOk={handleAddExamToCatalog}
        okText="Adicionar"
      >
        <div className="space-y-3">
          <Form.Item label="Nome do exame" required>
            <Input placeholder="Ex: Hemograma completo" value={newExamName} onChange={(e) => setNewExamName(e.target.value)} />
          </Form.Item>
          <Form.Item label="Área" required>
            <Select
              placeholder="Selecione a área"
              style={{ width: '100%' }}
              options={examAreas.map((a) => ({ value: a.id, label: a.name }))}
              value={newExamAreaId}
              onChange={setNewExamAreaId}
            />
          </Form.Item>
        </div>
      </Modal>

      <Modal title="Confirmar Envio de Email" open={emailModalVisible} onCancel={() => setEmailModalVisible(false)} onOk={handleSendEmail} okText="Enviar" cancelText="Cancelar">
        <p>Enviar solicitação de exames por email para o tutor de <strong>{selectedExamRequest && getPatient(selectedExamRequest)?.name}</strong>?</p>
        <p className="text-gray-500 text-sm mt-2">O email será enviado para o endereço cadastrado no perfil do tutor.</p>
      </Modal>
    </div>
  );
}

export default function ExamRequestsPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <ExamRequestsContent />
    </Suspense>
  );
}
